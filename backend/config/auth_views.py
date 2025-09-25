import os
from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login
from django.contrib import messages
from django.views.decorators.csrf import csrf_protect
from django.views.decorators.cache import never_cache
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods

@csrf_protect
@never_cache
def login_view(request):
    if request.method == 'POST':
        email = request.POST.get('email')
        password = request.POST.get('password')
        remember = request.POST.get('remember')
        
        if email and password:
            user = authenticate(request, username=email, password=password)
            if user is not None:
                login(request, user)
                if not remember:
                    request.session.set_expiry(0)
                return redirect('/api/')
            else:
                messages.error(request, 'Credenciales inválidas. Verifica tu correo y contraseña.')
        else:
            messages.error(request, 'Por favor completa todos los campos obligatorios.')
    
    return render(request, 'auth/login.html')


@require_http_methods(["GET"])
def get_security_config(request):
    """Endpoint para obtener configuración de seguridad"""
    from .models import SystemSettings
    import json
    
    try:
        setting = SystemSettings.objects.get(key='inactivityTimeoutMinutes')
        timeout_minutes = int(json.loads(setting.value) if setting.value.startswith('"') else setting.value)
    except (SystemSettings.DoesNotExist, ValueError, json.JSONDecodeError):
        timeout_minutes = int(os.getenv('INACTIVITY_TIMEOUT_MINUTES', 30))
    
    return JsonResponse({
        'inactivity_timeout_minutes': timeout_minutes
    })