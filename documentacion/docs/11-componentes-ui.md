# Componentes UI - Configuración y Runtime

## Introducción

Los componentes UI son elementos visuales especiales que no almacenan datos en el legajo, sino que mejoran la experiencia de usuario mediante elementos decorativos, informativos o de navegación. Se dividen en dos categorías:

1. **Componentes de datos**: Campos que almacenan información (text, number, date, select, etc.)
2. **Componentes UI**: Elementos visuales que no almacenan datos (header, paginator, relation)

## Arquitectura de Componentes UI

### Identificación de Componentes UI

Un nodo se considera "UI" cuando cumple alguna de estas condiciones:

```typescript
// En el código
function isUiNode(n: any) { 
  return n?.kind === "ui" || String(n?.type || "").startsWith("ui:"); 
}
```

Los tipos UI disponibles:
- `ui:header` - Encabezado visual con imagen de fondo
- `ui:paginator` - Sistema de paginación/wizard
- `ui:relation` - Gestor de relaciones entre legajos

---

## 1. Componente Header (ui:header)

### Propósito
Crear encabezados visuales atractivos con imagen de fondo, información dinámica y acciones rápidas.

### Configuración en Plantilla

#### Estructura del Nodo
```json
{
  "id": "header-1",
  "type": "ui:header",
  "kind": "ui",
  "variant": "hero-glass",
  "config": {
    "background": {
      "imageUrl": "/png/people-connecting.png",
      "overlay": {
        "enabled": true,
        "opacity": 0.4
      }
    },
    "topbar": {
      "enabled": true,
      "actions": ["settings", "bell", "logout"],
      "logoutLabel": "Cerrar sesión"
    },
    "card": {
      "enabled": true,
      "title": "{{data.nombre}} {{data.apellido}}",
      "subtitle": "{{data.cargo}} - {{data.departamento}}",
      "leftIcon": {
        "enabled": true,
        "icon": "user",
        "gradient": {
          "angle": 135,
          "from": "#3b82f6",
          "to": "#8b5cf6"
        }
      },
      "actions": [
        {
          "id": "edit",
          "icon": "edit",
          "label": "Editar",
          "type": "navigate",
          "to": "/legajos/{{meta.legajoId}}/editar"
        },
        {
          "id": "print",
          "icon": "printer",
          "label": "Imprimir",
          "type": "command",
          "name": "print"
        }
      ],
      "glass": {
        "blur": 12,
        "opacity": 0.9
      }
    }
  }
}
```

#### Propiedades Configurables

**Background**
- `imageUrl`: URL de la imagen de fondo
- `overlay.enabled`: Activar capa oscura sobre la imagen
- `overlay.opacity`: Opacidad del overlay (0-1)

**Topbar**
- `enabled`: Mostrar barra superior con acciones
- `actions`: Array de iconos (settings, bell, logout, etc.)
- `logoutLabel`: Texto para el botón de logout

**Card**
- `enabled`: Mostrar tarjeta de información
- `title`: Título con soporte de templates `{{data.campo}}`
- `subtitle`: Subtítulo con soporte de templates
- `leftIcon.icon`: Icono a mostrar (user, printer, map-pin, etc.)
- `leftIcon.gradient`: Gradiente del icono (angle, from, to)
- `actions`: Array de botones de acción
- `glass.blur`: Nivel de desenfoque del efecto glass (px)
- `glass.opacity`: Opacidad del fondo (0-1)

#### Templates Dinámicos

El header soporta interpolación de datos usando la sintaxis `{{path.to.value}}`:

```javascript
// Contexto disponible:
{
  data: { /* datos del formulario */ },
  meta: { legajoId, plantillaId, etc. },
  context: { /* contexto adicional */ }
}

// Ejemplos:
"{{data.nombre}}"              // Campo del formulario
"{{meta.legajoId}}"            // ID del legajo
"{{data.direccion.calle}}"     // Campos anidados
```

### Runtime (Instancia de Legajo)

Cuando se crea o visualiza un legajo, el componente:

