"""Tests de URLs del chat; sirven para validar ruteo y permisos reales."""

import uuid

import pytest
from django.contrib.auth import get_user_model
from django.contrib.auth.models import Permission
from rest_framework.test import APIClient


def _create_user_with_perm():
    """Crea usuario con permiso; sirve para autenticar requests reales."""
    user_model = get_user_model()
    username = f"testuser_{uuid.uuid4().hex[:8]}"
    password = f"testpass_{uuid.uuid4().hex[:12]}"
    user = user_model.objects.create_user(username=username, password=password)
    perm = Permission.objects.get(codename="use_analitica")
    user.user_permissions.add(perm)
    return user


@pytest.mark.django_db
def test_chat_url_requires_auth():
    """Verifica 403 sin permiso; sirve para asegurar proteccion del endpoint."""
    client = APIClient()
    response = client.post(
        "/api/legajos/analytics/chat/", {"message": "hola"}, format="json"
    )
    assert response.status_code in {401, 403}


@pytest.mark.django_db
def test_chat_url_with_permission_returns_stub():
    """Verifica 503 con permiso; sirve para validar contrato en URL real."""
    user = _create_user_with_perm()
    client = APIClient()
    client.force_authenticate(user=user)

    response = client.post(
        "/api/legajos/analytics/chat/",
        {"message": "hola", "context": {"plantilla_id": "abc"}},
        format="json",
    )

    assert response.status_code == 503
    assert response.data["ok"] is False
