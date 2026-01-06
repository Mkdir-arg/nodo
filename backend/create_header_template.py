#!/usr/bin/env python
import os
import sys
import django

# Setup Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from plantillas.models import Plantilla

# Crear plantilla con encabezado
plantilla_data = {
    "nombre": "Plantilla con Encabezado",
    "descripcion": "Plantilla de prueba con encabezado hero",
    "schema": {
        "nodes": [
            {
                "id": "ui_header_001",
                "type": "ui:header",
                "kind": "ui",
                "variant": "hero-glass",
                "config": {
                    "background": {
                        "mode": "image",
                        "imageUrl": "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1200&h=400&fit=crop",
                        "overlay": {
                            "enabled": True,
                            "opacity": 0.15,
                            "blur": 0
                        }
                    },
                    "topbar": {
                        "enabled": True,
                        "position": "top-right",
                        "actions": ["theme", "notifications", "profile", "logout"],
                        "logoutLabel": "Cerrar Sesión"
                    },
                    "card": {
                        "enabled": True,
                        "glass": {
                            "blur": 13,
                            "opacity": 0.8
                        },
                        "leftIcon": {
                            "enabled": True,
                            "icon": "user",
                            "gradient": {
                                "from": "#F00B80",
                                "to": "#7928CA",
                                "angle": 45
                            }
                        },
                        "title": "{{ data.nombre }} {{ data.apellido }}",
                        "subtitle": "Legajo de Ciudadano",
                        "actions": [
                            {
                                "id": "print",
                                "icon": "printer", 
                                "type": "command",
                                "name": "print"
                            }
                        ]
                    }
                },
                "layout": {
                    "i": "ui_header_001",
                    "x": 0,
                    "y": 0,
                    "w": 12,
                    "h": 6
                }
            },
            {
                "id": "fld_nombre",
                "type": "text",
                "kind": "field",
                "key": "nombre",
                "label": "Nombre",
                "required": True,
                "layout": {
                    "i": "fld_nombre",
                    "x": 0,
                    "y": 6,
                    "w": 6,
                    "h": 3
                }
            },
            {
                "id": "fld_apellido", 
                "type": "text",
                "kind": "field",
                "key": "apellido",
                "label": "Apellido",
                "required": True,
                "layout": {
                    "i": "fld_apellido",
                    "x": 6,
                    "y": 6,
                    "w": 6,
                    "h": 3
                }
            }
        ]
    }
}

plantilla = Plantilla.objects.create(**plantilla_data)
print(f"Plantilla creada: {plantilla.id} - {plantilla.nombre}")
print(f"URL de prueba: http://localhost:3010/legajos/nuevo/crear?formId={plantilla.id}")