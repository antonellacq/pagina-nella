from django.contrib.auth.models import User
from django.db import models


class Product(models.Model):
    CATEGORY_CHOICES = [
        ('lipstick', 'Labial'),
        ('eyeshadow', 'Sombra'),
        ('foundation', 'Base'),
        ('blush', 'Rubor'),
        ('mascara', 'Máscara'),
        ('eyeliner', 'Delineador'),
    ]

    name = models.CharField(max_length=200)
    brand = models.CharField(max_length=120)
    category = models.CharField(max_length=32, choices=CATEGORY_CHOICES, default='lipstick')
    price = models.DecimalField(max_digits=10, decimal_places=2)
    description = models.TextField()
    image_url = models.URLField(blank=True, null=True)
    rating = models.DecimalField(max_digits=3, decimal_places=1, default=4.5)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.brand} - {self.name}'


class ContactMessage(models.Model):
    name = models.CharField(max_length=120)
    email = models.EmailField()
    phone = models.CharField(max_length=30, blank=True)
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'{self.name} ({self.email})'


class Order(models.Model):
    PAYMENT_METHODS = [
        ('credit', 'Tarjeta de crédito'),
        ('debit', 'Tarjeta de débito'),
        ('transfer', 'Transferencia'),
    ]

    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    order_number = models.CharField(max_length=50, unique=True)
    full_name = models.CharField(max_length=120)
    email = models.EmailField()
    phone = models.CharField(max_length=30)
    street = models.CharField(max_length=200)
    city = models.CharField(max_length=100)
    zip_code = models.CharField(max_length=20)
    country = models.CharField(max_length=100)
    payment_method = models.CharField(max_length=20, choices=PAYMENT_METHODS, default='credit')
    total = models.DecimalField(max_digits=10, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.order_number


class OrderItem(models.Model):
    order = models.ForeignKey('Order', related_name='items', on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.PROTECT)
    quantity = models.PositiveIntegerField(default=1)
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    selected_color = models.CharField(max_length=100, blank=True)

    def subtotal(self):
        return self.unit_price * self.quantity

    def __str__(self):
        return f'{self.product.name} x {self.quantity}'
