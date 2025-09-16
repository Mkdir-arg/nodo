from rest_framework import viewsets, response
from rest_framework.permissions import IsAuthenticated
from rest_framework.pagination import PageNumberPagination
from .models import Legajo
from .serializers import LegajoSerializer
from .services import LegajoMetaService


class LegajoPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = "page_size"
    max_page_size = 100


class LegajoViewSet(viewsets.ModelViewSet):
    queryset = Legajo.objects.select_related("plantilla").all()
    serializer_class = LegajoSerializer
    permission_classes = [IsAuthenticated]
    http_method_names = ["get", "post"]
    pagination_class = LegajoPagination

    def get_queryset(self):
        qs = super().get_queryset()
        plantilla_id = self.request.query_params.get("plantilla_id")
        if plantilla_id:
            qs = qs.filter(plantilla_id=plantilla_id)
        return qs

    def list(self, request, *args, **kwargs):
        from django.db import DatabaseError
        from django.core.exceptions import ValidationError
        import logging
        
        logger = logging.getLogger(__name__)
        
        try:
            queryset = self.filter_queryset(self.get_queryset())

            search = (request.query_params.get("search") or "").strip()
            if search:
                for term in filter(None, search.split()):
                    queryset = queryset.filter(search_document__icontains=term)

            page = self.paginate_queryset(queryset)
            if page is not None:
                serializer = self.get_serializer(page, many=True)
                return self.get_paginated_response(serializer.data)

            serializer = self.get_serializer(queryset, many=True)
            return response.Response(serializer.data)
        except ValidationError as e:
            logger.warning(f"Validation error in legajo list: {e}")
            return response.Response(
                {"error": "Datos de consulta inválidos", "detail": str(e)},
                status=400
            )
        except DatabaseError as e:
            logger.error(f"Database error in legajo list: {e}")
            return response.Response(
                {"error": "Error de base de datos"},
                status=500
            )
        except Exception as e:
            logger.error(f"Unexpected error in legajo list: {e}")
            return response.Response(
                {"error": "Error interno del servidor"},
                status=500
            )

    def retrieve(self, request, *args, **kwargs):
        from django.db import DatabaseError
        from django.core.exceptions import ValidationError
        import logging
        
        logger = logging.getLogger(__name__)
        
        try:
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
        except ValidationError as e:
            logger.warning(f"Validation error in legajo retrieve: {e}")
            return response.Response(
                {"error": "Datos inválidos"},
                status=400
            )
        except DatabaseError as e:
            logger.error(f"Database error in legajo retrieve: {e}")
            return response.Response(
                {"error": "Error de base de datos"},
                status=500
            )
        except Exception as e:
            logger.error(f"Unexpected error in legajo retrieve: {e}")
            return response.Response(
                {"error": "Error interno del servidor"},
                status=500
            )
