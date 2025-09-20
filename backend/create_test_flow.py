#!/usr/bin/env python
import os
import sys
import django

# Setup Django
sys.path.append('/app')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from flows.models import Flujo, Step, Transition
from django.contrib.auth.models import User

# Obtener o crear usuario
user, _ = User.objects.get_or_create(username='admin', defaults={'email': 'admin@test.com'})

# Crear flujo completo
flow = Flujo.objects.create(
    name='Flujo Completo de Prueba',
    description='Flujo con Start, Form, Evaluation, Email y Delay',
    created_by=user,
    is_active=True
)

# 1. Nodo Start
start_step = Step.objects.create(
    flow=flow,
    step_type='start',
    name='Seleccionar Candidato',
    config={
        'title': 'Proceso de Evaluación',
        'description': 'Seleccione un candidato para iniciar el proceso'
    },
    order=0
)

# 2. Nodo Form
form_step = Step.objects.create(
    flow=flow,
    step_type='form',
    name='Datos Adicionales',
    config={
        'title': 'Información Complementaria',
        'description': 'Complete los siguientes datos del candidato',
        'fields': [
            {
                'name': 'telefono',
                'label': 'Teléfono de contacto',
                'type': 'text',
                'required': True,
                'placeholder': '+54 11 1234-5678'
            },
            {
                'name': 'experiencia_anos',
                'label': 'Años de experiencia',
                'type': 'number',
                'required': True
            }
        ]
    },
    order=1
)

# 3. Nodo Evaluation
eval_step = Step.objects.create(
    flow=flow,
    step_type='evaluation',
    name='Evaluación Técnica',
    config={
        'title': 'Evaluación de Competencias',
        'description': 'Responda las siguientes preguntas',
        'questions': [
            {
                'id': 'q1',
                'text': '¿Cuál es el nivel técnico del candidato?',
                'type': 'single_choice',
                'weight': 1,
                'options': [
                    {'id': 'junior', 'text': 'Junior', 'score': 2},
                    {'id': 'senior', 'text': 'Senior', 'score': 8}
                ]
            }
        ],
        'scoring_ranges': [
            {'min_score': 0, 'max_score': 5, 'category': 'No Apto'},
            {'min_score': 6, 'max_score': 10, 'category': 'Apto'}
        ]
    },
    order=2
)

# 4. Nodo Email
email_step = Step.objects.create(
    flow=flow,
    step_type='email',
    name='Notificar Resultado',
    config={
        'to': 'admin@test.com',
        'subject': 'Evaluación Completada',
        'body': 'El candidato ha sido evaluado exitosamente.'
    },
    order=3
)

# Crear transiciones
Transition.objects.create(from_step=start_step, to_step=form_step, label='Continuar')
Transition.objects.create(from_step=form_step, to_step=eval_step, label='Evaluar')
Transition.objects.create(from_step=eval_step, to_step=email_step, label='Finalizar')

print(f'✅ Flujo creado: {flow.name} (ID: {flow.id})')
print(f'✅ Pasos: {flow.flow_steps.count()}')
print(f'✅ Transiciones: {Transition.objects.filter(from_step__flow=flow).count()}')