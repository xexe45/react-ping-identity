import axios from 'axios';
import { pingConfig, pingEndpoints } from '../config/pingConfig';

// Interfaces para manejar los datos de autenticación
export interface UserProfile {
  sub: string;
  name?: string;
  email?: string;
  given_name?: string;
  family_name?: string;
  picture?: string;
  email_verified?: boolean;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  id_token?: string;
  refresh_token?: string;
  scope: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: UserProfile | null;
  accessToken: string | null;
  idToken: string | null;
  refreshToken: string | null;
  expiresAt: number | null;
}

class AuthService {
  private static instance: AuthService;
  private authState: AuthState = {
    isAuthenticated: false,
    user: null,
    accessToken: null,
    idToken: null,
    refreshToken: null,
    expiresAt: null
  };

  private constructor() {
    this.loadAuthState();
  }

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  // Generar state aleatorio para CSRF protection
  private generateState(): string {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  }

  // Generar code verifier para PKCE (Proof Key for Code Exchange)
  private generateCodeVerifier(): string {
    const array = new Uint8Array(32);
    window.crypto.getRandomValues(array);
    return this.base64URLEncode(array);
  }

  // Generar code challenge para PKCE
  private async generateCodeChallenge(verifier: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(verifier);
    const digest = await window.crypto.subtle.digest('SHA-256', data);
    return this.base64URLEncode(new Uint8Array(digest));
  }

  private base64URLEncode(array: Uint8Array): string {
    return btoa(String.fromCharCode(...array))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  }

  // Iniciar el flujo de autenticación
  public async login(): Promise<void> {
    try {
      const state = this.generateState();
      const codeVerifier = this.generateCodeVerifier();
      const codeChallenge = await this.generateCodeChallenge(codeVerifier);

      // Guardar parámetros en sessionStorage para usar después del callback
      sessionStorage.setItem('ping_auth_state', state);
      sessionStorage.setItem('ping_code_verifier', codeVerifier);

      // Construir URL de autorización
      const authUrl = new URL(pingEndpoints.authorization);
      authUrl.searchParams.set('response_type', pingConfig.responseType);
      authUrl.searchParams.set('client_id', pingConfig.clientId);
      authUrl.searchParams.set('redirect_uri', pingConfig.redirectUri);
      authUrl.searchParams.set('scope', pingConfig.scopes.join(' '));
      authUrl.searchParams.set('state', state);
      authUrl.searchParams.set('code_challenge', codeChallenge);
      authUrl.searchParams.set('code_challenge_method', 'S256');

      // Redirigir al usuario a Ping Identity
      window.location.href = authUrl.toString();
    } catch (error) {
      console.error('Error iniciando login:', error);
      throw new Error('Error al iniciar el proceso de autenticación');
    }
  }

  // Manejar el callback de autenticación
  public async handleCallback(code: string, state: string): Promise<void> {
    try {
      // Verificar state para prevenir CSRF
      const storedState = sessionStorage.getItem('ping_auth_state');
      if (state !== storedState) {
        throw new Error('Estado inválido - posible ataque CSRF');
      }

      const codeVerifier = sessionStorage.getItem('ping_code_verifier');
      if (!codeVerifier) {
        throw new Error('Code verifier no encontrado');
      }

      // Intercambiar código por tokens
      const tokenResponse = await this.exchangeCodeForTokens(code, codeVerifier);
      
      // Obtener información del usuario
      const userProfile = await this.getUserProfile(tokenResponse.access_token);

      // Actualizar estado de autenticación
      this.updateAuthState(tokenResponse, userProfile);

      // Limpiar datos temporales
      sessionStorage.removeItem('ping_auth_state');
      sessionStorage.removeItem('ping_code_verifier');

    } catch (error) {
      console.error('Error en callback:', error);
      throw error;
    }
  }