1. **Resuelve templates**: Reemplaza `{{}}` con valores reales
2. **Renderiza el fondo**: Aplica imagen y overlay
3. **Muestra la tarjeta**: Con datos interpolados
4. **Gestiona acciones**: 
   - Navegación a otras páginas
   - Comandos (imprimir, etc.)
   - Acciones personalizadas

#### Comportamiento de Acciones

**Acción Edit**
```javascript
// Detecta si es acción de editar
const isEditAction = action?.icon === 'edit' || action?.id === 'edit';

// Navega a modo edición si no está ya en ese modo
if (isEditAction && legajoId) {
  router.push(`/legajos/${legajoId}/editar`);
}
```

**Acción Navigate**
```javascript
// Navega a URL con templates resueltos
if (action.type === 'navigate' && action.to) {
  const resolvedUrl = resolveTemplate(action.to, templateContext);
  router.push(resolvedUrl);
}
```

**Acción Command**
```javascript
// Ejecuta comandos del navegador
if (action.type === 'command' && action.name === 'print') {
  window.print();
}
```

---

## 2. Componente Paginator (ui:paginator)

### Propósito
Dividir formularios largos en páginas/secciones manejables, con diferentes modos de visualización según el contexto.

### Configuración en Plantilla

#### Estructura del Nodo
```json
{
  "id": "paginator-1",
  "type": "ui:paginator",
  "kind": "ui",
  "config": {
    "variant": "stepper",
    "initial_page": 0,
    "allow_jump": false,
    "show_progress": true,
    "sticky_nav": false,
    "glass": true,
    "behavior": {
      "create": "wizard",
      "edit": "sections",
      "view": "wizard"
    },
    "labels": {
      "prev": "Anterior",
      "next": "Siguiente",
      "finish": "Finalizar"
    },
    "pages": [
      {
        "id": "page-1",
        "title": "Datos Personales",
        "description": "Información básica del empleado",
        "fieldKeys": ["nombre", "apellido", "dni", "fecha_nacimiento"]
      },
      {
        "id": "page-2",
        "title": "Contacto",
        "description": "Información de contacto",
        "fieldKeys": ["email", "telefono", "direccion"]
      },
      {
        "id": "page-3",
        "title": "Laboral",
        "description": "Datos laborales",
        "fieldKeys": ["cargo", "departamento", "fecha_ingreso"]
      }
    ]
  }
}
```

#### Propiedades Configurables

**Variantes de Visualización**
- `stepper`: Pasos numerados con líneas de conexión
- `tabs`: Pestañas horizontales
- `progress`: Barra de progreso simple
- `dots`: Puntos indicadores

**Comportamiento por Modo**
```json
"behavior": {
  "create": "wizard",    // Modo creación: wizard paso a paso
  "edit": "sections",    // Modo edición: todas las secciones visibles
  "view": "wizard"       // Modo vista: wizard de solo lectura
}
```

**Opciones Generales**
- `initial_page`: Página inicial (0-based)
- `allow_jump`: Permitir saltar entre páginas
- `show_progress`: Mostrar indicadores de progreso
- `sticky_nav`: Fijar navegación al hacer scroll
- `glass`: Aplicar efecto glass morphism

**Páginas**
Cada página contiene:
- `id`: Identificador único
- `title`: Título de la página/sección
- `description`: Descripción opcional
- `fieldKeys`: Array de keys de campos a mostrar

### Runtime (Instancia de Legajo)

#### Modo Wizard (create/view)

Muestra una página a la vez con navegación secuencial:

1. **Validación por página**: Valida campos antes de avanzar
2. **Progreso visual**: Muestra qué páginas están completas
3. **Navegación controlada**: Botones Anterior/Siguiente
4. **Submit final**: Botón "Finalizar" envía todo el formulario

```typescript
// Validación antes de avanzar
const handleNext = async () => {
  const isValid = await validateCurrentPage();
  if (!isValid) return; // No avanza si hay errores
  setCurrentPage(currentPage + 1);
};
```

#### Modo Sections (edit)

Muestra todas las páginas como secciones expandibles:

1. **Accordion**: Cada página es una sección colapsable
2. **Progreso por sección**: Muestra campos completados/totales
3. **Navegación libre**: Expandir/colapsar cualquier sección
4. **Sin validación secuencial**: Editar en cualquier orden

