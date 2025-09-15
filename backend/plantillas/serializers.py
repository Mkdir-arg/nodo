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
            "visual_config",
            "version",
            "estado",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("version", "estado", "visual_config", "created_at", "updated_at")

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


class PlantillaVisualConfigSerializer(serializers.Serializer):
    visual_config = serializers.JSONField(default=dict)


class PlantillaLayoutSerializer(serializers.ModelSerializer):
    class Meta:
        model = Plantilla
        fields = (
            "id",
            "layout_json",
            "layout_version",
            "updated_at",
        )
        read_only_fields = ("id", "layout_version", "updated_at")

    def validate_layout_json(self, value):
        if not isinstance(value, dict):
            raise serializers.ValidationError("Debe ser un objeto JSON")
        return value

    def update(self, instance, validated_data):
        instance.layout_version += 1
        instance.layout_json = validated_data.get("layout_json", instance.layout_json)
        instance.save(update_fields=["layout_json", "layout_version"])
        return instance
