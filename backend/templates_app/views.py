from rest_framework import viewsets, permissions
from rest_framework.parsers import MultiPartParser, JSONParser
from .models import Template, Record
from .serializers import TemplateSerializer, RecordSerializer

class TemplateViewSet(viewsets.ModelViewSet):
    serializer_class = TemplateSerializer
    queryset = Template.objects.all()
    permission_classes = [permissions.IsAuthenticated]

class RecordViewSet(viewsets.ModelViewSet):
    serializer_class = RecordSerializer
    queryset = Record.objects.all()
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, JSONParser]
