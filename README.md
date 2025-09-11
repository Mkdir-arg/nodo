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

## Arquitectura
El proyecto se compone de varios servicios definidos en `docker-compose.yml`:

- **mysql**: Motor de base de datos MySQL. Expone el puerto `3308` al host y es consumido por el backend y Adminer. Acceso desde la máquina local en `localhost:3308` con usuario `root` y contraseña `root`.
- **backend**: API construida con Django y DRF. Depende de `mysql` y se publica en el puerto `8000`. Se puede acceder en `http://localhost:8000` una vez levantado el contenedor.
- **adminer**: Interfaz web para administrar la base de datos. Depende de `mysql` y está disponible en el puerto `8080`. Ingreso en `http://localhost:8080` usando las credenciales de MySQL (`root` / `root`).
- **frontend**: Aplicación Next.js que consume la API del backend. Se sirve en el puerto `3008` y se accede desde `http://localhost:3008`.

## Estructura
- `backend/`: código de la API y lógica de negocio.
- `frontend/`: aplicación cliente.
- `dbdata/`: datos persistentes de MySQL.


## Tecnologías
### Backend
- **Django** y **Django REST Framework**
- **JWT** para autenticación
- **drf-spectacular** para la documentación OpenAPI
- **django-filters** para filtros en la API
- **django-cors-headers** para manejo de CORS

### Frontend
- **Next.js** sobre **React**
- **Tailwind CSS** para estilos
- **Zod** para validación de esquemas

### Infraestructura
- **MySQL** como base de datos relacional
- **Docker** y **docker-compose** para la orquestación de servicios

## Mantenimiento
- Reinicia los contenedores para aplicar cambios con:
  ```bash
  docker-compose restart
  ```
- Los datos de MySQL se guardan en `dbdata/`. Para reiniciar la base desde cero, elimina este directorio o usa:
  ```bash
  docker-compose down -v
  ```