```typescript
// Cálculo de progreso
const getPageProgress = (page) => {
  const completed = fieldKeys.filter(key => 
    formData[key] !== undefined && formData[key] !== ''
  ).length;
  
  return {
    completed,
    total: fieldKeys.length,
    percentage: Math.round((completed / total) * 100)
  };
};
```

#### Renderizado de Campos

El paginador obtiene los campos del schema y los renderiza según la página actual:

```typescript
// Obtener campo por key
const getFieldByKey = (key: string) => {
  return allNodes.find((n: any) => n.key === key);
};

// Renderizar campos de una página
const renderPageFields = (page: any) => {
  const fieldKeys = page.fieldKeys || [];
  
  return fieldKeys.map((key: string) => {
    const field = getFieldByKey(key);
    if (!field) return null;
    
    return <DynamicNode key={field.id} node={field} />;
  });
};
```

---

## 3. Componente Relation (ui:relation)

### Propósito
Gestionar relaciones entre legajos de diferentes plantillas (ej: empleado → proyectos, cliente → contratos).

### Configuración en Plantilla

#### Estructura del Nodo
```json
{
  "id": "relation-1",
  "type": "ui:relation",
  "kind": "ui",
  "config": {
    "relation_type": "proyectos",
    "inverse_relation_type": "empleados",
    "target_plantilla_id": "uuid-plantilla-proyectos",
    "title": "Proyectos Asignados",
    "description": "Proyectos en los que participa el empleado",
    "allow_create": true,
    "allow_remove": true,
    "display_fields": ["nombre", "fecha_inicio", "estado"],
    "search_fields": ["nombre", "codigo"]
  }
}
```

#### Propiedades Configurables

- `relation_type`: Tipo de relación desde este legajo
- `inverse_relation_type`: Tipo de relación inversa
- `target_plantilla_id`: UUID de la plantilla destino
- `title`: Título del componente
- `description`: Descripción opcional
- `allow_create`: Permitir crear nuevas relaciones
- `allow_remove`: Permitir eliminar relaciones
- `display_fields`: Campos a mostrar en la lista
- `search_fields`: Campos para buscar legajos

### Runtime (Instancia de Legajo)

El componente de relaciones:

1. **Lista relaciones existentes**: Muestra legajos relacionados
2. **Búsqueda**: Permite buscar y agregar nuevos legajos
3. **Creación**: Opcionalmente crear nuevo legajo relacionado
4. **Eliminación**: Remover relaciones existentes

```typescript
// Estructura de una relación
{
  id: "uuid-relacion",
  source_legajo: "uuid-legajo-actual",
  target_legajo: "uuid-legajo-relacionado",
  relation_type: "proyectos",
  inverse_relation_type: "empleados"
}
```

---

## Flujo de Trabajo Completo

### 1. Configuración en Plantilla

**Constructor de Plantillas** (`/plantillas/[id]/editar`)

1. Arrastrar componente UI desde la paleta
2. Configurar propiedades en el panel lateral
3. Para paginador: asignar campos a cada página
4. Guardar plantilla con schema actualizado

```typescript
// Schema guardado
{
  "nodes": [
    { /* componente ui:header */ },
    { /* componente ui:paginator */ },
    { /* campos de datos */ },
    { /* componente ui:relation */ }
  ]
}
```

### 2. Creación de Legajo

**Formulario de Creación** (`/legajos/nuevo?plantilla=uuid`)

1. **DynamicForm** recibe el schema de la plantilla
2. Separa nodos UI de nodos de datos:
   ```typescript
   const uiNodes = allNodes.filter(n => isUiNode(n));
   const dataNodes = allNodes.filter(n => !isUiNode(n));
   ```
3. Renderiza componentes UI:
   - Header: muestra con datos del formulario en tiempo real
   - Paginator: controla qué campos se muestran (modo wizard)
   - Relation: deshabilitado hasta que se guarde el legajo
4. Valida y envía datos al backend
5. Backend guarda solo campos de datos en `legajo.data`

### 3. Visualización de Legajo

**Vista de Legajo** (`/legajos/[id]`)

