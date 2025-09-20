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
        if not self.instance.current_step:
            return self._get_error_html("No hay paso actual definido")
            
        node_class = self.NODE_CLASSES.get(self.instance.current_step.step_type)
        if not node_class:
            return self._get_error_html(f"Tipo de nodo no soportado: {self.instance.current_step.step_type}")
        
        node = node_class(self.instance.current_step, self.instance.context)
        html = node.render_html()
        
        # Sanitizar HTML
        return self._sanitize_html(html)
    
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
            self._log('info', f'Procesando interacción en paso {self.instance.current_step.name}', 
                     {'interaction': interaction_data}, user)
            
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
        InstanceLog.objects.create(
            instance=self.instance,
            step=self.instance.current_step,
            level=level,
            message=message,
            data=data or {},
            user=user
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
    # Obtener el primer paso (start)
    start_step = flow.flow_steps.filter(step_type='start').first()
    if not start_step:
        raise ValueError("El flujo no tiene un paso de inicio")
    
    instance = InstanciaFlujo.objects.create(
        flow=flow,
        legajo_id=legajo_id,
        current_step=start_step,
        status='pending',
        created_by=user
    )
    
    # Log inicial
    InstanceLog.objects.create(
        instance=instance,
        step=start_step,
        level='info',
        message='Instancia creada',
        data={'legajo_id': str(legajo_id)},
        user=user
    )
    
    return instance