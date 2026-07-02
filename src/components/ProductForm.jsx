import { useState, useEffect } from 'react';

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

export default function ProductForm({ onSave, onCancel, productToEdit }) {
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [price, setPrice] = useState('');
  const [productType, setProductType] = useState('lipstick');
  const [description, setDescription] = useState('');
  const [imageLink, setImageLink] = useState('');
  const [feedback, setFeedback] = useState([]);
  const [feedbackType, setFeedbackType] = useState(''); // 'error' or 'success'

  // Pre-fill if editing
  useEffect(() => {
    if (productToEdit) {
      setName(productToEdit.name || '');
      setBrand(productToEdit.brand || '');
      setPrice(productToEdit.price !== undefined ? productToEdit.price.toString() : '');
      setProductType(productToEdit.product_type || 'lipstick');
      setDescription(productToEdit.description || '');
      setImageLink(productToEdit.image_link || '');
    } else {
      setName('');
      setBrand('');
      setPrice('');
      setProductType('lipstick');
      setDescription('');
      setImageLink('');
    }
    setFeedback([]);
    setFeedbackType('');
  }, [productToEdit]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setFeedback([]);
    setFeedbackType('');

    const errors = [];

    // Sanitize user inputs to prevent XSS injection
    const cleanName = sanitizeText(name);
    const cleanBrand = sanitizeText(brand);
    const cleanDescription = sanitizeText(description);
    const cleanImageLink = sanitizeText(imageLink);

    // Validation checks
    if (!cleanName) {
      errors.push('El nombre del producto es obligatorio.');
    } else if (cleanName.length < 3) {
      errors.push('El nombre debe tener al menos 3 caracteres.');
    }

    if (!cleanBrand) {
      errors.push('La marca del producto es obligatoria.');
    }

    const numericPrice = parseFloat(price);
    if (isNaN(numericPrice) || numericPrice <= 0) {
      errors.push('El precio debe ser un número positivo mayor que 0.');
    }

    if (!cleanDescription) {
      errors.push('La descripción es obligatoria.');
    } else if (cleanDescription.length < 10) {
      errors.push('La descripción debe tener al menos 10 caracteres.');
    }

    // Optional image URL validation if provided
    if (cleanImageLink) {
      const urlRegex = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([\/\w .-]*)*\/?$/;
      if (!urlRegex.test(cleanImageLink)) {
        errors.push('El enlace de la imagen no es una URL válida.');
      }
    }

    if (errors.length > 0) {
      setFeedback(errors);
      setFeedbackType('error');
      return;
    }

    // Construct product object
    const savedProduct = {
      name: cleanName,
      brand: cleanBrand,
      price: numericPrice,
      product_type: productType,
      description: cleanDescription,
      image_link: cleanImageLink,
      // Keep rating if editing, otherwise assign a random nice rating
      rating: productToEdit ? productToEdit.rating : parseFloat((4.0 + Math.random() * 1.0).toFixed(1)),
      product_colors: productToEdit ? productToEdit.product_colors : []
    };

    if (productToEdit) {
      savedProduct.id = productToEdit.id;
    }

    setFeedback(['¡Producto validado y guardado correctamente!']);
    setFeedbackType('success');

    // Callback to parent component
    if (typeof onSave === 'function') {
      onSave(savedProduct);
    }
  };

  return (
    <div className="product-form-container">
      <h3>{productToEdit ? 'Editar Producto' : 'Añadir Nuevo Producto'}</h3>
      <form onSubmit={handleSubmit} noValidate>
        <div className="form-field">
          <label htmlFor="prodName">Nombre del Producto</label>
          <input
            type="text"
            id="prodName"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ej: Labial Mate Ultra Red"
            required
          />
        </div>

        <div className="form-row">
          <div className="form-field">
            <label htmlFor="prodBrand">Marca</label>
            <input
              type="text"
              id="prodBrand"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              placeholder="Ej: Blush & Glow"
              required
            />
          </div>

          <div className="form-field">
            <label htmlFor="prodPrice">Precio (USD)</label>
            <input
              type="number"
              id="prodPrice"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="Ej: 15.99"
              step="0.01"
              min="0.01"
              required
            />
          </div>
        </div>

        <div className="form-field">
          <label htmlFor="prodType">Categoría</label>
          <select
            id="prodType"
            value={productType}
            onChange={(e) => setProductType(e.target.value)}
            className="select-filter"
          >
            <option value="lipstick">Labiales (Lipstick)</option>
            <option value="eyeshadow">Sombras (Eyeshadow)</option>
            <option value="foundation">Bases (Foundation)</option>
            <option value="blush">Rubores (Blush)</option>
            <option value="mascara">Máscaras (Mascara)</option>
            <option value="eyeliner">Delineadores (Eyeliner)</option>
          </select>
        </div>

        <div className="form-field">
          <label htmlFor="prodImage">Enlace de Imagen (URL)</label>
          <input
            type="url"
            id="prodImage"
            value={imageLink}
            onChange={(e) => setImageLink(e.target.value)}
            placeholder="https://ejemplo.com/imagen.jpg (opcional)"
          />
        </div>

        <div className="form-field">
          <label htmlFor="prodDesc">Descripción</label>
          <textarea
            id="prodDesc"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Escribe los detalles e ingredientes del producto..."
            rows="4"
            maxLength="300"
            required
          ></textarea>
          <div className="char-counter" style={{ textAlign: 'right', fontSize: '0.8rem', color: '#888', marginTop: '2px' }}>
            {description.length}/300 caracteres
          </div>
        </div>

        <div className="form-feedback" aria-live="polite">
          {feedback.map((msg, index) => (
            <p key={index} className={`feedback ${feedbackType}`}>
              {msg}
            </p>
          ))}
        </div>

        <div className="form-actions" style={{ display: 'flex', gap: '10px', marginTop: '1.5rem' }}>
          <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
            {productToEdit ? 'Actualizar' : 'Guardar'}
          </button>
          <button type="button" className="btn btn-secondary" onClick={onCancel} style={{ flex: 1 }}>
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}