1. Carga datos del legajo desde API
2. Renderiza componentes UI con datos reales:
   - Header: templates resueltos con datos del legajo
   - Paginator: modo wizard de solo lectura
   - Relation: muestra relaciones existentes
3. Todos los campos en modo readonly

### 4. Edición de Legajo

**Formulario de Edición** (`/legajos/[id]/editar`)

1. Carga datos existentes
2. Renderiza componentes UI:
   - Header: con acción de editar deshabilitada (ya está en modo edición)
   - Paginator: modo sections (todas las secciones visibles)
   - Relation: permite agregar/quitar relaciones
3. Valida y actualiza datos

---

## Componentes de Campo (Data Nodes)

### Estructura Base

Todos los campos de datos comparten una estructura común:

```typescript
interface FieldNode {
  id: string;           // UUID único
  key: string;          // Clave para almacenar el valor
  type: string;         // Tipo de campo
  label: string;        // Etiqueta visible
  required?: boolean;   // Campo obligatorio
  disabled?: boolean;   // Campo deshabilitado
  readOnly?: boolean;   // Solo lectura
  placeholder?: string; // Texto de ayuda
  help?: string;        // Texto de ayuda adicional
}
```

### Tipos de Campos Disponibles

#### TextField
```json
{
  "type": "text",
  "key": "nombre",
  "label": "Nombre completo",
  "required": true,
  "placeholder": "Ingrese su nombre"
}
```

#### TextArea
```json
{
  "type": "textarea",
  "key": "observaciones",
  "label": "Observaciones",
  "placeholder": "Comentarios adicionales"
}
```

#### NumberField
```json
{
  "type": "number",
  "key": "edad",
  "label": "Edad",
  "min": 18,
  "max": 100
}
```

#### DateField
```json
{
  "type": "date",
  "key": "fecha_nacimiento",
  "label": "Fecha de Nacimiento",
  "min": "1900-01-01",
  "max": "2024-12-31"
}
```

#### SelectField
```json
{
  "type": "select",
  "key": "estado_civil",
  "label": "Estado Civil",
  "options": [
    { "value": "soltero", "label": "Soltero/a" },
    { "value": "casado", "label": "Casado/a" },
    { "value": "divorciado", "label": "Divorciado/a" }
  ]
}
```

#### MultiSelect
```json
{
  "type": "multiselect",
  "key": "idiomas",
  "label": "Idiomas",
  "options": [
    { "value": "es", "label": "Español" },
    { "value": "en", "label": "Inglés" },
    { "value": "pt", "label": "Portugués" }
  ]
}
```

#### CheckboxField
```json
{
  "type": "checkbox",
  "key": "acepta_terminos",
  "label": "Acepto los términos y condiciones",
  "required": true
}
```

#### GroupField (Repetible)
```json
{
  "type": "group",
  "key": "experiencias",
  "label": "Experiencia Laboral",
  "maxItems": 10,
  "children": [
    {
      "type": "text",
      "key": "empresa",
      "label": "Empresa"
    },
    {
      "type": "text",
      "key": "cargo",
      "label": "Cargo"
    },
    {
      "type": "date",
      "key": "desde",
      "label": "Desde"
    }
  ]
}
```

### FieldShell - Wrapper Común

Todos los campos se envuelven en `FieldShell` que proporciona:

1. **Label con icono**: Etiqueta visual con icono representativo
2. **Indicador de requerido**: Asterisco rojo para campos obligatorios
3. **Texto de ayuda**: Descripción adicional del campo
4. **Manejo de errores**: Visualización de errores de validación
5. **Estados visuales**: Disabled, readonly, error

```typescript
<FieldShell
  fieldKey={field.key}
  label={field.label}
  required={field.required}
  helpText={field.help}
  icon={<Calendar size={16} />}
  disabled={field.disabled}
  readonly={field.readOnly}
>
  {/* Input del campo */}
</FieldShell>
```

---

## Validación con Zod

### Generación de Schema

El sistema genera automáticamente un schema Zod desde la configuración:

