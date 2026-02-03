"""Serializers analiticos; sirven para controlar payloads de respuesta."""

from __future__ import annotations

from typing import Optional

from rest_framework import serializers

from legajos.models import Legajo
from .utils import guess_legajo_display


class AnalyticsLegajoSerializer(serializers.ModelSerializer):
    """Serializa un legajo minimo; sirve para respuestas analiticas livianas."""

    display = serializers.SerializerMethodField()

    class Meta:
        model = Legajo
        fields = (
            "id",
            "plantilla_id",
            "display",
            "grid_values",
            "created_at",
            "updated_at",
        )

    def get_display(self, obj: Legajo) -> Optional[str]:
        """Calcula display; sirve para mostrar un label amigable."""
        return guess_legajo_display({}, obj.grid_values or {}, str(obj.id))
