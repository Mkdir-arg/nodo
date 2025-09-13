from rest_framework import serializers
from .models import Plantilla
from .validators import run_schema_validations


class PlantillaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Plantilla
        fields = (
            "id",
            "nombre",
            "descripcion",
            "schema",
            "version",
            "estado",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("version", "estado", "created_at", "updated_at")

    def validate_nombre(self, value):
        qs = Plantilla.objects.filter(nombre__iexact=value)
        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)
        if qs.exists():
            raise serializers.ValidationError("Nombre ya utilizado")
        return value

    def validate_schema(self, value):
        run_schema_validations(value)
        return value

    def create(self, validated_data):
        return super().create(validated_data)

    def update(self, instance, validated_data):
        instance.version += 1
        for attr, val in validated_data.items():
            setattr(instance, attr, val)
        instance.save()
        return instance
