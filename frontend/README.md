# Frontend de formularios

Este paquete contiene la aplicación Next.js encargada del constructor de plantillas y del runtime de formularios para legajos. Incluye el editor visual, los servicios para persistir plantillas y el componente `DynamicForm` para renderizar esquemas guardados.

## Scripts útiles

```bash
npm install        # instala dependencias
npm run dev        # levanta el entorno de desarrollo
npm run lint       # ejecuta el lint de Next.js
npm run build      # genera el build de producción
npm test           # corre la suite de Vitest
```

## Flujo de trabajo del editor

### 1. Acceder al constructor
- Ingresá a `/plantillas` para listar las plantillas disponibles. Desde el botón `+ Crear plantilla` se navega a `/plantillas/crear`, que monta el componente `<Builder />` con el constructor completo.【F:frontend/src/components/plantillas/PlantillasPage.tsx†L36-L73】【F:frontend/src/app/plantillas/crear/page.tsx†L1-L9】
- Para editar una existente, el botón `Editar` navega a `/plantillas/editar/[id]`, que carga la plantilla desde la API antes de inyectarla en `<Builder />`.【F:frontend/src/components/plantillas/PlantillasPage.tsx†L208-L229】【F:frontend/src/app/plantillas/editar/[id]/page.tsx†L1-L10】

### 2. Construir secciones y campos
- El constructor inicializa el store con la plantilla recibida, agrega una sección vacía en caso de ser necesario y sincroniza la pestaña visual. Además registra manejadores globales para abrir la modal de componentes y la de propiedades.【F:frontend/src/components/form/builder/Builder.tsx†L1-L89】
- El lienzo central permite crear secciones, arrastrarlas y cambiar sus campos mediante `dnd-kit`. El botón `+ Agregar sección` dispara la creación y abre automáticamente la selección de componentes.【F:frontend/src/components/form/builder/Canvas.tsx†L19-L79】
- Cada sección (`SortableSection`) ofrece cambiar el título, modo de disposición (lista o grilla), duplicarla o eliminarla. Dentro se renderizan los campos arrastrables (`SortableField`), con acciones de duplicar, editar o eliminar.【F:frontend/src/components/form/builder/dnd/SortableSection.tsx†L1-L99】【F:frontend/src/components/form/builder/dnd/SortableField.tsx†L1-L40】
- El botón flotante `+` abre la paleta de componentes. Desde la modal podés insertar campos básicos, avanzados y bloques de UI; al elegir uno se agrega en la sección seleccionada y se abre la modal de propiedades.【F:frontend/src/components/form/builder/FloatingToolbar.tsx†L1-L10】【F:frontend/src/components/form/builder/ComponentsModal.tsx†L1-L63】

### 3. Editar propiedades de los campos
- Al hacer clic en `Editar` se abre `FieldPropertiesModal`, que clona el nodo seleccionado y muestra controles comunes (etiqueta, key, flags de obligatoriedad y visibilidad) más ajustes específicos por tipo: placeholders y regex para textos, rangos numéricos, opciones para selects, límites de archivos, fuentes de sumas, etc.【F:frontend/src/components/form/builder/FieldPropertiesModal.tsx†L1-L162】
- Los campos de suma muestran las claves numéricas disponibles mediante `collectKeysByType` para garantizar consistencia, y los grupos (`group`) permiten editar nodos anidados desde la misma modal.【F:frontend/src/components/form/builder/FieldPropertiesModal.tsx†L105-L160】【F:frontend/src/lib/store/usePlantillaBuilderStore.ts†L188-L268】

### 4. Configuración visual
- La pestaña “Visual” permite ajustar encabezado y contadores del legajo (variante, textos y KPIs). Cada cambio persiste en el store `useTemplateStore` para guardarse junto con el esquema.【F:frontend/src/components/form/builder/Builder.tsx†L14-L70】【F:frontend/src/components/plantillas/VisualTab.tsx†L1-L73】

