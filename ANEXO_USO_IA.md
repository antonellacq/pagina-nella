# Anexo: Uso de Inteligencia Artificial

## Herramienta utilizada

GitHub Copilot, como asistente de programación integrado en Visual Studio Code.

## Finalidad

Se utilizó para apoyar la revisión del proyecto Blush & Glow existente, conservar su interfaz mientras se integraba Django, revisar y completar modelos, rutas, vistas, persistencia en MariaDB de XAMPP, permisos y Django Admin, y proponer pruebas automatizadas. Las decisiones y resultados se comprobaron en el código, la base de datos local, el navegador y la suite de pruebas.

Durante la etapa inicial de React, el archivo `ia_consultas.txt` ya registraba consultas para estructurar componentes, validar formularios y manejar datos de catálogo. En la etapa Django se utilizó Copilot para revisar la implementación y ejecutar verificaciones; el anexo no atribuye a la IA resultados que no se probaron.

## Prompts exactos recuperables

Los textos A, B, D y E siguientes están transcritos literalmente de `ia_consultas.txt`, archivo existente en el proyecto.

### Consulta A: componentes React

> ¿Cuáles son las mejores prácticas en React para estructurar y separar una página web estática de maquillaje (Blush & Glow) en componentes funcionales modernos? Explica cómo implementar un carrusel de imágenes dinámico usando hooks de estado y ciclo de vida de componentes (useState, useEffect), cómo pasar controladores de eventos (como el cambio de imagen) mediante props, y cómo mantener una estructura HTML5 semántica limpia en el retorno JSX de la aplicación.

### Consulta B: formularios React seguros

> Necesito diseñar tres formularios controlados en React (Inscripción, Inicio de Sesión y Contacto) aplicando buenas prácticas de desarrollo seguro. ¿Cómo prevengo inyecciones de código/XSS en el cliente? ¿De qué manera debo sanitizar los datos de entrada? Proporciona un ejemplo de validación estricta usando el estado de React para evitar campos vacíos, verificar formato de correos y auditar requerimientos de contraseña complejos, vinculando correctamente los labels a sus inputs correspondientes.

### Consulta D: integridad de datos en localStorage

> ¿Cómo puedo garantizar la integridad y seguridad de los datos al guardar registros de productos y catálogo en localStorage usando React? Dame recomendaciones para sanitizar los campos (prevención de XSS), manejar datos corruptos al cargar con useEffect, y validaciones estrictas antes de persistir.

### Consulta E: peticiones a API

> ¿Cómo implementar de forma segura y robusta un fetching de datos desde una API REST (como Makeup API o similar) en React usando async/await con try-catch? Explica cómo manejar estados de carga (loading), reaccionar ante respuestas HTTP inválidas o códigos de error (4xx/5xx), controlar la desconexión del cliente, proveer un fallback local y validar los tipos de datos recibidos.

### Requisitos iniciales de React conservados en el historial del proyecto

El registro `ia_consultas.txt`, Consulta C, contiene el texto original de la especificación de la primera etapa: implementar un carrusel React de al menos tres imágenes con `useState`; mantener HTML semántico; crear formularios controlados de inscripción, login y contacto con `htmlFor`; validar entradas y prevenir XSS; usar estado y props; y adjuntar las consultas de IA. Se conserva íntegro en ese archivo para evitar duplicar una especificación extensa.

### Instrucción de configuración Django recuperable

El transcript local conserva íntegramente la solicitud que comienza así:

> Actúa como un desarrollador experto en Python, Django, MySQL, Git, GitHub y configuración de entornos de desarrollo en Windows.
>
> Necesito que prepares mi computadora y mi proyecto web para trabajar con una base de datos real, siguiendo los contenidos de Programación Back End de INACAP. Además, necesito que todos los cambios realizados en el proyecto queden correctamente guardados y actualizados en mi repositorio de GitHub.

La solicitud completa incluía comprobar XAMPP, crear y proteger la conexión, revisar GitHub, respaldar antes de cambios y pedir autorización antes de `git push`. El texto completo está en el transcript local de Copilot, no se vuelve a copiar aquí para mantener una única transcripción de referencia.

## Límites de recuperación del historial

En la conversación aparecen mensajes anteriores con adjuntos titulados «PROMPT COMPLETO Y DEFINITIVO – EVALUACIÓN SUMATIVA N.º 2» y «PROMPT PARA GITHUB COPILOT AGENT – BLUSH GLOW – EVALUACIÓN 2». En el transcript local consultable esos mensajes están representados solo por el marcador `#attachment:Pasted text #1`, sin el contenido del adjunto. Por ese motivo no se transcriben ni se presentan como prompts exactos en este archivo. Si se requiere que queden íntegros aquí, se debe volver a proporcionar el texto de esos adjuntos.

### Prompt complementario de revisión final (transcripción de trabajo)

El contenido de este bloque corresponde al mensaje complementario enviado en esta conversación. Se normalizó el formato Markdown para facilitar su lectura; la fuente íntegra es el mensaje del usuario en el historial de esta conversación.

