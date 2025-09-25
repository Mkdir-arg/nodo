# Arquitectura del Sistema

## Visión General

El sistema Nodo implementa una **arquitectura de microservicios containerizada** con separación clara entre frontend y backend, utilizando Docker para la orquestación de servicios.

## Arquitectura de Alto Nivel

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│    Frontend     │    │     Backend     │    │     MySQL       │
│   (Next.js)     │◄──►│    (Django)     │◄──►│   (Database)    │
│   Port: 3008    │    │   Port: 8000    │    │   Port: 3308    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │              ┌─────────────────┐              │
         └──────────────►│    Adminer      │◄─────────────┘
                        │  (DB Admin)     │
                        │   Port: 8080    │
                        └─────────────────┘
```

## Componentes Principales

### 1. Frontend (Next.js)
- **Tecnología**: Next.js 14 + React 18 + TypeScript
- **Puerto**: 3008
- **Responsabilidades**:
  - Interfaz de usuario reactiva
  - Gestión de estado con Zustand
  - Comunicación con API REST
  - Autenticación JWT
  - Formularios dinámicos
  - Editor visual de plantillas

### 2. Backend (Django)
- **Tecnología**: Django 4.x + Django REST Framework
- **Puerto**: 8000
- **Responsabilidades**:
  - API REST completa
  - Lógica de negocio
  - Autenticación y autorización
  - Gestión de base de datos
  - Motor de flujos de trabajo
  - Validación de datos

### 3. Base de Datos (MySQL)
- **Tecnología**: MySQL 8.0
- **Puerto**: 3308 (host) / 3306 (container)
- **Responsabilidades**:
  - Almacenamiento persistente
  - Integridad referencial
  - Transacciones ACID
  - Índices optimizados

### 4. Administrador de BD (Adminer)
- **Tecnología**: Adminer
- **Puerto**: 8080
- **Responsabilidades**:
  - Interfaz web para MySQL
  - Consultas SQL directas
  - Gestión de esquemas
  - Importación/exportación

## Patrones Arquitectónicos

### 1. Separación de Responsabilidades
- **Presentación**: Frontend (Next.js)
- **Lógica de Negocio**: Backend (Django)
- **Datos**: MySQL + modelos Django

### 2. API-First Design
- Backend expone API REST completa
- Frontend consume únicamente APIs
- Documentación automática con OpenAPI/Swagger

### 3. Containerización
- Cada servicio en su propio container
- Orquestación con Docker Compose
- Volúmenes para persistencia

### 4. Configuración por Entorno
- Variables de entorno para configuración
- Archivos .env para desarrollo
- Configuraciones específicas por ambiente

## Flujo de Datos

### 1. Autenticación
```
Frontend → POST /api/token/ → Backend → JWT Token → Frontend
Frontend → Headers: Authorization: Bearer <token> → Backend
```

### 2. Operaciones CRUD
```
Frontend → HTTP Request → Backend → Django ORM → MySQL
MySQL → Django ORM → Backend → JSON Response → Frontend
```

### 3. Flujos de Trabajo
```
Frontend → Trigger Flow → Backend → Flow Engine → Step Execution
Step Execution → Database Updates → Status Updates → Frontend
```

## Seguridad

### 1. Autenticación
- JWT tokens con expiración configurable
- Refresh tokens para renovación
- Middleware de inactividad

### 2. Autorización
- Sistema de permisos basado en Django
- Middleware de validación de tokens
- CORS configurado para dominios específicos

### 3. Validación
- Validación en frontend (Zod schemas)
- Validación en backend (Django serializers)
- Sanitización de datos de entrada

## Escalabilidad

### 1. Horizontal
- Containers independientes
- Load balancing con Nginx (producción)
- Base de datos con réplicas (futuro)

### 2. Vertical
- Recursos configurables por container
- Optimización de queries
- Caché de consultas frecuentes

## Monitoreo y Logs

### 1. Logs de Aplicación
- Django logging framework
- Next.js console logs
- Logs estructurados en JSON

### 2. Logs de Sistema
- Docker logs por servicio
- MySQL query logs
- Nginx access logs (producción)

## Despliegue

### 1. Desarrollo
```bash
docker-compose up -d
```

### 2. Producción
```bash
docker-compose -f docker-compose.prod.yml up -d
```

### 3. Configuraciones por Ambiente
- `docker-compose.yml`: Desarrollo
- `docker-compose.prod.yml`: Producción
- Variables de entorno específicas