from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .viewsets import FlujoViewSet, EjecucionFlujoViewSet

router = DefaultRouter()
router.register(r'flows', FlujoViewSet, basename='flow')
router.register(r'executions', EjecucionFlujoViewSet, basename='execution')

urlpatterns = [
    path('', include(router.urls)),
]