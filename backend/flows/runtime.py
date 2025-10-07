import json
import re
from django.utils import timezone
from django.utils.html import escape
from django.db import transaction
from .models import InstanciaFlujo, Step, Transition, InstanceLog
from .nodes import StartNode, FormNode, EvaluationNode, EmailNode, HttpNode, DelayNode, ConditionNode, DatabaseNode, TransformNode


class FlowRuntime:
    """Runtime para ejecutar instancias de flujo"""
    
    NODE_CLASSES = {
        'start': StartNode,
        'form': FormNode,
        'evaluation': EvaluationNode,
        'email': EmailNode,
        'http': HttpNode,
        'delay': DelayNode,
        'condition': ConditionNode,
        'database': DatabaseNode,
        'transform': TransformNode,
    }
    
    def __init__(self, instance):
        self.instance = instance
        self.flow = instance.flow
        
    def get_current_step_html(self):
        """Obtiene el HTML del paso actual"""
        print(f"[DEBUG] get_current_step_html - current_step: {self.instance.current_step}")
        print(f"[DEBUG] get_current_step_html - context: {self.instance.context}")
        
        # Manejar flujos con current_step (formato nuevo)
        if self.instance.current_step:
            print(f"[DEBUG] Using current_step format")
            step_type = self.instance.current_step.step_type
            
            # Para formularios, devolver estructura JSON en lugar de HTML
            if step_type == 'form':
                return self._get_form_data()
                
            # Para evaluaciones, devolver estructura JSON
            if step_type == 'evaluation':
                return self._get_evaluation_data()
                
            node_class = self.NODE_CLASSES.get(step_type)
            if not node_class:
                # Si no hay clase de nodo, devolver datos básicos
                return {
                    'type': step_type,
                    'title': self.instance.current_step.config.get('title', 'Paso Actual'),
                    'description': self.instance.current_step.config.get('description', ''),
                    'html': f'<p>Nodo de tipo: {step_type}</p>',
                    'current_step_id': str(self.instance.current_step.id)
                }
            
            node = node_class(self.instance.current_step, self.instance.context)
            html = node.render_html()
            
            # Sanitizar HTML
            return self._sanitize_html(html)
        
        # Manejar flujos con steps_data (formato antiguo)
        print(f"[DEBUG] Using steps_data format")
        return self._get_steps_data_current_step()
    
    def _get_form_data(self):
        """Obtiene datos estructurados para formularios"""
        step = self.instance.current_step
        config = step.config or {}
        
        # Campos por defecto si no están configurados
        default_fields = [
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
        
        return {
            'type': 'form',
            'title': config.get('title', 'Formulario de Datos'),
            'description': config.get('description', 'Complete los siguientes campos para continuar'),
            'fields': config.get('fields', default_fields),
            'current_step_id': str(step.id)
        }
    
    def _get_evaluation_data(self):
        """Obtiene datos estructurados para evaluaciones"""
        step = self.instance.current_step
        config = step.config or {}
        
        # Preguntas por defecto si no están configuradas
        default_questions = [
            {
                'id': 'q1',
                'text': '¿Cómo calificaría su experiencia general?',
                'type': 'single_choice',
                'weight': 1,
                'options': [
                    {'id': 'excellent', 'text': 'Excelente', 'score': 5},
                    {'id': 'good', 'text': 'Buena', 'score': 4},
                    {'id': 'average', 'text': 'Regular', 'score': 3},
                    {'id': 'poor', 'text': 'Mala', 'score': 2},
                    {'id': 'terrible', 'text': 'Terrible', 'score': 1}
                ]
            },
            {
                'id': 'q2',
                'text': '¿Qué aspectos considera más importantes? (Seleccione todos los que apliquen)',
                'type': 'multiple_choice',
                'weight': 2,
                'options': [
                    {'id': 'quality', 'text': 'Calidad del servicio', 'score': 3},
                    {'id': 'speed', 'text': 'Rapidez de respuesta', 'score': 2},
                    {'id': 'price', 'text': 'Precio competitivo', 'score': 2},
                    {'id': 'support', 'text': 'Soporte técnico', 'score': 3}
                ]
            }
        ]
        
        # Rangos de scoring por defecto
        default_scoring_ranges = [
            {'min_score': 0, 'max_score': 10, 'category': 'Bajo'},
            {'min_score': 11, 'max_score': 20, 'category': 'Medio'},
            {'min_score': 21, 'max_score': 30, 'category': 'Alto'}
        ]
        
        return {
            'type': 'evaluation',
            'title': config.get('title', 'Evaluación'),
            'description': config.get('description', 'Complete la siguiente evaluación'),
            'questions': config.get('questions', default_questions),
            'scoring_ranges': config.get('scoring_ranges', default_scoring_ranges),
            'current_step_id': str(step.id)
        }
    
    def _get_steps_data_current_step(self):
        """Obtiene el paso actual desde steps_data"""
        steps_data = self.flow.steps_data if hasattr(self.flow, 'steps_data') else []
        current_step_index = self.instance.context.get('current_step_index', 1)
        
        print(f"[DEBUG] steps_data length: {len(steps_data) if isinstance(steps_data, list) else 'not list'}")
        print(f"[DEBUG] current_step_index: {current_step_index}")
        
        if not isinstance(steps_data, list) or current_step_index >= len(steps_data):
            return self._get_error_html(f"No se pudo obtener el paso actual. Index: {current_step_index}, Steps: {len(steps_data) if isinstance(steps_data, list) else 'not list'}")
        
        current_step_data = steps_data[current_step_index]
        step_type = current_step_data.get('type')
        steps_total = len(steps_data)
        display_index = current_step_index + 1
        
        print(f"[DEBUG] current_step_data: {current_step_data.get('name')} ({step_type})")
        
        if step_type == 'form':
            return {
                'type': 'form',
                'title': current_step_data.get('config', {}).get('title', 'Formulario'),
                'description': current_step_data.get('config', {}).get('description', ''),
                'fields': current_step_data.get('config', {}).get('fields', []),
                'current_step_id': current_step_data.get('id'),
                'node_name': current_step_data.get('name'),
                'step_index': display_index,
                'steps_total': steps_total
            }
        elif step_type == 'evaluation':
            return {
                'type': 'evaluation',
                'title': current_step_data.get('config', {}).get('title', 'Evaluación'),
                'description': current_step_data.get('config', {}).get('description', ''),
                'questions': current_step_data.get('config', {}).get('questions', []),
                'scoring_ranges': current_step_data.get('config', {}).get('scoring_ranges', []),
                'current_step_id': current_step_data.get('id'),
                'node_name': current_step_data.get('name'),
                'step_index': display_index,
                'steps_total': steps_total
            }
        else:
            return {
                'type': step_type,
                'title': current_step_data.get('name', 'Paso Actual'),
                'description': current_step_data.get('config', {}).get('description', ''),
                'html': f'<p>Nodo de tipo: {step_type}</p>',
                'current_step_id': current_step_data.get('id'),
                'node_name': current_step_data.get('name'),
                'step_index': display_index,
                'steps_total': steps_total
            }
    
    def get_available_transitions(self):
        """Obtiene las transiciones disponibles desde el paso actual"""
        if not self.instance.current_step:
            return []
            
        transitions = self.instance.current_step.outgoing_transitions.all()
        return [
            {
                'id': str(t.id),
                'label': t.label or 'Continuar',
                'to_step_id': str(t.to_step.id)
            }
            for t in transitions
        ]
    
    @transaction.atomic
    def process_interaction(self, interaction_data, user):
        """Procesa la interacción del usuario y avanza el flujo"""
        try:
            # Manejar flujos con current_step (formato nuevo)
            if self.instance.current_step:
                step_name = self.instance.current_step.name
                self._log('info', f'Procesando interacción en paso {step_name}', 
                         {'interaction': interaction_data}, user)
                
                # Para formularios, guardar datos directamente
                if self.instance.current_step.step_type == 'form':
                    return self._process_form_interaction(interaction_data, user)
                
                # Para evaluaciones, procesar con scoring
                if self.instance.current_step.step_type == 'evaluation':
                    return self._process_evaluation_interaction(interaction_data, user)
            
            # Manejar flujos con steps_data (formato antiguo)
            else:
                return self._process_steps_data_interaction(interaction_data, user)
            
            # Ejecutar el nodo actual
            node_class = self.NODE_CLASSES.get(self.instance.current_step.step_type)
            if not node_class:
                raise ValueError(f"Tipo de nodo no soportado: {self.instance.current_step.step_type}")
            
            node = node_class(self.instance.current_step, self.instance.context)
            result = node.execute(interaction_data, user)
            
            # Actualizar contexto
            if result.get('context_updates'):
                self._update_context(result['context_updates'])
            
            # Determinar siguiente paso
            next_step = self._determine_next_step(result)
            
            if next_step:
                self.instance.current_step = next_step
                self.instance.status = 'running'
                self._log('info', f'Avanzando a paso: {next_step.name}', {'step_id': str(next_step.id)}, user)
            else:
                # Flujo completado
                self.instance.status = 'completed'
                self.instance.completed_at = timezone.now()
                self._log('info', 'Flujo completado', {}, user)
            
            self.instance.save()
            
            return {
                'success': True,
                'next_step_id': str(next_step.id) if next_step else None,
                'completed': self.instance.status == 'completed'
            }
            
        except Exception as e:
            self.instance.status = 'failed'
            self.instance.error_message = str(e)
            self.instance.save()
            
            self._log('error', f'Error en ejecución: {str(e)}', {'error': str(e)}, user)
            
            return {
                'success': False,
                'error': str(e)
            }
    
    def _process_form_interaction(self, form_data, user):
        """Procesa específicamente interacciones de formulario"""
        step_id = str(self.instance.current_step.id)
        
        # Guardar datos del formulario en el contexto
        if 'forms' not in self.instance.context:
            self.instance.context['forms'] = {}
        
        self.instance.context['forms'][f'step_{step_id}'] = {
            'data': form_data,
            'timestamp': timezone.now().isoformat(),
            'user_id': user.id if user and hasattr(user, 'id') else None
        }
        
        # Log de datos guardados
        self._log('info', f'Datos de formulario guardados en step_{step_id}', 
                 {'form_data': form_data, 'storage_path': f'context.forms.step_{step_id}'}, user)
        
        # Buscar siguiente paso
        transitions = self.instance.current_step.outgoing_transitions.all()
        next_step = transitions.first().to_step if transitions else None
        
        if next_step:
            self.instance.current_step = next_step
            self.instance.status = 'running'
            self._log('info', f'Avanzando a paso: {next_step.name}', {'step_id': str(next_step.id)}, user)
        else:
            self.instance.status = 'completed'
            self.instance.completed_at = timezone.now()
            self._log('info', 'Flujo completado', {}, user)
        
        self.instance.save()
        
        return {
            'success': True,
            'next_step_id': str(next_step.id) if next_step else None,
            'completed': self.instance.status == 'completed',
            'saved_data': {
                'table': 'flows_instanciaflujo',
                'field': 'context',
                'path': f'context.forms.step_{step_id}',
                'instance_id': str(self.instance.id)
            }
        }
    
    def _process_evaluation_interaction(self, evaluation_data, user):
        """Procesa específicamente interacciones de evaluación"""
        step_id = str(self.instance.current_step.id)
        
        # Ejecutar el nodo de evaluación para calcular el score
        node = EvaluationNode(self.instance.current_step, self.instance.context)
        result = node.execute(evaluation_data, user)
        
        # Actualizar contexto con los resultados
        if result.get('context_updates'):
            self._update_context(result['context_updates'])
        
        # Log de evaluación completada
        evaluation_result = result.get('context_updates', {}).get('evaluations', {})
        self._log('info', f'Evaluación completada en step_{step_id}', 
                 {'evaluation_result': evaluation_result, 'storage_path': f'context.evaluations.{self.instance.current_step.name}'}, user)
        
        # Determinar siguiente paso (puede incluir bifurcación)
        next_step = self._determine_next_step(result)
        
        if next_step:
            self.instance.current_step = next_step
            self.instance.status = 'running'
            self._log('info', f'Avanzando a paso: {next_step.name}', {'step_id': str(next_step.id)}, user)
        else:
            self.instance.status = 'completed'
            self.instance.completed_at = timezone.now()
            self._log('info', 'Flujo completado', {}, user)
        
        self.instance.save()
        
        return {
            'success': True,
            'next_step_id': str(next_step.id) if next_step else None,
            'completed': self.instance.status == 'completed',
            'evaluation_result': evaluation_result
        }
    
    def _process_steps_data_interaction(self, interaction_data, user):
        """Procesa interacciones para flujos con steps_data"""
        steps_data = self.flow.steps_data if hasattr(self.flow, 'steps_data') else []
        current_step_index = self.instance.context.get('current_step_index', 1)
        
        if not isinstance(steps_data, list) or current_step_index >= len(steps_data):
            raise ValueError("No se pudo obtener el paso actual desde steps_data")
        
        current_step_data = steps_data[current_step_index]
        step_type = current_step_data.get('type')
        step_id = current_step_data.get('id')
        
        self._log('info', f'Procesando interacción en paso steps_data[{current_step_index}]: {current_step_data.get("name")}', 
                 {'interaction': interaction_data, 'step_type': step_type}, user)
        
        # Guardar datos en el contexto
        if step_type == 'form':
            if 'forms' not in self.instance.context:
                self.instance.context['forms'] = {}
            
            self.instance.context['forms'][f'step_{step_id}'] = {
                'data': interaction_data,
                'timestamp': timezone.now().isoformat(),
                'user_id': user.id if user and hasattr(user, 'id') else None
            }
        
        elif step_type == 'evaluation':
            # Procesar evaluación usando la configuración de steps_data
            questions = current_step_data.get('config', {}).get('questions', [])
            scoring_ranges = current_step_data.get('config', {}).get('scoring_ranges', [])
            
            total_score = 0
            answers = {}
            
            # Calcular puntaje
            for question in questions:
                question_id = question.get('id')
                weight = question.get('weight', 1)
                question_type = question.get('type', 'single_choice')
                
                if question_type == 'single_choice':
                    selected_option = interaction_data.get(question_id)
                    if selected_option:
                        for option in question.get('options', []):
                            if option.get('id') == selected_option:
                                score = option.get('score', 0) * weight
                                total_score += score
                                answers[question_id] = {
                                    'selected': selected_option,
                                    'score': score
                                }
                                break
            
            # Determinar categoría
            category = 'default'
            for score_range in scoring_ranges:
                min_score = score_range.get('min_score', 0)
                max_score = score_range.get('max_score', float('inf'))
                if min_score <= total_score <= max_score:
                    category = score_range.get('category', 'default')
                    break
            
            evaluation_result = {
                'total_score': total_score,
                'category': category,
                'answers': answers,
                'timestamp': timezone.now().isoformat()
            }
            
            if 'evaluations' not in self.instance.context:
                self.instance.context['evaluations'] = {}
            
            self.instance.context['evaluations'][f'step_{step_id}'] = evaluation_result
        
        # Avanzar al siguiente paso
        next_step_index = current_step_index + 1
        if next_step_index < len(steps_data):
            self.instance.context['current_step_index'] = next_step_index
            self.instance.status = 'running'
            self._log('info', f'Avanzando a paso steps_data[{next_step_index}]', {'next_step_index': next_step_index}, user)
        else:
            self.instance.status = 'completed'
            self.instance.completed_at = timezone.now()
            self._log('info', 'Flujo completado', {}, user)
        
        self.instance.save()
        
        return {
            'success': True,
            'next_step_id': None,
            'completed': self.instance.status == 'completed'
        }
    
    def pause_for_delay(self, resume_at):
        """Pausa la instancia para un delay"""
        self.instance.status = 'paused'
        self.instance.resume_at = resume_at
        self.instance.save()
        
        self._log('info', f'Instancia pausada hasta {resume_at}', {'resume_at': resume_at.isoformat()})
    
    def resume_from_delay(self):
        """Reanuda la instancia después de un delay"""
        if self.instance.status != 'paused':
            return
            
        self.instance.status = 'running'
        self.instance.resume_at = None
        
        # Avanzar al siguiente paso
        transitions = self.instance.current_step.outgoing_transitions.all()
        if transitions:
            next_step = transitions.first().to_step
            self.instance.current_step = next_step
            
        self.instance.save()
        self._log('info', 'Instancia reanudada desde delay')
    
    def _determine_next_step(self, execution_result):
        """Determina el siguiente paso basado en el resultado de ejecución"""
        current_step = self.instance.current_step
        
        # Para evaluaciones con bifurcación
        if execution_result.get('next_step_id'):
            try:
                return Step.objects.get(id=execution_result['next_step_id'])
            except Step.DoesNotExist:
                pass
        
        # Transición por defecto
        transitions = current_step.outgoing_transitions.all()
        
        for transition in transitions:
            if self._evaluate_transition_condition(transition):
                return transition.to_step
                
        return None
    
    def _evaluate_transition_condition(self, transition):
        """Evalúa la condición de una transición de forma segura"""
        if not transition.condition:
            return True
            
        try:
            # Evaluación segura de condiciones simples
            condition = transition.condition
            context = self.instance.context
            
            # Reemplazar variables del contexto
            for key, value in context.get('variables', {}).items():
                pattern = f'\\b{re.escape(key)}\\b'
                condition = re.sub(pattern, str(value), condition)
            
            # Solo permitir operadores seguros
            safe_operators = ['==', '!=', '>', '<', '>=', '<=', 'and', 'or', 'not']
            
            # Evaluación básica (expandir según necesidades)
            if '==' in condition:
                parts = condition.split('==')
                if len(parts) == 2:
                    return parts[0].strip() == parts[1].strip()
            
            return True
            
        except Exception:
            return True
    
    def _update_context(self, updates):
        """Actualiza el contexto de la instancia"""
        for key, value in updates.items():
            if key in ['variables', 'forms', 'evaluations']:
                if key not in self.instance.context:
                    self.instance.context[key] = {}
                self.instance.context[key].update(value)
            else:
                self.instance.context[key] = value
    
    def _log(self, level, message, data=None, user=None):
        """Registra un log de la instancia"""
        # Solo asignar user si es un usuario autenticado
        log_user = user if user and hasattr(user, 'id') and user.is_authenticated else None
        
        InstanceLog.objects.create(
            instance=self.instance,
            step=self.instance.current_step,
            level=level,
            message=message,
            data=data or {},
            user=log_user
        )
    
    def _sanitize_html(self, html):
        """Sanitiza HTML removiendo scripts y atributos peligrosos"""
        if not html:
            return ""
            
        # Remover scripts
        html = re.sub(r'<script[^>]*>.*?</script>', '', html, flags=re.DOTALL | re.IGNORECASE)
        
        # Remover atributos de evento
        html = re.sub(r'\s+on\w+\s*=\s*["\'][^"\']*["\']', '', html, flags=re.IGNORECASE)
        
        # Remover javascript: URLs
        html = re.sub(r'javascript:', '', html, flags=re.IGNORECASE)
        
        return html
    
    def _get_error_html(self, message):
        """Genera HTML de error"""
        return f'''
        <div class="error-container">
            <div class="alert alert-danger">
                <h4>Error</h4>
                <p>{escape(message)}</p>
            </div>
        </div>
        '''


def create_instance_from_legajo(flow, legajo_id, user):
    """Crea una nueva instancia de flujo desde un legajo"""
    # Intentar obtener steps de la tabla Step primero
    steps = flow.flow_steps.all().order_by('order')
    
    if steps.exists() and len(steps) >= 2:
        # Usar formato nuevo (tabla Step)
        current_step = steps[1]  # Segundo paso
        
        # Solo asignar created_by si es un usuario autenticado
        created_by = user if user and hasattr(user, 'id') and user.is_authenticated else None
        if not created_by:
            # Usar el usuario admin por defecto
            from django.contrib.auth.models import User
            created_by = User.objects.filter(is_superuser=True).first()
            if not created_by:
                raise ValueError("No hay usuario disponible para crear la instancia")
        
        instance = InstanciaFlujo.objects.create(
            flow=flow,
            legajo_id=legajo_id,
            current_step=current_step,
            status='running',
            created_by=created_by
        )
        
        # Log inicial
        InstanceLog.objects.create(
            instance=instance,
            step=current_step,
            level='info',
            message=f'Instancia creada, iniciando en paso: {current_step.name}',
            data={'legajo_id': str(legajo_id)},
            user=user
        )
        
        return instance
    
    # Si no hay Steps en la tabla, usar steps_data (formato antiguo)
    steps_data = flow.steps_data if hasattr(flow, 'steps_data') else []
    if isinstance(steps_data, list) and len(steps_data) >= 2:
        # Para flujos con steps_data, crear instancia sin current_step
        # El runtime manejará la navegación usando steps_data
        # Solo asignar created_by si es un usuario autenticado
        created_by = user if user and hasattr(user, 'id') and user.is_authenticated else None
        if not created_by:
            # Usar el usuario admin por defecto
            from django.contrib.auth.models import User
            created_by = User.objects.filter(is_superuser=True).first()
            if not created_by:
                raise ValueError("No hay usuario disponible para crear la instancia")
        
        instance = InstanciaFlujo.objects.create(
            flow=flow,
            legajo_id=legajo_id,
            current_step=None,  # Se manejará con steps_data
            status='running',
            created_by=created_by
        )
        
        # Agregar información del paso actual al contexto
        instance.context['current_step_index'] = 1  # Empezar en el segundo paso
        instance.save()
        
        # Log inicial
        InstanceLog.objects.create(
            instance=instance,
            step=None,
            level='info',
            message=f'Instancia creada para flujo con steps_data, iniciando en paso índice 1',
            data={'legajo_id': str(legajo_id), 'steps_count': len(steps_data)},
            user=user
        )
        
        return instance
    
    raise ValueError("El flujo debe tener al menos 2 pasos configurados")
