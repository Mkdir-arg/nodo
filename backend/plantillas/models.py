import uuid
from django.db import models
from django.db.models import Q
from django.db.models.functions import Lower


class Plantilla(models.Model):
    class Estado(models.TextChoices):
        ACTIVO = "ACTIVO", "ACTIVO"
        INACTIVO = "INACTIVO", "INACTIVO"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    nombre = models.CharField(max_length=255, unique=False)
    descripcion = models.TextField(null=True, blank=True)
    schema = models.JSONField()
    visual_config = models.JSONField(default=dict, blank=True)
    layout_json = models.JSONField(default=dict, blank=True)
    layout_version = models.PositiveIntegerField(default=1)
    version = models.PositiveIntegerField(default=1)
    estado = models.CharField(max_length=10, choices=Estado.choices, default=Estado.ACTIVO)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(Lower("nombre"), name="uq_plantilla_nombre_ci"),
        ]
        ordering = ["-updated_at"]

    def __str__(self):
        return self.nombre
