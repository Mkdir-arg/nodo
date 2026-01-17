#!/usr/bin/env python
import os
import sys
import django

# Setup Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth.models import User

def create_test_data():
    """Crea solo el superusuario admin"""
    admin_user, created = User.objects.get_or_create(
        email='admin@test.com',
        defaults={
            'username': 'admin',
            'is_staff': True,
            'is_superuser': True
        }
    )
    
    if created:
        admin_user.set_password('admin123')
        admin_user.save()
        print(f"Superusuario creado: {admin_user.email}")
    else:
        # Actualizar contraseña si ya existe
        admin_user.set_password('admin123')
        admin_user.save()
        print(f"Superusuario actualizado: {admin_user.email}")

if __name__ == '__main__':
    create_test_data()
