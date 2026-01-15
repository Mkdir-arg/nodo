# Guía de Despliegue en EC2

## Requisitos Previos

1. Instancia EC2 creada (Ubuntu 20.04 o superior recomendado)
2. Archivo PEM (`mkdir.pem`) en el directorio raíz del proyecto
3. Puertos abiertos en el Security Group de EC2:
   - 22 (SSH)
   - 8000 (Backend Django)
   - 3010 (Frontend Next.js)
   - 3306 (MySQL - opcional, solo si necesitas acceso externo)
   - 6379 (Redis - opcional, solo si necesitas acceso externo)

## Configuración del Security Group

En la consola de AWS EC2, configura las reglas de entrada:

```
Tipo            Puerto    Origen
SSH             22        Tu IP / 0.0.0.0/0
Custom TCP      8000      0.0.0.0/0
Custom TCP      3010      0.0.0.0/0
Custom TCP      3306      Tu IP (opcional)
Custom TCP      6379      Tu IP (opcional)
```

## Despliegue Automático

### Opción 1: Usando el script de despliegue (Linux/Mac/Git Bash)

```bash
# Dar permisos de ejecución al script
chmod +x deploy.sh

# Ejecutar el despliegue
./deploy.sh <IP_DE_TU_EC2> <USUARIO>

# Ejemplo:
./deploy.sh 54.123.45.67 ubuntu
```

### Opción 2: Despliegue manual paso a paso

#### 1. Conectarse a la instancia EC2

```bash
chmod 400 mkdir.pem
ssh -i mkdir.pem ubuntu@<IP_DE_TU_EC2>
```

#### 2. Instalar Docker y Docker Compose

```bash
# Actualizar sistema
sudo apt-get update

# Instalar Docker
sudo apt-get install -y apt-transport-https ca-certificates curl software-properties-common
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -
sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable"
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io

# Agregar usuario al grupo docker
sudo usermod -aG docker $USER

# Instalar Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Cerrar sesión y volver a conectar para aplicar cambios
exit
```

#### 3. Copiar archivos al servidor

Desde tu máquina local:

```bash
# Copiar proyecto (excluir archivos innecesarios)
rsync -avz --progress \
    -e "ssh -i mkdir.pem" \
    --exclude 'node_modules' \
    --exclude '.next' \
    --exclude 'dbdata' \
    --exclude '__pycache__' \
    --exclude '*.pyc' \
    --exclude '.git' \
    --exclude 'venv' \
    --exclude '.env' \
    ./ ubuntu@<IP_EC2>:~/nodo/
```

#### 4. Configurar variables de entorno

Conectarse nuevamente a EC2:

```bash
ssh -i mkdir.pem ubuntu@<IP_EC2>
cd ~/nodo

# Crear archivo .env
cp .env.example .env

# Editar .env con nano o vi
nano .env
```

Configurar las siguientes variables:

```env
# Django
DJANGO_SECRET_KEY=<GENERAR_UNA_CLAVE_SEGURA>
DJANGO_DEBUG=0
ALLOWED_HOSTS=<IP_EC2>,localhost,127.0.0.1
PORT=8000

# Base de datos
DATABASE_NAME=nodo_db
DATABASE_USER=nodo_user
DATABASE_PASSWORD=<CONTRASEÑA_SEGURA>
DATABASE_HOST=mysql
DATABASE_PORT=3306

# Frontend / API
NEXT_PUBLIC_API_URL=http://<IP_EC2>:8000
FRONTEND_URL=http://<IP_EC2>:3010
NEXT_PUBLIC_API_BASE=http://<IP_EC2>:8000/api

# Security
INACTIVITY_TIMEOUT_MINUTES=30
```

Para generar una SECRET_KEY segura:
```bash
openssl rand -base64 32
```

#### 5. Levantar los servicios

```bash
cd ~/nodo

# Construir y levantar contenedores
docker-compose up -d --build

# Ver logs
docker-compose logs -f

# Verificar estado
docker-compose ps
```

## Comandos Útiles

