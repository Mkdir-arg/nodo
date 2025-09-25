from django.core.management.base import BaseCommand
from config.models import SystemSettings
import json


class Command(BaseCommand):
    help = 'Configura los valores por defecto de seguridad'

    def handle(self, *args, **options):
        # Configurar timeout de inactividad por defecto
        setting, created = SystemSettings.objects.get_or_create(
            key='inactivityTimeoutMinutes',
            defaults={'value': '30'}
        )
        
        if created:
            self.stdout.write(
                self.style.SUCCESS(
                    'Configuración de timeout de inactividad creada: 30 minutos'
                )
            )
        else:
            self.stdout.write(
                self.style.WARNING(
                    f'Configuración de timeout de inactividad ya existe: {setting.value} minutos'
                )
            )