# Nodo Monorepo

Este repositorio centraliza el código del backend y frontend del proyecto. Cada módulo vive en su propio directorio para facilitar el desarrollo y el despliegue.

## Requisitos
- Docker y docker-compose
- Python 3 y pip
- Node.js y npm

## Inicio rápido
1. Copia el archivo de ejemplo y ajusta las variables:
   ```bash
   cp .env.example .env
   ```
2. Construye y levanta los contenedores de apoyo:
   ```bash
   docker-compose up --build -d
   ```
3. Aplica las migraciones de la base de datos:
   ```bash
   docker-compose exec backend python manage.py migrate
   ```
4. Accede a los servicios:
   - Backend: http://localhost:8000
   - Frontend: http://localhost:3000
   - Adminer: http://localhost:8080
   - **Nota:** si el frontend se ejecuta dentro de Docker, su URL de API debe apuntar a `http://backend:8000`.
5. Ejecuta los servicios del backend y frontend según corresponda.

## Estructura
- `backend/`: código de la API y lógica de negocio.
- `frontend/`: aplicación cliente.
- `dbdata/`: datos persistentes de MySQL.

## Mantenimiento
- Reinicia los contenedores para aplicar cambios con:
  ```bash
  docker-compose restart
  ```
- Los datos de MySQL se guardan en `dbdata/`. Para reiniciar la base desde cero, elimina este directorio o usa:
  ```bash
  docker-compose down -v
  ```
