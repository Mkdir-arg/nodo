from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UserListAPIView, UserViewSet, GroupViewSet

router = DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'groups', GroupViewSet)

urlpatterns = [
    path('', UserListAPIView.as_view(), name='user-list'),
    path('auth/', include(router.urls)),
]
