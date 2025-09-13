import uuid
from django.db import models
from plantillas.models import Plantilla


class Legajo(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    plantilla = models.ForeignKey(Plantilla, on_delete=models.PROTECT, related_name="legajos")
    data = models.JSONField()
    grid_values = models.JSONField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
