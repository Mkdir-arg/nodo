from rest_framework import viewsets, permissions, status
from rest_framework.parsers import MultiPartParser, JSONParser
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
import logging
from .models import Template, Record
from .serializers import TemplateSerializer, RecordSerializer

logger = logging.getLogger(__name__)

class StandardResultsSetPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100

class TemplateViewSet(viewsets.ModelViewSet):
    queryset = Template.objects.all()
    serializer_class = TemplateSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = StandardResultsSetPagination
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['created_at']
    
    def get_queryset(self):
        return Template.objects.select_related().order_by('-created_at')
    
    def create(self, request, *args, **kwargs):
        try:
            return super().create(request, *args, **kwargs)
        except Exception as e:
            logger.error(f"Error creando plantilla: {str(e)}", exc_info=True)
            return Response(
                {"error": "Error al crear la plantilla", "detail": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    def update(self, request, *args, **kwargs):
        try:
            return super().update(request, *args, **kwargs)
        except Exception as e:
            logger.error(f"Error actualizando plantilla: {str(e)}", exc_info=True)
            return Response(
                {"error": "Error al actualizar la plantilla", "detail": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

class RecordViewSet(viewsets.ModelViewSet):
    queryset = Record.objects.all()
    serializer_class = RecordSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, JSONParser]
    pagination_class = StandardResultsSetPagination
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['template', 'created_at']
    
    def get_queryset(self):
        return Record.objects.select_related('template').order_by('-created_at')
