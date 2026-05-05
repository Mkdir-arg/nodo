# Módulo de Flujos (Flows)

> Nota: este archivo queda como resumen del modulo. La referencia canónica, completa y alineada con el recorrido real actual del sistema está en `documentacion/FLUJOS_PUNTA_A_PUNTA.md`.

## Descripción General

El módulo `flows` implementa un motor de flujos de trabajo (workflow engine) que permite crear, ejecutar y monitorear procesos automatizados. Los flujos pueden incluir formularios, evaluaciones, delays, condiciones y otras acciones personalizadas.

## Estructura del Módulo

```
backend/flows/
├── management/
│   └── commands/
│       └── process_delays.py        # Procesamiento de delays
├── migrations/
│   └── 0001_initial.py             # Migración inicial
├── __init__.py
├── admin.py                        # Admin de Django
├── apps.py                         # Configuración de la app
├── compiler.py                     # Compilador de flujos
├── direct_views.py                 # Vistas directas
├── executor.py                     # Ejecutor de pasos
├── flow_engine.py                  # Motor principal
├── flow_runner.py                  # Ejecutor de flujos
├── flow_serializers.py             # Serializers específicos
├── models.py                       # Modelos del sistema
├── nodes.py                        # Definición de nodos
├── runtime.py                      # Runtime de ejecución
├── scheduler.py                    # Programador de tareas
├── serializers.py                  # Serializers DRF
├── simple_views.py                 # Vistas simplificadas
├── urls.py                         # URLs del módulo
├── views.py                        # Vistas principales
└── viewsets.py                     # ViewSets DRF
```

## Modelos Principales

### 1. Flujo
```python
class Flujo(models.Model):
    STATUS_CHOICES = [
        ('draft', 'Borrador'),
        ('published', 'Publicado'),
        ('archived', 'Archivado'),
    ]
    
    name = models.CharField(max_length=255)
    slug = models.SlugField(unique=True)
    description = models.TextField(blank=True, null=True)
    steps_data = models.JSONField(default=default_steps_data)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)
```

### 2. Step (Paso)
```python
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
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    flow = models.ForeignKey(Flujo, on_delete=models.CASCADE)
    step_type = models.CharField(max_length=20, choices=STEP_TYPES)
    name = models.CharField(max_length=255)
    config = models.JSONField(default=dict)
    ui_metadata = models.JSONField(default=dict)
    order = models.PositiveIntegerField(default=0)
```

### 3. InstanciaFlujo
```python
class InstanciaFlujo(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pendiente'),
        ('running', 'Ejecutando'),
        ('paused', 'Pausada'),
        ('completed', 'Completado'),
        ('failed', 'Fallido'),
        ('cancelled', 'Cancelado'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    flow = models.ForeignKey(Flujo, on_delete=models.CASCADE)
    legajo_id = models.UUIDField()
    current_step = models.ForeignKey(Step, on_delete=models.SET_NULL, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES)
    context = models.JSONField(default=default_context)
    resume_at = models.DateTimeField(null=True, blank=True)
    error_message = models.TextField(blank=True, null=True)
    started_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE)
```

### 4. Transition (Transición)
```python
class Transition(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    from_step = models.ForeignKey(Step, on_delete=models.CASCADE, related_name='outgoing_transitions')
    to_step = models.ForeignKey(Step, on_delete=models.CASCADE, related_name='incoming_transitions')
    label = models.CharField(max_length=255, blank=True)
    condition = models.TextField(blank=True)
```

### 5. InstanceLog
```python
class InstanceLog(models.Model):
    LEVEL_CHOICES = [
        ('info', 'Info'),
        ('warning', 'Warning'),
        ('error', 'Error'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    instance = models.ForeignKey(InstanciaFlujo, on_delete=models.CASCADE)
    step = models.ForeignKey(Step, on_delete=models.SET_NULL, null=True)
    level = models.CharField(max_length=10, choices=LEVEL_CHOICES)
    message = models.TextField()
    data = models.JSONField(default=dict)
    timestamp = models.DateTimeField(auto_now_add=True)
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
```

## Motor de Flujos (Flow Engine)

### flow_engine.py

#### FlowEngine
```python
class FlowEngine:
    def __init__(self):
        self.executor = StepExecutor()
        self.scheduler = FlowScheduler()
        
    def start_flow(self, flow_id, legajo_id, user, initial_data=None):
        """Inicia una nueva instancia de flujo"""
        
    def resume_flow(self, instance_id, user_input=None):
        """Reanuda una instancia pausada"""
        
    def cancel_flow(self, instance_id, reason=None):
        """Cancela una instancia en ejecución"""
        
    def get_flow_status(self, instance_id):
        """Obtiene el estado actual del flujo"""
```

### Tipos de Nodos

#### 1. Start Node
```python
class StartNode:
    def execute(self, context, config):
        """Nodo inicial del flujo"""
        # Configurar contexto inicial
        # Validar datos de entrada
        # Preparar variables del flujo
        return {'status': 'success', 'next': 'continue'}
```

