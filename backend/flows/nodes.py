import json
import requests
from datetime import datetime, timedelta
from django.utils import timezone
from django.utils.html import escape
from django.core.mail import send_mail
from django.core.validators import validate_email
from django.core.exceptions import ValidationError


class BaseNode:
    """Clase base para todos los nodos"""
    
    def __init__(self, step, context):
        self.step = step
        self.context = context
        self.config = step.config
    
    def render_html(self):
        """Renderiza el HTML del nodo"""
        raise NotImplementedError
    
    def execute(self, interaction_data, user):
        """Ejecuta la lógica del nodo"""
        raise NotImplementedError
    
    def validate_input(self, data):
        """Valida los datos de entrada"""
        return True


class StartNode(BaseNode):
    """Nodo de inicio que muestra legajos disponibles"""
    
    def render_html(self):
        title = self.config.get('title', 'Iniciar Proceso')
        description = self.config.get('description', '')
        
        return f'''
        <div class="start-node" style="border: 2px solid #10b981; border-radius: 8px; padding: 20px; margin: 16px 0;">
            <div class="start-header">
                <h2 class="text-xl font-bold text-green-700 mb-2">{escape(title)}</h2>
                {f'<p class="text-gray-600 mb-4">{escape(description)}</p>' if description else ''}
            </div>
            
            <div class="legajo-selector">
                <div class="mb-4">
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                        Seleccionar Legajo:
                    </label>
                    <select name="legajo_id" class="w-full p-2 border border-gray-300 rounded-md" required>
                        <option value="">-- Seleccione un legajo --</option>
                        <!-- Los legajos se cargarán dinámicamente -->
                    </select>
                </div>
                
                <button type="submit" class="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
                    Comenzar Proceso
                </button>
            </div>
        </div>
        '''
    
    def execute(self, interaction_data, user):
        legajo_id = interaction_data.get('legajo_id')
        if not legajo_id:
            raise ValueError("Debe seleccionar un legajo")
        
        return {
            'context_updates': {
                'variables': {'legajo_id': legajo_id}
            }
        }


class FormNode(BaseNode):
    """Nodo de formulario para captura de datos"""
    
    def render_html(self):
        title = self.config.get('title', 'Formulario')
        description = self.config.get('description', '')
        fields = self.config.get('fields', [])
        
        html = f'''
        <div class="form-node">
            <div class="form-header mb-6">
                <h2 class="text-xl font-bold text-gray-800 mb-2">{escape(title)}</h2>
                {f'<p class="text-gray-600">{escape(description)}</p>' if description else ''}
            </div>
            
            <form class="space-y-4">
        '''
        
        for field in fields:
            html += self._render_field(field)
        
        html += '''
                <div class="form-actions mt-6">
                    <button type="submit" class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                        Continuar
                    </button>
                </div>
            </form>
        </div>
        '''
        
        return html
    
    def _render_field(self, field):
        field_type = field.get('type', 'text')
        name = field.get('name', '')
        label = field.get('label', '')
        required = field.get('required', False)
        placeholder = field.get('placeholder', '')
        help_text = field.get('help_text', '')
        
        # Obtener valor previo del contexto
        form_data = self.context.get('forms', {})
        value = form_data.get(name, '')
        
        html = f'''
        <div class="field-group">
            <label class="block text-sm font-medium text-gray-700 mb-1">
                {escape(label)}
                {' <span class="text-red-500">*</span>' if required else ''}
            </label>
        '''
        
        if field_type == 'text':
            html += f'''
            <input type="text" name="{escape(name)}" value="{escape(str(value))}" 
                   placeholder="{escape(placeholder)}" 
                   class="w-full p-2 border border-gray-300 rounded-md"
                   {'required' if required else ''}>
            '''
        elif field_type == 'email':
            html += f'''
            <input type="email" name="{escape(name)}" value="{escape(str(value))}" 
                   placeholder="{escape(placeholder)}" 
                   class="w-full p-2 border border-gray-300 rounded-md"
                   {'required' if required else ''}>
            '''
        elif field_type == 'textarea':
            html += f'''
            <textarea name="{escape(name)}" placeholder="{escape(placeholder)}" 
                      class="w-full p-2 border border-gray-300 rounded-md h-24"
                      {'required' if required else ''}>{escape(str(value))}</textarea>
            '''
        elif field_type == 'select':
            options = field.get('options', [])
            html += f'<select name="{escape(name)}" class="w-full p-2 border border-gray-300 rounded-md" {"required" if required else ""}>'
            html += '<option value="">-- Seleccione --</option>'
            for option in options:
                selected = 'selected' if str(option.get('value', '')) == str(value) else ''
                html += f'<option value="{escape(str(option.get("value", "")))}" {selected}>{escape(option.get("label", ""))}</option>'
            html += '</select>'
        
        if help_text:
            html += f'<p class="text-sm text-gray-500 mt-1">{escape(help_text)}</p>'
        
        html += '</div>'
        return html
    
    def execute(self, interaction_data, user):
        fields = self.config.get('fields', [])
        form_data = {}
        errors = []
        
        # Validar campos
        for field in fields:
            name = field.get('name')
            value = interaction_data.get(name, '')
            required = field.get('required', False)
            field_type = field.get('type', 'text')
            
            if required and not value:
                errors.append(f"El campo '{field.get('label', name)}' es obligatorio")
                continue
            
            if value and field_type == 'email':
                try:
                    validate_email(value)
                except ValidationError:
                    errors.append(f"El campo '{field.get('label', name)}' debe ser un email válido")
                    continue
            
            form_data[name] = value
        
        if errors:
            raise ValueError('; '.join(errors))
        
        return {
            'context_updates': {
                'forms': {self.step.name: form_data}
            }
        }


