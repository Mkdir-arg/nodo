import uuid
from django.db import models
from plantillas.models import Plantilla
from .utils import build_search_document


class Legajo(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    plantilla = models.ForeignKey(Plantilla, on_delete=models.PROTECT, related_name="legajos")
    data = models.JSONField()
    grid_values = models.JSONField(null=True, blank=True)
    search_document = models.TextField(blank=True, default="", db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"Legajo {self.id} - {self.plantilla.nombre}"

    def save(self, *args, **kwargs):
        document = build_search_document(
            self.data or {}, self.grid_values or {}, str(self.id or "")
        )
        self.search_document = document

        update_fields = kwargs.get("update_fields")
        if update_fields is not None:
            update_fields = set(update_fields)
            update_fields.add("search_document")
            kwargs["update_fields"] = list(update_fields)

        super().save(*args, **kwargs)
