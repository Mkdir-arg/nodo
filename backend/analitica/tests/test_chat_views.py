"""Tests del chat analitico; sirven para validar contrato base sin LLM."""

import uuid

import pytest
from django.contrib.auth import get_user_model
from django.contrib.auth.models import Permission
from rest_framework.test import APIRequestFactory, force_authenticate

from analitica.chat_views import AnalyticsChatView


def _create_user_with_perm():
    """Crea usuario con permiso; sirve para autenticar llamadas del chat."""
    user_model = get_user_model()
    username = f"testuser_{uuid.uuid4().hex[:8]}"
    password = f"testpass_{uuid.uuid4().hex[:12]}"
    user = user_model.objects.create_user(username=username, password=password)
    perm = Permission.objects.get(codename="use_analitica")
    user.user_permissions.add(perm)
    return user


@pytest.mark.django_db
def test_chat_requires_permission():
    """Rechaza sin permiso; sirve para proteger el endpoint de chat."""
    factory = APIRequestFactory()
    request = factory.post(
        "/api/legajos/analytics/chat/", {"message": "hola"}, format="json"
    )
    user_model = get_user_model()
    user = user_model.objects.create_user(
        username=f"testuser_{uuid.uuid4().hex[:8]}",
        password=f"testpass_{uuid.uuid4().hex[:12]}",
    )
    force_authenticate(request, user=user)

    response = AnalyticsChatView.as_view()(request)

    assert response.status_code == 403


@pytest.mark.django_db
def test_chat_returns_unavailable_stub():
    """Devuelve stub 503; sirve para validar contrato sin LLM."""
    factory = APIRequestFactory()
    request = factory.post(
        "/api/legajos/analytics/chat/",
        {"message": "Resumen de legajos", "context": {"plantilla_id": "abc"}},
        format="json",
    )
    user = _create_user_with_perm()
    force_authenticate(request, user=user)

    response = AnalyticsChatView.as_view()(request)

    assert response.status_code == 503
    assert response.data["ok"] is False
    assert response.data["error"] == "llm_unavailable"
    assert "LLM no configurado" in response.data["detail"]


@pytest.mark.django_db
def test_chat_rejects_empty_message():
    """Rechaza texto vacio; sirve para evitar requests sin contenido."""
    factory = APIRequestFactory()
    request = factory.post(
        "/api/legajos/analytics/chat/", {"message": "   "}, format="json"
    )
    user = _create_user_with_perm()
    force_authenticate(request, user=user)

    response = AnalyticsChatView.as_view()(request)

    assert response.status_code == 400
