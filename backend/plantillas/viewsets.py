from rest_framework import viewsets, decorators, response, status, filters
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from .models import Plantilla
from .serializers import PlantillaSerializer


class PlantillaViewSet(viewsets.ModelViewSet):
    queryset = Plantilla.objects.all()
    serializer_class = PlantillaSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, DjangoFilterBackend]
    search_fields = ["nombre"]
    filterset_fields = ["estado"]

    def destroy(self, request, *args, **kwargs):
        inst = self.get_object()
        inst.estado = Plantilla.Estado.INACTIVO
        inst.save(update_fields=["estado"])
        return response.Response(status=status.HTTP_204_NO_CONTENT)

    @decorators.action(detail=False, methods=["get"], url_path="exists")
    def exists(self, request):
        nombre = request.query_params.get("nombre", "")
        exclude = request.query_params.get("exclude_id")
        qs = Plantilla.objects.filter(nombre__iexact=nombre)
        if exclude:
            qs = qs.exclude(pk=exclude)
        return response.Response({"exists": qs.exists()})
