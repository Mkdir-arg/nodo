from rest_framework import serializers
from .models import InstanciaFlujo


class FlowInstanceSerializer(serializers.ModelSerializer):
    class Meta:
        model = InstanciaFlujo
        fields = ['id', 'flow', 'legajo_id', 'plantilla_id', 'status', 
                 'context_json', 'result_json', 'error_message', 
                 'started_at', 'completed_at', 'created_by']
        read_only_fields = ['id', 'started_at', 'completed_at', 'created_by']


class FlowStartSerializer(serializers.Serializer):
    legajo_id = serializers.CharField(max_length=255)
    plantilla_id = serializers.CharField(max_length=255)
    context = serializers.JSONField(required=False, default=dict)


class FlowCandidateSerializer(serializers.Serializer):
    legajo_ids = serializers.ListField(
        child=serializers.CharField(max_length=255),
        min_length=1,
        max_length=1000
    )
    plantilla_id = serializers.CharField(max_length=255)
    context = serializers.JSONField(required=False, default=dict)