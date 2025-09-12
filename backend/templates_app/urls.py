from rest_framework import routers
from .views import TemplateViewSet, RecordViewSet

router = routers.DefaultRouter()
router.register(r'templates', TemplateViewSet)
router.register(r'records', RecordViewSet)

urlpatterns = router.urls
