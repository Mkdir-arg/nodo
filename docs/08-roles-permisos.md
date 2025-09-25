# Sistema de Roles y Permisos

## Descripción General

El sistema implementa un modelo de permisos basado en roles utilizando el sistema de autenticación y autorización nativo de Django, extendido con permisos personalizados y middleware de seguridad.

## Arquitectura de Permisos

### 1. Modelo de Permisos Django

#### Estructura Base
```python
# Modelo Permission (Django)
class Permission(models.Model):
    name = models.CharField(max_length=255)           # Nombre descriptivo
    content_type = models.ForeignKey(ContentType)     # Tipo de contenido
    codename = models.CharField(max_length=100)       # Código del permiso
```

#### Modelo User-Permission
```python
# Relación Many-to-Many
User.user_permissions = models.ManyToManyField(Permission)
User.groups = models.ManyToManyField(Group)
```

#### Modelo Group
```python
class Group(models.Model):
    name = models.CharField(max_length=150, unique=True)
    permissions = models.ManyToManyField(Permission)
```

## Permisos por Módulo

### 1. Módulo Config
```python
class Meta:
    permissions = [
        ('view_system_settings', 'Can view system settings'),
        ('change_system_settings', 'Can change system settings'),
        ('manage_security_config', 'Can manage security configuration'),
    ]
```

### 2. Módulo Plantillas
```python
class Meta:
    permissions = [
        ('add_plantilla', 'Can add plantilla'),
        ('change_plantilla', 'Can change plantilla'),
        ('delete_plantilla', 'Can delete plantilla'),
        ('view_plantilla', 'Can view plantilla'),
        ('publish_plantilla', 'Can publish plantilla'),
        ('duplicate_plantilla', 'Can duplicate plantilla'),
    ]
```

### 3. Módulo Legajos
```python
class Meta:
    permissions = [
        ('add_legajo', 'Can add legajo'),
        ('change_legajo', 'Can change legajo'),
        ('delete_legajo', 'Can delete legajo'),
        ('view_legajo', 'Can view legajo'),
        ('export_legajo', 'Can export legajo'),
        ('bulk_create_legajo', 'Can bulk create legajos'),
    ]
```

### 4. Módulo Flujos
```python
class Meta:
    permissions = [
        ('add_flujo', 'Can add flujo'),
        ('change_flujo', 'Can change flujo'),
        ('delete_flujo', 'Can delete flujo'),
        ('view_flujo', 'Can view flujo'),
        ('execute_flujo', 'Can execute flujo'),
        ('monitor_flujo', 'Can monitor flujo execution'),
        ('cancel_flujo', 'Can cancel flujo execution'),
    ]
```

## Roles Predefinidos

### 1. Superadministrador
```python
SUPERADMIN_PERMISSIONS = [
    # Todos los permisos del sistema
    '*'
]

# Características:
# - Acceso completo al sistema
# - Gestión de usuarios y roles
# - Configuración del sistema
# - Acceso a logs y auditoría
```

### 2. Administrador
```python
ADMIN_PERMISSIONS = [
    # Config
    'config.view_system_settings',
    'config.change_system_settings',
    
    # Plantillas
    'plantillas.add_plantilla',
    'plantillas.change_plantilla',
    'plantillas.delete_plantilla',
    'plantillas.view_plantilla',
    'plantillas.publish_plantilla',
    
    # Legajos
    'legajos.add_legajo',
    'legajos.change_legajo',
    'legajos.delete_legajo',
    'legajos.view_legajo',
    'legajos.export_legajo',
    
    # Flujos
    'flows.add_flujo',
    'flows.change_flujo',
    'flows.delete_flujo',
    'flows.view_flujo',
    'flows.execute_flujo',
    'flows.monitor_flujo',
    
    # Usuarios
    'auth.add_user',
    'auth.change_user',
    'auth.view_user',
]
```

### 3. Editor
```python
EDITOR_PERMISSIONS = [
    # Plantillas
    'plantillas.add_plantilla',
    'plantillas.change_plantilla',
    'plantillas.view_plantilla',
    
    # Legajos
    'legajos.add_legajo',
    'legajos.change_legajo',
    'legajos.view_legajo',
    
    # Flujos
    'flows.add_flujo',
    'flows.change_flujo',
    'flows.view_flujo',
    'flows.execute_flujo',
]
```

### 4. Operador
```python
OPERATOR_PERMISSIONS = [
    # Legajos
    'legajos.add_legajo',
    'legajos.change_legajo',
    'legajos.view_legajo',
    
    # Flujos
    'flows.view_flujo',
    'flows.execute_flujo',
]
```

### 5. Visualizador
```python
VIEWER_PERMISSIONS = [
    # Solo lectura
    'plantillas.view_plantilla',
    'legajos.view_legajo',
    'flows.view_flujo',
]
```

## Implementación de Permisos

