from django.utils import timezone
from .models import FlowInstance
from .flow_runner import FlowRunner


def execute_flow_instance(instance_id):
    """Execute a flow instance by ID"""
    try:
        instance = FlowInstance.objects.get(id=instance_id)
        runner = FlowRunner(instance)
        runner.execute()
        
        instance.completed_at = timezone.now()
        instance.save()
        
    except FlowInstance.DoesNotExist:
        raise Exception(f"FlowInstance {instance_id} not found")
    except Exception as e:
        if 'instance' in locals():
            instance.status = 'failed'
            instance.error_message = str(e)
            instance.completed_at = timezone.now()
            instance.save()
        raise