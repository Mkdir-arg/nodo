from django.core.management.base import BaseCommand
from plantillas.models import Plantilla
import json


class Command(BaseCommand):
    help = "Seed default plantillas"

    def handle(self, *args, **options):
        if Plantilla.objects.filter(nombre__iexact="Legajo de Ciudadano").exists():
            self.stdout.write("Plantilla already exists")
            return
        schema = {
            "id": "seed",
            "name": "Legajo de Ciudadano",
            "version": 1,
            "nodes": [
                {
                    "type": "section",
                    "id": "sec1",
                    "title": "Sección 1",
                    "collapsed": False,
                    "children": [
                        {"type": "text", "id": "dni", "key": "dni", "label": "DNI"},
                        {"type": "text", "id": "nombre", "key": "nombre", "label": "Nombre"},
                        {"type": "date", "id": "fecha", "key": "fecha_nacimiento", "label": "Fecha de Nacimiento"},
                        {"type": "number", "id": "num1", "key": "num1", "label": "Número 1"},
                        {"type": "number", "id": "num2", "key": "num2", "label": "Número 2"},
                        {"type": "sum", "id": "sum1", "key": "total", "label": "Total", "sources": ["num1", "num2"]},
                    ],
                }
            ],
        }
        Plantilla.objects.create(nombre="Legajo de Ciudadano", descripcion="", schema=schema)
        self.stdout.write(self.style.SUCCESS("Plantilla creada"))
