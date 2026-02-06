"""Modelos de analitica; sirven para declarar permisos del modulo."""

from django.db import models


class AnaliticaAccess(models.Model):
    """Modelo minimo; sirve solo para declarar permisos de analitica."""

    class Meta:
        default_permissions = ()
        permissions = [
            ("use_analitica", "Can use analytics"),
        ]
        verbose_name = "Acceso analitica"
        verbose_name_plural = "Accesos analitica"