```text
# PROMPT COMPLEMENTARIO — REVISIÓN FINAL Y MEJORAS DE BLUSH & GLOW
Quiero que continúes trabajando en mi proyecto actual Blush & Glow, correspondiente a la Evaluación 2 de Programación Back End de INACAP.

IMPORTANTE: Este mensaje es un complemento de todos los prompts anteriores que ya te envié. No reemplaza las instrucciones anteriores ni significa que debas comenzar nuevamente el proyecto.

Ya hemos avanzado bastante en el desarrollo, la configuración de Django, MySQL, XAMPP, los modelos, las migraciones y el superusuario. Por lo tanto, antes de realizar cualquier modificación, revisa todo lo que ya implementaste y continúa únicamente con lo que esté pendiente.

1. REVISIÓN DE LOS REQUISITOS DE LA EVALUACIÓN 2
Quiero que hagas una revisión exhaustiva del proyecto para verificar que cumple los siguientes requisitos oficiales de la evaluación:

Criterio 2.1.1 — Configuración de base de datos:
- Instalar el paquete necesario para conectar Django con la base de datos.
- Configurar correctamente settings.py.
- Utilizar variables de entorno para los parámetros de conexión.
- Crear los modelos necesarios según la problemática del proyecto.
- Utilizar correctamente campos y relaciones entre modelos, incluidas las claves foráneas.
- Crear y aplicar las migraciones para generar las tablas en la base de datos.

Criterio 2.1.2 — Administrador de Django:
- Tener un superusuario creado y funcionando.
- Registrar los modelos en admin.py.
- Permitir crear, consultar, editar y eliminar registros desde el panel administrativo nativo de Django.
El superusuario antonella_catalan ya fue creado anteriormente. Verifica que funcione y no lo dupliques.

Si algún requisito ya está implementado correctamente, consérvalo. Si falta algo, complétalo. Si detectas errores, corrígelos.

2. AGREGAR UN ACCESO EXCLUSIVO PARA ADMINISTRADORES
Quiero incorporar en la página web una opción independiente que diga exactamente:

«Ingresar como administrador»

Actualmente existen las opciones para iniciar sesión y registrarse como cliente. Estas deben mantenerse.

El nuevo acceso debe dirigir al panel de administración de Django mediante /admin/.

Debe quedar claramente diferenciada la autenticación de clientes de la autenticación administrativa.

Solamente los usuarios con permisos administrativos podrán acceder al panel.

Integra esta opción respetando el diseño, los colores y la apariencia actual de Blush & Glow.

Si ya existe un acceso administrativo correctamente implementado, no lo dupliques; solamente comprueba su funcionamiento.

3. REVISIÓN COMPLETA DE LA BASE DE DATOS
Necesito que revises todas las funcionalidades de la página web y determines cuáles requieren almacenar información en MySQL.

Por ejemplo:
- Registro de clientes.
- Datos y perfiles de usuarios.
- Inicio de sesión y autenticación.
- Productos y categorías.
- Inventario y stock.
- Mensajes enviados desde «Contáctanos» o «Contactar con la tienda».
- Carrito de compras.
- Pedidos y detalles de compras.
- Direcciones de entrega.
- Otras funcionalidades existentes que necesiten persistencia.

Quiero que cada funcionalidad que necesite guardar información esté conectada correctamente con su modelo Django y sus correspondientes tablas en MySQL.

No es necesario crear una tabla separada para cada botón o pantalla. Reutiliza los modelos existentes, las relaciones y el sistema de autenticación de Django cuando corresponda.

Las contraseñas deben almacenarse de forma segura mediante el sistema de Django, nunca en texto plano.

En particular, verifica que los clientes puedan registrarse, iniciar sesión y conservar sus datos correctamente, y que los mensajes de contacto realmente se guarden en la base de datos.

Revisa también las relaciones entre clientes, productos, pedidos y demás entidades.

No crees modelos duplicados ni elimines información existente.

4. COMPROBAR MYSQL Y PHPMYADMIN
Anteriormente observé que la base de datos blush_glow aparecía vacía en phpMyAdmin, aunque Django parecía tener registros.

Necesito que investigues esta situación y compruebes que:
- Django esté conectado a la instancia correcta de MySQL/MariaDB.
- XAMPP utilice el puerto correspondiente.
- phpMyAdmin muestre la misma base de datos que utiliza Django.
- Las tablas realmente existan.
- Los registros se almacenen correctamente.
- Los datos existentes no se pierdan.
- Las migraciones estén aplicadas.

No elimines bases de datos ni cambies configuraciones que ya funcionan sin comprobar antes sus consecuencias. Realiza respaldos antes de cualquier operación que pueda afectar los datos.

5. VERIFICACIÓN DE TODA LA PÁGINA WEB
Revisa el funcionamiento completo de Blush & Glow.

Comprueba que los botones, enlaces, formularios y funciones principales respondan correctamente.

Verifica especialmente:
- Registro de clientes.
- Inicio y cierre de sesión.
- Acceso exclusivo del administrador.
- Visualización de productos.
- Administración de productos.
- Formularios de contacto.
- Carrito de compras, si está implementado.
- Pedidos, si están implementados.
- Inventario.
- Persistencia de datos.
- Imágenes y archivos estáticos.
- Diseño adaptable.

Si alguna función existente es solamente visual y debería guardar o consultar información, completa su conexión con Django y MySQL.

Conserva el diseño original de la página. No quiero cambios visuales innecesarios.

6. DOCUMENTACIÓN DE LOS PROMPTS UTILIZADOS CON IA
A diferencia de una instrucción anterior, sí quiero que prepares el anexo de utilización de Inteligencia Artificial solicitado en la Evaluación 2.

Este anexo debe incluir:
- La herramienta de IA utilizada.
- Los prompts que te he proporcionado durante el desarrollo del proyecto.
- Una descripción breve de cómo se utilizó la IA para apoyar la codificación.
- Las fuentes utilizadas, citadas en formato APA, última edición, cuando corresponda.

Importante: Revisa el historial de esta conversación y recupera los prompts anteriores que realmente estén disponibles.

No inventes prompts, fechas, conversaciones ni fuentes. Si no puedes recuperar alguna instrucción exacta, indícalo para que pueda proporcionártela posteriormente.

Puedes preparar el anexo en un archivo independiente y editable, preferiblemente Word o Markdown.

No necesito que prepares un discurso, presentación oral ni archivo ZIP, porque esas partes las realizaré yo.

7. PRUEBAS FINALES
Antes de dar el trabajo por terminado:
1. Comprueba que Django inicia correctamente.
2. Verifica la conexión con MySQL.
3. Confirma que las tablas existen.
4. Revisa las migraciones.
5. Comprueba el inicio de sesión administrativo.
6. Prueba el registro y la autenticación de clientes.
7. Comprueba que los formularios guarden información.
8. Verifica las operaciones CRUD del administrador.
9. Confirma que los datos permanecen después de reiniciar el servidor.
10. Revisa que no existan errores importantes en el proyecto.

No des por completada una funcionalidad sin comprobarla.

8. INSTRUCCIÓN PRINCIPAL
No vuelvas a desarrollar todo desde cero.

Ya te envié prompts anteriores con instrucciones detalladas y has realizado avances importantes.

Este mensaje solamente agrega nuevas solicitudes y refuerza la revisión final.

Por lo tanto:
- Revisa el trabajo existente.
- Identifica lo que ya está terminado.
- Detecta lo que falta.
- Corrige los errores encontrados.
- Implementa únicamente las funcionalidades pendientes.
- Evita duplicar código, modelos, tablas o configuraciones.
- Conserva todos los datos y el diseño actual.
- No cambies innecesariamente el entorno Python que ya funciona.

Trabaja de manera autónoma dentro del proyecto existente.

Al finalizar, entrégame un resumen claro de las modificaciones realizadas, las pruebas que pasaron, las tablas verificadas y cualquier problema pendiente. También indícame dónde quedó guardado el anexo de IA.

Mi objetivo es que Blush & Glow quede correctamente terminado, funcional y ajustado a los requisitos de la Evaluación 2 de Programación Back End de INACAP, aprovechando todo el trabajo que ya realizamos.
```

