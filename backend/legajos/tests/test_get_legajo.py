from django.contrib.auth import get_user_model
from rest_framework.test import APIRequestFactory, force_authenticate

from plantillas.models import Plantilla
from legajos.models import Legajo
from legajos.viewsets import LegajoViewSet


def test_get_legajo_includes_visual_and_meta(db):
    plantilla = Plantilla.objects.create(
        nombre="P",
        schema={},
        visual_config={"header": {"title": "t"}},
    )
    legajo = Legajo.objects.create(plantilla=plantilla, data={})

    factory = APIRequestFactory()
    request = factory.get(f"/legajos/{legajo.id}/")
    User = get_user_model()
    user = User.objects.create_user(username="u", password="p")
    force_authenticate(request, user=user)

    view = LegajoViewSet.as_view({"get": "retrieve"})
    response = view(request, pk=str(legajo.id))
    assert response.status_code == 200
    assert response.data["visual_config"] == plantilla.visual_config
    assert "meta" in response.data
