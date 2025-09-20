from django.core.management.base import BaseCommand
from flows.scheduler import DelayScheduler


class Command(BaseCommand):
    help = 'Procesa delays pendientes en flujos'
    
    def handle(self, *args, **options):
        DelayScheduler.process_pending_delays()
        self.stdout.write(
            self.style.SUCCESS('Delays procesados exitosamente')
        )