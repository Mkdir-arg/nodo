# Módulo de Usuarios

## Descripción General

El módulo `users` gestiona la autenticación, autorización y administración de usuarios del sistema. Utiliza el sistema de usuarios integrado de Django con extensiones personalizadas para JWT y gestión de permisos.

## Estructura del Módulo

```
backend/users/
├── management/
│   └── commands/
│       ├── check_superusers.py      # Verificar superusuarios
│       ├── create_superuser.py      # Crear superusuario
│       └── ensure_superuser.py      # Asegurar superusuario
├── __init__.py
├── apps.py                          # Configuración de la app
├── serializers.py                   # Serializers DRF
├── urls.py                          # URLs del módulo
└── views.py                         # Vistas de usuarios
```

## Modelo de Usuario

### Usuario Base (Django User)
El sistema utiliza el modelo de usuario estándar de Django con las siguientes características:

```python
# Django User Model (extendido)
class User(AbstractUser):
    username = models.CharField(max_length=150, unique=True)
    email = models.EmailField(unique=True)
    first_name = models.CharField(max_length=150)
    last_name = models.CharField(max_length=150)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    is_superuser = models.BooleanField(default=False)
    date_joined = models.DateTimeField(auto_now_add=True)
    last_login = models.DateTimeField(null=True, blank=True)
```

### Campos Principales

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `username` | CharField | Nombre de usuario único |
| `email` | EmailField | Email único |
| `first_name` | CharField | Nombre |
| `last_name` | CharField | Apellido |
| `is_active` | BooleanField | Usuario activo |
| `is_staff` | BooleanField | Acceso al admin |
| `is_superuser` | BooleanField | Permisos de superusuario |
| `date_joined` | DateTimeField | Fecha de registro |
| `last_login` | DateTimeField | Último login |

## Sistema de Autenticación

### 1. Autenticación JWT

#### Configuración JWT
```python
# En settings.py
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=30),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
}
```

#### Endpoints de Autenticación
```python
# En config/urls.py
urlpatterns = [
    path('api/token/', TokenObtainPairView.as_view()),           # Login
    path('api/token/refresh/', TokenRefreshView.as_view()),     # Refresh
    path('api/auth/', include('config.auth_views')),            # Auth views
]
```

### 2. Vistas de Autenticación

#### LoginView
```python
class LoginView(TokenObtainPairView):
    """Vista personalizada de login"""
    def post(self, request, *args, **kwargs):
        # Validar credenciales
        # Generar tokens JWT
        # Registrar último login
        # Retornar tokens y datos del usuario
```

#### RefreshView
```python
class RefreshView(TokenRefreshView):
    """Vista personalizada de refresh"""
    def post(self, request, *args, **kwargs):
        # Validar refresh token
        # Generar nuevo access token
        # Actualizar actividad del usuario
```

#### MeView
```python
class MeView(APIView):
    """Información del usuario actual"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)
```

## Serializers

### UserSerializer
```python
class UserSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()
    permissions = serializers.SerializerMethodField()
    groups = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name',
            'full_name', 'is_active', 'is_staff', 'is_superuser',
            'date_joined', 'last_login', 'permissions', 'groups'
        ]
        read_only_fields = ['id', 'date_joined', 'last_login']
    
    def get_full_name(self, obj):
        return f"{obj.first_name} {obj.last_name}".strip()
    
    def get_permissions(self, obj):
        return list(obj.get_all_permissions())
    
    def get_groups(self, obj):
        return [group.name for group in obj.groups.all()]
```

### UserCreateSerializer
```python
class UserCreateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = [
            'username', 'email', 'first_name', 'last_name',
            'password', 'password_confirm'
        ]
    
    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError("Passwords don't match")
        return attrs
    
    def create(self, validated_data):
        validated_data.pop('password_confirm')
        password = validated_data.pop('password')
        user = User.objects.create_user(**validated_data)
        user.set_password(password)
        user.save()
        return user
```

## Vistas y ViewSets

