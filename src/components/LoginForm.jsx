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

export default function LoginForm({ registeredUsers, onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [feedback, setFeedback] = useState([]);
  const [feedbackType, setFeedbackType] = useState(''); // 'error' or 'success'

  const handleSubmit = (e) => {
    e.preventDefault();
    setFeedback([]);
    setFeedbackType('');

    const errors = [];
    const cleanUsername = sanitizeText(username);

    if (!cleanUsername) {
      errors.push('El usuario es obligatorio.');
    }

    if (!password) {
      errors.push('La contraseña es obligatoria.');
    }

    if (errors.length > 0) {
      setFeedback(errors);
      setFeedbackType('error');
      return;
    }

    // Verify user exists in the registered users list by username
    const foundUser = registeredUsers.find(
      (user) => user.username.toLowerCase() === cleanUsername.toLowerCase()
    );

    if (!foundUser || foundUser.password !== password) {
      setFeedback(['Nombre de usuario o contraseña incorrectos.']);
      setFeedbackType('error');
      return;
    }

    // Success login
    setFeedback(['¡Ingreso exitoso! Bienvenido de nuevo.']);
    setFeedbackType('success');

    if (typeof onLogin === 'function') {
      onLogin(foundUser);
    }

    // Reset input fields
    setUsername('');
    setPassword('');
  };

  return (
    <div className="auth-form active">
      <h3>Iniciar Sesión</h3>
      <form onSubmit={handleSubmit} noValidate>
        <div className="form-field">
          <label htmlFor="loginUsername">Usuario</label>
          <input
            type="text"
            id="loginUsername"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Nombre de usuario"
            autoComplete="username"
            required
          />
        </div>

        <div className="form-field">
          <label htmlFor="loginPassword">Contraseña</label>
          <input
            type="password"
            id="loginPassword"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Contraseña"
            autoComplete="current-password"
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
          Ingresar
        </button>
      </form>
    </div>
  );
}
