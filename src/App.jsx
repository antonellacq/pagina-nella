import { useState, useEffect } from 'react';
import './estilo1.css';
import Carousel from './components/Carousel';
import RegisterForm from './components/RegisterForm';
import LoginForm from './components/LoginForm';
import ContactForm from './components/ContactForm';
import ProductForm from './components/ProductForm';

// Dynamic Exchange Rate for Chilean Pesos
const USD_TO_CLP_RATE = 950;
const SHIPPING_COST = 5.00; // in USD

// List of popular makeup brands supported by Makeup API
const POPULAR_BRANDS = [
  { id: 'maybelline', name: 'Maybelline' },
  { id: 'l\'oreal', name: "L'Oréal" },
  { id: 'nyx', name: 'NYX' },
  { id: 'covergirl', name: 'Covergirl' },
  { id: 'colourpop', name: 'Colourpop' },
  { id: 'clinique', name: 'Clinique' },
  { id: 'mac', name: 'MAC' }
];

// Quick categories filter
const CATEGORIES = [
  { id: 'all', name: 'Todos' },
  { id: 'lipstick', name: 'Labiales' },
  { id: 'eyeshadow', name: 'Sombras' },
  { id: 'foundation', name: 'Bases' },
  { id: 'blush', name: 'Rubores' },
  { id: 'mascara', name: 'Máscaras' },
  { id: 'eyeliner', name: 'Delineadores' }
];

// Fallback high-quality catalog if API is offline
const FALLBACK_PRODUCTS = [
  {
    id: 1001,
    name: 'Luxurious Matte Lipstick',
    brand: 'Blush & Glow',
    price: 18.99,
    image_link: '',
    description: 'Labiales mate de alta duración en una variedad de colores cálidos y hermosos con hidratación profunda.',
    product_type: 'lipstick',
    rating: 4.8,
    product_colors: [
      { hex_value: '#B85C77', colour_name: 'Rose Gold' },
      { hex_value: '#A13D56', colour_name: 'Deep Berry' },
      { hex_value: '#D87A80', colour_name: 'Soft Pink' },
      { hex_value: '#C84B31', colour_name: 'Classic Red' }
    ]
  },
  {
    id: 1002,
    name: 'Professional Eyeshadow Palette',
    brand: 'Blush & Glow',
    price: 34.50,
    image_link: '',
    description: 'Paleta con 18 sombras altamente pigmentadas. Acabados mate y satinado para todo tipo de looks.',
    product_type: 'eyeshadow',
    rating: 4.9,
    product_colors: [
      { hex_value: '#D4AF37', colour_name: 'Gold Glow' },
      { hex_value: '#C5A880', colour_name: 'Champagne Satin' },
      { hex_value: '#8B5A2B', colour_name: 'Bronze Matte' }
    ]
  },
  {
    id: 1003,
    name: 'Liquid Foundation Glow',
    brand: 'Blush & Glow',
    price: 28.00,
    image_link: '',
    description: 'Base de maquillaje de cobertura media que hidrata tu piel dándole un acabado fresco, natural y ultra luminoso.',
    product_type: 'foundation',
    rating: 4.7,
    product_colors: [
      { hex_value: '#F6E6D8', colour_name: 'Light Porcelain' },
      { hex_value: '#E8CBB5', colour_name: 'Warm Beige' },
      { hex_value: '#D0A384', colour_name: 'Golden Sand' }
    ]
  },
  {
    id: 1004,
    name: 'Velvet Silk Blush',
    brand: 'Blush & Glow',
    price: 15.99,
    image_link: '',
    description: 'Rubor sedoso en polvo que se difumina perfectamente aportando un toque de color natural y saludable a tus mejillas.',
    product_type: 'blush',
    rating: 4.6,
    product_colors: [
      { hex_value: '#E09C9C', colour_name: 'Peach Nude' },
      { hex_value: '#D38383', colour_name: 'Rosy Pink' }
    ]
  },
  {
    id: 1005,
    name: 'Ultimate Volume Mascara',
    brand: 'Blush & Glow',
    price: 12.50,
    image_link: '',
    description: 'Máscara de pestañas con cepillo de silicona que alarga y define para pestañas dramáticas e intensas de larga duración.',
    product_type: 'mascara',
    rating: 4.8,
    product_colors: [
      { hex_value: '#000000', colour_name: 'Pitch Black' }
    ]
  },
  {
    id: 1006,
    name: 'Precision Waterproof Eyeliner',
    brand: 'Blush & Glow',
    price: 10.99,
    image_link: '',
    description: 'Delineador líquido con punta ultrafina de alta precisión. Secado rápido y fórmula resistente al agua.',
    product_type: 'eyeliner',
    rating: 4.5,
    product_colors: [
      { hex_value: '#000000', colour_name: 'Midnight Black' },
      { hex_value: '#3D2314', colour_name: 'Dark Cocoa' }
    ]
  }
];

