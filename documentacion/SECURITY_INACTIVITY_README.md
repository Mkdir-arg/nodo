# Sistema de Auto-Logout por Inactividad

Este documento describe la implementación del sistema de seguridad que desconecta automáticamente a los usuarios después de un período de inactividad configurable.

## Características

- **Detección de inactividad**: Monitorea la actividad del usuario (movimientos del mouse, clics, teclas, scroll)
- **Tiempo configurable**: Los administradores pueden configurar el tiempo de inactividad desde la interfaz web
- **Advertencia previa**: Muestra una advertencia 2 minutos antes del logout automático
- **Extensión de sesión**: Los usuarios pueden extender su sesión desde la advertencia
- **Configuración persistente**: La configuración se guarda en la base de datos

## Configuración

### Variables de Entorno

Agregar al archivo `.env`:

```bash
# Security Settings
INACTIVITY_TIMEOUT_MINUTES=30
```

Esta variable sirve como fallback si no hay configuración en la base de datos.

### Configuración desde la Interfaz Web

1. Ir a **Configuraciones** → **Sistema**
2. En la sección **Seguridad**, configurar el **Tiempo de inactividad (minutos)**
3. Rango permitido: 5 minutos a 8 horas (480 minutos)
4. Guardar configuraciones

## Instalación

### 1. Backend

El middleware ya está configurado en `settings.py`. Para configurar los valores por defecto:

```bash
# Ejecutar el comando de configuración
python manage.py setup_security_config
```

### 2. Frontend

Los componentes y hooks ya están integrados en el `AuthProvider`.

## Funcionamiento

### Backend

- **Middleware de Inactividad**: `InactivityMiddleware` verifica la última actividad en cada request
- **Middleware de Token**: `TokenExpirationMiddleware` verifica automáticamente la expiración de tokens JWT
- **Configuración Dinámica**: Los tokens JWT se generan con el mismo tiempo de vida que el timeout de inactividad
- **Respuesta**: Retorna error 401 con código `INACTIVITY_TIMEOUT` o `TOKEN_EXPIRED` cuando expira

### Frontend

- **Hook**: `useInactivityTimer` detecta actividad del usuario
- **Advertencia**: Muestra modal 2 minutos antes del logout
- **Auto-logout**: Limpia tokens y redirige a login
- **Interceptor**: Maneja respuestas de inactividad de la API

## Flujo de Usuario

1. Usuario inicia sesión
2. Sistema inicia timer de inactividad
3. Cada actividad del usuario resetea el timer
4. 2 minutos antes del timeout, se muestra advertencia
5. Usuario puede extender sesión o ser desconectado automáticamente
6. Si no hay actividad, se ejecuta logout automático

## Archivos Modificados

### Backend
- `config/middleware.py` - Middleware de inactividad
- `config/token_middleware.py` - Middleware de expiración de tokens
- `config/jwt_settings.py` - Configuración dinámica de JWT
- `config/auth_views.py` - Endpoint de configuración de seguridad
- `config/urls.py` - Ruta del endpoint
- `config/views.py` - Configuración del sistema
- `config/settings.py` - Registro de middlewares
- `users/views.py` - Vista personalizada de tokens
- `users/serializers.py` - Serializer con configuración dinámica
- `.env` y `.env.example` - Variables de entorno

### Frontend
- `lib/hooks/useInactivityTimer.ts` - Hook de detección de inactividad
- `components/ui/inactivity-warning.tsx` - Modal de advertencia
- `lib/AuthContext.tsx` - Integración del sistema
- `lib/api/index.ts` - Interceptor de respuestas
- `services/security.ts` - Servicio de configuración
- `app/configuraciones/_SystemSettings.tsx` - Interfaz de configuración

## Personalización

### Cambiar tiempo de advertencia

En `AuthContext.tsx`, modificar:

```typescript
warningMinutes: 2, // Cambiar a los minutos deseados
```

### Eventos de actividad

En `useInactivityTimer.ts`, modificar el array `events`:

```typescript
const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
```

### Mensaje de advertencia

Modificar el componente `InactivityWarning` para personalizar el mensaje.

## Consideraciones de Seguridad

- El timeout se aplica tanto en frontend como backend
- Los tokens JWT expiran automáticamente con el mismo tiempo que el timeout de inactividad
- Las sesiones se invalidan completamente al expirar
- La configuración solo puede ser modificada por usuarios autenticados
- El sistema funciona incluso si JavaScript está deshabilitado (middleware backend)

## Troubleshooting

### El sistema no funciona

1. Verificar que el middleware está registrado en `settings.py`
2. Ejecutar `python manage.py setup_security_config`
3. Verificar que la configuración existe en la base de datos

### Timeout muy corto/largo

1. Ir a Configuraciones → Sistema → Seguridad
2. Ajustar el valor entre 5 y 480 minutos
3. Guardar configuraciones

### Advertencia no aparece

1. Verificar que el usuario está autenticado
2. Verificar que no está en la página de login
3. Revisar la consola del navegador por errores