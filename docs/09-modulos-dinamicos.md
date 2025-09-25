# Implementación Dinámica de Módulos

## Descripción General

El sistema Nodo implementa una arquitectura modular que permite la carga dinámica de componentes, tanto en el backend (Django) como en el frontend (Next.js). Esta funcionalidad permite extender el sistema sin modificar el código base.

## Arquitectura Modular

### 1. Estructura de Módulos

```
nodo/
├── backend/
│   ├── config/           # Módulo core
│   ├── plantillas/       # Módulo de plantillas
│   ├── legajos/         # Módulo de legajos
│   ├── flows/           # Módulo de flujos
│   ├── users/           # Módulo de usuarios
│   └── [dynamic_modules]/ # Módulos dinámicos
└── frontend/
    ├── src/
    │   ├── components/   # Componentes base
    │   ├── modules/      # Módulos dinámicos
    │   └── lib/         # Librerías compartidas
```

### 2. Registro de Módulos

#### Backend - Django Apps
```python
# settings.py
INSTALLED_APPS = [
    # Apps core
    'django.contrib.admin',
    'django.contrib.auth',
    'rest_framework',
    
    # Apps del sistema
    'config',
    'users',
    'plantillas',
    'legajos',
    'flows',
    
    # Apps dinámicas
    *get_dynamic_apps(),
]

def get_dynamic_apps():
    """Obtiene apps dinámicas desde configuración"""
    dynamic_apps = []
    
    # Leer desde base de datos
    try:
        from config.models import SystemSettings
        setting = SystemSettings.objects.get(key='dynamic_apps')
        dynamic_apps = json.loads(setting.value)
    except:
        pass
    
    # Leer desde archivo de configuración
    config_file = BASE_DIR / 'dynamic_modules.json'
    if config_file.exists():
        with open(config_file) as f:
            config = json.load(f)
            dynamic_apps.extend(config.get('apps', []))
    
    return dynamic_apps
```

## Carga Dinámica en Backend

### 1. Sistema de Plugins

#### Plugin Base
```python
# plugins/base.py
from abc import ABC, abstractmethod

class BasePlugin(ABC):
    name = None
    version = None
    description = None
    
    @abstractmethod
    def install(self):
        """Instala el plugin"""
        pass
    
    @abstractmethod
    def uninstall(self):
        """Desinstala el plugin"""
        pass
    
    @abstractmethod
    def get_urls(self):
        """Retorna URLs del plugin"""
        pass
    
    @abstractmethod
    def get_models(self):
        """Retorna modelos del plugin"""
        pass
```

#### Plugin Manager
```python
# plugins/manager.py
import importlib
import os
from django.conf import settings

class PluginManager:
    def __init__(self):
        self.plugins = {}
        self.load_plugins()
    
    def load_plugins(self):
        """Carga todos los plugins disponibles"""
        plugins_dir = settings.BASE_DIR / 'plugins'
        
        for plugin_dir in plugins_dir.iterdir():
            if plugin_dir.is_dir() and (plugin_dir / '__init__.py').exists():
                try:
                    plugin_module = importlib.import_module(f'plugins.{plugin_dir.name}')
                    plugin_class = getattr(plugin_module, 'Plugin', None)
                    
                    if plugin_class and issubclass(plugin_class, BasePlugin):
                        plugin = plugin_class()
                        self.plugins[plugin.name] = plugin
                        
                except ImportError as e:
                    print(f"Error loading plugin {plugin_dir.name}: {e}")
    
    def get_plugin(self, name):
        """Obtiene un plugin por nombre"""
        return self.plugins.get(name)
    
    def install_plugin(self, name):
        """Instala un plugin"""
        plugin = self.get_plugin(name)
        if plugin:
            plugin.install()
            return True
        return False
    
    def get_all_urls(self):
        """Obtiene URLs de todos los plugins"""
        urls = []
        for plugin in self.plugins.values():
            urls.extend(plugin.get_urls())
        return urls
```

### 2. Registro Dinámico de URLs

```python
# config/urls.py
from django.urls import path, include
from plugins.manager import PluginManager

# URLs estáticas
urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/plantillas/', include('plantillas.urls')),
    path('api/legajos/', include('legajos.urls')),
    path('api/flows/', include('flows.urls')),
]

# URLs dinámicas de plugins
plugin_manager = PluginManager()
for plugin_name, plugin in plugin_manager.plugins.items():
    plugin_urls = plugin.get_urls()
    if plugin_urls:
        urlpatterns.append(
            path(f'api/{plugin_name}/', include(plugin_urls))
        )
```

