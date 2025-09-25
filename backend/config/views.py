from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from .models import SystemSettings
import json

@api_view(['GET'])
def api_root(request):
    return Response({
        'message': 'API Root',
        'endpoints': {
            'auth': '/api/token/',
            'users': '/api/users/',
            'system': '/api/system/'
        }
    })

@api_view(['GET'])
def system_settings(request):
    settings = {}
    for setting in SystemSettings.objects.all():
        try:
            settings[setting.key] = json.loads(setting.value)
        except:
            settings[setting.key] = setting.value
    
    # Valores por defecto si no existen
    defaults = {
        'siteName': 'Nodo',
        'maxFileSize': '10',
        'allowRegistration': False,
        'maintenanceMode': False,
        'emailNotifications': True,
        'backupFrequency': 'daily',
        'loginImage': '/png/people-connecting.png',
        'loginTitle': 'Bienvenido a Nodo,',
        'loginSubtitle': 'tu Sistema Social',
        'loginFooterTitle': 'Nodo',
        'loginFooterSubtitle': 'Powered by ICore'
    }
    
    for key, default_value in defaults.items():
        if key not in settings:
            settings[key] = default_value
    
    return Response(settings)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def update_system_settings(request):
    data = request.data
    for key, value in data.items():
        setting, created = SystemSettings.objects.get_or_create(key=key)
        setting.value = json.dumps(value) if isinstance(value, (dict, list, bool)) else str(value)
        setting.save()
    
    return Response({'message': 'Configuraciones guardadas exitosamente'})

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def system_info(request):
    from django.contrib.auth.models import User
    from django.db import connection
    
    # Información del sistema
    info = {
        'version': '1.0.0',
        'database': 'MySQL',
        'active_users': User.objects.filter(is_active=True).count(),
        'total_users': User.objects.count(),
        'last_backup': 'Nunca',
        'disk_usage': '2.5 GB',
        'memory_usage': '512 MB'
    }
    
    return Response(info)