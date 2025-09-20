from django.utils import timezone
from django.core.management.base import BaseCommand
from .models import InstanciaFlujo
from .runtime import FlowRuntime
import logging

logger = logging.getLogger(__name__)


class DelayScheduler:
    """Scheduler para manejar delays en flujos"""
    
    @staticmethod
    def process_pending_delays():
        """Procesa instancias pausadas que deben reanudarse"""
        now = timezone.now()
        
        # Buscar instancias pausadas que deben reanudarse
        pending_instances = InstanciaFlujo.objects.filter(
            status='paused',
            resume_at__lte=now
        )
        
        for instance in pending_instances:
            try:
                runtime = FlowRuntime(instance)
                runtime.resume_from_delay()
                logger.info(f"Instancia {instance.id} reanudada desde delay")
                
            except Exception as e:
                logger.error(f"Error reanudando instancia {instance.id}: {str(e)}")
                instance.status = 'failed'
                instance.error_message = f"Error en reanudación: {str(e)}"
                instance.save()


# Management command para ejecutar el scheduler
class Command(BaseCommand):
    help = 'Procesa delays pendientes en flujos'
    
    def handle(self, *args, **options):
        DelayScheduler.process_pending_delays()
        self.stdout.write(
            self.style.SUCCESS('Delays procesados exitosamente')
        )