### 1. Decoradores de Vista
```python
from django.contrib.auth.decorators import permission_required
from rest_framework.permissions import BasePermission

@permission_required('plantillas.add_plantilla')
def create_plantilla(request):
    # Lógica de creación
    pass

class HasPlantillaPermission(BasePermission):
    def has_permission(self, request, view):
        if view.action == 'create':
            return request.user.has_perm('plantillas.add_plantilla')
        elif view.action in ['update', 'partial_update']:
            return request.user.has_perm('plantillas.change_plantilla')
        elif view.action == 'destroy':
            return request.user.has_perm('plantillas.delete_plantilla')
        else:
            return request.user.has_perm('plantillas.view_plantilla')
```

### 2. Permisos en ViewSets
```python
class PlantillaViewSet(viewsets.ModelViewSet):
    queryset = Plantilla.objects.all()
    serializer_class = PlantillaSerializer
    permission_classes = [IsAuthenticated, HasPlantillaPermission]
    
    def get_permissions(self):
        """Permisos dinámicos según la acción"""
        if self.action == 'create':
            permission_classes = [IsAuthenticated, HasAddPermission]
        elif self.action in ['update', 'partial_update']:
            permission_classes = [IsAuthenticated, HasChangePermission]
        elif self.action == 'destroy':
            permission_classes = [IsAuthenticated, HasDeletePermission]
        else:
            permission_classes = [IsAuthenticated, HasViewPermission]
        
        return [permission() for permission in permission_classes]
```

### 3. Permisos a Nivel de Objeto
```python
class LegajoPermission(BasePermission):
    def has_object_permission(self, request, view, obj):
        # Solo el creador o admin puede modificar
        if request.method in ['PUT', 'PATCH', 'DELETE']:
            return (obj.created_by == request.user or 
                   request.user.has_perm('legajos.change_legajo'))
        
        # Lectura para usuarios con permiso
        return request.user.has_perm('legajos.view_legajo')
```

## Middleware de Autorización

### 1. Permission Middleware
```python
class PermissionMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response
    
    def __call__(self, request):
        # Verificar permisos antes de procesar request
        if not self.has_permission(request):
            return JsonResponse({'error': 'Permission denied'}, status=403)
        
        response = self.get_response(request)
        return response
    
    def has_permission(self, request):
        # Lógica de verificación de permisos
        if request.path.startswith('/api/admin/'):
            return request.user.is_staff
        
        return True
```

### 2. Role-Based Access Control
```python
class RBACMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response
        self.role_permissions = {
            'admin': ADMIN_PERMISSIONS,
            'editor': EDITOR_PERMISSIONS,
            'operator': OPERATOR_PERMISSIONS,
            'viewer': VIEWER_PERMISSIONS,
        }
    
    def __call__(self, request):
        if request.user.is_authenticated:
            user_role = self.get_user_role(request.user)
            request.user_role = user_role
            request.user_permissions = self.role_permissions.get(user_role, [])
        
        response = self.get_response(request)
        return response
```

## Gestión de Roles

### 1. Asignación de Roles
```python
class UserRoleService:
    @staticmethod
    def assign_role(user, role_name):
        """Asigna un rol a un usuario"""
        try:
            group = Group.objects.get(name=role_name)
            user.groups.add(group)
            return True
        except Group.DoesNotExist:
            return False
    
    @staticmethod
    def remove_role(user, role_name):
        """Remueve un rol de un usuario"""
        try:
            group = Group.objects.get(name=role_name)
            user.groups.remove(group)
            return True
        except Group.DoesNotExist:
            return False
    
    @staticmethod
    def get_user_roles(user):
        """Obtiene los roles de un usuario"""
        return [group.name for group in user.groups.all()]
    
    @staticmethod
    def has_role(user, role_name):
        """Verifica si un usuario tiene un rol específico"""
        return user.groups.filter(name=role_name).exists()
```

### 2. Comandos de Gestión
```python
# management/commands/setup_roles.py
class Command(BaseCommand):
    def handle(self, *args, **options):
        self.create_groups()
        self.assign_permissions()
    
    def create_groups(self):
        """Crea los grupos de roles"""
        roles = ['Administrador', 'Editor', 'Operador', 'Visualizador']
        for role in roles:
            group, created = Group.objects.get_or_create(name=role)
            if created:
                self.stdout.write(f"Created group: {role}")
    
    def assign_permissions(self):
        """Asigna permisos a los grupos"""
        # Administrador
        admin_group = Group.objects.get(name='Administrador')
        admin_permissions = Permission.objects.filter(
            codename__in=['add_plantilla', 'change_plantilla', 'delete_plantilla']
        )
        admin_group.permissions.set(admin_permissions)
```

## Validación de Permisos en Frontend

