from flows.models import Flujo, Step, Transition
from django.contrib.auth.models import User

user, _ = User.objects.get_or_create(username='admin')
flow = Flujo.objects.create(name='Flujo de Prueba', created_by=user, is_active=True)

start = Step.objects.create(flow=flow, step_type='start', name='Inicio', config={'title': 'Seleccionar Candidato'}, order=0)
form = Step.objects.create(flow=flow, step_type='form', name='Formulario', config={'title': 'Datos', 'fields': [{'name': 'telefono', 'label': 'Teléfono', 'type': 'text', 'required': True}]}, order=1)
evaluation = Step.objects.create(flow=flow, step_type='evaluation', name='Evaluación', config={'title': 'Evaluar', 'questions': [{'id': 'q1', 'text': '¿Nivel técnico?', 'type': 'single_choice', 'weight': 1, 'options': [{'id': 'junior', 'text': 'Junior', 'score': 2}, {'id': 'senior', 'text': 'Senior', 'score': 8}]}], 'scoring_ranges': [{'min_score': 0, 'max_score': 5, 'category': 'No Apto'}, {'min_score': 6, 'max_score': 10, 'category': 'Apto'}]}, order=2)

Transition.objects.create(from_step=start, to_step=form, label='Continuar')
Transition.objects.create(from_step=form, to_step=evaluation, label='Evaluar')

print(f'Flujo creado: {flow.name} (ID: {flow.id})')