### 3. Modelos Dinámicos

```python
# plugins/example_plugin/models.py
from django.db import models
from plugins.base import BasePlugin

class ExampleModel(models.Model):
    name = models.CharField(max_length=100)
    data = models.JSONField()
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        app_label = 'example_plugin'

class Plugin(BasePlugin):
    name = 'example_plugin'
    version = '1.0.0'
    description = 'Plugin de ejemplo'
    
    def install(self):
        # Crear tablas, datos iniciales, etc.
        from django.core.management import call_command
        call_command('migrate', 'example_plugin')
    
    def uninstall(self):
        # Limpiar datos, eliminar tablas, etc.
        pass
    
    def get_urls(self):
        from django.urls import path
        from . import views
        
        return [
            path('', views.ExampleListView.as_view()),
            path('<int:pk>/', views.ExampleDetailView.as_view()),
        ]
    
    def get_models(self):
        return [ExampleModel]
```

## Carga Dinámica en Frontend

### 1. Sistema de Módulos React

#### Module Registry
```typescript
// lib/modules/registry.ts
interface ModuleConfig {
  name: string
  version: string
  component: React.ComponentType<any>
  routes?: RouteConfig[]
  permissions?: string[]
}

class ModuleRegistry {
  private modules: Map<string, ModuleConfig> = new Map()
  
  register(config: ModuleConfig) {
    this.modules.set(config.name, config)
  }
  
  get(name: string): ModuleConfig | undefined {
    return this.modules.get(name)
  }
  
  getAll(): ModuleConfig[] {
    return Array.from(this.modules.values())
  }
  
  getRoutes(): RouteConfig[] {
    const routes: RouteConfig[] = []
    
    this.modules.forEach(module => {
      if (module.routes) {
        routes.push(...module.routes)
      }
    })
    
    return routes
  }
}

export const moduleRegistry = new ModuleRegistry()
```

#### Dynamic Component Loader
```typescript
// lib/modules/loader.ts
import { lazy, ComponentType } from 'react'

interface DynamicModuleConfig {
  name: string
  path: string
  enabled: boolean
}

class ModuleLoader {
  private loadedModules: Map<string, ComponentType<any>> = new Map()
  
  async loadModule(config: DynamicModuleConfig): Promise<ComponentType<any> | null> {
    if (!config.enabled) return null
    
    // Verificar si ya está cargado
    if (this.loadedModules.has(config.name)) {
      return this.loadedModules.get(config.name)!
    }
    
    try {
      // Carga dinámica del módulo
      const module = await import(`../../../modules/${config.path}`)
      const Component = module.default || module[config.name]
      
      if (Component) {
        this.loadedModules.set(config.name, Component)
        return Component
      }
    } catch (error) {
      console.error(`Error loading module ${config.name}:`, error)
    }
    
    return null
  }
  
  async loadAllModules(): Promise<void> {
    const moduleConfigs = await this.getModuleConfigs()
    
    const loadPromises = moduleConfigs.map(config => 
      this.loadModule(config)
    )
    
    await Promise.all(loadPromises)
  }
  
  private async getModuleConfigs(): Promise<DynamicModuleConfig[]> {
    try {
      const response = await fetch('/api/system/modules')
      return await response.json()
    } catch (error) {
      console.error('Error fetching module configs:', error)
      return []
    }
  }
}

export const moduleLoader = new ModuleLoader()
```

### 2. Componentes Dinámicos

#### Dynamic Route Generator
```typescript
// components/DynamicRoutes.tsx
import { useEffect, useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import { moduleRegistry } from '@/lib/modules/registry'
import { moduleLoader } from '@/lib/modules/loader'

export const DynamicRoutes = () => {
  const [routes, setRoutes] = useState<RouteConfig[]>([])
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    const loadModules = async () => {
      await moduleLoader.loadAllModules()
      const dynamicRoutes = moduleRegistry.getRoutes()
      setRoutes(dynamicRoutes)
      setLoading(false)
    }
    
    loadModules()
  }, [])
  
  if (loading) {
    return <div>Loading modules...</div>
  }
  
  return (
    <Routes>
      {routes.map(route => (
        <Route
          key={route.path}
          path={route.path}
          element={<route.component />}
        />
      ))}
    </Routes>
  )
}
```