### Ver logs en tiempo real
```bash
ssh -i mkdir.pem ubuntu@<IP_EC2> 'cd nodo && docker-compose logs -f'
```

### Ver logs de un servicio específico
```bash
ssh -i mkdir.pem ubuntu@<IP_EC2> 'cd nodo && docker-compose logs -f backend'
ssh -i mkdir.pem ubuntu@<IP_EC2> 'cd nodo && docker-compose logs -f frontend'
```

### Reiniciar servicios
```bash
ssh -i mkdir.pem ubuntu@<IP_EC2> 'cd nodo && docker-compose restart'
```

### Detener servicios
```bash
ssh -i mkdir.pem ubuntu@<IP_EC2> 'cd nodo && docker-compose down'
```

### Actualizar el código
```bash
# Desde tu máquina local
rsync -avz --progress \
    -e "ssh -i mkdir.pem" \
    --exclude 'node_modules' \
    --exclude '.next' \
    --exclude 'dbdata' \
    --exclude '__pycache__' \
    --exclude '.git' \
    ./ ubuntu@<IP_EC2>:~/nodo/

# Reiniciar servicios
ssh -i mkdir.pem ubuntu@<IP_EC2> 'cd nodo && docker-compose restart'
```

### Ejecutar migraciones
```bash
ssh -i mkdir.pem ubuntu@<IP_EC2> 'cd nodo && docker-compose exec backend python manage.py migrate'
```

### Crear superusuario
```bash
ssh -i mkdir.pem ubuntu@<IP_EC2> 'cd nodo && docker-compose exec backend python manage.py createsuperuser'
```

### Acceder a la base de datos
```bash
ssh -i mkdir.pem ubuntu@<IP_EC2> 'cd nodo && docker-compose exec mysql mysql -u nodo_user -p nodo_db'
```

## Verificación del Despliegue

1. **Backend**: Abre en tu navegador `http://<IP_EC2>:8000/api/`
2. **Frontend**: Abre en tu navegador `http://<IP_EC2>:3010`
3. **Admin Django**: `http://<IP_EC2>:8000/admin/`

## Troubleshooting

### Los contenedores no inician
```bash
# Ver logs detallados
docker-compose logs

# Verificar recursos
docker stats
```

### Error de conexión a la base de datos
```bash
# Verificar que MySQL esté corriendo
docker-compose ps mysql

# Ver logs de MySQL
docker-compose logs mysql
```

### Frontend no se conecta al backend
- Verificar que `NEXT_PUBLIC_API_BASE` en `.env` tenga la IP correcta
- Verificar que el puerto 8000 esté abierto en el Security Group

### Problemas de permisos
```bash
# Dar permisos al directorio
sudo chown -R $USER:$USER ~/nodo
```

## Configuración de Dominio (Opcional)

Si tienes un dominio, puedes configurar Nginx como reverse proxy:

1. Instalar Nginx en EC2
2. Configurar SSL con Let's Encrypt
3. Proxy pass a los puertos 8000 y 3010

## Backup de la Base de Datos

```bash
# Crear backup
ssh -i mkdir.pem ubuntu@<IP_EC2> 'cd nodo && docker-compose exec mysql mysqldump -u nodo_user -p nodo_db > backup.sql'

# Restaurar backup
ssh -i mkdir.pem ubuntu@<IP_EC2> 'cd nodo && docker-compose exec -T mysql mysql -u nodo_user -p nodo_db < backup.sql'
```

## Monitoreo

Para monitorear el uso de recursos:

```bash
# Ver uso de CPU y memoria
ssh -i mkdir.pem ubuntu@<IP_EC2> 'docker stats'

# Ver espacio en disco
ssh -i mkdir.pem ubuntu@<IP_EC2> 'df -h'
```

## Seguridad Adicional

1. Cambiar el puerto SSH por defecto
2. Configurar fail2ban
3. Habilitar firewall UFW
4. Configurar SSL/TLS con certificados
5. Usar variables de entorno seguras
6. Configurar backups automáticos