### UserViewSet
```python
class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]
    filter_backends = [DjangoFilterBackend, SearchFilter]
    filterset_fields = ['is_active', 'is_staff', 'groups']
    search_fields = ['username', 'email', 'first_name', 'last_name']
    
    def get_serializer_class(self):
        if self.action == 'create':
            return UserCreateSerializer
        return UserSerializer
    
    @action(detail=True, methods=['post'])
    def activate(self, request, pk=None):
        """Activar usuario"""
        user = self.get_object()
        user.is_active = True
        user.save()
        return Response({'status': 'activated'})
    
    @action(detail=True, methods=['post'])
    def deactivate(self, request, pk=None):
        """Desactivar usuario"""
        user = self.get_object()
        user.is_active = False
        user.save()
        return Response({'status': 'deactivated'})
    
    @action(detail=True, methods=['post'])
    def reset_password(self, request, pk=None):
        """Resetear contraseña"""
        user = self.get_object()
        new_password = request.data.get('password')
        if new_password:
            user.set_password(new_password)
            user.save()
            return Response({'status': 'password_reset'})
        return Response({'error': 'Password required'}, status=400)
```

## Endpoints Disponibles

| Método | URL | Descripción | Permisos |
|--------|-----|-------------|----------|
| POST | `/api/token/` | Login (obtener tokens) | Público |
| POST | `/api/token/refresh/` | Refresh token | Público |
| GET | `/api/auth/me/` | Información del usuario actual | Autenticado |
| GET | `/api/users/` | Listar usuarios | Admin |
| POST | `/api/users/` | Crear usuario | Admin |
| GET | `/api/users/{id}/` | Obtener usuario | Admin |
| PUT | `/api/users/{id}/` | Actualizar usuario | Admin |
| DELETE | `/api/users/{id}/` | Eliminar usuario | Admin |
| POST | `/api/users/{id}/activate/` | Activar usuario | Admin |
| POST | `/api/users/{id}/deactivate/` | Desactivar usuario | Admin |
| POST | `/api/users/{id}/reset_password/` | Resetear contraseña | Admin |

## Comandos de Gestión

### 1. ensure_superuser.py
```bash
python manage.py ensure_superuser
```
- Verifica que existe al menos un superusuario
- Crea superusuario por defecto si no existe
- Usado en inicialización automática

### 2. create_superuser.py
```bash
python manage.py create_superuser --username admin --email admin@example.com
```
- Crea un superusuario específico
- Permite configurar credenciales
- Útil para scripts de despliegue

### 3. check_superusers.py
```bash
python manage.py check_superusers
```
- Lista todos los superusuarios activos
- Verifica estado de cuentas administrativas
- Útil para auditorías de seguridad

## Sistema de Permisos

### 1. Permisos por Defecto de Django
```python
# Permisos automáticos por modelo
'add_<model>'     # Crear
'change_<model>'  # Modificar
'delete_<model>'  # Eliminar
'view_<model>'    # Ver
```

### 2. Permisos Personalizados
```python
class Meta:
    permissions = [
        ('can_manage_flows', 'Can manage flows'),
        ('can_execute_flows', 'Can execute flows'),
        ('can_view_reports', 'Can view reports'),
        ('can_manage_templates', 'Can manage templates'),
    ]
```

### 3. Grupos de Usuarios
```python
# Grupos predefinidos
ADMIN_GROUP = 'Administrators'
EDITOR_GROUP = 'Editors'
VIEWER_GROUP = 'Viewers'
OPERATOR_GROUP = 'Operators'
```

## Middleware de Seguridad

### 1. Token Expiration Middleware
```python
class TokenExpirationMiddleware:
    """Middleware para manejar expiración de tokens"""
    def __init__(self, get_response):
        self.get_response = get_response
    
    def __call__(self, request):
        # Verificar token en header Authorization
        # Validar expiración
        # Renovar automáticamente si es posible
        # Retornar error 401 si token inválido
```

