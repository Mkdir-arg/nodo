from django.contrib import admin
from .models import Flow, FlowExecution
from .flow_runner import FlowInstance


@admin.register(Flow)
class FlowAdmin(admin.ModelAdmin):
    list_display = ['name', 'slug', 'status', 'created_by', 'is_active', 'created_at']
    list_filter = ['status', 'is_active', 'created_at', 'created_by']
    search_fields = ['name', 'description', 'slug']
    readonly_fields = ['created_at', 'updated_at']
    prepopulated_fields = {'slug': ('name',)}


@admin.register(FlowExecution)
class FlowExecutionAdmin(admin.ModelAdmin):
    list_display = ['flow', 'status', 'created_by', 'started_at', 'completed_at']
    list_filter = ['status', 'started_at', 'flow']
    search_fields = ['flow__name']
    readonly_fields = ['started_at', 'completed_at']


@admin.register(FlowInstance)
class FlowInstanceAdmin(admin.ModelAdmin):
    list_display = ['flow', 'legajo_id', 'plantilla_id', 'status', 'started_at', 'completed_at']
    list_filter = ['status', 'started_at', 'flow']
    search_fields = ['legajo_id', 'plantilla_id', 'flow__name']
    readonly_fields = ['started_at', 'completed_at']