### 5. Guardar la plantilla
- El encabezado (`BuilderHeader`) incluye el campo “Nombre de la plantilla” y el botón `Guardar`. Antes de persistir ejecuta `validateAll()` del store, que verifica secciones no vacías, claves únicas y configuración coherente (por ejemplo que las sumas apunten a números). Si hay errores se muestra un `alert` con el detalle.【F:frontend/src/components/form/builder/BuilderHeader.tsx†L1-L61】【F:frontend/src/lib/store/usePlantillaBuilderStore.ts†L212-L256】
- En caso exitoso serializa la plantilla con `serializeTemplateSchema`, envía los datos a `PlantillasService.savePlantilla` y actualiza la configuración visual. Luego invalida las queries de React Query y redirige nuevamente a `/plantillas`.【F:frontend/src/components/form/builder/BuilderHeader.tsx†L62-L105】【F:frontend/src/lib/serializeTemplate.ts†L1-L48】【F:frontend/src/lib/services/plantillas.ts†L31-L68】

## Previsualización y runtime

### Previsualizar una plantilla
- Desde la lista de plantillas, el botón `Previsualizar` guarda el esquema en `localStorage` (clave `nodo.plantilla.preview`) y abre una nueva pestaña con `/plantillas/previsualizacion`.【F:frontend/src/components/plantillas/PlantillasPage.tsx†L209-L229】
- Esa página cliente lee el esquema del almacenamiento local y lo renderiza con `DynamicForm`, permitiendo revisar el formulario sin persistir un legajo.【F:frontend/src/app/plantillas/previsualizacion/page.tsx†L1-L9】

### Renderizado en producción
- Para usar una plantilla en la creación de legajos, navegá a `/legajos/nuevo?formId=<id>`. La vista lista los registros existentes mediante React Query y ofrece el botón `Crear` para abrir `/legajos/nuevo/crear?formId=<id>`.【F:frontend/src/app/legajos/nuevo/page.tsx†L1-L41】
- La pantalla de creación obtiene la plantilla, instancia `DynamicForm` y al enviar hace `POST /api/legajos` con la data. Tras un alta exitosa invalida la lista y vuelve a `/legajos/nuevo`.【F:frontend/src/app/legajos/nuevo/crear/_CreateView.tsx†L1-L54】
- `DynamicForm` normaliza distintas estructuras (`sections`, `nodes`, `fields`), filtra los nodos de UI y genera un esquema de validación con Zod (`zodFromTemplate`). Si no hay campos muestra un estado vacío con un CTA hacia el constructor.【F:frontend/src/components/form/runtime/DynamicForm.tsx†L1-L56】【F:frontend/src/components/form/runtime/DynamicForm.tsx†L58-L86】
- Cada nodo se resuelve mediante `DynamicNode`, que respeta condiciones de visibilidad y conecta el campo correcto (`text`, `number`, `select`, `date`, `document`, `sum`, `phone`, `cuit_razon_social`, `info`, `group`).【F:frontend/src/components/form/runtime/DynamicNode.tsx†L1-L44】

### Reutilizar `DynamicForm`

```tsx
import DynamicForm from '@/components/form/runtime/DynamicForm';

export default function Demo({ schema }) {
  return (
    <DynamicForm
      schema={schema}
      onSubmit={(values) => {
        console.log('Valores validados', values);
      }}
    />
  );
}
```

- Pasá cualquier estructura que contenga `nodes`, `fields` o `sections`; el componente los unifica internamente y asegura validación con `react-hook-form` + Zod.【F:frontend/src/components/form/runtime/DynamicForm.tsx†L1-L44】【F:frontend/src/components/form/builder/zodFromTemplate.ts†L1-L94】

## Componentes disponibles

