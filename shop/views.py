from decimal import Decimal
from decimal import InvalidOperation
from functools import wraps
from uuid import uuid4

from django.contrib import messages
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import PermissionDenied, ValidationError
from django.core.validators import validate_email
from django.db import transaction
from django.db.models import Q
from django.urls import reverse
from django.contrib.auth.views import redirect_to_login
from django.shortcuts import get_object_or_404, redirect, render
from django.views.decorators.http import require_http_methods

from .models import Cliente, ContactMessage, Order, OrderItem, Product

DEFAULT_PRODUCTS = [
    {
        'name': 'Luxurious Matte Lipstick',
        'brand': 'Blush & Glow',
        'category': 'lipstick',
        'price': '18.99',
        'description': 'Labiales mate de alta duración con hidratación profunda y acabado elegante.',
        'image_url': '/static/img/luxurious_lipsticks_1778612236329.png',
        'rating': '4.8',
    },
    {
        'name': 'Professional Eyeshadow Palette',
        'brand': 'Blush & Glow',
        'category': 'eyeshadow',
        'price': '34.50',
        'description': 'Paleta con sombras altamente pigmentadas y acabados mate y satinado para looks versátiles.',
        'image_url': '/static/img/premium_makeup_palette_1778612222439.png',
        'rating': '4.9',
    },
    {
        'name': 'Liquid Foundation Glow',
        'brand': 'Blush & Glow',
        'category': 'foundation',
        'price': '28.00',
        'description': 'Base de cobertura media con acabado luminoso y piel radiante durante todo el día.',
        'image_url': '/static/img/glowing_foundation_1778612251107.png',
        'rating': '4.7',
    },
    {
        'name': 'Velvet Silk Blush',
        'brand': 'Blush & Glow',
        'category': 'blush',
        'price': '15.99',
        'description': 'Rubor sedoso que aporta un tono fresco, natural y saludable a tus mejillas.',
        'image_url': '/static/img/glowing_foundation_1778612251107.png',
        'rating': '4.6',
    },
    {
        'name': 'Ultimate Volume Mascara',
        'brand': 'Blush & Glow',
        'category': 'mascara',
        'price': '12.50',
        'description': 'Máscara con cepillo de silicona para lashes más definidas y de mayor volumen.',
        'image_url': '/static/img/luxurious_lipsticks_1778612236329.png',
        'rating': '4.8',
    },
    {
        'name': 'Precision Waterproof Eyeliner',
        'brand': 'Blush & Glow',
        'category': 'eyeliner',
        'price': '10.99',
        'description': 'Delineador líquido ultra preciso y resistente al agua para un look intenso.',
        'image_url': '/static/img/premium_makeup_palette_1778612222439.png',
        'rating': '4.5',
    },
]


def requiere_permiso_producto(obtener_permiso):
    def decorar(vista):
        @wraps(vista)
        def protegida(request, *args, **kwargs):
            if not request.user.is_authenticated:
                return redirect_to_login(request.get_full_path(), login_url=reverse('admin:login'))
            permiso = obtener_permiso(request, *args, **kwargs) if callable(obtener_permiso) else obtener_permiso
            if not request.user.is_superuser and not request.user.has_perm(permiso):
                raise PermissionDenied
            return vista(request, *args, **kwargs)

        return protegida

    return decorar


def seed_products():
    if Product.objects.exists():
        return Product.objects.all()

    for product_data in DEFAULT_PRODUCTS:
        Product.objects.create(**product_data)

    return Product.objects.all()


def home(request):
    products = seed_products()
    query = request.GET.get('q', '').strip()
    category = request.GET.get('category', 'all')
    brand = request.GET.get('brand', 'all')
    sort_by = request.GET.get('sort', 'relevance')

    if query:
        products = products.filter(
            Q(name__icontains=query) | Q(description__icontains=query) | Q(brand__icontains=query)
        )

    if category != 'all':
        products = products.filter(category=category)

    if brand != 'all':
        products = products.filter(brand__iexact=brand)

    if sort_by == 'price_asc':
        products = products.order_by('price')
    elif sort_by == 'price_desc':
        products = products.order_by('-price')
    elif sort_by == 'name_asc':
        products = products.order_by('name')
    else:
        products = products.order_by('-rating', '-created_at')

    brands = sorted({product.brand for product in products})
    context = {
        'products': products,
        'brands': brands,
        'selected_category': category,
        'selected_brand': brand,
        'sort_by': sort_by,
        'search_query': query,
        'available_categories': Product.CATEGORY_CHOICES,
    }
    return render(request, 'shop/home.html', context)


