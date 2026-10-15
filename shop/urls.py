from django.urls import path

from . import views

urlpatterns = [
    path('', views.home, name='home'),
    path('register/', views.register_view, name='register'),
    path('login/', views.login_view, name='login'),
    path('logout/', views.logout_view, name='logout'),
    path('contact/', views.contact_submit, name='contact_submit'),
    path('cart/', views.cart_view, name='cart'),
    path('cart/add/<int:product_id>/', views.cart_add, name='cart_add'),
    path('cart/update/<int:product_id>/', views.cart_update, name='cart_update'),
    path('cart/remove/<int:product_id>/', views.cart_remove, name='cart_remove'),
    path('checkout/', views.checkout_view, name='checkout'),
    path('inventory/', views.inventory, name='inventory'),
    path('products/new/', views.product_form, name='product_create'),
    path('products/<int:product_id>/edit/', views.product_form, name='product_edit'),
    path('products/<int:product_id>/delete/', views.product_delete, name='product_delete'),
]
