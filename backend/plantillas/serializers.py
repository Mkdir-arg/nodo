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

    def to_representation(self, instance):
        # DEBUG: Logging cada vez que se serializa una plantilla
        print(f"\n=== PLANTILLA SERIALIZER DEBUG ===")
        print(f"ID: {instance.id}")
        print(f"Nombre: {instance.nombre}")
        print(f"Schema completo: {instance.schema}")
        if isinstance(instance.schema, dict):
            print(f"Schema keys: {list(instance.schema.keys())}")
            if 'nodes' in instance.schema:
                print(f"Nodes encontrados: {len(instance.schema['nodes'])}")
                for i, node in enumerate(instance.schema.get('nodes', [])):
                    print(f"  Node {i}: {node.get('type', 'no-type')} - {node.get('kind', 'no-kind')}")
            else:
                print("NO HAY NODES EN SCHEMA")
        print(f"========================\n")
        return super().to_representation(instance)

    def validate_nombre(self, value):
        qs = Plantilla.objects.filter(nombre__iexact=value)
        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)
        if qs.exists():
            raise serializers.ValidationError("Nombre ya utilizado")
        return value

    def validate_schema(self, value):
        print(f"\n=== VALIDATING SCHEMA ===")
        print(f"Schema recibido: {value}")
        if isinstance(value, dict):
            print(f"Schema keys: {list(value.keys())}")
            if 'nodes' in value:
                print(f"Nodes encontrados: {len(value['nodes'])}")
                for i, node in enumerate(value.get('nodes', [])):
                    print(f"  Node {i}: {node.get('type', 'no-type')} - {node.get('kind', 'no-kind')}")
            else:
                print("NO HAY NODES EN SCHEMA")
        print(f"========================\n")
        run_schema_validations(value)
        return value

    def create(self, validated_data):
        return super().create(validated_data)

    def update(self, instance, validated_data):
        print(f"\n=== UPDATING PLANTILLA ===")
        print(f"Instance ID: {instance.id}")
        print(f"Validated data: {validated_data}")
        if 'schema' in validated_data:
            schema = validated_data['schema']
            print(f"Schema a guardar: {schema}")
            if isinstance(schema, dict) and 'nodes' in schema:
                print(f"Nodes a guardar: {len(schema['nodes'])}")
                for i, node in enumerate(schema.get('nodes', [])):
                    print(f"  Node {i}: {node.get('type', 'no-type')} - {node.get('kind', 'no-kind')}")
        print(f"========================\n")
        
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
