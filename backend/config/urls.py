from django.contrib import admin
from django.urls import path, include, re_path
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView
from users.views import CustomTokenObtainPairView, AuthMeView
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path("admin/", admin.site.urls),

    # Schema & Docs
    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
    path("api/docs/", SpectacularSwaggerView.as_view(url_name="schema"), name="swagger-ui"),

    # Auth (JWT) — barra final opcional para evitar redirects de POST
    re_path(r"^api/token/?$", CustomTokenObtainPairView.as_view(), name="token_obtain_pair"),
    re_path(r"^api/token/refresh/?$", TokenRefreshView.as_view(), name="token_refresh"),
    re_path(r"^api/auth/me/?$", AuthMeView.as_view(), name="auth_me"),

    # Apps
    path("api/users/", include("users.urls")),
    path("api/", include("templates_app.urls")),
    path("api/", include("plantillas.urls")),
    path("api/", include("legajos.urls")),
]
