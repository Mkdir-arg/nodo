# Módulo de Plantillas

## Descripción General

El módulo `plantillas` gestiona la creación, edición y administración de plantillas de formularios dinámicos. Permite definir esquemas de datos, configuraciones visuales y layouts para la generación automática de formularios.

## Estructura del Módulo

```
backend/plantillas/
├── management/
│   └── commands/
│       └── seed_plantillas.py        # Datos de prueba
├── migrations/
│   └── 0001_initial.py              # Migración inicial
├── tests/
│   ├── test_layout_api.py           # Tests de layout
│   ├── test_validators.py           # Tests de validadores
│   └── test_visual_config_serializer.py # Tests de serializers
├── __init__.py
├── models.py                        # Modelo Plantilla
├── serializers.py                   # Serializers DRF
├── urls.py                          # URLs del módulo
├── utils.py                         # Utilidades
├── validators.py                    # Validadores personalizados
└── viewsets.py                      # ViewSets DRF
```

## Modelo Principal

### Plantilla
```python
class Plantilla(models.Model):
    class Estado(models.TextChoices):
        ACTIVO = "ACTIVO", "ACTIVO"
        INACTIVO = "INACTIVO", "INACTIVO"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    nombre = models.CharField(max_length=255, unique=False)
    descripcion = models.TextField(null=True, blank=True)
    schema = models.JSONField()                    # Esquema de campos
    visual_config = models.JSONField()             # Configuración visual
    layout_json = models.JSONField()               # Layout del formulario
    layout_version = models.PositiveIntegerField(default=1)
    version = models.PositiveIntegerField(default=1)
    estado = models.CharField(max_length=10, choices=Estado.choices)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
```

### Campos del Modelo

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | UUID | Identificador único |
| `nombre` | CharField | Nombre de la plantilla |
| `descripcion` | TextField | Descripción opcional |
| `schema` | JSONField | Esquema de campos y validaciones |
| `visual_config` | JSONField | Configuración visual (colores, estilos) |
| `layout_json` | JSONField | Layout del formulario (posiciones, grid) |
| `layout_version` | Integer | Versión del layout |
| `version` | Integer | Versión de la plantilla |
| `estado` | CharField | ACTIVO/INACTIVO |

## Estructura del Schema

### Formato del Schema JSON
```json
{
  "fields": [
    {
      "id": "campo_1",
      "type": "text",
      "label": "Nombre",
      "required": true,
      "validation": {
        "minLength": 2,
        "maxLength": 100
      },
      "placeholder": "Ingrese su nombre"
    },
    {
      "id": "campo_2",
      "type": "email",
      "label": "Email",
      "required": true,
      "validation": {
        "pattern": "email"
      }
    },
    {
      "id": "campo_3",
      "type": "select",
      "label": "Categoría",
      "required": false,
      "options": [
        {"value": "cat1", "label": "Categoría 1"},
        {"value": "cat2", "label": "Categoría 2"}
      ]
    }
  ],
  "sections": [
    {
      "id": "seccion_1",
      "title": "Datos Personales",
      "fields": ["campo_1", "campo_2"]
    },
    {
      "id": "seccion_2",
      "title": "Información Adicional",
      "fields": ["campo_3"]
    }
  ]
}
```

### Tipos de Campo Soportados

| Tipo | Descripción | Validaciones |
|------|-------------|--------------|
| `text` | Campo de texto | minLength, maxLength, pattern |
| `email` | Email | pattern email |
| `number` | Número | min, max, step |
| `date` | Fecha | min, max |
| `select` | Lista desplegable | options requeridas |
| `multiselect` | Selección múltiple | options, minItems, maxItems |
| `checkbox` | Casilla de verificación | - |
| `radio` | Botones de radio | options requeridas |
| `textarea` | Área de texto | minLength, maxLength |
| `file` | Archivo | accept, maxSize |
| `phone` | Teléfono | pattern |
| `cuit` | CUIT/CUIL | validation específica |

## Configuración Visual

### Estructura visual_config
```json
{
  "theme": {
    "primaryColor": "#3b82f6",
    "secondaryColor": "#64748b",
    "backgroundColor": "#ffffff",
    "textColor": "#1f2937"
  },
  "layout": {
    "columns": 2,
    "spacing": "medium",
    "borderRadius": "rounded",
    "shadow": "sm"
  },
  "fields": {
    "labelPosition": "top",
    "inputSize": "medium",
    "showRequired": true,
    "errorPosition": "bottom"
  }
}
```

## Layout JSON

### Estructura del Layout
```json
{
  "version": 1,
  "grid": {
    "columns": 12,
    "rows": "auto",
    "gap": 16
  },
  "sections": [
    {
      "id": "seccion_1",
      "position": {
        "x": 0,
        "y": 0,
        "w": 12,
        "h": 4
      },
      "style": {
        "backgroundColor": "#f8fafc",
        "padding": 16,
        "borderRadius": 8
      }
    }
  ],
  "fields": [
    {
      "id": "campo_1",
      "section": "seccion_1",
      "position": {
        "x": 0,
        "y": 0,
        "w": 6,
        "h": 1
      }
    },
    {
      "id": "campo_2",
      "section": "seccion_1",
      "position": {
        "x": 6,
        "y": 0,
        "w": 6,
        "h": 1
      }
    }
  ]
}
```

