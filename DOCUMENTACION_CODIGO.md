# Documentación del Código - Demo Ping Identity

Esta documentación describe la funcionalidad de cada método y componente en la aplicación demo de Ping Identity.

## Índice

1. [Arquitectura General](#arquitectura-general)
2. [Configuración (`pingConfig.ts`)](#configuración-pingconfigts)
3. [Servicio de Autenticación (`authService.ts`)](#servicio-de-autenticación-authservicets)
4. [Componentes React](#componentes-react)
5. [Punto de Entrada (`index.tsx`)](#punto-de-entrada-indextsx)
6. [Aplicación Principal (`App.tsx`)](#aplicación-principal-apptsx)

## Arquitectura General

La aplicación implementa un flujo de autenticación OAuth 2.0 / OpenID Connect con Ping Identity:

- **Frontend**: React con TypeScript
- **Patrón de diseño**: Singleton para el servicio de autenticación
- **Seguridad**: PKCE (Proof Key for Code Exchange) y validación de estado CSRF
- **Persistencia**: LocalStorage para el estado de autenticación

---

## Configuración (`pingConfig.ts`)

### Interfaces

#### `PingConfig`
Define la estructura de configuración para Ping Identity.

**Propiedades:**
- `environmentId`: ID del entorno de Ping Identity
- `clientId`: ID del cliente OAuth
- `redirectUri`: URI de redirección después de la autenticación
- `scopes`: Alcances solicitados (openid, profile, email)
- `responseType`: Tipo de respuesta OAuth ("code")
- `grantType`: Tipo de concesión ("authorization_code")
- `logoutRedirectUri`: URI de redirección después del logout
- `issuer`: URL del emisor de tokens

### Configuración

#### `pingConfig`
Objeto de configuración principal que utiliza variables de entorno.

#### `pingEndpoints`
Objeto que contiene las URLs de los endpoints de Ping Identity:
- `authorization`: Endpoint de autorización
- `token`: Endpoint para intercambio de tokens
- `userinfo`: Endpoint para información del usuario
- `logout`: Endpoint para cierre de sesión

### Métodos

#### `validateConfig(): boolean`
Valida que todos los campos requeridos estén configurados correctamente.

**Retorna:**
- `true` si la configuración es válida
- `false` si falta algún campo requerido

**Funcionalidad:**
- Verifica que los campos requeridos no contengan valores por defecto
- Registra errores en la consola si encuentra problemas

---

## Servicio de Autenticación (`authService.ts`)

### Interfaces

#### `UserProfile`
Estructura del perfil de usuario de Ping Identity.

#### `TokenResponse`
Estructura de la respuesta de tokens de OAuth.

#### `AuthState`
Estado completo de autenticación de la aplicación.

### Clase AuthService

Implementa el patrón Singleton para manejar la autenticación.

#### Métodos Privados

##### `constructor()`
Inicializa el servicio y carga el estado de autenticación desde localStorage.

##### `generateState(): string`
Genera un estado aleatorio para protección CSRF.

**Retorna:** String aleatorio de 26 caracteres

##### `generateCodeVerifier(): string`
Genera un code verifier para PKCE usando criptografía segura.

**Retorna:** String codificado en base64URL

##### `generateCodeChallenge(verifier: string): Promise<string>`
Genera un code challenge a partir del code verifier usando SHA-256.

**Parámetros:**
- `verifier`: Code verifier generado previamente

**Retorna:** Promise que resuelve al code challenge

##### `base64URLEncode(array: Uint8Array): string`
Codifica un array de bytes en formato base64URL.

**Parámetros:**
- `array`: Array de bytes a codificar

**Retorna:** String codificado en base64URL

##### `exchangeCodeForTokens(code: string, codeVerifier: string): Promise<TokenResponse>`
Intercambia el código de autorización por tokens de acceso.

**Parámetros:**
- `code`: Código de autorización recibido del callback
- `codeVerifier`: Code verifier usado en el flujo PKCE

**Retorna:** Promise con la respuesta de tokens

##### `getUserProfile(accessToken: string): Promise<UserProfile>`
Obtiene el perfil del usuario usando el token de acceso.

**Parámetros:**
- `accessToken`: Token de acceso válido

**Retorna:** Promise con el perfil del usuario

##### `updateAuthState(tokenResponse: TokenResponse, userProfile: UserProfile): void`
Actualiza el estado de autenticación interno y lo persiste.

**Parámetros:**
- `tokenResponse`: Respuesta de tokens del servidor
- `userProfile`: Perfil del usuario autenticado

##### `clearAuthState(): void`
Limpia el estado de autenticación y lo elimina del localStorage.

##### `saveAuthState(): void`
Guarda el estado actual de autenticación en localStorage.

##### `loadAuthState(): void`
Carga el estado de autenticación desde localStorage y verifica su validez.

#### Métodos Públicos

##### `getInstance(): AuthService`
Método estático que implementa el patrón Singleton.

**Retorna:** Instancia única del servicio de autenticación

##### `login(): Promise<void>`
Inicia el flujo de autenticación OAuth 2.0 con PKCE.

**Funcionalidad:**
1. Genera estado y parámetros PKCE
2. Construye URL de autorización
3. Redirige al usuario a Ping Identity

##### `handleCallback(code: string, state: string): Promise<void>`
Maneja el callback de autenticación después del login.

**Parámetros:**
- `code`: Código de autorización
- `state`: Estado para validación CSRF

**Funcionalidad:**
1. Valida el estado CSRF
2. Intercambia código por tokens
3. Obtiene perfil del usuario
4. Actualiza estado de autenticación

##### `logout(): Promise<void>`
Cierra la sesión del usuario.

**Funcionalidad:**
1. Construye URL de logout con ID token
2. Limpia estado local
3. Redirige a Ping Identity para logout completo

##### `isTokenExpired(): boolean`
Verifica si el token de acceso ha expirado.

**Retorna:** `true` si el token ha expirado

##### `refreshAccessToken(): Promise<boolean>`
Renueva el token de acceso usando el refresh token.

**Retorna:** `true` si la renovación fue exitosa

##### `getAuthState(): AuthState`
Obtiene una copia del estado de autenticación.

**Retorna:** Copia del estado de autenticación actual

##### `getUser(): UserProfile | null`
Obtiene el perfil del usuario autenticado.

**Retorna:** Perfil del usuario o `null` si no está autenticado

##### `getAccessToken(): string | null`
Obtiene el token de acceso actual.

**Retorna:** Token de acceso o `null` si no existe

##### `isAuthenticated(): boolean`
Verifica si el usuario está autenticado y el token es válido.

**Retorna:** `true` si está autenticado con token válido

---

## Componentes React

### LoginComponent (`LoginComponent.tsx`)

Componente para la página de inicio de sesión.

#### Props
- `onLoginSuccess`: Callback ejecutado cuando el login es exitoso

#### Estado
- `loading`: Indica si el proceso de login está en curso
- `error`: Mensaje de error si el login falla

#### Métodos

##### `handleLogin(): Promise<void>`
Maneja el clic del botón de login.

**Funcionalidad:**
1. Establece estado de carga
2. Llama al servicio de autenticación
3. Maneja errores y actualiza la UI

### Dashboard (`Dashboard.tsx`)

Componente para mostrar información del usuario autenticado.

#### Props
- `onLogout`: Callback ejecutado cuando se cierra sesión

#### Estado
- `userInfo`: Información del usuario
- `accessToken`: Token de acceso actual
- `loading`: Estado de carga
- `error`: Mensaje de error

#### Métodos

##### `loadUserData(): Promise<void>`
Carga la información del usuario y el token de acceso.

##### `handleLogout(): Promise<void>`
Maneja el cierre de sesión.

**Funcionalidad:**
1. Llama al servicio de logout
2. Ejecuta callback del componente padre
3. Maneja errores de logout

##### `refreshToken(): Promise<void>`
Actualiza el token de acceso.

### CallbackComponent (`CallbackComponent.tsx`)

Componente que maneja el callback de autenticación.

#### Props
- `onLoginSuccess`: Callback ejecutado cuando la autenticación es exitosa

#### Estado
- `loading`: Estado de procesamiento del callback
- `error`: Mensaje de error si el callback falla

#### Métodos

##### `handleCallback(): Promise<void>`
Procesa el callback de autenticación.

**Funcionalidad:**
1. Llama al servicio para procesar el callback
2. Notifica éxito al componente padre
3. Redirige al dashboard
4. Maneja errores y redirige al login si falla

---

## Punto de Entrada (`index.tsx`)

### Funcionalidad
Inicializa la aplicación React con:
- `React.StrictMode` para detección de problemas
- `BrowserRouter` para enrutamiento
- Renderiza el componente `App` principal

---

## Aplicación Principal (`App.tsx`)

### Estado
- `isAuthenticated`: Estado de autenticación del usuario
- `loading`: Estado de carga inicial

### Métodos

#### `checkAuthStatus(): Promise<void>`
Verifica el estado de autenticación al cargar la aplicación.

**Funcionalidad:**
1. Consulta el servicio de autenticación
2. Actualiza el estado de autenticación
3. Maneja errores de verificación

#### `handleLoginSuccess(): void`
Callback ejecutado cuando el login es exitoso.

**Funcionalidad:** Actualiza el estado a autenticado

#### `handleLogout(): void`
Callback ejecutado cuando se cierra sesión.

**Funcionalidad:** Actualiza el estado a no autenticado

### Enrutamiento

La aplicación define las siguientes rutas:

- `/login`: Página de inicio de sesión
- `/callback`: Procesamiento del callback de autenticación
- `/dashboard`: Panel principal para usuarios autenticados
- `/`: Redirección automática según estado de autenticación

### Protección de Rutas

La aplicación implementa protección de rutas:
- Rutas públicas redirigen a dashboard si el usuario está autenticado
- Rutas protegidas redirigen a login si el usuario no está autenticado

---

## Seguridad Implementada

### PKCE (Proof Key for Code Exchange)
- Genera code verifier y challenge únicos para cada sesión
- Protege contra ataques de intercepción de código

### Protección CSRF
- Genera y valida estado único para cada flujo de autenticación
- Previene ataques de falsificación de solicitudes

### Gestión Segura de Tokens
- Almacenamiento en localStorage con verificación de expiración
- Limpieza automática de tokens expirados
- Soporte para renovación de tokens

### Validación de Configuración
- Verificación de parámetros requeridos
- Advertencias en consola para configuraciones incorrectas

Esta documentación proporciona una visión completa de la funcionalidad implementada en la aplicación demo de Ping Identity.

