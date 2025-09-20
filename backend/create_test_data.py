#!/usr/bin/env python
import os
import sys
import django

# Setup Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth.models import User
from flows.models import Flujo, Step, Transition

def create_test_data():
    # Crear usuario por defecto
    user, created = User.objects.get_or_create(
        username='default',
        defaults={'email': 'default@test.com', 'is_staff': True}
    )
    if created:
        user.set_password('default123')
        user.save()
        print(f"Usuario creado: {user.username}")
    
    # Crear flujo de prueba
    flow, created = Flujo.objects.get_or_create(
        name='Flujo de Evaluación',
        defaults={
            'description': 'Flujo de prueba para evaluación de candidatos',
            'created_by': user,
            'steps_data': []
        }
    )
    if created:
        print(f"Flujo creado: {flow.name}")
    
    # Crear pasos
    start_step, created = Step.objects.get_or_create(
        flow=flow,
        step_type='start',
        name='Inicio',
        defaults={
            'config': {
                'title': 'Iniciar Evaluación',
                'description': 'Seleccione un candidato para comenzar'
            },
            'order': 0
        }
    )
    
    form_step, created = Step.objects.get_or_create(
        flow=flow,
        step_type='form',
        name='Formulario',
        defaults={
            'config': {
                'title': 'Datos del Candidato',
                'description': 'Complete la información requerida',
                'fields': [
                    {
                        'name': 'nombre',
                        'type': 'text',
                        'label': 'Nombre completo',
                        'required': True
                    },
                    {
                        'name': 'email',
                        'type': 'email',
                        'label': 'Email',
                        'required': True
                    }
                ]
            },
            'order': 1
        }
    )
    
    eval_step, created = Step.objects.get_or_create(
        flow=flow,
        step_type='evaluation',
        name='Evaluación',
        defaults={
            'config': {
                'title': 'Evaluación Técnica',
                'description': 'Responda las siguientes preguntas',
                'questions': [
                    {
                        'id': 'q1',
                        'text': '¿Cuántos años de experiencia tiene?',
                        'type': 'single_choice',
                        'options': [
                            {'id': 'junior', 'text': '0-2 años', 'score': 1},
                            {'id': 'mid', 'text': '3-5 años', 'score': 3},
                            {'id': 'senior', 'text': '5+ años', 'score': 5}
                        ]
                    }
                ]
            },
            'order': 2
        }
    )
    
    # Crear transiciones
    Transition.objects.get_or_create(
        from_step=start_step,
        to_step=form_step,
        defaults={'label': 'Continuar'}
    )
    
    Transition.objects.get_or_create(
        from_step=form_step,
        to_step=eval_step,
        defaults={'label': 'Evaluar'}
    )
    
    print("Datos de prueba creados exitosamente")

if __name__ == '__main__':
    create_test_data()