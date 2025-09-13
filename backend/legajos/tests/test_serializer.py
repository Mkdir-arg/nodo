from plantillas.models import Plantilla
from legajos.serializers import LegajoSerializer


def test_hidden_field_removed(db):
    plantilla = Plantilla.objects.create(
        nombre="P", schema={"nodes": [
            {"type": "section", "children": [
                {"type": "text", "id": "a", "key": "a", "label": "A"},
                {"type": "text", "id": "b", "key": "b", "label": "B", "condicionesOcultar": [{"key": "a", "op": "eq", "value": "1"}]},
            ]}
        ]}
    )
    serializer = LegajoSerializer(data={"plantilla": str(plantilla.id), "data": {"a": "1", "b": "2"}})
    assert serializer.is_valid(), serializer.errors
    legajo = serializer.save()
    assert "b" not in legajo.data
