from django.contrib.auth.models import User
from rest_framework.generics import ListAPIView
from rest_framework.permissions import IsAuthenticated  # cambia a IsAdminUser si querés solo admins
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter

from .serializers import UserSerializer

class UserListAPIView(ListAPIView):
    queryset = User.objects.all().order_by("id")
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ["is_active", "is_staff"]
    search_fields = ["username", "first_name", "last_name", "email"]
    ordering_fields = ["id", "date_joined", "last_login"]