| Tipo | Descripción | Props clave |
| --- | --- | --- |
| `text` / `textarea` | Campo de texto corto o largo. | `label`, `key`, `placeholder`, `required`, `maxLength`, `pattern` (regex).【F:frontend/src/lib/form-builder/factory.ts†L32-L56】【F:frontend/src/components/form/builder/FieldPropertiesModal.tsx†L113-L132】 |
| `number` | Entrada numérica con conversión automática. | `label`, `key`, `required`, `min`, `max`, `step`. Se expone como `<input type="number">`.【F:frontend/src/components/form/runtime/fields/NumberField.tsx†L1-L14】【F:frontend/src/components/form/builder/FieldPropertiesModal.tsx†L134-L148】 |
| `date` | Selector de fecha nativo. | `label`, `key`, `required`, límites opcionales. |【F:frontend/src/components/form/runtime/fields/DateField.tsx†L1-L10】
| `select` / `dropdown` | Lista desplegable de selección única. | `label`, `key`, `placeholder`, `options[{ value, label }]`, `required`.【F:frontend/src/components/form/runtime/fields/SelectField.tsx†L1-L23】【F:frontend/src/components/form/builder/FieldPropertiesModal.tsx†L150-L162】 |
| `multiselect` | Selector múltiple (usa `<select multiple>`). | Igual a `select`, acepta varias opciones y puede limitar cantidad. |【F:frontend/src/components/form/runtime/fields/SelectField.tsx†L1-L13】
| `select_with_filter` | Variante de selector que se trata igual que `select`, pero permite configurar filtros en backend. | Mismos props que `select`. |【F:frontend/src/components/form/runtime/DynamicNode.tsx†L29-L37】
| `document` | Campo de archivos con validaciones de extensión/tamaño. | `label`, `key`, `accept`, `maxSizeMB`, `isNewFileFlag`. Renderiza `<input type="file">`.【F:frontend/src/components/form/runtime/fields/DocumentField.tsx†L1-L9】【F:frontend/src/lib/form-builder/factory.ts†L42-L45】 |
| `sum` | Campo de sólo lectura que suma otras claves numéricas. | `label`, `key`, `sources[]`, `decimals`. Calcula el total en vivo mediante `useWatch`.【F:frontend/src/components/form/runtime/fields/SumField.tsx†L1-L15】【F:frontend/src/components/form/builder/FieldPropertiesModal.tsx†L162-L190】 |
| `phone` | Entrada telefónica sin formato específico. | `label`, `key`, `required`. |【F:frontend/src/components/form/runtime/fields/PhoneField.tsx†L1-L9】
| `cuit_razon_social` | Paquete de dos entradas (CUIT + Razón social) bajo la misma key. | `label`, `key`; genera subclaves `.cuit` y `.razon_social`.【F:frontend/src/components/form/runtime/fields/CuitRazonSocialField.tsx†L1-L10】 |
| `info` | Bloque informativo con HTML embebido. | `label`, `html`. Se renderiza con `dangerouslySetInnerHTML`.【F:frontend/src/components/form/runtime/fields/InfoField.tsx†L1-L5】 |
| `group` | Grupo iterativo que permite instancias múltiples de un subconjunto de campos. | `label`, `key`, `children[]`, `minItems`, `maxItems`. Usa `useFieldArray` para agregar/eliminar filas.【F:frontend/src/components/form/runtime/fields/GroupField.tsx†L1-L18】【F:frontend/src/lib/form-builder/factory.ts†L18-L24】 |

### Bloques de UI
Los siguientes elementos no generan datos, pero se pueden ubicar desde la modal de componentes para enriquecer la presentación del legajo: `ui:header`, `ui:kpi-grid`, `ui:divider`, `ui:banner`, `ui:summary-pinned`, `ui:attachments`, `ui:timeline`. Se instancian con valores por defecto y se diferencian por la propiedad `kind: "ui"`.【F:frontend/src/components/form/builder/ComponentsModal.tsx†L7-L40】【F:frontend/src/lib/form-builder/factory.ts†L58-L101】

## Buenas prácticas
- Mantené claves únicas y descriptivas; el store aporta `ensureUniqueKey` y las validaciones avisan duplicados antes de guardar.【F:frontend/src/lib/store/usePlantillaBuilderStore.ts†L180-L214】
- Usá `Previsualizar` para validar estados intermedios sin necesidad de crear legajos de prueba.【F:frontend/src/components/plantillas/PlantillasPage.tsx†L209-L229】
- Antes de publicar cambios corré `npm run lint`, `npm run build` y `npm test` para asegurar calidad del módulo.
