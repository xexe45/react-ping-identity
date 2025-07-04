import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthService from '../services/authService.ts';

interface CallbackComponentProps {
  onLoginSuccess: () => void;
}

const CallbackComponent: React.FC<CallbackComponentProps> = ({ onLoginSuccess }) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const authService = AuthService.getInstance();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Extraer parámetros de la URL
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const state = urlParams.get('state');
        
        if (!code || !state) {
          throw new Error('Parámetros de callback faltantes');
        }
        
        // Procesar el callback de autenticación
        await authService.handleCallback(code, state);
        
        // Notificar al componente padre que el login fue exitoso
        onLoginSuccess();
        
        // Redirigir al dashboard
        navigate('/dashboard');
        
      } catch (error) {
        console.error('Error handling callback:', error);
        setError('Error al procesar la autenticación. Por favor, intenta de nuevo.');
        
        // Redirigir al login después de un error
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } finally {
        setLoading(false);
      }
    };

    handleCallback();
  }, [navigate, onLoginSuccess]);

  if (loading) {
    return (
      <div className="loading">
        <h2>Procesando autenticación...</h2>
        <p>Por favor, espera mientras verificamos tu información.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error">
        <h2>Error de Autenticación</h2>
        <p>{error}</p>
        <p>Serás redirigido al login en unos segundos...</p>
      </div>
    );
  }

  return (
    <div className="loading">
      <h2>¡Autenticación exitosa!</h2>
      <p>Redirigiendo al dashboard...</p>
    </div>
  );
};

export default CallbackComponent;

