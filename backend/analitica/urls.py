"""Ruteo de analitica; sirve para exponer endpoints del modulo."""

from django.urls import path

from .analytics_views import AnalyticsCatalogView, AnalyticsQueryView, AnalyticsValidateView
from .chat_views import AnalyticsChatView

urlpatterns = [
    path(
        "legajos/analytics/catalog/",
        AnalyticsCatalogView.as_view(),
        name="legajos-analytics-catalog",
    ),
    path(
        "legajos/analytics/validate/",
        AnalyticsValidateView.as_view(),
        name="legajos-analytics-validate",
    ),
    path(
        "legajos/analytics/query/",
        AnalyticsQueryView.as_view(),
        name="legajos-analytics-query",
    ),
    path(
        "legajos/analytics/chat/",
        AnalyticsChatView.as_view(),
        name="legajos-analytics-chat",
    ),
]