  // Intercambiar código por tokens
  private async exchangeCodeForTokens(code: string, codeVerifier: string): Promise<TokenResponse> {
    try {
      const response = await axios.post(pingEndpoints.token, 
        new URLSearchParams({
          grant_type: pingConfig.grantType,
          client_id: pingConfig.clientId,
          code: code,
          redirect_uri: pingConfig.redirectUri,
          code_verifier: codeVerifier
        }), 
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('Error intercambiando código por tokens:', error);
      throw new Error('Error obteniendo tokens de acceso');
    }
  }

  // Obtener perfil del usuario
  private async getUserProfile(accessToken: string): Promise<UserProfile> {
    try {
      const response = await axios.get(pingEndpoints.userinfo, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      return response.data;
    } catch (error) {
      console.error('Error obteniendo perfil del usuario:', error);
      throw new Error('Error obteniendo información del usuario');
    }
  }

  // Actualizar estado de autenticación
  private updateAuthState(tokenResponse: TokenResponse, userProfile: UserProfile): void {
    const expiresAt = Date.now() + (tokenResponse.expires_in * 1000);
    
    this.authState = {
      isAuthenticated: true,
      user: userProfile,
      accessToken: tokenResponse.access_token,
      idToken: tokenResponse.id_token || null,
      refreshToken: tokenResponse.refresh_token || null,
      expiresAt: expiresAt
    };

    this.saveAuthState();
  }

  // Cerrar sesión
  public async logout(): Promise<void> {
    try {
      // Si hay un ID token, realizar logout en Ping Identity
      if (this.authState.idToken) {
        const logoutUrl = new URL(pingEndpoints.logout);
        logoutUrl.searchParams.set('id_token_hint', this.authState.idToken);
        logoutUrl.searchParams.set('post_logout_redirect_uri', pingConfig.logoutRedirectUri);
        
        // Limpiar estado local primero
        this.clearAuthState();
        
        // Redirigir a Ping Identity para logout
        window.location.href = logoutUrl.toString();
      } else {
        // Solo logout local
        this.clearAuthState();
      }
    } catch (error) {
      console.error('Error durante logout:', error);
      this.clearAuthState(); // Limpiar estado local aunque falle el logout remoto
    }
  }

  // Limpiar estado de autenticación
  private clearAuthState(): void {
    this.authState = {
      isAuthenticated: false,
      user: null,
      accessToken: null,
      idToken: null,
      refreshToken: null,
      expiresAt: null
    };
    
    localStorage.removeItem('ping_auth_state');
  }

  // Verificar si el token ha expirado
  public isTokenExpired(): boolean {
    if (!this.authState.expiresAt) return true;
    return Date.now() >= this.authState.expiresAt;
  }

  // Renovar token usando refresh token
  public async refreshAccessToken(): Promise<boolean> {
    if (!this.authState.refreshToken) {
      return false;
    }

    try {
      const response = await axios.post(pingEndpoints.token,
        new URLSearchParams({
          grant_type: 'refresh_token',
          client_id: pingConfig.clientId,
          refresh_token: this.authState.refreshToken
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );

      const tokenResponse: TokenResponse = response.data;
      const expiresAt = Date.now() + (tokenResponse.expires_in * 1000);

      this.authState.accessToken = tokenResponse.access_token;
      this.authState.expiresAt = expiresAt;
      
      if (tokenResponse.refresh_token) {
        this.authState.refreshToken = tokenResponse.refresh_token;
      }

      this.saveAuthState();
      return true;
    } catch (error) {
      console.error('Error renovando token:', error);
      return false;
    }
  }

  // Guardar estado en localStorage
  private saveAuthState(): void {
    try {
      localStorage.setItem('ping_auth_state', JSON.stringify(this.authState));
    } catch (error) {
      console.error('Error guardando estado de autenticación:', error);
    }
  }

  // Cargar estado desde localStorage
  private loadAuthState(): void {
    try {
      const saved = localStorage.getItem('ping_auth_state');
      if (saved) {
        const parsed = JSON.parse(saved);
        
        // Verificar si el token ha expirado
        if (parsed.expiresAt && Date.now() < parsed.expiresAt) {
          this.authState = parsed;
        } else {
          // Token expirado, limpiar estado
          this.clearAuthState();
        }
      }
    } catch (error) {
      console.error('Error cargando estado de autenticación:', error);
      this.clearAuthState();
    }
  }

  // Getters públicos
  public getAuthState(): AuthState {
    return { ...this.authState };
  }

  public getUser(): UserProfile | null {
    return this.authState.user;
  }

  public getAccessToken(): string | null {
    return this.authState.accessToken;
  }

  public isAuthenticated(): boolean {
    return this.authState.isAuthenticated && !this.isTokenExpired();
  }
}

export default AuthService;

