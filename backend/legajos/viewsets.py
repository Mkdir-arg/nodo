from rest_framework import viewsets, response
from rest_framework.permissions import IsAuthenticated
from .models import Legajo
from .serializers import LegajoSerializer
from .services import LegajoMetaService


class LegajoViewSet(viewsets.ModelViewSet):
    queryset = Legajo.objects.all()
    serializer_class = LegajoSerializer
    permission_classes = [IsAuthenticated]
    http_method_names = ["get", "post"]

    def retrieve(self, request, *args, **kwargs):
        inst = self.get_object()
        meta = LegajoMetaService.compute(inst)
        return response.Response(
            {
                "data": inst.data,
                "plantilla": str(inst.plantilla_id),
                "visual_config": inst.plantilla.visual_config or {},
                "meta": meta,
            }
        )
