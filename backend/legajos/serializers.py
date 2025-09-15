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
        def ok(c):
            v = values.get(c["key"]); val=c.get("value"); op=c["op"]
            return (op=="eq" and v==val) or (op=="ne" and v!=val) or \
                   (op=="in" and v in val) or (op=="nin" and v not in val) or \
                   (op=="gt" and isinstance(v,(int,float)) and v>val) or \
                   (op=="gte" and isinstance(v,(int,float)) and v>=val) or \
                   (op=="lt" and isinstance(v,(int,float)) and v<val) or \
                   (op=="lte" and isinstance(v,(int,float)) and v<=val) or \
                   (op=="contains" and ((isinstance(v,str) and str(val) in v) or (isinstance(v,list) and val in v)))
        return all(ok(c) for c in (conds or []))

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
