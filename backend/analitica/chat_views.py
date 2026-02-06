"""Vistas del chat analitico; sirven para orquestar LLM + DSL de forma segura."""

from __future__ import annotations

from typing import Any, Dict

from rest_framework import status
from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .chat_serializers import AnalyticsChatRequestSerializer, AnalyticsChatResponseSerializer
from .chat_services import build_llm_unavailable_response


class AnalyticsChatView(APIView):
    """Endpoint del chat; sirve como fachada estable para el cliente."""

    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        """Recibe mensaje; sirve para validar y delegar en el servicio del chat."""
        _require_analitica_perm(request)
        serializer = AnalyticsChatRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        payload = serializer.validated_data
        message = payload.get("message", "")
        context = payload.get("context") or {}

        response_payload: Dict[str, Any] = build_llm_unavailable_response(message, context)
        response_serializer = AnalyticsChatResponseSerializer(response_payload)
        return Response(response_serializer.data, status=status.HTTP_503_SERVICE_UNAVAILABLE)


def _require_analitica_perm(request) -> None:
    """Verifica permiso de analitica; sirve para proteger endpoints del chat."""
    if not request.user.has_perm("analitica.use_analitica"):
        raise PermissionDenied("User lacks analitica.use_analitica")
