# Desplegar en Koyeb - Guía Completa

## 1. Subir código a GitHub
```bash
git add .
git commit -m "Configurar para Koyeb con SQLite"
git push origin main
```

## 2. Desplegar Backend en Koyeb

### En Koyeb Dashboard:
1. **Create Service** → **From GitHub**
2. Selecciona tu repositorio
3. **Build settings:**
   - Build command: `cd backend && pip install -r requirements/base.txt`
   - Run command: `cd backend && chmod +x start_prod.sh && ./start_prod.sh`

### Variables de entorno:
```
SECRET_KEY=tu-clave-secreta-muy-larga-y-segura-aqui
```

## 3. Desplegar Frontend en Koyeb

### En Koyeb Dashboard (nuevo servicio):
1. **Create Service** → **From GitHub**
2. Mismo repositorio
3. **Build settings:**
   - Build command: `cd frontend && npm ci && npm run build`
   - Run command: `cd frontend && npm start`

### Variables de entorno:
```
NEXT_PUBLIC_API_URL=https://tu-backend.koyeb.app
```

## 4. ¡Listo!
- Backend: `https://tu-backend.koyeb.app`
- Frontend: `https://tu-frontend.koyeb.app`

## Notas:
- SQLite se crea automáticamente
- Los datos se mantienen mientras el contenedor esté activo
- Para datos persistentes, considera usar un volumen o base de datos externa