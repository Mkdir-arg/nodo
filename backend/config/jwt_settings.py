import os
import json
from datetime import timedelta
from django.utils import timezone


def get_jwt_token_lifetime():
    """Obtiene el tiempo de vida del token JWT basado en la configuración de inactividad"""
    try:
        from .models import SystemSettings
        setting = SystemSettings.objects.get(key='inactivityTimeoutMinutes')
        timeout_minutes = int(json.loads(setting.value) if setting.value.startswith('"') else setting.value)
    except:
        # Fallback al .env o valor por defecto
        timeout_minutes = int(os.getenv('INACTIVITY_TIMEOUT_MINUTES', 30))
    
    return timedelta(minutes=timeout_minutes)


def get_dynamic_jwt_settings():
    """Obtiene la configuración JWT dinámica"""
    token_lifetime = get_jwt_token_lifetime()
    
    return {
        'ACCESS_TOKEN_LIFETIME': token_lifetime,
        'REFRESH_TOKEN_LIFETIME': timedelta(days=7),  # Mantener el refresh token por más tiempo
        'ROTATE_REFRESH_TOKENS': True,
        'BLACKLIST_AFTER_ROTATION': True,
    }