#### 2. Form Node
```python
class FormNode:
    def execute(self, context, config):
        """Nodo de formulario"""
        # Renderizar formulario
        # Esperar input del usuario
        # Validar datos ingresados
        # Actualizar contexto
        return {'status': 'waiting_input', 'form_data': form_config}
```

#### 3. Evaluation Node
```python
class EvaluationNode:
    def execute(self, context, config):
        """Nodo de evaluación/cálculo"""
        # Ejecutar expresiones
        # Calcular valores
        # Actualizar variables
        return {'status': 'success', 'result': calculated_value}
```

#### 4. Condition Node
```python
class ConditionNode:
    def execute(self, context, config):
        """Nodo de condición"""
        # Evaluar condición
        # Determinar siguiente paso
        condition_result = self.evaluate_condition(config['condition'], context)
        return {
            'status': 'success',
            'next': 'true_branch' if condition_result else 'false_branch'
        }
```

#### 5. Delay Node
```python
class DelayNode:
    def execute(self, context, config):
        """Nodo de delay/espera"""
        # Programar reanudación
        # Pausar instancia
        delay_minutes = config.get('delay_minutes', 60)
        resume_at = timezone.now() + timedelta(minutes=delay_minutes)
        return {
            'status': 'delayed',
            'resume_at': resume_at
        }
```

#### 6. HTTP Node
```python
class HTTPNode:
    def execute(self, context, config):
        """Nodo de llamada HTTP"""
        # Realizar request HTTP
        # Procesar respuesta
        # Actualizar contexto
        response = requests.request(
            method=config['method'],
            url=config['url'],
            json=config.get('data', {}),
            headers=config.get('headers', {})
        )
        return {
            'status': 'success',
            'response': response.json()
        }
```

## Ejecutor de Pasos

### executor.py

```python
class StepExecutor:
    def __init__(self):
        self.node_registry = {
            'start': StartNode(),
            'form': FormNode(),
            'evaluation': EvaluationNode(),
            'condition': ConditionNode(),
            'delay': DelayNode(),
            'http': HTTPNode(),
            'email': EmailNode(),
            'database': DatabaseNode(),
        }
    
    def execute_step(self, step, instance, context):
        """Ejecuta un paso específico"""
        node = self.node_registry.get(step.step_type)
        if not node:
            raise ValueError(f"Unknown step type: {step.step_type}")
            
        try:
            result = node.execute(context, step.config)
            self.log_execution(instance, step, 'info', 'Step executed successfully', result)
            return result
        except Exception as e:
            self.log_execution(instance, step, 'error', str(e), {'error': str(e)})
            raise
    
    def log_execution(self, instance, step, level, message, data):
        """Registra la ejecución del paso"""
        InstanceLog.objects.create(
            instance=instance,
            step=step,
            level=level,
            message=message,
            data=data
        )
```

## Compilador de Flujos

### compiler.py

```python
class FlowCompiler:
    def compile_flow(self, flow):
        """Compila un flujo a formato ejecutable"""
        steps = self.parse_steps(flow.steps_data)
        transitions = self.build_transition_map(steps)
        
        return {
            'steps': steps,
            'transitions': transitions,
            'start_step': self.find_start_step(steps)
        }
    
    def validate_flow(self, flow):
        """Valida la estructura del flujo"""
        errors = []
        
        # Verificar que existe un nodo start
        if not self.has_start_node(flow.steps_data):
            errors.append("Flow must have a start node")
            
        # Verificar conectividad
        if not self.is_fully_connected(flow.steps_data):
            errors.append("All nodes must be connected")
            
        return errors
```

## Programador de Tareas

### scheduler.py

```python
class FlowScheduler:
    def schedule_resume(self, instance_id, resume_at):
        """Programa la reanudación de una instancia"""
        # Usar Celery o similar para programar tarea
        
    def process_delayed_instances(self):
        """Procesa instancias que deben reanudarse"""
        now = timezone.now()
        delayed_instances = InstanciaFlujo.objects.filter(
            status='paused',
            resume_at__lte=now
        )
        
        for instance in delayed_instances:
            self.resume_instance(instance)
    
    def resume_instance(self, instance):
        """Reanuda una instancia específica"""
        engine = FlowEngine()
        engine.resume_flow(instance.id)
```

## Runtime de Ejecución

### runtime.py

```python
class FlowRuntime:
    def __init__(self, instance):
        self.instance = instance
        self.context = instance.context
        self.flow = instance.flow
        
    def execute_next_step(self):
        """Ejecuta el siguiente paso en el flujo"""
        current_step = self.instance.current_step
        if not current_step:
            return self.complete_flow()
            
        executor = StepExecutor()
        result = executor.execute_step(current_step, self.instance, self.context)
        
        return self.handle_step_result(result)
    
    def handle_step_result(self, result):
        """Maneja el resultado de la ejecución de un paso"""
        status = result.get('status')
        
        if status == 'success':
            return self.move_to_next_step(result)
        elif status == 'waiting_input':
            return self.pause_for_input(result)
        elif status == 'delayed':
            return self.schedule_resume(result)
        elif status == 'error':
            return self.handle_error(result)
    
    def move_to_next_step(self, result):
        """Mueve la instancia al siguiente paso"""
        next_step = self.determine_next_step(result)
        self.instance.current_step = next_step
        self.instance.save()
        
        if next_step:
            return self.execute_next_step()
        else:
            return self.complete_flow()
```

