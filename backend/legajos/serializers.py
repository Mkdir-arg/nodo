from rest_framework import serializers
from typing import Dict, Any, List, Optional
from .models import Legajo
from plantillas.models import Plantilla
from plantillas.validators import run_schema_validations
from .utils import guess_legajo_display


class LegajoSerializer(serializers.ModelSerializer):
    plantilla_id = serializers.PrimaryKeyRelatedField(
        source="plantilla", queryset=Plantilla.objects.all()
    )
    data = serializers.JSONField()
    display = serializers.SerializerMethodField()
    estado = serializers.SerializerMethodField()

    class Meta:
        model = Legajo
        fields = (
            "id",
            "plantilla_id",
            "display",
            "estado",
            "data",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("display", "estado", "created_at", "updated_at")

    def get_display(self, obj: Legajo) -> Optional[str]:
        return guess_legajo_display(
            obj.data or {},
            obj.grid_values or {},
            str(obj.id),
        )

    def get_estado(self, obj: Legajo) -> Optional[str]:
        candidates = []
        if isinstance(obj.grid_values, dict):
            candidates.append(obj.grid_values)
        if isinstance(obj.data, dict):
            candidates.append(obj.data)

        for source in candidates:
            for key in ("estado", "status", "estado_legajo", "estadoLegajo"):
                value = source.get(key)
                if value not in (None, ""):
                    return value
        return "ACTIVO"

    def _flat(self, data: Dict[str, Any]):
        return data

    def _eval_conds(self, values: Dict[str, Any], conds: List[Dict[str, Any]]):
        def evaluate_condition(condition):
            value = values.get(condition["key"])
            expected = condition.get("value")
            operator = condition["op"]
            
            if operator == "eq":
                return value == expected
            elif operator == "ne":
                return value != expected
            elif operator == "in":
                return value in expected
            elif operator == "nin":
                return value not in expected
            elif operator in ["gt", "gte", "lt", "lte"]:
                if not isinstance(value, (int, float)):
                    return False
                if operator == "gt":
                    return value > expected
                elif operator == "gte":
                    return value >= expected
                elif operator == "lt":
                    return value < expected
                elif operator == "lte":
                    return value <= expected
            elif operator == "contains":
                if isinstance(value, str):
                    return str(expected) in value
                elif isinstance(value, list):
                    return expected in value
            return False
            
        return all(evaluate_condition(c) for c in (conds or []))

    def validate(self, attrs):
        plantilla: Plantilla = attrs["plantilla"]
        schema = plantilla.schema
        run_schema_validations(schema)

        values = self._flat(attrs["data"])
        def clean(nodes):
            for n in nodes:
                t = n.get("type")
                if t == "section":
                    clean(n.get("children", []))
                elif t == "group":
                    arr = attrs["data"].get(n["key"], [])
                    if isinstance(arr, list):
                        for item in arr:
                            item_vals = {**values, **item}
                            for c in n.get("children", []):
                                if self._eval_conds(item_vals, c.get("condicionesOcultar")):
                                    item.pop(c["key"], None)
                else:
                    if self._eval_conds(values, n.get("condicionesOcultar")):
                        attrs["data"].pop(n["key"], None)
        clean(schema.get("nodes", []))
        return attrs

    def create(self, validated):
        legajo = super().create(validated)
        updates = []
        try:
            from plantillas.utils import build_grid_values

            legajo.grid_values = build_grid_values(
                legajo.plantilla.schema, legajo.data
            )
            updates.append("grid_values")
        except Exception:
            pass

        if updates:
            legajo.save(update_fields=updates)
        return legajo
