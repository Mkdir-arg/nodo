# Nodo Monorepo

Este repositorio centraliza el código del backend y frontend del proyecto. Cada módulo vive en su propio directorio para facilitar el desarrollo y el despliegue.

## Requisitos
- Docker y docker-compose
- Python 3 y pip
- Node.js y npm

## Inicio rápido
1. Copia `.env.example` a `.env` y ajusta las variables según tu entorno.
2. Levanta las dependencias con `docker-compose up -d`.
3. Ejecuta los servicios del backend y frontend según corresponda.

## Estructura
- `backend/`: código de la API y lógica de negocio.
- `frontend/`: aplicación cliente.
- `dbdata/`: datos persistentes de MySQL.
