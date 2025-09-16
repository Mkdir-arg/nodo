from rest_framework import viewsets, decorators, response, status, filters, exceptions
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from .models import Plantilla
from .serializers import (
    PlantillaLayoutSerializer,
    PlantillaSerializer,
    PlantillaVisualConfigSerializer,
)


class PlantillaViewSet(viewsets.ModelViewSet):
    queryset = Plantilla.objects.all()
    serializer_class = PlantillaSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, DjangoFilterBackend]
    search_fields = ["nombre"]
    filterset_fields = ["estado"]

    def create(self, request, *args, **kwargs):
        if not request.user.has_perm("plantillas.add_plantilla"):
            raise exceptions.PermissionDenied()
        return super().create(request, *args, **kwargs)

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

    @decorators.action(detail=True, methods=["patch"], url_path="visual-config")
    def visual_config(self, request, pk=None):
        plantilla = self.get_object()
        serializer = PlantillaVisualConfigSerializer(data={"visual_config": request.data or {}})
        serializer.is_valid(raise_exception=True)
        plantilla.visual_config = serializer.validated_data["visual_config"]
        plantilla.save(update_fields=["visual_config"])
        return response.Response(serializer.validated_data["visual_config"])

    @decorators.action(detail=True, methods=["get", "put"], url_path="layout")
    def layout(self, request, pk=None):
        plantilla = self.get_object()
        required_perm = (
            "plantillas.view_plantilla"
            if request.method == "GET"
            else "plantillas.change_plantilla"
        )
        if not request.user.has_perm(required_perm):
            raise exceptions.PermissionDenied()
        if request.method == "GET":
            serializer = PlantillaLayoutSerializer(plantilla)
            return response.Response(serializer.data)

        serializer = PlantillaLayoutSerializer(instance=plantilla, data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return response.Response(serializer.data)
