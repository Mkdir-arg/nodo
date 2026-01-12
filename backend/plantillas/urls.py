from django.urls import path
from rest_framework.routers import DefaultRouter
from .viewsets import PlantillaViewSet
from .views_calculated import count_records

router = DefaultRouter()
router.register(r"plantillas", PlantillaViewSet, basename="plantilla")

urlpatterns = [
    path('calculated-fields/count/', count_records, name='count-records'),
] + router.urls
