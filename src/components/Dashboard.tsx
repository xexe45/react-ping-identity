import React, { useEffect, useState } from 'react';
import AuthService from '../services/authService.ts';

interface DashboardProps {
  onLogout: () => void;
}

interface UserInfo {
  sub: string;
  name?: string;
  email?: string;
  picture?: string;
  [key: string]: any;
}

const Dashboard: React.FC<DashboardProps> = ({ onLogout }) => {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const authService = AuthService.getInstance();

  useEffect(() => {
    const loadUserData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Obtener información del usuario
        const user = authService.getUser();
        setUserInfo(user);
        
        // Obtener token de acceso
        const token = authService.getAccessToken();
        setAccessToken(token);
        
      } catch (error) {
        console.error('Error loading user data:', error);
        setError('Error al cargar la información del usuario.');
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, []);

  const handleLogout = async () => {
    try {
      await authService.logout();
      onLogout();
    } catch (error) {
      console.error('Error during logout:', error);
      // Incluso si hay error, limpiar el estado local
      onLogout();
    }
  };

  const refreshToken = async () => {
    try {
      setLoading(true);
      const success = await authService.refreshAccessToken();
      if (success) {
        const newToken = authService.getAccessToken();
        setAccessToken(newToken);
      } else {
        setError('No se pudo actualizar el token.');
      }
    } catch (error) {
      console.error('Error refreshing token:', error);
      setError('Error al actualizar el token.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <h2>Cargando información del usuario...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard">
        <div className="error">
          <h2>Error</h2>
          <p>{error}</p>
          <button className="button" onClick={() => window.location.reload()}>
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <h1>Dashboard - Demo de Ping Identity</h1>
      
      <div className="user-info">
        <h2>¡Bienvenido!</h2>
        {userInfo && (
          <div>
            {userInfo.picture && (
              <img 
                src={userInfo.picture} 
                alt="User Avatar" 
                style={{ width: '80px', height: '80px', borderRadius: '50%', marginBottom: '10px' }}
              />
            )}
            <p><strong>ID de Usuario:</strong> {userInfo.sub}</p>
            {userInfo.name && <p><strong>Nombre:</strong> {userInfo.name}</p>}
            {userInfo.email && <p><strong>Email:</strong> {userInfo.email}</p>}
            {userInfo.preferred_username && <p><strong>Username:</strong> {userInfo.preferred_username}</p>}
          </div>
        )}
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h3>Token de Acceso</h3>
        <div style={{ 
          backgroundColor: '#f8f9fa', 
          padding: '10px', 
          border: '1px solid #dee2e6', 
          borderRadius: '4px',
          wordBreak: 'break-all',
          fontSize: '12px',
          maxHeight: '150px',
          overflowY: 'auto'
        }}>
          {accessToken || 'No hay token disponible'}
        </div>
        <button className="button" onClick={refreshToken} style={{ marginTop: '10px' }}>
          Actualizar Token
        </button>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h3>Información Completa del Usuario</h3>
        <pre style={{ 
          backgroundColor: '#f8f9fa', 
          padding: '10px', 
          border: '1px solid #dee2e6', 
          borderRadius: '4px',
          textAlign: 'left',
          fontSize: '12px',
          maxHeight: '300px',
          overflowY: 'auto'
        }}>
          {JSON.stringify(userInfo, null, 2)}
        </pre>
      </div>

      <div>
        <button className="button danger" onClick={handleLogout}>
          Cerrar Sesión
        </button>
      </div>
    </div>
  );
};

export default Dashboard;

