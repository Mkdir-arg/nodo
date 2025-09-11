# Nodo Monorepo

Este repositorio centraliza el código del backend y frontend del proyecto. Cada módulo vive en su propio directorio para facilitar el desarrollo y el despliegue.

## Requisitos
- Docker y docker-compose
- Python 3 y pip
- Node.js y npm

## Despliegue e inicio
1. Copia el archivo de ejemplo y ajusta las variables:
   ```bash
   cp .env.example .env
   ```
2. Levanta MySQL, el backend y el frontend:
   ```bash
   docker-compose up --build
   ```
3. Aplica las migraciones y crea un superusuario:
   ```bash
   docker-compose exec backend python manage.py migrate
   docker-compose exec backend python manage.py createsuperuser
   ```
4. Comandos de desarrollo local:
   - Backend:
     ```bash
     python manage.py runserver
     ```
   - Frontend:
     ```bash
     npm run dev
     npm run build
     ```
5. Comandos de mantenimiento:
   ```bash
   docker-compose restart
   docker-compose down -v
   ```

## Estructura
- `backend/`: código de la API y lógica de negocio.
- `frontend/`: aplicación cliente.
- `dbdata/`: datos persistentes de MySQL.


## Arquitectura
Este monorepo está compuesto por tres servicios principales, cada uno ejecutado en su propio contenedor Docker:
- `frontend/`: interfaz de usuario que se comunica con el backend.
- `backend/`: API y lógica de negocio que interactúa con la base de datos.
- `mysql`: servicio de base de datos que persiste la información.

Flujo de datos:
```text
Frontend → Backend → Base de datos
```

## Mantenimiento
- Reinicia los contenedores para aplicar cambios con:
  ```bash
  docker-compose restart
  ```
- Los datos de MySQL se guardan en `dbdata/`. Para reiniciar la base desde cero, elimina este directorio o usa:
  ```bash
  docker-compose down -v
  ```

