# Módulo de Legajos

## Descripción General

El módulo `legajos` gestiona la creación, almacenamiento y consulta de registros de datos basados en plantillas. Cada legajo es una instancia de una plantilla específica con datos reales ingresados por los usuarios.

## Estructura del Módulo

```
backend/legajos/
├── migrations/
│   └── 0001_initial.py              # Migración inicial
├── tests/
│   ├── test_get_legajo.py           # Tests de obtención
│   ├── test_list_legajos.py         # Tests de listado
│   ├── test_meta_service.py         # Tests de metadatos
│   └── test_serializer.py           # Tests de serializers
├── __init__.py
├── models.py                        # Modelo Legajo
├── serializers.py                   # Serializers DRF
├── services.py                      # Lógica de negocio
├── urls.py                          # URLs del módulo
├── utils.py                         # Utilidades
└── viewsets.py                      # ViewSets DRF
```

## Modelo Principal

### Legajo
```python
class Legajo(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    plantilla = models.ForeignKey(Plantilla, on_delete=models.PROTECT)
    data = models.JSONField()                    # Datos del formulario
    grid_values = models.JSONField()             # Valores para grid/tabla
    search_document = models.TextField()         # Documento de búsqueda
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
```

### Campos del Modelo

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | UUID | Identificador único |
| `plantilla` | ForeignKey | Referencia a la plantilla base |
| `data` | JSONField | Datos del formulario completado |
| `grid_values` | JSONField | Valores calculados para visualización |
| `search_document` | TextField | Documento indexado para búsqueda |
| `created_at` | DateTime | Fecha de creación |
| `updated_at` | DateTime | Fecha de última actualización |

## Estructura de Datos

### Formato del Campo `data`
```json
{
  "campo_nombre": "Juan Pérez",
  "campo_email": "juan@example.com",
  "campo_telefono": "+54 11 1234-5678",
  "campo_fecha_nacimiento": "1990-05-15",
  "campo_categoria": "premium",
  "campo_comentarios": "Cliente VIP con descuentos especiales",
  "campo_activo": true,
  "seccion_datos_personales": {
    "completado": true,
    "fecha_completado": "2024-01-15T10:30:00Z"
  }
}
```

### Formato del Campo `grid_values`
```json
{
  "display_name": "Juan Pérez",
  "primary_email": "juan@example.com",
  "status": "Activo",
  "category": "Premium",
  "last_contact": "2024-01-15",
  "score": 95,
  "tags": ["VIP", "Premium", "Activo"],
  "summary": "Cliente premium activo desde 2023"
}
```

## Servicios de Negocio

### services.py

#### LegajoService
```python
class LegajoService:
    @staticmethod
    def create_legajo(plantilla_id, data, user=None):
        """Crea un nuevo legajo con validación"""
        
    @staticmethod
    def update_legajo(legajo_id, data, user=None):
        """Actualiza un legajo existente"""
        
    @staticmethod
    def validate_data_against_schema(data, schema):
        """Valida datos contra el schema de la plantilla"""
        
    @staticmethod
    def calculate_grid_values(data, plantilla):
        """Calcula valores para visualización en grid"""
        
    @staticmethod
    def build_search_document(data, grid_values, legajo_id):
        """Construye documento de búsqueda"""
```

#### MetaService
```python
class MetaService:
    @staticmethod
    def get_legajo_metadata(legajo_id):
        """Obtiene metadatos del legajo"""
        
    @staticmethod
    def get_field_statistics(plantilla_id, field_id):
        """Estadísticas de un campo específico"""
        
    @staticmethod
    def get_usage_analytics(plantilla_id):
        """Analíticas de uso de la plantilla"""
```

## Utilidades

### utils.py

#### build_search_document
```python
def build_search_document(data, grid_values, legajo_id):
    """
    Construye un documento de texto para búsqueda full-text
    Combina todos los valores de texto del legajo
    """
    document_parts = [str(legajo_id)]
    
    # Agregar datos del formulario
    for key, value in data.items():
        if isinstance(value, str):
            document_parts.append(value.lower())
        elif isinstance(value, (int, float)):
            document_parts.append(str(value))
    
    # Agregar valores del grid
    for key, value in (grid_values or {}).items():
        if isinstance(value, str):
            document_parts.append(value.lower())
    
    return " ".join(document_parts)
```

