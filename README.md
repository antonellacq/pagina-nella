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

- Python 3.13
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
py -3.13 -m venv .venv313
.\.venv313\Scripts\Activate.ps1
```

## Instalar dependencias

```powershell
python -m pip install --upgrade pip
pip install -r requirements.txt
```

## Configurar XAMPP y MariaDB

1. Inicia Apache y MySQL desde el panel de XAMPP. XAMPP distribuye MariaDB como su servidor MySQL.
2. En phpMyAdmin crea una base de datos llamada `blush_glow` con cotejamiento `utf8mb4_unicode_ci`.
3. Usa una cuenta dedicada para Django y dale privilegios solo sobre `blush_glow`. En la pestaña SQL de phpMyAdmin puedes ejecutar, reemplazando la contraseña:

```sql
CREATE USER 'blush_django'@'localhost' IDENTIFIED BY 'elige-una-clave-segura';
CREATE USER 'blush_django'@'127.0.0.1' IDENTIFIED BY 'elige-una-clave-segura';
GRANT ALL PRIVILEGES ON blush_glow.* TO 'blush_django'@'localhost';
GRANT ALL PRIVILEGES ON blush_glow.* TO 'blush_django'@'127.0.0.1';
FLUSH PRIVILEGES;
```

4. Comprueba la versión en phpMyAdmin con `SELECT VERSION();`. Django 5.1 requiere MariaDB 10.5 o posterior; algunas versiones de XAMPP incluyen MariaDB 10.4 y necesitan actualizar su componente de base de datos.
5. Copia `.env.example` a `.env` y configura tus valores locales:

```env
DEBUG=True
SECRET_KEY=tu_clave_secreta
DB_NAME=blush_glow
DB_USER=blush_django
DB_PASSWORD=tu_clave_segura
DB_HOST=127.0.0.1
DB_PORT=3306
```

No publiques `.env` ni uses la cuenta `root` para la aplicación. El archivo `.env` está excluido de Git.

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
python manage.py runserver 127.0.0.1:8000
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
- `/cart/` - carrito guardado en la sesión de Django
- `/cart/add/<id>/`, `/cart/update/<id>/`, `/cart/remove/<id>/` - operaciones del carrito
- `/checkout/` - confirma un pedido, guarda sus líneas y descuenta stock en una transacción
- `/inventory/` - CRUD del inventario (solo admin)
- `/products/new/` - crear producto
- `/products/<id>/edit/` - editar producto
- `/products/<id>/delete/` - eliminar producto

## Verificación funcional realizada

Se comprobó en XAMPP/MariaDB que:

- `python manage.py check --database default` termina sin problemas.
- `python manage.py migrate` aplica las migraciones de Django y `shop`.
- La portada renderiza con el enlace al CSS original y los recursos estáticos.
- Los formularios de registro, contacto, inventario y checkout guardan datos en la base real.
- El carrito mantiene cantidades en una sesión respaldada por la tabla `django_session`; el servidor calcula el total usando precios vigentes y crea `OrderItem` al confirmar.
- El checkout valida el stock actual y descuenta existencias atómicamente junto con el pedido.
- El CRUD de productos crea, edita y elimina registros correctamente.
- Los registros temporales de las pruebas se eliminaron; los datos previos se conservaron.

## Estado final

La aplicación queda conectada a la base `blush_glow` de XAMPP en `127.0.0.1:3306`. El diseño original se conserva en las plantillas, CSS e imágenes de `static/`.
