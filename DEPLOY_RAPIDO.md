# Despliegue Rápido en EC2

## 🔧 Configuración Previa (IMPORTANTE)

### 1. Abrir puertos en Security Group

Ve a la consola AWS → EC2 → Security Groups → Edita las reglas de entrada:

```
Tipo        Puerto    Origen
SSH         22        0.0.0.0/0
Custom TCP  8000      0.0.0.0/0
Custom TCP  3010      0.0.0.0/0
```

## 🚀 Desplegar

### Desde Git Bash o WSL en Windows:

```bash
chmod +x deploy-simple.sh
./deploy-simple.sh
```

El script automáticamente:
- ✅ Instala Docker y Docker Compose
- ✅ Copia el proyecto
- ✅ Configura variables de entorno
- ✅ Levanta todos los contenedores

## 🌐 Acceder

- **Frontend**: http://100.53.20.56:3010
- **Backend**: http://100.53.20.56:8000/api/
- **Admin**: http://100.53.20.56:8000/admin/

## 📝 Comandos Útiles

```bash
# Ver logs
ssh -i mkdir.pem ec2-user@100.53.20.56 'cd nodo && sudo docker-compose logs -f'

# Reiniciar
ssh -i mkdir.pem ec2-user@100.53.20.56 'cd nodo && sudo docker-compose restart'

# Ver estado
ssh -i mkdir.pem ec2-user@100.53.20.56 'cd nodo && sudo docker-compose ps'
```

## 🔄 Actualizar código

```bash
chmod +x update.sh
./update.sh
```
