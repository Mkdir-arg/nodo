# Guía Detallada de Configuración del Servidor y Nginx

## 📋 Tabla de Contenidos
1. [Arquitectura del Servidor](#arquitectura-del-servidor)
2. [Configuración de Nginx](#configuración-de-nginx)
3. [Configuración del Backend](#configuración-del-backend)
4. [Configuración del Frontend](#configuración-del-frontend)
5. [Despliegue Paso a Paso](#despliegue-paso-a-paso)
6. [Monitoreo y Logs](#monitoreo-y-logs)
7. [Optimización y Performance](#optimización-y-performance)

---

## 🏗️ Arquitectura del Servidor

### Flujo de Peticiones

```
Internet
   │
   ▼
┌─────────────────────────────────────────────────────────┐
│  Servidor (Ubuntu/Debian)                               │
│  IP: 34.239.176.172                                     │
│                                                          │
│  ┌────────────────────────────────────────────────┐    │
│  │  Nginx (Puerto 80/443)                         │    │
│  │  - Reverse Proxy                               │    │
│  │  - Load Balancer                               │    │
│  │  - SSL Termination                             │    │
│  │  - Static Files Server                         │    │
│  └──────┬──────────────────────┬──────────────────┘    │
│         │                      │                        │
│         ▼                      ▼                        │
│  ┌─────────────┐      ┌──────────────────┐            │
│  │  Frontend   │      │  Backend         │            │
│  │  Next.js    │      │  Django+Gunicorn │            │
│  │  :3000      │      │  :8000           │            │
│  └─────────────┘      └────────┬─────────┘            │
│                                 │                       │
│                    ┌────────────┴────────────┐         │
│                    ▼                         ▼         │
│              ┌──────────┐              ┌─────────┐    │
│              │  MySQL   │              │  Redis  │    │
│              │  :3306   │              │  :6379  │    │
│              └──────────┘              └─────────┘    │
└─────────────────────────────────────────────────────────┘
```

### Componentes del Servidor

1. **Nginx**: Servidor web y reverse proxy
2. **Docker**: Contenedores para cada servicio
3. **Docker Compose**: Orquestación de contenedores
4. **Systemd**: Gestión de servicios del sistema
5. **UFW**: Firewall

---

## ⚙️ Configuración de Nginx

### Estructura de Archivos

```
/etc/nginx/
├── nginx.conf              # Configuración principal
├── conf.d/
│   └── default.conf        # Configuración del sitio
├── sites-available/        # Sitios disponibles
├── sites-enabled/          # Sitios activos (symlinks)
└── mime.types              # Tipos MIME
```

### 1. Archivo Principal: nginx.conf

**Ubicación**: `/etc/nginx/nginx.conf`

```nginx
user nginx;
worker_processes auto;
error_log /var/log/nginx/error.log warn;
pid /var/run/nginx.pid;

events {
    worker_connections 1024;
    use epoll;
    multi_accept on;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    # Logging
    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for"';
    access_log /var/log/nginx/access.log main;

    # Performance
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;
    client_max_body_size 20M;

    # Gzip Compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/json
        application/javascript
        application/xml+rss
        application/atom+xml
        image/svg+xml;

    # Security Headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";

    include /etc/nginx/conf.d/*.conf;
}
```

#### Explicación de Directivas Principales

**Sección `events`:**
- `worker_connections 1024`: Cada worker puede manejar 1024 conexiones simultáneas
- `use epoll`: Método eficiente de I/O para Linux
- `multi_accept on`: Acepta múltiples conexiones a la vez

**Sección `http` - Performance:**
- `sendfile on`: Transferencia eficiente de archivos
- `tcp_nopush on`: Optimiza el envío de paquetes TCP
- `tcp_nodelay on`: Desactiva el algoritmo de Nagle para baja latencia
- `keepalive_timeout 65`: Mantiene conexiones abiertas 65 segundos
- `client_max_body_size 20M`: Permite uploads de hasta 20MB

**Gzip Compression:**
- `gzip_comp_level 6`: Nivel de compresión (1-9, 6 es óptimo)
- `gzip_min_length 1024`: Solo comprime archivos > 1KB
- `gzip_types`: Tipos de archivos a comprimir

**Security Headers:**
- `X-Frame-Options DENY`: Previene clickjacking
- `X-Content-Type-Options nosniff`: Previene MIME sniffing
- `X-XSS-Protection`: Protección contra XSS

### 2. Configuración del Sitio: default.conf

**Ubicación**: `/etc/nginx/conf.d/default.conf`

```nginx
# Definición de upstreams (backends)
upstream backend {
    server backend:8000;
    # Para múltiples instancias:
    # server backend1:8000 weight=3;
    # server backend2:8000 weight=2;
    # keepalive 32;
}

upstream frontend {
    server frontend:3000;
}

server {
    listen 80;
    server_name localhost 34.239.176.172 tu-dominio.com;

    # Logs específicos del sitio
    access_log /var/log/nginx/nodo_access.log;
    error_log /var/log/nginx/nodo_error.log;

    # Frontend - Todas las rutas por defecto
    location / {
        proxy_pass http://frontend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # WebSocket support para Next.js Hot Reload
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Backend API
    location /api/ {
        proxy_pass http://backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # CORS headers (si es necesario)
        add_header Access-Control-Allow-Origin *;
        add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS";
        add_header Access-Control-Allow-Headers "Authorization, Content-Type";
        
        # Timeouts para operaciones largas
        proxy_connect_timeout 300s;
        proxy_send_timeout 300s;
        proxy_read_timeout 300s;
    }

    # Django Admin
    location /admin/ {
        proxy_pass http://backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Archivos estáticos (CSS, JS, imágenes del backend)
    location /static/ {
        alias /var/www/static/;
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
    }

    # Archivos media (uploads de usuarios)
    location /media/ {
        alias /var/www/media/;
        expires 30d;
        add_header Cache-Control "public";
    }

    # Health check endpoint
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }

    # Bloquear acceso a archivos sensibles
    location ~ /\. {
        deny all;
        access_log off;
        log_not_found off;
    }
}
```

#### Explicación Detallada de Locations

**1. `location /` (Frontend)**
- Maneja todas las rutas que no coincidan con otras locations
- `proxy_pass http://frontend`: Redirige al contenedor de Next.js
- Headers `X-Real-IP` y `X-Forwarded-For`: Preservan la IP real del cliente
- WebSocket support: Necesario para Hot Module Replacement en desarrollo

**2. `location /api/` (Backend API)**
- Todas las peticiones a `/api/*` van al backend Django
- Timeouts más largos (300s) para operaciones que pueden tardar
- CORS headers: Permiten peticiones desde otros dominios

**3. `location /static/` (Archivos Estáticos)**
- `alias /var/www/static/`: Sirve archivos directamente desde el filesystem
- `expires 1y`: Cache de 1 año en el navegador
- `immutable`: El archivo nunca cambiará (bueno para versionado)
- `access_log off`: No registra cada petición de archivo estático

**4. `location /media/` (Uploads)**
- Similar a static pero con cache más corto (30 días)
- Archivos pueden cambiar con más frecuencia

### 3. Configuración con SSL/HTTPS

Para producción con certificado SSL:

```nginx
server {
    listen 80;
    server_name tu-dominio.com;
    
    # Redirigir todo a HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name tu-dominio.com;

    # Certificados SSL
    ssl_certificate /etc/letsencrypt/live/tu-dominio.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/tu-dominio.com/privkey.pem;
    
    # Configuración SSL moderna
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    
    # HSTS (HTTP Strict Transport Security)
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # ... resto de la configuración (locations, etc.)
}
```

---

## 🐍 Configuración del Backend

### Gunicorn Configuration

Gunicorn es el servidor WSGI que ejecuta Django en producción.

**Comando actual en docker-compose.yml:**
```bash
gunicorn config.wsgi:application \
  --bind 0.0.0.0:8000 \
  --workers 3 \
  --threads 2 \
  --timeout 60 \
  --access-logfile - \
  --error-logfile - \
  --log-level info
```

#### Explicación de Parámetros

- `--bind 0.0.0.0:8000`: Escucha en todas las interfaces en el puerto 8000
- `--workers 3`: 3 procesos worker (fórmula: `2 * CPU_cores + 1`)
- `--threads 2`: 2 threads por worker (total: 6 threads)
- `--timeout 60`: Timeout de 60 segundos para requests
- `--access-logfile -`: Logs de acceso a stdout
- `--error-logfile -`: Logs de error a stdout
- `--log-level info`: Nivel de logging

#### Archivo de Configuración Alternativo

Crear `gunicorn.conf.py`:

```python
import multiprocessing

# Server socket
bind = "0.0.0.0:8000"
backlog = 2048

# Worker processes
workers = multiprocessing.cpu_count() * 2 + 1
worker_class = "sync"
worker_connections = 1000
timeout = 60
keepalive = 2

# Logging
accesslog = "-"
errorlog = "-"
loglevel = "info"
access_log_format = '%(h)s %(l)s %(u)s %(t)s "%(r)s" %(s)s %(b)s "%(f)s" "%(a)s"'

# Process naming
proc_name = "nodo_backend"

# Server mechanics
daemon = False
pidfile = None
umask = 0
user = None
group = None
tmp_upload_dir = None

# SSL (si se usa)
# keyfile = "/path/to/key.pem"
# certfile = "/path/to/cert.pem"
```

Usar con: `gunicorn -c gunicorn.conf.py config.wsgi:application`

### Django Settings para Producción

**Archivo**: `backend/config/settings_prod.py`

```python
from .settings import *
import os

# SECURITY
DEBUG = False
SECRET_KEY = os.environ.get('DJANGO_SECRET_KEY')
ALLOWED_HOSTS = ['34.239.176.172', 'tu-dominio.com', 'www.tu-dominio.com']

# Database - Usar MySQL externo en producción
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': os.getenv('DATABASE_NAME'),
        'USER': os.getenv('DATABASE_USER'),
        'PASSWORD': os.getenv('DATABASE_PASSWORD'),
        'HOST': os.getenv('DATABASE_HOST'),
        'PORT': os.getenv('DATABASE_PORT', '3306'),
        'OPTIONS': {
            'init_command': "SET sql_mode='STRICT_TRANS_TABLES'",
            'charset': 'utf8mb4',
        },
        'CONN_MAX_AGE': 600,  # Conexiones persistentes
    }
}

# Static files
STATIC_ROOT = '/app/staticfiles'
MEDIA_ROOT = '/app/media'

# Security settings
SECURE_SSL_REDIRECT = True  # Redirigir HTTP a HTTPS
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = 'DENY'

# CORS
CORS_ALLOW_ALL_ORIGINS = False
CORS_ALLOWED_ORIGINS = [
    "https://tu-dominio.com",
    "https://www.tu-dominio.com",
]

# Logging
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '{levelname} {asctime} {module} {process:d} {thread:d} {message}',
            'style': '{',
        },
    },
    'handlers': {
        'file': {
            'level': 'INFO',
            'class': 'logging.handlers.RotatingFileHandler',
            'filename': '/app/logs/django.log',
            'maxBytes': 1024 * 1024 * 15,  # 15MB
            'backupCount': 10,
            'formatter': 'verbose',
        },
        'console': {
            'level': 'INFO',
            'class': 'logging.StreamHandler',
            'formatter': 'verbose',
        },
    },
    'root': {
        'handlers': ['console', 'file'],
        'level': 'INFO',
    },
}
```

### Scripts de Inicio

**entrypoint.sh** (Desarrollo):
```bash
#!/bin/sh
python manage.py makemigrations --noinput
python manage.py migrate --noinput
python manage.py setup_initial_data
python manage.py collectstatic --noinput
exec "$@"
```

**start_prod.sh** (Producción):
```bash
#!/bin/bash
export DJANGO_SETTINGS_MODULE=config.settings_prod
python manage.py migrate
python manage.py collectstatic --noinput
gunicorn --bind 0.0.0.0:$PORT config.wsgi:application
```

---

## ⚛️ Configuración del Frontend

### Next.js en Producción

**Dockerfile.prod**:
```dockerfile
FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT 3000

CMD ["node", "server.js"]
```

### Variables de Entorno del Frontend

```bash
# .env.production
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1

# API URLs
NEXT_PUBLIC_API_BASE=https://tu-dominio.com/api
API_BASE_INTERNAL=http://backend:8000/api

# Otras configuraciones
NEXT_PUBLIC_APP_NAME=NODO
NEXT_PUBLIC_VERSION=1.0.0
```

---

## 🚀 Despliegue Paso a Paso

### 1. Preparación del Servidor

```bash
# Actualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar dependencias
sudo apt install -y curl git ufw

# Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Instalar Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Instalar Nginx
sudo apt install -y nginx

# Verificar instalaciones
docker --version
docker-compose --version
nginx -v
```

### 2. Configurar Firewall

```bash
# Configurar UFW
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable

# Verificar estado
sudo ufw status
```

### 3. Clonar y Configurar Proyecto

```bash
# Crear directorio
sudo mkdir -p /var/www/nodo
cd /var/www/nodo

# Clonar repositorio
git clone <url-repositorio> .

# Crear archivo .env
nano .env
# (Copiar configuración de producción)

# Crear directorios necesarios
mkdir -p logs
sudo chown -R $USER:$USER /var/www/nodo
```

### 4. Configurar Nginx

```bash
# Copiar configuración
sudo cp nginx/nginx.conf /etc/nginx/nginx.conf
sudo cp nginx/conf.d/default.conf /etc/nginx/conf.d/nodo.conf

# O crear configuración personalizada
sudo nano /etc/nginx/sites-available/nodo

# Crear symlink
sudo ln -s /etc/nginx/sites-available/nodo /etc/nginx/sites-enabled/

# Eliminar configuración default
sudo rm /etc/nginx/sites-enabled/default

# Probar configuración
sudo nginx -t

# Recargar Nginx
sudo systemctl reload nginx
```

### 5. Levantar Aplicación con Docker

```bash
# Construir imágenes
docker-compose -f docker-compose.prod.yml build

# Levantar servicios
docker-compose -f docker-compose.prod.yml up -d

# Ver logs
docker-compose -f docker-compose.prod.yml logs -f

# Verificar estado
docker-compose -f docker-compose.prod.yml ps
```

### 6. Configurar SSL con Let's Encrypt

```bash
# Instalar Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obtener certificado
sudo certbot --nginx -d tu-dominio.com -d www.tu-dominio.com

# Renovación automática (ya configurado por defecto)
sudo certbot renew --dry-run

# Verificar timer de renovación
sudo systemctl status certbot.timer
```

### 7. Configurar Servicios Systemd

Crear `/etc/systemd/system/nodo.service`:

```ini
[Unit]
Description=NODO Application
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/var/www/nodo
ExecStart=/usr/local/bin/docker-compose -f docker-compose.prod.yml up -d
ExecStop=/usr/local/bin/docker-compose -f docker-compose.prod.yml down
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
```

Activar servicio:
```bash
sudo systemctl daemon-reload
sudo systemctl enable nodo
sudo systemctl start nodo
sudo systemctl status nodo
```

---

## 📊 Monitoreo y Logs

### Logs de Nginx

```bash
# Access logs
sudo tail -f /var/log/nginx/access.log

# Error logs
sudo tail -f /var/log/nginx/error.log

# Logs específicos del sitio
sudo tail -f /var/log/nginx/nodo_access.log
sudo tail -f /var/log/nginx/nodo_error.log

# Analizar logs con GoAccess
sudo apt install goaccess
sudo goaccess /var/log/nginx/access.log -o /var/www/html/report.html --log-format=COMBINED
```

### Logs de Docker

```bash
# Ver logs de todos los servicios
docker-compose logs -f

# Logs de un servicio específico
docker-compose logs -f backend
docker-compose logs -f frontend

# Últimas 100 líneas
docker-compose logs --tail=100 backend

# Logs con timestamps
docker-compose logs -f -t backend
```

### Logs de Django

```bash
# Dentro del contenedor
docker-compose exec backend tail -f /app/logs/django.log

# Desde el host (si está montado)
tail -f ./backend/logs/django.log
```

### Monitoreo de Recursos

```bash
# Ver uso de recursos de contenedores
docker stats

# Ver procesos en contenedores
docker-compose top

# Espacio en disco
df -h
docker system df

# Limpiar recursos no usados
docker system prune -a
```

---

## ⚡ Optimización y Performance

### 1. Optimización de Nginx

```nginx
# En nginx.conf

# Aumentar worker_connections
events {
    worker_connections 2048;
}

# Buffer sizes
http {
    client_body_buffer_size 10K;
    client_header_buffer_size 1k;
    client_max_body_size 20M;
    large_client_header_buffers 2 1k;
}

# Timeouts
http {
    client_body_timeout 12;
    client_header_timeout 12;
    send_timeout 10;
}

# Caching
http {
    proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=my_cache:10m max_size=1g inactive=60m;
    
    location /api/ {
        proxy_cache my_cache;
        proxy_cache_valid 200 10m;
        proxy_cache_use_stale error timeout http_500 http_502 http_503 http_504;
    }
}
```

### 2. Optimización de Gunicorn

```python
# gunicorn.conf.py

# Usar worker class gevent para I/O bound
worker_class = "gevent"
worker_connections = 1000

# O usar uvicorn para async
worker_class = "uvicorn.workers.UvicornWorker"

# Preload app para compartir memoria
preload_app = True

# Graceful timeout
graceful_timeout = 30
```

### 3. Optimización de MySQL

```sql
-- Configuración en /etc/mysql/my.cnf

[mysqld]
max_connections = 200
innodb_buffer_pool_size = 1G
innodb_log_file_size = 256M
innodb_flush_log_at_trx_commit = 2
innodb_flush_method = O_DIRECT
query_cache_size = 0
query_cache_type = 0
```

### 4. Optimización de Redis

```bash
# En docker-compose.yml
command: redis-server --maxmemory 512mb --maxmemory-policy allkeys-lru --save 60 1000
```

### 5. Monitoreo con Prometheus + Grafana (Opcional)

```yaml
# docker-compose.monitoring.yml
services:
  prometheus:
    image: prom/prometheus
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml

  grafana:
    image: grafana/grafana
    ports:
      - "3000:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
```

---

## 🔒 Checklist de Seguridad

- [ ] Firewall configurado (UFW)
- [ ] SSL/TLS habilitado (Let's Encrypt)
- [ ] Headers de seguridad en Nginx
- [ ] `DEBUG=False` en Django
- [ ] Secret keys seguras y únicas
- [ ] Contraseñas fuertes en base de datos
- [ ] Acceso SSH solo con claves
- [ ] Fail2ban instalado
- [ ] Backups automáticos configurados
- [ ] Logs rotados automáticamente
- [ ] Rate limiting configurado
- [ ] CORS configurado correctamente

---

## 📝 Comandos Útiles de Administración

```bash
# Reiniciar servicios
sudo systemctl restart nginx
docker-compose restart backend

# Ver estado
sudo systemctl status nginx
docker-compose ps

# Actualizar aplicación
cd /var/www/nodo
git pull
docker-compose -f docker-compose.prod.yml build
docker-compose -f docker-compose.prod.yml up -d

# Backup de base de datos
docker-compose exec mysql mysqldump -u root -p nodo_db > backup_$(date +%Y%m%d).sql

# Restaurar base de datos
docker-compose exec -T mysql mysql -u root -p nodo_db < backup_20240101.sql

# Ver certificados SSL
sudo certbot certificates

# Renovar certificados manualmente
sudo certbot renew

# Limpiar logs antiguos
sudo find /var/log/nginx -name "*.log" -mtime +30 -delete
```

---

**Última actualización**: 2024
**Versión**: 1.0
