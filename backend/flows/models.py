from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
import json
import uuid


def default_execution_data():
    return {}


def default_steps_data():
    return []


def default_context():
    return {'variables': {}, 'forms': {}, 'evaluations': {}}


class Flujo(models.Model):
    STATUS_CHOICES = [
        ('draft', 'Borrador'),
        ('published', 'Publicado'),
        ('archived', 'Archivado'),
    ]
    
    name = models.CharField(max_length=255)
    slug = models.SlugField(unique=True, blank=True)
    description = models.TextField(blank=True, null=True)
    steps_data = models.JSONField(default=default_steps_data)  # Store graph_json
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='flows')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)
    
    def save(self, *args, **kwargs):
        if not self.slug:
            from django.utils.text import slugify
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    class Meta:
        ordering = ['-updated_at']

    def __str__(self):
        return self.name

    @property
    def steps(self):
        """Return steps as list of dictionaries"""
        if isinstance(self.steps_data, dict):
            return self.steps_data.get('steps', [])
        return self.steps_data if isinstance(self.steps_data, list) else []

    @steps.setter
    def steps(self, value):
        """Set steps from list of dictionaries"""
        if isinstance(self.steps_data, dict):
            self.steps_data['steps'] = value if isinstance(value, list) else []
        else:
            self.steps_data = value if isinstance(value, list) else []
            
    def get_start_node_config(self):
        """Extract StartNode config from steps_data"""
        try:
            # steps_data should be a list of steps
            steps = self.steps_data if isinstance(self.steps_data, list) else []
            
            # Look for start step
            for step in steps:
                if step.get('type') == 'start':
                    return step.get('config', {})
                    
            return {}
        except (AttributeError, TypeError):
            return {}


class EjecucionFlujo(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pendiente'),
        ('running', 'Ejecutando'),
        ('completed', 'Completado'),
        ('failed', 'Fallido'),
        ('cancelled', 'Cancelado'),
    ]

    flow = models.ForeignKey(Flujo, on_delete=models.CASCADE, related_name='executions')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    started_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    error_message = models.TextField(blank=True, null=True)
    execution_data = models.JSONField(default=default_execution_data)  # Store execution context/variables
    created_by = models.ForeignKey(User, on_delete=models.CASCADE)

    class Meta:
        ordering = ['-started_at']

    def __str__(self):
        return f"{self.flow.name} - {self.status}"


class Step(models.Model):
    STEP_TYPES = [
        ('start', 'Start'),
        ('form', 'Form'),
        ('evaluation', 'Evaluation'),
        ('email', 'Email'),
        ('http', 'HTTP'),
        ('delay', 'Delay'),
        ('condition', 'Condition'),
        ('database', 'Database'),
        ('transform', 'Transform'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    flow = models.ForeignKey(Flujo, on_delete=models.CASCADE, related_name='flow_steps')
    step_type = models.CharField(max_length=20, choices=STEP_TYPES)
    name = models.CharField(max_length=255)
    config = models.JSONField(default=dict)
    ui_metadata = models.JSONField(default=dict)
    order = models.PositiveIntegerField(default=0)
    
    class Meta:
        ordering = ['order']
        
    def __str__(self):
        return f"{self.flow.name} - {self.name}"


class Transition(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    from_step = models.ForeignKey(Step, on_delete=models.CASCADE, related_name='outgoing_transitions')
    to_step = models.ForeignKey(Step, on_delete=models.CASCADE, related_name='incoming_transitions')
    label = models.CharField(max_length=255, blank=True)
    condition = models.TextField(blank=True)
    
    def __str__(self):
        return f"{self.from_step.name} -> {self.to_step.name}"


class InstanciaFlujo(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pendiente'),
        ('running', 'Ejecutando'),
        ('paused', 'Pausada'),
        ('completed', 'Completado'),
        ('failed', 'Fallido'),
        ('cancelled', 'Cancelado'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    flow = models.ForeignKey(Flujo, on_delete=models.CASCADE, related_name='instances')
    legajo_id = models.UUIDField()
    current_step = models.ForeignKey(Step, on_delete=models.SET_NULL, null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    context = models.JSONField(default=default_context)
    resume_at = models.DateTimeField(null=True, blank=True)
    error_message = models.TextField(blank=True, null=True)
    started_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE)

    class Meta:
        ordering = ['-started_at']

    def __str__(self):
        return f"{self.flow.name} - {self.legajo_id} - {self.status}"


class InstanceLog(models.Model):
    LEVEL_CHOICES = [
        ('info', 'Info'),
        ('warning', 'Warning'),
        ('error', 'Error'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    instance = models.ForeignKey(InstanciaFlujo, on_delete=models.CASCADE, related_name='logs')
    step = models.ForeignKey(Step, on_delete=models.SET_NULL, null=True, blank=True)
    level = models.CharField(max_length=10, choices=LEVEL_CHOICES, default='info')
    message = models.TextField()
    data = models.JSONField(default=dict)
    timestamp = models.DateTimeField(auto_now_add=True)
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    
    class Meta:
        ordering = ['-timestamp']
        
    def __str__(self):
        return f"{self.instance} - {self.level} - {self.message[:50]}"