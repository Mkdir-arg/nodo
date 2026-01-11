# RelationNode Component

Componente para gestionar relaciones entre legajos de diferentes plantillas.

## Uso

### En el Constructor de Plantillas

```typescript
import { RelationNodeComponent } from '@/components/form/builder/ui-nodes/RelationNode';

const relationNode = {
  id: "relation-1",
  type: "ui:relation",
  kind: "ui",
  config: {
    relation_type: "proyectos",
    inverse_relation_type: "empleados",
    target_plantilla_id: "uuid-plantilla-proyectos",
    title: "Proyectos Asignados",
    description: "Proyectos en los que participa el empleado",
    allow_create: true,
    allow_remove: true,
    display_fields: ["nombre", "fecha_inicio", "estado"],
    search_fields: ["nombre", "codigo"]
  }
};

<RelationNodeComponent 
  node={relationNode}
  mode="edit"
  legajoId="uuid-legajo-actual"
/>
```

### Modos de Visualización

- **create**: Deshabilitado con mensaje informativo
- **edit**: Completamente funcional con búsqueda y acciones
- **view**: Solo lectura, sin botones de acción

### Integración con API

El componente necesita implementar tres funciones:

```typescript
// Buscar legajos para relacionar
const handleSearch = async (query: string) => {
  const response = await fetch(`/api/legajos/search?q=${query}&plantilla=${config.target_plantilla_id}`);
  return response.json();
};

// Crear relación
const handleAdd = async (recordId: string) => {
  await fetch('/api/relations', {
    method: 'POST',
    body: JSON.stringify({
      source_legajo: legajoId,
      target_legajo: recordId,
      relation_type: config.relation_type,
      inverse_relation_type: config.inverse_relation_type
    })
  });
};

// Eliminar relación
const handleRemove = async (recordId: string) => {
  await fetch(`/api/relations/${relationId}`, {
    method: 'DELETE'
  });
};
```

## Diseño

El componente sigue el mismo estilo glass morphism del HeaderNode:
- Backdrop blur + bg-white/90
- Bordes redondeados (rounded-2xl)
- Sombras (shadow-xl)
- Gradientes en iconos
- Transiciones suaves

## Estados

- **Loading**: Skeleton loaders con efecto glass
- **Empty**: Estado vacío con icono y mensaje
- **With Data**: Lista de relaciones con cards
- **Disabled**: Modo creación con banner informativo
