from django.http import JsonResponse
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from django.contrib.auth.models import AnonymousUser


class TokenExpirationMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Excluir rutas de autenticación y configuración
        excluded_paths = ['/api/token/', '/api/token/refresh/', '/login/', '/api/auth/security-config/']
        
        # Solo aplicar a rutas de API, excluyendo las de autenticación
        if (request.path.startswith('/api/') and 
            not any(request.path.startswith(path) for path in excluded_paths) and 
            request.method in ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']):
            
            user = self.get_user_from_jwt(request)
            
            if user and not isinstance(user, AnonymousUser):
                # Si el usuario está autenticado, verificar si el token ha expirado
                if not self.is_token_valid(request):
                    return JsonResponse({
                        'error': 'Token has expired',
                        'code': 'TOKEN_EXPIRED'
                    }, status=401)

        response = self.get_response(request)
        return response

    def get_user_from_jwt(self, request):
        """Extrae el usuario del token JWT"""
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

    def is_token_valid(self, request):
        """Verifica si el token JWT es válido"""
        try:
            jwt_auth = JWTAuthentication()
            header = jwt_auth.get_header(request)
            if header is None:
                return False
            
            raw_token = jwt_auth.get_raw_token(header)
            if raw_token is None:
                return False
            
            jwt_auth.get_validated_token(raw_token)
            return True
        except (InvalidToken, TokenError):
            return False