### 1. Hook de Permisos
```typescript
const usePermissions = () => {
  const { user } = useAuth()
  
  const hasPermission = (permission: string): boolean => {
    if (!user) return false
    return user.permissions.includes(permission)
  }
  
  const hasRole = (role: string): boolean => {
    if (!user) return false
    return user.groups.includes(role)
  }
  
  const canAccess = (resource: string, action: string): boolean => {
    const permission = `${resource}.${action}`
    return hasPermission(permission)
  }
  
  return { hasPermission, hasRole, canAccess }
}
```

### 2. Componente de Protección
```typescript
interface ProtectedComponentProps {
  permission?: string
  role?: string
  fallback?: React.ReactNode
  children: React.ReactNode
}

const ProtectedComponent: React.FC<ProtectedComponentProps> = ({
  permission,
  role,
  fallback = null,
  children
}) => {
  const { hasPermission, hasRole } = usePermissions()
  
  const hasAccess = () => {
    if (permission && !hasPermission(permission)) return false
    if (role && !hasRole(role)) return false
    return true
  }
  
  return hasAccess() ? <>{children}</> : <>{fallback}</>
}
```

### 3. Uso en Componentes
```typescript
const PlantillasList = () => {
  return (
    <div>
      <h1>Plantillas</h1>
      
      <ProtectedComponent permission="plantillas.add_plantilla">
        <Button onClick={createPlantilla}>Crear Plantilla</Button>
      </ProtectedComponent>
      
      <ProtectedComponent role="Administrador">
        <AdminPanel />
      </ProtectedComponent>
    </div>
  )
}
```

## Auditoría de Permisos

### 1. Log de Accesos
```python
class PermissionAuditLog(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    permission = models.CharField(max_length=100)
    resource = models.CharField(max_length=100)
    action = models.CharField(max_length=50)
    granted = models.BooleanField()
    timestamp = models.DateTimeField(auto_now_add=True)
    ip_address = models.GenericIPAddressField()
    user_agent = models.TextField()
    
    class Meta:
        ordering = ['-timestamp']
```

### 2. Middleware de Auditoría
```python
class PermissionAuditMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response
    
    def __call__(self, request):
        response = self.get_response(request)
        
        # Log permission checks
        if hasattr(request, 'permission_checks'):
            for check in request.permission_checks:
                PermissionAuditLog.objects.create(
                    user=request.user,
                    permission=check['permission'],
                    resource=check['resource'],
                    action=check['action'],
                    granted=check['granted'],
                    ip_address=self.get_client_ip(request),
                    user_agent=request.META.get('HTTP_USER_AGENT', '')
                )
        
        return response
```

## Configuración de Seguridad

### 1. Configuración por Defecto
```python
# settings.py
DEFAULT_PERMISSION_CLASSES = [
    'rest_framework.permissions.IsAuthenticated',
]

# Permisos estrictos por defecto
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'
USE_PERMISSIONS = True
REQUIRE_AUTHENTICATION = True
```

### 2. Variables de Entorno
```bash
# .env
ENABLE_PERMISSION_AUDIT=true
STRICT_PERMISSIONS=true
DEFAULT_USER_ROLE=viewer
ADMIN_ONLY_ENDPOINTS=/api/admin/,/api/system/
```

## Testing de Permisos

### 1. Tests de Autorización
```python
class PermissionTestCase(TestCase):
    def setUp(self):
        self.admin_user = User.objects.create_user('admin', 'admin@test.com', 'pass')
        self.editor_user = User.objects.create_user('editor', 'editor@test.com', 'pass')
        self.viewer_user = User.objects.create_user('viewer', 'viewer@test.com', 'pass')
        
        # Asignar roles
        UserRoleService.assign_role(self.admin_user, 'Administrador')
        UserRoleService.assign_role(self.editor_user, 'Editor')
        UserRoleService.assign_role(self.viewer_user, 'Visualizador')
    
    def test_admin_can_create_plantilla(self):
        self.client.force_authenticate(user=self.admin_user)
        response = self.client.post('/api/plantillas/', data={})
        self.assertEqual(response.status_code, 201)
    
    def test_viewer_cannot_create_plantilla(self):
        self.client.force_authenticate(user=self.viewer_user)
        response = self.client.post('/api/plantillas/', data={})
        self.assertEqual(response.status_code, 403)
```

## Mejores Prácticas

### 1. Principio de Menor Privilegio
- Asignar solo los permisos mínimos necesarios
- Revisar permisos regularmente
- Usar roles en lugar de permisos individuales

### 2. Separación de Responsabilidades
- Roles específicos por función
- No mezclar permisos administrativos con operativos
- Auditoría regular de asignaciones

### 3. Seguridad por Capas
- Validación en frontend (UX)
- Validación en backend (seguridad)
- Validación en base de datos (integridad)

### 4. Monitoreo Continuo
- Logs de acceso detallados
- Alertas por accesos denegados
- Revisión periódica de permisos