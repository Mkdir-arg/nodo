# Datos Extras y Configuraciones

## Descripción General

Esta sección documenta configuraciones adicionales, utilidades, herramientas de desarrollo, optimizaciones y funcionalidades complementarias del sistema Nodo.

## Configuraciones de Desarrollo

### 1. Variables de Entorno Completas

#### Archivo .env de Desarrollo
```bash
# === DJANGO CORE ===
DJANGO_SECRET_KEY=tu_clave_secreta_muy_larga_y_segura_aqui
DJANGO_DEBUG=1
ALLOWED_HOSTS=*,localhost,127.0.0.1,0.0.0.0
PORT=8000

# === BASE DE DATOS ===
DATABASE_NAME=nodo_db
DATABASE_USER=root
DATABASE_PASSWORD=root
DATABASE_HOST=mysql
DATABASE_PORT=3306

# === FRONTEND / API ===
NEXT_PUBLIC_API_URL=http://backend:8000
FRONTEND_URL=http://localhost:3008
NEXT_PUBLIC_API_BASE=http://localhost:8000/api

# === SEGURIDAD ===
INACTIVITY_TIMEOUT_MINUTES=30
JWT_ACCESS_TOKEN_LIFETIME_MINUTES=30
JWT_REFRESH_TOKEN_LIFETIME_DAYS=7

# === CORS ===
CORS_ALLOWED_ORIGINS=http://localhost:3008,http://127.0.0.1:3008
CORS_ALLOW_CREDENTIALS=true

# === LOGGING ===
LOG_LEVEL=INFO
LOG_FILE=logs/django.log
ENABLE_SQL_LOGGING=false

# === CACHE ===
CACHE_BACKEND=redis
REDIS_URL=redis://localhost:6379/0

# === EMAIL (opcional) ===
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=true
EMAIL_HOST_USER=tu_email@gmail.com
EMAIL_HOST_PASSWORD=tu_password_de_app

# === STORAGE (opcional) ===
USE_S3=false
AWS_ACCESS_KEY_ID=tu_access_key
AWS_SECRET_ACCESS_KEY=tu_secret_key
AWS_STORAGE_BUCKET_NAME=tu_bucket

# === MONITORING ===
ENABLE_METRICS=true
SENTRY_DSN=https://tu_sentry_dsn@sentry.io/proyecto
```

#### Archivo .env de Producción
```bash
# === DJANGO CORE ===
DJANGO_SECRET_KEY=clave_super_secreta_para_produccion
DJANGO_DEBUG=0
ALLOWED_HOSTS=tu-dominio.com,www.tu-dominio.com
PORT=8000

# === BASE DE DATOS ===
DATABASE_NAME=nodo_prod
DATABASE_USER=nodo_user
DATABASE_PASSWORD=password_super_seguro
DATABASE_HOST=db.tu-dominio.com
DATABASE_PORT=3306

# === FRONTEND / API ===
NEXT_PUBLIC_API_URL=https://api.tu-dominio.com
FRONTEND_URL=https://tu-dominio.com
NEXT_PUBLIC_API_BASE=https://api.tu-dominio.com/api

# === SEGURIDAD ===
INACTIVITY_TIMEOUT_MINUTES=15
JWT_ACCESS_TOKEN_LIFETIME_MINUTES=15
JWT_REFRESH_TOKEN_LIFETIME_DAYS=1

# === SSL ===
SECURE_SSL_REDIRECT=true
SECURE_PROXY_SSL_HEADER=HTTP_X_FORWARDED_PROTO,https
SESSION_COOKIE_SECURE=true
CSRF_COOKIE_SECURE=true

# === CORS ===
CORS_ALLOWED_ORIGINS=https://tu-dominio.com,https://www.tu-dominio.com
CORS_ALLOW_CREDENTIALS=true

# === CACHE ===
CACHE_BACKEND=redis
REDIS_URL=redis://redis.tu-dominio.com:6379/0

# === MONITORING ===
ENABLE_METRICS=true
SENTRY_DSN=https://tu_sentry_dsn@sentry.io/proyecto
```

### 2. Configuración de Docker

#### docker-compose.override.yml (Desarrollo)
```yaml
version: '3.8'

services:
  backend:
    volumes:
      - ./backend:/app
    environment:
      - DJANGO_DEBUG=1
      - WATCHDOG_ENABLED=1
    ports:
      - "8000:8000"
      - "8001:8001"  # Debug port

  frontend:
    volumes:
      - ./frontend:/app
      - /app/node_modules
      - /app/.next
    environment:
      - NODE_ENV=development
      - FAST_REFRESH=true
    ports:
      - "3008:3000"

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

volumes:
  redis_data:
```