#### validate_field_value
```python
def validate_field_value(value, field_config):
    """Valida un valor contra la configuración del campo"""
    field_type = field_config.get('type')
    required = field_config.get('required', False)
    validation = field_config.get('validation', {})
    
    # Validaciones por tipo de campo
    if field_type == 'email':
        return validate_email(value)
    elif field_type == 'phone':
        return validate_phone(value)
    elif field_type == 'cuit':
        return validate_cuit(value)
    # ... más validaciones
```

## Serializers

### LegajoSerializer
```python
class LegajoSerializer(serializers.ModelSerializer):
    plantilla_nombre = serializers.CharField(source='plantilla.nombre', read_only=True)
    plantilla_schema = serializers.JSONField(source='plantilla.schema', read_only=True)
    
    class Meta:
        model = Legajo
        fields = '__all__'
        
    def validate_data(self, value):
        """Valida datos contra el schema de la plantilla"""
        plantilla = self.instance.plantilla if self.instance else None
        if not plantilla and 'plantilla' in self.initial_data:
            plantilla = Plantilla.objects.get(id=self.initial_data['plantilla'])
            
        if plantilla:
            LegajoService.validate_data_against_schema(value, plantilla.schema)
        return value
        
    def create(self, validated_data):
        """Crea legajo con cálculo automático de grid_values"""
        legajo = super().create(validated_data)
        legajo.grid_values = LegajoService.calculate_grid_values(
            legajo.data, legajo.plantilla
        )
        legajo.save()
        return legajo
```

### LegajoListSerializer
```python
class LegajoListSerializer(serializers.ModelSerializer):
    """Serializer optimizado para listados"""
    plantilla_nombre = serializers.CharField(source='plantilla.nombre', read_only=True)
    display_data = serializers.SerializerMethodField()
    
    class Meta:
        model = Legajo
        fields = ['id', 'plantilla_nombre', 'display_data', 'created_at', 'updated_at']
        
    def get_display_data(self, obj):
        """Retorna datos optimizados para visualización"""
        return obj.grid_values or {}
```

## ViewSets y Endpoints

### LegajoViewSet
```python
class LegajoViewSet(viewsets.ModelViewSet):
    queryset = Legajo.objects.select_related('plantilla').all()
    serializer_class = LegajoSerializer
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['plantilla', 'created_at']
    search_fields = ['search_document']
    ordering_fields = ['created_at', 'updated_at']
    ordering = ['-created_at']
    
    def get_serializer_class(self):
        if self.action == 'list':
            return LegajoListSerializer
        return LegajoSerializer
        
    @action(detail=True, methods=['post'])
    def duplicate(self, request, pk=None):
        """Duplica un legajo existente"""
        
    @action(detail=True, methods=['get'])
    def export(self, request, pk=None):
        """Exporta legajo a diferentes formatos"""
        
    @action(detail=False, methods=['post'])
    def bulk_create(self, request):
        """Creación masiva de legajos"""
        
    @action(detail=False, methods=['get'])
    def statistics(self, request):
        """Estadísticas de legajos"""
```

### Endpoints Disponibles

| Método | URL | Descripción |
|--------|-----|-------------|
| GET | `/api/legajos/` | Listar legajos |
| POST | `/api/legajos/` | Crear legajo |
| GET | `/api/legajos/{id}/` | Obtener legajo |
| PUT | `/api/legajos/{id}/` | Actualizar legajo |
| PATCH | `/api/legajos/{id}/` | Actualización parcial |
| DELETE | `/api/legajos/{id}/` | Eliminar legajo |
| POST | `/api/legajos/{id}/duplicate/` | Duplicar legajo |
| GET | `/api/legajos/{id}/export/` | Exportar legajo |
| POST | `/api/legajos/bulk_create/` | Creación masiva |
| GET | `/api/legajos/statistics/` | Estadísticas |