## Serializers

### PlantillaSerializer
```python
class PlantillaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Plantilla
        fields = '__all__'
        
    def validate_schema(self, value):
        # Validación del esquema JSON
        # Verificar estructura requerida
        # Validar tipos de campo
        return value
        
    def validate_layout_json(self, value):
        # Validación del layout
        # Verificar posiciones válidas
        # Validar referencias a campos
        return value
```

### VisualConfigSerializer
```python
class VisualConfigSerializer(serializers.Serializer):
    theme = ThemeSerializer()
    layout = LayoutConfigSerializer()
    fields = FieldConfigSerializer()
```

## ViewSets y Endpoints

### PlantillaViewSet
```python
class PlantillaViewSet(viewsets.ModelViewSet):
    queryset = Plantilla.objects.all()
    serializer_class = PlantillaSerializer
    filter_backends = [DjangoFilterBackend, SearchFilter]
    filterset_fields = ['estado', 'version']
    search_fields = ['nombre', 'descripcion']
```

### Endpoints Disponibles

| Método | URL | Descripción |
|--------|-----|-------------|
| GET | `/api/plantillas/` | Listar plantillas |
| POST | `/api/plantillas/` | Crear plantilla |
| GET | `/api/plantillas/{id}/` | Obtener plantilla |
| PUT | `/api/plantillas/{id}/` | Actualizar plantilla |
| PATCH | `/api/plantillas/{id}/` | Actualización parcial |
| DELETE | `/api/plantillas/{id}/` | Eliminar plantilla |
| POST | `/api/plantillas/{id}/duplicate/` | Duplicar plantilla |
| POST | `/api/plantillas/{id}/activate/` | Activar plantilla |
| POST | `/api/plantillas/{id}/deactivate/` | Desactivar plantilla |

## Validadores Personalizados

### validators.py
```python
def validate_schema_structure(schema):
    """Valida la estructura del schema JSON"""
    required_keys = ['fields', 'sections']
    for key in required_keys:
        if key not in schema:
            raise ValidationError(f"Missing required key: {key}")

def validate_field_types(fields):
    """Valida los tipos de campo soportados"""
    supported_types = ['text', 'email', 'number', 'date', 'select', ...]
    for field in fields:
        if field.get('type') not in supported_types:
            raise ValidationError(f"Unsupported field type: {field.get('type')}")

def validate_layout_positions(layout):
    """Valida las posiciones en el layout"""
    # Verificar que no haya solapamientos
    # Validar que las posiciones estén dentro del grid
    # Verificar referencias a campos existentes
```

## Utilidades

### utils.py
```python
def generate_form_schema(plantilla):
    """Genera esquema de formulario desde plantilla"""
    
def validate_form_data(data, schema):
    """Valida datos del formulario contra el schema"""
    
def merge_visual_config(base_config, custom_config):
    """Combina configuraciones visuales"""
    
def export_plantilla(plantilla_id):
    """Exporta plantilla a formato JSON"""
    
def import_plantilla(json_data):
    """Importa plantilla desde JSON"""
```

## Comandos de Gestión

### seed_plantillas.py
```bash
python manage.py seed_plantillas
```
- Crea plantillas de ejemplo
- Datos de prueba para desarrollo
- Plantillas con diferentes tipos de campo

## Funcionalidades Avanzadas

### 1. Versionado de Plantillas
- Control de versiones automático
- Historial de cambios
- Rollback a versiones anteriores

### 2. Duplicación de Plantillas
- Copia completa con nuevo ID
- Preserva configuración visual
- Incrementa versión automáticamente

### 3. Validación Dinámica
- Validación en tiempo real
- Reglas de negocio personalizadas
- Validación cruzada entre campos

### 4. Exportación/Importación
- Formato JSON estándar
- Migración entre entornos
- Backup de configuraciones

## Integración con Frontend

### 1. Editor Visual
- Drag & drop de campos
- Configuración visual en tiempo real
- Preview del formulario

### 2. Renderizado Dinámico
- Generación automática de formularios
- Aplicación de estilos visuales
- Validación del lado cliente

### 3. Gestión de Estado
```typescript
// Zustand store para plantillas
interface PlantillaStore {
  plantillas: Plantilla[]
  currentPlantilla: Plantilla | null
  loading: boolean
  fetchPlantillas: () => Promise<void>
  createPlantilla: (data: PlantillaData) => Promise<void>
  updatePlantilla: (id: string, data: Partial<PlantillaData>) => Promise<void>
}
```

## Testing

### Tests Incluidos
- `test_layout_api.py`: Tests de API de layout
- `test_validators.py`: Tests de validadores
- `test_visual_config_serializer.py`: Tests de serializers

### Cobertura de Tests
- Validación de schemas
- Serialización/deserialización
- Endpoints de API
- Validadores personalizados
- Utilidades de transformación

## Consideraciones de Rendimiento

### 1. Optimizaciones
- Índices en campos de búsqueda
- Cache de plantillas frecuentes
- Lazy loading de configuraciones

### 2. Límites
- Máximo 100 campos por plantilla
- Tamaño máximo de schema: 1MB
- Timeout de validación: 30 segundos