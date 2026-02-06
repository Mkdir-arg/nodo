"""Serializers del chat analitico; sirven para validar requests del modulo."""

from __future__ import annotations

from typing import Optional

from rest_framework import serializers


class AnalyticsChatContextSerializer(serializers.Serializer):
    """Serializa el contexto del chat; sirve para adjuntar metadata de la UI."""

    plantilla_id = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    source = serializers.CharField(required=False, allow_blank=True, allow_null=True)


class AnalyticsChatRequestSerializer(serializers.Serializer):
    """Serializa el request del chat; sirve para validar entrada del usuario."""

    message = serializers.CharField()
    context = AnalyticsChatContextSerializer(required=False)

    def validate_message(self, value: str) -> str:
        """Valida el texto; sirve para evitar mensajes vacios."""
        normalized = value.strip()
        if not normalized:
            raise serializers.ValidationError("message cannot be empty")
        return normalized


class AnalyticsChatResponseSerializer(serializers.Serializer):
    """Serializa la respuesta del chat; sirve para estandarizar el payload."""

    ok = serializers.BooleanField()
    reply = serializers.CharField(required=False, allow_blank=True)
    error = serializers.CharField(required=False, allow_blank=True)
    detail = serializers.CharField(required=False, allow_blank=True)
    dsl = serializers.JSONField(required=False)
    results = serializers.JSONField(required=False)
