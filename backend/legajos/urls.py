"""URL routing for legajos endpoints."""

from rest_framework.routers import DefaultRouter
from django.urls import path

from .analytics_views import AnalyticsCatalogView, AnalyticsValidateView
from .viewsets import LegajoViewSet

router = DefaultRouter()
router.register(r"legajos", LegajoViewSet, basename="legajo")

urlpatterns = [
    path(
        "legajos/analytics/catalog/",
        AnalyticsCatalogView.as_view(),
        name="legajos-analytics-catalog",
    ),
    path(
        "legajos/analytics/validate/",
        AnalyticsValidateView.as_view(),
        name="legajos-analytics-validate",
    ),
    path('legajos/<uuid:pk>/relations/', LegajoViewSet.as_view({'get': 'relations', 'post': 'create_relation'}), name='legajo-relations'),
    path('legajos/<uuid:pk>/relations/<uuid:relation_id>/', LegajoViewSet.as_view({'delete': 'delete_relation'}), name='legajo-relation-delete'),
] + router.urls
