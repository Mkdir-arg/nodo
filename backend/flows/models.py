from django.db import models
from django.contrib.auth.models import User
import json


def default_execution_data():
    return {}


def default_steps_data():
    return []


class Flow(models.Model):
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
        """Extract StartNode config from graph_json"""
        try:
            # Handle both formats: {steps: [...]} and [...]
            if isinstance(self.steps_data, dict):
                steps = self.steps_data.get('steps', [])
                nodes = self.steps_data.get('nodes', [])
            else:
                steps = self.steps_data
                nodes = []
            
            # Look in steps first
            for step in steps:
                if step.get('type') == 'start':
                    return step.get('config', {})
            
            # Look in nodes (React Flow format)
            for node in nodes:
                if node.get('type') == 'start':
                    return node.get('data', {}).get('config', {})
                    
            return {}
        except (AttributeError, TypeError):
            return {}


class FlowExecution(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pendiente'),
        ('running', 'Ejecutando'),
        ('completed', 'Completado'),
        ('failed', 'Fallido'),
        ('cancelled', 'Cancelado'),
    ]

    flow = models.ForeignKey(Flow, on_delete=models.CASCADE, related_name='executions')
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


class FlowInstance(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pendiente'),
        ('running', 'Ejecutando'),
        ('completed', 'Completado'),
        ('failed', 'Fallido'),
        ('cancelled', 'Cancelado'),
    ]

    flow = models.ForeignKey(Flow, on_delete=models.CASCADE, related_name='instances')
    legajo_id = models.CharField(max_length=255)
    plantilla_id = models.CharField(max_length=255)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    context_json = models.JSONField(default=default_execution_data)
    result_json = models.JSONField(default=default_execution_data)
    error_message = models.TextField(blank=True, null=True)
    started_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE)

    class Meta:
        ordering = ['-started_at']

    def __str__(self):
        return f"{self.flow.name} - {self.legajo_id} - {self.status}"