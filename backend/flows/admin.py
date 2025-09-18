from django.contrib import admin
from .models import Flujo, EjecucionFlujo, InstanciaFlujo


@admin.register(Flujo)
class FlujoAdmin(admin.ModelAdmin):
    list_display = ['name', 'slug', 'status', 'created_by', 'is_active', 'created_at']
    list_filter = ['status', 'is_active', 'created_at', 'created_by']
    search_fields = ['name', 'description', 'slug']
    readonly_fields = ['created_at', 'updated_at']
    prepopulated_fields = {'slug': ('name',)}


@admin.register(EjecucionFlujo)
class EjecucionFlujoAdmin(admin.ModelAdmin):
    list_display = ['flow', 'status', 'created_by', 'started_at', 'completed_at']
    list_filter = ['status', 'started_at', 'flow']
    search_fields = ['flow__name']
    readonly_fields = ['started_at', 'completed_at']


@admin.register(InstanciaFlujo)
class InstanciaFlujoAdmin(admin.ModelAdmin):
    list_display = ['flow', 'legajo_id', 'plantilla_id', 'status', 'started_at', 'completed_at']
    list_filter = ['status', 'started_at', 'flow']
    search_fields = ['legajo_id', 'plantilla_id', 'flow__name']
    readonly_fields = ['started_at', 'completed_at']