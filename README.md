# Guía de Despliegue y Arquitectura - Proyecto NODO

## 📋 Tabla de Contenidos
1. [Arquitectura del Sistema](#arquitectura-del-sistema)
2. [Componentes Docker](#componentes-docker)
3. [Variables de Entorno](#variables-de-entorno)
4. [Despliegue Local](#despliegue-local)
5. [Despliegue en Producción](#despliegue-en-producción)
6. [Estructura del Proyecto](#estructura-del-proyecto)
7. [Troubleshooting](#troubleshooting)

---

## 🏗️ Arquitectura del Sistema

### Stack Tecnológico

**Backend:**
- Django 4.x + Django REST Framework
- Python 3.11
- MySQL 8.0
- Redis 7 (caché y sesiones)
- Gunicorn (servidor WSGI)

**Frontend:**
- Next.js 14.2.32
- React 18.3.1
- TypeScript 5.9.3
- TailwindCSS 3.4
- React Query (TanStack Query)
- Zustand (gestión de estado)

**Infraestructura:**
- Docker & Docker Compose
- Nginx (opcional para producción)

### Diagrama de Arquitectura

```
┌─────────────────────────────────────────────────────────────┐
│                         CLIENTE                              │
│                    (Navegador Web)                           │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (Next.js)                        │
│                    Puerto: 3010 → 3000                       │
│  - React 18 + TypeScript                                     │
│  - Server Side Rendering (SSR)                               │
│  - API Client con React Query                                │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTP/REST API
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                  BACKEND (Django + DRF)                      │
│                    Puerto: 8000                              │
│  - API REST con autenticación JWT                            │
│  - Gunicorn (3 workers, 2 threads)                           │
│  - Módulos: config, users, plantillas, legajos, flows       │
└─────────┬──────────────────────────────┬────────────────────┘
          │                              │
          ▼                              ▼
┌──────────────────────┐      ┌──────────────────────┐
│   MySQL 8.0          │      │   Redis 7            │
│   Puerto: 3310→3306  │      │   Puerto: 6380→6379  │
│   - Base de datos    │      │   - Caché            │
│   - Persistencia     │      │   - Sesiones         │
│   - Volumen: dbdata  │      │   - Rate limiting    │
└──────────────────────┘      └──────────────────────┘
```

### Módulos del Backend

1. **config**: Configuración principal, autenticación, middleware
2. **users**: Gestión de usuarios y permisos
3. **plantillas**: Sistema de plantillas dinámicas
4. **legajos**: Gestión de expedientes/legajos
5. **flows**: Motor de flujos de trabajo (workflow engine)
6. **templates_app**: Aplicación de templates

---

## 🐳 Componentes Docker

### 1. MySQL (Base de Datos)

```yaml
Imagen: mysql:8.0
Puerto: 3310:3306
Recursos:
  - CPU: 0.5-1.0 cores
  - RAM: 256M-512M
Volumen: ./dbdata:/var/lib/mysql
```

**Configuraciones especiales:**
- `max_connections=200`: Máximo de conexiones simultáneas
- `innodb_buffer_pool_size=256M`: Caché de InnoDB
- `innodb_log_file_size=64M`: Tamaño de logs de transacciones
- Autenticación: `mysql_native_password`

**Healthcheck:**
- Comando: `mysqladmin ping`
- Timeout: 20s
- Reintentos: 10

### 2. Redis (Caché)

```yaml
Imagen: redis:7-alpine
Puerto: 6380:6379
Recursos:
  - CPU: 0.25-0.5 cores
  - RAM: 128M-256M
Volumen: redis_data
```

**Configuraciones:**
- `maxmemory 256mb`: Límite de memoria
- `maxmemory-policy allkeys-lru`: Política de evicción
- `save 60 1`: Persistencia cada 60s si hay cambios
- `appendonly yes`: Log de operaciones (AOF)

### 3. Backend (Django)

```yaml
Build: ./backend/Dockerfile
Puerto: 8000
Recursos:
  - CPU: 0.5-1.0 cores
  - RAM: 512M-1G
Volúmenes:
  - ./backend:/app (código)
  - static_volume:/app/staticfiles
  - media_volume:/app/media
  - logs_volume:/app/logs
```

**Proceso de inicio:**
1. Instalar dependencias (`pip install -r requirements.txt`)
2. Crear migraciones (`makemigrations`)
3. Aplicar migraciones (`migrate`)
4. Crear datos de prueba (`create_test_data.py`)
5. Recolectar archivos estáticos (`collectstatic`)
6. Iniciar Gunicorn (3 workers, 2 threads, timeout 60s)

### 4. Frontend (Next.js)

```yaml
Build: ./frontend/Dockerfile
Puerto: 3010:3000
Recursos:
  - CPU: 0.5-1.0 cores
  - RAM: 512M-1G
Volúmenes:
  - ./frontend:/app (código)
  - frontend_node_modules:/app/node_modules
  - frontend_next:/app/.next
```

**Modos:**
- **Desarrollo**: `npm run dev` (hot reload)
- **Producción**: `npm run build && npm run start`

---

## 🔐 Variables de Entorno

### Archivo `.env` (Local)

```bash
# ============================================
# DJANGO CONFIGURATION
# ============================================
DJANGO_SECRET_KEY=django-insecure-dev-key-change-in-production-$(openssl rand -hex 32)
DJANGO_DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1,backend
PORT=8000

# ============================================
# DATABASE CONFIGURATION (MySQL)
# ============================================
DATABASE_NAME=nodo_db
DATABASE_USER=root
DATABASE_PASSWORD=root
DATABASE_HOST=mysql          # Nombre del servicio Docker
DATABASE_PORT=3306

# ============================================
# FRONTEND / API URLS
# ============================================
# URL pública del API (desde el navegador)
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXT_PUBLIC_API_BASE=http://localhost:8000/api

# URL del frontend
FRONTEND_URL=http://localhost:3010

# URL interna del API (comunicación entre contenedores)
API_BASE_INTERNAL=http://backend:8000/api

# ============================================
# REDIS CONFIGURATION
# ============================================
REDIS_URL=redis://redis:6379/1

# ============================================
# SECURITY SETTINGS
# ============================================
INACTIVITY_TIMEOUT_MINUTES=30
```

### Explicación de Variables Clave

#### Django
- **DJANGO_SECRET_KEY**: Clave secreta para firmar tokens y cookies. DEBE cambiarse en producción.
- **DJANGO_DEBUG**: `True` en desarrollo, `False` en producción.
- **ALLOWED_HOSTS**: Hosts permitidos para acceder a Django.

#### Base de Datos
- **DATABASE_HOST**: En Docker usa el nombre del servicio (`mysql`), en local puede ser `localhost`.
- **DATABASE_PORT**: Puerto interno (3306), externamente se expone en 3310.

#### URLs del API
- **NEXT_PUBLIC_API_BASE**: URL pública del API (accesible desde el navegador del cliente).
- **API_BASE_INTERNAL**: URL interna para comunicación servidor-servidor dentro de Docker.

#### Redis
- **REDIS_URL**: Conexión a Redis usando el nombre del servicio Docker.

#### Seguridad
- **INACTIVITY_TIMEOUT_MINUTES**: Tiempo de expiración del token JWT (30 minutos por defecto).

---

## 🚀 Despliegue Local

### Prerrequisitos

1. **Docker Desktop** instalado y corriendo
2. **Git** para clonar el repositorio
3. **Puertos disponibles**: 3010, 8000, 3310, 6380

### Pasos de Instalación

#### 1. Clonar el Repositorio

```bash
git clone <url-del-repositorio>
cd nodo
```

#### 2. Configurar Variables de Entorno

```bash
# Copiar el archivo de ejemplo
cp .env.example .env

# Editar el archivo .env con tus configuraciones
# En Windows:
notepad .env

# En Linux/Mac:
nano .env
```

#### 3. Construir y Levantar los Contenedores

```bash
# Construir las imágenes
docker-compose build

# Levantar todos los servicios
docker-compose up -d

# Ver los logs en tiempo real
docker-compose logs -f
```

#### 4. Verificar que los Servicios Estén Corriendo

```bash
# Ver el estado de los contenedores
docker-compose ps

# Deberías ver algo como:
# NAME                COMMAND                  SERVICE    STATUS
# nodo-mysql-1        "docker-entrypoint.s…"   mysql      Up (healthy)
# nodo-redis-1        "docker-entrypoint.s…"   redis      Up (healthy)
# nodo-backend-1      "sh -c ' mkdir -p /a…"   backend    Up
# nodo-frontend-1     "npm run dev -- -p 3…"   frontend   Up
```

#### 5. Acceder a la Aplicación

- **Frontend**: http://localhost:3010
- **Backend API**: http://localhost:8000/api
- **Admin Django**: http://localhost:8000/admin

#### 6. Crear Superusuario (Opcional)

```bash
docker-compose exec backend python manage.py createsuperuser
```

### Comandos Útiles para Desarrollo

```bash
# Detener todos los servicios
docker-compose down

# Detener y eliminar volúmenes (CUIDADO: borra la BD)
docker-compose down -v

# Reiniciar un servicio específico
docker-compose restart backend

# Ver logs de un servicio específico
docker-compose logs -f backend

# Ejecutar comandos en el backend
docker-compose exec backend python manage.py migrate
docker-compose exec backend python manage.py shell

# Ejecutar comandos en el frontend
docker-compose exec frontend npm install <paquete>

# Reconstruir un servicio específico
docker-compose up -d --build backend
```

---

## 🌐 Despliegue en Producción

### Diferencias con el Entorno Local

1. **Base de datos externa**: MySQL no se ejecuta en Docker, se usa una instancia externa (RDS, etc.)
2. **Variables de entorno**: Configuración específica de producción
3. **Dockerfile diferente**: `Dockerfile.prod` para el frontend
4. **Sin datos de prueba**: No se ejecuta `create_test_data.py`

### Archivo `.env` (Producción)

```bash
# ============================================
# DJANGO CONFIGURATION (PRODUCTION)
# ============================================
DJANGO_SECRET_KEY=<GENERAR-CLAVE-SEGURA-AQUI>
DJANGO_DEBUG=False
ALLOWED_HOSTS=34.239.176.172,tu-dominio.com
PORT=8000

# ============================================
# DATABASE CONFIGURATION (EXTERNAL)
# ============================================
DATABASE_NAME=nodo_db_prod
DATABASE_USER=nodo_user
DATABASE_PASSWORD=<PASSWORD-SEGURO>
DATABASE_HOST=<IP-O-HOSTNAME-DE-MYSQL>
DATABASE_PORT=3306

# ============================================
# FRONTEND / API URLS (PRODUCTION)
# ============================================
NEXT_PUBLIC_API_BASE=http://34.239.176.172:8000/api
API_BASE_INTERNAL=http://backend:8000/api
FRONTEND_URL=http://34.239.176.172:3010

# ============================================
# REDIS CONFIGURATION
# ============================================
REDIS_URL=redis://redis:6379/1

# ============================================
# SECURITY SETTINGS
# ============================================
INACTIVITY_TIMEOUT_MINUTES=30
```

### Pasos de Despliegue en Producción

#### 1. Preparar el Servidor

```bash
# Instalar Docker y Docker Compose
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Instalar Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

#### 2. Clonar y Configurar

```bash
# Clonar el repositorio
git clone <url-del-repositorio>
cd nodo

# Crear archivo .env de producción
nano .env
# (Copiar las variables de producción)
```

#### 3. Generar Secret Key Segura

```bash
# Generar una clave segura
python3 -c "import secrets; print(secrets.token_urlsafe(50))"

# O usando OpenSSL
openssl rand -hex 32
```

#### 4. Levantar con Docker Compose de Producción

```bash
# Usar el archivo docker-compose.prod.yml
docker-compose -f docker-compose.prod.yml up -d --build

# Ver logs
docker-compose -f docker-compose.prod.yml logs -f
```

#### 5. Configurar Base de Datos Externa

Si usas MySQL externo (no en Docker):

```bash
# Conectarse al servidor MySQL
mysql -h <HOST> -u <USER> -p

# Crear la base de datos
CREATE DATABASE nodo_db_prod CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# Crear usuario
CREATE USER 'nodo_user'@'%' IDENTIFIED BY '<PASSWORD>';
GRANT ALL PRIVILEGES ON nodo_db_prod.* TO 'nodo_user'@'%';
FLUSH PRIVILEGES;
```

#### 6. Ejecutar Migraciones

```bash
docker-compose -f docker-compose.prod.yml exec backend python manage.py migrate
docker-compose -f docker-compose.prod.yml exec backend python manage.py collectstatic --no-input
docker-compose -f docker-compose.prod.yml exec backend python manage.py createsuperuser
```

#### 7. Configurar Firewall

```bash
# Permitir puertos necesarios
sudo ufw allow 8000/tcp
sudo ufw allow 3010/tcp
sudo ufw allow 22/tcp
sudo ufw enable
```

### Configuración con Nginx (Recomendado)

Crear archivo `/etc/nginx/sites-available/nodo`:

```nginx
server {
    listen 80;
    server_name tu-dominio.com;

    # Frontend
    location / {
        proxy_pass http://localhost:3010;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Archivos estáticos del backend
    location /static {
        alias /ruta/al/proyecto/backend/staticfiles;
    }

    location /media {
        alias /ruta/al/proyecto/backend/media;
    }
}
```

Activar el sitio:

```bash
sudo ln -s /etc/nginx/sites-available/nodo /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

---

## 📁 Estructura del Proyecto

```
nodo/
├── backend/                    # Aplicación Django
│   ├── config/                 # Configuración principal
│   │   ├── settings.py         # Settings de desarrollo
│   │   ├── settings_prod.py    # Settings de producción
│   │   ├── urls.py             # URLs principales
│   │   ├── middleware.py       # Middleware personalizado
│   │   └── jwt_settings.py     # Configuración JWT
│   ├── users/                  # Módulo de usuarios
│   ├── plantillas/             # Módulo de plantillas
│   ├── legajos/                # Módulo de legajos
│   ├── flows/                  # Motor de flujos
│   │   ├── flow_engine.py      # Motor principal
│   │   ├── executor.py         # Ejecutor de nodos
│   │   └── scheduler.py        # Programador de tareas
│   ├── templates_app/          # Aplicación de templates
│   ├── static/                 # Archivos estáticos
│   ├── media/                  # Archivos subidos
│   ├── logs/                   # Logs de la aplicación
│   ├── requirements.txt        # Dependencias Python
│   ├── Dockerfile              # Dockerfile de desarrollo
│   ├── manage.py               # CLI de Django
│   └── create_test_data.py     # Script de datos de prueba
│
├── frontend/                   # Aplicación Next.js
│   ├── src/
│   │   ├── app/                # App Router de Next.js
│   │   ├── components/         # Componentes React
│   │   ├── hooks/              # Custom hooks
│   │   ├── services/           # Servicios API
│   │   ├── store/              # Estado global (Zustand)
│   │   ├── types/              # Tipos TypeScript
│   │   └── styles/             # Estilos globales
│   ├── public/                 # Archivos públicos
│   ├── package.json            # Dependencias Node
│   ├── Dockerfile              # Dockerfile de desarrollo
│   ├── Dockerfile.prod         # Dockerfile de producción
│   ├── next.config.js          # Configuración Next.js
│   └── tsconfig.json           # Configuración TypeScript
│
├── nginx/                      # Configuración Nginx
│   └── conf.d/
│       └── default.conf
│
├── dbdata/                     # Datos de MySQL (volumen)
├── documentacion/              # Documentación del proyecto
│   └── docs/
│       ├── 01-arquitectura.md
│       ├── 02-inicializacion.md
│       └── ...
│
├── .env                        # Variables de entorno
├── docker-compose.yml          # Compose de desarrollo
├── docker-compose.prod.yml     # Compose de producción
└── .gitignore
```

---

## 🔧 Troubleshooting

### Problema: Los contenedores no inician

```bash
# Ver logs detallados
docker-compose logs

# Verificar que los puertos no estén en uso
netstat -ano | findstr :3010
netstat -ano | findstr :8000
netstat -ano | findstr :3310

# Limpiar y reconstruir
docker-compose down -v
docker-compose build --no-cache
docker-compose up -d
```

### Problema: Error de conexión a MySQL

```bash
# Verificar que MySQL esté healthy
docker-compose ps

# Ver logs de MySQL
docker-compose logs mysql

# Esperar a que MySQL esté listo
docker-compose exec mysql mysqladmin ping -h localhost

# Verificar credenciales en .env
cat .env | grep DATABASE
```

### Problema: Frontend no se conecta al Backend

1. Verificar que `NEXT_PUBLIC_API_BASE` apunte a `http://localhost:8000/api`
2. Verificar CORS en `backend/config/settings.py`
3. Verificar que el backend esté corriendo: `curl http://localhost:8000/api/`

### Problema: Migraciones no se aplican

```bash
# Aplicar migraciones manualmente
docker-compose exec backend python manage.py migrate

# Ver estado de migraciones
docker-compose exec backend python manage.py showmigrations

# Crear migraciones faltantes
docker-compose exec backend python manage.py makemigrations
```

### Problema: Archivos estáticos no se cargan

```bash
# Recolectar archivos estáticos
docker-compose exec backend python manage.py collectstatic --no-input --clear

# Verificar permisos
docker-compose exec backend ls -la /app/staticfiles
```

### Problema: Redis no conecta

```bash
# Verificar que Redis esté corriendo
docker-compose exec redis redis-cli ping
# Debería responder: PONG

# Ver logs de Redis
docker-compose logs redis

# Probar conexión desde el backend
docker-compose exec backend python manage.py shell
>>> from django.core.cache import cache
>>> cache.set('test', 'value')
>>> cache.get('test')
```

### Problema: Permisos en Windows

Si tienes problemas con volúmenes en Windows:

1. Asegúrate de que Docker Desktop tenga acceso a la unidad
2. Configura en Docker Desktop: Settings → Resources → File Sharing
3. Agrega la carpeta del proyecto

### Problema: Out of Memory

Si los contenedores se quedan sin memoria:

```bash
# Ver uso de recursos
docker stats

# Aumentar límites en docker-compose.yml
# Editar la sección deploy.resources.limits.memory
```

---

## 📚 Recursos Adicionales

- **Documentación Django**: https://docs.djangoproject.com/
- **Documentación Next.js**: https://nextjs.org/docs
- **Docker Compose**: https://docs.docker.com/compose/
- **MySQL 8.0**: https://dev.mysql.com/doc/refman/8.0/en/

---

## 🔒 Checklist de Seguridad para Producción

- [ ] Cambiar `DJANGO_SECRET_KEY` por una clave segura
- [ ] Establecer `DJANGO_DEBUG=False`
- [ ] Configurar `ALLOWED_HOSTS` correctamente
- [ ] Usar contraseñas fuertes para MySQL
- [ ] Configurar HTTPS con certificados SSL
- [ ] Configurar firewall (UFW, iptables)
- [ ] Limitar `CORS_ALLOW_ALL_ORIGINS` a dominios específicos
- [ ] Configurar backups automáticos de la base de datos
- [ ] Implementar rate limiting
- [ ] Configurar logs y monitoreo
- [ ] Actualizar dependencias regularmente

---

**Última actualización**: 2024
**Versión del documento**: 1.0
