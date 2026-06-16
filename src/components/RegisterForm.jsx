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

export default function RegisterForm({ onRegister }) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [feedback, setFeedback] = useState([]);
  const [feedbackType, setFeedbackType] = useState(''); // 'error' or 'success'

  // Username requirements validation
  const userLengthMet = username.length >= 5 && username.length <= 20;
  const userStartMet = /^[a-zA-Z]/.test(username);
  const userCharsMet = /^[a-zA-Z0-9_-]+$/.test(username);

  // Password requirements validation
  const passLengthMet = password.length >= 8;
  const passUpperMet = /[A-Z]/.test(password);
  const passSpecialMet = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

  const handleSubmit = (e) => {
    e.preventDefault();
    setFeedback([]);
    setFeedbackType('');

    const errors = [];

    // Sanitize user inputs to prevent XSS injection
    const cleanUsername = sanitizeText(username);
    const cleanEmail = sanitizeText(email);

    // Email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Validation checks
    if (!cleanUsername) {
      errors.push('El usuario es obligatorio.');
    } else {
      if (!userLengthMet) errors.push('El usuario debe tener entre 5 y 20 caracteres.');
      if (!userStartMet) errors.push('El usuario debe empezar con una letra.');
      if (!userCharsMet) errors.push('El usuario solo puede contener letras, números, guiones bajos (_) y guiones (-).');
    }

    if (!cleanEmail) {
      errors.push('El email es obligatorio.');
    } else if (!emailRegex.test(cleanEmail)) {
      errors.push('El email debe tener un formato válido (ej: usuario@ejemplo.com).');
    }

    if (!password) {
      errors.push('La contraseña es obligatoria.');
    } else {
      if (!passLengthMet) errors.push('La contraseña debe tener un mínimo de 8 caracteres.');
      if (!passUpperMet) errors.push('La contraseña debe contener al menos una letra mayúscula.');
      if (!passSpecialMet) errors.push('La contraseña debe contener al menos un carácter especial (!@#$%^&* etc.).');
    }

    if (password !== confirmPassword) {
      errors.push('Las contraseñas deben ser idénticas.');
    }

    if (errors.length > 0) {
      setFeedback(errors);
      setFeedbackType('error');
      return;
    }

    // Success registration
    setFeedback(['¡Registro exitoso. Bienvenida!']);
    setFeedbackType('success');

    // Notify parent component with sanitized data
    if (typeof onRegister === 'function') {
      onRegister({
        username: cleanUsername,
        email: cleanEmail,
        password: password // passwords should not be modified, but handled securely
      });
    }

    // Reset fields
    setUsername('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
  };

  return (
    <div className="auth-form active">
      <h3>Registro</h3>
      <form onSubmit={handleSubmit} noValidate>
        <div className="form-field">
          <label htmlFor="registerUsername">Usuario</label>
          <input
            type="text"
            id="registerUsername"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Nombre de usuario"
            autoComplete="username"
            required
          />
          <div className="username-requirements" style={{ display: username ? 'block' : 'none' }}>
            <p className="requirements-title">Requisitos de Usuario:</p>
            <div className={`requirement ${userLengthMet ? 'met' : ''}`}>
              <span className="requirement-icon">{userLengthMet ? '✓' : '○'}</span>
              <span className="requirement-text">5-20 caracteres</span>
            </div>
            <div className={`requirement ${userStartMet ? 'met' : ''}`}>
              <span className="requirement-icon">{userStartMet ? '✓' : '○'}</span>
              <span className="requirement-text">Debe empezar con una letra</span>
            </div>
            <div className={`requirement ${userCharsMet ? 'met' : ''}`}>
              <span className="requirement-icon">{userCharsMet ? '✓' : '○'}</span>
              <span className="requirement-text">Solo letras, números, _ y -</span>
            </div>
          </div>
        </div>

        <div className="form-field">
          <label htmlFor="registerEmail">Email</label>
          <input
            type="email"
            id="registerEmail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="usuario@ejemplo.com"
            autoComplete="email"
            required
          />
        </div>

        <div className="form-field">
          <label htmlFor="registerPassword">Contraseña</label>
          <input
            type="password"
            id="registerPassword"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Mínimo 8 caracteres"
            autoComplete="new-password"
            required
          />
          <div className="password-requirements" style={{ display: password ? 'block' : 'none' }}>
            <p className="requirements-title">Requisitos de Contraseña:</p>
            <div className={`requirement ${passLengthMet ? 'met' : ''}`}>
              <span className="requirement-icon">{passLengthMet ? '✓' : '○'}</span>
              <span className="requirement-text">Mínimo 8 caracteres</span>
            </div>
            <div className={`requirement ${passUpperMet ? 'met' : ''}`}>
              <span className="requirement-icon">{passUpperMet ? '✓' : '○'}</span>
              <span className="requirement-text">Al menos una letra mayúscula (A-Z)</span>
            </div>
            <div className={`requirement ${passSpecialMet ? 'met' : ''}`}>
              <span className="requirement-icon">{passSpecialMet ? '✓' : '○'}</span>
              <span className="requirement-text">Al menos un carácter especial (!@#$%^&*)</span>
            </div>
          </div>
        </div>

        <div className="form-field">
          <label htmlFor="registerConfirm">Confirmar Contraseña</label>
          <input
            type="password"
            id="registerConfirm"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Repite tu contraseña"
            autoComplete="new-password"
            required
          />
        </div>

        <div className="form-feedback" aria-live="polite">
          {feedback.map((msg, index) => (
            <p key={index} className={`feedback ${feedbackType}`}>
              {msg}
            </p>
          ))}
        </div>

        <button type="submit" className="btn">
          Registrarse
        </button>
      </form>
    </div>
  );
}
