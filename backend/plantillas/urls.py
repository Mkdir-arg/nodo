from rest_framework.routers import DefaultRouter
from .viewsets import PlantillaViewSet

router = DefaultRouter()
router.register(r"plantillas", PlantillaViewSet, basename="plantilla")

urlpatterns = router.urls
