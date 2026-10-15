from django.contrib import admin
from django.contrib.auth.admin import GroupAdmin, UserAdmin
from django.contrib.auth.models import Group, User

from .models import Cliente, ContactMessage, Order, OrderItem, Product


class ClienteAdmin(admin.ModelAdmin):
	list_display = ('nombre', 'apellido', 'correo', 'telefono', 'usuario')
	search_fields = ('nombre', 'apellido', 'correo', 'run_cliente')
	list_filter = ('usuario__is_staff',)
	ordering = ('apellido', 'nombre')
	list_per_page = 25


class ProductoAdmin(admin.ModelAdmin):
	list_display = ('name', 'brand', 'category', 'price', 'stock', 'is_active', 'updated_at')
	search_fields = ('name', 'brand', 'description')
	list_filter = ('category', 'is_active', 'brand')
	ordering = ('name',)
	list_editable = ('price', 'stock', 'is_active')
	list_per_page = 25
	readonly_fields = ('created_at', 'updated_at')
	fieldsets = (
		('Información del producto', {'fields': ('name', 'brand', 'category', 'description', 'image_url')}),
		('Precio e inventario', {'fields': ('price', 'stock', 'rating', 'is_active')}),
		('Fechas', {'fields': ('created_at', 'updated_at')}),
	)


class MensajeContactoAdmin(admin.ModelAdmin):
	list_display = ('name', 'email', 'phone', 'created_at')
	search_fields = ('name', 'email', 'message')
	list_filter = ('created_at',)
	ordering = ('-created_at',)
	list_per_page = 25
	readonly_fields = ('name', 'email', 'phone', 'message', 'created_at')


class ProductoPedidoInline(admin.TabularInline):
	model = OrderItem
	extra = 0
	autocomplete_fields = ('product',)


class PedidoAdmin(admin.ModelAdmin):
	list_display = ('order_number', 'full_name', 'email', 'cliente', 'payment_method', 'total', 'created_at')
	search_fields = ('order_number', 'full_name', 'email', 'cliente__nombre', 'cliente__apellido')
	list_filter = ('payment_method', 'country', 'created_at')
	ordering = ('-created_at',)
	list_per_page = 25
	readonly_fields = ('order_number', 'created_at')
	autocomplete_fields = ('cliente', 'user')
	inlines = (ProductoPedidoInline,)


class ProductoPedidoAdmin(admin.ModelAdmin):
	list_display = ('order', 'product', 'quantity', 'unit_price', 'subtotal')
	search_fields = ('order__order_number', 'product__name', 'product__brand')
	list_filter = ('product__category',)
	ordering = ('-order__created_at',)
	list_per_page = 25
	autocomplete_fields = ('order', 'product')
	readonly_fields = ('subtotal',)


admin.site.site_header = 'Administración de Blush Glow'
admin.site.site_title = 'Blush Glow | Administración'
admin.site.index_title = 'Gestión de la tienda'

admin.site.unregister(User)
admin.site.unregister(Group)
admin.site.register(User, UserAdmin)
admin.site.register(Group, GroupAdmin)
admin.site.register(Cliente, ClienteAdmin)
admin.site.register(Product, ProductoAdmin)
admin.site.register(ContactMessage, MensajeContactoAdmin)
admin.site.register(Order, PedidoAdmin)
admin.site.register(OrderItem, ProductoPedidoAdmin)
