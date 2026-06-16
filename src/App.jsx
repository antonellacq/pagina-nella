import { useState } from 'react';
import './estilo1.css';
import Carousel from './components/Carousel';
import RegisterForm from './components/RegisterForm';
import LoginForm from './components/LoginForm';
import ContactForm from './components/ContactForm';

const PRODUCTS = [
  { id: 1, name: 'Labiales Premium', price: 24.99, img: '/img/luxurious_lipsticks_1778612236329.png', emoji: '💄', desc: 'Colores vibrantes y duraderos' },
  { id: 2, name: 'Paleta de Sombras', price: 34.99, img: '/img/premium_makeup_palette_1778612222439.png', emoji: '✨', desc: '18 colores variados' },
  { id: 3, name: 'Base de Maquillaje', price: 29.99, img: '/img/glowing_foundation_1778612251107.png', emoji: '🧴', desc: 'Acabado luminoso natural' }
];

const SHIPPING_COST = 5.00;

// Client-side sanitization helper to prevent XSS
const sanitizeText = (text) => {
  if (typeof text !== 'string') return '';
  return text
    .trim()
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

function App() {
  // Global User Management State
  const [registeredUsers, setRegisteredUsers] = useState([
    { id: 1, username: 'camila', email: 'camila@gmail.com', password: 'Password123!' }
  ]);
  const [currentUser, setCurrentUser] = useState(null);

  // Cart and Order Checkout State
  const [cart, setCart] = useState([]);
  const [orderNumber, setOrderNumber] = useState('');
  const [notification, setNotification] = useState('');

  // Modals Visibility State
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [currentAuth, setCurrentAuth] = useState('register'); // 'register' or 'login'
  const [cartModalOpen, setCartModalOpen] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [successModalOpen, setSuccessModalOpen] = useState(false);

  // Payment Form Controlled State
  const [paymentName, setPaymentName] = useState('');
  const [paymentEmail, setPaymentEmail] = useState('');
  const [paymentPhone, setPaymentPhone] = useState('');
  const [paymentStreet, setPaymentStreet] = useState('');
  const [paymentCity, setPaymentCity] = useState('');
  const [paymentZip, setPaymentZip] = useState('');
  const [paymentCountry, setPaymentCountry] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('credit');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardHolder, setCardHolder] = useState('');

  // Notifications
  const triggerNotification = (msg) => {
    setNotification(msg);
    setTimeout(() => {
      setNotification('');
    }, 3000);
  };

  // Carousel Image change callback to demonstrate props functionality
  const handleCambioImagen = (index) => {
    console.log(`[Carousel] Imagen cambiada al índice: ${index}`);
  };

  // Registration callback
  const handleRegister = (newUser) => {
    const nextId = registeredUsers.length > 0 ? Math.max(...registeredUsers.map(u => u.id)) + 1 : 1;
    const userWithId = { id: nextId, ...newUser };
    setRegisteredUsers([...registeredUsers, userWithId]);
    triggerNotification(`Usuario ${newUser.username} registrado con éxito.`);
    setCurrentAuth('login'); // Switch to login form
  };

  // Login callback
  const handleLogin = (user) => {
    setCurrentUser(user);
    setAuthModalOpen(false);
    triggerNotification(`¡Bienvenida, ${user.username}! Sesión iniciada.`);
  };

  // Contact form callback
  const handleContactSubmit = (contactData) => {
    console.log('[Contacto] Mensaje Recibido:', contactData);
    triggerNotification(`Mensaje de ${contactData.name} enviado correctamente.`);
  };

  // Cart actions
  const addToCart = (product) => {
    const existing = cart.find(item => item.id === product.id);
    if (existing) {
      setCart(cart.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item));
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
    triggerNotification(`${product.name} agregado al carrito`);
  };

  const updateQuantity = (id, newQty) => {
    if (newQty < 1) return;
    setCart(cart.map(item => item.id === id ? { ...item, quantity: newQty } : item));
  };

  const removeFromCart = (id) => {
    setCart(cart.filter(item => item.id !== id));
    triggerNotification('Producto eliminado del carrito');
  };

  // Cart Calculations
  const cartSubtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const cartTotal = cart.length > 0 ? cartSubtotal + SHIPPING_COST : 0;
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Modal navigation
  const openAuthModal = () => {
    setAuthModalOpen(true);
    setCurrentAuth('register');
  };

  const closeAuthModal = () => setAuthModalOpen(false);

  const openCart = () => setCartModalOpen(true);
  const closeCart = () => setCartModalOpen(false);

  const goToPayment = () => {
    if (cart.length === 0) {
      alert('Tu carrito está vacío');
      return;
    }
    setCartModalOpen(false);
    setPaymentModalOpen(true);
  };

  const closePayment = () => setPaymentModalOpen(false);

  // Process Payment
  const handlePaymentSubmit = (e) => {
    e.preventDefault();

    // Sanitize input texts
    const cleanName = sanitizeText(paymentName);
    const cleanEmail = sanitizeText(paymentEmail);
    const cleanStreet = sanitizeText(paymentStreet);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!cleanName || !cleanEmail || !paymentPhone || !cleanStreet || !paymentCity || !paymentZip || !paymentCountry) {
      alert('Por favor, complete todos los datos personales y de envío obligatorios.');
      return;
    }

    if (!emailRegex.test(cleanEmail)) {
      alert('El correo electrónico de envío no tiene un formato válido.');
      return;
    }

    if ((paymentMethod === 'credit' || paymentMethod === 'debit')) {
      if (!cardNumber || !cardExpiry || !cardCvv || !cardHolder) {
        alert('Por favor, complete los datos de su tarjeta.');
        return;
      }
    }

    // Generate random order number
    const generatedOrderNum = 'BG-' + Date.now();
    setOrderNumber(generatedOrderNum);

    // Show Confirmation Modal
    setPaymentModalOpen(false);
    setSuccessModalOpen(true);
  };

  const completeOrder = () => {
    // Reset Cart & Payment Form states
    setCart([]);
    setSuccessModalOpen(false);
    setPaymentName('');
    setPaymentEmail('');
    setPaymentPhone('');
    setPaymentStreet('');
    setPaymentCity('');
    setPaymentZip('');
    setPaymentCountry('');
    setCardNumber('');
    setCardExpiry('');
    setCardCvv('');
    setCardHolder('');
    triggerNotification('¡Pedido procesado con éxito!');
  };

  const logout = () => {
    setCurrentUser(null);
    triggerNotification('Sesión cerrada.');
  };

  const scrollToProducts = () => {
    const element = document.getElementById('productos');
    if (element) element.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      {/* Header and Navbar */}
      <header>
        <nav>
          <div className="logo">💄 Blush & Glow</div>
          <ul className="nav-links">
            <li><a href="#inicio">Inicio</a></li>
            <li><a href="#galeria">Galería</a></li>
            <li><a href="#productos">Productos</a></li>
            <li><a href="#contacto">Contacto</a></li>
          </ul>
          <div className="nav-actions">
            {currentUser ? (
              <div className="user-logged">
                <span>Hola, {currentUser.username}</span>
                <button className="btn-account" style={{ marginLeft: '10px' }} onClick={logout}>Salir</button>
              </div>
            ) : (
              <button className="btn-account" onClick={openAuthModal}>Cuenta</button>
            )}
            
            <button 
              className="cart-icon" 
              onClick={openCart}
              type="button"
              style={{ background: 'none', border: 'none', font: 'inherit' }}
            >
              🛒 <span className="cart-count">{cartCount}</span>
            </button>
          </div>
        </nav>
      </header>

      {/* Main Content Area */}
      <main>
        {/* Hero Section */}
        <section className="hero" id="inicio">
          <h1>Realza tu Belleza Natural</h1>
          <p>Maquillaje premium de la mejor calidad para ti</p>
          <button className="btn" onClick={scrollToProducts} type="button">Comprar Ahora</button>
        </section>

        {/* Carousel Section */}
        <Carousel handleCambioImagen={handleCambioImagen} />

        {/* Products Section */}
        <section className="products" id="productos">
          <h2>Nuestros Productos Premium</h2>
          <div className="products-grid">
            {PRODUCTS.map(product => (
              <article className="product-card" key={product.id}>
                <div className="product-image" role="img" aria-label={product.name}>
                  {product.emoji}
                </div>
                <div className="product-info">
                  <h3 className="product-name">{product.name}</h3>
                  <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '0.5rem' }}>{product.desc}</p>
                  <p className="product-price">${product.price.toFixed(2)}</p>
                  <button 
                    onClick={() => addToCart(product)}
                    type="button"
                  >
                    Añadir al Carrito
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Contact Section */}
        <section className="contact-section" id="contacto">
          <h2>Contáctanos</h2>
          <div className="contact-content">
            <div className="contact-info">
              <h3>Información de Contacto</h3>
              <p><strong>Email:</strong> info@brushglow.com</p>
              <p><strong>Teléfono:</strong> +56 9 1234 5678</p>
              <p><strong>Horario:</strong> Lunes a Viernes 9:00 - 18:00</p>
              <div className="social-links">
                <p>Síguenos en:</p>
                <a href="#instagram">Instagram</a> | <a href="#facebook">Facebook</a>
              </div>
            </div>
            {/* Reusable Controlled Secure Contact Form */}
            <ContactForm onContactSubmit={handleContactSubmit} />
          </div>
        </section>
      </main>

      {/* Footer Area */}
      <footer>
        <p>&copy; 2026 Blush & Glow. Todos los derechos reservados.</p>
        <p>Desarrollado en React con estándares de desarrollo seguro.</p>
        <div style={{ marginTop: '1rem', fontSize: '0.95rem', opacity: 0.9, lineHeight: '1.6' }}>
          <p><strong>Profesor:</strong> Víctor Vásquez</p>
          <p><strong>Alumna:</strong> Antonella catalán</p>
          <p><strong>Sección:</strong> 2026/O TI3031/D-FB50-N3-P13-C1/D La Granja FB5</p>
        </div>
      </footer>

      {/* Auth Modal (Register & Login) */}
      {authModalOpen && (
        <div id="authModal" className="modal" style={{ display: 'block' }} onClick={closeAuthModal}>
          <div className="modal-content auth-modal" onClick={(e) => e.stopPropagation()}>
            <span className="close" onClick={closeAuthModal}>&times;</span>
            <div className="auth-menu">
              <button 
                className={`auth-tab ${currentAuth === 'register' ? 'active' : ''}`}
                onClick={() => setCurrentAuth('register')}
                type="button"
              >
                Registro
              </button>
              <button 
                className={`auth-tab ${currentAuth === 'login' ? 'active' : ''}`}
                onClick={() => setCurrentAuth('login')}
                type="button"
              >
                Iniciar Sesión
              </button>
            </div>
            
            {currentAuth === 'register' ? (
              <RegisterForm onRegister={handleRegister} />
            ) : (
              <LoginForm registeredUsers={registeredUsers} onLogin={handleLogin} />
            )}
          </div>
        </div>
      )}

      {/* Shopping Cart Modal */}
      {cartModalOpen && (
        <div id="cartModal" className="modal" style={{ display: 'block' }} onClick={closeCart}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <span className="close" onClick={closeCart}>&times;</span>
            <h2>Mi Carrito</h2>
            <div className="cart-items">
              {cart.length === 0 ? (
                <p className="empty-cart">Tu carrito está vacío</p>
              ) : (
                cart.map(item => (
                  <div className="cart-item" key={item.id}>
                    <div className="item-details">
                      <span className="item-emoji">{item.emoji}</span>
                      <div>
                        <p className="item-name">{item.name}</p>
                        <p className="item-price">${item.price.toFixed(2)}</p>
                      </div>
                    </div>
                    <div className="item-quantity">
                      <button onClick={() => updateQuantity(item.id, item.quantity - 1)} type="button">-</button>
                      <span>{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.quantity + 1)} type="button">+</button>
                    </div>
                    <div className="item-total">
                      ${(item.price * item.quantity).toFixed(2)}
                    </div>
                    <button className="btn-remove" onClick={() => removeFromCart(item.id)} type="button">🗑️</button>
                  </div>
                ))
              )}
            </div>

            {cart.length > 0 && (
              <div className="cart-summary">
                <p>Subtotal: <span>${cartSubtotal.toFixed(2)}</span></p>
                <p>Envío: <span>${SHIPPING_COST.toFixed(2)}</span></p>
                <hr />
                <p className="total">Total: <span>${cartTotal.toFixed(2)}</span></p>
              </div>
            )}

            {cart.length > 0 ? (
              <button className="btn btn-checkout" onClick={goToPayment} type="button">Ir a Pago</button>
            ) : null}
            <button className="btn btn-secondary" onClick={closeCart} type="button">Continuar Comprando</button>
          </div>
        </div>
      )}

      {/* Checkout Payment Modal */}
      {paymentModalOpen && (
        <div id="paymentModal" className="modal" style={{ display: 'block' }} onClick={closePayment}>
          <div className="modal-content payment-form" onClick={(e) => e.stopPropagation()}>
            <span className="close" onClick={closePayment}>&times;</span>
            <h2>Información de Pago</h2>
            
            <form onSubmit={handlePaymentSubmit}>
              <div className="form-section">
                <h3>Datos Personales</h3>
                <div className="form-field">
                  <label htmlFor="payName">Nombre Completo</label>
                  <input 
                    type="text" 
                    id="payName"
                    value={paymentName}
                    onChange={(e) => setPaymentName(e.target.value)}
                    placeholder="Escriba su nombre completo" 
                    required 
                  />
                </div>
                <div className="form-field">
                  <label htmlFor="payEmail">Correo Electrónico</label>
                  <input 
                    type="email" 
                    id="payEmail"
                    value={paymentEmail}
                    onChange={(e) => setPaymentEmail(e.target.value)}
                    placeholder="correo@ejemplo.com" 
                    required 
                  />
                </div>
                <div className="form-field">
                  <label htmlFor="payPhone">Teléfono</label>
                  <input 
                    type="tel" 
                    id="payPhone"
                    value={paymentPhone}
                    onChange={(e) => setPaymentPhone(e.target.value)}
                    placeholder="+56 9 1234 5678" 
                    required 
                  />
                </div>
              </div>

              <div className="form-section">
                <h3>Dirección de Envío</h3>
                <div className="form-field">
                  <label htmlFor="payStreet">Calle y Número</label>
                  <input 
                    type="text" 
                    id="payStreet"
                    value={paymentStreet}
                    onChange={(e) => setPaymentStreet(e.target.value)}
                    placeholder="Av. Principal 123" 
                    required 
                  />
                </div>
                <div className="form-row">
                  <div className="form-field">
                    <label htmlFor="payCity">Ciudad</label>
                    <input 
                      type="text" 
                      id="payCity"
                      value={paymentCity}
                      onChange={(e) => setPaymentCity(e.target.value)}
                      placeholder="Santiago" 
                      required 
                    />
                  </div>
                  <div className="form-field">
                    <label htmlFor="payZip">Código Postal</label>
                    <input 
                      type="text" 
                      id="payZip"
                      value={paymentZip}
                      onChange={(e) => setPaymentZip(e.target.value)}
                      placeholder="8320000" 
                      required 
                    />
                  </div>
                </div>
                <div className="form-field">
                  <label htmlFor="payCountry">País</label>
                  <input 
                    type="text" 
                    id="payCountry"
                    value={paymentCountry}
                    onChange={(e) => setPaymentCountry(e.target.value)}
                    placeholder="Chile" 
                    required 
                  />
                </div>
              </div>

              <div className="form-section">
                <h3>Método de Pago</h3>
                <div className="payment-methods">
                  <label>
                    <input 
                      type="radio" 
                      name="payment" 
                      value="credit" 
                      checked={paymentMethod === 'credit'} 
                      onChange={() => setPaymentMethod('credit')}
                    /> 
                    Tarjeta de Crédito
                  </label>
                  <label>
                    <input 
                      type="radio" 
                      name="payment" 
                      value="debit"
                      checked={paymentMethod === 'debit'} 
                      onChange={() => setPaymentMethod('debit')}
                    /> 
                    Tarjeta de Débito
                  </label>
                  <label>
                    <input 
                      type="radio" 
                      name="payment" 
                      value="transfer"
                      checked={paymentMethod === 'transfer'} 
                      onChange={() => setPaymentMethod('transfer')}
                    /> 
                    Transferencia Bancaria
                  </label>
                </div>

                {(paymentMethod === 'credit' || paymentMethod === 'debit') && (
                  <div id="cardDetails" style={{ marginTop: '1.5rem' }}>
                    <div className="form-field">
                      <label htmlFor="payCardNum">Número de Tarjeta</label>
                      <input 
                        type="text" 
                        id="payCardNum"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        placeholder="1234567812345678" 
                        maxLength="16" 
                        required 
                      />
                    </div>
                    <div className="form-row">
                      <div className="form-field">
                        <label htmlFor="payExpiry">Vencimiento (MM/AA)</label>
                        <input 
                          type="text" 
                          id="payExpiry"
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value)}
                          placeholder="12/28" 
                          maxLength="5" 
                          required 
                        />
                      </div>
                      <div className="form-field">
                        <label htmlFor="payCvv">CVV</label>
                        <input 
                          type="password" 
                          id="payCvv"
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value)}
                          placeholder="123" 
                          maxLength="3" 
                          required 
                        />
                      </div>
                    </div>
                    <div className="form-field">
                      <label htmlFor="payCardHolder">Titular de la Tarjeta</label>
                      <input 
                        type="text" 
                        id="payCardHolder"
                        value={cardHolder}
                        onChange={(e) => setCardHolder(e.target.value)}
                        placeholder="Nombre Completo Titular" 
                        required 
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="order-summary">
                <h3>Resumen del Pedido</h3>
                <p>Subtotal: <span>${cartSubtotal.toFixed(2)}</span></p>
                <p>Envío: <span>${SHIPPING_COST.toFixed(2)}</span></p>
                <hr />
                <p className="total">Total: <span>${cartTotal.toFixed(2)}</span></p>
              </div>

              <button type="submit" className="btn btn-payment">Completar Pago</button>
              <button type="button" className="btn btn-secondary" onClick={closePayment}>Cancelar</button>
            </form>
          </div>
        </div>
      )}

      {/* Success Order Confirmation Modal */}
      {successModalOpen && (
        <div id="successModal" className="modal" style={{ display: 'block' }}>
          <div className="modal-content success-modal">
            <div className="success-icon">✓</div>
            <h2>¡Pedido Confirmado!</h2>
            <p>Gracias por tu compra. Recibirás un email con los detalles de seguimiento.</p>
            <div className="order-number">
              Número de Pedido: <strong>{orderNumber}</strong>
            </div>
            <button className="btn" onClick={completeOrder} type="button">Aceptar</button>
          </div>
        </div>
      )}

      {/* Notification Toast overlay */}
      {notification && (
        <div className="notification">
          {notification}
        </div>
      )}
    </>
  );
}

export default App;
