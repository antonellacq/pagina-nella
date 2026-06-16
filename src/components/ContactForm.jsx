import { useState } from 'react';

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

export default function ContactForm({ onContactSubmit }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [feedback, setFeedback] = useState([]);
  const [feedbackType, setFeedbackType] = useState(''); // 'error' or 'success'

  const MAX_LENGTH = 300;

  const handleMessageChange = (e) => {
    const val = e.target.value;
    if (val.length <= MAX_LENGTH) {
      setMessage(val);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setFeedback([]);
    setFeedbackType('');

    const errors = [];
    const cleanName = sanitizeText(name);
    const cleanEmail = sanitizeText(email);
    const cleanSubject = sanitizeText(subject);
    const cleanMessage = sanitizeText(message);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!cleanName) {
      errors.push('El nombre es obligatorio.');
    }
    if (!cleanEmail) {
      errors.push('El email es obligatorio.');
    } else if (!emailRegex.test(cleanEmail)) {
      errors.push('El email no tiene un formato válido.');
    }
    if (!cleanSubject) {
      errors.push('El asunto es obligatorio.');
    }
    if (!cleanMessage) {
      errors.push('El mensaje no puede quedar vacío.');
    }

    if (errors.length > 0) {
      setFeedback(errors);
      setFeedbackType('error');
      return;
    }

    setFeedback(['Mensaje enviado correctamente. Gracias por contactarnos.']);
    setFeedbackType('success');

    if (typeof onContactSubmit === 'function') {
      onContactSubmit({
        name: cleanName,
        email: cleanEmail,
        subject: cleanSubject,
        message: cleanMessage
      });
    }

    // Reset fields
    setName('');
    setEmail('');
    setSubject('');
    setMessage('');
  };

  return (
    <div className="contact-form">
      <h3>Envíanos un Mensaje</h3>
      <form onSubmit={handleSubmit} noValidate>
        <div className="form-field">
          <label htmlFor="contactName">Nombre</label>
          <input
            type="text"
            id="contactName"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Tu nombre completo"
            required
          />
        </div>

        <div className="form-field">
          <label htmlFor="contactEmail">Email</label>
          <input
            type="email"
            id="contactEmail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="usuario@ejemplo.com"
            required
          />
        </div>

        <div className="form-field">
          <label htmlFor="contactSubject">Asunto</label>
          <input
            type="text"
            id="contactSubject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Tema del mensaje"
            required
          />
        </div>

        <div className="form-field">
          <label htmlFor="contactMessage">Mensaje</label>
          <textarea
            id="contactMessage"
            value={message}
            onChange={handleMessageChange}
            rows="5"
            placeholder="Escribe tu mensaje..."
            required
          ></textarea>
          <div className="char-counter">
            <span>{message.length}</span>/{MAX_LENGTH} caracteres
          </div>
        </div>

        <div className="form-feedback" aria-live="polite">
          {feedback.map((msg, index) => (
            <p key={index} className={`feedback ${feedbackType}`}>
              {msg}
            </p>
          ))}
        </div>

        <button type="submit" className="btn">
          Enviar Mensaje
        </button>
      </form>
    </div>
  );
}
