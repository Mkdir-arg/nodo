#!/usr/bin/env python
import os
import sys
import django

# Configurar Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.contrib.auth.models import User
from flows.models import Flujo, Step, Transition

def create_test_flow():
    """Crea un flujo de prueba con nodo start y form"""
    
    # Obtener o crear usuario por defecto
    user, _ = User.objects.get_or_create(
        username='admin',
        defaults={'email': 'admin@test.com', 'is_staff': True, 'is_superuser': True}
    )
    
    # Crear flujo
    flow, created = Flujo.objects.get_or_create(
        name='Flujo de Prueba',
        defaults={
            'description': 'Flujo de prueba con formulario',
            'created_by': user,
            'status': 'published'
        }
    )
    
    if created:
        print(f"Flujo creado: {flow.name} (ID: {flow.id})")
    else:
        print(f"Flujo existente: {flow.name} (ID: {flow.id})")
    
    # Limpiar pasos existentes
    flow.flow_steps.all().delete()
    
    # Crear paso 1: Start
    start_step = Step.objects.create(
        flow=flow,
        step_type='start',
        name='Inicio',
        config={
            'title': 'Seleccionar Legajo',
            'description': 'Seleccione un legajo para iniciar el proceso',
            'tableColumns': [
                {'key': 'id', 'label': 'ID'},
                {'key': 'created_at', 'label': 'Creado'},
                {'key': 'text', 'label': 'Texto'},
                {'key': 'email', 'label': 'Email'}
            ]
        },
        order=0
    )
    
    # Crear paso 2: Form
    form_step = Step.objects.create(
        flow=flow,
        step_type='form',
        name='Formulario de Datos',
        config={
            'title': 'Completar Información',
            'description': 'Complete los siguientes campos para continuar',
            'fields': [
                {
                    'name': 'nombre',
                    'type': 'text',
                    'label': 'Nombre Completo',
                    'required': True,
                    'placeholder': 'Ingrese su nombre completo'
                },
                {
                    'name': 'email',
                    'type': 'email',
                    'label': 'Correo Electrónico',
                    'required': True,
                    'placeholder': 'ejemplo@correo.com'
                },
                {
                    'name': 'telefono',
                    'type': 'tel',
                    'label': 'Teléfono',
                    'required': False,
                    'placeholder': '+54 11 1234-5678'
                },
                {
                    'name': 'categoria',
                    'type': 'select',
                    'label': 'Categoría',
                    'required': True,
                    'options': [
                        {'value': 'cliente', 'label': 'Cliente'},
                        {'value': 'proveedor', 'label': 'Proveedor'},
                        {'value': 'empleado', 'label': 'Empleado'}
                    ]
                }
            ]
        },
        order=1
    )
    
    # Crear paso 3: Confirmación
    confirm_step = Step.objects.create(
        flow=flow,
        step_type='form',
        name='Confirmación',
        config={
            'title': 'Datos Guardados',
            'description': 'Los datos se han guardado correctamente en la base de datos',
            'fields': []
        },
        order=2
    )
    
    # Crear transiciones
    Transition.objects.create(
        from_step=start_step,
        to_step=form_step,
        label='Continuar'
    )
    
    Transition.objects.create(
        from_step=form_step,
        to_step=confirm_step,
        label='Guardar'
    )
    
    print(f"Pasos creados:")
    print(f"  1. {start_step.name} (ID: {start_step.id})")
    print(f"  2. {form_step.name} (ID: {form_step.id})")
    print(f"  3. {confirm_step.name} (ID: {confirm_step.id})")
    
    print(f"\nURL de prueba: http://localhost:3008/flujos/runtime/flow-{flow.id}")
    
    return flow

if __name__ == '__main__':
    create_test_flow()