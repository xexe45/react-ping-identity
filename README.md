# Demo de Ping Identity con React

Esta es una aplicación demo que muestra cómo integrar Ping Identity con una aplicación React usando OAuth 2.0 y OpenID Connect.

## Características

- ✅ Autenticación OAuth 2.0 / OpenID Connect
- ✅ Login y logout con Ping Identity
- ✅ Obtención de información del usuario
- ✅ Manejo de tokens de acceso
- ✅ Refresh de tokens automático
- ✅ Protección de rutas
- ✅ Interfaz de usuario responsiva

## Estructura del Proyecto

```
ping-identity-demo/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   ├── CallbackComponent.tsx
│   │   ├── Dashboard.tsx
│   │   └── LoginComponent.tsx
│   ├── config/
│   │   └── pingConfig.ts
│   ├── services/
│   │   └── authService.ts
│   ├── App.tsx
│   ├── index.tsx
│   └── index.css
├── package.json
├── .env.example
└── README.md
```

## Requisitos Previos

1. **Node.js** (versión 16 o superior)
2. **npm** o **yarn**
3. Una cuenta de **Ping Identity** con un entorno configurado
4. Una aplicación registrada en Ping Identity con:
   - Tipo de aplicación: Single Page Application (SPA)
   - Grant Types: Authorization Code + PKCE
   - Redirect URIs configuradas

## Configuración de Ping Identity

### 1. Crear una aplicación en Ping Identity

1. Inicia sesión en tu consola de Ping Identity
2. Ve a **Applications** → **My Applications**
3. Haz clic en **Add Application**
4. Selecciona **Single Page App**
5. Completa la configuración:
   - **Application Name**: Ping Identity React Demo
   - **Description**: Demo de integración con React
   - **Grant Types**: Authorization Code
   - **PKCE**: Habilitado (requerido)
   - **Redirect URIs**: 
     - `http://localhost:3000/callback`
   - **Post Logout Redirect URIs**:
     - `http://localhost:3000/login`
   - **Allowed Scopes**: openid, profile, email

### 2. Obtener la configuración

Después de crear la aplicación, obtén:
- **Client ID**
- **Environment ID**
- **Discovery Endpoint** (opcional)

## Instalación y Configuración

### 1. Instalar dependencias

```bash
npm install
```

### 2. Configurar variables de entorno

1. Copia el archivo de ejemplo:
   ```bash
   copy .env.example .env
   ```

2. Edita el archivo `.env` con tus valores de Ping Identity:
   ```env
   REACT_APP_PING_AUTHORIZATION_ENDPOINT=https://auth.pingone.com/YOUR_ENVIRONMENT_ID/as/authorize
   REACT_APP_PING_TOKEN_ENDPOINT=https://auth.pingone.com/YOUR_ENVIRONMENT_ID/as/token
   REACT_APP_PING_USERINFO_ENDPOINT=https://auth.pingone.com/YOUR_ENVIRONMENT_ID/as/userinfo
   REACT_APP_PING_END_SESSION_ENDPOINT=https://auth.pingone.com/YOUR_ENVIRONMENT_ID/as/signoff
   REACT_APP_PING_CLIENT_ID=your_client_id_here
   REACT_APP_PING_REDIRECT_URI=http://localhost:3000/callback
   REACT_APP_PING_POST_LOGOUT_REDIRECT_URI=http://localhost:3000/login
   REACT_APP_PING_SCOPE=openid profile email
   ```

   ⚠️ **Importante**: Reemplaza `YOUR_ENVIRONMENT_ID` y `your_client_id_here` con tus valores reales.

### 3. Ejecutar la aplicación

```bash
npm start
```

La aplicación se abrirá en `http://localhost:3000`

## Uso

1. **Navega** a `http://localhost:3000`
2. **Haz clic** en "Iniciar Sesión con Ping Identity"
3. **Serás redirigido** a Ping Identity para autenticarte
4. **Después del login exitoso**, serás redirigido al dashboard
5. **En el dashboard** podrás ver:
   - Tu información de usuario
   - El token de acceso
   - Opciones para actualizar el token
   - Botón para cerrar sesión

## Arquitectura

### Componentes Principales

- **App.tsx**: Componente principal con routing y manejo de estado de autenticación
- **LoginComponent.tsx**: Pantalla de login
- **CallbackComponent.tsx**: Maneja la respuesta de Ping Identity después del login
- **Dashboard.tsx**: Pantalla principal para usuarios autenticados

### Servicios

- **authService.ts**: Maneja toda la lógica de autenticación con Ping Identity
- **pingConfig.ts**: Configuración centralizada de Ping Identity

### Flujo de Autenticación
1. Usuario hace clic en "Iniciar Sesión"
2. Se genera un código PKCE y se guarda en sessionStorage
3. Usuario es redirigido a Ping Identity
4. Después de autenticarse, Ping Identity redirige a `/callback`
5. El CallbackComponent intercambia el código por tokens
6. Los tokens se guardan de forma segura
7. Usuario es redirigido al dashboard

## Seguridad

- ✅ **PKCE (Proof Key for Code Exchange)**: Implementado para prevenir ataques de intercepción de código
- ✅ **State Parameter**: Usado para prevenir ataques CSRF
- ✅ **Secure Token Storage**: Los tokens se almacenan de manera segura
- ✅ **Token Validation**: Los tokens son validados antes de usar
- ✅ **Automatic Token Refresh**: Los tokens se actualizan automáticamente

## Scripts Disponibles

- `npm start`: Ejecuta la aplicación en modo desarrollo
- `npm build`: Construye la aplicación para producción
- `npm test`: Ejecuta las pruebas
- `npm eject`: Expone la configuración de webpack (irreversible)

## Solución de Problemas

### Error: "Invalid redirect URI"
- Verifica que la URL de redirección en Ping Identity coincida exactamente con `http://localhost:3000/callback`
- Asegúrate de que no hay espacios o caracteres extra

### Error: "Invalid client_id"
- Verifica que el CLIENT_ID en el archivo `.env` sea correcto
- Asegúrate de que la aplicación esté habilitada en Ping Identity

### Error: "CORS"
- Los errores CORS son normales en desarrollo local con Ping Identity
- En producción, configura el dominio correctamente en Ping Identity

### La aplicación no carga
- Verifica que todas las variables de entorno estén configuradas correctamente
- Revisa la consola del navegador para errores específicos
- Asegúrate de que el ENVIRONMENT_ID sea correcto

## Próximos Pasos

- [ ] Implementar manejo de errores más robusto
- [ ] Añadir pruebas unitarias
- [ ] Implementar logout global
- [ ] Añadir soporte para múltiples entornos
- [ ] Implementar caché de tokens
- [ ] Añadir logs de auditoria

## Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/NuevaCaracteristica`)
3. Commit tus cambios (`git commit -m 'Añadir nueva característica'`)
4. Push a la rama (`git push origin feature/NuevaCaracteristica`)
5. Abre un Pull Request

## Licencia

Este proyecto es solo para fines demostrativos.

## Soporte

Para problemas relacionados con:
- **Ping Identity**: Consulta la [documentación oficial](https://docs.pingidentity.com/)
- **Esta demo**: Abre un issue en este repositorio

