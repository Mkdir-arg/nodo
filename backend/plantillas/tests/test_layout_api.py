from django.contrib.auth import get_user_model
from django.contrib.auth.models import Permission
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from plantillas.models import Plantilla


class PlantillaLayoutAPITest(APITestCase):
    def setUp(self):
        User = get_user_model()
        self.user = User.objects.create_user(username="user", password="pass")
        permissions = Permission.objects.filter(
            content_type__app_label="plantillas",
            codename__in=["view_plantilla", "change_plantilla"],
        )
        self.user.user_permissions.set(permissions)

        self.plantilla = Plantilla.objects.create(nombre="P", schema={"nodes": []})
        self.url = reverse("plantilla-layout", kwargs={"pk": self.plantilla.pk})

        self.client.force_authenticate(user=self.user)

    def test_get_layout_ok(self):
        response = self.client.get(self.url)

        assert response.status_code == status.HTTP_200_OK
        assert response.data["layout_json"] == {}
        assert response.data["layout_version"] == 1

    def test_put_layout_ok(self):
        payload = {"layout_json": {"rows": [{"id": "row-1"}]}}

        response = self.client.put(self.url, payload, format="json")
        self.plantilla.refresh_from_db()

        assert response.status_code == status.HTTP_200_OK
        assert response.data["layout_json"] == payload["layout_json"]
        assert self.plantilla.layout_json == payload["layout_json"]
        assert self.plantilla.layout_version == 2

    def test_put_layout_bad(self):
        for value in ([1, 2], "invalid"):
            response = self.client.put(self.url, {"layout_json": value}, format="json")
            assert response.status_code == status.HTTP_400_BAD_REQUEST
            assert "layout_json" in response.data

        self.plantilla.refresh_from_db()
        assert self.plantilla.layout_json == {}
        assert self.plantilla.layout_version == 1

    def test_perm(self):
        User = get_user_model()
        no_perm_user = User.objects.create_user(username="no-perm", password="pass")
        self.client.force_authenticate(user=no_perm_user)

        response = self.client.get(self.url)

        assert response.status_code == status.HTTP_403_FORBIDDEN
