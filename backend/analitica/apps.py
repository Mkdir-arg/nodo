"""Config de la app de analitica; sirve para registrar el modulo en Django."""

from django.apps import AppConfig


class AnaliticaConfig(AppConfig):
    """Configura la app Analitica; sirve para inicializar el modulo."""

    default_auto_field = "django.db.models.BigAutoField"
    name = "analitica"
