"""Tests de endpoints analiticos; sirven para verificar catalogo/validacion/consulta."""

import uuid

import pytest
from django.contrib.auth import get_user_model
from django.contrib.auth.models import Permission
from rest_framework.test import APIRequestFactory, force_authenticate

from plantillas.models import Plantilla
from analitica.analytics_views import (
    AnalyticsCatalogView,
    AnalyticsQueryView,
    AnalyticsValidateView,
)
from legajos.models import Legajo


def _create_user_with_perm():
    """Crea usuario con permiso; sirve para autenticar llamadas analiticas."""
    user_model = get_user_model()
    username = f"testuser_{uuid.uuid4().hex[:8]}"
    password = f"testpass_{uuid.uuid4().hex[:12]}"
    user = user_model.objects.create_user(username=username, password=password)
    perm = Permission.objects.get(codename="view_legajo")
    user.user_permissions.add(perm)
    return user


@pytest.mark.django_db
def test_catalog_excludes_sensitive_by_default():
    """Valida que el catalogo excluya sensibles; sirve para evitar PII por defecto."""
    plantilla = Plantilla.objects.create(
        nombre="Catalog",
        schema={
            "nodes": [
                {
                    "type": "section",
                    "id": "sec",
                    "children": [
                        {
                            "type": "text",
                            "id": "n1",
                            "key": "nombre",
                            "seMuestraEnGrilla": True,
                        }
                    ],
                }
            ]
        },
    )

    factory = APIRequestFactory()
    request = factory.get(
        f"/api/legajos/analytics/catalog/?plantilla_id={plantilla.id}&include_sensitive=true"
    )
    user = _create_user_with_perm()
    force_authenticate(request, user=user)

    response = AnalyticsCatalogView.as_view()(request)

    assert response.status_code == 200
    fields = {f["key"] for f in response.data["catalog"]["fields"]}
    assert "nombre" in fields
    assert "search_document" not in fields


@pytest.mark.django_db
def test_validate_returns_normalized_dsl():
    """Valida y normaliza el DSL; sirve para asegurar defaults consistentes."""
    plantilla = Plantilla.objects.create(
        nombre="Validate",
        schema={
            "nodes": [
                {
                    "type": "section",
                    "id": "sec",
                    "children": [
                        {
                            "type": "text",
                            "id": "n1",
                            "key": "nombre",
                            "seMuestraEnGrilla": True,
                        }
                    ],
                }
            ]
        },
    )

    payload = {
        "plantilla_id": str(plantilla.id),
        "dsl": {
            "entity": "legajos",
            "mode": "list",
            "filters": {"field": "nombre", "op": "contains", "value": "Ana"},
        },
    }

    factory = APIRequestFactory()
    request = factory.post("/api/legajos/analytics/validate/", payload, format="json")
    user = _create_user_with_perm()
    force_authenticate(request, user=user)

    response = AnalyticsValidateView.as_view()(request)

    assert response.status_code == 200
    assert response.data["ok"] is True
    assert response.data["dsl"]["limit"] == 50
    assert response.data["dsl"]["offset"] == 0


@pytest.mark.django_db
def test_validate_requires_permission():
    """Rechaza sin permisos; sirve para proteger endpoints analiticos."""
    plantilla = Plantilla.objects.create(nombre="NoPerm", schema={"nodes": []})
    payload = {
        "plantilla_id": str(plantilla.id),
        "dsl": {"entity": "legajos", "mode": "list"},
    }

    factory = APIRequestFactory()
    request = factory.post("/api/legajos/analytics/validate/", payload, format="json")
    user_model = get_user_model()
    user = user_model.objects.create_user(
        username=f"testuser_{uuid.uuid4().hex[:8]}",
        password=f"testpass_{uuid.uuid4().hex[:12]}",
    )
    force_authenticate(request, user=user)

    response = AnalyticsValidateView.as_view()(request)

    assert response.status_code == 403


@pytest.mark.django_db
def test_query_filters_by_grid_values():
    """Consulta list filtrando grid_values; sirve para validar campos dinamicos."""
    plantilla = Plantilla.objects.create(
        nombre="Query",
        schema={
            "nodes": [
                {
                    "type": "section",
                    "id": "sec",
                    "children": [
                        {
                            "type": "text",
                            "id": "n1",
                            "key": "nombre",
                            "seMuestraEnGrilla": True,
                        }
                    ],
                }
            ]
        },
    )

    Legajo.objects.create(
        plantilla=plantilla,
        data={},
        grid_values={"nombre": "Ana"},
    )
    Legajo.objects.create(
        plantilla=plantilla,
        data={},
        grid_values={"nombre": "Luis"},
    )

    payload = {
        "plantilla_id": str(plantilla.id),
        "dsl": {
            "entity": "legajos",
            "mode": "list",
            "filters": {"field": "nombre", "op": "eq", "value": "Ana"},
        },
    }

    factory = APIRequestFactory()
    request = factory.post("/api/legajos/analytics/query/", payload, format="json")
    user = _create_user_with_perm()
    force_authenticate(request, user=user)

    response = AnalyticsQueryView.as_view()(request)

    assert response.status_code == 200
    assert response.data["count"] == 1
    assert len(response.data["results"]) == 1
    assert response.data["results"][0]["display"] == "Ana"


@pytest.mark.django_db
def test_query_aggregate_group_by():
    """Consulta aggregate con group_by; sirve para validar agrupaciones basicas."""
    plantilla = Plantilla.objects.create(
        nombre="Aggregate",
        schema={
            "nodes": [
                {
                    "type": "section",
                    "id": "sec",
                    "children": [
                        {
                            "type": "text",
                            "id": "n1",
                            "key": "nombre",
                            "seMuestraEnGrilla": True,
                        }
                    ],
                }
            ]
        },
    )

    Legajo.objects.create(
        plantilla=plantilla,
        data={},
        grid_values={"nombre": "Ana"},
    )
    Legajo.objects.create(
        plantilla=plantilla,
        data={},
        grid_values={"nombre": "Ana"},
    )
    Legajo.objects.create(
        plantilla=plantilla,
        data={},
        grid_values={"nombre": "Luis"},
    )

    payload = {
        "plantilla_id": str(plantilla.id),
        "dsl": {
            "entity": "legajos",
            "mode": "aggregate",
            "group_by": ["nombre"],
            "metrics": [{"op": "count", "as": "total"}],
        },
    }

    factory = APIRequestFactory()
    request = factory.post("/api/legajos/analytics/query/", payload, format="json")
    user = _create_user_with_perm()
    force_authenticate(request, user=user)

    response = AnalyticsQueryView.as_view()(request)

    assert response.status_code == 200
    assert response.data["count"] == 2
    groups = {row["nombre"]: row["total"] for row in response.data["groups"]}
    assert groups["Ana"] == 2
    assert groups["Luis"] == 1
