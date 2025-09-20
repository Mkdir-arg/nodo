from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
import json
from .models import Flujo, InstanciaFlujo
from django.contrib.auth.models import User

@csrf_exempt
@require_http_methods(["POST"])
def create_instance_simple(request):
    try:
        data = json.loads(request.body)
        flow_id = data.get('flow')
        legajo_id = data.get('legajo_id')
        
        if not flow_id or not legajo_id:
            return JsonResponse({'error': 'flow y legajo_id requeridos'}, status=400)
        
        # Obtener flujo
        flow = Flujo.objects.get(id=flow_id)
        
        # Usuario por defecto
        user, _ = User.objects.get_or_create(username='default')
        
        # Crear instancia
        instance = InstanciaFlujo.objects.create(
            flow=flow,
            legajo_id=legajo_id,
            created_by=user,
            status='pending'
        )
        
        return JsonResponse({
            'id': instance.id,
            'flow': flow.id,
            'legajo_id': legajo_id,
            'status': 'pending'
        })
        
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)