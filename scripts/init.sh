#!/bin/bash

# Script de inicialización del proyecto Nodo

set -e

echo "🚀 Inicializando proyecto Nodo..."

# Verificar que Docker esté instalado
if ! command -v docker &> /dev/null; then
    echo "❌ Docker no está instalado. Por favor instálalo primero."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose no está instalado. Por favor instálalo primero."
    exit 1
fi

# Crear archivo .env si no existe
if [ ! -f .env ]; then
    echo "📝 Creando archivo .env desde .env.example..."
    cp .env.example .env
    echo "⚠️  Por favor revisa y ajusta las variables en .env antes de continuar."
    read -p "Presiona Enter para continuar..."
fi

# Construir imágenes
echo "🔨 Construyendo imágenes Docker..."
docker-compose build

# Levantar servicios
echo "🚀 Levantando servicios..."
docker-compose up -d mysql

# Esperar a que MySQL esté listo
echo "⏳ Esperando a que MySQL esté listo..."
sleep 30

# Levantar el resto de servicios
docker-compose up -d

# Ejecutar migraciones
echo "📊 Ejecutando migraciones..."
docker-compose exec backend python manage.py migrate

# Crear superusuario si no existe
echo "👤 Verificando superusuario..."
docker-compose exec backend python manage.py shell -c "
from django.contrib.auth import get_user_model
User = get_user_model()
if not User.objects.filter(is_superuser=True).exists():
    print('Creando superusuario...')
    User.objects.create_superuser('admin', 'admin@example.com', 'admin123')
    print('Superusuario creado: admin/admin123')
else:
    print('Ya existe un superusuario')
"

# Recopilar archivos estáticos
echo "📁 Recopilando archivos estáticos..."
docker-compose exec backend python manage.py collectstatic --no-input

echo "✅ Inicialización completada!"
echo ""
echo "🌐 Servicios disponibles:"
echo "   Frontend: http://localhost:3008"
echo "   Backend:  http://localhost:8000"
echo "   Admin:    http://localhost:8000/admin"
echo "   Adminer:  http://localhost:8080"
echo ""
echo "📚 Comandos útiles:"
echo "   make help     - Ver todos los comandos disponibles"
echo "   make logs     - Ver logs de todos los servicios"
echo "   make down     - Bajar todos los servicios"
echo ""