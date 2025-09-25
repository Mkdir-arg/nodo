import os
import json
from datetime import datetime, timedelta
from django.utils import timezone
from django.http import JsonResponse
from django.contrib.auth.models import AnonymousUser
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from .models import SystemSettings


class InactivityMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response
        self._timeout_minutes = None
        self._last_config_check = None
    
    def get_timeout_minutes(self):
        """Obtiene el timeout de inactividad desde la configuración del sistema"""
        now = timezone.now()
        
        # Cache la configuración por 5 minutos para evitar consultas constantes
        if (self._timeout_minutes is None or 
            self._last_config_check is None or 
            now - self._last_config_check > timedelta(minutes=5)):
            
            try:
                setting = SystemSettings.objects.get(key='inactivityTimeoutMinutes')
                self._timeout_minutes = int(json.loads(setting.value) if setting.value.startswith('"') else setting.value)
            except (SystemSettings.DoesNotExist, ValueError, json.JSONDecodeError):
                # Fallback al .env o valor por defecto
                self._timeout_minutes = int(os.getenv('INACTIVITY_TIMEOUT_MINUTES', 30))
            
            self._last_config_check = now
        
        return self._timeout_minutes

    def __call__(self, request):
        # Excluir rutas de autenticación y configuración
        excluded_paths = ['/api/token/', '/api/token/refresh/', '/login/', '/api/auth/security-config/']
        
        # Solo aplicar a rutas de API autenticadas, excluyendo las de autenticación
        if (request.path.startswith('/api/') and 
            not any(request.path.startswith(path) for path in excluded_paths) and 
            request.method in ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']):
            
            user = self.get_user_from_jwt(request)
            
            if user and not isinstance(user, AnonymousUser):
                now = timezone.now()
                session_key = f'last_activity_{user.id}'
                
                # Obtener última actividad de la sesión
                last_activity = request.session.get(session_key)
                
                if last_activity:
                    last_activity = datetime.fromisoformat(last_activity)
                    if timezone.is_naive(last_activity):
                        last_activity = timezone.make_aware(last_activity)
                    
                    # Verificar si ha pasado el tiempo de inactividad
                    timeout_minutes = self.get_timeout_minutes()
                    if now - last_activity > timedelta(minutes=timeout_minutes):
                        return JsonResponse({
                            'error': 'Session expired due to inactivity',
                            'code': 'INACTIVITY_TIMEOUT'
                        }, status=401)
                
                # Actualizar última actividad
                request.session[session_key] = now.isoformat()

        response = self.get_response(request)
        return response

    def get_user_from_jwt(self, request):
        """Extrae el usuario del token JWT sin modificar request.user"""
        try:
            jwt_auth = JWTAuthentication()
            header = jwt_auth.get_header(request)
            if header is None:
                return None
            
            raw_token = jwt_auth.get_raw_token(header)
            if raw_token is None:
                return None
            
            validated_token = jwt_auth.get_validated_token(raw_token)
            return jwt_auth.get_user(validated_token)
        except (InvalidToken, TokenError):
            return None