"""Vistas de analitica; sirven para catalogo, validacion y ejecucion controlada."""

from __future__ import annotations

import logging
import uuid
from typing import Any, Dict, Mapping, Optional

from django.http import Http404
from rest_framework import status
from drf_spectacular.utils import OpenApiExample, OpenApiParameter, OpenApiTypes, extend_schema
from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from plantillas.models import Plantilla

from .analytics_dsl import DSLValidationError, normalize_dsl, validate_query_dsl
from .analytics_executor import apply_aggregate_query, apply_list_query
from .analytics_serializers import AnalyticsLegajoSerializer
from .analytics_services import get_catalog_for_plantilla
from legajos.models import Legajo

logger = logging.getLogger(__name__)

EXAMPLE_LIST_DSL = {
    "entity": "legajos",
    "mode": "list",
    "filters": {
        "and": [
            {"field": "edad", "op": "gte", "value": 18},
            {"field": "nombre", "op": "contains", "value": "Ana"},
        ]
    },
    "order": [{"field": "created_at", "dir": "desc"}],
    "limit": 10,
    "offset": 0,
}

EXAMPLE_AGG_DSL = {
    "entity": "legajos",
    "mode": "aggregate",
    "group_by": ["nombre"],
    "metrics": [{"op": "count", "as": "total"}],
    "order": [{"field": "total", "dir": "desc"}],
    "limit": 10,
    "offset": 0,
}


class AnalyticsCatalogView(APIView):
    """Devuelve el catalogo de campos; sirve para que el cliente sepa que consultar."""

    permission_classes = [IsAuthenticated]

    @extend_schema(
        tags=["Analitica"],
        parameters=[
            OpenApiParameter(
                name="plantilla_id",
                type=OpenApiTypes.UUID,
                required=True,
                description="ID de plantilla para resolver el catalogo.",
            ),
            OpenApiParameter(
                name="only_grid",
                type=OpenApiTypes.BOOL,
                required=False,
                description="True para exponer solo campos seMuestraEnGrilla.",
            ),
            OpenApiParameter(
                name="include_system_fields",
                type=OpenApiTypes.BOOL,
                required=False,
                description="True para incluir campos de sistema.",
            ),
            OpenApiParameter(
                name="include_sensitive",
                type=OpenApiTypes.BOOL,
                required=False,
                description="Solo superuser; incluye campos sensibles.",
            ),
        ],
        responses=OpenApiTypes.OBJECT,
        examples=[
            OpenApiExample(
                "Catalogo",
                value={
                    "ok": True,
                    "catalog": {
                        "entity": "legajos",
                        "fields": [
                            {"key": "nombre", "type": "text", "ops": ["contains", "eq"]}
                        ],
                        "meta": {"aggregate": {"metrics": ["count"]}},
                    },
                },
            )
        ],
    )
    def get(self, request, *args, **kwargs):
        """Responde el catalogo de campos; sirve para discovery seguro del DSL."""
        _require_legajo_view_perm(request)

        plantilla = _get_plantilla_from_request(request)
        options = _parse_catalog_options(request)
        catalog = get_catalog_for_plantilla(plantilla, **options)

        return Response({"ok": True, "catalog": catalog})


