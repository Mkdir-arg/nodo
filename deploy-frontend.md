# Desplegar Frontend en Koyeb

## 1. En Koyeb Dashboard (nuevo servicio):
1. Create Service → From GitHub
2. Mismo repositorio
3. **Build settings:**
   - Build command: `cd frontend && npm ci && npm run build`
   - Run command: `cd frontend && npm start`

## 2. Variables de entorno:
```
NEXT_PUBLIC_API_URL=https://tu-backend.koyeb.app
```

## 3. Deploy!
Koyeb te dará una URL como: `https://tu-app-frontend.koyeb.app`