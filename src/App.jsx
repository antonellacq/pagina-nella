import { useState } from 'react'
import './estilo1.css'

function App() {
  const [cartCount, setCartCount] = useState(0)
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [currentAuth, setCurrentAuth] = useState('register')

  const openAuthModal = () => setAuthModalOpen(true)
  const closeAuthModal = () => setAuthModalOpen(false)
  const showAuthForm = (form) => setCurrentAuth(form)
  const openCart = () => alert(`Carrito: ${cartCount} productos`)
  const scrollToProducts = () => {
    const element = document.getElementById('productos')
    if (element) element.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <>
      {/* Navbar */}
      <nav>
        <div className="logo">💄 Blush & Glow</div>
        <ul className="nav-links">
          <li><a href="#inicio">Inicio</a></li>
          <li><a href="#productos">Productos</a></li>
          <li><a href="#contacto">Contacto</a></li>
        </ul>
        <div className="nav-actions">
          <button className="btn-account" onClick={openAuthModal}>Cuenta</button>
          <div className="cart-icon" onClick={openCart}>
            🛒 <span className="cart-count">{cartCount}</span>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero" id="inicio">
        <h1>Realza tu Belleza Natural</h1>
        <p>Maquillaje premium de la mejor calidad para ti</p>
        <button className="btn" onClick={scrollToProducts}>Comprar Ahora</button>
      </section>

      {/* Auth Modal */}
      {authModalOpen && (
        <div id="authModal" className="modal" onClick={closeAuthModal}>
          <div className="modal-content auth-modal" onClick={(e) => e.stopPropagation()}>
            <span className="close" onClick={closeAuthModal}>&times;</span>
            <div className="auth-menu">
              <button 
                className={`auth-tab ${currentAuth === 'register' ? 'active' : ''}`}
                onClick={() => showAuthForm('register')}
              >
                Registro
              </button>
              <button 
                className={`auth-tab ${currentAuth === 'login' ? 'active' : ''}`}
                onClick={() => showAuthForm('login')}
              >
                Iniciar Sesión
              </button>
            </div>
            <div id="authForms">
              {currentAuth === 'register' ? (
                <div className="auth-form active">
                  <h3>Registro</h3>
                  <form>
                    <div className="form-field">
                      <label>Usuario</label>
                      <input type="text" placeholder="Nombre de usuario" />
                    </div>
                    <div className="form-field">
                      <label>Email</label>
                      <input type="email" placeholder="usuario@ejemplo.com" />
                    </div>
                    <div className="form-field">
                      <label>Contraseña</label>
                      <input type="password" placeholder="Mínimo 8 caracteres" />
                    </div>
                    <button type="submit" className="btn">Registrarse</button>
                  </form>
                </div>
              ) : (
                <div className="auth-form active">
                  <h3>Iniciar Sesión</h3>
                  <form>
                    <div className="form-field">
                      <label>Email</label>
                      <input type="email" placeholder="usuario@ejemplo.com" />
                    </div>
                    <div className="form-field">
                      <label>Contraseña</label>
                      <input type="password" placeholder="Tu contraseña" />
                    </div>
                    <button type="submit" className="btn">Iniciar Sesión</button>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Products Section */}
      <section className="productos" id="productos">
        <h2>Nuestros Productos Premium</h2>
        <div className="producto-grid">
          <div className="producto-card">
            <img src="/img/luxurious_lipsticks_1778612236329.png" alt="Labiales Premium" />
            <h3>Labiales Premium</h3>
            <p>Colores vibrantes y duraderos</p>
            <p className="precio">$24.99</p>
            <button className="btn-comprar" onClick={() => setCartCount(cartCount + 1)}>Añadir al Carrito</button>
          </div>
          <div className="producto-card">
            <img src="/img/premium_makeup_palette_1778612222439.png" alt="Paleta de Sombras" />
            <h3>Paleta de Sombras</h3>
            <p>18 colores variados</p>
            <p className="precio">$34.99</p>
            <button className="btn-comprar" onClick={() => setCartCount(cartCount + 1)}>Añadir al Carrito</button>
          </div>
          <div className="producto-card">
            <img src="/img/glowing_foundation_1778612251107.png" alt="Base de Maquillaje" />
            <h3>Base de Maquillaje</h3>
            <p>Acabado luminoso natural</p>
            <p className="precio">$29.99</p>
            <button className="btn-comprar" onClick={() => setCartCount(cartCount + 1)}>Añadir al Carrito</button>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="contacto" id="contacto">
        <h2>Contacto</h2>
        <p>¿Preguntas? Escríbenos aquí</p>
        <form>
          <input type="text" placeholder="Tu nombre" required />
          <input type="email" placeholder="Tu email" required />
          <textarea placeholder="Tu mensaje" rows="5" required></textarea>
          <button type="submit" className="btn">Enviar Mensaje</button>
        </form>
      </section>

      {/* Footer */}
      <footer>
        <p>&copy; 2026 Blush & Glow - Todos los derechos reservados</p>
      </footer>
    </>
  )
}

export default App