## ViewSets y Endpoints

### FlowViewSet
```python
class FlowViewSet(viewsets.ModelViewSet):
    queryset = Flujo.objects.all()
    serializer_class = FlowSerializer
    
    @action(detail=True, methods=['post'])
    def start(self, request, pk=None):
        """Inicia una nueva instancia del flujo"""
        
    @action(detail=True, methods=['get'])
    def instances(self, request, pk=None):
        """Lista instancias del flujo"""
        
    @action(detail=True, methods=['post'])
    def validate(self, request, pk=None):
        """Valida la estructura del flujo"""
```

### InstanciaFlowViewSet
```python
class InstanciaFlowViewSet(viewsets.ModelViewSet):
    queryset = InstanciaFlujo.objects.all()
    serializer_class = InstanciaFlowSerializer
    
    @action(detail=True, methods=['post'])
    def resume(self, request, pk=None):
        """Reanuda una instancia pausada"""
        
    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        """Cancela una instancia"""
        
    @action(detail=True, methods=['get'])
    def logs(self, request, pk=None):
        """Obtiene logs de la instancia"""
```

### Endpoints Disponibles

| Método | URL | Descripción |
|--------|-----|-------------|
| GET | `/api/flows/` | Listar flujos |
| POST | `/api/flows/` | Crear flujo |
| GET | `/api/flows/{id}/` | Obtener flujo |
| PUT | `/api/flows/{id}/` | Actualizar flujo |
| DELETE | `/api/flows/{id}/` | Eliminar flujo |
| POST | `/api/flows/{id}/start/` | Iniciar instancia |
| POST | `/api/flows/{id}/validate/` | Validar flujo |
| GET | `/api/flows/{id}/instances/` | Listar instancias |
| GET | `/api/flows/instances/` | Listar todas las instancias |
| POST | `/api/flows/instances/{id}/resume/` | Reanudar instancia |
| POST | `/api/flows/instances/{id}/cancel/` | Cancelar instancia |
| GET | `/api/flows/instances/{id}/logs/` | Logs de instancia |

## Comandos de Gestión

### process_delays.py
```bash
python manage.py process_delays
```
- Procesa instancias con delays vencidos
- Reanuda flujos programados
- Limpia instancias obsoletas

## Integración con Frontend

### 1. Editor Visual de Flujos
```typescript
interface FlowNode {
  id: string
  type: 'start' | 'form' | 'condition' | 'delay' | 'http'
  position: { x: number, y: number }
  data: {
    label: string
    config: Record<string, any>
  }
}

interface FlowEdge {
  id: string
  source: string
  target: string
  label?: string
  condition?: string
}
```

### 2. Monitor de Ejecución
```typescript
interface FlowInstance {
  id: string
  flow: Flow
  status: 'pending' | 'running' | 'paused' | 'completed' | 'failed'
  current_step: Step | null
  progress: number
  logs: InstanceLog[]
}
```

### 3. Runtime de Formularios
```typescript
interface FormStep {
  id: string
  type: 'form'
  config: {
    fields: FormField[]
    validation: ValidationRules
    submit_label: string
  }
}
```

## Funcionalidades Avanzadas

### 1. Flujos Condicionales
- Evaluación de expresiones JavaScript
- Condiciones basadas en datos del legajo
- Ramificación dinámica del flujo

### 2. Integración con APIs Externas
- Nodos HTTP configurables
- Autenticación OAuth/API Key
- Transformación de datos

### 3. Notificaciones
- Emails automáticos
- Webhooks
- Notificaciones push

### 4. Paralelización
- Ejecución de pasos en paralelo
- Sincronización de ramas
- Agregación de resultados

## Monitoreo y Debugging

### 1. Logs Detallados
- Log por cada paso ejecutado
- Contexto completo en cada log
- Niveles de log configurables

### 2. Métricas
- Tiempo de ejecución por paso
- Tasa de éxito/fallo
- Cuellos de botella

### 3. Debugging
- Breakpoints en pasos
- Inspección de contexto
- Replay de ejecuciones

## Consideraciones de Rendimiento

### 1. Optimizaciones
- Ejecución asíncrona con Celery
- Cache de definiciones de flujo
- Batch processing de instancias

### 2. Escalabilidad
- Workers distribuidos
- Particionamiento de instancias
- Load balancing de ejecución

### 3. Límites
- Máximo 100 pasos por flujo
- Timeout de ejecución: 1 hora
- Máximo 1000 instancias concurrentes