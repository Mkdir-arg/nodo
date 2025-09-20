from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from .models import Flujo, InstanciaFlujo
from .serializers import InstanciaFlujoSerializer
from .runtime import create_instance_from_legajo
from legajos.models import Legajo


class CreateInstanceView(APIView):
    permission_classes = []
    
    def post(self, request):
        flow_id = request.data.get('flow_id')
        legajo_id = request.data.get('legajo_id')
        
        if not flow_id or not legajo_id:
            return Response(
                {'error': 'flow_id y legajo_id son requeridos'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            flow = get_object_or_404(Flujo, id=flow_id)
            
            instance = create_instance_from_legajo(flow, legajo_id, request.user)
            
            serializer = InstanciaFlujoSerializer(instance)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_400_BAD_REQUEST
            )