#### Module Container
```typescript
// components/ModuleContainer.tsx
import { Suspense, ErrorBoundary } from 'react'
import { usePermissions } from '@/lib/hooks/usePermissions'

interface ModuleContainerProps {
  moduleName: string
  fallback?: React.ReactNode
  errorFallback?: React.ReactNode
}

export const ModuleContainer: React.FC<ModuleContainerProps> = ({
  moduleName,
  fallback = <div>Loading...</div>,
  errorFallback = <div>Error loading module</div>
}) => {
  const { hasPermission } = usePermissions()
  const module = moduleRegistry.get(moduleName)
  
  if (!module) {
    return <div>Module not found: {moduleName}</div>
  }
  
  // Verificar permisos
  if (module.permissions && !module.permissions.some(p => hasPermission(p))) {
    return <div>Access denied</div>
  }
  
  const Component = module.component
  
  return (
    <ErrorBoundary fallback={errorFallback}>
      <Suspense fallback={fallback}>
        <Component />
      </Suspense>
    </ErrorBoundary>
  )
}
```

### 3. Lazy Loading de Módulos

```typescript
// modules/example/index.tsx
import { lazy } from 'react'
import { moduleRegistry } from '@/lib/modules/registry'

// Componente principal del módulo
const ExampleModule = lazy(() => import('./ExampleModule'))

// Registro del módulo
moduleRegistry.register({
  name: 'example',
  version: '1.0.0',
  component: ExampleModule,
  routes: [
    {
      path: '/example',
      component: ExampleModule
    },
    {
      path: '/example/:id',
      component: lazy(() => import('./ExampleDetail'))
    }
  ],
  permissions: ['example.view']
})

export default ExampleModule
```

## Configuración de Módulos

### 1. Configuración en Base de Datos

```python
# Modelo para configuración de módulos
class ModuleConfig(models.Model):
    name = models.CharField(max_length=100, unique=True)
    enabled = models.BooleanField(default=True)
    version = models.CharField(max_length=20)
    config = models.JSONField(default=dict)
    dependencies = models.JSONField(default=list)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.name} v{self.version}"
```

### 2. API de Configuración

```python
# views.py
class ModuleConfigViewSet(viewsets.ModelViewSet):
    queryset = ModuleConfig.objects.all()
    serializer_class = ModuleConfigSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]
    
    @action(detail=True, methods=['post'])
    def enable(self, request, pk=None):
        """Habilita un módulo"""
        module = self.get_object()
        module.enabled = True
        module.save()
        
        # Recargar configuración
        self.reload_modules()
        
        return Response({'status': 'enabled'})
    
    @action(detail=True, methods=['post'])
    def disable(self, request, pk=None):
        """Deshabilita un módulo"""
        module = self.get_object()
        module.enabled = False
        module.save()
        
        # Recargar configuración
        self.reload_modules()
        
        return Response({'status': 'disabled'})
    
    def reload_modules(self):
        """Recarga la configuración de módulos"""
        # Implementar lógica de recarga
        pass
```

## Gestión de Dependencias

### 1. Resolución de Dependencias

```python
# plugins/dependencies.py
class DependencyResolver:
    def __init__(self):
        self.modules = {}
        self.resolved = set()
        self.resolving = set()
    
    def add_module(self, name, dependencies):
        self.modules[name] = dependencies
    
    def resolve(self, name):
        """Resuelve dependencias de un módulo"""
        if name in self.resolved:
            return True
        
        if name in self.resolving:
            raise CircularDependencyError(f"Circular dependency detected: {name}")
        
        self.resolving.add(name)
        
        # Resolver dependencias
        dependencies = self.modules.get(name, [])
        for dep in dependencies:
            if not self.resolve(dep):
                return False
        
        self.resolving.remove(name)
        self.resolved.add(name)
        return True
    
    def get_load_order(self):
        """Obtiene el orden de carga de módulos"""
        load_order = []
        
        for module in self.modules:
            if self.resolve(module):
                if module not in load_order:
                    load_order.append(module)
        
        return load_order
```

### 2. Validación de Dependencias