## Herramientas de Desarrollo

### 1. Scripts de Utilidad

#### scripts/dev-setup.sh
```bash
#!/bin/bash
# Script de configuración para desarrollo

echo "🔧 Configurando entorno de desarrollo..."

# Crear directorios necesarios
mkdir -p logs
mkdir -p media
mkdir -p staticfiles

# Configurar pre-commit hooks
if command -v pre-commit &> /dev/null; then
    pre-commit install
    echo "✅ Pre-commit hooks instalados"
fi

# Configurar variables de entorno
if [ ! -f .env ]; then
    cp .env.example .env
    echo "📝 Archivo .env creado desde .env.example"
    echo "⚠️  Recuerda configurar las variables necesarias"
fi

# Instalar dependencias de Python
echo "📦 Instalando dependencias de Python..."
cd backend
pip install -r requirements.txt
cd ..

# Instalar dependencias de Node.js
echo "📦 Instalando dependencias de Node.js..."
cd frontend
npm install
cd ..

echo "✅ Configuración completada"
echo "🚀 Ejecuta 'make up' para iniciar los servicios"
```

#### scripts/backup.sh
```bash
#!/bin/bash
# Script de backup de base de datos

BACKUP_DIR="backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/nodo_backup_$DATE.sql"

# Crear directorio de backups
mkdir -p $BACKUP_DIR

# Realizar backup
echo "📦 Creando backup de base de datos..."
docker-compose exec -T mysql mysqldump -u root -proot nodo_db > $BACKUP_FILE

if [ $? -eq 0 ]; then
    echo "✅ Backup creado: $BACKUP_FILE"
    
    # Comprimir backup
    gzip $BACKUP_FILE
    echo "🗜️  Backup comprimido: $BACKUP_FILE.gz"
    
    # Limpiar backups antiguos (mantener últimos 7 días)
    find $BACKUP_DIR -name "*.gz" -mtime +7 -delete
    echo "🧹 Backups antiguos eliminados"
else
    echo "❌ Error creando backup"
    exit 1
fi
```

### 2. Configuración de Testing

#### pytest.ini
```ini
[tool:pytest]
DJANGO_SETTINGS_MODULE = config.settings
python_files = tests.py test_*.py *_tests.py
python_classes = Test* *Tests
python_functions = test_*
addopts = 
    --verbose
    --tb=short
    --strict-markers
    --disable-warnings
    --cov=.
    --cov-report=html
    --cov-report=term-missing
    --cov-fail-under=80
markers =
    slow: marks tests as slow
    integration: marks tests as integration tests
    unit: marks tests as unit tests
```

#### vitest.config.ts (Frontend)
```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    coverage: {
      reporter: ['text', 'html', 'lcov'],
      threshold: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80
        }
      }
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
})
```

## Optimizaciones de Rendimiento

### 1. Configuración de Cache

#### Redis Cache (Backend)
```python
# settings.py
CACHES = {
    'default': {
        'BACKEND': 'django_redis.cache.RedisCache',
        'LOCATION': os.getenv('REDIS_URL', 'redis://127.0.0.1:6379/1'),
        'OPTIONS': {
            'CLIENT_CLASS': 'django_redis.client.DefaultClient',
        }
    }
}

# Cache de sesiones
SESSION_ENGINE = 'django.contrib.sessions.backends.cache'
SESSION_CACHE_ALIAS = 'default'

# Cache de plantillas
TEMPLATES[0]['OPTIONS']['loaders'] = [
    ('django.template.loaders.cached.Loader', [
        'django.template.loaders.filesystem.Loader',
        'django.template.loaders.app_directories.Loader',
    ]),
]
```

#### Cache de API Responses
```python
# views.py
from django.core.cache import cache
from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_page

class PlantillaViewSet(viewsets.ModelViewSet):
    @method_decorator(cache_page(60 * 15))  # 15 minutos
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)
    
    def get_queryset(self):
        cache_key = f"plantillas_queryset_{self.request.user.id}"
        queryset = cache.get(cache_key)
        
        if queryset is None:
            queryset = Plantilla.objects.filter(estado='ACTIVO')
            cache.set(cache_key, queryset, 60 * 30)  # 30 minutos
            
        return queryset
```

