from rest_framework import serializers
from .models import Flujo, EjecucionFlujo, InstanciaFlujo, Step, Transition, InstanceLog


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


class StepSerializer(serializers.ModelSerializer):
    class Meta:
        model = Step
        fields = '__all__'


class TransitionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transition
        fields = '__all__'


class InstanceLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = InstanceLog
        fields = '__all__'


class InstanciaFlujoSerializer(serializers.ModelSerializer):
    current_step = StepSerializer(read_only=True)
    
    class Meta:
        model = InstanciaFlujo
        fields = '__all__'
        read_only_fields = ('created_by',)


class FlowStartSerializer(serializers.Serializer):
    legajo_id = serializers.UUIDField()
    plantilla_id = serializers.UUIDField()
    context = serializers.JSONField(required=False, default=dict)


class FlowCandidateSerializer(serializers.Serializer):
    legajo_ids = serializers.ListField(child=serializers.UUIDField())
    plantilla_id = serializers.UUIDField()
    context = serializers.JSONField(required=False, default=dict)


class FlowInstanceSerializer(serializers.ModelSerializer):
    class Meta:
        model = InstanciaFlujo
        fields = ['id', 'flow', 'legajo_id', 'status', 'started_at']