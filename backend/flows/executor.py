import time
import json
import logging
import requests
from django.core.mail import send_mail
from django.db import connection
from django.utils import timezone
from .models import EjecucionFlujo

logger = logging.getLogger(__name__)

class FlowExecutor:
    def __init__(self, execution):
        # Handle both EjecucionFlujo and InstanciaFlujo
        self.execution = execution
        if hasattr(execution, 'flow'):
            self.flow = execution.flow
        else:
            # Fallback for compatibility
            self.flow = execution
        self.context = getattr(execution, 'context_json', {}) or {}  # Store variables between steps
        
    def execute(self):
        """Execute the flow steps sequentially"""
        try:
            self.execution.status = 'running'
            self.execution.save()
            
            current_step_id = None
            steps_dict = {step['id']: step for step in self.flow.steps}
            
            # Find first step (no incoming connections)
            first_step = next((step for step in self.flow.steps 
                             if not any(s.get('nextStepId') == step['id'] for s in self.flow.steps)), 
                            self.flow.steps[0] if self.flow.steps else None)
            
            if first_step:
                current_step_id = first_step['id']
            
            # Execute steps in sequence
            while current_step_id and current_step_id in steps_dict:
                step = steps_dict[current_step_id]
                result = self._execute_step(step)
                
                # Handle conditional branching
                if step.get('type') == 'condition' and isinstance(result, dict):
                    current_step_id = result.get('next_step_id')
                else:
                    current_step_id = step.get('nextStepId')
                
            self.execution.status = 'completed'
            self.execution.execution_data = self.context
            self.execution.save()
            
        except Exception as e:
            self.execution.status = 'failed'
            self.execution.error_message = str(e)
            self.execution.execution_data = self.context
            self.execution.save()
            raise
            
    def _execute_step(self, step):
        """Execute individual step based on type"""
        step_type = step.get('type')
        config = step.get('config', {})
        
        logger.info(f"Executing step: {step.get('name')} ({step_type})")
        
        if step_type == 'email':
            return self._execute_email(config)
        elif step_type == 'http':
            return self._execute_http(config)
        elif step_type == 'delay':
            return self._execute_delay(config)
        elif step_type == 'condition':
            return self._execute_condition(config)
        elif step_type == 'database':
            return self._execute_database(config)
        elif step_type == 'transform':
            return self._execute_transform(config)
        else:
            raise ValueError(f"Unknown step type: {step_type}")
            
    def _execute_email(self, config):
        # Validate required fields
        to_email = config.get('to')
        if not to_email:
            raise ValueError("Email recipient is required")
            
        subject = config.get('subject', '')
        body = config.get('body', '')
        
        # Basic email validation
        import re
        email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        if not re.match(email_pattern, to_email):
            raise ValueError("Invalid email address")
            
        try:
            send_mail(
                subject=subject,
                message=body,
                from_email='noreply@example.com',
                recipient_list=[to_email],
                fail_silently=False
            )
            return {'status': 'sent', 'to': to_email}
        except Exception as e:
            raise ValueError(f"Email sending failed: {str(e)}")
        
    def _execute_http(self, config):
        method = config.get('method', 'GET').upper()
        url = config.get('url')
        headers = config.get('headers', {})
        
        # URL validation to prevent SSRF
        if not url:
            raise ValueError("URL is required")
            
        # Basic URL validation
        from urllib.parse import urlparse
        parsed = urlparse(url)
        
        # Only allow http/https
        if parsed.scheme not in ['http', 'https']:
            raise ValueError("Only HTTP/HTTPS URLs are allowed")
            
        # Block internal/private networks (basic protection)
        if parsed.hostname in ['localhost', '127.0.0.1'] or parsed.hostname.startswith('192.168.') or parsed.hostname.startswith('10.'):
            raise ValueError("Requests to internal networks are not allowed")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=30)
            elif method == 'POST':
                body = config.get('body')
                if isinstance(body, str):
                    try:
                        body = json.loads(body)
                    except json.JSONDecodeError:
                        pass
                response = requests.post(url, json=body, headers=headers, timeout=30)
            elif method == 'PUT':
                body = config.get('body')
                if isinstance(body, str):
                    try:
                        body = json.loads(body)
                    except json.JSONDecodeError:
                        pass
                response = requests.put(url, json=body, headers=headers, timeout=30)
            else:
                raise ValueError(f"Unsupported HTTP method: {method}")
                
            response.raise_for_status()
            return {'status_code': response.status_code, 'response': response.text[:1000]}
            
        except requests.RequestException as e:
            raise ValueError(f"HTTP request failed: {str(e)}")
            
    def _execute_delay(self, config):
        duration = config.get('duration', 1)
        unit = config.get('unit', 'seconds')
        
        if unit == 'minutes':
            duration *= 60
        elif unit == 'hours':
            duration *= 3600
            
        time.sleep(duration)
        return {'delayed': f"{config.get('duration')} {unit}"}
        return {'delayed': f"{config.get('duration')} {unit}"}
        
    def _execute_condition(self, config):
        condition = config.get('condition', 'True')
        true_step_id = config.get('trueStepId')
        false_step_id = config.get('falseStepId')
        
        # Safe condition evaluation using simple comparisons
        try:
            # Only allow simple comparisons for security
            allowed_operators = ['==', '!=', '>', '<', '>=', '<=']
            
            # Basic validation - only allow simple variable comparisons
            if any(op in condition for op in allowed_operators):
                # Replace context variables safely
                safe_condition = condition
                for key, value in self.context.items():
                    if key in safe_condition:
                        safe_condition = safe_condition.replace(key, str(value))
                
                # Simple evaluation for basic comparisons only
                if '==' in safe_condition:
                    parts = safe_condition.split('==')
                    result = parts[0].strip() == parts[1].strip()
                elif '>' in safe_condition and '>=' not in safe_condition:
                    parts = safe_condition.split('>')
                    try:
                        result = float(parts[0].strip()) > float(parts[1].strip())
                    except ValueError:
                        result = False
                else:
                    result = True  # Default to true for unsupported conditions
            else:
                result = True
                
            next_step_id = true_step_id if result else false_step_id
            return {'condition_result': result, 'next_step_id': next_step_id}
            
        except Exception as e:
            raise ValueError(f"Condition evaluation failed: {str(e)}")
            
    def _execute_database(self, config):
        # Simple database operations (extend as needed)
        table = config.get('table')
        operation = config.get('operation')
        data = config.get('data', {})
        
        # This is a simplified example - implement proper ORM operations
        return {'operation': operation, 'table': table, 'affected_rows': 1}
        
    def _execute_transform(self, config):
        input_var = config.get('input')
        transformation = config.get('transformation')
        output_var = config.get('output')
        
        # Get input value from context
        input_value = self.context.get(input_var, '')
        
        # Apply transformation (simplified)
        if transformation == 'toUpperCase()':
            result = str(input_value).upper()
        elif transformation == 'toLowerCase()':
            result = str(input_value).lower()
        else:
            result = input_value
            
        # Store result in context
        self.context[output_var] = result
        
        return {'transformed': f"{input_var} -> {output_var}", 'result': result}