# Documentación del Sistema Nodo

Sistema de gestión de legajos con flujos de trabajo dinámicos y plantillas configurables.

## Índice de Documentación

### 📋 Información General
- [Arquitectura del Sistema](./01-arquitectura.md)
- [Inicialización del Proyecto](./02-inicializacion.md)

### 🔧 Módulos del Sistema
- [Módulo de Configuración](./03-modulo-config.md)
- [Módulo de Plantillas](./04-modulo-plantillas.md)
- [Módulo de Legajos](./05-modulo-legajos.md)
- [Módulo de Flujos](./06-modulo-flujos.md)
- [Módulo de Usuarios](./07-modulo-usuarios.md)

### 🔐 Seguridad y Permisos
- [Sistema de Roles y Permisos](./08-roles-permisos.md)

### ⚙️ Funcionalidades Avanzadas
- [Implementación Dinámica de Módulos](./09-modulos-dinamicos.md)
- [Datos Extras y Configuraciones](./10-datos-extras.md)
- [Analitica DSL](./12-analitica-dsl.md)

## Tecnologías Principales

### Backend
- **Django 4.x** con **Django REST Framework**
- **MySQL 8.0** como base de datos
- **JWT** para autenticación
- **Docker** para containerización

### Frontend
- **Next.js 14** con **React 18**
- **TypeScript** para tipado estático
- **Tailwind CSS** para estilos
- **Zustand** para gestión de estado
- **React Query** para manejo de datos

### Infraestructura
- **Docker Compose** para orquestación
- **Nginx** para proxy reverso (producción)
- **Adminer** para administración de BD

## Estructura del Proyecto

```
nodo/
├── backend/           # API Django
├── frontend/          # Aplicación Next.js
├── docs/             # Documentación
├── dbdata/           # Datos persistentes MySQL
├── scripts/          # Scripts de inicialización
└── docker-compose.yml # Configuración de servicios
```

## Enlaces Rápidos

- **Frontend**: http://localhost:3008
- **Backend API**: http://localhost:8000
- **Admin Django**: http://localhost:8000/admin
- **Adminer**: http://localhost:8080
- **Documentación API**: http://localhost:8000/api/schema/swagger-ui/
