// Configuración para Ping Identity PingOne for Customers (P14C)
export interface PingConfig {
  environmentId: string;
  clientId: string;
  redirectUri: string;
  scopes: string[];
  responseType: string;
  grantType: string;
  logoutRedirectUri: string;
  issuer: string;
}

// Configuración por defecto - IMPORTANTE: Reemplazar con tus valores reales
export const pingConfig: PingConfig = {
  environmentId: process.env.REACT_APP_PING_ENVIRONMENT_ID || 'your-environment-id',
  clientId: process.env.REACT_APP_PING_CLIENT_ID || 'your-client-id',
  redirectUri: process.env.REACT_APP_PING_REDIRECT_URI || 'http://localhost:3000/callback',
  scopes: ['openid', 'profile', 'email'],
  responseType: 'code',
  grantType: 'authorization_code',
  logoutRedirectUri: process.env.REACT_APP_PING_LOGOUT_REDIRECT_URI || 'http://localhost:3000',
  issuer: process.env.REACT_APP_PING_ISSUER || 'https://auth.pingone.com/your-environment-id/as'
};

// URLs de Ping Identity
export const pingEndpoints = {
  authorization: `${pingConfig.issuer}/authorize`,
  token: `${pingConfig.issuer}/token`,
  userinfo: `${pingConfig.issuer}/userinfo`,
  logout: `${pingConfig.issuer}/signoff`
};

// Validar configuración
export const validateConfig = (): boolean => {
  const requiredFields = ['environmentId', 'clientId', 'redirectUri', 'issuer'];
  
  for (const field of requiredFields) {
    if (!pingConfig[field as keyof PingConfig] || 
        (pingConfig[field as keyof PingConfig] as string).includes('your-')) {
      console.error(`Ping Identity: Campo requerido '${field}' no configurado correctamente`);
      return false;
    }
  }
  
  return true;
};

