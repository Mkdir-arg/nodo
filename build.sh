#!/bin/bash

# Determinar qué servicio construir basado en variable de entorno
if [ "$SERVICE" = "backend" ]; then
    cd backend
    pip install -r requirements/base.txt
    python manage.py collectstatic --noinput
elif [ "$SERVICE" = "frontend" ]; then
    cd frontend
    npm ci
    npm run build
fi