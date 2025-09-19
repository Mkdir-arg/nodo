from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

@api_view(['GET'])
@permission_classes([AllowAny])
def api_root(request):
    """Endpoint raíz de la API"""
    return Response({
        'message': 'Nodo API',
        'version': '1.0.0',
        'endpoints': {
            'auth': '/api/auth/me/',
            'token': '/api/token/',
            'refresh': '/api/token/refresh/',
            'users': '/api/users/',
            'plantillas': '/api/plantillas/',
            'legajos': '/api/legajos/',
            'flows': '/api/flows/',
            'docs': '/api/docs/',
        }
    })