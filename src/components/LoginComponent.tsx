import React, { useState } from 'react';
import { authService } from '../services/authService';

interface LoginComponentProps {
  onLoginSuccess: () => void;
}

const LoginComponent: React.FC<LoginComponentProps> = ({ onLoginSuccess }) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    setLoading(true);
    setError(null);
    
    try {
      await authService.login();
      // El callback manejará el éxito del login
    } catch (error) {
      console.error('Error during login:', error);
      setError('Error al iniciar sesión. Por favor, inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <h1>Demo de Ping Identity</h1>
      <h2>Iniciar Sesión</h2>
      
      {error && (
        <div className="error">
          {error}
        </div>
      )}
      
      <p>Haz clic en el botón para iniciar sesión con Ping Identity:</p>
      
      <button 
        className="button" 
        onClick={handleLogin}
        disabled={loading}
      >
        {loading ? 'Iniciando sesión...' : 'Iniciar Sesión con Ping Identity'}
      </button>
      
      <div style={{ marginTop: '20px', fontSize: '14px', color: '#666' }}>
        <p>Esta demo muestra:</p>
        <ul style={{ textAlign: 'left' }}>
          <li>Autenticación OAuth 2.0 / OpenID Connect</li>
          <li>Obtención de tokens de acceso</li>
          <li>Información del usuario autenticado</li>
          <li>Cierre de sesión seguro</li>
        </ul>
      </div>
    </div>
  );
};

export default LoginComponent;

