#!/usr/bin/env python
import os
import sys
import django

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from flows.models import Flujo, Step, Transition
from django.contrib.auth.models import User

def create_evaluation_flow():
    """Crea un flujo de prueba con evaluación"""
    
    # Obtener o crear usuario
    user, _ = User.objects.get_or_create(
        username='admin',
        defaults={'email': 'admin@example.com', 'is_staff': True, 'is_superuser': True}
    )
    
    # Crear flujo
    flow, created = Flujo.objects.get_or_create(
        name='Flujo de Evaluación de Satisfacción',
        defaults={
            'description': 'Flujo de prueba con evaluación interactiva',
            'created_by': user
        }
    )
    
    if not created:
        # Limpiar steps existentes
        flow.flow_steps.all().delete()
    
    # 1. Nodo Start
    start_step = Step.objects.create(
        flow=flow,
        step_type='start',
        name='Inicio',
        config={
            'title': 'Evaluación de Satisfacción del Cliente',
            'description': 'Seleccione un legajo para comenzar la evaluación',
        },
        order=0
    )
    
    # 2. Nodo Form (datos básicos)
    form_step = Step.objects.create(
        flow=flow,
        step_type='form',
        name='Datos del Cliente',
        config={
            'title': 'Información del Cliente',
            'description': 'Complete los datos básicos del cliente',
            'fields': [
                {
                    'name': 'nombre_cliente',
                    'type': 'text',
                    'label': 'Nombre del Cliente',
                    'required': True,
                    'placeholder': 'Ingrese el nombre completo'
                },
                {
                    'name': 'tipo_servicio',
                    'type': 'select',
                    'label': 'Tipo de Servicio',
                    'required': True,
                    'options': [
                        {'value': 'consulta', 'label': 'Consulta General'},
                        {'value': 'soporte', 'label': 'Soporte Técnico'},
                        {'value': 'ventas', 'label': 'Ventas'},
                        {'value': 'reclamo', 'label': 'Reclamo'}
                    ]
                }
            ]
        },
        order=1
    )
    
    # 3. Nodo Evaluation (evaluación de satisfacción)
    evaluation_step = Step.objects.create(
        flow=flow,
        step_type='evaluation',
        name='Evaluación de Satisfacción',
        config={
            'title': 'Evaluación de Satisfacción del Cliente',
            'description': 'Evalúe la calidad del servicio brindado al cliente',
            'questions': [
                {
                    'id': 'satisfaccion_general',
                    'text': '¿Cómo calificaría la satisfacción general del cliente?',
                    'type': 'single_choice',
                    'weight': 3,
                    'options': [
                        {'id': 'muy_satisfecho', 'text': 'Muy Satisfecho', 'score': 10},
                        {'id': 'satisfecho', 'text': 'Satisfecho', 'score': 8},
                        {'id': 'neutral', 'text': 'Neutral', 'score': 5},
                        {'id': 'insatisfecho', 'text': 'Insatisfecho', 'score': 3},
                        {'id': 'muy_insatisfecho', 'text': 'Muy Insatisfecho', 'score': 1}
                    ]
                },
                {
                    'id': 'tiempo_respuesta',
                    'text': '¿Cómo evalúa el tiempo de respuesta?',
                    'type': 'single_choice',
                    'weight': 2,
                    'options': [
                        {'id': 'excelente', 'text': 'Excelente (Inmediato)', 'score': 10},
                        {'id': 'bueno', 'text': 'Bueno (Menos de 1 hora)', 'score': 8},
                        {'id': 'regular', 'text': 'Regular (1-4 horas)', 'score': 5},
                        {'id': 'lento', 'text': 'Lento (Más de 4 horas)', 'score': 2}
                    ]
                },
                {
                    'id': 'aspectos_positivos',
                    'text': '¿Qué aspectos considera que fueron positivos? (Seleccione todos los que apliquen)',
                    'type': 'multiple_choice',
                    'weight': 1,
                    'options': [
                        {'id': 'atencion_personalizada', 'text': 'Atención personalizada', 'score': 3},
                        {'id': 'resolucion_rapida', 'text': 'Resolución rápida', 'score': 4},
                        {'id': 'comunicacion_clara', 'text': 'Comunicación clara', 'score': 3},
                        {'id': 'seguimiento', 'text': 'Buen seguimiento', 'score': 2},
                        {'id': 'profesionalismo', 'text': 'Profesionalismo del equipo', 'score': 3}
                    ]
                },
                {
                    'id': 'recomendacion',
                    'text': '¿Recomendaría nuestros servicios?',
                    'type': 'single_choice',
                    'weight': 2,
                    'options': [
                        {'id': 'definitivamente_si', 'text': 'Definitivamente sí', 'score': 10},
                        {'id': 'probablemente_si', 'text': 'Probablemente sí', 'score': 7},
                        {'id': 'tal_vez', 'text': 'Tal vez', 'score': 4},
                        {'id': 'probablemente_no', 'text': 'Probablemente no', 'score': 2},
                        {'id': 'definitivamente_no', 'text': 'Definitivamente no', 'score': 0}
                    ]
                }
            ],
            'scoring_ranges': [
                {
                    'min_score': 0,
                    'max_score': 30,
                    'category': 'Cliente Insatisfecho',
                    'next_step_id': None
                },
                {
                    'min_score': 31,
                    'max_score': 60,
                    'category': 'Cliente Neutral',
                    'next_step_id': None
                },
                {
                    'min_score': 61,
                    'max_score': 80,
                    'category': 'Cliente Satisfecho',
                    'next_step_id': None
                },
                {
                    'min_score': 81,
                    'max_score': 100,
                    'category': 'Cliente Muy Satisfecho',
                    'next_step_id': None
                }
            ]
        },
        order=2
    )
    
    # 4. Nodo Form final (acciones de seguimiento)
    followup_step = Step.objects.create(
        flow=flow,
        step_type='form',
        name='Acciones de Seguimiento',
        config={
            'title': 'Acciones de Seguimiento',
            'description': 'Defina las acciones de seguimiento basadas en la evaluación',
            'fields': [
                {
                    'name': 'accion_seguimiento',
                    'type': 'select',
                    'label': 'Acción de Seguimiento',
                    'required': True,
                    'options': [
                        {'value': 'ninguna', 'label': 'Ninguna acción requerida'},
                        {'value': 'llamada', 'label': 'Llamada de seguimiento'},
                        {'value': 'email', 'label': 'Email de seguimiento'},
                        {'value': 'reunion', 'label': 'Reunión presencial'},
                        {'value': 'escalamiento', 'label': 'Escalamiento a supervisor'}
                    ]
                },
                {
                    'name': 'comentarios',
                    'type': 'textarea',
                    'label': 'Comentarios Adicionales',
                    'required': False,
                    'placeholder': 'Observaciones o comentarios adicionales...'
                }
            ]
        },
        order=3
    )
    
    # Crear transiciones
    Transition.objects.create(
        from_step=start_step,
        to_step=form_step,
        label='Continuar'
    )
    
    Transition.objects.create(
        from_step=form_step,
        to_step=evaluation_step,
        label='Continuar a Evaluación'
    )
    
    Transition.objects.create(
        from_step=evaluation_step,
        to_step=followup_step,
        label='Continuar a Seguimiento'
    )
    
    print(f"✅ Flujo creado exitosamente: {flow.name}")
    print(f"   ID del flujo: {flow.id}")
    print(f"   Pasos creados: {flow.flow_steps.count()}")
    print(f"   URL de prueba: http://localhost:3008/flujos/runtime/flow-{flow.id}")
    
    return flow

if __name__ == '__main__':
    create_evaluation_flow()