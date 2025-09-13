from rest_framework.routers import DefaultRouter
from .viewsets import LegajoViewSet

router = DefaultRouter()
router.register(r"legajos", LegajoViewSet, basename="legajo")

urlpatterns = router.urls
