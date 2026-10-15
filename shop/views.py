from decimal import Decimal

from django.contrib import messages
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import user_passes_test
from django.contrib.auth.models import User
from django.db.models import Q
from django.shortcuts import get_object_or_404, redirect, render
from django.views.decorators.http import require_http_methods

from .models import ContactMessage, Order, Product

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

    user = User.objects.create_user(username=username, email=email, password=password)
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

    ContactMessage.objects.create(name=name, email=email, phone=phone, message=message)
    messages.success(request, 'Mensaje enviado correctamente. Te contactaremos pronto.')
    return redirect('home')


@user_passes_test(lambda user: user.is_staff)
def inventory(request):
    products = seed_products().order_by('-rating', '-created_at')
    context = {'products': products}
    return render(request, 'shop/inventory.html', context)


@user_passes_test(lambda user: user.is_staff)
@require_http_methods(['GET', 'POST'])
def product_form(request, product_id=None):
    product = get_object_or_404(Product, pk=product_id) if product_id else None

    if request.method == 'POST':
        name = (request.POST.get('name') or '').strip()
        brand = (request.POST.get('brand') or '').strip()
        category = request.POST.get('category') or 'lipstick'
        price = request.POST.get('price') or '0'
        description = (request.POST.get('description') or '').strip()
        image_url = (request.POST.get('image_url') or '').strip()

        if not name or not brand or not description:
            messages.error(request, 'Nombre, marca y descripción son obligatorios.')
            return redirect('inventory')

        try:
            parsed_price = Decimal(price)
        except Exception:
            messages.error(request, 'El precio debe ser un valor numérico válido.')
            return redirect('inventory')

        if parsed_price <= 0:
            messages.error(request, 'El precio debe ser mayor a cero.')
            return redirect('inventory')

        if product:
            product.name = name
            product.brand = brand
            product.category = category
            product.price = parsed_price
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
                description=description,
                image_url=image_url or '/static/img/glowing_foundation_1778612251107.png',
                rating=4.5,
            )
            messages.success(request, f'Producto creado: {name}')
        return redirect('inventory')

    context = {'product': product, 'categories': Product.CATEGORY_CHOICES}
    return render(request, 'shop/inventory_form.html', context)


@user_passes_test(lambda user: user.is_staff)
@require_http_methods(['POST'])
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
    total = request.POST.get('total') or '0'

    if not all([name, email, phone, street, city, zip_code, country]):
        messages.error(request, 'Completa todos los datos de pago y envío.')
        return redirect('home')

    try:
        order_total = Decimal(total)
    except Exception:
        order_total = Decimal('0')

    order_number = f'BG-{request.user.id if request.user.is_authenticated else "GUEST"}-{len(Order.objects.all()) + 1}'
    Order.objects.create(
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

    messages.success(request, f'Pedido registrado con éxito. Orden {order_number}.')
    return redirect('home')
