#!/bin/bash

# Script de despliegue para EC2 - Amazon Linux 2023
# Uso: ./deploy.sh

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Configuración de la instancia
EC2_IP="100.53.20.56"
EC2_USER="ec2-user"
PEM_FILE="mkdir.pem"
PROJECT_NAME="nodo"

echo -e "${GREEN}=== Iniciando despliegue en EC2 ===${NC}"
echo "IP: $EC2_IP"
echo "Usuario: $EC2_USER"

# Verificar que existe el archivo PEM
if [ ! -f "$PEM_FILE" ]; then
    echo -e "${RED}Error: No se encuentra el archivo $PEM_FILE${NC}"
    exit 1
fi

# Configurar permisos del archivo PEM
chmod 400 $PEM_FILE

echo -e "${YELLOW}1. Instalando dependencias en EC2...${NC}"
ssh -i $PEM_FILE -o StrictHostKeyChecking=no $EC2_USER@$EC2_IP << 'ENDSSH'
    # Actualizar sistema
    sudo yum update -y
    
    # Instalar Docker
    if ! command -v docker &> /dev/null; then
        echo "Instalando Docker..."
        sudo yum install -y docker
        sudo systemctl start docker
        sudo systemctl enable docker
        sudo usermod -aG docker $USER
    fi
    
    # Instalar Docker Compose
    if ! command -v docker-compose &> /dev/null; then
        echo "Instalando Docker Compose..."
        sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
        sudo chmod +x /usr/local/bin/docker-compose
    fi
    
    # Crear directorio del proyecto
    mkdir -p ~/nodo
ENDSSH

echo -e "${YELLOW}2. Copiando archivos al servidor...${NC}"
# Excluir archivos innecesarios
rsync -avz --progress \
    -e "ssh -i $PEM_FILE -o StrictHostKeyChecking=no" \
    --exclude 'node_modules' \
    --exclude '.next' \
    --exclude 'dbdata' \
    --exclude '__pycache__' \
    --exclude '*.pyc' \
    --exclude '.git' \
    --exclude 'venv' \
    --exclude '.env' \
    ./ $EC2_USER@$EC2_IP:~/nodo/

echo -e "${YELLOW}3. Configurando variables de entorno...${NC}"
ssh -i $PEM_FILE $EC2_USER@$EC2_IP << ENDSSH
    cd ~/nodo
    
    # Crear archivo .env si no existe
    if [ ! -f .env ]; then
        cp .env.example .env
        
        # Generar SECRET_KEY
        SECRET_KEY=\$(openssl rand -base64 32)
        sed -i "s/your_secret_key_here/\$SECRET_KEY/" .env
        
        # Configurar para producción
        sed -i "s/DJANGO_DEBUG=1/DJANGO_DEBUG=0/" .env
        sed -i "s/ALLOWED_HOSTS=\*/ALLOWED_HOSTS=$EC2_IP,localhost,127.0.0.1/" .env
        sed -i "s|NEXT_PUBLIC_API_BASE=http://localhost:8000/api|NEXT_PUBLIC_API_BASE=http://$EC2_IP:8000/api|" .env
        
        echo "Archivo .env configurado"
    fi
ENDSSH

echo -e "${YELLOW}4. Construyendo y levantando contenedores...${NC}"
ssh -i $PEM_FILE $EC2_USER@$EC2_IP << 'ENDSSH'
    cd ~/nodo
    
    # Detener contenedores existentes
    docker-compose down || true
    
    # Construir y levantar servicios
    docker-compose up -d --build
    
    # Esperar a que los servicios estén listos
    echo "Esperando a que los servicios inicien..."
    sleep 30
    
    # Verificar estado
    docker-compose ps
ENDSSH

echo -e "${GREEN}=== Despliegue completado ===${NC}"
echo -e "${GREEN}Backend disponible en: http://$EC2_IP:8000${NC}"
echo -e "${GREEN}Frontend disponible en: http://$EC2_IP:3010${NC}"
echo ""
echo -e "${YELLOW}Comandos útiles:${NC}"
echo "  Ver logs: ssh -i $PEM_FILE $EC2_USER@$EC2_IP 'cd nodo && docker-compose logs -f'"
echo "  Reiniciar: ssh -i $PEM_FILE $EC2_USER@$EC2_IP 'cd nodo && docker-compose restart'"
echo "  Detener: ssh -i $PEM_FILE $EC2_USER@$EC2_IP 'cd nodo && docker-compose down'"
