#!/usr/bin/env python
import os
import sys
import django

# Setup Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth.models import User
from flows.models import Flujo, Step, Transition

def create_test_data():
    # Crear usuario admin
    admin_user, created = User.objects.get_or_create(
        username='admin',
        defaults={'email': 'admin@example.com', 'is_staff': True, 'is_superuser': True}
    )
    if created:
        admin_user.set_password('admin123')
        admin_user.save()
        print(f"Usuario admin creado: {admin_user.username}")
    
    # Crear usuario por defecto
    user, created = User.objects.get_or_create(
        username='default',
        defaults={'email': 'default@test.com', 'is_staff': True}
    )
    if created:
        user.set_password('default123')
        user.save()
        print(f"Usuario default creado: {user.username}")
    
    # Usar admin como creador del flujo
    user = admin_user
    
    print("Datos de prueba creados exitosamente")

if __name__ == '_main__':
    create_test_data()