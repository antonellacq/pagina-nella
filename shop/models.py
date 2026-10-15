from django.contrib.auth.models import User
from django.db import models


class Cliente(models.Model):
    usuario = models.OneToOneField(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='perfil_cliente',
        verbose_name='usuario',
    )
    run_cliente = models.CharField(max_length=10, blank=True, verbose_name='RUN')
    nombre = models.CharField(max_length=100, verbose_name='nombre')
    apellido = models.CharField(max_length=100, blank=True, verbose_name='apellido')
    correo = models.EmailField(verbose_name='correo electrónico')
    telefono = models.CharField(max_length=12, blank=True, verbose_name='teléfono')

    class Meta:
        ordering = ['apellido', 'nombre']
        verbose_name = 'cliente'
        verbose_name_plural = 'clientes'

    def __str__(self):
        return f'{self.nombre} {self.apellido}'.strip()


class Product(models.Model):
    CATEGORY_CHOICES = [
        ('lipstick', 'Labial'),
        ('eyeshadow', 'Sombra'),
        ('foundation', 'Base'),
        ('blush', 'Rubor'),
        ('mascara', 'Máscara'),
        ('eyeliner', 'Delineador'),
    ]

    name = models.CharField(max_length=200, verbose_name='nombre')
    brand = models.CharField(max_length=120, verbose_name='marca')
    category = models.CharField(max_length=32, choices=CATEGORY_CHOICES, default='lipstick', verbose_name='categoría')
    price = models.DecimalField(max_digits=10, decimal_places=2, verbose_name='precio')
    stock = models.PositiveIntegerField(default=0, verbose_name='stock')
    description = models.TextField(verbose_name='descripción')
    image_url = models.URLField(blank=True, null=True, verbose_name='URL de imagen')
    rating = models.DecimalField(max_digits=3, decimal_places=1, default=4.5, verbose_name='calificación')
    is_active = models.BooleanField(default=True, verbose_name='activo')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='fecha de creación')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='fecha de actualización')

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'producto'
        verbose_name_plural = 'productos'

    def __str__(self):
        return f'{self.brand} - {self.name}'


class ContactMessage(models.Model):
    name = models.CharField(max_length=120, verbose_name='nombre')
    email = models.EmailField(verbose_name='correo electrónico')
    phone = models.CharField(max_length=30, blank=True, verbose_name='teléfono')
    message = models.TextField(verbose_name='mensaje')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='fecha de recepción')

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'mensaje de contacto'
        verbose_name_plural = 'mensajes de contacto'

    def __str__(self):
        return f'{self.name} ({self.email})'


class Order(models.Model):
    PAYMENT_METHODS = [
        ('credit', 'Tarjeta de crédito'),
        ('debit', 'Tarjeta de débito'),
        ('transfer', 'Transferencia'),
    ]

    cliente = models.ForeignKey(
        Cliente,
        on_delete=models.PROTECT,
        null=True,
        blank=True,
        related_name='pedidos',
        verbose_name='cliente',
    )
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    order_number = models.CharField(max_length=50, unique=True, verbose_name='número de pedido')
    full_name = models.CharField(max_length=120, verbose_name='nombre completo')
    email = models.EmailField(verbose_name='correo electrónico')
    phone = models.CharField(max_length=30, verbose_name='teléfono')
    street = models.CharField(max_length=200, verbose_name='dirección')
    city = models.CharField(max_length=100, verbose_name='comuna o ciudad')
    zip_code = models.CharField(max_length=20, verbose_name='código postal')
    country = models.CharField(max_length=100, verbose_name='país')
    payment_method = models.CharField(max_length=20, choices=PAYMENT_METHODS, default='credit', verbose_name='medio de pago')
    total = models.DecimalField(max_digits=10, decimal_places=2, verbose_name='total')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='fecha de creación')

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'pedido'
        verbose_name_plural = 'pedidos'

    def __str__(self):
        return self.order_number


class OrderItem(models.Model):
    order = models.ForeignKey('Order', related_name='items', on_delete=models.CASCADE, verbose_name='pedido')
    product = models.ForeignKey(Product, on_delete=models.PROTECT, verbose_name='producto')
    quantity = models.PositiveIntegerField(default=1, verbose_name='cantidad')
    unit_price = models.DecimalField(max_digits=10, decimal_places=2, verbose_name='precio unitario')
    selected_color = models.CharField(max_length=100, blank=True, verbose_name='color seleccionado')

    class Meta:
        verbose_name = 'producto del pedido'
        verbose_name_plural = 'productos del pedido'

    def subtotal(self):
        return self.unit_price * self.quantity

    def __str__(self):
        return f'{self.product.name} x {self.quantity}'
