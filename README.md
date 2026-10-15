# Blush & Glow - Django + MySQL storefront

Este proyecto conserva el diseño visual de la tienda de maquillaje original y lo integra con un backend real de Django, con modelos, rutas, plantillas, formularios y persistencia de datos.

## ¿Qué hace la aplicación?

- Muestra una landing page estilo boutique con hero section, galería, catálogo de productos y contacto.
- Permite registrar usuarios, iniciar sesión y cerrar sesión con Django Auth.
- Guarda mensajes de contacto en la base de datos.
- Administra productos desde un panel de inventario con CRUD.
- Gestiona pedidos mediante modelos de Django.
- Mantiene el diseño visual original usando CSS estático y templates propios de Django.

## Tecnologías utilizadas

- Python 3.14
- Django 5.1.3
- PyMySQL para conexión MySQL
- python-dotenv para variables de entorno
- MySQL como base de datos orientada a producción
- HTML + CSS + Django Templates

## Estructura del proyecto

- `blush_glow/` - configuración principal del proyecto Django
- `shop/` - modelos, vistas, rutas y administración de la app
- `templates/` - plantillas del storefront e inventario
- `static/` - hojas de estilo e imágenes
- `.env.example` - variables de entorno para MySQL
- `manage.py` - comando principal de Django

## Crear y activar entorno virtual

En Windows PowerShell:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
```

## Instalar dependencias

```powershell
python -m pip install --upgrade pip
pip install -r requirements.txt
```

## Configurar MySQL

1. Crea una base de datos llamada `blush_glow` en MySQL.
2. Copia `.env.example` a `.env`.
3. Ajusta los valores reales:

```env
DEBUG=True
SECRET_KEY=tu_clave_secreta
DB_NAME=blush_glow
DB_USER=root
DB_PASSWORD=tu_password
DB_HOST=127.0.0.1
DB_PORT=3306
```

En el entorno actual no se disponía de un servicio MySQL activo, por lo que la verificación se ejecutó con SQLite y la configuración quedó preparada para MySQL cuando el servicio esté disponible.

## Ejecutar migraciones

```powershell
python manage.py makemigrations
python manage.py migrate
```

## Crear usuario administrador

```powershell
python manage.py createsuperuser
```

## Iniciar el servidor

```powershell
python manage.py runserver 0.0.0.0:8000
```

Luego abre:

- http://127.0.0.1:8000/
- http://127.0.0.1:8000/admin/

## Rutas principales

- `/` - storefront principal
- `/register/` - registro de usuarios
- `/login/` - inicio de sesión
- `/logout/` - cierre de sesión
- `/contact/` - envío de mensajes
- `/inventory/` - CRUD del inventario (solo admin)
- `/products/new/` - crear producto
- `/products/<id>/edit/` - editar producto
- `/products/<id>/delete/` - eliminar producto

## Verificación funcional realizada

Se comprobó que:

- `python manage.py check` funciona sin errores.
- `python manage.py makemigrations` genera modelos.
- `python manage.py migrate` aplica la estructura en la base de datos.
- La vista principal renderiza la plantilla con CSS y recursos estáticos.
- El registro crea usuarios reales.
- El contacto guarda mensajes reales.
- El inventario crea productos reales para un usuario administrador.

## Estado final

La aplicación queda lista para seguirse desarrollando con Django y manejar la conexión real a MySQL cuando el servicio se encuentre levantado en el entorno local o de producción.
