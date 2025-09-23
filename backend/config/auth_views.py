from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login
from django.contrib import messages
from django.views.decorators.csrf import csrf_protect
from django.views.decorators.cache import never_cache

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