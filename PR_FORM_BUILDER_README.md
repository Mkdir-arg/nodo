# PR: Editor Visual Drag-and-Drop de Formularios

## 🎯 Objetivo

Implementar un **constructor visual** que reemplace la vista "Visual" actual por un builder con grilla de 12 columnas, paleta de campos, lienzo drag & drop, panel de propiedades y barra de herramientas. El builder guarda/lee un JSON de layout en Django y renderiza formularios reales con React Hook Form + Zod.

## 🚀 Características Implementadas

### Frontend
- ✅ **Editor Visual**: Grilla de 12 columnas con drag-and-drop
- ✅ **Paleta de Campos**: Texto, Número, Fecha, Select, Checkbox, Sección, Tabs, Repeater
- ✅ **Panel de Propiedades**: Edición en vivo de campos seleccionados
- ✅ **Barra de Herramientas**: Deshacer/Rehacer, Vista previa, Guardar
- ✅ **Renderizador Dinámico**: Convierte layout JSON a formulario React Hook Form + Zod
- ✅ **Validación**: Schema Zod generado automáticamente desde layout
- ✅ **Accesibilidad**: Soporte teclado, ARIA, focus visible

### Backend
- ✅ **API Layout**: GET/PUT `/api/plantillas/{id}/layout/`
- ✅ **Persistencia**: Campos `layout_json` y `layout_version` en modelo Plantilla
- ✅ **Versionado**: Incremento automático de versión al guardar
- ✅ **Tests**: Cobertura completa de API layout

## 📦 Instalación

### 1. Instalar Dependencias Frontend

```bash
cd frontend
npm install @radix-ui/react-checkbox@^1.0.4 @radix-ui/react-label@^2.0.2 @radix-ui/react-select@^2.0.0 @radix-ui/react-separator@^1.0.3 @radix-ui/react-switch@^1.0.3 @radix-ui/react-tabs@^1.0.4 sonner@^1.4.3
```

### 2. Aplicar Migraciones Backend

```bash
cd backend
python manage.py migrate plantillas
```

### 3. Ejecutar Tests

```bash
# Backend
python manage.py test plantillas.tests.test_layout_api

# Frontend
npm run test
```

## 🎮 Uso

### 1. Acceder al Editor

Navega a `/plantillas/editor/{id}` para abrir el editor visual de una plantilla.

### 2. Construir Formulario

1. **Arrastrar campos** desde la paleta al canvas
2. **Seleccionar campo** para editar propiedades
3. **Ajustar layout** con colSpan (1-12 columnas)
4. **Configurar validaciones** (requerido, min/max, opciones)
5. **Guardar** layout con Ctrl+S o botón Guardar

### 3. Vista Previa

Usar botón "Vista previa" para ver el formulario renderizado con validaciones.

### 4. Renderizar en Runtime

Navega a `/plantillas/render/{id}` para ver el formulario final funcionando.

## 🏗️ Arquitectura

### Tipos de Datos

```typescript
type FormLayout = {
  version: number;
  nodes: LayoutNode[];
};

type LayoutNode = {
  id: string;
  kind: "field" | "container";
  field?: FieldProps;
  row: number;
  col: number;
  colSpan: number;
};
```

### Flujo de Datos

1. **Editor** → Modifica `FormLayout` → PUT `/api/plantillas/{id}/layout/`
2. **Runtime** → GET `/api/plantillas/{id}/layout/` → `DynamicFormRenderer`
3. **Validación** → `zodSchemaFromLayout()` → Schema Zod automático

### Componentes Clave

- `DynamicFormRenderer`: Convierte layout a formulario React Hook Form
- `zodSchemaFromLayout`: Genera schema Zod desde layout
- `PropertiesPanel`: Editor de propiedades de campos
- `Palette`: Paleta de campos disponibles

## 🧪 Casos de Prueba

### Funcionales
- ✅ Crear plantilla, arrastrar 5+ campos, ajustar colSpan, guardar, recargar
- ✅ Renderizar formulario con errores de validación Zod
- ✅ Envío exitoso de formulario corregido
- ✅ Navegación por teclado en paleta y elementos

### API
- ✅ GET layout retorna JSON válido
- ✅ PUT layout persiste correctamente
- ✅ Validación de permisos y errores 400/404

## 📁 Archivos Nuevos/Modificados

### Frontend
```
src/lib/forms/
├── types.ts                           # Tipos TypeScript
├── zodSchemaFromLayout.ts             # Generador schema Zod
└── runtime/
    ├── DynamicFormRenderer.tsx        # Renderizador principal
    └── fields/                        # Componentes de campo
        ├── TextField.tsx
        ├── NumberField.tsx
        ├── SelectField.tsx
        ├── CheckboxField.tsx
        └── DateField.tsx

src/app/(private)/plantillas/
├── editor/[id]/
│   ├── page.tsx                       # Editor principal
│   ├── builder.config.ts              # Config Puck (futuro)
│   └── _components/
│       ├── Toolbar.tsx
│       ├── Palette.tsx
│       └── PropertiesPanel.tsx
└── render/[id]/
    └── page.tsx                       # Renderizador runtime

src/components/ui/                     # Componentes ShadCN
├── input.tsx
├── label.tsx
├── select.tsx
├── checkbox.tsx
└── ...
```

### Backend
```
plantillas/
├── migrations/
│   └── 0002_add_layout_fields.py      # Migración layout
├── tests/
│   └── test_layout_api.py             # Tests API
├── models.py                          # ✅ Ya tiene campos layout
├── serializers.py                     # ✅ Ya tiene PlantillaLayoutSerializer
└── viewsets.py                        # ✅ Ya tiene acción layout
```

## 🔧 Configuración Adicional

### TailwindCSS

Asegurar que las clases de grilla estén incluidas:

```javascript
// tailwind.config.js
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  safelist: [
    // Clases de grilla dinámicas
    ...Array.from({length: 12}, (_, i) => `col-span-${i + 1}`),
  ],
  // ...
}
```

### Variables CSS

```css
/* globals.css */
:root {
  --grid-cols: 12;
  --grid-gap: 1rem;
}
```

## 🚨 Limitaciones Conocidas

1. **Puck Integration**: Implementación simplificada sin Puck completo (se puede agregar después)
2. **Drag Visual**: Sin feedback visual de arrastre (se puede mejorar con dnd-kit)
3. **Contenedores**: Tabs y Repeater tienen implementación básica
4. **Responsive**: Solo desktop por ahora

## 🔄 Próximos Pasos

1. **Integrar Puck completo** para mejor UX de drag-and-drop
2. **Mejorar contenedores** (tabs anidados, repeater con subcampos)
3. **Responsive design** (breakpoints móvil/tablet)
4. **Más tipos de campo** (radio, multiselect, file upload)
5. **Validaciones avanzadas** (regex, custom validators)

## 🐛 Troubleshooting

### Error: "Cannot find module @radix-ui/..."
```bash
npm install # Instalar dependencias faltantes
```

### Error: "col-span-X class not found"
```bash
# Agregar clases a safelist en tailwind.config.js
```

### Error 404 en API layout
```bash
python manage.py migrate plantillas  # Aplicar migraciones
```

---

**¡El editor visual está listo para usar! 🎉**

Navega a `/plantillas/editor/{id}` y comienza a construir formularios visualmente.