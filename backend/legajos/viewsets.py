from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import Legajo
from .serializers import LegajoSerializer


class LegajoViewSet(viewsets.ModelViewSet):
    queryset = Legajo.objects.all()
    serializer_class = LegajoSerializer
    permission_classes = [IsAuthenticated]
    http_method_names = ["get", "post"]