### 2. Optimización de Queries

#### Select Related y Prefetch
```python
# Optimización de consultas
class LegajoViewSet(viewsets.ModelViewSet):
    def get_queryset(self):
        return Legajo.objects.select_related('plantilla').prefetch_related(
            'plantilla__fields',
            'flow_instances'
        )

# Uso de annotations para cálculos
from django.db.models import Count, Avg

class PlantillaViewSet(viewsets.ModelViewSet):
    def get_queryset(self):
        return Plantilla.objects.annotate(
            legajos_count=Count('legajos'),
            avg_completion_time=Avg('legajos__completion_time')
        )
```

### 3. Optimización Frontend

#### Code Splitting
```typescript
// Lazy loading de componentes
const PlantillasPage = lazy(() => import('@/pages/PlantillasPage'))
const LegajosPage = lazy(() => import('@/pages/LegajosPage'))
const FlowsPage = lazy(() => import('@/pages/FlowsPage'))

// Route-based code splitting
const AppRoutes = () => (
  <Suspense fallback={<LoadingSpinner />}>
    <Routes>
      <Route path="/plantillas" element={<PlantillasPage />} />
      <Route path="/legajos" element={<LegajosPage />} />
      <Route path="/flows" element={<FlowsPage />} />
    </Routes>
  </Suspense>
)
```

#### Memoización y Optimización
```typescript
// Memoización de componentes pesados
const ExpensiveComponent = memo(({ data }: Props) => {
  const processedData = useMemo(() => {
    return data.map(item => expensiveCalculation(item))
  }, [data])
  
  return <div>{/* render */}</div>
})

// Debounce para búsquedas
const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value)
  
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)
    
    return () => clearTimeout(handler)
  }, [value, delay])
  
  return debouncedValue
}
```

## Monitoreo y Logging

### 1. Configuración de Logging

#### Django Logging
```python
# settings.py
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '{levelname} {asctime} {module} {process:d} {thread:d} {message}',
            'style': '{',
        },
        'simple': {
            'format': '{levelname} {message}',
            'style': '{',
        },
        'json': {
            'format': '{"level": "%(levelname)s", "time": "%(asctime)s", "module": "%(module)s", "message": "%(message)s"}',
        },
    },
    'handlers': {
        'file': {
            'level': 'INFO',
            'class': 'logging.handlers.RotatingFileHandler',
            'filename': 'logs/django.log',
            'maxBytes': 1024*1024*15,  # 15MB
            'backupCount': 10,
            'formatter': 'verbose',
        },
        'console': {
            'level': 'DEBUG',
            'class': 'logging.StreamHandler',
            'formatter': 'simple',
        },
        'error_file': {
            'level': 'ERROR',
            'class': 'logging.handlers.RotatingFileHandler',
            'filename': 'logs/errors.log',
            'maxBytes': 1024*1024*15,
            'backupCount': 10,
            'formatter': 'json',
        },
    },
    'loggers': {
        'django': {
            'handlers': ['file', 'console'],
            'level': 'INFO',
            'propagate': True,
        },
        'nodo': {
            'handlers': ['file', 'error_file'],
            'level': 'DEBUG',
            'propagate': False,
        },
    },
}
```

### 2. Métricas y Monitoreo

#### Health Check Endpoint
```python
# views.py
from django.http import JsonResponse
from django.db import connection
from django.core.cache import cache

def health_check(request):
    """Endpoint de health check"""
    status = {
        'status': 'healthy',
        'timestamp': timezone.now().isoformat(),
        'services': {}
    }
    
    # Check database
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
        status['services']['database'] = 'healthy'
    except Exception as e:
        status['services']['database'] = f'unhealthy: {str(e)}'
        status['status'] = 'unhealthy'
    
    # Check cache
    try:
        cache.set('health_check', 'ok', 30)
        cache.get('health_check')
        status['services']['cache'] = 'healthy'
    except Exception as e:
        status['services']['cache'] = f'unhealthy: {str(e)}'
        status['status'] = 'unhealthy'
    
    return JsonResponse(status)
```

## Configuración de Producción

