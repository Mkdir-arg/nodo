from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .viewsets import FlujoViewSet, EjecucionFlujoViewSet, InstanciaFlujoViewSet, StepViewSet, InstanceLogViewSet
from .views import CreateInstanceView
from .simple_views import create_instance_simple
from .direct_views import create_instance_direct

router = DefaultRouter()
router.register(r'flows', FlujoViewSet, basename='flow')
router.register(r'executions', EjecucionFlujoViewSet, basename='execution')
router.register(r'instances', InstanciaFlujoViewSet, basename='instance')
router.register(r'steps', StepViewSet, basename='step')
router.register(r'logs', InstanceLogViewSet, basename='log')

urlpatterns = [
    path('', include(router.urls)),
    path('create-instance/', CreateInstanceView.as_view(), name='create-instance'),
    path('simple-create/', create_instance_simple, name='simple-create'),
    path('direct-create/', create_instance_direct, name='direct-create'),
]