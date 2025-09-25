# Módulo de Configuración (Config)

## Descripción General

El módulo `config` es el núcleo del sistema Django que gestiona la configuración global, autenticación, middleware de seguridad y configuraciones del sistema.

## Estructura del Módulo

```
backend/config/
├── management/
│   └── commands/
│       ├── setup_initial_data.py      # Configuración inicial
│       └── setup_security_config.py   # Configuración de seguridad
├── migrations/
│   └── 0001_initial.py               # Migración inicial
├── __init__.py
├── asgi.py                          # Configuración ASGI
├── auth_views.py                    # Vistas de autenticación
├── jwt_settings.py                  # Configuración JWT
├── middleware.py                    # Middleware personalizado
├── models.py                        # Modelos de configuración
├── settings.py                      # Configuración principal
├── settings_prod.py                 # Configuración de producción
├── token_middleware.py              # Middleware de tokens
├── urls.py                          # URLs principales
├── views.py                         # Vistas de configuración
└── wsgi.py                          # Configuración WSGI
```

## Componentes Principales

### 1. Configuración Principal (settings.py)

#### Apps Instaladas
```python
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'rest_framework_simplejwt',
    'drf_spectacular',
    'django_filters',
    'corsheaders',
    'config',
    'users',
    'templates_app',
    'plantillas',
    'legajos',
    'flows',
]
```

#### Middleware Stack
```python
MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'config.token_middleware.TokenExpirationMiddleware',
    'config.middleware.InactivityMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]
```

#### Configuración de Base de Datos
```python
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.mysql",
        "NAME": os.getenv("DATABASE_NAME", "nodo"),
        "USER": os.getenv("DATABASE_USER", "root"),
        "PASSWORD": os.getenv("DATABASE_PASSWORD", "root"),
        "HOST": os.getenv("DATABASE_HOST", "mysql"),
        "PORT": os.getenv("DATABASE_PORT", "3306"),
        "OPTIONS": {"init_command": "SET sql_mode='STRICT_TRANS_TABLES'"},
    }
}
```

### 2. Modelo de Configuración del Sistema

```python
class SystemSettings(models.Model):
    key = models.CharField(max_length=100, unique=True)
    value = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'system_settings'
```

**Configuraciones Almacenadas:**
- `inactivityTimeoutMinutes`: Timeout de inactividad
- Configuraciones de seguridad
- Parámetros del sistema
- Configuraciones de módulos

### 3. Middleware de Seguridad

#### InactivityMiddleware
- **Propósito**: Controlar timeout de sesiones por inactividad
- **Funcionamiento**:
  - Monitorea actividad de usuarios autenticados
  - Configurable desde base de datos
  - Excluye rutas de autenticación
  - Actualiza última actividad en sesión

```python
class InactivityMiddleware:
    def get_timeout_minutes(self):
        # Obtiene timeout desde SystemSettings
        # Fallback a variable de entorno
        # Cache por 5 minutos
```

#### TokenExpirationMiddleware
- **Propósito**: Gestionar expiración de tokens JWT
- **Funcionamiento**:
  - Valida tokens en cada request
  - Maneja renovación automática
  - Limpia tokens expirados

### 4. Configuración JWT

```python
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=int(os.getenv('INACTIVITY_TIMEOUT_MINUTES', 30))),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
}
```

### 5. Configuración CORS

```python
CORS_ALLOW_CREDENTIALS = True
CORS_ALLOW_ALL_ORIGINS = True  # Solo desarrollo
CSRF_TRUSTED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:3006",
    "http://localhost:3008",
]
```

### 6. Configuración REST Framework