class EvaluationNode(BaseNode):
    """Nodo de evaluación con preguntas y scoring"""
    
    def render_html(self):
        title = self.config.get('title', 'Evaluación')
        description = self.config.get('description', '')
        questions = self.config.get('questions', [])
        
        html = f'''
        <div class="evaluation-node">
            <div class="evaluation-header mb-6">
                <h2 class="text-xl font-bold text-gray-800 mb-2">{escape(title)}</h2>
                {f'<p class="text-gray-600">{escape(description)}</p>' if description else ''}
            </div>
            
            <form class="space-y-6">
        '''
        
        for i, question in enumerate(questions):
            html += self._render_question(question, i)
        
        html += '''
                <div class="form-actions mt-6">
                    <button type="submit" class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                        Calcular y Continuar
                    </button>
                </div>
            </form>
        </div>
        '''
        
        return html
    
    def _render_question(self, question, index):
        question_id = question.get('id', f'q_{index}')
        text = question.get('text', '')
        question_type = question.get('type', 'single_choice')
        options = question.get('options', [])
        
        html = f'''
        <div class="question-group border border-gray-200 rounded-lg p-4">
            <h3 class="font-medium text-gray-800 mb-3">{escape(text)}</h3>
        '''
        
        if question_type == 'single_choice':
            for option in options:
                option_id = option.get('id', '')
                option_text = option.get('text', '')
                html += f'''
                <div class="mb-2">
                    <label class="flex items-center">
                        <input type="radio" name="{escape(question_id)}" value="{escape(option_id)}" 
                               class="mr-2" required>
                        <span>{escape(option_text)}</span>
                    </label>
                </div>
                '''
        elif question_type == 'multiple_choice':
            for option in options:
                option_id = option.get('id', '')
                option_text = option.get('text', '')
                html += f'''
                <div class="mb-2">
                    <label class="flex items-center">
                        <input type="checkbox" name="{escape(question_id)}" value="{escape(option_id)}" 
                               class="mr-2">
                        <span>{escape(option_text)}</span>
                    </label>
                </div>
                '''
        
        html += '</div>'
        return html
    
    def execute(self, interaction_data, user):
        questions = self.config.get('questions', [])
        scoring_ranges = self.config.get('scoring_ranges', [])
        
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
                    # Buscar el score de la opción seleccionada
                    for option in question.get('options', []):
                        if option.get('id') == selected_option:
                            score = option.get('score', 0) * weight
                            total_score += score
                            answers[question_id] = {
                                'selected': selected_option,
                                'score': score
                            }
                            break
            elif question_type == 'multiple_choice':
                selected_options = interaction_data.getlist(question_id)
                question_score = 0
                for option in question.get('options', []):
                    if option.get('id') in selected_options:
                        question_score += option.get('score', 0)
                
                total_score += question_score * weight
                answers[question_id] = {
                    'selected': selected_options,
                    'score': question_score * weight
                }
        
        # Determinar categoría y siguiente paso
        next_step_id = None
        category = 'default'
        
        for score_range in scoring_ranges:
            min_score = score_range.get('min_score', 0)
            max_score = score_range.get('max_score', float('inf'))
            
            if min_score <= total_score <= max_score:
                category = score_range.get('category', 'default')
                next_step_id = score_range.get('next_step_id')
                break
        
        evaluation_result = {
            'total_score': total_score,
            'category': category,
            'answers': answers,
            'timestamp': timezone.now().isoformat()
        }
        
        result = {
            'context_updates': {
                'evaluations': {self.step.name: evaluation_result}
            }
        }
        
        if next_step_id:
            result['next_step_id'] = next_step_id
        
        return result


