"""Views for analytics DSL validation and catalog discovery."""

from __future__ import annotations

import logging
import uuid
from typing import Any, Dict, Mapping, Optional

from django.http import Http404
from rest_framework import status
from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from plantillas.models import Plantilla

from .analytics_dsl import DSLValidationError, normalize_dsl, validate_query_dsl
from .analytics_services import get_catalog_for_plantilla

logger = logging.getLogger(__name__)


class AnalyticsCatalogView(APIView):
    """Return the field catalog used by the analytics DSL."""

    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        """Handle GET requests for the analytics field catalog."""
        _require_legajo_view_perm(request)

        plantilla = _get_plantilla_from_request(request)
        options = _parse_catalog_options(request)
        catalog = get_catalog_for_plantilla(plantilla, **options)

        return Response({"ok": True, "catalog": catalog})


class AnalyticsValidateView(APIView):
    """Validate an analytics DSL payload using the plantilla catalog."""

    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        """Handle POST requests for DSL validation."""
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
        except Exception as exc:  # pragma: no cover - defensive logging
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


def _parse_catalog_options(
    request, payload: Optional[Mapping[str, Any]] = None
) -> Dict[str, bool]:
    """Parse catalog configuration flags from request and payload."""
    payload = payload or {}
    include_sensitive = _parse_bool(
        payload.get(
            "include_sensitive", request.query_params.get("include_sensitive", False)
        )
    )
    # Sensitive fields can expose derived PII; keep them opt-in and restricted.
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
    """Resolve and return a plantilla instance from request data."""
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
    """Convert a catalog payload back into allowed_fields metadata."""
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
    """Parse a boolean-like input into a Python bool."""
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
    """Ensure the authenticated user can view legajos."""
    if not request.user.has_perm("legajos.view_legajo"):
        raise PermissionDenied("User lacks legajos.view_legajo")
