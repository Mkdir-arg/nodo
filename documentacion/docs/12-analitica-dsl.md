# Analitica DSL (v0)

Este documento describe el DSL analitico usado por el chat analitico de Nodo. El objetivo es permitir consultas de solo lectura sobre legajos, con validacion estricta y sin SQL directo.

## Objetivo

- Consultar legajos de forma segura y parametrizada.
- Respetar multi-tenant (una DB por instancia).
- Evitar exposicion de PII y campos no autorizados.

## Endpoints

### Catalogo de campos

`GET /api/legajos/analytics/catalog/?plantilla_id=<UUID>`

Parametros opcionales:

- `only_grid` (bool): expone solo campos con `seMuestraEnGrilla`.
- `include_system_fields` (bool): incluye campos de sistema (`id`, `created_at`, etc.).
- `include_sensitive` (bool): solo superuser; incluye `search_document`.

Respuesta:

- `fields`: lista de campos con `key`, `type`, `ops`.
- `meta.aggregate`: soporte de metricas y orden por metricas.
- `meta.examples`: ejemplos canonicos de DSL (list/aggregate).

### Validacion de DSL

`POST /api/legajos/analytics/validate/`

Body (opcionalmente envolver en `dsl`):

```
{
  "plantilla_id": "<UUID>",
  "dsl": { ... }
}
```

Respuesta:

- `ok`: boolean.
- `dsl`: payload normalizado (defaults aplicados).

### Consulta

`POST /api/legajos/analytics/query/`

Body (opcionalmente envolver en `dsl`):

```
{
  "plantilla_id": "<UUID>",
  "dsl": { ... }
}
```

Respuesta:

- `mode: list` => `results` con campos minimos.
- `mode: aggregate` => `groups` con resultados agregados.

## Permisos

Los endpoints del DSL requieren el permiso `analitica.use_analitica`.

## Especificacion DSL

### Estructura base

```
{
  "entity": "legajos",
  "mode": "list" | "aggregate",
  "filters": <expresion>,
  "order": [{"field": "...", "dir": "asc"|"desc"}],
  "limit": 10,
  "offset": 0,
  "group_by": ["campo"],
  "metrics": [{"op": "count", "as": "total"}]
}
```

### Filtros

- Operadores: `eq`, `ne`, `in`, `nin`, `gt`, `gte`, `lt`, `lte`, `contains`.
- Estructura booleana:

```
{ "and": [<expr>, <expr>] }
{ "or": [<expr>, <expr>] }
{ "not": <expr> }
{ "field": "edad", "op": "gte", "value": 18 }
```

### List mode

- Devuelve legajos minimos: `id`, `plantilla_id`, `grid_values`, `created_at`, `updated_at`, `display`.
- Usa `grid_values` para campos dinamicos.

### Aggregate mode

- Requiere `group_by` y `metrics`.
- `metrics` v0 soporta solo `count`.
- `order` puede referenciar aliases de metricas (ej. `total`).

## Ejemplos canonicos

### List

```
{
  "entity": "legajos",
  "mode": "list",
  "filters": {
    "and": [
      {"field": "edad", "op": "gte", "value": 18},
      {"field": "nombre", "op": "contains", "value": "Ana"}
    ]
  },
  "order": [{"field": "created_at", "dir": "desc"}],
  "limit": 10,
  "offset": 0
}
```

### Aggregate

```
{
  "entity": "legajos",
  "mode": "aggregate",
  "group_by": ["nombre"],
  "metrics": [{"op": "count", "as": "total"}],
  "order": [{"field": "total", "dir": "desc"}],
  "limit": 10,
  "offset": 0
}
```

## Guia para LLM

Objetivo: generar DSL valido y seguro.

Reglas:

1. **Siempre** llamar al catalogo primero para obtener campos permitidos y operadores por tipo.
2. Usar solo `fields[].key` del catalogo. No inventar campos.
3. No usar `include_sensitive` salvo autorizacion explicita.
4. Limitar `limit` a 50 o menos por defecto.
5. En `aggregate`, usar `metrics: [{"op":"count","as":"total"}]` y ordenar por `total` si se pide ranking.
6. En `list`, preferir `order` por `created_at` para estabilidad.
7. No generar SQL, solo DSL.

Sugerencia de flujo:

- Paso 1: GET catalogo (plantilla_id).
- Paso 2: Construir DSL (list o aggregate).
- Paso 3: POST validate.
- Paso 4: POST query.

## Validacion local con dsl_schema

El catalogo incluye `meta.dsl_schema`, un JSON Schema que permite validar el DSL en cliente antes de llamar a la API.

Recomendacion de uso:
- Obtener el catalogo (`GET /api/legajos/analytics/catalog/`).
- Validar el DSL contra `meta.dsl_schema` en el cliente.
- Si pasa, enviar a `/api/legajos/analytics/validate/` y luego a `/api/legajos/analytics/query/`.

Nota: el schema **no se versiona**. Los cambios se reflejan en caliente en el catalogo y el cliente debe recargarlo periodicamente.

## Errores comunes

- Campo no permitido (no esta en catalogo).
- `group_by` faltante en aggregate.
- `metric.field` distinto de `"*"` (no soportado en v0).
- `order` por alias no definido en `metrics`.
