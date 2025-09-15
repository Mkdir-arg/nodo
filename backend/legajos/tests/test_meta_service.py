from plantillas.models import Plantilla
from legajos.models import Legajo
from legajos.services import LegajoMetaService


def test_meta_service(db):
    schema = {"nodes": [{"type": "text", "key": "a"}, {"type": "text", "key": "b"}]}
    plantilla = Plantilla.objects.create(nombre="P", schema=schema)
    legajo = Legajo.objects.create(
        plantilla=plantilla,
        data={
            "a": "1",
            "intervenciones": [1, 2],
            "archivos": [1],
            "alertas": [{"activa": True}, {"activa": False}],
            "dias_sin_contacto": 5,
        },
    )
    meta = LegajoMetaService.compute(legajo)
    assert meta["completitud"] == 50
    assert meta["counts"] == {"intervenciones": 2, "archivos": 1, "alertas_activas": 1}
    assert meta["metrics"]["dias_sin_contacto"] == 5
