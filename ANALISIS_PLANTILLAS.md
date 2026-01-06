# Análisis Completo del Sistema de Plantillas - Proyecto NODO

## 1. Persistencia de Plantillas en Base de Datos

### Modelo Django Principal
**Tabla/Modelo**: `Plantilla` (archivo: `backend/plantillas/models.py`)

**Campos principales**:
- `id`: UUIDField (primary key)
- `nombre`: CharField(255) - con constraint unique case-insensitive
- `descripcion`: TextField (nullable)
- `schema`: JSONField - **Estructura principal de la plantilla**
- `visual_config`: JSONField - Configuración visual adicional
- `layout_json`: JSONField - Layout específico para el editor
- `layout_version`: PositiveIntegerField - Versión del layout
- `version`: PositiveIntegerField - Versión de la plantilla
- `estado`: CharField (ACTIVO/INACTIVO)
- `created_at`, `updated_at`: DateTimeField

### Estructura de Datos
**La plantilla se guarda como JSON único** en el campo `schema`. No está normalizada en tablas separadas.

**Shape del JSON persistido** (ejemplo basado en el código):
```json
{
  "id": "uuid-plantilla",
  "name": "Plantilla Ejemplo",
  "version": 1,
  "nodes": [
    {
      "id": "fld_abc123",
      "type": "text",
      "kind": "field",
      "key": "nombre_ciudadano",
      "label": "Nombre del Ciudadano",
      "required": true,
      "layout": {
        "i": "fld_abc123",
        "x": 0,
        "y": 0,
        "w": 6,
        "h": 3
      }
    },
    {
      "id": "sec_def456", 
      "type": "section",
      "title": "Datos Personales",
      "nodes": [...],
      "layout_mode": "flow"
    }
  ],
  "sections": [...]
}
```

### Identificación de Campos
- **ID único**: `id` (generado automáticamente, ej: `fld_abc123`)
- **Key para mapeo**: `key` (ej: `nombre_ciudadano`) - usado para mapear valores del legajo
- **Key debe ser único** por plantilla (validado en `validateUniqueKey`)

### Versionado
- **Campo `version`**: Se incrementa automáticamente en cada update
- **No hay draft/published**: Solo existe una versión activa
- **Editar sobrescribe**: No crea nueva versión, incrementa `version`
- **Layout separado**: `layout_version` para cambios de diseño

### Orden y Layout
- **Estructura jerárquica**: `sections` → `nodes` (campos)
- **Layout por sección**: `layout_mode: 'flow' | 'grid'`
- **Posicionamiento**: Cada campo tiene `layout: {x, y, w, h}`

### Assets
- **No implementado**: No hay manejo de assets (imágenes, iconos)
- **Pendiente**: URLs externas, upload S3/local, o base64

### UI Nodes vs Fields
- **UI Nodes**: `kind: 'ui'` o `type` que empieza con `ui:` (ej: `ui:header`)
- **Data Fields**: `kind: 'field'` - persisten datos
- **Mismo array**: Ambos se guardan en `nodes[]`

### Validaciones Backend
**Archivo**: `backend/plantillas/validators.py`

**Validaciones implementadas**:
- Keys únicas (`validate_unique_keys`)
- Secciones no vacías (`validate_non_empty_sections`)
- Opciones en selects (`validate_select_options`)
- Referencias válidas en campos suma (`validate_sum_sources`)
- Condiciones válidas (`validate_conditions`)
- Grupos con hijos (`validate_group_children`)

**Errores típicos**:
- `"Key duplicada: nombre"`
- `"Sección vacía"`
- `"select requiere al menos 1 opción"`
- `"sum referencia inválida: campo_inexistente"`

## 2. API: Endpoints y Contrato (DRF)

### Endpoints Principales
**Base**: `/api/plantillas/`

- `GET /api/plantillas/` - Listar plantillas (con paginación)
- `POST /api/plantillas/` - Crear plantilla
- `GET /api/plantillas/{id}/` - Obtener plantilla
- `PUT/PATCH /api/plantillas/{id}/` - Actualizar plantilla
- `DELETE /api/plantillas/{id}/` - Desactivar (soft delete)
- `GET /api/plantillas/exists/?nombre=X` - Verificar nombre único
- `PATCH /api/plantillas/{id}/visual-config/` - Actualizar config visual
- `GET/PUT /api/plantillas/{id}/layout/` - Manejar layout específico

### Estrategia de Guardado
- **JSON completo**: Frontend envía schema completo en cada save
- **No deltas**: No hay cambios incrementales
- **Guardado manual**: No hay autosave implementado
- **Sin control de concurrencia**: No hay optimistic locking ni ETag

### Permisos
- `IsAuthenticated` requerido
- Permisos específicos: `plantillas.add_plantilla`, `plantillas.change_plantilla`

## 3. Renderizado durante Configuración (Builder)

### Componente Principal
**Archivo**: `frontend/src/components/form/builder/Builder.tsx`

### Store Principal
**Archivo**: `frontend/src/lib/store/usePlantillaBuilderStore.ts`
- **Zustand store** como source of truth
- **Estado**: `sections[]`, `selected`, `dirty`, metadata de plantilla

### Transformación de Datos
**Adapter**: Función `normalizeSection()` y `ensureLayout()`
- Convierte JSON persistido → estructura editable
- Asegura IDs, layouts, y estructura consistente

### Estados del Builder
- **Selección**: `selected: {type: 'section'|'field', id: string}`
- **Dirty flag**: `dirty: boolean` para cambios no guardados
- **Secciones**: Array de `SectionNode` con `nodes[]`

