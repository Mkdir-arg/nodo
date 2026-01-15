# 🚀 Instrucciones de Despliegue en EC2

## ✅ Configuración Completada

Tu proyecto está listo para desplegarse en:
- **IP EC2:** 34.229.138.83
- **DNS:** ec2-34-229-138-83.compute-1.amazonaws.com
- **Usuario:** ec2-user
- **Archivo PEM:** mkdir.pem

## 📋 Antes de Desplegar

### 1. Configurar Security Group en AWS Console

Ve a EC2 → Security Groups → Selecciona el grupo de tu instancia → Edit inbound rules

Agrega estas reglas:

```
Tipo            Puerto    Origen          Descripción
SSH             22        Tu IP           Acceso SSH
Custom TCP      8000      0.0.0.0/0       Backend Django API
Custom TCP      3010      0.0.0.0/0       Frontend Next.js
Custom TCP      80        0.0.0.0/0       HTTP (opcional)
```

### 2. Verificar Archivo PEM

```bash
# En Git Bash o WSL
chmod 400 mkdir.pem
```

## 🚀 Despliegue Automático

```bash
# Desde la raíz del proyecto en Git Bash/WSL
chmod +x deploy.sh
./deploy.sh
```

El script hará:
1. ✅ Instalar Docker y Docker Compose en EC2
2. ✅ Copiar archivos del proyecto
3. ✅ Configurar variables de entorno
4. ✅ Construir y levantar contenedores
5. ✅ Verificar estado de servicios

## 🔧 Despliegue Manual (Alternativa)

### Paso 1: Conectar a EC2
```bash
ssh -i mkdir.pem ec2-user@34.229.138.83
```

### Paso 2: Instalar Docker
```bash
sudo yum update -y
sudo yum install -y docker
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker ec2-user

# Instalar Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Salir y volver a entrar
exit
```

### Paso 3: Copiar Proyecto (desde tu máquina local)
```bash
rsync -avz --progress \
    -e "ssh -i mkdir.pem" \
    --exclude 'node_modules' \
    --exclude '.next' \
    --exclude 'dbdata' \
    --exclude '__pycache__' \
    --exclude '.git' \
    ./ ec2-user@34.229.138.83:~/nodo/
```

### Paso 4: Levantar Servicios
```bash
ssh -i mkdir.pem ec2-user@34.229.138.83
cd ~/nodo
docker-compose -f docker-compose.prod.yml up -d --build
```

## 🔍 Verificación

Después del despliegue, verifica:

1. **Backend API:** http://34.229.138.83:8000/api/
2. **Frontend:** http://34.229.138.83:3010
3. **Admin Django:** http://34.229.138.83:8000/admin/

## 📊 Comandos Útiles

### Ver logs en tiempo real
```bash
ssh -i mkdir.pem ec2-user@34.229.138.83 'cd nodo && docker-compose logs -f'
```

### Ver logs de un servicio específico
```bash
ssh -i mkdir.pem ec2-user@34.229.138.83 'cd nodo && docker-compose logs -f backend'
ssh -i mkdir.pem ec2-user@34.229.138.83 'cd nodo && docker-compose logs -f frontend'
```

### Reiniciar servicios
```bash
ssh -i mkdir.pem ec2-user@34.229.138.83 'cd nodo && docker-compose restart'
```

### Ver estado de contenedores
```bash
ssh -i mkdir.pem ec2-user@34.229.138.83 'cd nodo && docker-compose ps'
```

### Ver uso de recursos
```bash
ssh -i mkdir.pem ec2-user@34.229.138.83 'docker stats'
```

### Detener servicios
```bash
ssh -i mkdir.pem ec2-user@34.229.138.83 'cd nodo && docker-compose down'
```

## ⚠️ Troubleshooting

### Error: No se puede conectar por SSH
- Verifica que el puerto 22 esté abierto en Security Group
- Verifica permisos del archivo PEM: `chmod 400 mkdir.pem`

### Error: No se puede acceder al backend/frontend
- Verifica que los puertos 8000 y 3010 estén abiertos en Security Group
- Verifica que los contenedores estén corriendo: `docker-compose ps`

### Error: Contenedores se detienen
- Verifica logs: `docker-compose logs`
- La instancia t3.micro puede quedarse sin memoria
- Considera usar t3.small o agregar swap

### Agregar Swap (si hay problemas de memoria)
```bash
ssh -i mkdir.pem ec2-user@34.229.138.83
sudo dd if=/dev/zero of=/swapfile bs=1M count=2048
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

## 🔄 Actualizar Código

```bash
# Copiar cambios
rsync -avz --progress \
    -e "ssh -i mkdir.pem" \
    --exclude 'node_modules' \
    --exclude '.next' \
    --exclude 'dbdata' \
    ./ ec2-user@34.229.138.83:~/nodo/

# Reiniciar servicios
ssh -i mkdir.pem ec2-user@34.229.138.83 'cd nodo && docker-compose restart'
```

## 📝 Notas Importantes

- **Instancia:** t3.micro (2 vCPUs, ~1GB RAM)
- **Limitación:** Puede ser justo para todos los servicios
- **Recomendación:** Monitorear uso de memoria constantemente
- **Producción:** Considera t3.small o superior para mejor rendimiento
