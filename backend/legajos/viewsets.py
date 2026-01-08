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
    permission_classes = []
    http_method_names = ["get", "post", "put", "patch"]
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
                    "schema": inst.plantilla.schema,
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

    def update(self, request, *args, **kwargs):
        import logging
        logger = logging.getLogger(__name__)
        
        try:
            logger.info(f"Update request data: {request.data}")
            return super().update(request, *args, **kwargs)
        except Exception as e:
            logger.error(f"Update error: {e}")
            return response.Response(
                {"error": str(e)},
                status=400
            )

    def partial_update(self, request, *args, **kwargs):
        import logging
        logger = logging.getLogger(__name__)
        
        try:
            logger.info(f"Partial update request data: {request.data}")
            return super().partial_update(request, *args, **kwargs)
        except Exception as e:
            logger.error(f"Partial update error: {e}")
            return response.Response(
                {"error": str(e)},
                status=400
            )

    def relations(self, request, pk=None):
        """GET /api/legajos/{id}/relations/ - List all relations for a legajo"""
        from .models import LegajoRelation
        from rest_framework.decorators import action
        
        legajo = self.get_object()
        relations_from = LegajoRelation.objects.filter(source_legajo=legajo).select_related('target_legajo', 'target_legajo__plantilla')
        relations_to = LegajoRelation.objects.filter(target_legajo=legajo).select_related('source_legajo', 'source_legajo__plantilla')
        
        data = {
            'outgoing': [{
                'id': str(r.id),
                'target_legajo_id': str(r.target_legajo_id),
                'target_data': r.target_legajo.data,
                'target_plantilla': r.target_legajo.plantilla.nombre,
                'relation_type': r.relation_type,
                'created_at': r.created_at
            } for r in relations_from],
            'incoming': [{
                'id': str(r.id),
                'source_legajo_id': str(r.source_legajo_id),
                'source_data': r.source_legajo.data,
                'source_plantilla': r.source_legajo.plantilla.nombre,
                'relation_type': r.inverse_relation_type,
                'created_at': r.created_at
            } for r in relations_to]
        }
        return response.Response(data)

    def create_relation(self, request, pk=None):
        """POST /api/legajos/{id}/relations/ - Create a relation"""
        from .models import LegajoRelation, Legajo
        
        legajo = self.get_object()
        target_id = request.data.get('target_legajo_id')
        relation_type = request.data.get('relation_type')
        inverse_type = request.data.get('inverse_relation_type', '')
        
        if not target_id or not relation_type:
            return response.Response({'error': 'target_legajo_id and relation_type required'}, status=400)
        
        try:
            target = Legajo.objects.get(id=target_id)
        except Legajo.DoesNotExist:
            return response.Response({'error': 'Target legajo not found'}, status=404)
        
        # Create bidirectional relation
        rel, created = LegajoRelation.objects.get_or_create(
            source_legajo=legajo,
            target_legajo=target,
            relation_type=relation_type,
            defaults={'inverse_relation_type': inverse_type}
        )
        
        return response.Response({
            'id': str(rel.id),
            'created': created
        }, status=201 if created else 200)

    def delete_relation(self, request, pk=None, relation_id=None):
        """DELETE /api/legajos/{id}/relations/{relation_id}/ - Delete a relation"""
        from .models import LegajoRelation
        
        try:
            rel = LegajoRelation.objects.get(id=relation_id, source_legajo_id=pk)
            rel.delete()
            return response.Response(status=204)
        except LegajoRelation.DoesNotExist:
            return response.Response({'error': 'Relation not found'}, status=404)
