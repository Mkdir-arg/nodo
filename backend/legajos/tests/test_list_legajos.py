import pytest
from django.contrib.auth import get_user_model
from django.db import connection
from django.test.utils import CaptureQueriesContext
from rest_framework.test import APIRequestFactory, force_authenticate

from plantillas.models import Plantilla
from legajos.models import Legajo
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
    import os
    import uuid
    test_username = os.getenv('TEST_USERNAME') or f'testuser_{uuid.uuid4().hex[:8]}'
    test_password = os.getenv('TEST_PASSWORD') or f'testpass_{uuid.uuid4().hex[:12]}'
    user = user_model.objects.create_user(username=test_username, password=test_password)
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


@pytest.mark.django_db
def test_list_search_uses_database_filters():
    plantilla = Plantilla.objects.create(nombre="A", schema={"nodes": []})
    serializer = LegajoSerializer(
        data={
            "plantilla_id": str(plantilla.id),
            "data": {"ciudadano": {"apellido": "Lopez", "nombre": "Ana"}},
        }
    )
    assert serializer.is_valid(), serializer.errors
    serializer.save()

    serializer = LegajoSerializer(
        data={
            "plantilla_id": str(plantilla.id),
            "data": {"ciudadano": {"apellido": "Gomez", "nombre": "Luis"}},
        }
    )
    assert serializer.is_valid(), serializer.errors
    serializer.save()

    factory = APIRequestFactory()
    request = factory.get(f"/legajos/?plantilla_id={plantilla.id}&search=Lopez")
    user_model = get_user_model()
    import os
    import uuid
    test_username = os.getenv('TEST_USERNAME') or f'testuser_{uuid.uuid4().hex[:8]}'
    test_password = os.getenv('TEST_PASSWORD') or f'testpass_{uuid.uuid4().hex[:12]}'
    user = user_model.objects.create_user(username=test_username, password=test_password)
    force_authenticate(request, user=user)

    with CaptureQueriesContext(connection) as ctx:
        response = LegajoViewSet.as_view({"get": "list"})(request)

    assert response.status_code == 200
    sql_statements = "\n".join(q["sql"] for q in ctx)
    assert "search_document" in sql_statements.lower()
    assert "like" in sql_statements.lower() or "match" in sql_statements.lower()


@pytest.mark.django_db
def test_search_document_populated_via_model():
    plantilla = Plantilla.objects.create(nombre="A", schema={"nodes": []})
    legajo = Legajo.objects.create(
        plantilla=plantilla,
        data={"ciudadano": {"apellido": "Diaz", "nombre": "Laura"}},
    )
    assert "Diaz" in legajo.search_document
    assert "Laura" in legajo.search_document