```python
REST_FRAMEWORK = {
    "DEFAULT_PERMISSION_CLASSES": [
        "rest_framework.permissions.AllowAny",
    ],
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ],
    "DEFAULT_FILTER_BACKENDS": [
        "django_filters.rest_framework.DjangoFilterBackend",
    ],
    "DEFAULT_SCHEMA_CLASS": "drf_spectacular.openapi.AutoSchema",
    "DEFAULT_THROTTLE_CLASSES": [
        "rest_framework.throttling.AnonRateThrottle",
        "rest_framework.throttling.UserRateThrottle",
    ],
    "DEFAULT_THROTTLE_RATES": {
        "anon": "100/hour",
        "user": "1000/hour",
    },
}
```

## Comandos de Gestión

### 1. setup_initial_data.py
```bash
python manage.py setup_initial_data
```
- Configura datos iniciales del sistema
- Crea configuraciones por defecto
- Inicializa parámetros de seguridad

### 2. setup_security_config.py
```bash
python manage.py setup_security_config
```
- Configura parámetros de seguridad
- Establece timeouts por defecto
- Configura políticas de autenticación

## Vistas de Autenticación

### auth_views.py
- **LoginView**: Autenticación con JWT
- **RefreshView**: Renovación de tokens
- **LogoutView**: Cierre de sesión
- **MeView**: Información del usuario actual

### Endpoints Principales
```
POST /api/token/          # Login
POST /api/token/refresh/  # Refresh token
POST /api/auth/logout/    # Logout
GET  /api/auth/me/        # User info
```

## URLs Principales

```python
urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/schema/swagger-ui/', SpectacularSwaggerView.as_view()),
    path('api/token/', TokenObtainPairView.as_view()),
    path('api/token/refresh/', TokenRefreshView.as_view()),
    path('api/auth/', include('config.auth_views')),
    path('api/users/', include('users.urls')),
    path('api/plantillas/', include('plantillas.urls')),
    path('api/legajos/', include('legajos.urls')),
    path('api/flows/', include('flows.urls')),
    path('api/templates/', include('templates_app.urls')),
]
```

## Configuraciones por Ambiente

### Desarrollo (settings.py)
- DEBUG = True
- CORS permisivo
- Logging detallado
- Base de datos local

### Producción (settings_prod.py)
- DEBUG = False
- CORS restrictivo
- Logging optimizado
- Configuraciones de seguridad adicionales

## Seguridad

### 1. Autenticación
- JWT con expiración configurable
- Refresh tokens seguros
- Middleware de validación

### 2. Autorización
- Permisos basados en Django
- Grupos de usuarios
- Validación por endpoint

### 3. Protección CSRF
- Tokens CSRF para formularios
- Dominios confiables configurados
- Validación automática

### 4. Rate Limiting
- Límites por usuario anónimo: 100/hora
- Límites por usuario autenticado: 1000/hora
- Throttling configurable

## Monitoreo y Logs

### 1. Logging
```python
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'file': {
            'level': 'INFO',
            'class': 'logging.FileHandler',
            'filename': 'django.log',
        },
    },
    'loggers': {
        'django': {
            'handlers': ['file'],
            'level': 'INFO',
            'propagate': True,
        },
    },
}
```

### 2. Métricas
- Requests por minuto
- Tiempo de respuesta
- Errores de autenticación
- Uso de memoria

## Configuración de Archivos Estáticos

```python
STATIC_URL = 'static/'
STATICFILES_DIRS = [BASE_DIR / 'static']
STATIC_ROOT = BASE_DIR / "staticfiles"
MEDIA_URL = "/media/"
MEDIA_ROOT = BASE_DIR / "media"
```

## Variables de Entorno Críticas

| Variable | Descripción | Requerido |
|----------|-------------|-----------|
| `DJANGO_SECRET_KEY` | Clave secreta de Django | ✅ |
| `DATABASE_HOST` | Host de MySQL | ✅ |
| `DATABASE_PASSWORD` | Contraseña de BD | ✅ |
| `INACTIVITY_TIMEOUT_MINUTES` | Timeout de sesión | ❌ |
| `ALLOWED_HOSTS` | Hosts permitidos | ❌ |
| `DEBUG` | Modo debug | ❌ |