```typescript
// zodFromTemplate.ts
function zodFromTemplate(nodes: any[]) {
  const shape: any = {};
  
  nodes.forEach(node => {
    if (node.type === 'text') {
      shape[node.key] = node.required 
        ? z.string().min(1, 'Campo requerido')
        : z.string().optional();
    }
    
    if (node.type === 'number') {
      let schema = z.number();
      if (node.min) schema = schema.min(node.min);
      if (node.max) schema = schema.max(node.max);
      shape[node.key] = node.required ? schema : schema.optional();
    }
    
    // ... otros tipos
  });
  
  return z.object(shape);
}
```

### Validación en Runtime

React Hook Form + Zod validan automáticamente:

```typescript
const methods = useForm({
  resolver: zodResolver(zodSchema),
  defaultValues: initialData,
});

// Validar página específica (paginador)
const validatePage = async (pageIndex: number) => {
  const page = paginatorNode.config.pages[pageIndex];
  const fieldKeys = page?.fieldKeys || [];
  
  // Trigger valida solo los campos especificados
  const result = await methods.trigger(fieldKeys);
  return result;
};
```

---

## Almacenamiento de Datos

### Backend - Modelo Legajo

```python
class Legajo(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    plantilla = models.ForeignKey(Plantilla, on_delete=models.PROTECT)
    data = models.JSONField()  # Solo campos de datos
    grid_values = models.JSONField()  # Valores para grilla
    search_document = models.TextField()  # Búsqueda full-text
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
```

### Datos Guardados

Solo se guardan campos de datos, NO componentes UI:

```json
// legajo.data
{
  "nombre": "Juan Pérez",
  "email": "juan@example.com",
  "fecha_nacimiento": "1990-05-15",
  "cargo": "Desarrollador",
  "experiencias": [
    {
      "empresa": "Tech Corp",
      "cargo": "Junior Dev",
      "desde": "2015-01-01"
    }
  ]
}
```

Los componentes UI se reconstruyen desde el schema de la plantilla cada vez que se visualiza el legajo.

---

## Mejores Prácticas

### Diseño de Plantillas

1. **Header al inicio**: Colocar header como primer componente
2. **Paginador único**: Solo un paginador por plantilla
3. **Agrupación lógica**: Agrupar campos relacionados en páginas
4. **Relaciones al final**: Componentes de relación después de datos básicos

### Configuración de Paginador

1. **Páginas balanceadas**: 3-7 campos por página
2. **Títulos descriptivos**: Nombres claros para cada página
3. **Campos requeridos primero**: Datos críticos en primeras páginas
4. **Validación progresiva**: Validar antes de avanzar

### Templates en Header

1. **Datos disponibles**: Usar solo campos que existen en el formulario
2. **Fallbacks**: Considerar que campos pueden estar vacíos
3. **Formato consistente**: Mantener formato uniforme en títulos

### Performance

1. **Lazy loading**: Componentes UI se cargan bajo demanda
2. **Memoización**: Usar useMemo para cálculos costosos
3. **Validación eficiente**: Validar solo campos necesarios

---

## Resumen

### Componentes UI vs Componentes de Datos

| Aspecto | Componentes UI | Componentes de Datos |
|---------|---------------|---------------------|
| Almacenamiento | No se guardan | Se guardan en legajo.data |
| Propósito | Visual/Navegación | Captura de información |
| Configuración | En schema.nodes | En schema.nodes |
| Validación | No aplica | Validación Zod |
| Ejemplos | header, paginator, relation | text, number, date, select |

### Flujo de Datos

```
Plantilla (schema)
    ↓
DynamicForm separa UI/Data nodes
    ↓
Renderiza UI nodes → Control visual
    ↓
Renderiza Data nodes → Captura datos
    ↓
Validación Zod
    ↓
Submit → Backend guarda solo data
    ↓
Visualización → Reconstruye UI desde schema
```

### Puntos Clave

1. **Separación de responsabilidades**: UI para experiencia, Data para información
2. **Configuración centralizada**: Todo en el schema de la plantilla
3. **Validación automática**: Zod genera reglas desde configuración
4. **Modos adaptativos**: Comportamiento diferente según contexto (create/edit/view)
5. **Templates dinámicos**: Interpolación de datos en componentes UI
