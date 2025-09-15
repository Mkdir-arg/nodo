from rest_framework import serializers
from typing import Dict, Any, List, Optional
from .models import Legajo
from plantillas.models import Plantilla
from plantillas.validators import run_schema_validations


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
        data = obj.data or {}
        grid_values = obj.grid_values or {}
        if isinstance(grid_values, dict):
            display = grid_values.get("display") or grid_values.get("nombre")
            if display:
                return display
        if isinstance(data, dict):
            display = data.get("display")
            if display:
                return display

            def pick_name(container: Dict[str, Any]) -> Optional[str]:
                apellido = (
                    container.get("apellido")
                    or container.get("last_name")
                    or container.get("apellidos")
                )
                nombre = (
                    container.get("nombre")
                    or container.get("first_name")
                    or container.get("nombres")
                )
                if apellido and nombre:
                    return f"{apellido}, {nombre}"
                if nombre:
                    return str(nombre)
                if apellido:
                    return str(apellido)
                return None

            for key in ("ciudadano", "persona", "titular"):
                container = data.get(key)
                if isinstance(container, dict):
                    guess = pick_name(container)
                    if guess:
                        return guess

            guess = pick_name(data)
            if guess:
                return guess

        return str(obj.id)

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
        try:
            from plantillas.utils import build_grid_values
            legajo.grid_values = build_grid_values(legajo.plantilla.schema, legajo.data)
            legajo.save(update_fields=["grid_values"])
        except Exception:
            pass
        return legajo
