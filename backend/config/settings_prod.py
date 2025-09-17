from .settings import *
import os

# Configuración para producción con SQLite
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

# Configuración de producción
DEBUG = False
ALLOWED_HOSTS = ['*']
SECRET_KEY = os.environ.get('SECRET_KEY', 'django-insecure-change-me')

# CORS para producción
CORS_ALLOW_ALL_ORIGINS = True
CSRF_TRUSTED_ORIGINS = [
    'https://*.koyeb.app',
]