```typescript
// lib/modules/dependencies.ts
interface ModuleDependency {
  name: string
  version: string
  required: boolean
}

class DependencyValidator {
  validateDependencies(
    moduleName: string, 
    dependencies: ModuleDependency[]
  ): ValidationResult {
    const errors: string[] = []
    const warnings: string[] = []
    
    for (const dep of dependencies) {
      const module = moduleRegistry.get(dep.name)
      
      if (!module) {
        if (dep.required) {
          errors.push(`Required dependency not found: ${dep.name}`)
        } else {
          warnings.push(`Optional dependency not found: ${dep.name}`)
        }
        continue
      }
      
      // Verificar versión
      if (!this.isVersionCompatible(module.version, dep.version)) {
        errors.push(
          `Version mismatch for ${dep.name}: required ${dep.version}, found ${module.version}`
        )
      }
    }
    
    return {
      valid: errors.length === 0,
      errors,
      warnings
    }
  }
  
  private isVersionCompatible(current: string, required: string): boolean {
    // Implementar lógica de compatibilidad semántica
    return true
  }
}
```

## Hot Reloading de Módulos

### 1. Backend Hot Reload

```python
# plugins/hot_reload.py
import importlib
import sys
from django.conf import settings

class HotReloader:
    def __init__(self):
        self.watched_modules = set()
    
    def watch_module(self, module_name):
        """Agrega un módulo para hot reload"""
        self.watched_modules.add(module_name)
    
    def reload_module(self, module_name):
        """Recarga un módulo específico"""
        if module_name in sys.modules:
            importlib.reload(sys.modules[module_name])
            return True
        return False
    
    def reload_all(self):
        """Recarga todos los módulos watched"""
        for module_name in self.watched_modules:
            self.reload_module(module_name)
```

### 2. Frontend Hot Reload

```typescript
// lib/modules/hot-reload.ts
class ModuleHotReloader {
  private watchers: Map<string, () => void> = new Map()
  
  watch(moduleName: string, callback: () => void) {
    this.watchers.set(moduleName, callback)
    
    // En desarrollo, usar WebSocket para notificaciones
    if (process.env.NODE_ENV === 'development') {
      this.setupWebSocketListener(moduleName, callback)
    }
  }
  
  private setupWebSocketListener(moduleName: string, callback: () => void) {
    const ws = new WebSocket(`ws://localhost:3001/hot-reload/${moduleName}`)
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data)
      if (data.type === 'module-updated') {
        callback()
      }
    }
  }
  
  async reloadModule(moduleName: string) {
    // Limpiar cache del módulo
    delete require.cache[require.resolve(`../../../modules/${moduleName}`)]
    
    // Recargar módulo
    const module = await import(`../../../modules/${moduleName}`)
    
    // Actualizar registro
    moduleRegistry.register(module.config)
    
    // Notificar a watchers
    const callback = this.watchers.get(moduleName)
    if (callback) {
      callback()
    }
  }
}
```

## Testing de Módulos Dinámicos

### 1. Tests de Carga de Módulos

```python
# tests/test_dynamic_modules.py
class DynamicModuleTestCase(TestCase):
    def test_plugin_loading(self):
        """Test carga de plugins"""
        manager = PluginManager()
        self.assertGreater(len(manager.plugins), 0)
    
    def test_plugin_installation(self):
        """Test instalación de plugin"""
        manager = PluginManager()
        result = manager.install_plugin('example_plugin')
        self.assertTrue(result)
    
    def test_dependency_resolution(self):
        """Test resolución de dependencias"""
        resolver = DependencyResolver()
        resolver.add_module('module_a', ['module_b'])
        resolver.add_module('module_b', [])
        
        order = resolver.get_load_order()
        self.assertEqual(order, ['module_b', 'module_a'])
```

### 2. Tests Frontend

```typescript
// __tests__/modules.test.tsx
describe('Dynamic Modules', () => {
  test('should load module dynamically', async () => {
    const module = await moduleLoader.loadModule({
      name: 'test-module',
      path: 'test/TestModule',
      enabled: true
    })
    
    expect(module).toBeDefined()
  })
  
  test('should register module correctly', () => {
    moduleRegistry.register({
      name: 'test',
      version: '1.0.0',
      component: TestComponent
    })
    
    const module = moduleRegistry.get('test')
    expect(module).toBeDefined()
    expect(module.name).toBe('test')
  })
})
```

## Mejores Prácticas

### 1. Diseño de Módulos
- Módulos autocontenidos
- Interfaces bien definidas
- Documentación completa
- Versionado semántico

### 2. Gestión de Estado
- Estado aislado por módulo
- Comunicación mediante eventos
- Evitar dependencias circulares

### 3. Seguridad
- Validación de módulos
- Sandboxing cuando sea posible
- Permisos granulares
- Auditoría de carga de módulos

### 4. Performance
- Lazy loading por defecto
- Cache de módulos cargados
- Optimización de bundles
- Monitoreo de memoria