class EmailNode(BaseNode):
    """Nodo para envío de emails"""
    
    def render_html(self):
        return '''
        <div class="email-node">
            <div class="text-center py-8">
                <div class="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                    <svg class="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                    </svg>
                </div>
                <h3 class="text-lg font-medium text-gray-900 mb-2">Enviando Email</h3>
                <p class="text-gray-600 mb-4">Se está procesando el envío del email...</p>
                <button type="submit" class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                    Continuar
                </button>
            </div>
        </div>
        '''
    
    def execute(self, interaction_data, user):
        to_email = self.config.get('to')
        subject = self.config.get('subject', '')
        body = self.config.get('body', '')
        
        if not to_email:
            raise ValueError("Email de destino requerido")
        
        try:
            validate_email(to_email)
            send_mail(
                subject=subject,
                message=body,
                from_email='noreply@example.com',
                recipient_list=[to_email],
                fail_silently=False
            )
            
            return {
                'context_updates': {
                    'variables': {
                        'last_email_sent': {
                            'to': to_email,
                            'subject': subject,
                            'timestamp': timezone.now().isoformat()
                        }
                    }
                }
            }
        except Exception as e:
            raise ValueError(f"Error enviando email: {str(e)}")


class HttpNode(BaseNode):
    """Nodo para llamadas HTTP"""
    
    def render_html(self):
        return '''
        <div class="http-node">
            <div class="text-center py-8">
                <div class="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                    <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"></path>
                    </svg>
                </div>
                <h3 class="text-lg font-medium text-gray-900 mb-2">Ejecutando Llamada HTTP</h3>
                <p class="text-gray-600 mb-4">Se está procesando la llamada a la API...</p>
                <button type="submit" class="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
                    Continuar
                </button>
            </div>
        </div>
        '''
    
    def execute(self, interaction_data, user):
        method = self.config.get('method', 'GET').upper()
        url = self.config.get('url')
        headers = self.config.get('headers', {})
        body = self.config.get('body')
        
        if not url:
            raise ValueError("URL requerida")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=30)
            elif method == 'POST':
                response = requests.post(url, json=body, headers=headers, timeout=30)
            else:
                raise ValueError(f"Método HTTP no soportado: {method}")
            
            response.raise_for_status()
            
            return {
                'context_updates': {
                    'variables': {
                        'last_http_response': {
                            'status_code': response.status_code,
                            'response': response.text[:1000],
                            'timestamp': timezone.now().isoformat()
                        }
                    }
                }
            }
        except Exception as e:
            raise ValueError(f"Error en llamada HTTP: {str(e)}")


