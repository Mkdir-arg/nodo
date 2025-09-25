# Inicialización del Proyecto

## Requisitos del Sistema

### Software Requerido
- **Docker** 20.10+ y **Docker Compose** 2.0+
- **Git** para clonar el repositorio
- **Make** (opcional, para comandos simplificados)

### Recursos Mínimos
- **RAM**: 4GB disponibles
- **Disco**: 2GB libres
- **Puertos**: 3008, 8000, 8080, 3308 disponibles

## Métodos de Inicialización

### 1. Inicialización Automática (Recomendado)

```bash
# Clonar repositorio
git clone <repository-url>
cd nodo

# Dar permisos de ejecución al script
chmod +x scripts/init.sh

# Ejecutar inicialización automática
./scripts/init.sh
```

### 2. Usando Make

```bash
# Ver comandos disponibles
make help

# Inicialización paso a paso
make build    # Construir imágenes
make up       # Levantar servicios
make migrate  # Ejecutar migraciones
make superuser # Crear superusuario
```

### 3. Inicialización Manual

#### Paso 1: Configuración de Variables
```bash
# Copiar archivo de ejemplo
cp .env.example .env

# Editar variables según necesidades
nano .env
```

#### Paso 2: Construcción de Imágenes
```bash
docker-compose build
```

#### Paso 3: Inicialización de Base de Datos
```bash
# Levantar solo MySQL primero
docker-compose up -d mysql

# Esperar que MySQL esté listo (30-60 segundos)
docker-compose logs mysql

# Levantar todos los servicios
docker-compose up -d
```

#### Paso 4: Configuración de Django
```bash
# Ejecutar migraciones
docker-compose exec backend python manage.py migrate

# Crear superusuario
docker-compose exec backend python manage.py createsuperuser

# Recopilar archivos estáticos
docker-compose exec backend python manage.py collectstatic --no-input
```

## Configuración de Variables de Entorno

### Archivo .env Principal

```bash
# Django Core
DJANGO_SECRET_KEY=tu_clave_secreta_aqui
DJANGO_DEBUG=1
ALLOWED_HOSTS=*,localhost,127.0.0.1
PORT=8000

# Base de Datos
DATABASE_NAME=nodo_db
DATABASE_USER=root
DATABASE_PASSWORD=root
DATABASE_HOST=mysql
DATABASE_PORT=3306

# Frontend
NEXT_PUBLIC_API_URL=http://backend:8000
FRONTEND_URL=http://localhost:3008
NEXT_PUBLIC_API_BASE=http://localhost:8000/api

# Seguridad
INACTIVITY_TIMEOUT_MINUTES=30
```

### Variables Críticas

| Variable | Descripción | Valor por Defecto |
|----------|-------------|-------------------|
| `DJANGO_SECRET_KEY` | Clave secreta de Django | **REQUERIDO** |
| `DATABASE_PASSWORD` | Contraseña de MySQL | `root` |
| `INACTIVITY_TIMEOUT_MINUTES` | Timeout de sesión | `30` |
| `DJANGO_DEBUG` | Modo debug | `1` (desarrollo) |

## Verificación de Instalación

### 1. Verificar Servicios
```bash
# Ver estado de containers
docker-compose ps

# Verificar logs
docker-compose logs
```

### 2. Verificar Conectividad

| Servicio | URL | Credenciales |
|----------|-----|--------------|
| Frontend | http://localhost:3008 | - |
| Backend API | http://localhost:8000/api | - |
| Admin Django | http://localhost:8000/admin | admin/admin123 |
| Adminer | http://localhost:8080 | root/root |

### 3. Verificar Base de Datos
```bash
# Conectar a MySQL
docker-compose exec mysql mysql -u root -p

# Verificar tablas
USE nodo_db;
SHOW TABLES;
```

## Comandos de Gestión

### Comandos Make Disponibles

```bash
make help           # Mostrar ayuda
make build          # Construir imágenes
make up             # Levantar servicios
make up-prod        # Levantar en producción
make down           # Bajar servicios
make restart        # Reiniciar servicios
make logs           # Ver logs
make logs-backend   # Ver logs del backend
make logs-frontend  # Ver logs del frontend
make clean          # Limpiar contenedores y volúmenes
make migrate        # Ejecutar migraciones
make makemigrations # Crear migraciones
make superuser      # Crear superusuario
make shell          # Shell de Django
make test           # Ejecutar tests
make collectstatic  # Recopilar archivos estáticos
make backup-db      # Backup de base de datos
make restore-db     # Restaurar base de datos
```

### Comandos Docker Compose Directos

```bash
# Gestión de servicios
docker-compose up -d
docker-compose down
docker-compose restart

# Logs
docker-compose logs -f
docker-compose logs -f backend
docker-compose logs -f frontend

# Ejecución de comandos
docker-compose exec backend python manage.py shell
docker-compose exec backend python manage.py migrate
docker-compose exec mysql mysql -u root -p
```

## Solución de Problemas Comunes

### 1. Puerto Ocupado
```bash
# Verificar puertos en uso
netstat -tulpn | grep :3008
netstat -tulpn | grep :8000

# Cambiar puertos en docker-compose.yml si es necesario
```

### 2. MySQL No Inicia
```bash
# Verificar logs de MySQL
docker-compose logs mysql

# Limpiar volúmenes si es necesario
docker-compose down -v
```

### 3. Frontend No Conecta con Backend
```bash
# Verificar variables de entorno
docker-compose exec frontend env | grep API

# Verificar conectividad
docker-compose exec frontend curl http://backend:8000/api/
```

### 4. Permisos de Archivos
```bash
# En sistemas Unix/Linux
sudo chown -R $USER:$USER .
chmod +x scripts/init.sh
```

## Configuración de Desarrollo

### 1. Hot Reload
- Frontend: Automático con Next.js
- Backend: Automático con Django runserver

### 2. Debugging
```bash
# Backend debugging
docker-compose exec backend python manage.py shell

# Frontend debugging
docker-compose exec frontend npm run dev
```

### 3. Tests
```bash
# Ejecutar tests del backend
docker-compose exec backend python manage.py test

# Ejecutar tests del frontend
docker-compose exec frontend npm test
```

## Configuración de Producción

### 1. Variables de Producción
```bash
# Cambiar en .env
DJANGO_DEBUG=0
ALLOWED_HOSTS=tu-dominio.com,www.tu-dominio.com
```

### 2. Usar Docker Compose de Producción
```bash
docker-compose -f docker-compose.prod.yml up -d
```

### 3. SSL y Nginx
- Configurar certificados SSL
- Usar Nginx como proxy reverso
- Configurar dominios en DNS