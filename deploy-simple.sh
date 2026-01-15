#!/bin/bash
set -e

EC2_IP="100.53.20.56"
EC2_USER="ec2-user"
PEM_FILE="mkdir.pem"

echo "=== Desplegando en EC2 con Docker ==="
echo "IP: $EC2_IP"

chmod 400 $PEM_FILE

echo "1. Instalando Docker..."
ssh -i $PEM_FILE -o StrictHostKeyChecking=no $EC2_USER@$EC2_IP << 'ENDSSH'
    sudo yum update -y
    sudo yum install -y docker
    sudo systemctl start docker
    sudo systemctl enable docker
    sudo usermod -aG docker $USER
    
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
    
    mkdir -p ~/nodo
ENDSSH

echo "2. Copiando archivos..."
rsync -avz --progress \
    -e "ssh -i $PEM_FILE -o StrictHostKeyChecking=no" \
    --exclude 'node_modules' \
    --exclude '.next' \
    --exclude 'dbdata' \
    --exclude '__pycache__' \
    --exclude '.git' \
    --exclude 'venv' \
    ./ $EC2_USER@$EC2_IP:~/nodo/

echo "3. Configurando .env..."
ssh -i $PEM_FILE $EC2_USER@$EC2_IP << ENDSSH
    cd ~/nodo
    if [ ! -f .env ]; then
        cp .env.example .env
        SECRET_KEY=\$(openssl rand -base64 32)
        sed -i "s/your_secret_key_here/\$SECRET_KEY/" .env
        sed -i "s/DJANGO_DEBUG=1/DJANGO_DEBUG=0/" .env
        sed -i "s/ALLOWED_HOSTS=\*/ALLOWED_HOSTS=$EC2_IP,localhost/" .env
        sed -i "s|http://localhost:8000/api|http://$EC2_IP:8000/api|g" .env
    fi
ENDSSH

echo "4. Levantando contenedores Docker..."
ssh -i $PEM_FILE $EC2_USER@$EC2_IP << 'ENDSSH'
    cd ~/nodo
    sudo docker-compose down || true
    sudo docker-compose up -d --build
    sleep 30
    sudo docker-compose ps
ENDSSH

echo "=== Despliegue completado ==="
echo "Backend: http://$EC2_IP:8000"
echo "Frontend: http://$EC2_IP:3010"
