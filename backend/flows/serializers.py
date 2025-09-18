from rest_framework import serializers
from .models import Flujo, EjecucionFlujo


class FlujoSerializer(serializers.ModelSerializer):
    steps = serializers.JSONField(source='steps_data')
    
    class Meta:
        model = Flujo
        fields = [
            'id', 'name', 'description', 'steps', 
            'created_at', 'updated_at', 'is_active'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def create(self, validated_data):
        request = self.context.get('request')
        if request and hasattr(request, 'user') and request.user.is_authenticated:
            validated_data['created_by'] = request.user
        return super().create(validated_data)


class EjecucionFlujoSerializer(serializers.ModelSerializer):
    flow_name = serializers.CharField(source='flow.name', read_only=True)
    
    class Meta:
        model = EjecucionFlujo
        fields = [
            'id', 'flow', 'flow_name', 'status', 
            'started_at', 'completed_at', 'error_message', 'execution_data', 'created_by'
        ]
        read_only_fields = ['id', 'started_at', 'completed_at', 'created_by']

    def create(self, validated_data):
        request = self.context.get('request')
        if request and hasattr(request, 'user') and request.user.is_authenticated:
            validated_data['created_by'] = request.user
        return super().create(validated_data)