from decimal import Decimal

from django.contrib.auth.models import User
from django.test import TestCase
from django.urls import reverse

from .models import Cliente, ContactMessage, Order, Product


class TiendaTest(TestCase):
	def setUp(self):
		self.producto = Product.objects.create(
			name='Labial de prueba',
			brand='Blush Glow',
			category='lipstick',
			price=Decimal('12.50'),
			stock=8,
			description='Producto para pruebas de integración.',
		)

	def test_portada_consulta_catalogo_y_mantiene_estilos(self):
		respuesta = self.client.get(reverse('home'))

		self.assertEqual(respuesta.status_code, 200)
		self.assertContains(respuesta, self.producto.name)
		self.assertContains(respuesta, '/static/css/estilo1.css')

	def test_registro_crea_usuario_y_cliente_relacionado(self):
		respuesta = self.client.post(
			reverse('register'),
			{
				'username': 'cliente_prueba',
				'email': 'cliente@example.com',
				'password': 'ClavePrueba2026!',
				'confirm_password': 'ClavePrueba2026!',
			},
		)

		self.assertEqual(respuesta.status_code, 302)
		usuario = User.objects.get(username='cliente_prueba')
		cliente = Cliente.objects.get(usuario=usuario)
		self.assertEqual(cliente.correo, usuario.email)
		self.assertTrue(usuario.check_password('ClavePrueba2026!'))
		self.assertFalse(usuario.is_staff)

	def test_contacto_se_guarda(self):
		respuesta = self.client.post(
			reverse('contact_submit'),
			{
				'name': 'Cliente Prueba',
				'email': 'contacto@example.com',
				'phone': '912345678',
				'message': 'Consulta de prueba.',
			},
		)

		self.assertEqual(respuesta.status_code, 302)
		self.assertTrue(ContactMessage.objects.filter(email='contacto@example.com').exists())

	def test_checkout_crea_cliente_y_pedido_relacionados(self):
		respuesta = self.client.post(
			reverse('checkout'),
			{
				'full_name': 'Camila Prueba',
				'email': 'camila@example.com',
				'phone': '912345678',
				'street': 'Calle de prueba 123',
				'city': 'Santiago',
				'zip_code': '8320000',
				'country': 'Chile',
				'payment_method': 'credit',
				'total': '25.00',
			},
		)

		self.assertEqual(respuesta.status_code, 302)
		pedido = Order.objects.get(email='camila@example.com')
		self.assertEqual(pedido.cliente.correo, pedido.email)
		self.assertEqual(pedido.total, Decimal('25.00'))

	def test_crud_producto_y_acceso_restringido(self):
		self.assertEqual(Product.objects.get(pk=self.producto.pk).stock, 8)
		self.producto.stock = 3
		self.producto.save(update_fields=['stock'])
		self.producto.refresh_from_db()
		self.assertEqual(self.producto.stock, 3)

		respuesta_anonima = self.client.get(reverse('inventory'))
		self.assertEqual(respuesta_anonima.status_code, 302)
		usuario_normal = User.objects.create_user(
			username='usuario_normal',
			email='usuario@example.com',
			password='ClavePrueba2026!',
		)
		self.client.force_login(usuario_normal)
		self.assertEqual(self.client.get(reverse('admin:index')).status_code, 302)
		self.assertEqual(self.client.get(reverse('inventory')).status_code, 302)

		administrador = User.objects.create_superuser(
			username='admin_prueba',
			email='admin@example.com',
			password='ClavePrueba2026!',
		)
		self.client.force_login(administrador)
		self.assertEqual(self.client.get(reverse('inventory')).status_code, 200)
		self.assertContains(self.client.get(reverse('product_create')), 'Unidades disponibles')

		respuesta_creacion = self.client.post(
			reverse('product_create'),
			{
				'name': 'Producto CRUD',
				'brand': 'Blush Glow',
				'category': 'lipstick',
				'price': '19.95',
				'stock': '11',
				'description': 'Producto para validar el CRUD.',
				'image_url': '',
			},
		)
		self.assertEqual(respuesta_creacion.status_code, 302)
		producto_creado = Product.objects.get(name='Producto CRUD')
		self.assertEqual(producto_creado.stock, 11)

		respuesta_edicion = self.client.post(
			reverse('product_edit', args=[producto_creado.pk]),
			{
				'name': 'Producto CRUD editado',
				'brand': 'Blush Glow',
				'category': 'lipstick',
				'price': '21.00',
				'stock': '4',
				'description': 'Producto editado durante la prueba.',
				'image_url': '',
			},
		)
		self.assertEqual(respuesta_edicion.status_code, 302)
		producto_creado.refresh_from_db()
		self.assertEqual(producto_creado.stock, 4)

		respuesta_eliminacion = self.client.post(reverse('product_delete', args=[producto_creado.pk]))
		self.assertEqual(respuesta_eliminacion.status_code, 302)
		self.assertFalse(Product.objects.filter(pk=producto_creado.pk).exists())

	def test_admin_nativo_muestra_modelos_de_tienda(self):
		administrador = User.objects.create_superuser(
			username='admin_panel_prueba',
			email='admin-panel@example.com',
			password='ClavePrueba2026!',
		)
		self.client.force_login(administrador)

		respuesta = self.client.get(reverse('admin:index'))

		self.assertEqual(respuesta.status_code, 200)
		self.assertContains(respuesta, 'Administración de Blush Glow')
		self.assertContains(respuesta, 'Clientes')
		self.assertContains(respuesta, 'Productos')
		self.assertContains(respuesta, 'Pedidos')
		self.assertEqual(self.client.get(reverse('admin:shop_product_add')).status_code, 200)

		respuesta_creacion = self.client.post(
			reverse('admin:shop_product_add'),
			{
				'name': 'Producto Admin',
				'brand': 'Blush Glow',
				'category': 'lipstick',
				'price': '23.45',
				'stock': '6',
				'description': 'Creado desde Django Admin.',
				'image_url': '',
				'rating': '4.5',
				'is_active': 'on',
				'_save': 'Guardar',
			},
		)
		self.assertEqual(respuesta_creacion.status_code, 302)
		producto = Product.objects.get(name='Producto Admin')
		url_edicion = reverse('admin:shop_product_change', args=[producto.pk])
		self.assertEqual(self.client.get(url_edicion).status_code, 200)

		respuesta_edicion = self.client.post(
			url_edicion,
			{
				'name': 'Producto Admin editado',
				'brand': 'Blush Glow',
				'category': 'lipstick',
				'price': '24.00',
				'stock': '3',
				'description': 'Editado desde Django Admin.',
				'image_url': '',
				'rating': '4.5',
				'is_active': 'on',
				'_save': 'Guardar',
			},
		)
		self.assertEqual(respuesta_edicion.status_code, 302)
		producto.refresh_from_db()
		self.assertEqual(producto.stock, 3)

		url_eliminacion = reverse('admin:shop_product_delete', args=[producto.pk])
		self.assertEqual(self.client.get(url_eliminacion).status_code, 200)
		respuesta_eliminacion = self.client.post(url_eliminacion, {'post': 'yes'})
		self.assertEqual(respuesta_eliminacion.status_code, 302)
		self.assertFalse(Product.objects.filter(pk=producto.pk).exists())
