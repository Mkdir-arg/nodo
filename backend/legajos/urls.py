from rest_framework.routers import DefaultRouter
from django.urls import path
from .viewsets import LegajoViewSet

router = DefaultRouter()
router.register(r"legajos", LegajoViewSet, basename="legajo")

urlpatterns = [
    path('legajos/<uuid:pk>/relations/', LegajoViewSet.as_view({'get': 'relations', 'post': 'create_relation'}), name='legajo-relations'),
    path('legajos/<uuid:pk>/relations/<uuid:relation_id>/', LegajoViewSet.as_view({'delete': 'delete_relation'}), name='legajo-relation-delete'),
] + router.urls