## Referencias

Django Software Foundation. (s. f.). *The Django admin site* (documentación de Django 5.1). https://docs.djangoproject.com/en/5.1/ref/contrib/admin/

Django Software Foundation. (s. f.). *Using the Django authentication system* (documentación de Django 5.1). https://docs.djangoproject.com/en/5.1/topics/auth/default/

Django Software Foundation. (s. f.). *Models* (documentación de Django 5.1). https://docs.djangoproject.com/en/5.1/topics/db/models/

Django Software Foundation. (s. f.). *Database transactions* (documentación de Django 5.1). https://docs.djangoproject.com/en/5.1/topics/db/transactions/

Django Software Foundation. (s. f.). *How to use sessions* (documentación de Django 5.1). https://docs.djangoproject.com/en/5.1/topics/http/sessions/

Django Software Foundation. (s. f.). *Migrations* (documentación de Django 5.1). https://docs.djangoproject.com/en/5.1/topics/migrations/

Django Software Foundation. (s. f.). *Databases* (documentación de Django 5.1). https://docs.djangoproject.com/en/5.1/ref/databases/

Django Software Foundation. (s. f.). *Writing and running tests* (documentación de Django 5.1). https://docs.djangoproject.com/en/5.1/topics/testing/overview/

## Evidencias

- `ia_consultas.txt`: consultas A–E y registro histórico de la primera etapa React.
- Transcript de Copilot: ubicación local bajo `AppData\Roaming\Code\User\workspaceStorage\...\GitHub.copilot-chat\transcripts`; puede contener mensajes personales y no se incluye en Git.
- No se generaron capturas ni se agregan como evidencia.