@require_http_methods(['POST'])
def register_view(request):
    username = (request.POST.get('username') or '').strip()
    email = (request.POST.get('email') or '').strip()
    password = request.POST.get('password') or ''
    confirm_password = request.POST.get('confirm_password') or ''

    if not username or not email or not password:
        messages.error(request, 'Completa usuario, correo y contraseña.')
        return redirect('home')

    try:
        validate_email(email)
        validate_password(password, user=User(username=username, email=email))
    except ValidationError as error:
        messages.error(request, ' '.join(error.messages))
        return redirect('home')

    if User.objects.filter(username__iexact=username).exists():
        messages.error(request, 'Ese nombre de usuario ya está registrado.')
        return redirect('home')

    if User.objects.filter(email__iexact=email).exists():
        messages.error(request, 'El correo electrónico ya está registrado.')
        return redirect('home')

    if password != confirm_password:
        messages.error(request, 'Las contraseñas deben coincidir.')
        return redirect('home')

    if len(password) < 8:
        messages.error(request, 'La contraseña debe tener al menos 8 caracteres.')
        return redirect('home')

    with transaction.atomic():
        user = User.objects.create_user(username=username, email=email, password=password)
        Cliente.objects.create(usuario=user, nombre=username[:100], correo=email)
    login(request, user)
    messages.success(request, f'Usuario {username} registrado correctamente.')
    return redirect('home')


@require_http_methods(['POST'])
def login_view(request):
    username = (request.POST.get('username') or '').strip()
    password = request.POST.get('password') or ''

    if not username or not password:
        messages.error(request, 'Debes ingresar usuario y contraseña.')
        return redirect('home')

    user = authenticate(request, username=username, password=password)
    if user is not None:
        login(request, user)
        messages.success(request, f'Bienvenido/a, {user.username}.')
        return redirect('home')

    messages.error(request, 'Credenciales inválidas. Inténtalo nuevamente.')
    return redirect('home')


def logout_view(request):
    logout(request)
    messages.success(request, 'Sesión cerrada correctamente.')
    return redirect('home')


@require_http_methods(['POST'])
def contact_submit(request):
    name = (request.POST.get('name') or '').strip()
    email = (request.POST.get('email') or '').strip()
    phone = (request.POST.get('phone') or '').strip()
    message = (request.POST.get('message') or '').strip()

    if not name or not email or not message:
        messages.error(request, 'Nombre, correo y mensaje son obligatorios.')
        return redirect('home')

    try:
        validate_email(email)
    except ValidationError:
        messages.error(request, 'Ingresa un correo electrónico válido.')
        return redirect('home')

    ContactMessage.objects.create(name=name, email=email, phone=phone, message=message)
    messages.success(request, 'Mensaje enviado correctamente. Te contactaremos pronto.')
    return redirect('home')


def cart_view(request):
    carrito = request.session.get('carrito', {})
    productos = Product.objects.filter(pk__in=carrito.keys(), is_active=True)
    productos_por_id = {str(producto.pk): producto for producto in productos}
    lineas = []
    subtotal = Decimal('0.00')
    cantidad_total = 0

    for identificador, datos in list(carrito.items()):
        producto = productos_por_id.get(str(identificador))
        if producto is None:
            carrito.pop(identificador, None)
            continue
        try:
            cantidad = int(datos.get('cantidad', 0))
        except (AttributeError, TypeError, ValueError):
            carrito.pop(identificador, None)
            continue
        if cantidad < 1:
            carrito.pop(identificador, None)
            continue
        total_linea = producto.price * cantidad
        subtotal += total_linea
        cantidad_total += cantidad
        lineas.append({'producto': producto, 'cantidad': cantidad, 'total': total_linea})

    request.session['carrito'] = carrito
    return render(request, 'shop/cart.html', {
        'lineas_carrito': lineas,
        'subtotal_carrito': subtotal,
        'cantidad_carrito': cantidad_total,
        'metodos_pago': Order.PAYMENT_METHODS,
    })


