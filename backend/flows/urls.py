from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .viewsets import FlowViewSet, FlowExecutionViewSet

router = DefaultRouter()
router.register(r'flows', FlowViewSet, basename='flow')
router.register(r'executions', FlowExecutionViewSet, basename='execution')

urlpatterns = [
    path('', include(router.urls)),
]