// Helper to determine realistic market prices if API values are extreme or missing
const getNormalMarketPrice = (product) => {
  let price = parseFloat(product.price);
  if (isNaN(price) || price <= 0) {
    switch (product.product_type) {
      case 'lipstick': price = 14.99; break;
      case 'eyeshadow': price = 24.99; break;
      case 'foundation': price = 22.99; break;
      case 'blush': price = 16.99; break;
      case 'mascara': price = 12.99; break;
      case 'eyeliner': price = 11.99; break;
      default: price = 15.00;
    }
  } else {
    // If the price is too low, scale it to reflect premium brand values
    if (price < 4.00) {
      price = price * 3.5;
    } else if (price < 8.00) {
      price = price * 1.8;
    }
  }
  return parseFloat(price.toFixed(2));
};

// Client-side sanitization helper to prevent XSS (preserved)
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
  const [registeredUsers, setRegisteredUsers] = useState(() => {
    try {
      const stored = localStorage.getItem('bg_users');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const hasAdmin = parsed.some(u => u.username === 'antonella_30');
          if (!hasAdmin) {
            parsed.push({ id: 2, username: 'antonella_30', email: 'admin@brushglow.com', password: '@Antonella2004', role: 'admin' });
          }
          return parsed;
        }
      }
    } catch (e) {
      console.error("Error reading users from localStorage:", e);
    }
    return [
      { id: 1, username: 'camila', email: 'camila@gmail.com', password: 'Password123!', role: 'client' },
      { id: 2, username: 'antonella_30', email: 'admin@brushglow.com', password: '@Antonella2004', role: 'admin' }
    ];
  });

  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const stored = localStorage.getItem('bg_current_user');
      return stored ? JSON.parse(stored) : null;
    } catch (e) {
      return null;
    }
  });

  // Sync users to localStorage
  useEffect(() => {
    localStorage.setItem('bg_users', JSON.stringify(registeredUsers));
  }, [registeredUsers]);

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

  // --- External API and Shop States ---
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState(null);
  const [selectedBrand, setSelectedBrand] = useState('maybelline');
  
  // Interactive Shop Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('relevance');
  const [selectedColors, setSelectedColors] = useState({}); // mapped by product ID

  // SPA Navigation and CRUD modal states
  const [currentView, setCurrentView] = useState('shop'); // 'shop' or 'inventory'
  const [crudModalOpen, setCrudModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState(null);

  // Initialize products list from LocalStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('bg_products');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setProducts(parsed);
          setLoading(false);
          return;
        }
      }
    } catch (e) {
      console.error("Error al cargar localStorage:", e);
    }
  }, []);

  // Fetch from public API and merge new brands safely
  useEffect(() => {
    let isMounted = true;
    
    // Check if brand is already loaded in the list to avoid duplicate requests
    const brandAlreadyLoaded = products.some(
      p => p.brand.toLowerCase() === selectedBrand.toLowerCase()
    );

    if (products.length > 0 && brandAlreadyLoaded) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setApiError(null);

    const fetchMakeup = async () => {
      try {
        const response = await fetch(`https://makeup-api.herokuapp.com/api/v1/products.json?brand=${selectedBrand}`);
        if (!response.ok) {
          throw new Error(`Servidor de API respondió con error HTTP: ${response.status}`);
        }
        const data = await response.json();
        
        if (!Array.isArray(data)) {
          throw new Error('La respuesta de la API no contiene una lista válida');
        }

        // Map and clean products from API
        const cleaned = data.map(item => {
          const mktPrice = getNormalMarketPrice(item);
          return {
            id: item.id,
            name: item.name,
            brand: item.brand || selectedBrand,
            price: mktPrice,
            image_link: item.image_link,
            description: item.description || 'Sin descripción disponible.',
            product_type: item.product_type || 'other',
            rating: item.rating ? parseFloat(item.rating) : parseFloat((4.1 + Math.random() * 0.8).toFixed(1)),
            product_colors: item.product_colors || []
          };
        });

        if (isMounted) {
          setProducts(prev => {
            const existingIds = new Set(prev.map(p => p.id));
            const newProducts = cleaned.filter(p => !existingIds.has(p.id));
            const merged = [...prev, ...newProducts];
            localStorage.setItem('bg_products', JSON.stringify(merged));
            return merged;
          });
          setLoading(false);
        }
      } catch (err) {
        console.warn('API error, loading fallback list:', err);
        if (isMounted) {
          setProducts(prev => {
            if (prev.length === 0) {
              localStorage.setItem('bg_products', JSON.stringify(FALLBACK_PRODUCTS));
              return FALLBACK_PRODUCTS;
            }
            return prev;
          });
          setApiError('Mostrando catálogo local de Blush & Glow por desconexión de la API.');
          setLoading(false);
        }
      }
    };

    fetchMakeup();

    return () => {
      isMounted = false;
    };
  }, [selectedBrand, products.length]);

  // Notifications
  const triggerNotification = (msg) => {
    setNotification(msg);
    setTimeout(() => {
      setNotification('');
    }, 3500);
  };

  // Carousel Image change callback (preserved)
  const handleCambioImagen = (index) => {
    console.log(`[Carousel] Imagen cambiada al índice: ${index}`);
  };

  // Registration callback
  const handleRegister = (newUser) => {
    const nextId = registeredUsers.length > 0 ? Math.max(...registeredUsers.map(u => u.id)) + 1 : 1;
    const userWithId = { id: nextId, ...newUser, role: 'client' };
    setRegisteredUsers([...registeredUsers, userWithId]);
    triggerNotification(`Usuario ${newUser.username} registrado con éxito.`);
    setCurrentAuth('login'); // Switch to login form
  };

  // Login callback
  const handleLogin = (user) => {
    setCurrentUser(user);
    localStorage.setItem('bg_current_user', JSON.stringify(user));
    setAuthModalOpen(false);
    triggerNotification(`¡Bienvenida, ${user.username}! Sesión iniciada.`);
  };

  // Contact form callback
  const handleContactSubmit = (contactData) => {
    console.log('[Contacto] Mensaje Recibido:', contactData);
    triggerNotification(`Mensaje de ${contactData.name} enviado correctamente.`);
  };

  // Format price helper (USD to CLP)
  const formatCLP = (usdPrice) => {
    const clpPrice = Math.round(usdPrice * USD_TO_CLP_RATE);
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      maximumFractionDigits: 0
    }).format(clpPrice);
  };

  // Cart actions with selected color support
  const addToCart = (product) => {
    const chosenColor = selectedColors[product.id] || (product.product_colors && product.product_colors.length > 0 ? product.product_colors[0] : null);
    
    // Create unique key based on product ID and selected color
    const cartItemId = chosenColor ? `${product.id}-${chosenColor.hex_value.replace('#', '')}` : `${product.id}`;
    
    const existing = cart.find(item => item.cartItemId === cartItemId);
    
    if (existing) {
      setCart(cart.map(item => item.cartItemId === cartItemId ? { ...item, quantity: item.quantity + 1 } : item));
    } else {
      setCart([...cart, {
        ...product,
        cartItemId,
        selectedColor: chosenColor,
        quantity: 1
      }]);
    }
    triggerNotification(`${product.name} ${chosenColor ? `(${chosenColor.colour_name || 'Color'})` : ''} agregado al carrito`);
  };

  const updateQuantity = (cartItemId, newQty) => {
    if (newQty < 1) return;
    setCart(cart.map(item => item.cartItemId === cartItemId ? { ...item, quantity: newQty } : item));
  };

  const removeFromCart = (cartItemId) => {
    setCart(cart.filter(item => item.cartItemId !== cartItemId));
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
    localStorage.removeItem('bg_current_user');
    setCurrentView('shop');
    triggerNotification('Sesión cerrada.');
  };

  const scrollToProducts = () => {
    const element = document.getElementById('productos');
    if (element) element.scrollIntoView({ behavior: 'smooth' });
  };

  // --- CRUD Inventory Operations ---
  const handleSaveProduct = (savedProduct) => {
    if (!currentUser || currentUser.role !== 'admin') {
      alert('Acceso denegado. Se requieren privilegios de administrador para realizar modificaciones.');
      return;
    }
    if (savedProduct.id) {
      // Update Mode
      const updated = products.map(p => p.id === savedProduct.id ? savedProduct : p);
      setProducts(updated);
      localStorage.setItem('bg_products', JSON.stringify(updated));
      triggerNotification(`Producto "${savedProduct.name}" actualizado con éxito.`);
    } else {
      // Create Mode
      const nextId = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 2001;
      const newProduct = { ...savedProduct, id: nextId };
      const updated = [newProduct, ...products];
      setProducts(updated);
      localStorage.setItem('bg_products', JSON.stringify(updated));
      triggerNotification(`Producto "${savedProduct.name}" creado con éxito.`);
    }
    setCrudModalOpen(false);
    setProductToEdit(null);
  };

  const handleEditProductClick = (product) => {
    if (!currentUser || currentUser.role !== 'admin') {
      alert('Acceso denegado. Se requieren privilegios de administrador.');
      return;
    }
    setProductToEdit(product);
    setCrudModalOpen(true);
  };

  const handleAddNewProductClick = () => {
    if (!currentUser || currentUser.role !== 'admin') {
      alert('Acceso denegado. Se requieren privilegios de administrador.');
      return;
    }
    setProductToEdit(null);
    setCrudModalOpen(true);
  };

  const handleDeleteProduct = (productId) => {
    if (!currentUser || currentUser.role !== 'admin') {
      alert('Acceso denegado. Se requieren privilegios de administrador para eliminar productos.');
      return;
    }
    const prod = products.find(p => p.id === productId);
    if (!prod) return;
    if (window.confirm(`¿Está seguro de que desea eliminar el producto "${prod.name}"?`)) {
      const updated = products.filter(p => p.id !== productId);
      setProducts(updated);
      localStorage.setItem('bg_products', JSON.stringify(updated));
      // Remove from cart if deleted from inventory
      setCart(prevCart => prevCart.filter(item => item.id !== productId));
      triggerNotification(`Producto "${prod.name}" eliminado.`);
    }
  };

  const handleResetCatalog = () => {
    if (!currentUser || currentUser.role !== 'admin') {
      alert('Acceso denegado. Se requieren privilegios de administrador para restablecer el catálogo.');
      return;
    }
    if (window.confirm('¿Desea restablecer el catálogo al estado inicial de la API y borrar los cambios locales?')) {
      localStorage.removeItem('bg_products');
      setProducts([]);
      setSelectedBrand('maybelline');
      triggerNotification('Catálogo restablecido al original de la API.');
    }
  };

  // Filter and Sort Logic
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          product.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.product_type === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'price-asc') return a.price - b.price;
    if (sortBy === 'price-desc') return b.price - a.price;
    if (sortBy === 'name-asc') return a.name.localeCompare(b.name);
    return b.rating - a.rating; // default: relevance
  });

  // Dynamic brand list combining popular ones and user-created ones
  const allAvailableBrands = [
    ...POPULAR_BRANDS,
    ...products
      .filter(p => p.brand && !POPULAR_BRANDS.some(b => b.id.toLowerCase() === p.brand.toLowerCase()))
      .map(p => ({ id: p.brand.toLowerCase(), name: p.brand.charAt(0).toUpperCase() + p.brand.slice(1) }))
      .filter((value, index, self) => self.findIndex(t => t.id === value.id) === index)
  ];

  return (
    <>
      {/* Header and Navbar */}
      <header>
        <nav>
          <div className="logo" onClick={scrollToProducts} style={{ cursor: 'pointer' }}>
            💄 Blush & Glow
          </div>
          <ul className="nav-links">
            <li><a href="#inicio" onClick={() => setCurrentView('shop')}>Inicio</a></li>
            <li><a href="#galeria" onClick={() => setCurrentView('shop')}>Galería</a></li>
            <li><a href="#productos" onClick={() => setCurrentView('shop')}>Productos</a></li>
            <li><a href="#contacto" onClick={() => setCurrentView('shop')}>Contacto</a></li>
            {currentUser && currentUser.role === 'admin' && (
              <li>
                <button 
                  className="nav-btn-view"
                  onClick={() => {
                    setCurrentView(currentView === 'shop' ? 'inventory' : 'shop');
                    if (currentView === 'inventory') {
                      setTimeout(scrollToProducts, 100);
                    }
                  }}
                  style={{
                    background: 'var(--primary-light, #fbeef1)',
                    color: 'var(--primary, #b85c77)',
                    border: 'none',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    transition: 'all 0.3s ease'
                  }}
                >
                  {currentView === 'shop' ? '⚙️ Inventario' : '🛍️ Tienda'}
                </button>
              </li>
            )}
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
              style={{ border: 'none' }}
              aria-label="Ver carrito"
            >
              🛒 <span className="cart-count">{cartCount}</span>
            </button>
          </div>
        </nav>
      </header>

      {/* Main Content Area */}
      <main>
        {currentView === 'shop' ? (
          <>
            {/* Hero Section */}
            <section className="hero" id="inicio">
              <h1>Realza tu Belleza Natural</h1>
              <p>Maquillaje premium importado de las mejores marcas del mercado. Calidad, estilo y elegancia para ti.</p>
              <button className="btn" onClick={scrollToProducts} type="button">Comprar Ahora</button>
            </section>

            {/* Carousel Section (Preserved) */}
            <Carousel handleCambioImagen={handleCambioImagen} />

            {/* Products Section with API connection and interactive controls */}
            <section className="products" id="productos">
              <h2>Nuestros Productos Premium</h2>
              <p className="products-subtitle">
                Conexión en tiempo real con catálogos internacionales de belleza. Selecciona marcas, categorías y colores para personalizar tu compra.
              </p>

              {/* Interactive Filters Bar */}
              <div className="filters-bar">
                {/* Search Box */}
                <div className="search-wrapper">
                  <svg className="search-icon-svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                  </svg>
                  <input 
                    type="text" 
                    className="search-input"
                    placeholder="Buscar maquillaje..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                {/* Selector de Marca (Conecta con API externa) */}
                <div className="filter-selects">
                  <div className="select-wrapper">
                    <select 
                      className="select-filter"
                      value={selectedBrand}
                      onChange={(e) => setSelectedBrand(e.target.value)}
                      aria-label="Seleccionar Marca"
                    >
                      {allAvailableBrands.map(brand => (
                        <option key={brand.id} value={brand.id}>{brand.name}</option>
                      ))}
                    </select>
                    <span className="select-arrow">▼</span>
                  </div>

                  {/* Ordenamiento */}
                  <div className="select-wrapper">
                    <select 
                      className="select-filter"
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      aria-label="Ordenar por"
                    >
                      <option value="relevance">Relevancia</option>
                      <option value="price-asc">Precio: Menor a Mayor</option>
                      <option value="price-desc">Precio: Mayor a Menor</option>
                      <option value="name-asc">Nombre: A-Z</option>
                    </select>
                    <span className="select-arrow">▼</span>
                  </div>
                </div>
              </div>

              {/* Category Filter Pills */}
              <div className="category-pills">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat.id}
                    className={`category-pill ${selectedCategory === cat.id ? 'active' : ''}`}
                    onClick={() => setSelectedCategory(cat.id)}
                    type="button"
                  >
                    {cat.name}
                  </button>
                ))}
              </div>

              {/* User notice if API fails and fallback is active */}
              {apiError && (
                <div className="api-error-container">
                  <h3>Modo Offline</h3>
                  <p>{apiError}</p>
                </div>
              )}

              {/* Loading state rendering premium skeletons */}
              {loading ? (
                <div className="products-grid">
                  {[1, 2, 3, 4, 5, 6].map(val => (
                    <div className="skeleton-card" key={val}>
                      <div className="skeleton-image"></div>
                      <div className="skeleton-info">
                        <div className="skeleton-title"></div>
                        <div className="skeleton-text"></div>
                        <div className="skeleton-price"></div>
                        <div className="skeleton-btn"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <>
                  {sortedProducts.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '3rem', color: '#6e6e6e', gridColumn: '1/-1' }}>
                      <p style={{ fontSize: '1.2rem', fontWeight: '500' }}>No encontramos productos con los filtros aplicados.</p>
                      <button 
                        className="btn" 
                        style={{ marginTop: '1rem' }} 
                        onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}
                        type="button"
                      >
                        Limpiar Filtros
                      </button>
                    </div>
                  ) : (
                    <div className="products-grid">
                      {sortedProducts.map(product => {
                        const colors = product.product_colors || [];
                        const activeColor = selectedColors[product.id] || (colors.length > 0 ? colors[0] : null);

                        return (
                          <article className="product-card" key={product.id}>
                            {/* Tags flotantes */}
                            <span className="product-brand-tag">{product.brand}</span>
                            <span className="product-rating">★ {product.rating}</span>

                            <div className="product-image-container">
                              {product.image_link ? (
                                <img 
                                  className="product-img-el" 
                                  src={product.image_link} 
                                  alt={product.name}
                                  loading="lazy"
                                  onError={(e) => {
                                    e.target.style.display = 'none';
                                    const parent = e.target.parentNode;
                                    if (!parent.querySelector('.product-image-fallback')) {
                                      const fallbackEl = document.createElement('span');
                                      fallbackEl.className = 'product-image-fallback';
                                      fallbackEl.innerText = product.product_type === 'lipstick' ? '💄' : '✨';
                                      parent.appendChild(fallbackEl);
                                    }
                                  }}
                                />
                              ) : (
                                <span className="product-image-fallback">
                                  {product.product_type === 'lipstick' ? '💄' : '✨'}
                                </span>
                              )}
                            </div>

                            <div className="product-info">
                              <span className="product-category-title">{product.product_type}</span>
                              <h3 className="product-name" title={product.name}>{product.name}</h3>
                              <p className="product-desc">{product.description}</p>
                              
                              {/* Color Circles Selector */}
                              <div className="color-dots-wrapper">
                                {colors.length > 0 ? (
                                  <ul className="color-dots">
                                    {colors.slice(0, 6).map((color, idx) => (
                                      <li 
                                        key={idx}
                                        className={`color-dot-option ${activeColor && activeColor.hex_value === color.hex_value ? 'active' : ''}`}
                                        style={{ backgroundColor: color.hex_value }}
                                        onClick={() => setSelectedColors(prev => ({ ...prev, [product.id]: color }))}
                                      >
                                        <span className="color-tooltip">{color.colour_name || color.hex_value}</span>
                                      </li>
                                    ))}
                                    {colors.length > 6 && (
                                      <li style={{ fontSize: '0.75rem', color: '#6e6e6e', alignSelf: 'center', fontWeight: 'bold' }}>
                                        +{colors.length - 6}
                                      </li>
                                    )}
                                  </ul>
                                ) : null}
                              </div>

                              <div className="product-price-row">
                                <span className="product-price">${product.price.toFixed(2)} USD</span>
                                <span className="product-price-clp">{formatCLP(product.price)} CLP</span>
                              </div>

                              <button 
                                onClick={() => addToCart(product)}
                                type="button"
                              >
                                Añadir al Carrito
                              </button>
                            </div>
                          </article>
                        );
                      })}
                    </div>
                  )}
                </>
              )}
            </section>

            {/* Contact Section */}
            <section className="contact-section" id="contacto">
              <h2>Contáctanos</h2>
              <div className="contact-content">
                <div className="contact-info">
                  <h3>Información de Contacto</h3>
                  <p>
                    <strong>Email de Soporte</strong>
                    <span>info@brushglow.com</span>
                  </p>
                  <p>
                    <strong>Teléfono</strong>
                    <span>+56 9 1234 5678</span>
                  </p>
                  <p>
                    <strong>Horario de Atención</strong>
                    <span>Lunes a Viernes 9:00 - 18:00</span>
                  </p>
                  <div className="social-links">
                    <p>Síguenos en Redes Sociales</p>
                    <a href="#instagram">Instagram</a> | <a href="#facebook">Facebook</a>
                  </div>
                </div>
                {/* Reusable Controlled Secure Contact Form */}
                <ContactForm onContactSubmit={handleContactSubmit} />
              </div>
            </section>
          </>
        ) : (
          /* Inventory CRUD View with Authorization Check */
          currentUser && currentUser.role === 'admin' ? (
            <section className="inventory-panel" id="inventario">
              <h2>Panel de Control de Inventario</h2>
              <p className="products-subtitle" style={{ textAlign: 'center', marginBottom: '2rem' }}>
                Administración de recursos de Blush & Glow. Crea, lee, actualiza y elimina registros persistidos localmente.
              </p>

              {/* KPI Cards */}
              <div className="kpi-grid">
                <article className="kpi-card">
                  <h3>Total de Productos</h3>
                  <p className="kpi-value">{products.length}</p>
                </article>
                <article className="kpi-card">
                  <h3>Valor Promedio</h3>
                  <p className="kpi-value">
                    ${(products.length > 0 ? (products.reduce((acc, p) => acc + p.price, 0) / products.length) : 0).toFixed(2)} USD
                  </p>
                </article>
                <article className="kpi-card">
                  <h3>Categorías Únicas</h3>
                  <p className="kpi-value">{new Set(products.map(p => p.product_type)).size}</p>
                </article>
              </div>

              {/* Controls Bar */}
              <div className="inventory-controls">
                <div className="search-wrapper" style={{ flex: '1', maxWidth: '400px' }}>
                  <svg className="search-icon-svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                  </svg>
                  <input 
                    type="text" 
                    className="search-input"
                    placeholder="Buscar en el inventario..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                <div className="inventory-actions">
                  <button className="btn-add" onClick={handleAddNewProductClick} type="button">
                    ➕ Añadir Producto
                  </button>
                  <button className="btn-reset-catalog" onClick={handleResetCatalog} type="button">
                    🔄 Restablecer Catálogo
                  </button>
                </div>
              </div>

              {/* Inventory Table */}
              <div className="table-responsive">
                <table className="inventory-table">
                  <thead>
                    <tr>
                      <th>Imagen</th>
                      <th>Nombre</th>
                      <th>Marca</th>
                      <th>Categoría</th>
                      <th>Precio (USD)</th>
                      <th>Precio (CLP)</th>
                      <th>Rating</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedProducts.length === 0 ? (
                      <tr>
                        <td colSpan="8" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                          No se encontraron productos en el inventario.
                        </td>
                      </tr>
                    ) : (
                      sortedProducts.map((product) => (
                        <tr key={product.id}>
                          <td>
                            {product.image_link ? (
                              <img 
                                className="table-img" 
                                src={product.image_link} 
                                alt={product.name} 
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  const parent = e.target.parentNode;
                                  if (!parent.querySelector('.table-emoji')) {
                                    const fallbackEl = document.createElement('span');
                                    fallbackEl.className = 'table-emoji';
                                    fallbackEl.innerText = product.product_type === 'lipstick' ? '💄' : '✨';
                                    parent.appendChild(fallbackEl);
                                  }
                                }}
                              />
                            ) : (
                              <span className="table-emoji">
                                {product.product_type === 'lipstick' ? '💄' : '✨'}
                              </span>
                            )}
                          </td>
                          <td style={{ fontWeight: '600' }}>{product.name}</td>
                          <td><span className="product-brand-tag" style={{ position: 'static' }}>{product.brand}</span></td>
                          <td style={{ textTransform: 'capitalize' }}>{product.product_type}</td>
                          <td style={{ fontWeight: 'bold', color: 'var(--primary)' }}>
                            ${product.price.toFixed(2)} USD
                          </td>
                          <td>{formatCLP(product.price)}</td>
                          <td>★ {product.rating}</td>
                          <td>
                            <button 
                              className="btn-edit-action" 
                              onClick={() => handleEditProductClick(product)}
                              type="button"
                            >
                              ✏️ Editar
                            </button>
                            <button 
                              className="btn-delete-action" 
                              onClick={() => handleDeleteProduct(product.id)}
                              type="button"
                            >
                              🗑️ Borrar
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          ) : (
            /* Access Denied View */
            <section className="inventory-panel" style={{ textAlign: 'center', padding: '5rem 2rem' }}>
              <h2>Acceso Denegado</h2>
              <p style={{ margin: '1.5rem 0', color: 'var(--text-muted)' }}>
                Esta sección está restringida exclusivamente para administradores autorizados. Por favor inicie sesión como administrador para acceder.
              </p>
              <button className="btn" onClick={() => setCurrentView('shop')} type="button">
                Volver a la Tienda
              </button>
            </section>
          )
        )}
      </main>

      {/* Footer Area with Required Academic Metadata */}
      <footer>
        <p>&copy; 2026 Blush & Glow. Todos los derechos reservados.</p>
        <p>Desarrollado en React con estándares de desarrollo seguro.</p>
        <div style={{ marginTop: '1.5rem', fontSize: '0.95rem', opacity: 0.95, lineHeight: '1.8', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1.5rem' }}>
          <p><strong>Profesor:</strong> Víctor Vásquez</p>
          <p><strong>Alumna:</strong> Antonella catalán</p>
          <p><strong>Sección:</strong> 2026/O TI3031/D-FB50-N3-P13-C1/D La Granja FB5</p>
        </div>
      </footer>

      {/* Product CRUD Form Modal */}
      {crudModalOpen && (
        <div id="crudModal" className="modal" style={{ display: 'block' }} onClick={() => setCrudModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '650px' }}>
            <span className="close" onClick={() => setCrudModalOpen(false)}>&times;</span>
            <ProductForm 
              productToEdit={productToEdit} 
              onSave={handleSaveProduct} 
              onCancel={() => setCrudModalOpen(false)} 
            />
          </div>
        </div>
      )}

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
              <button 
                className={`auth-tab ${currentAuth === 'admin' ? 'active' : ''}`}
                onClick={() => setCurrentAuth('admin')}
                type="button"
              >
                Administrador
              </button>
            </div>
            
            {currentAuth === 'register' && (
              <RegisterForm onRegister={handleRegister} />
            )}
            {currentAuth === 'login' && (
              <LoginForm registeredUsers={registeredUsers} onLogin={handleLogin} isAdminLogin={false} />
            )}
            {currentAuth === 'admin' && (
              <LoginForm registeredUsers={registeredUsers} onLogin={handleLogin} isAdminLogin={true} />
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
                  <div className="cart-item" key={item.cartItemId}>
                    <div className="item-details">
                      {item.image_link ? (
                        <img 
                          className="item-img-thumb" 
                          src={item.image_link} 
                          alt={item.name} 
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                      ) : (
                        <span className="item-emoji">{item.product_type === 'lipstick' ? '💄' : '✨'}</span>
                      )}
                      <div>
                        <p className="item-name">{item.name}</p>
                        <p className="item-price">${item.price.toFixed(2)} USD</p>
                        {item.selectedColor && (
                          <div className="item-selected-color">
                            <span 
                              className="item-color-preview-dot" 
                              style={{ backgroundColor: item.selectedColor.hex_value }}
                            ></span>
                            <span>{item.selectedColor.colour_name || item.selectedColor.hex_value}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="item-quantity">
                      <button onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)} type="button">-</button>
                      <span>{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)} type="button">+</button>
                    </div>
                    <div className="item-total">
                      ${(item.price * item.quantity).toFixed(2)}
                    </div>
                    <button className="btn-remove" onClick={() => removeFromCart(item.cartItemId)} type="button" aria-label="Eliminar item">🗑️</button>
                  </div>
                ))
              )}
            </div>

            {cart.length > 0 && (
              <div className="cart-summary">
                <p>Subtotal: <span>${cartSubtotal.toFixed(2)} USD (~{formatCLP(cartSubtotal)})</span></p>
                <p>Envío: <span>${SHIPPING_COST.toFixed(2)} USD (~{formatCLP(SHIPPING_COST)})</span></p>
                <hr />
                <p className="total">Total: <span>${cartTotal.toFixed(2)} USD (~{formatCLP(cartTotal)})</span></p>
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
                <p>Subtotal: <span>${cartSubtotal.toFixed(2)} USD (~{formatCLP(cartSubtotal)})</span></p>
                <p>Envío: <span>${SHIPPING_COST.toFixed(2)} USD (~{formatCLP(SHIPPING_COST)})</span></p>
                <hr />
                <p className="total">Total: <span>${cartTotal.toFixed(2)} USD (~{formatCLP(cartTotal)})</span></p>
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
