import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIRequestFactory, force_authenticate

from plantillas.models import Plantilla
from legajos.serializers import LegajoSerializer
from legajos.viewsets import LegajoViewSet


@pytest.mark.django_db
def test_list_filters_by_plantilla_and_search():
    plantilla_a = Plantilla.objects.create(nombre="A", schema={"nodes": []})
    plantilla_b = Plantilla.objects.create(nombre="B", schema={"nodes": []})

    serializer = LegajoSerializer(
        data={
            "plantilla_id": str(plantilla_a.id),
            "data": {"ciudadano": {"apellido": "Perez", "nombre": "Juan"}},
        }
    )
    assert serializer.is_valid(), serializer.errors
    legajo_match = serializer.save()

    serializer = LegajoSerializer(
        data={
            "plantilla_id": str(plantilla_a.id),
            "data": {"ciudadano": {"apellido": "Gomez", "nombre": "Ana"}},
        }
    )
    assert serializer.is_valid(), serializer.errors
    serializer.save()

    serializer = LegajoSerializer(
        data={
            "plantilla_id": str(plantilla_b.id),
            "data": {"ciudadano": {"apellido": "Perez", "nombre": "Maria"}},
        }
    )
    assert serializer.is_valid(), serializer.errors
    serializer.save()

    factory = APIRequestFactory()
    request = factory.get(
        f"/legajos/?plantilla_id={plantilla_a.id}&search=perez"
    )
    user_model = get_user_model()
    user = user_model.objects.create_user(username="user", password="pass")
    force_authenticate(request, user=user)

    response = LegajoViewSet.as_view({"get": "list"})(request)
    assert response.status_code == 200
    assert response.data["count"] == 1
    assert len(response.data["results"]) == 1

    result = response.data["results"][0]
    assert result["id"] == str(legajo_match.id)
    assert result["plantilla_id"] == str(plantilla_a.id)
    assert result["display"].startswith("Perez")
    assert result["estado"] == "ACTIVO"
