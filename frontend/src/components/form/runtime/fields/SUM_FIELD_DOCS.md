# Campo Calculado (Sum Field) - Documentación

## Modos de Operación

### 1. Suma Simple (default)
Suma valores de campos numéricos del formulario.

```typescript
{
  id: 'total',
  type: 'sum',
  label: 'Total',
  calculationMode: 'sum', // opcional, es el default
  sources: ['campo1', 'campo2', 'campo3'],
  format: 'currency',
  currency: 'ARS',
  locale: 'es-AR',
  decimals: 2
}
```

### 2. Fórmula Personalizada
Permite operaciones matemáticas complejas.

```typescript
{
  id: 'total_con_iva',
  type: 'sum',
  label: 'Total con IVA',
  calculationMode: 'formula',
  sources: ['subtotal', 'descuento'],
  formula: '({subtotal} - {descuento}) * 1.21',
  format: 'currency',
  currency: 'ARS',
  decimals: 2,
  resultLabel: 'Total Final'
}
```

**Operadores soportados:**
- `+` Suma
- `-` Resta
- `*` Multiplicación
- `/` División
- `()` Paréntesis para prioridad

**Ejemplo de fórmulas:**
```javascript
// IVA 21%
'({subtotal} - {descuento}) * 1.21'

// Promedio
'({nota1} + {nota2} + {nota3}) / 3'

// Porcentaje
'({parcial} / {total}) * 100'

// Compleja
'(({base} * {cantidad}) - {descuento}) * (1 + {impuesto} / 100)'
```

### 3. Conteo de Registros (COUNT)
Cuenta registros de una tabla con filtros opcionales.

```typescript
{
  id: 'total_hijos',
  type: 'sum',
  label: 'Total de Hijos',
  calculationMode: 'count',
  format: 'number',
  decimals: 0,
  countConfig: {
    table: 'legajos',
    filters: [
      {
        column: 'padre_id',
        sourceField: 'id' // campo del formulario actual
      },
      {
        column: 'estado',
        sourceField: 'estado_filtro' // otro campo del formulario
      }
    ]
  },
  sources: ['id', 'estado_filtro'], // campos que se usan en filtros
  help: 'Cantidad de registros relacionados'
}
```

## Opciones de Formato

### format: 'number' (default)
```typescript
{
  format: 'number',
  decimals: 2 // cantidad de decimales
}
// Resultado: 1234.56
```

### format: 'currency'
```typescript
{
  format: 'currency',
  currency: 'ARS', // USD, EUR, ARS, etc.
  locale: 'es-AR', // es-AR, en-US, etc.
  decimals: 2
}
// Resultado: $ 1.234,56
```

### format: 'percentage'
```typescript
{
  format: 'percentage',
  decimals: 1
}
// Resultado: 85.5%
```

## Ejemplos Completos

### Ejemplo 1: Cálculo de Presupuesto
```typescript
[
  {
    id: 'materiales',
    type: 'currency',
    label: 'Costo de Materiales',
    currency: 'ARS'
  },
  {
    id: 'mano_obra',
    type: 'currency',
    label: 'Mano de Obra',
    currency: 'ARS'
  },
  {
    id: 'subtotal',
    type: 'sum',
    label: 'Subtotal',
    calculationMode: 'sum',
    sources: ['materiales', 'mano_obra'],
    format: 'currency',
    currency: 'ARS'
  },
  {
    id: 'total_final',
    type: 'sum',
    label: 'Total con IVA (21%)',
    calculationMode: 'formula',
    sources: ['subtotal'],
    formula: '{subtotal} * 1.21',
    format: 'currency',
    currency: 'ARS'
  }
]
```

### Ejemplo 2: Promedio de Calificaciones
```typescript
[
  {
    id: 'nota1',
    type: 'number',
    label: 'Nota 1',
    min: 0,
    max: 10
  },
  {
    id: 'nota2',
    type: 'number',
    label: 'Nota 2',
    min: 0,
    max: 10
  },
  {
    id: 'nota3',
    type: 'number',
    label: 'Nota 3',
    min: 0,
    max: 10
  },
  {
    id: 'promedio',
    type: 'sum',
    label: 'Promedio',
    calculationMode: 'formula',
    sources: ['nota1', 'nota2', 'nota3'],
    formula: '({nota1} + {nota2} + {nota3}) / 3',
    format: 'number',
    decimals: 2
  }
]
```

### Ejemplo 3: Conteo de Dependientes
```typescript
[
  {
    id: 'persona_id',
    type: 'info',
    label: 'ID de Persona',
    value: '123' // se obtiene del contexto
  },
  {
    id: 'total_dependientes',
    type: 'sum',
    label: 'Total de Dependientes',
    calculationMode: 'count',
    countConfig: {
      table: 'legajos',
      filters: [
        {
          column: 'responsable_id',
          sourceField: 'persona_id'
        },
        {
          column: 'tipo',
          sourceField: 'tipo_dependiente'
        }
      ]
    },
    sources: ['persona_id', 'tipo_dependiente'],
    format: 'number',
    decimals: 0,
    help: 'Cantidad de personas a cargo'
  }
]
```

## Tablas Permitidas para COUNT

Por seguridad, solo estas tablas están permitidas:
- `legajos`
- `personas`
- `documentos`
- `relaciones`

Para agregar más tablas, editar `backend/plantillas/views_calculated.py`

## API Endpoint

**GET** `/api/calculated-fields/count/`

**Query Parameters:**
- `table` (requerido): Nombre de la tabla
- `filter_{column}`: Filtros opcionales

**Ejemplo:**
```
GET /api/calculated-fields/count?table=legajos&filter_responsable_id=123&filter_estado=activo
```

**Respuesta:**
```json
{
  "count": 5,
  "table": "legajos"
}
```
