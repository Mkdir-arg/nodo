# Desplegar Backend en Koyeb

## 1. Sube tu código a GitHub
```bash
git add .
git commit -m "Preparar para Koyeb"
git push origin main
```

## 2. En Koyeb Dashboard:
1. Create Service → From GitHub
2. Selecciona tu repositorio
3. **Build settings:**
   - Build command: `cd backend && pip install -r requirements/base.txt`
   - Run command: `cd backend && python manage.py collectstatic --noinput && gunicorn --bind 0.0.0.0:$PORT config.wsgi:application`

## 3. Variables de entorno:
```
DATABASE_URL=mysql://usuario:password@host:puerto/database
DEBUG=False
ALLOWED_HOSTS=*
SECRET_KEY=tu-clave-secreta-muy-larga
DJANGO_SETTINGS_MODULE=config.settings
```

## 4. Deploy!
Koyeb te dará una URL como: `https://tu-app-backend.koyeb.app`