class AnalyticsValidateView(APIView):
    """Valida el DSL; sirve para rechazar consultas invalidas antes de ejecutar."""

    permission_classes = [IsAuthenticated]

    @extend_schema(
        tags=["Analitica"],
        request=OpenApiTypes.OBJECT,
        responses=OpenApiTypes.OBJECT,
        examples=[
            OpenApiExample(
                "Validacion list",
                value={
                    "plantilla_id": "00000000-0000-0000-0000-000000000000",
                    "dsl": EXAMPLE_LIST_DSL,
                },
            )
        ],
    )
    def post(self, request, *args, **kwargs):
        """Valida un DSL enviado; sirve para obtener errores tempranos."""
        _require_legajo_view_perm(request)

        payload = request.data or {}
        if not isinstance(payload, Mapping):
            return Response(
                {"error": "invalid_payload", "detail": "payload must be an object"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        plantilla = _get_plantilla_from_request(request, payload)
        options = _parse_catalog_options(request, payload)
        catalog = get_catalog_for_plantilla(plantilla, **options)
        allowed_fields = _allowed_fields_from_catalog(catalog)

        dsl = payload.get("dsl") if "dsl" in payload else payload
        if not isinstance(dsl, Mapping):
            return Response(
                {"error": "invalid_dsl", "detail": "dsl must be an object"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            validate_query_dsl(dsl, allowed_fields=allowed_fields)
            normalized = normalize_dsl(dsl)
        except DSLValidationError as exc:
            return Response(
                {"error": "validation_error", "detail": str(exc)},
                status=status.HTTP_400_BAD_REQUEST,
            )
        except Exception as exc:  # pragma: no cover - logging defensivo; sirve para diagnostico
            logger.exception("Unexpected validation error", exc_info=exc)
            return Response(
                {"error": "internal_error"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        return Response(
            {
                "ok": True,
                "dsl": normalized,
                "catalog": {
                    "plantilla_id": str(plantilla.id),
                    "updated_at": plantilla.updated_at.isoformat()
                    if plantilla.updated_at
                    else None,
                    "options": options,
                },
            }
        )


class AnalyticsQueryView(APIView):
    """Ejecuta list-mode del DSL; sirve para devolver resultados sin exponer SQL."""

    permission_classes = [IsAuthenticated]

    @extend_schema(
        tags=["Analitica"],
        request=OpenApiTypes.OBJECT,
        responses=OpenApiTypes.OBJECT,
        examples=[
            OpenApiExample(
                "Query list",
                value={
                    "plantilla_id": "00000000-0000-0000-0000-000000000000",
                    "dsl": EXAMPLE_LIST_DSL,
                },
            ),
            OpenApiExample(
                "Query aggregate",
                value={
                    "plantilla_id": "00000000-0000-0000-0000-000000000000",
                    "dsl": EXAMPLE_AGG_DSL,
                },
            ),
        ],
    )
    def post(self, request, *args, **kwargs):
        """Ejecuta una consulta list; sirve para obtener filas seguras y paginadas."""
        _require_legajo_view_perm(request)

        payload = request.data or {}
        if not isinstance(payload, Mapping):
            return Response(
                {"error": "invalid_payload", "detail": "payload must be an object"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        plantilla = _get_plantilla_from_request(request, payload)
        options = _parse_catalog_options(request, payload)
        catalog = get_catalog_for_plantilla(plantilla, **options)
        allowed_fields = _allowed_fields_from_catalog(catalog)

        dsl = payload.get("dsl") if "dsl" in payload else payload
        if not isinstance(dsl, Mapping):
            return Response(
                {"error": "invalid_dsl", "detail": "dsl must be an object"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            validate_query_dsl(dsl, allowed_fields=allowed_fields)
            normalized = normalize_dsl(dsl)
        except DSLValidationError as exc:
            return Response(
                {"error": "validation_error", "detail": str(exc)},
                status=status.HTTP_400_BAD_REQUEST,
            )
        except Exception as exc:  # pragma: no cover - logging defensivo; sirve para diagnostico
            logger.exception("Unexpected validation error", exc_info=exc)
            return Response(
                {"error": "internal_error"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        queryset = Legajo.objects.filter(plantilla_id=plantilla.id)

        if normalized.get("mode") == "list":
            queryset = queryset.only(
                "id", "plantilla_id", "grid_values", "created_at", "updated_at"
            )
            queryset, total = apply_list_query(queryset, normalized, allowed_fields)
            serializer = AnalyticsLegajoSerializer(queryset, many=True)
            return Response(
                {
                    "ok": True,
                    "count": total,
                    "limit": normalized.get("limit"),
                    "offset": normalized.get("offset"),
                    "results": serializer.data,
                }
            )

        if normalized.get("mode") == "aggregate":
            groups, total = apply_aggregate_query(queryset, normalized, allowed_fields)
            return Response(
                {
                    "ok": True,
                    "mode": "aggregate",
                    "count": total,
                    "limit": normalized.get("limit"),
                    "offset": normalized.get("offset"),
                    "groups": groups,
                }
            )

        return Response(
            {"error": "unsupported_mode", "detail": "mode not supported"},
            status=status.HTTP_400_BAD_REQUEST,
        )


def _parse_catalog_options(
    request, payload: Optional[Mapping[str, Any]] = None
) -> Dict[str, bool]:
    """Parsea flags del catalogo; sirve para controlar exposicion de campos."""
    payload = payload or {}
    include_sensitive = _parse_bool(
        payload.get(
            "include_sensitive", request.query_params.get("include_sensitive", False)
        )
    )
    # Campos sensibles pueden exponer PII derivado; sirve para forzar opt-in y control.
    if include_sensitive and not request.user.is_superuser:
        include_sensitive = False

    return {
        "only_grid": _parse_bool(
            payload.get("only_grid", request.query_params.get("only_grid", True))
        ),
        "include_system_fields": _parse_bool(
            payload.get(
                "include_system_fields",
                request.query_params.get("include_system_fields", True),
            )
        ),
        "include_sensitive": include_sensitive,
    }


def _get_plantilla_from_request(request, payload: Optional[Mapping[str, Any]] = None) -> Plantilla:
    """Resuelve la plantilla; sirve para limitar la consulta al esquema correcto."""
    payload = payload or {}
    plantilla_id = payload.get("plantilla_id") or request.query_params.get("plantilla_id")
    if not plantilla_id:
        raise ValidationError("plantilla_id is required")

    try:
        uuid.UUID(str(plantilla_id))
    except ValueError as exc:
        raise ValidationError("plantilla_id must be a valid UUID") from exc

    try:
        return Plantilla.objects.only("id", "schema", "updated_at").get(pk=plantilla_id)
    except Plantilla.DoesNotExist as exc:
        raise Http404("plantilla not found") from exc


def _allowed_fields_from_catalog(catalog: Mapping[str, Any]) -> Dict[str, Dict[str, Any]]:
    """Convierte catalogo a allowed_fields; sirve para validar/executar con whitelist."""
    allowed_fields: Dict[str, Dict[str, Any]] = {}
    for field in catalog.get("fields", []):
        key = field.get("key")
        if not key:
            continue
        allowed_fields[str(key)] = {
            "type": field.get("type"),
            "label": field.get("label"),
            "system": field.get("system"),
            "group": field.get("group"),
        }
    return allowed_fields


def _parse_bool(value: Any) -> bool:
    """Convierte valores a bool; sirve para aceptar query params comunes."""
    if isinstance(value, bool):
        return value
    if value is None:
        return False
    if isinstance(value, (int, float)):
        return bool(value)
    if isinstance(value, str):
        return value.strip().lower() in {"1", "true", "yes", "y", "on"}
    return False


def _require_legajo_view_perm(request) -> None:
    """Verifica permiso de lectura; sirve para proteger datos sensibles."""
    if not request.user.has_perm("legajos.view_legajo"):
        raise PermissionDenied("User lacks legajos.view_legajo")
