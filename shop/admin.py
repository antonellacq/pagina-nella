from django.contrib import admin

from .models import ContactMessage, Order, OrderItem, Product

admin.site.register(Product)
admin.site.register(ContactMessage)
admin.site.register(Order)
admin.site.register(OrderItem)
