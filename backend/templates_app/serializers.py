from rest_framework import serializers
from .models import Template, Record

class TemplateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Template
        fields = "__all__"
        read_only_fields = ("id", "created_at", "updated_at", "version", "created_by")

    def create(self, validated_data):
        user = self.context.get("request").user
        validated_data["created_by"] = user if user and user.is_authenticated else None
        return super().create(validated_data)

    def update(self, instance, validated_data):
        validated_data["version"] = instance.version + 1
        return super().update(instance, validated_data)

class RecordSerializer(serializers.ModelSerializer):
    class Meta:
        model = Record
        fields = "__all__"
        read_only_fields = ("id", "created_at", "updated_at")