### 2. Inactivity Middleware
```python
class InactivityMiddleware:
    """Middleware para controlar inactividad"""
    def __init__(self, get_response):
        self.get_response = get_response
    
    def __call__(self, request):
        # Rastrear actividad del usuario
        # Verificar timeout de inactividad
        # Invalidar sesión si excede límite
        # Actualizar última actividad
```

## Integración con Frontend

### 1. Contexto de Autenticación
```typescript
interface AuthContext {
  user: User | null
  tokens: Tokens | null
  login: (username: string, password: string) => Promise<void>
  logout: () => void
  refreshToken: () => Promise<string | null>
  isAuthenticated: boolean
  isLoading: boolean
}
```

### 2. Hooks de Autenticación
```typescript
const useAuth = () => {
  const [user, setUser] = useState<User | null>(null)
  const [tokens, setTokens] = useState<Tokens | null>(null)
  
  const login = async (username: string, password: string) => {
    const response = await api.post('/api/token/', { username, password })
    setTokens(response.data)
    const userResponse = await api.get('/api/auth/me/')
    setUser(userResponse.data)
  }
  
  const logout = () => {
    setUser(null)
    setTokens(null)
    localStorage.removeItem('tokens')
  }
  
  return { user, tokens, login, logout, isAuthenticated: !!user }
}
```

### 3. Protección de Rutas
```typescript
const ProtectedRoute = ({ children, requiredPermission }: Props) => {
  const { user, isAuthenticated } = useAuth()
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />
  }
  
  if (requiredPermission && !user?.permissions.includes(requiredPermission)) {
    return <Navigate to="/unauthorized" />
  }
  
  return <>{children}</>
}
```

## Configuración de Seguridad

### 1. Validación de Contraseñas
```python
AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
        'OPTIONS': {'min_length': 8}
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]
```

### 2. Configuración de Sesiones
```python
SESSION_COOKIE_AGE = 1800  # 30 minutos
SESSION_EXPIRE_AT_BROWSER_CLOSE = True
SESSION_COOKIE_SECURE = True  # Solo HTTPS en producción
SESSION_COOKIE_HTTPONLY = True
```

### 3. Rate Limiting
```python
# En settings.py
REST_FRAMEWORK = {
    'DEFAULT_THROTTLE_RATES': {
        'login': '5/min',
        'user': '1000/hour',
    }
}
```

## Auditoría y Logs

### 1. Log de Autenticación
```python
import logging

auth_logger = logging.getLogger('auth')

def log_login_attempt(username, success, ip_address):
    if success:
        auth_logger.info(f"Successful login: {username} from {ip_address}")
    else:
        auth_logger.warning(f"Failed login attempt: {username} from {ip_address}")
```

### 2. Historial de Actividad
```python
class UserActivity(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    action = models.CharField(max_length=100)
    timestamp = models.DateTimeField(auto_now_add=True)
    ip_address = models.GenericIPAddressField()
    user_agent = models.TextField()
    details = models.JSONField(default=dict)
```

## Testing

### Tests de Autenticación
```python
class AuthTestCase(TestCase):
    def test_user_login(self):
        """Test login con credenciales válidas"""
        
    def test_token_refresh(self):
        """Test renovación de token"""
        
    def test_invalid_credentials(self):
        """Test login con credenciales inválidas"""
        
    def test_token_expiration(self):
        """Test expiración de token"""
```

## Consideraciones de Seguridad

### 1. Protección contra Ataques
- Rate limiting en endpoints de login
- Validación de contraseñas robustas
- Tokens JWT con expiración corta
- Blacklist de tokens comprometidos

### 2. Mejores Prácticas
- Nunca almacenar contraseñas en texto plano
- Usar HTTPS en producción
- Implementar 2FA (futuro)
- Auditoría de accesos

### 3. Configuración de Producción
- Variables de entorno para secrets
- Configuración de CORS restrictiva
- Logs de seguridad centralizados
- Monitoreo de intentos de acceso