@require_http_methods(['POST'])
def cart_add(request, product_id):
    producto = get_object_or_404(Product, pk=product_id, is_active=True)
    carrito = request.session.get('carrito', {})
    identificador = str(producto.pk)
    cantidad_actual = int(carrito.get(identificador, {}).get('cantidad', 0))

    if producto.stock <= cantidad_actual:
        messages.error(request, f'No hay unidades disponibles de {producto.name}.')
    else:
        carrito[identificador] = {'cantidad': cantidad_actual + 1}
        request.session['carrito'] = carrito
        messages.success(request, f'{producto.name} se agregó al carrito.')
    return redirect('home')


@require_http_methods(['POST'])
def cart_update(request, product_id):
    producto = get_object_or_404(Product, pk=product_id, is_active=True)
    carrito = request.session.get('carrito', {})
    identificador = str(producto.pk)
    try:
        cantidad = int(request.POST.get('cantidad', '0'))
    except ValueError:
        messages.error(request, 'La cantidad ingresada no es válida.')
        return redirect('cart')

    if cantidad <= 0:
        carrito.pop(identificador, None)
        messages.success(request, f'{producto.name} se eliminó del carrito.')
    elif cantidad > producto.stock:
        messages.error(request, f'El stock disponible de {producto.name} es {producto.stock}.')
    else:
        carrito[identificador] = {'cantidad': cantidad}
        messages.success(request, 'Se actualizó la cantidad del carrito.')
    request.session['carrito'] = carrito
    return redirect('cart')


@require_http_methods(['POST'])
def cart_remove(request, product_id):
    carrito = request.session.get('carrito', {})
    carrito.pop(str(product_id), None)
    request.session['carrito'] = carrito
    messages.success(request, 'Se quitó el producto del carrito.')
    return redirect('cart')


@requiere_permiso_producto('shop.view_product')
def inventory(request):
    products = seed_products().order_by('-rating', '-created_at')
    context = {'products': products}
    return render(request, 'shop/inventory.html', context)


@require_http_methods(['GET', 'POST'])
@requiere_permiso_producto(
    lambda request, *args, **kwargs: 'shop.add_product' if kwargs.get('product_id') is None else 'shop.change_product'
)
def product_form(request, product_id=None):
    product = get_object_or_404(Product, pk=product_id) if product_id else None

    if request.method == 'POST':
        name = (request.POST.get('name') or '').strip()
        brand = (request.POST.get('brand') or '').strip()
        category = request.POST.get('category') or 'lipstick'
        price = request.POST.get('price') or '0'
        stock = request.POST.get('stock') or '0'
        description = (request.POST.get('description') or '').strip()
        image_url = (request.POST.get('image_url') or '').strip()

        if not name or not brand or not description:
            messages.error(request, 'Nombre, marca y descripción son obligatorios.')
            return redirect('inventory')

        if category not in dict(Product.CATEGORY_CHOICES):
            messages.error(request, 'Selecciona una categoría válida.')
            return redirect('inventory')

        try:
            parsed_price = Decimal(price)
            parsed_stock = int(stock)
        except (InvalidOperation, ValueError):
            messages.error(request, 'El precio debe ser un valor numérico válido.')
            return redirect('inventory')

        if parsed_price <= 0:
            messages.error(request, 'El precio debe ser mayor a cero.')
            return redirect('inventory')
        if parsed_stock < 0:
            messages.error(request, 'El stock no puede ser negativo.')
            return redirect('inventory')

        if product:
            product.name = name
            product.brand = brand
            product.category = category
            product.price = parsed_price
            product.stock = parsed_stock
            product.description = description
            product.image_url = image_url or product.image_url
            product.save()
            messages.success(request, f'Producto actualizado: {product.name}')
        else:
            Product.objects.create(
                name=name,
                brand=brand,
                category=category,
                price=parsed_price,
                stock=parsed_stock,
                description=description,
                image_url=image_url or '/static/img/glowing_foundation_1778612251107.png',
                rating=4.5,
            )
            messages.success(request, f'Producto creado: {name}')
        return redirect('inventory')

    context = {'product': product, 'categories': Product.CATEGORY_CHOICES}
    return render(request, 'shop/inventory_form.html', context)


