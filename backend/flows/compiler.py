from django.db import transaction
from .models import Flujo, Step, Transition
from plantillas.models import Plantilla


class TemplateCompiler:
    """Compila plantillas en flujos ejecutables"""
    
    def __init__(self, plantilla):
        self.plantilla = plantilla
        self.schema = plantilla.schema
        
    @transaction.atomic
    def compile_to_flow(self, flow_name=None):
        """Convierte la plantilla en un flujo ejecutable"""
        flow_name = flow_name or f"Flow_{self.plantilla.nombre}"
        
        # Crear o actualizar flujo
        flow, created = Flujo.objects.get_or_create(
            name=flow_name,
            defaults={
                'description': f'Flujo generado desde plantilla: {self.plantilla.nombre}',
                'created_by_id': 1  # TODO: usar usuario actual
            }
        )
        
        # Limpiar steps existentes para recompilación idempotente
        flow.flow_steps.all().delete()
        
        steps = []
        transitions = []
        
        # 1. Crear nodo Start
        start_step = self._create_start_step(flow)
        steps.append(start_step)
        
        # 2. Procesar secciones de la plantilla
        sections = self.schema.get('sections', [])
        prev_step = start_step
        
        for i, section in enumerate(sections):
            section_type = section.get('type', 'form')
            
            if section_type == 'evaluation':
                step = self._create_evaluation_step(flow, section, i)
            else:
                step = self._create_form_step(flow, section, i)
                
            steps.append(step)
            
            # Crear transición del paso anterior
            transition = Transition.objects.create(
                from_step=prev_step,
                to_step=step,
                label='Continuar'
            )
            transitions.append(transition)
            prev_step = step
        
        # 3. Procesar acciones configuradas
        actions = self.schema.get('actions', [])
        for i, action in enumerate(actions):
            step = self._create_action_step(flow, action, len(sections) + i)
            steps.append(step)
            
            transition = Transition.objects.create(
                from_step=prev_step,
                to_step=step,
                label='Continuar'
            )
            transitions.append(transition)
            prev_step = step
        
        return flow
    
    def _create_start_step(self, flow):
        """Crea el nodo Start"""
        return Step.objects.create(
            flow=flow,
            step_type='start',
            name='Inicio',
            config={
                'title': f'Iniciar proceso: {self.plantilla.nombre}',
                'description': 'Seleccione un legajo para comenzar el flujo',
                'plantilla_id': str(self.plantilla.id)
            },
            ui_metadata={
                'style': 'border-green',
                'icon': 'play'
            },
            order=0
        )
    
    def _create_form_step(self, flow, section, order):
        """Crea un nodo Form desde una sección"""
        fields = []
        
        for field in section.get('fields', []):
            field_config = {
                'name': field.get('name'),
                'label': field.get('label'),
                'type': field.get('type', 'text'),
                'required': field.get('required', False),
                'placeholder': field.get('placeholder', ''),
                'help_text': field.get('help_text', ''),
                'validation': field.get('validation', {})
            }
            
            if field.get('options'):
                field_config['options'] = field['options']
                
            fields.append(field_config)
        
        return Step.objects.create(
            flow=flow,
            step_type='form',
            name=section.get('title', f'Formulario {order + 1}'),
            config={
                'title': section.get('title'),
                'description': section.get('description', ''),
                'fields': fields
            },
            order=order + 1
        )
    
    def _create_evaluation_step(self, flow, section, order):
        """Crea un nodo Evaluation desde una sección de evaluación"""
        questions = []
        
        for question in section.get('questions', []):
            question_config = {
                'id': question.get('id'),
                'text': question.get('text'),
                'type': question.get('type', 'single_choice'),
                'weight': question.get('weight', 1),
                'options': []
            }
            
            for option in question.get('options', []):
                option_config = {
                    'id': option.get('id'),
                    'text': option.get('text'),
                    'score': option.get('score', 0)
                }
                question_config['options'].append(option_config)
            
            questions.append(question_config)
        
        # Configurar rangos de scoring
        scoring_ranges = section.get('scoring_ranges', [])
        
        return Step.objects.create(
            flow=flow,
            step_type='evaluation',
            name=section.get('title', f'Evaluación {order + 1}'),
            config={
                'title': section.get('title'),
                'description': section.get('description', ''),
                'questions': questions,
                'scoring_ranges': scoring_ranges
            },
            order=order + 1
        )
    
    def _create_action_step(self, flow, action, order):
        """Crea un nodo de acción"""
        action_type = action.get('type')
        
        step_config = {
            'title': action.get('name', f'Acción {order + 1}'),
        }
        
        if action_type == 'form':
            step_config.update({
                'title': action.get('config', {}).get('title', 'Formulario'),
                'description': action.get('config', {}).get('description', ''),
                'fields': action.get('config', {}).get('fields', [])
            })
        elif action_type == 'evaluation':
            step_config.update({
                'title': action.get('config', {}).get('title', 'Evaluación'),
                'description': action.get('config', {}).get('description', ''),
                'questions': action.get('config', {}).get('questions', []),
                'scoring_ranges': action.get('config', {}).get('scoring_ranges', [])
            })
        elif action_type == 'email':
            step_config.update({
                'to': action.get('to'),
                'subject': action.get('subject'),
                'body': action.get('body')
            })
        elif action_type == 'http':
            step_config.update({
                'method': action.get('method', 'GET'),
                'url': action.get('url'),
                'headers': action.get('headers', {}),
                'body': action.get('body')
            })
        elif action_type == 'delay':
            step_config.update({
                'duration': action.get('duration', 1),
                'unit': action.get('unit', 'minutes')
            })
        elif action_type == 'condition':
            step_config.update({
                'condition': action.get('condition'),
                'true_path': action.get('true_path'),
                'false_path': action.get('false_path')
            })
        
        return Step.objects.create(
            flow=flow,
            step_type=action_type,
            name=action.get('name', f'Acción {order + 1}'),
            config=step_config,
            order=order + 1
        )