from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
import uuid
from .models import Flujo, InstanciaFlujo
from django.contrib.auth.models import User

@csrf_exempt
def create_instance_direct(request):
    if request.method != 'POST':
        return JsonResponse({'error': 'Only POST allowed'}, status=405)
    
    try:
        data = json.loads(request.body)
        flow_id = data.get('flow')
        legajo_id = data.get('legajo_id', str(uuid.uuid4()))
        
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

@csrf_exempt
def get_flow_instances(request):
    if request.method != 'GET':
        return JsonResponse({'error': 'Only GET allowed'}, status=405)
    
    try:
        flow_id = request.GET.get('flow')
        if not flow_id:
            return JsonResponse({'error': 'flow parameter required'}, status=400)
        
        instances = InstanciaFlujo.objects.filter(flow_id=flow_id)
        
        data = []
        for instance in instances:
            data.append({
                'id': instance.id,
                'legajo_id': instance.legajo_id,
                'status': instance.status,
                'started_at': instance.started_at.isoformat() if instance.started_at else None,
                'flow': instance.flow.id
            })
        
        return JsonResponse(data, safe=False)
        
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)