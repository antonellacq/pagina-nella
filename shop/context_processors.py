def contexto_carrito(request):
    carrito = request.session.get('carrito', {})
    cantidad = sum(int(item.get('cantidad', 0)) for item in carrito.values())
    return {'carrito_cantidad': cantidad}
