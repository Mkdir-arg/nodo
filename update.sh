#!/bin/bash
set -e

EC2_IP="100.53.20.56"
EC2_USER="ec2-user"
PEM_FILE="mkdir.pem"

echo "=== Actualizando aplicación ==="

chmod 400 $PEM_FILE

echo "Sincronizando archivos..."
rsync -avz --progress \
    -e "ssh -i $PEM_FILE -o StrictHostKeyChecking=no" \
    --exclude 'node_modules' \
    --exclude '.next' \
    --exclude 'dbdata' \
    --exclude '__pycache__' \
    --exclude '.git' \
    --exclude 'venv' \
    --exclude '.env' \
    ./backend/ $EC2_USER@$EC2_IP:~/nodo/backend/

rsync -avz --progress \
    -e "ssh -i $PEM_FILE -o StrictHostKeyChecking=no" \
    --exclude 'node_modules' \
    --exclude '.next' \
    ./frontend/ $EC2_USER@$EC2_IP:~/nodo/frontend/

echo "Reiniciando servicios..."
ssh -i $PEM_FILE $EC2_USER@$EC2_IP << 'ENDSSH'
    cd ~/nodo
    sudo docker-compose restart backend frontend
    sleep 10
    sudo docker-compose ps
ENDSSH

echo "=== Actualización completada ==="
echo "Backend: http://$EC2_IP:8000"
echo "Frontend: http://$EC2_IP:3010"