@require_http_methods(['POST'])
@requiere_permiso_producto('shop.delete_product')
def product_delete(request, product_id):
    product = get_object_or_404(Product, pk=product_id)
    product_name = product.name
    product.delete()
    messages.success(request, f'Producto eliminado: {product_name}')
    return redirect('inventory')


@require_http_methods(['POST'])
def checkout_view(request):
    name = (request.POST.get('full_name') or '').strip()
    email = (request.POST.get('email') or '').strip()
    phone = (request.POST.get('phone') or '').strip()
    street = (request.POST.get('street') or '').strip()
    city = (request.POST.get('city') or '').strip()
    zip_code = (request.POST.get('zip_code') or '').strip()
    country = (request.POST.get('country') or '').strip()
    payment_method = request.POST.get('payment_method') or 'credit'
    carrito = request.session.get('carrito', {})

    if not all([name, email, phone, street, city, zip_code, country]):
        messages.error(request, 'Completa todos los datos de pago y envío.')
        return redirect('cart')
    if not carrito:
        messages.error(request, 'Agrega productos al carrito antes de confirmar el pedido.')
        return redirect('cart')
    if payment_method not in dict(Order.PAYMENT_METHODS):
        messages.error(request, 'Selecciona un medio de pago válido.')
        return redirect('cart')
    try:
        validate_email(email)
    except ValidationError:
        messages.error(request, 'Ingresa un correo electrónico válido.')
        return redirect('cart')

    try:
        cantidades = {int(identificador): int(datos['cantidad']) for identificador, datos in carrito.items()}
    except (KeyError, TypeError, ValueError):
        messages.error(request, 'El carrito contiene productos inválidos. Revísalo e inténtalo nuevamente.')
        return redirect('cart')
    if any(cantidad < 1 for cantidad in cantidades.values()):
        messages.error(request, 'Las cantidades del carrito deben ser mayores a cero.')
        return redirect('cart')

    partes_nombre = name.split(maxsplit=1)
    nombre = partes_nombre[0][:100]
    apellido = partes_nombre[1][:100] if len(partes_nombre) > 1 else ''
    cliente = None
    if request.user.is_authenticated:
        cliente = Cliente.objects.filter(usuario=request.user).first()
    if cliente is None:
        cliente = Cliente.objects.filter(correo__iexact=email, usuario__isnull=True).first()

    with transaction.atomic():
        productos = list(
            Product.objects.select_for_update().filter(pk__in=cantidades, is_active=True).order_by('pk')
        )
        if len(productos) != len(cantidades):
            messages.error(request, 'Uno de los productos ya no está disponible.')
            return redirect('cart')
        if any(producto.stock < cantidades[producto.pk] for producto in productos):
            messages.error(request, 'El stock cambió. Ajusta las cantidades antes de confirmar.')
            return redirect('cart')
        order_total = sum(
            (producto.price * cantidades[producto.pk] for producto in productos),
            Decimal('0.00'),
        )

        if cliente is None:
            cliente = Cliente.objects.create(
                usuario=request.user if request.user.is_authenticated else None,
                nombre=nombre,
                apellido=apellido,
                correo=email,
                telefono=phone[:12],
            )
        else:
            cliente.nombre = nombre
            cliente.apellido = apellido
            cliente.correo = email
            cliente.telefono = phone[:12]
            if request.user.is_authenticated and cliente.usuario_id is None:
                cliente.usuario = request.user
            cliente.save()

        order_number = f'BG-{request.user.id if request.user.is_authenticated else "GUEST"}-{uuid4().hex[:12].upper()}'
        pedido = Order.objects.create(
            cliente=cliente,
            user=request.user if request.user.is_authenticated else None,
            order_number=order_number,
            full_name=name,
            email=email,
            phone=phone,
            street=street,
            city=city,
            zip_code=zip_code,
            country=country,
            payment_method=payment_method,
            total=order_total,
        )
        for producto in productos:
            cantidad = cantidades[producto.pk]
            OrderItem.objects.create(
                order=pedido,
                product=producto,
                quantity=cantidad,
                unit_price=producto.price,
            )
            producto.stock -= cantidad
            producto.save(update_fields=['stock', 'updated_at'])

    request.session['carrito'] = {}
    messages.success(request, f'Pedido registrado con éxito. Orden {order_number}.')
    return redirect('home')
