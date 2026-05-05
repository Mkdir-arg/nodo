# 📘 SISTEMA DE FLUJOS - DOCUMENTACIÓN COMPLETA

## 🎯 Índice

1. [Introducción y Propósito](#1-introducción-y-propósito)
2. [Arquitectura del Sistema](#2-arquitectura-del-sistema)
3. [Tecnologías y Librerías](#3-tecnologías-y-librerías)
4. [Modelos de Base de Datos](#4-modelos-de-base-de-datos)
5. [Backend - Motor de Flujos](#5-backend---motor-de-flujos)
6. [Frontend - Editor Visual](#6-frontend---editor-visual)
7. [Tipos de Nodos](#7-tipos-de-nodos)
8. [Sistema de Condiciones](#8-sistema-de-condiciones)
9. [Runtime y Ejecución](#9-runtime-y-ejecución)
10. [Casos de Uso](#10-casos-de-uso)
11. [Guía de Desarrollo](#11-guía-de-desarrollo)

---

## 1. Introducción y Propósito

### 1.1 ¿Qué es el Sistema de Flujos?

El **Sistema de Flujos** (Flows) es un motor de automatización visual que permite crear, diseñar y ejecutar procesos de negocio complejos mediante una interfaz gráfica de arrastrar y soltar (drag & drop). Es similar a herramientas como Zapier, n8n, o Node-RED, pero integrado nativamente en el sistema NODO.

### 1.2 Propósito Principal

- **Automatizar procesos**: Eliminar tareas manuales repetitivas
- **Capturar datos**: Formularios dinámicos y evaluaciones con scoring
- **Tomar decisiones**: Bifurcaciones condicionales basadas en datos
- **Integrar sistemas**: Llamadas HTTP, emails, bases de datos
- **Gestionar tiempos**: Delays y pausas programadas
- **Auditar procesos**: Logs completos de cada ejecución

### 1.3 Casos de Uso Reales

1. **Proceso de Onboarding de Empleados**
   - Formulario de datos personales
   - Evaluación de conocimientos técnicos
   - Asignación automática de equipos según puntaje
   - Envío de emails de bienvenida
   - Creación de cuentas en sistemas externos

2. **Evaluación de Candidatos**
   - Selección de legajo desde tabla
   - Formulario de entrevista inicial
   - Evaluación técnica con scoring
   - Bifurcación: Aprobado → Email de felicitación / Rechazado → Email de agradecimiento
   - Actualización de estado en base de datos

3. **Seguimiento de Proyectos**
   - Formulario de inicio de proyecto
   - Delays para recordatorios periódicos
   - Evaluaciones de progreso
   - Notificaciones automáticas
   - Integración con APIs externas

---

## 2. Arquitectura del Sistema

### 2.1 Diagrama de Arquitectura General

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND (Next.js)                       │
│                                                                  │
│  ┌────────────────┐  ┌────────────────┐  ┌──────────────────┐ │
│  │  FlowEditor    │  │  FlowCanvas    │  │  StepForm        │ │
│  │  (Orquestador) │  │  (React Flow)  │  │  (Configuración) │ │
│  └────────────────┘  └────────────────┘  └──────────────────┘ │
│           │                   │                     │           │
│           └───────────────────┴─────────────────────┘           │
│                              │                                   │
│                    ┌─────────▼──────────┐                       │
│                    │   useFlowStore     │                       │
│                    │   (Zustand State)  │                       │
│                    └─────────┬──────────┘                       │
│                              │                                   │
└──────────────────────────────┼───────────────────────────────────┘
                               │ HTTP/REST API
                               │
┌──────────────────────────────▼───────────────────────────────────┐
│                        BACKEND (Django)                          │
│                                                                  │
│  ┌────────────────┐  ┌────────────────┐  ┌──────────────────┐ │
│  │  FlowViewSet   │  │  Serializers   │  │  Models          │ │
│  │  (API Views)   │  │  (Validation)  │  │  (Database)      │ │
│  └────────┬───────┘  └────────┬───────┘  └──────┬───────────┘ │
│           │                   │                  │              │
│           └───────────────────┴──────────────────┘              │
│                              │                                   │
│           ┌──────────────────▼──────────────────┐              │
│           │        FLOW ENGINE                   │              │
│           │  ┌────────────┐  ┌────────────────┐ │              │
│           │  │  Runtime   │  │  Executor      │ │              │
│           │  │  (Render)  │  │  (Actions)     │ │              │
│           │  └────────────┘  └────────────────┘ │              │
│           │  ┌────────────┐  ┌────────────────┐ │              │
│           │  │  Nodes     │  │  Scheduler     │ │              │
│           │  │  (Types)   │  │  (Delays)      │ │              │
│           │  └────────────┘  └────────────────┘ │              │
│           └─────────────────────────────────────┘              │
│                              │                                   │
└──────────────────────────────┼───────────────────────────────────┘
                               │
                    ┌──────────▼──────────┐
                    │   MySQL Database    │
                    │   - flows_flujo     │
                    │   - flows_step      │
                    │   - flows_transition│
                    │   - flows_instancia │
                    └─────────────────────┘
```

### 2.2 Flujo de Datos

#### 2.2.1 Creación de Flujo

```
Usuario → FlowEditor → useFlowStore → API POST /api/flows/
                                           ↓
                                    FlujoSerializer
                                           ↓
                                    _sync_flow_structure()
                                           ↓
                                    Crea Steps + Transitions
                                           ↓
                                    Guarda en MySQL
```

#### 2.2.2 Ejecución de Flujo

```
Usuario → StartTableModal → API POST /api/flows/{id}/start/
                                           ↓
                                    create_instance_from_legajo()
                                           ↓
                                    InstanciaFlujo (status='running')
                                           ↓
                                    FlowRuntime.get_current_step_html()
                                           ↓
                                    Usuario interactúa (formulario/evaluación)
                                           ↓
                                    API POST /api/flows/instances/{id}/interact/
                                           ↓
                                    FlowRuntime.process_interaction()
                                           ↓
                                    Ejecuta nodo actual (FormNode, EvaluationNode, etc.)
                                           ↓
                                    Actualiza contexto
                                           ↓
                                    Determina siguiente paso
                                           ↓
                                    Repite hasta completar o fallar
```

### 2.3 Componentes Principales

#### Backend
- **models.py**: Definición de tablas (Flujo, Step, Transition, InstanciaFlujo)
- **serializers.py**: Validación y transformación de datos
- **runtime.py**: Motor de ejecución de instancias
- **nodes.py**: Clases de nodos (StartNode, FormNode, EvaluationNode, etc.)
- **executor.py**: Ejecutor de acciones (email, HTTP, delays)
- **scheduler.py**: Procesamiento de delays pendientes
- **compiler.py**: Compilación de plantillas a flujos

#### Frontend
- **FlowEditor.tsx**: Componente principal del editor
- **FlowCanvas.tsx**: Canvas visual con React Flow
- **StepForm.tsx**: Formulario de configuración de pasos
- **ConditionConfigEditor.tsx**: Editor de condiciones complejas
- **FormConfigEditor.tsx**: Editor de formularios
- **EvaluationConfigEditor.tsx**: Editor de evaluaciones
- **FlowRuntime.tsx**: Renderizador de flujos en ejecución
- **useFlowStore.ts**: Estado global con Zustand

---

## 3. Tecnologías y Librerías

### 3.1 Backend (Django)

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| **Django** | 4.x | Framework web principal |
| **Django REST Framework** | 3.x | API REST |
| **MySQL** | 8.0 | Base de datos relacional |
| **Redis** | 7.x | Caché y sesiones |
| **Python** | 3.11 | Lenguaje de programación |

#### Librerías Python Clave

```python
# requirements.txt (extracto relevante)
django==4.2.x
djangorestframework==3.14.x
mysqlclient==2.2.x
redis==5.0.x
requests==2.31.x  # Para nodos HTTP
celery==5.3.x     # Para tareas asíncronas (opcional)
```

### 3.2 Frontend (Next.js)

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| **Next.js** | 14.2.32 | Framework React con SSR |
| **React** | 18.3.1 | Librería UI |
| **TypeScript** | 5.9.3 | Tipado estático |
| **React Flow** | 11.x | Editor visual de grafos |
| **Zustand** | 4.x | Gestión de estado |
| **TanStack Query** | 5.x | Gestión de datos asíncronos |
| **TailwindCSS** | 3.4 | Estilos CSS |

#### Librerías NPM Clave

```json
{
  "dependencies": {
    "reactflow": "^11.10.0",
    "zustand": "^4.5.0",
    "@tanstack/react-query": "^5.0.0",
    "lucide-react": "^0.300.0",
    "next": "14.2.32",
    "react": "^18.3.1",
    "typescript": "^5.9.3"
  }
}
```

### 3.3 React Flow - Librería Principal del Canvas

**React Flow** es la librería central para el editor visual. Proporciona:

- **Nodos personalizables**: Componentes React como nodos
- **Conexiones interactivas**: Arrastrar para conectar nodos
- **Zoom y pan**: Navegación fluida del canvas
- **Layouts automáticos**: Posicionamiento inteligente
- **Minimap y controles**: Navegación mejorada

**Instalación:**
```bash
npm install reactflow
```

**Uso básico:**
```tsx
import ReactFlow, { Node, Edge } from 'reactflow';
import 'reactflow/dist/style.css';

const nodes: Node[] = [
  { id: '1', position: { x: 0, y: 0 }, data: { label: 'Inicio' } }
];

const edges: Edge[] = [];

function FlowCanvas() {
  return (
    <ReactFlow nodes={nodes} edges={edges} />
  );
}
```

---

## 4. Modelos de Base de Datos

### 4.1 Tabla: `flows_flujo`

Almacena la definición de flujos.

```python
class Flujo(models.Model):
    STATUS_CHOICES = [
        ('draft', 'Borrador'),
        ('published', 'Publicado'),
        ('archived', 'Archivado'),
    ]
    
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=255)
    slug = models.SlugField(unique=True, blank=True)
    description = models.TextField(blank=True, null=True)
    steps_data = models.JSONField(default=list)  # JSON con estructura del flujo
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    created_by = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)
```

**Campos clave:**
- `steps_data`: JSON con la estructura completa del flujo (legacy, ahora se usa tabla Step)
- `slug`: Identificador único para URLs amigables
- `status`: Estado del flujo (borrador, publicado, archivado)

**Ejemplo de `steps_data`:**
```json
[
  {
    "id": "uuid-1",
    "name": "Inicio",
    "type": "start",
    "config": {
      "acceptedPlantillas": ["uuid-plantilla-1"],
      "tableColumns": [...]
    },
    "position": { "x": 100, "y": 100 }
  },
  {
    "id": "uuid-2",
    "name": "Formulario de Datos",
    "type": "form",
    "config": {
      "title": "Datos Personales",
      "fields": [...]
    },
    "position": { "x": 400, "y": 100 },
    "nextStepId": "uuid-3"
  }
]
```

### 4.2 Tabla: `flows_step`

Almacena los pasos individuales de un flujo (formato nuevo).

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
    flow = models.ForeignKey(Flujo, on_delete=models.CASCADE, related_name='flow_steps')
    step_type = models.CharField(max_length=20, choices=STEP_TYPES)
    name = models.CharField(max_length=255)
    config = models.JSONField(default=dict)  # Configuración específica del tipo
    ui_metadata = models.JSONField(default=dict)  # Posición, estilo, etc.
    order = models.PositiveIntegerField(default=0)
```

**Campos clave:**
- `step_type`: Tipo de nodo (start, form, evaluation, etc.)
- `config`: Configuración específica del nodo (campos de formulario, preguntas, etc.)
- `ui_metadata`: Metadatos de UI (posición en el canvas)
- `order`: Orden de ejecución

### 4.3 Tabla: `flows_transition`

Define las conexiones entre pasos.

```python
class Transition(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    from_step = models.ForeignKey(Step, on_delete=models.CASCADE, related_name='outgoing_transitions')
    to_step = models.ForeignKey(Step, on_delete=models.CASCADE, related_name='incoming_transitions')
    label = models.CharField(max_length=255, blank=True)
    condition = models.TextField(blank=True)  # Para nodos de condición
```

**Campos clave:**
- `from_step`: Paso origen
- `to_step`: Paso destino
- `condition`: ID de rama para nodos de condición (ej: "branch_1" o "__fallback__")

### 4.4 Tabla: `flows_instanciaflujo`

Almacena las ejecuciones de flujos.

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
    flow = models.ForeignKey(Flujo, on_delete=models.CASCADE, related_name='instances')
    legajo_id = models.UUIDField()  # Referencia al legajo
    current_step = models.ForeignKey(Step, on_delete=models.SET_NULL, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    context = models.JSONField(default=dict)  # Datos capturados durante la ejecución
    resume_at = models.DateTimeField(null=True, blank=True)  # Para delays
    error_message = models.TextField(blank=True, null=True)
    started_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE)
```

**Campos clave:**
- `context`: JSON con todos los datos capturados (formularios, evaluaciones, variables)
- `current_step`: Paso actual en ejecución
- `resume_at`: Timestamp para reanudar después de un delay

**Ejemplo de `context`:**
```json
{
  "variables": {
    "legajo_id": "uuid-legajo-1"
  },
  "forms": {
    "step_uuid-2": {
      "data": {
        "nombre": "Juan Pérez",
        "email": "juan@example.com"
      },
      "timestamp": "2024-01-15T10:30:00Z"
    }
  },
  "evaluations": {
    "step_uuid-3": {
      "total_score": 85,
      "category": "Aprobado",
      "answers": {
        "q1": { "selected": "opt2", "score": 10 }
      }
    }
  }
}
```

### 4.5 Tabla: `flows_instancelog`

Logs de auditoría de cada instancia.

```python
class InstanceLog(models.Model):
    LEVEL_CHOICES = [
        ('info', 'Info'),
        ('warning', 'Warning'),
        ('error', 'Error'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    instance = models.ForeignKey(InstanciaFlujo, on_delete=models.CASCADE, related_name='logs')
    step = models.ForeignKey(Step, on_delete=models.SET_NULL, null=True)
    level = models.CharField(max_length=10, choices=LEVEL_CHOICES, default='info')
    message = models.TextField()
    data = models.JSONField(default=dict)
    timestamp = models.DateTimeField(auto_now_add=True)
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
```

---

## 5. Backend - Motor de Flujos

### 5.1 Archivo: `flows/runtime.py`

Este es el **corazón del motor de ejecución**. La clase `FlowRuntime` maneja:

1. **Renderizado de pasos**: Genera HTML o JSON para el frontend
2. **Procesamiento de interacciones**: Captura datos del usuario
3. **Navegación**: Determina el siguiente paso
4. **Evaluación de condiciones**: Bifurcaciones lógicas
5. **Gestión de contexto**: Almacena datos entre pasos

#### 5.1.1 Clase Principal: `FlowRuntime`

```python
class FlowRuntime:
    """Runtime para ejecutar instancias de flujo"""
    
    NODE_CLASSES = {
        'start': StartNode,
        'form': FormNode,
        'evaluation': EvaluationNode,
        'email': EmailNode,
        'http': HttpNode,
        'delay': DelayNode,
        'condition': ConditionNode,
        'database': DatabaseNode,
        'transform': TransformNode,
    }
    
    def __init__(self, instance: InstanciaFlujo):
        self.instance = instance
        self.flow = instance.flow
```

#### 5.1.2 Método: `get_current_step_html()`

Genera la representación del paso actual para el frontend.

```python
def get_current_step_html(self):
    """Obtiene el HTML/JSON del paso actual"""
    
    if not self.instance.current_step:
        # Auto-asignar primer paso si no existe
        ordered_steps = list(self.flow.flow_steps.order_by('order'))
        if ordered_steps:
            self.instance.current_step = ordered_steps[1]  # Saltar Start
            self.instance.status = 'running'
            self.instance.save()
    
    step_type = self.instance.current_step.step_type
    
    # Para formularios, devolver estructura JSON
    if step_type == 'form':
        return self._get_form_data()
    
    # Para evaluaciones, devolver estructura JSON
    if step_type == 'evaluation':
        return self._get_evaluation_data()
    
    # Para otros tipos, usar clase de nodo
    node_class = self.NODE_CLASSES.get(step_type)
    if node_class:
        node = node_class(self.instance.current_step, self.instance.context)
        html = node.render_html()
        return self._sanitize_html(html)
    
    return {'error': 'Tipo de nodo no soportado'}
```

#### 5.1.3 Método: `process_interaction()`

Procesa la interacción del usuario y avanza el flujo.

```python
@transaction.atomic
def process_interaction(self, interaction_data, user):
    """Procesa la interacción del usuario y avanza el flujo"""
    try:
        step_type = self.instance.current_step.step_type
        
        # Procesar según tipo de paso
        if step_type == 'form':
            return self._process_form_interaction(interaction_data, user)
        elif step_type == 'evaluation':
            return self._process_evaluation_interaction(interaction_data, user)
        elif step_type == 'condition':
            return self._process_condition_interaction(interaction_data, user)
        else:
            # Otros tipos de nodo
            node_class = self.NODE_CLASSES.get(step_type)
            node = node_class(self.instance.current_step, self.instance.context)
            result = node.execute(interaction_data, user)
            
            # Actualizar contexto
            if result.get('context_updates'):
                self._update_context(result['context_updates'])
            
            # Determinar siguiente paso
            next_step = self._determine_next_step(result)
            
            if next_step:
                self.instance.current_step = next_step
                self.instance.status = 'running'
            else:
                self.instance.status = 'completed'
                self.instance.completed_at = timezone.now()
            
            self.instance.save()
            
            return {
                'success': True,
                'next_step_id': str(next_step.id) if next_step else None,
                'completed': self.instance.status == 'completed'
            }
    
    except Exception as e:
        self.instance.status = 'failed'
        self.instance.error_message = str(e)
        self.instance.save()
        
        self._log('error', f'Error en ejecución: {str(e)}', {'error': str(e)}, user)
        
        return {
            'success': False,
            'error': str(e)
        }
```


#### 5.1.4 Método: `_process_form_interaction()`

Procesa específicamente formularios.

```python
def _process_form_interaction(self, form_data, user):
    """Procesa específicamente interacciones de formulario"""
    step_id = str(self.instance.current_step.id)
    
    # Guardar datos del formulario en el contexto
    if 'forms' not in self.instance.context:
        self.instance.context['forms'] = {}
    
    self.instance.context['forms'][f'step_{step_id}'] = {
        'data': form_data,
        'timestamp': timezone.now().isoformat(),
        'user_id': user.id if user and hasattr(user, 'id') else None
    }
    
    # Log de datos guardados
    self._log('info', f'Datos de formulario guardados en step_{step_id}', 
             {'form_data': form_data}, user)
    
    # Buscar siguiente paso
    transitions = self.instance.current_step.outgoing_transitions.all()
    next_step = transitions.first().to_step if transitions else None
    
    if next_step:
        self.instance.current_step = next_step
        self.instance.status = 'running'
    else:
        self.instance.status = 'completed'
        self.instance.completed_at = timezone.now()
    
    self.instance.save()
    
    return {
        'success': True,
        'next_step_id': str(next_step.id) if next_step else None,
        'completed': self.instance.status == 'completed'
    }
```

#### 5.1.5 Método: `_select_condition_branch()`

Selecciona la rama de condición apropiada.

```python
def _select_condition_branch(self):
    """Selecciona la rama de condición apropiada basada en reglas"""
    current_step = self.instance.current_step
    config = current_step.config or {}
    branches = config.get('branches', [])
    
    # Evaluar cada rama
    for branch in branches:
        branch_id = branch.get('id')
        if self._evaluate_branch_rules(branch):
            # Buscar transición correspondiente
            transition = current_step.outgoing_transitions.filter(
                condition=branch_id
            ).first()
            if transition:
                return transition.to_step
    
    # Fallback
    fallback_transition = current_step.outgoing_transitions.filter(
        condition='__fallback__'
    ).first()
    if fallback_transition:
        return fallback_transition.to_step
    
    return None

def _evaluate_branch_rules(self, branch):
    """Evalúa las reglas de una rama específica"""
    rules = branch.get('rules', [])
    logic = branch.get('logic', 'AND').upper()
    
    if not rules:
        return False
    
    results = []
    for rule in rules:
        result = self._evaluate_single_rule(rule)
        results.append(result)
    
    # Aplicar lógica AND/OR
    if logic == 'OR':
        return any(results)
    else:  # AND por defecto
        return all(results)

def _evaluate_single_rule(self, rule):
    """Evalúa una regla individual"""
    source = rule.get('source')  # 'form' o 'evaluation'
    field = rule.get('field')
    operator = rule.get('operator')
    expected_value = rule.get('value')
    
    # Obtener valor actual del contexto
    actual_value = self._get_context_value(source, field)
    
    return self._compare_values(actual_value, operator, expected_value)
```

### 5.2 Archivo: `flows/nodes.py`

Define las clases de nodos que renderizan HTML y ejecutan lógica.

#### 5.2.1 Clase Base: `BaseNode`

```python
class BaseNode:
    """Clase base para todos los nodos"""
    
    def __init__(self, step, context):
        self.step = step
        self.context = context
        self.config = step.config
    
    def render_html(self):
        """Renderiza el HTML del nodo"""
        raise NotImplementedError
    
    def execute(self, interaction_data, user):
        """Ejecuta la lógica del nodo"""
        raise NotImplementedError
    
    def validate_input(self, data):
        """Valida los datos de entrada"""
        return True
```

#### 5.2.2 Clase: `FormNode`

```python
class FormNode(BaseNode):
    """Nodo de formulario para captura de datos"""
    
    def render_html(self):
        title = self.config.get('title', 'Formulario')
        description = self.config.get('description', '')
        fields = self.config.get('fields', [])
        
        html = f'''
        <div class="form-node">
            <h2>{escape(title)}</h2>
            {f'<p>{escape(description)}</p>' if description else ''}
            <form class="space-y-4">
        '''
        
        for field in fields:
            html += self._render_field(field)
        
        html += '''
                <button type="submit">Continuar</button>
            </form>
        </div>
        '''
        
        return html
    
    def _render_field(self, field):
        field_type = field.get('type', 'text')
        name = field.get('name', '')
        label = field.get('label', '')
        required = field.get('required', False)
        
        # Obtener valor previo del contexto
        form_data = self.context.get('forms', {})
        value = form_data.get(name, '')
        
        if field_type == 'text':
            return f'''
            <div>
                <label>{escape(label)}</label>
                <input type="text" name="{escape(name)}" 
                       value="{escape(str(value))}" 
                       {'required' if required else ''}>
            </div>
            '''
        elif field_type == 'select':
            options = field.get('options', [])
            html = f'<label>{escape(label)}</label>'
            html += f'<select name="{escape(name)}">'
            for option in options:
                selected = 'selected' if str(option['value']) == str(value) else ''
                html += f'<option value="{escape(str(option["value"]))}" {selected}>'
                html += f'{escape(option["label"])}</option>'
            html += '</select>'
            return html
        
        # ... más tipos de campo
```

#### 5.2.3 Clase: `EvaluationNode`

```python
class EvaluationNode(BaseNode):
    """Nodo de evaluación con preguntas y scoring"""
    
    def execute(self, interaction_data, user):
        questions = self.config.get('questions', [])
        scoring_ranges = self.config.get('scoring_ranges', [])
        
        total_score = 0
        answers = {}
        
        # Calcular puntaje
        for question in questions:
            question_id = question.get('id')
            weight = question.get('weight', 1)
            question_type = question.get('type', 'single_choice')
            
            if question_type == 'single_choice':
                selected_option = interaction_data.get(question_id)
                if selected_option:
                    for option in question.get('options', []):
                        if option.get('id') == selected_option:
                            score = option.get('score', 0) * weight
                            total_score += score
                            answers[question_id] = {
                                'selected': selected_option,
                                'score': score
                            }
                            break
        
        # Determinar categoría y siguiente paso
        next_step_id = None
        category = 'default'
        
        for score_range in scoring_ranges:
            min_score = score_range.get('min_score', 0)
            max_score = score_range.get('max_score', float('inf'))
            
            if min_score <= total_score <= max_score:
                category = score_range.get('category', 'default')
                next_step_id = score_range.get('next_step_id')
                break
        
        evaluation_result = {
            'total_score': total_score,
            'category': category,
            'answers': answers,
            'timestamp': timezone.now().isoformat()
        }
        
        result = {
            'context_updates': {
                'evaluations': {self.step.name: evaluation_result}
            }
        }
        
        if next_step_id:
            result['next_step_id'] = next_step_id
        
        return result
```

### 5.3 Archivo: `flows/serializers.py`

Maneja la validación y sincronización de flujos.

#### 5.3.1 Clase: `FlujoSerializer`

```python
class FlujoSerializer(serializers.ModelSerializer):
    steps = serializers.SerializerMethodField()
    steps_data = serializers.JSONField(required=False, allow_null=True)

    class Meta:
        model = Flujo
        fields = ['id', 'name', 'description', 'steps', 'steps_data', 
                  'created_at', 'updated_at', 'is_active']

    def _sync_flow_structure(self, flow: Flujo, steps_data):
        """Sincroniza la estructura del flujo con las tablas Step y Transition"""
        steps_data = steps_data or []
        
        # Validar estructura
        self._validate_flow_structure(steps_data)

        # Limpiar steps existentes
        flow.flow_steps.all().delete()

        step_lookup = {}
        
        # Primera pasada: crear Steps
        for index, raw_step in enumerate(steps_data):
            step_uuid = uuid.UUID(str(raw_step.get('id'))) if raw_step.get('id') else uuid.uuid4()
            
            step_instance = Step.objects.create(
                id=step_uuid,
                flow=flow,
                step_type=raw_step.get('type') or 'form',
                name=raw_step.get('name') or f'Paso {index + 1}',
                config={},
                ui_metadata={'position': raw_step.get('position')},
                order=index,
            )
            
            step_lookup[str(raw_step.get('id'))] = step_instance
        
        # Segunda pasada: actualizar configs y crear Transitions
        for raw_step in steps_data:
            step_instance = step_lookup.get(str(raw_step.get('id')))
            if not step_instance:
                continue
            
            step_type = step_instance.step_type
            raw_config = raw_step.get('config') or {}
            
            if step_type == 'condition':
                # Procesar ramas de condición
                normalized_branches = []
                for branch in raw_config.get('branches') or []:
                    branch_id = branch.get('id') or str(uuid.uuid4())
                    target_step = step_lookup.get(str(branch.get('nextStepId')))
                    
                    normalized_branches.append({
                        'id': branch_id,
                        'label': branch.get('label'),
                        'logic': branch.get('logic', 'AND'),
                        'rules': branch.get('rules') or [],
                        'nextStepId': str(target_step.id) if target_step else None,
                    })
                    
                    if target_step:
                        Transition.objects.create(
                            from_step=step_instance,
                            to_step=target_step,
                            label=branch.get('label'),
                            condition=branch_id,
                        )
                
                # Fallback
                fallback_step = step_lookup.get(str(raw_config.get('fallbackNextStepId')))
                if fallback_step:
                    Transition.objects.create(
                        from_step=step_instance,
                        to_step=fallback_step,
                        label='Fallback',
                        condition='__fallback__',
                    )
                
                step_instance.config = {
                    'branches': normalized_branches,
                    'fallbackNextStepId': str(fallback_step.id) if fallback_step else None,
                }
            else:
                # Paso regular
                next_step = step_lookup.get(str(raw_step.get('nextStepId')))
                if next_step:
                    Transition.objects.create(
                        from_step=step_instance,
                        to_step=next_step,
                        label='',
                    )
                step_instance.config = raw_config
            
            step_instance.save(update_fields=['config'])
```

---

## 6. Frontend - Editor Visual

### 6.1 Componente: `FlowEditor.tsx`

Componente principal que orquesta todo el editor.

```tsx
export default function FlowEditor({ flowId, isNew = false }: FlowEditorProps) {
  const router = useRouter();
  const { flows, currentFlow, setCurrentFlow, addFlow, updateFlow } = useFlowStore();
  
  const [editingStep, setEditingStep] = useState<FlowStep | null>(null);
  const [showStepForm, setShowStepForm] = useState(false);
  const [flowData, setFlowData] = useState({
    name: '',
    description: '',
  });

  // Cargar flujo existente
  useEffect(() => {
    if (!isNew && flowId) {
      const flow = flows?.find(f => String(f.id) === String(flowId));
      if (flow) {
        setCurrentFlow(flow);
        setFlowData({ name: flow.name, description: flow.description || '' });
      }
    }
  }, [flowId, isNew, flows, setCurrentFlow]);

  const handleSave = async () => {
    const validationErrors = validateFlowForSave();
    
    if (validationErrors.length > 0) {
      alert(`Errores: ${validationErrors.join(', ')}`);
      return;
    }

    try {
      if (isNew) {
        await addFlow({
          name: flowData.name,
          description: flowData.description,
          steps: currentFlow.steps,
        });
      } else if (flowId && currentFlow) {
        await updateFlow(flowId, {
          name: flowData.name,
          description: flowData.description,
          steps: currentFlow.steps,
        });
      }
      
      router.push('/flujos');
    } catch (error) {
      console.error('Error al guardar:', error);
      alert('Error al guardar el flujo');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-8">
        <h1 className="text-3xl font-bold text-white">
          {isNew ? '🚀 Crear Nuevo Flujo' : '✏️ Editar Flujo'}
        </h1>
      </div>

      {/* Configuración básica */}
      <Card className="p-8">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <Label>Nombre del Flujo</Label>
            <Input
              value={flowData.name}
              onChange={(e) => setFlowData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Proceso de Onboarding"
            />
          </div>
          <div>
            <Label>Descripción</Label>
            <Textarea
              value={flowData.description}
              onChange={(e) => setFlowData(prev => ({ ...prev, description: e.target.value }))}
            />
          </div>
        </div>
      </Card>

      {/* Canvas visual */}
      <Card>
        <FlowCanvas
          steps={currentFlow?.steps || []}
          onAddStep={handleAddStep}
          onEditStep={handleEditStep}
          onDeleteStep={handleDeleteStep}
          onConnectSteps={handleConnectSteps}
          onUpdatePositions={handleUpdatePositions}
        />
      </Card>

      {/* Modal de configuración de paso */}
      {showStepForm && (
        <StepForm
          step={editingStep}
          onSubmit={handleStepSubmit}
          onCancel={handleStepCancel}
          existingSteps={currentFlow?.steps || []}
        />
      )}
    </div>
  );
}
```

### 6.2 Componente: `FlowCanvas.tsx`

Canvas visual usando React Flow.

```tsx
export default function FlowCanvas({ 
  steps, 
  onAddStep, 
  onEditStep, 
  onDeleteStep,
  onConnectSteps,
  onUpdatePositions 
}: FlowCanvasProps) {
  
  // Convertir steps a nodos de React Flow
  const initialNodes: Node[] = useMemo(() => {
    return steps.map((step, index) => ({
      id: step.id,
      position: step.position || { x: 100 + index * 250, y: 100 },
      data: { 
        label: step.name,
        type: step.type,
        step,
        onEdit: onEditStep,
        onDelete: onDeleteStep
      },
      type: 'custom',
      draggable: true
    }));
  }, [steps, onEditStep, onDeleteStep]);

  // Convertir conexiones a edges
  const initialEdges: Edge[] = useMemo(() => {
    const edges: Edge[] = [];

    steps.forEach(step => {
      // Conexión regular
      if (step.nextStepId) {
        edges.push({
          id: `${step.id}-${step.nextStepId}`,
          source: step.id,
          target: step.nextStepId,
          type: 'smoothstep',
          animated: true,
          style: { stroke: '#6366f1', strokeWidth: 3 }
        });
      }

      // Conexiones de condición
      if (step.type === 'condition') {
        const targets = getConditionTargets(step);
        targets.forEach(target => {
          const color = target.kind === 'fallback' ? '#64748b' : '#f97316';
          edges.push({
            id: `${step.id}-${target.id}-${target.targetId}`,
            source: step.id,
            target: target.targetId,
            type: 'smoothstep',
            animated: true,
            style: { stroke: color, strokeWidth: 3 },
            label: target.label
          });
        });
      }
    });
    
    return edges;
  }, [steps]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback((params: Connection) => {
    if (params.source && params.target) {
      onConnectSteps(params.source, params.target);
    }
  }, [onConnectSteps]);

  return (
    <div className="w-full h-[500px]">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
      >
        <Background variant="dots" gap={20} size={1} />
        <Controls />
      </ReactFlow>
      
      <Button onClick={onAddStep}>
        <Plus className="h-4 w-4 mr-2" />
        Agregar Paso
      </Button>
    </div>
  );
}
```

### 6.3 Nodo Personalizado

```tsx
function CustomNode({ data }: { data: any }) {
  const getNodeIcon = (type: string) => {
    switch (type) {
      case 'start': return <Play className="h-4 w-4" />;
      case 'form': return <FileText className="h-4 w-4" />;
      case 'evaluation': return <CheckSquare className="h-4 w-4" />;
      case 'email': return <Mail className="h-4 w-4" />;
      case 'condition': return <GitBranch className="h-4 w-4" />;
      default: return <Plus className="h-4 w-4" />;
    }
  };

  const getNodeColor = (type: string) => {
    switch (type) {
      case 'start': return 'border-green-500 bg-green-50';
      case 'form': return 'border-blue-500 bg-blue-50';
      case 'evaluation': return 'border-purple-500 bg-purple-50';
      case 'condition': return 'border-orange-500 bg-orange-50';
      default: return 'border-gray-500 bg-gray-50';
    }
  };

  return (
    <div className={`px-4 py-3 shadow-lg rounded-xl border-2 ${getNodeColor(data.type)}`}>
      <Handle type="target" position={Position.Top} className="w-3 h-3" />
      
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg">
          {getNodeIcon(data.type)}
        </div>
        <div>
          <div className="font-semibold text-sm">{data.label}</div>
          <div className="text-xs text-gray-500">{data.type}</div>
        </div>
      </div>
      
      <div className="flex gap-1 mt-2">
        <button onClick={() => data.onEdit(data.step)}>
          <Edit className="h-3 w-3" />
        </button>
        <button onClick={() => data.onDelete(data.step.id)}>
          <Trash2 className="h-3 w-3" />
        </button>
      </div>
      
      <Handle type="source" position={Position.Bottom} className="w-3 h-3" />
    </div>
  );
}
```


## 7. Tipos de Nodos

### 7.1 Nodo START (Inicio)

**Propósito**: Punto de entrada del flujo. Muestra una tabla de legajos candidatos para iniciar el proceso.

**Configuración:**
```typescript
interface StartConfig {
  acceptedPlantillas: string[];  // IDs de plantillas aceptadas
  tableColumns: TableCol[];      // Columnas a mostrar en la tabla
  defaultFilters: Record<string, unknown>;
  defaultSort: { key: string; dir: 'asc' | 'desc' };
  pageSize: number;
}
```

**Ejemplo de uso:**
```json
{
  "type": "start",
  "name": "Seleccionar Candidato",
  "config": {
    "acceptedPlantillas": ["uuid-plantilla-empleados"],
    "tableColumns": [
      { "key": "nombre", "label": "Nombre" },
      { "key": "email", "label": "Email" },
      { "key": "estado", "label": "Estado" }
    ],
    "defaultSort": { "key": "created_at", "dir": "desc" },
    "pageSize": 10
  }
}
```

**Renderizado:**
- Muestra tabla con legajos filtrados por plantilla
- Botón "Iniciar Proceso" por cada fila
- Al hacer clic, crea una `InstanciaFlujo` y avanza al siguiente paso

### 7.2 Nodo FORM (Formulario)

**Propósito**: Captura datos del usuario mediante campos configurables.

**Configuración:**
```typescript
interface FormConfig {
  title: string;
  description?: string;
  fields: FormField[];
}

interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'number' | 'date' | 'select' | 'checkbox' | 'textarea';
  required: boolean;
  placeholder?: string;
  help_text?: string;
  options?: Array<{value: string; label: string}>;
}
```

**Ejemplo de uso:**
```json
{
  "type": "form",
  "name": "Datos Personales",
  "config": {
    "title": "Información del Candidato",
    "description": "Complete los siguientes campos",
    "fields": [
      {
        "name": "nombre_completo",
        "label": "Nombre Completo",
        "type": "text",
        "required": true,
        "placeholder": "Juan Pérez"
      },
      {
        "name": "email",
        "label": "Correo Electrónico",
        "type": "email",
        "required": true
      },
      {
        "name": "experiencia",
        "label": "Años de Experiencia",
        "type": "number",
        "required": true
      },
      {
        "name": "nivel",
        "label": "Nivel",
        "type": "select",
        "required": true,
        "options": [
          { "value": "junior", "label": "Junior" },
          { "value": "semi-senior", "label": "Semi-Senior" },
          { "value": "senior", "label": "Senior" }
        ]
      }
    ]
  }
}
```

**Almacenamiento:**
Los datos se guardan en `context.forms.step_{step_id}.data`:
```json
{
  "forms": {
    "step_uuid-123": {
      "data": {
        "nombre_completo": "Juan Pérez",
        "email": "juan@example.com",
        "experiencia": 5,
        "nivel": "senior"
      },
      "timestamp": "2024-01-15T10:30:00Z",
      "user_id": 1
    }
  }
}
```

### 7.3 Nodo EVALUATION (Evaluación)

**Propósito**: Preguntas con puntaje automático y bifurcación basada en resultados.

**Configuración:**
```typescript
interface EvaluationConfig {
  title: string;
  description?: string;
  questions: EvaluationQuestion[];
  scoring_ranges: Array<{
    min_score: number;
    max_score: number;
    category: string;
    next_step_id?: string;
  }>;
}

interface EvaluationQuestion {
  id: string;
  text: string;
  type: 'single_choice' | 'multiple_choice';
  weight: number;
  options: Array<{
    id: string;
    text: string;
    score: number;
  }>;
}
```

**Ejemplo de uso:**
```json
{
  "type": "evaluation",
  "name": "Evaluación Técnica",
  "config": {
    "title": "Conocimientos de JavaScript",
    "questions": [
      {
        "id": "q1",
        "text": "¿Qué es una closure en JavaScript?",
        "type": "single_choice",
        "weight": 2,
        "options": [
          { "id": "a", "text": "Una función dentro de otra función", "score": 10 },
          { "id": "b", "text": "Un tipo de variable", "score": 0 },
          { "id": "c", "text": "Un método de array", "score": 0 }
        ]
      },
      {
        "id": "q2",
        "text": "¿Cuál es la diferencia entre let y var?",
        "type": "single_choice",
        "weight": 1,
        "options": [
          { "id": "a", "text": "Scope de bloque vs función", "score": 5 },
          { "id": "b", "text": "No hay diferencia", "score": 0 }
        ]
      }
    ],
    "scoring_ranges": [
      { "min_score": 0, "max_score": 10, "category": "Bajo", "next_step_id": "uuid-rechazado" },
      { "min_score": 11, "max_score": 20, "category": "Medio", "next_step_id": "uuid-entrevista" },
      { "min_score": 21, "max_score": 30, "category": "Alto", "next_step_id": "uuid-aprobado" }
    ]
  }
}
```

**Cálculo de puntaje:**
```
Puntaje Total = Σ (score_opción_seleccionada × weight_pregunta)

Ejemplo:
- Pregunta 1: Opción A (10 puntos) × peso 2 = 20 puntos
- Pregunta 2: Opción A (5 puntos) × peso 1 = 5 puntos
- Total: 25 puntos → Categoría "Alto"
```

**Almacenamiento:**
```json
{
  "evaluations": {
    "step_uuid-456": {
      "total_score": 25,
      "category": "Alto",
      "answers": {
        "q1": { "selected": "a", "score": 20 },
        "q2": { "selected": "a", "score": 5 }
      },
      "timestamp": "2024-01-15T10:35:00Z"
    }
  }
}
```

### 7.4 Nodo CONDITION (Condición)

**Propósito**: Bifurcación del flujo basada en reglas lógicas.

**Configuración:**
```typescript
interface ConditionConfig {
  branches: ConditionBranch[];
  fallbackNextStepId?: string;
}

interface ConditionBranch {
  id: string;
  label: string;
  logic: 'AND' | 'OR';
  rules: ConditionRule[];
  nextStepId?: string;
}

interface ConditionRule {
  id: string;
  source: string;  // 'form|step_id|field_name' o 'evaluation|step_id|field_name'
  field: string;
  operator: 'equals' | 'not_equals' | '>' | '<' | '>=' | '<=' | 'contains';
  value: string;
}
```

**Ejemplo de uso:**
```json
{
  "type": "condition",
  "name": "Evaluar Experiencia",
  "config": {
    "branches": [
      {
        "id": "branch-1",
        "label": "Senior con experiencia alta",
        "logic": "AND",
        "rules": [
          {
            "id": "rule-1",
            "source": "form|uuid-form-step|nivel",
            "field": "form|uuid-form-step|nivel",
            "operator": "equals",
            "value": "senior"
          },
          {
            "id": "rule-2",
            "source": "form|uuid-form-step|experiencia",
            "field": "form|uuid-form-step|experiencia",
            "operator": ">=",
            "value": "5"
          }
        ],
        "nextStepId": "uuid-paso-senior"
      },
      {
        "id": "branch-2",
        "label": "Evaluación aprobada",
        "logic": "AND",
        "rules": [
          {
            "id": "rule-3",
            "source": "evaluation|uuid-eval-step|total_score",
            "field": "evaluation|uuid-eval-step|total_score",
            "operator": ">=",
            "value": "20"
          }
        ],
        "nextStepId": "uuid-paso-aprobado"
      }
    ],
    "fallbackNextStepId": "uuid-paso-default"
  }
}
```

**Evaluación de reglas:**
1. Se evalúan las ramas en orden
2. Para cada rama, se evalúan todas las reglas
3. Si `logic = 'AND'`: todas las reglas deben cumplirse
4. Si `logic = 'OR'`: al menos una regla debe cumplirse
5. La primera rama que cumple se ejecuta
6. Si ninguna cumple, se usa el `fallbackNextStepId`

### 7.5 Nodo EMAIL

**Propósito**: Envío de correos electrónicos.

**Configuración:**
```typescript
interface EmailConfig {
  to: string;
  subject: string;
  body: string;
  cc?: string;
  bcc?: string;
}
```

**Ejemplo:**
```json
{
  "type": "email",
  "name": "Enviar Confirmación",
  "config": {
    "to": "candidato@example.com",
    "subject": "Proceso de Selección - Siguiente Etapa",
    "body": "Estimado candidato,\n\nNos complace informarle que ha sido seleccionado para la siguiente etapa..."
  }
}
```

### 7.6 Nodo HTTP

**Propósito**: Llamadas a APIs externas.

**Configuración:**
```typescript
interface HttpConfig {
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: string;
}
```

**Ejemplo:**
```json
{
  "type": "http",
  "name": "Crear Usuario en Sistema Externo",
  "config": {
    "url": "https://api.example.com/users",
    "method": "POST",
    "headers": {
      "Content-Type": "application/json",
      "Authorization": "Bearer TOKEN"
    },
    "body": "{\"name\": \"Juan Pérez\", \"email\": \"juan@example.com\"}"
  }
}
```

### 7.7 Nodo DELAY

**Propósito**: Pausar la ejecución por un tiempo determinado.

**Configuración:**
```typescript
interface DelayConfig {
  duration: number;
  unit: 'seconds' | 'minutes' | 'hours';
}
```

**Ejemplo:**
```json
{
  "type": "delay",
  "name": "Esperar 24 horas",
  "config": {
    "duration": 24,
    "unit": "hours"
  }
}
```

**Funcionamiento:**
1. Al ejecutarse, el nodo calcula `resume_at = now() + duration`
2. Cambia el estado de la instancia a `'paused'`
3. Un scheduler (cron job) revisa periódicamente instancias pausadas
4. Cuando `now() >= resume_at`, reanuda la ejecución

---

## 8. Sistema de Condiciones

### 8.1 Componente: `ConditionConfigEditor.tsx`

Editor visual para configurar condiciones complejas.

**Características:**
- Múltiples ramas (branches)
- Múltiples reglas por rama
- Lógica AND/OR
- Validación en tiempo real
- Autocompletado de campos

**Estructura visual:**
```
┌─────────────────────────────────────────────┐
│ Rama 1: "Senior con experiencia"           │
│ Lógica: AND (todas las reglas)             │
│                                             │
│ Regla 1:                                    │
│ [Formulario: Datos] [nivel] [==] [senior]  │
│                                             │
│ Regla 2:                                    │
│ [Formulario: Datos] [experiencia] [>=] [5] │
│                                             │
│ Próximo paso: [Entrevista Senior ▼]        │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│ Rama 2: "Evaluación aprobada"              │
│ Lógica: AND                                 │
│                                             │
│ Regla 1:                                    │
│ [Evaluación: Técnica] [total_score] [>=] [20] │
│                                             │
│ Próximo paso: [Email Aprobación ▼]         │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│ Ruta alternativa (Fallback)                │
│ [Email Rechazo ▼]                           │
└─────────────────────────────────────────────┘
```

### 8.2 Formato de Campo (Field)

Los campos se referencian con el formato:
```
{source}|{step_id}|{field_name}
```

**Ejemplos:**
- `form|uuid-123|nombre`: Campo "nombre" del formulario en step uuid-123
- `evaluation|uuid-456|total_score`: Puntaje total de evaluación en step uuid-456
- `evaluation_answer_score|uuid-456|q1`: Puntaje de pregunta q1
- `evaluation_answer_selected|uuid-456|q1`: Respuesta seleccionada en pregunta q1

### 8.3 Operadores Disponibles

| Operador | Símbolo | Tipos Compatibles | Descripción |
|----------|---------|-------------------|-------------|
| `equals` | `==` | string, number | Igualdad exacta |
| `not_equals` | `!=` | string, number | Diferente de |
| `>` | `>` | number | Mayor que |
| `>=` | `>=` | number | Mayor o igual |
| `<` | `<` | number | Menor que |
| `<=` | `<=` | number | Menor o igual |
| `contains` | `contiene` | string | Contiene subcadena |

### 8.4 Validación de Condiciones

El editor valida en tiempo real:

**Errores (bloquean guardado):**
- ❌ Rama sin paso destino
- ❌ Rama sin reglas
- ❌ Regla con campos vacíos
- ❌ Operador incompatible con tipo de campo

**Advertencias (no bloquean):**
- ⚠️ Sin ruta alternativa (fallback)
- ⚠️ Etiquetas de rama duplicadas

**Ejemplo de validación:**
```tsx
const validateBranch = (branch: ConditionBranch) => {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  if (!branch.nextStepId) {
    errors.push('Falta seleccionar paso destino');
  }
  
  if (!branch.rules || branch.rules.length === 0) {
    warnings.push('No hay reglas configuradas');
  }
  
  branch.rules?.forEach((rule, idx) => {
    if (!rule.source) errors.push(`Regla ${idx + 1}: Falta fuente`);
    if (!rule.field) errors.push(`Regla ${idx + 1}: Campo vacío`);
    if (!rule.operator) errors.push(`Regla ${idx + 1}: Operador vacío`);
    if (rule.value === '') errors.push(`Regla ${idx + 1}: Valor vacío`);
  });
  
  return { errors, warnings };
};
```

---

## 9. Runtime y Ejecución

### 9.1 Ciclo de Vida de una Instancia

```
1. CREACIÓN
   Usuario selecciona legajo desde StartNode
   ↓
   POST /api/flows/{flow_id}/start/
   ↓
   create_instance_from_legajo()
   ↓
   InstanciaFlujo creada (status='running', current_step=segundo_paso)

2. RENDERIZADO
   GET /api/flows/instances/{instance_id}/current-step/
   ↓
   FlowRuntime.get_current_step_html()
   ↓
   Devuelve JSON con estructura del paso actual

3. INTERACCIÓN
   Usuario completa formulario/evaluación
   ↓
   POST /api/flows/instances/{instance_id}/interact/
   ↓
   FlowRuntime.process_interaction()
   ↓
   - Valida datos
   - Guarda en context
   - Determina siguiente paso
   - Actualiza current_step

4. REPETIR 2-3 hasta:
   - Completar flujo (status='completed')
   - Error (status='failed')
   - Pausa por delay (status='paused')

5. FINALIZACIÓN
   - Si completed: completed_at = now()
   - Si failed: error_message guardado
   - Logs completos en InstanceLog
```

### 9.2 Componente: `FlowRuntime.tsx` (Frontend)

Renderiza la ejecución de flujos en el frontend.

```tsx
export function FlowRuntime({ instanceId }: { instanceId: string }) {
  const [currentStep, setCurrentStep] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCurrentStep();
  }, [instanceId]);

  const loadCurrentStep = async () => {
    const response = await fetch(`/api/flows/instances/${instanceId}/current-step/`);
    const data = await response.json();
    setCurrentStep(data);
    setLoading(false);
  };

  const handleSubmit = async (formData: any) => {
    const response = await fetch(`/api/flows/instances/${instanceId}/interact/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    
    const result = await response.json();
    
    if (result.completed) {
      alert('¡Flujo completado!');
    } else if (result.next_step_id) {
      loadCurrentStep();
    }
  };

  if (loading) return <div>Cargando...</div>;

  // Renderizar según tipo de paso
  if (currentStep.type === 'form') {
    return <FormRenderer config={currentStep} onSubmit={handleSubmit} />;
  }
  
  if (currentStep.type === 'evaluation') {
    return <EvaluationRenderer config={currentStep} onSubmit={handleSubmit} />;
  }

  return <div dangerouslySetInnerHTML={{ __html: currentStep.html }} />;
}
```

### 9.3 Gestión de Estado con Zustand

```typescript
// useFlowStore.ts
interface FlowStore {
  flows: Flow[];
  currentFlow: Flow | null;
  setCurrentFlow: (flow: Flow | null) => void;
  addFlow: (flow: Partial<Flow>) => Promise<void>;
  updateFlow: (id: string, flow: Partial<Flow>) => Promise<void>;
  deleteFlow: (id: string) => Promise<void>;
  loadFlows: () => Promise<void>;
}

export const useFlowStore = create<FlowStore>((set, get) => ({
  flows: [],
  currentFlow: null,
  
  setCurrentFlow: (flow) => set({ currentFlow: flow }),
  
  addFlow: async (flowData) => {
    const response = await fetch('/api/flows/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: flowData.name,
        description: flowData.description,
        steps_data: flowData.steps
      })
    });
    
    const newFlow = await response.json();
    set(state => ({ flows: [...state.flows, newFlow] }));
  },
  
  updateFlow: async (id, flowData) => {
    const response = await fetch(`/api/flows/${id}/`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: flowData.name,
        description: flowData.description,
        steps_data: flowData.steps
      })
    });
    
    const updatedFlow = await response.json();
    set(state => ({
      flows: state.flows.map(f => f.id === id ? updatedFlow : f)
    }));
  },
  
  loadFlows: async () => {
    const response = await fetch('/api/flows/');
    const flows = await response.json();
    set({ flows });
  }
}));
```


---

## 10. Casos de Uso Completos

### 10.1 Caso: Proceso de Onboarding de Empleados

**Objetivo**: Automatizar la incorporación de nuevos empleados.

**Flujo:**

```
[START] Seleccionar Empleado
    ↓
[FORM] Datos Personales
    ↓
[FORM] Información Bancaria
    ↓
[EVALUATION] Evaluación de Conocimientos
    ↓
[CONDITION] ¿Puntaje >= 70?
    ├─ SÍ → [EMAIL] Bienvenida + Accesos
    │         ↓
    │       [HTTP] Crear cuenta en sistema
    │         ↓
    │       [DELAY] Esperar 1 día
    │         ↓
    │       [EMAIL] Recordatorio primer día
    └─ NO → [EMAIL] Capacitación adicional
              ↓
            [DELAY] Esperar 3 días
              ↓
            [EVALUATION] Re-evaluación
```

**Configuración JSON:**

```json
{
  "name": "Onboarding de Empleados",
  "description": "Proceso completo de incorporación",
  "steps": [
    {
      "id": "start-1",
      "type": "start",
      "name": "Seleccionar Empleado",
      "config": {
        "acceptedPlantillas": ["plantilla-empleados"],
        "tableColumns": [
          { "key": "nombre", "label": "Nombre" },
          { "key": "puesto", "label": "Puesto" }
        ]
      },
      "nextStepId": "form-1"
    },
    {
      "id": "form-1",
      "type": "form",
      "name": "Datos Personales",
      "config": {
        "title": "Información Personal",
        "fields": [
          { "name": "direccion", "label": "Dirección", "type": "text", "required": true },
          { "name": "telefono", "label": "Teléfono", "type": "text", "required": true },
          { "name": "fecha_nacimiento", "label": "Fecha de Nacimiento", "type": "date", "required": true }
        ]
      },
      "nextStepId": "form-2"
    },
    {
      "id": "form-2",
      "type": "form",
      "name": "Información Bancaria",
      "config": {
        "title": "Datos Bancarios",
        "fields": [
          { "name": "banco", "label": "Banco", "type": "text", "required": true },
          { "name": "cuenta", "label": "Número de Cuenta", "type": "text", "required": true },
          { "name": "cbu", "label": "CBU", "type": "text", "required": true }
        ]
      },
      "nextStepId": "eval-1"
    },
    {
      "id": "eval-1",
      "type": "evaluation",
      "name": "Evaluación Inicial",
      "config": {
        "title": "Conocimientos Básicos",
        "questions": [
          {
            "id": "q1",
            "text": "¿Conoce las políticas de la empresa?",
            "type": "single_choice",
            "weight": 1,
            "options": [
              { "id": "si", "text": "Sí", "score": 10 },
              { "id": "no", "text": "No", "score": 0 }
            ]
          }
        ],
        "scoring_ranges": [
          { "min_score": 0, "max_score": 69, "category": "Bajo" },
          { "min_score": 70, "max_score": 100, "category": "Alto" }
        ]
      },
      "nextStepId": "cond-1"
    },
    {
      "id": "cond-1",
      "type": "condition",
      "name": "Evaluar Resultado",
      "config": {
        "branches": [
          {
            "id": "branch-aprobado",
            "label": "Aprobado",
            "logic": "AND",
            "rules": [
              {
                "id": "rule-1",
                "source": "evaluation|eval-1|total_score",
                "field": "evaluation|eval-1|total_score",
                "operator": ">=",
                "value": "70"
              }
            ],
            "nextStepId": "email-bienvenida"
          }
        ],
        "fallbackNextStepId": "email-capacitacion"
      }
    },
    {
      "id": "email-bienvenida",
      "type": "email",
      "name": "Email de Bienvenida",
      "config": {
        "to": "empleado@empresa.com",
        "subject": "¡Bienvenido a la empresa!",
        "body": "Estimado empleado, te damos la bienvenida..."
      },
      "nextStepId": "http-crear-cuenta"
    },
    {
      "id": "http-crear-cuenta",
      "type": "http",
      "name": "Crear Cuenta",
      "config": {
        "url": "https://api.empresa.com/users",
        "method": "POST",
        "headers": { "Authorization": "Bearer TOKEN" },
        "body": "{\"email\": \"empleado@empresa.com\"}"
      }
    }
  ]
}
```

### 10.2 Caso: Evaluación de Candidatos

**Objetivo**: Evaluar candidatos y tomar decisiones automáticas.

**Flujo:**

```
[START] Seleccionar Candidato
    ↓
[FORM] Entrevista Inicial
    ↓
[EVALUATION] Evaluación Técnica
    ↓
[CONDITION] Evaluar Puntaje y Experiencia
    ├─ Senior + Score Alto → [EMAIL] Oferta Inmediata
    ├─ Score Medio → [EMAIL] Segunda Entrevista
    └─ Score Bajo → [EMAIL] Agradecimiento
```

**Configuración de Condición Compleja:**

```json
{
  "type": "condition",
  "name": "Decisión Final",
  "config": {
    "branches": [
      {
        "id": "branch-1",
        "label": "Senior con evaluación excelente",
        "logic": "AND",
        "rules": [
          {
            "id": "rule-1",
            "source": "form|form-1|nivel",
            "field": "form|form-1|nivel",
            "operator": "equals",
            "value": "senior"
          },
          {
            "id": "rule-2",
            "source": "evaluation|eval-1|total_score",
            "field": "evaluation|eval-1|total_score",
            "operator": ">=",
            "value": "80"
          },
          {
            "id": "rule-3",
            "source": "form|form-1|experiencia",
            "field": "form|form-1|experiencia",
            "operator": ">=",
            "value": "5"
          }
        ],
        "nextStepId": "email-oferta"
      },
      {
        "id": "branch-2",
        "label": "Puntaje medio - Segunda oportunidad",
        "logic": "AND",
        "rules": [
          {
            "id": "rule-4",
            "source": "evaluation|eval-1|total_score",
            "field": "evaluation|eval-1|total_score",
            "operator": ">=",
            "value": "50"
          },
          {
            "id": "rule-5",
            "source": "evaluation|eval-1|total_score",
            "field": "evaluation|eval-1|total_score",
            "operator": "<",
            "value": "80"
          }
        ],
        "nextStepId": "email-segunda-entrevista"
      }
    ],
    "fallbackNextStepId": "email-rechazo"
  }
}
```

---

## 11. Guía de Desarrollo

### 11.1 Agregar un Nuevo Tipo de Nodo

#### Paso 1: Definir el tipo en TypeScript

```typescript
// frontend/src/lib/flows/types.ts

export type ActionType = 
  | 'start'
  | 'form'
  | 'evaluation'
  | 'email'
  | 'http'
  | 'delay'
  | 'condition'
  | 'database'
  | 'transform'
  | 'mi_nuevo_nodo';  // ← Agregar aquí

export interface MiNuevoNodoConfig extends ActionConfig {
  campo1: string;
  campo2: number;
  campo3?: boolean;
}
```

#### Paso 2: Crear clase de nodo en Backend

```python
# backend/flows/nodes.py

class MiNuevoNode(BaseNode):
    """Descripción de mi nuevo nodo"""
    
    def render_html(self):
        campo1 = self.config.get('campo1', '')
        campo2 = self.config.get('campo2', 0)
        
        return f'''
        <div class="mi-nuevo-nodo">
            <h3>Mi Nuevo Nodo</h3>
            <p>Campo 1: {escape(campo1)}</p>
            <p>Campo 2: {campo2}</p>
            <button type="submit">Continuar</button>
        </div>
        '''
    
    def execute(self, interaction_data, user):
        # Lógica de ejecución
        resultado = self._procesar_datos(interaction_data)
        
        return {
            'context_updates': {
                'variables': {
                    'resultado_mi_nodo': resultado
                }
            }
        }
    
    def _procesar_datos(self, data):
        # Implementar lógica específica
        return "resultado procesado"
```

#### Paso 3: Registrar en Runtime

```python
# backend/flows/runtime.py

class FlowRuntime:
    NODE_CLASSES = {
        'start': StartNode,
        'form': FormNode,
        'evaluation': EvaluationNode,
        'email': EmailNode,
        'http': HttpNode,
        'delay': DelayNode,
        'condition': ConditionNode,
        'database': DatabaseNode,
        'transform': TransformNode,
        'mi_nuevo_nodo': MiNuevoNode,  # ← Agregar aquí
    }
```

#### Paso 4: Crear editor de configuración en Frontend

```tsx
// frontend/src/components/flows/MiNuevoNodoConfigEditor.tsx

interface MiNuevoNodoConfigEditorProps {
  config: MiNuevoNodoConfig;
  onChange: (key: string, value: any) => void;
}

export function MiNuevoNodoConfigEditor({ config, onChange }: MiNuevoNodoConfigEditorProps) {
  return (
    <div className="space-y-4">
      <div>
        <Label>Campo 1</Label>
        <Input
          value={config.campo1 || ''}
          onChange={(e) => onChange('campo1', e.target.value)}
          placeholder="Ingrese valor"
        />
      </div>
      
      <div>
        <Label>Campo 2</Label>
        <Input
          type="number"
          value={config.campo2 || 0}
          onChange={(e) => onChange('campo2', parseInt(e.target.value))}
        />
      </div>
      
      <div>
        <Label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={config.campo3 || false}
            onChange={(e) => onChange('campo3', e.target.checked)}
          />
          Campo 3 (opcional)
        </Label>
      </div>
    </div>
  );
}
```

#### Paso 5: Integrar en StepForm

```tsx
// frontend/src/components/flows/StepForm.tsx

function StepForm({ step, onSubmit, onCancel }: StepFormProps) {
  // ... código existente ...
  
  const renderConfigEditor = () => {
    switch (stepData.type) {
      case 'form':
        return <FormConfigEditor config={stepData.config} onChange={handleConfigChange} />;
      case 'evaluation':
        return <EvaluationConfigEditor config={stepData.config} onChange={handleConfigChange} />;
      case 'condition':
        return <ConditionConfigEditor config={stepData.config} onChange={handleConfigChange} />;
      case 'mi_nuevo_nodo':  // ← Agregar aquí
        return <MiNuevoNodoConfigEditor config={stepData.config} onChange={handleConfigChange} />;
      default:
        return <DefaultConfigEditor config={stepData.config} onChange={handleConfigChange} />;
    }
  };
  
  // ... resto del código ...
}
```

#### Paso 6: Agregar a la lista de tipos

```typescript
// frontend/src/lib/flows/types.ts

export const ACTION_TYPES: { value: ActionType; label: string; description: string }[] = [
  { value: 'start', label: 'Inicio', description: 'Punto de inicio del flujo' },
  { value: 'form', label: 'Formulario', description: 'Captura datos del usuario' },
  { value: 'evaluation', label: 'Evaluación', description: 'Preguntas con puntaje' },
  // ... otros tipos ...
  { 
    value: 'mi_nuevo_nodo', 
    label: 'Mi Nuevo Nodo', 
    description: 'Descripción de mi nuevo nodo' 
  },
];
```

### 11.2 Debugging y Logs

#### Ver logs de una instancia

```python
# En Django shell
from flows.models import InstanciaFlujo, InstanceLog

instance = InstanciaFlujo.objects.get(id='uuid-instancia')

# Ver todos los logs
logs = instance.logs.all().order_by('timestamp')
for log in logs:
    print(f"[{log.level}] {log.timestamp}: {log.message}")
    print(f"  Data: {log.data}")

# Ver contexto actual
print(instance.context)
```

#### Logs en el frontend

```tsx
// Agregar logging en FlowRuntime
const handleSubmit = async (formData: any) => {
  console.log('Submitting interaction:', formData);
  
  const response = await fetch(`/api/flows/instances/${instanceId}/interact/`, {
    method: 'POST',
    body: JSON.stringify(formData)
  });
  
  const result = await response.json();
  console.log('Interaction result:', result);
  
  if (result.success) {
    console.log('Moving to next step:', result.next_step_id);
  } else {
    console.error('Interaction failed:', result.error);
  }
};
```

### 11.3 Testing

#### Test de nodo en Backend

```python
# backend/flows/tests/test_mi_nuevo_nodo.py

from django.test import TestCase
from flows.models import Step, InstanciaFlujo
from flows.nodes import MiNuevoNode

class MiNuevoNodeTest(TestCase):
    def setUp(self):
        self.step = Step.objects.create(
            step_type='mi_nuevo_nodo',
            name='Test Node',
            config={
                'campo1': 'valor1',
                'campo2': 42
            }
        )
        self.context = {}
    
    def test_render_html(self):
        node = MiNuevoNode(self.step, self.context)
        html = node.render_html()
        
        self.assertIn('Mi Nuevo Nodo', html)
        self.assertIn('valor1', html)
        self.assertIn('42', html)
    
    def test_execute(self):
        node = MiNuevoNode(self.step, self.context)
        result = node.execute({'input': 'test'}, None)
        
        self.assertIn('context_updates', result)
        self.assertIn('variables', result['context_updates'])
```

#### Test de componente en Frontend

```tsx
// frontend/src/components/flows/__tests__/MiNuevoNodoConfigEditor.test.tsx

import { render, screen, fireEvent } from '@testing-library/react';
import { MiNuevoNodoConfigEditor } from '../MiNuevoNodoConfigEditor';

describe('MiNuevoNodoConfigEditor', () => {
  it('renders all fields', () => {
    const config = { campo1: '', campo2: 0 };
    const onChange = jest.fn();
    
    render(<MiNuevoNodoConfigEditor config={config} onChange={onChange} />);
    
    expect(screen.getByLabelText('Campo 1')).toBeInTheDocument();
    expect(screen.getByLabelText('Campo 2')).toBeInTheDocument();
  });
  
  it('calls onChange when field is updated', () => {
    const config = { campo1: '', campo2: 0 };
    const onChange = jest.fn();
    
    render(<MiNuevoNodoConfigEditor config={config} onChange={onChange} />);
    
    const input = screen.getByLabelText('Campo 1');
    fireEvent.change(input, { target: { value: 'nuevo valor' } });
    
    expect(onChange).toHaveBeenCalledWith('campo1', 'nuevo valor');
  });
});
```

### 11.4 Optimizaciones

#### Caché de flujos

```python
# backend/flows/views.py

from django.core.cache import cache

class FlujoViewSet(viewsets.ModelViewSet):
    def retrieve(self, request, pk=None):
        cache_key = f'flow_{pk}'
        flow = cache.get(cache_key)
        
        if not flow:
            flow = self.get_object()
            cache.set(cache_key, flow, timeout=300)  # 5 minutos
        
        serializer = self.get_serializer(flow)
        return Response(serializer.data)
```

#### Lazy loading de steps

```tsx
// Cargar steps solo cuando se necesitan
const { data: steps, isLoading } = useQuery({
  queryKey: ['flow-steps', flowId],
  queryFn: () => fetchFlowSteps(flowId),
  enabled: !!flowId,
  staleTime: 5 * 60 * 1000, // 5 minutos
});
```

---

## 12. API Reference

### 12.1 Endpoints Principales

#### Listar Flujos
```
GET /api/flows/
Response: Array<Flow>
```

#### Crear Flujo
```
POST /api/flows/
Body: {
  name: string,
  description?: string,
  steps_data: FlowStep[]
}
Response: Flow
```

#### Obtener Flujo
```
GET /api/flows/{id}/
Response: Flow
```

#### Actualizar Flujo
```
PATCH /api/flows/{id}/
Body: Partial<Flow>
Response: Flow
```

#### Eliminar Flujo
```
DELETE /api/flows/{id}/
Response: 204 No Content
```

#### Iniciar Flujo
```
POST /api/flows/{id}/start/
Body: {
  legajo_id: string
}
Response: {
  instance_id: string,
  status: string
}
```

#### Obtener Paso Actual
```
GET /api/flows/instances/{instance_id}/current-step/
Response: {
  type: string,
  title: string,
  fields?: FormField[],
  questions?: EvaluationQuestion[],
  html?: string
}
```

#### Interactuar con Paso
```
POST /api/flows/instances/{instance_id}/interact/
Body: Record<string, any>
Response: {
  success: boolean,
  next_step_id?: string,
  completed: boolean,
  error?: string
}
```

#### Obtener Logs de Instancia
```
GET /api/flows/instances/{instance_id}/logs/
Response: Array<InstanceLog>
```

---

## 13. Mejores Prácticas

### 13.1 Diseño de Flujos

✅ **DO:**
- Usar nombres descriptivos para pasos
- Agregar descripciones claras en formularios
- Validar datos en cada paso
- Incluir ruta fallback en condiciones
- Usar delays para procesos largos
- Loggear eventos importantes

❌ **DON'T:**
- Crear flujos con más de 20 pasos (dividir en sub-flujos)
- Usar condiciones sin fallback
- Olvidar validar campos requeridos
- Crear ciclos infinitos
- Hardcodear valores que pueden cambiar

### 13.2 Performance

- Usar índices en campos frecuentemente consultados
- Cachear flujos que no cambian frecuentemente
- Limitar el tamaño del contexto (< 1MB)
- Usar paginación en tablas de legajos
- Optimizar queries con `select_related` y `prefetch_related`

### 13.3 Seguridad

- Validar todos los inputs del usuario
- Sanitizar HTML renderizado
- Usar HTTPS en producción
- Limitar rate de ejecuciones
- Auditar cambios en flujos críticos
- Encriptar datos sensibles en contexto

---

## 14. Troubleshooting

### Problema: Flujo no avanza después de interacción

**Síntomas:**
- Usuario completa formulario pero no avanza
- Estado queda en "running"

**Solución:**
```python
# Verificar logs
instance = InstanciaFlujo.objects.get(id='uuid')
print(instance.logs.all().order_by('-timestamp')[:5])

# Verificar current_step
print(instance.current_step)

# Verificar transiciones
if instance.current_step:
    print(instance.current_step.outgoing_transitions.all())
```

### Problema: Condición no evalúa correctamente

**Síntomas:**
- Siempre toma la rama fallback
- No encuentra el campo en el contexto

**Solución:**
```python
# Verificar formato de field
# Debe ser: "source|step_id|field_name"
# Ejemplo: "form|uuid-123|nombre"

# Verificar contexto
print(instance.context)

# Verificar que el step_id coincida
print(f"Buscando: form|{step_id}|campo")
print(f"Disponible: {instance.context.get('forms', {}).keys()}")
```

### Problema: Error al guardar flujo

**Síntomas:**
- Error 400 al guardar
- Mensaje: "Cycle detected"

**Solución:**
- Revisar que no haya ciclos en el grafo
- Verificar que todos los `nextStepId` existan
- Validar estructura con `_validate_flow_structure()`

---

## 15. Roadmap y Futuras Mejoras

### Versión 2.0 (Planificado)

- [ ] **Sub-flujos**: Llamar a otros flujos como pasos
- [ ] **Variables globales**: Compartir datos entre flujos
- [ ] **Webhooks**: Triggers externos para iniciar flujos
- [ ] **Plantillas de flujo**: Marketplace de flujos predefinidos
- [ ] **Versionado**: Historial de cambios en flujos
- [ ] **A/B Testing**: Ejecutar variantes de flujos
- [ ] **Analytics**: Dashboard de métricas de ejecución
- [ ] **Notificaciones**: Alertas en tiempo real
- [ ] **Integraciones**: Conectores con servicios externos (Slack, Teams, etc.)
- [ ] **AI Assistant**: Sugerencias de optimización de flujos

### Versión 2.1 (Futuro)

- [ ] **Flujos paralelos**: Ejecutar múltiples ramas simultáneamente
- [ ] **Rollback**: Deshacer pasos ejecutados
- [ ] **Simulación**: Probar flujos sin ejecutar acciones reales
- [ ] **Export/Import**: Compartir flujos entre instancias
- [ ] **API pública**: Ejecutar flujos desde aplicaciones externas

---

## 16. Conclusión

El Sistema de Flujos de NODO es una herramienta poderosa y flexible para automatizar procesos de negocio. Con su editor visual intuitivo, motor de ejecución robusto, y sistema de condiciones avanzado, permite crear workflows complejos sin necesidad de programar.

**Características destacadas:**
- ✅ Editor visual drag & drop con React Flow
- ✅ 9 tipos de nodos predefinidos
- ✅ Sistema de condiciones con lógica AND/OR
- ✅ Evaluaciones con scoring automático
- ✅ Delays y pausas programadas
- ✅ Logs completos de auditoría
- ✅ Integración con formularios y plantillas
- ✅ API REST completa
- ✅ TypeScript + Python para máxima seguridad de tipos

**Casos de uso ideales:**
- Onboarding de empleados
- Evaluación de candidatos
- Seguimiento de proyectos
- Aprobaciones multi-nivel
- Procesos de compliance
- Automatización de tareas administrativas

---

## 17. Recursos Adicionales

### Documentación Oficial
- [Django REST Framework](https://www.django-rest-framework.org/)
- [React Flow](https://reactflow.dev/)
- [Next.js](https://nextjs.org/docs)
- [Zustand](https://zustand-demo.pmnd.rs/)

### Tutoriales Recomendados
- [Building a Workflow Engine](https://www.youtube.com/watch?v=example)
- [React Flow Advanced Patterns](https://reactflow.dev/learn)
- [Django Signals and Async Tasks](https://docs.djangoproject.com/en/4.2/topics/signals/)

### Comunidad
- GitHub Issues: [Reportar bugs](https://github.com/tu-repo/issues)
- Discord: [Unirse a la comunidad](#)
- Stack Overflow: Tag `nodo-flows`

---

**Documento creado por**: Sistema NODO  
**Última actualización**: 2024  
**Versión**: 1.0.0  

---

**¿Preguntas? ¿Sugerencias?**  
Contacta al equipo de desarrollo o abre un issue en GitHub.

🚀 **¡Feliz automatización!**
