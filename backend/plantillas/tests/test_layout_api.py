from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from plantillas.models import Plantilla

User = get_user_model()


class LayoutAPITestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        self.client.force_authenticate(user=self.user)
        
        self.plantilla = Plantilla.objects.create(
            nombre='Test Plantilla',
            descripcion='Test description',
            schema={'type': 'object', 'properties': {}},
            layout_json={'version': 1, 'nodes': []},
        )

    def test_get_layout_success(self):
        """Test GET layout returns correct data"""
        url = f'/api/plantillas/{self.plantilla.id}/layout/'
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('layout_json', response.data)
        self.assertIn('layout_version', response.data)
        self.assertEqual(response.data['layout_json'], {'version': 1, 'nodes': []})

    def test_put_layout_success(self):
        """Test PUT layout updates correctly"""
        url = f'/api/plantillas/{self.plantilla.id}/layout/'
        new_layout = {
            'version': 1,
            'nodes': [
                {
                    'id': 'field1',
                    'kind': 'field',
                    'field': {
                        'type': 'text',
                        'name': 'nombre',
                        'label': 'Nombre',
                        'required': True
                    },
                    'row': 0,
                    'col': 0,
                    'colSpan': 6
                }
            ]
        }
        
        response = self.client.put(url, {'layout_json': new_layout}, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.plantilla.refresh_from_db()
        self.assertEqual(self.plantilla.layout_json, new_layout)
        self.assertEqual(self.plantilla.layout_version, 2)  # Should increment

    def test_put_layout_invalid_json(self):
        """Test PUT layout with invalid JSON returns 400"""
        url = f'/api/plantillas/{self.plantilla.id}/layout/'
        
        response = self.client.put(url, {'layout_json': 'invalid'}, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_get_layout_not_found(self):
        """Test GET layout with non-existent plantilla returns 404"""
        url = '/api/plantillas/99999999-9999-9999-9999-999999999999/layout/'
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_layout_requires_authentication(self):
        """Test layout endpoints require authentication"""
        self.client.force_authenticate(user=None)
        url = f'/api/plantillas/{self.plantilla.id}/layout/'
        
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        
        response = self.client.put(url, {'layout_json': {}}, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)