### Source of Truth
**Zustand store** es el source of truth principal:
- **No usa React Hook Form** en el builder
- **XState**: No se usa actualmente
- **RHF**: Solo para propiedades de campos individuales

### Elementos Visuales Implementados
**UI Nodes existentes** (en `factory.ts`):
- `ui:header` - Encabezado con foto y datos
- `ui:kpi-grid` - Grid de KPIs/métricas
- `ui:divider` - Separador visual
- `ui:banner` - Banner informativo
- `ui:summary-pinned` - Resumen fijado
- `ui:attachments` - Adjuntos
- `ui:timeline` - Línea de tiempo

**Estado actual**: Implementados como tipos, pero renderizado limitado

## 4. Ejecución en Legajo (Instancia de Plantilla)

### Modelo de Legajo
**Archivo**: `backend/legajos/models.py`

**Campos**:
- `id`: UUIDField
- `plantilla`: ForeignKey a Plantilla (PROTECT)
- `data`: JSONField - **Valores del legajo**
- `grid_values`: JSONField - Valores para grilla
- `search_document`: TextField - Documento de búsqueda

### Relación con Plantilla
- **FK con PROTECT**: No se puede eliminar plantilla con legajos
- **No hay snapshot**: Legajo referencia plantilla actual
- **Cambios afectan**: Si cambias plantilla, afecta legajos existentes

### Estructura de Datos del Legajo
```json
{
  "nombre_ciudadano": "Juan Pérez",
  "edad": 35,
  "documento": "12345678",
  "grupo_familiar": [
    {"nombre": "María", "relacion": "esposa"},
    {"nombre": "Pedro", "relacion": "hijo"}
  ]
}
```

### Renderizado de Legajo
**Archivo**: `frontend/src/lib/forms/runtime/DynamicFormRenderer`
- **Renderer separado**: No reutiliza el builder
- **Modo runtime**: Solo lectura/edición de datos

### Validación de Datos
- **Frontend**: Zod schemas generados desde plantilla
- **Backend**: Validaciones DRF básicas
- **No JSON Schema nativo**: Se usa Zod

### Campos Condicionales
**Archivo**: `frontend/src/lib/form-builder/visibility.ts`
- **Evaluación frontend**: Reglas de visibilidad
- **Condiciones**: `condicionesOcultar` en cada campo
- **Operadores**: `eq`, `ne`, `in`, `nin`, `gt`, `gte`, `lt`, `lte`, `contains`

### UI Nodes en Runtime
- **Se muestran**: UI nodes se renderizan en el legajo
- **Solo visuales**: No persisten datos

## 5. Componente "Encabezado" Específico

### Configuración Actual
**Tipo**: `ui:header` en `factory.ts`

**Config por defecto**:
```json
{
  "variant": "hero",
  "show_photo": true,
  "title": "{{ data.ciudadano.apellido }}, {{ data.ciudadano.nombre }}",
  "subtitle": "Legajo de Ciudadano"
}
```

### Partes Configurables vs Globales
- **Imagen de fondo**: No implementado (pendiente)
- **Card inferior**: Configurable por plantilla
- **Datos mostrados**: Templates con `{{ data.campo }}`
- **Iconos/botones**: No implementados (pendiente)

### Uso del Encabezado
- **Builder**: Vista previa limitada
- **Runtime**: Renderizado completo en legajo
- **Datos dinámicos**: Consume valores del legajo actual

### Consumo de Datos
**Sí necesita datos del legajo**:
- Templates: `{{ data.ciudadano.nombre }}`
- Metadatos: `{{ meta.counts.intervenciones }}`
- Contexto: `{{ context.comedor.nombre }}`

## 6. Limitaciones y Consideraciones Técnicas

### Limitaciones del Schema
- **Sections sin key**: Solo tienen `id` y `title`
- **Groups con key**: Sí tienen `key` para agrupación
- **No creación runtime**: Campos no se crean dinámicamente

### Catálogo de Tipos Soportados
**Inputs**:
- `text`, `textarea`, `number`, `email`, `date`, `phone`
- `select`, `multiselect`, `dropdown`, `select_with_filter`
- `checkbox`, `document`, `image`

**Containers**:
- `section`, `group`

**Especiales**:
- `sum`, `info`, `cuit_razon_social`

**UI Nodes**:
- `ui:header`, `ui:kpi-grid`, `ui:divider`, `ui:banner`
- `ui:summary-pinned`, `ui:attachments`, `ui:timeline`

### Recomendación para Encabezado
**Tipo recomendado**: `ui:header` (UI node sin key)
- **Razón**: Es puramente visual, no persiste datos
- **Configuración**: Via `config` object
- **Flexibilidad**: Permite templates dinámicos

### Estado de Producción vs Planificado
**En producción**:
- CRUD básico de plantillas
- Builder funcional con drag & drop
- Validaciones backend
- Ejecución de legajos básica

**Planificado/Limitado**:
- UI nodes con renderizado completo
- Manejo de assets (imágenes)
- Autosave y control de concurrencia
- Versionado avanzado
- Componentes visuales ricos

### Consideraciones de Performance
- **JSON parsing**: Schemas grandes pueden ser lentos
- **Validaciones**: Se ejecutan en cada save
- **Search document**: Se regenera en cada save de legajo
- **Sin caché**: No hay caché de schemas compilados

### Recomendaciones de Mejora
1. **Implementar autosave** con debounce
2. **Agregar optimistic locking** para concurrencia
3. **Caché de schemas** compilados
4. **Snapshot de plantillas** en legajos
5. **Manejo de assets** (S3/CDN)
6. **Validaciones asíncronas** para mejor UX
7. **Componentes visuales** más ricos
8. **Templates engine** más robusto para UI nodes