### 1. Nginx Configuration
```nginx
# nginx/conf.d/nodo.conf
upstream backend {
    server backend:8000;
}

upstream frontend {
    server frontend:3000;
}

server {
    listen 80;
    server_name tu-dominio.com www.tu-dominio.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name tu-dominio.com www.tu-dominio.com;
    
    ssl_certificate /etc/ssl/certs/tu-dominio.crt;
    ssl_certificate_key /etc/ssl/private/tu-dominio.key;
    
    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains";
    
    # Frontend
    location / {
        proxy_pass http://frontend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # Backend API
    location /api/ {
        proxy_pass http://backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # CORS headers
        add_header Access-Control-Allow-Origin "https://tu-dominio.com";
        add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS";
        add_header Access-Control-Allow-Headers "Authorization, Content-Type";
        add_header Access-Control-Allow-Credentials true;
    }
    
    # Static files
    location /static/ {
        alias /app/staticfiles/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # Media files
    location /media/ {
        alias /app/media/;
        expires 1y;
        add_header Cache-Control "public";
    }
}
```

### 2. Docker Compose Producción
```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx:/etc/nginx/conf.d
      - ./ssl:/etc/ssl
      - static_volume:/app/staticfiles
      - media_volume:/app/media
    depends_on:
      - backend
      - frontend
    restart: unless-stopped

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile.prod
    env_file: .env.prod
    volumes:
      - static_volume:/app/staticfiles
      - media_volume:/app/media
    depends_on:
      - mysql
      - redis
    restart: unless-stopped

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile.prod
    env_file: .env.prod
    depends_on:
      - backend
    restart: unless-stopped

  mysql:
    image: mysql:8.0
    env_file: .env.prod
    volumes:
      - mysql_data:/var/lib/mysql
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data
    restart: unless-stopped

volumes:
  mysql_data:
  redis_data:
  static_volume:
  media_volume:
```

## Comandos Útiles

### 1. Comandos de Desarrollo
```bash
# Desarrollo
make dev-setup          # Configurar entorno de desarrollo
make test               # Ejecutar todos los tests
make lint               # Ejecutar linters
make format             # Formatear código
make coverage           # Generar reporte de cobertura

# Base de datos
make migrate            # Ejecutar migraciones
make makemigrations     # Crear migraciones
make reset-db           # Resetear base de datos
make seed-data          # Cargar datos de prueba

# Logs y debugging
make logs               # Ver logs de todos los servicios
make logs-backend       # Ver logs del backend
make logs-frontend      # Ver logs del frontend
make shell              # Shell de Django
make dbshell            # Shell de MySQL

# Backup y restore
make backup             # Crear backup de BD
make restore FILE=...   # Restaurar backup
```

### 2. Comandos de Producción
```bash
# Despliegue
make deploy-prod        # Desplegar en producción
make update-prod        # Actualizar producción
make rollback           # Rollback a versión anterior

# Monitoreo
make health-check       # Verificar salud del sistema
make metrics            # Ver métricas del sistema
make performance        # Análisis de rendimiento

# Mantenimiento
make cleanup            # Limpiar archivos temporales
make optimize-db        # Optimizar base de datos
make update-deps        # Actualizar dependencias
```

## Troubleshooting

### 1. Problemas Comunes

#### Error de Conexión a MySQL
```bash
# Verificar estado de MySQL
docker-compose logs mysql

# Verificar conectividad
docker-compose exec backend python manage.py dbshell

# Resetear MySQL si es necesario
docker-compose down
docker volume rm nodo_mysql_data
docker-compose up -d mysql
```

#### Error de Permisos
```bash
# Corregir permisos en Linux/Mac
sudo chown -R $USER:$USER .
chmod +x scripts/*.sh

# En Windows con WSL
wsl --shutdown
wsl
```

#### Frontend no conecta con Backend
```bash
# Verificar variables de entorno
docker-compose exec frontend env | grep API

# Verificar conectividad
docker-compose exec frontend curl http://backend:8000/api/health/

# Verificar CORS
curl -H "Origin: http://localhost:3008" \
     -H "Access-Control-Request-Method: GET" \
     -X OPTIONS \
     http://localhost:8000/api/plantillas/
```

### 2. Logs de Debug
```bash
# Habilitar debug en Django
export DJANGO_DEBUG=1

# Logs detallados de SQL
export ENABLE_SQL_LOGGING=true

# Logs de autenticación
export LOG_AUTH_ATTEMPTS=true

# Logs de performance
export LOG_SLOW_QUERIES=true
```

Esta documentación proporciona una guía completa de configuraciones adicionales, herramientas de desarrollo, optimizaciones y procedimientos de mantenimiento para el sistema Nodo.