class DelayNode(BaseNode):
    """Nodo para delays/pausas"""
    
    def render_html(self):
        duration = self.config.get('duration', 1)
        unit = self.config.get('unit', 'minutes')
        
        return f'''
        <div class="delay-node">
            <div class="text-center py-8">
                <div class="inline-flex items-center justify-center w-16 h-16 bg-yellow-100 rounded-full mb-4">
                    <svg class="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                </div>
                <h3 class="text-lg font-medium text-gray-900 mb-2">Pausa Programada</h3>
                <p class="text-gray-600 mb-4">El proceso se pausará por {duration} {unit}</p>
                <button type="submit" class="bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded">
                    Confirmar Pausa
                </button>
            </div>
        </div>
        '''
    
    def execute(self, interaction_data, user):
        duration = self.config.get('duration', 1)
        unit = self.config.get('unit', 'minutes')
        
        # Calcular tiempo de reanudación
        if unit == 'seconds':
            delta = timedelta(seconds=duration)
        elif unit == 'minutes':
            delta = timedelta(minutes=duration)
        elif unit == 'hours':
            delta = timedelta(hours=duration)
        else:
            delta = timedelta(minutes=duration)
        
        resume_at = timezone.now() + delta
        
        return {
            'pause_until': resume_at,
            'context_updates': {
                'variables': {
                    'last_delay': {
                        'duration': duration,
                        'unit': unit,
                        'resume_at': resume_at.isoformat()
                    }
                }
            }
        }


class ConditionNode(BaseNode):
    """Nodo para condiciones/bifurcaciones"""
    
    def render_html(self):
        return '''
        <div class="condition-node">
            <div class="text-center py-8">
                <div class="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
                    <svg class="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                </div>
                <h3 class="text-lg font-medium text-gray-900 mb-2">Evaluando Condición</h3>
                <p class="text-gray-600 mb-4">Se está evaluando la condición para determinar el siguiente paso...</p>
                <button type="submit" class="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded">
                    Evaluar
                </button>
            </div>
        </div>
        '''
    
    def execute(self, interaction_data, user):
        # La lógica de evaluación se maneja en el runtime
        return {}


class DatabaseNode(BaseNode):
    """Nodo para operaciones de base de datos"""
    
    def render_html(self):
        return '''
        <div class="database-node">
            <div class="text-center py-8">
                <div class="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-full mb-4">
                    <svg class="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4"></path>
                    </svg>
                </div>
                <h3 class="text-lg font-medium text-gray-900 mb-2">Operación de Base de Datos</h3>
                <p class="text-gray-600 mb-4">Ejecutando operación en la base de datos...</p>
                <button type="submit" class="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded">
                    Continuar
                </button>
            </div>
        </div>
        '''
    
    def execute(self, interaction_data, user):
        # Implementar operaciones seguras de BD
        return {
            'context_updates': {
                'variables': {
                    'last_db_operation': {
                        'timestamp': timezone.now().isoformat(),
                        'status': 'completed'
                    }
                }
            }
        }


class TransformNode(BaseNode):
    """Nodo para transformaciones de datos"""
    
    def render_html(self):
        return '''
        <div class="transform-node">
            <div class="text-center py-8">
                <div class="inline-flex items-center justify-center w-16 h-16 bg-teal-100 rounded-full mb-4">
                    <svg class="w-8 h-8 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                    </svg>
                </div>
                <h3 class="text-lg font-medium text-gray-900 mb-2">Transformando Datos</h3>
                <p class="text-gray-600 mb-4">Aplicando transformaciones a los datos...</p>
                <button type="submit" class="bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 px-4 rounded">
                    Continuar
                </button>
            </div>
        </div>
        '''
    
    def execute(self, interaction_data, user):
        input_var = self.config.get('input')
        transformation = self.config.get('transformation')
        output_var = self.config.get('output')
        
        # Obtener valor del contexto
        input_value = self.context.get('variables', {}).get(input_var, '')
        
        # Aplicar transformación
        if transformation == 'toUpperCase()':
            result = str(input_value).upper()
        elif transformation == 'toLowerCase()':
            result = str(input_value).lower()
        else:
            result = input_value
        
        return {
            'context_updates': {
                'variables': {output_var: result}
            }
        }