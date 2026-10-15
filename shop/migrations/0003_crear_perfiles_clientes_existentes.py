from django.conf import settings
from django.db import migrations


def crear_perfiles_clientes(apps, schema_editor):
    Cliente = apps.get_model('shop', 'Cliente')
    Usuario = apps.get_model(*settings.AUTH_USER_MODEL.split('.'))
    base_datos = schema_editor.connection.alias

    usuarios = Usuario.objects.using(base_datos).filter(
        is_staff=False,
        is_superuser=False,
    ).exclude(email='')
    for usuario in usuarios.iterator():
        Cliente.objects.using(base_datos).get_or_create(
            usuario_id=usuario.pk,
            defaults={
                'nombre': usuario.username[:100],
                'correo': usuario.email,
            },
        )


def no_eliminar_perfiles(apps, schema_editor):
    pass


class Migration(migrations.Migration):
    dependencies = [
        ('shop', '0002_alter_contactmessage_options_alter_order_options_and_more'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.RunPython(crear_perfiles_clientes, no_eliminar_perfiles),
    ]