## Funcionalidades de Búsqueda

### 1. Búsqueda Full-Text
```python
# Búsqueda en el documento indexado
legajos = Legajo.objects.filter(
    search_document__icontains=query
)
```

### 2. Filtros Avanzados
```python
# Filtros por campos específicos
legajos = Legajo.objects.filter(
    plantilla__nombre='Clientes',
    data__campo_categoria='premium',
    created_at__gte=fecha_inicio
)
```

### 3. Búsqueda por JSON
```python
# Búsqueda en campos JSON específicos
legajos = Legajo.objects.filter(
    data__campo_email__icontains='@gmail.com'
)
```

## Validaciones

### 1. Validación de Schema
```python
def validate_data_against_schema(data, schema):
    """Valida que los datos cumplan con el schema de la plantilla"""
    fields = schema.get('fields', [])
    
    for field in fields:
        field_id = field['id']
        field_type = field['type']
        required = field.get('required', False)
        
        # Verificar campos requeridos
        if required and field_id not in data:
            raise ValidationError(f"Field {field_id} is required")
            
        # Validar tipo de dato
        if field_id in data:
            validate_field_type(data[field_id], field_type)
```

### 2. Validaciones por Tipo de Campo
```python
def validate_field_type(value, field_type):
    """Valida el valor según el tipo de campo"""
    validators = {
        'email': validate_email,
        'phone': validate_phone,
        'cuit': validate_cuit,
        'number': validate_number,
        'date': validate_date,
    }
    
    validator = validators.get(field_type)
    if validator:
        validator(value)
```

## Integración con Flujos

### 1. Envío a Flujos
```python
@action(detail=True, methods=['post'])
def send_to_flow(self, request, pk=None):
    """Envía legajo a un flujo de trabajo"""
    legajo = self.get_object()
    flow_id = request.data.get('flow_id')
    
    # Crear instancia de flujo
    flow_instance = FlowService.create_instance(
        flow_id=flow_id,
        legajo_id=legajo.id,
        user=request.user
    )
    
    return Response({'instance_id': flow_instance.id})
```

### 2. Historial de Flujos
```python
@action(detail=True, methods=['get'])
def flow_history(self, request, pk=None):
    """Obtiene historial de flujos del legajo"""
    legajo = self.get_object()
    instances = InstanciaFlujo.objects.filter(
        legajo_id=legajo.id
    ).order_by('-started_at')
    
    return Response(FlowInstanceSerializer(instances, many=True).data)
```

## Optimizaciones de Rendimiento

### 1. Índices de Base de Datos
```python
class Meta:
    indexes = [
        models.Index(fields=['plantilla', 'created_at']),
        models.Index(fields=['search_document']),
        models.Index(fields=['updated_at']),
    ]
```

### 2. Select Related
```python
# Optimizar consultas con plantillas
queryset = Legajo.objects.select_related('plantilla')
```

### 3. Paginación
```python
# Paginación automática en ViewSet
pagination_class = PageNumberPagination
page_size = 20
```

## Testing

### Tests Incluidos
- `test_get_legajo.py`: Tests de obtención de legajos
- `test_list_legajos.py`: Tests de listado y filtros
- `test_meta_service.py`: Tests de servicios de metadatos
- `test_serializer.py`: Tests de serializers

### Casos de Prueba
```python
class LegajoTestCase(TestCase):
    def test_create_legajo_with_valid_data(self):
        """Test creación de legajo con datos válidos"""
        
    def test_validate_data_against_schema(self):
        """Test validación contra schema"""
        
    def test_search_functionality(self):
        """Test funcionalidad de búsqueda"""
        
    def test_grid_values_calculation(self):
        """Test cálculo de valores de grid"""
```

## Consideraciones de Seguridad

### 1. Validación de Entrada
- Sanitización de datos JSON
- Validación contra schema
- Límites de tamaño de datos

### 2. Permisos
- Verificación de permisos por legajo
- Auditoría de cambios
- Control de acceso por plantilla

### 3. Protección de Datos
- Encriptación de campos sensibles
- Anonimización para reportes
- Backup automático de datos críticos