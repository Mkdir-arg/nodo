# Documentación de Componentes Avanzados

Esta documentación describe los 10 componentes de entrada avanzados implementados en el sistema de formularios dinámicos.

---

## 📑 Tabla de Contenidos

1. [SliderInput](#sliderinput)
2. [RatingInput](#ratinginput)
3. [ColorPickerInput](#colorpickerinput)
4. [TimeInput](#timeinput)
5. [CurrencyInput](#currencyinput)
6. [URLInput](#urlinput)
7. [PasswordInput](#passwordinput)
8. [CodeInput](#codeinput)
9. [TagInput](#taginput)
10. [SwitchInput](#switchinput)
11. [CalendarInput](#calendarinput)

---

## SliderInput

Control deslizante (slider) para seleccionar valores numéricos dentro de un rango definido.

### Características
- Rango configurable (min/max)
- Incrementos personalizables (step)
- Visualización opcional del valor actual
- Indicadores de rango en los extremos

### Props

| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| `id` | `string` | - | Identificador único del campo (requerido) |
| `label` | `string` | - | Etiqueta del campo |
| `value` | `number` | `0` | Valor actual del slider |
| `min` | `number` | `0` | Valor mínimo |
| `max` | `number` | `100` | Valor máximo |
| `step` | `number` | `1` | Incremento del slider |
| `required` | `boolean` | `false` | Si el campo es obligatorio |
| `disabled` | `boolean` | `false` | Si el campo está deshabilitado |
| `error` | `string` | - | Mensaje de error |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Tamaño del componente |
| `showValue` | `boolean` | `true` | Mostrar valor numérico actual |
| `onChange` | `(value: number) => void` | - | Callback al cambiar el valor |

### Ejemplo de uso en DynamicForm

```typescript
{
  id: 'volumen',
  type: 'slider',
  label: 'Nivel de Satisfacción',
  min: 0,
  max: 100,
  step: 5,
  showValue: true,
  required: false,
}
```

### Uso directo del componente

```tsx
import { SliderInput } from './components/forms/fields/SliderInput';

<SliderInput
  id="satisfaction"
  label="Nivel de Satisfacción"
  value={75}
  min={0}
  max={100}
  step={5}
  showValue={true}
  onChange={(value) => console.log(value)}
/>
```

---

## RatingInput

Sistema de calificación con estrellas interactivas, ideal para valoraciones y reseñas.

### Características
- Estrellas clickeables con efecto hover
- Número de estrellas configurable
- Visualización del rating actual
- Animaciones suaves
- Estados disabled y readonly

### Props

| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| `id` | `string` | - | Identificador único del campo (requerido) |
| `label` | `string` | - | Etiqueta del campo |
| `value` | `number` | `0` | Rating actual (0-maxRating) |
| `maxRating` | `number` | `5` | Número máximo de estrellas |
| `required` | `boolean` | `false` | Si el campo es obligatorio |
| `disabled` | `boolean` | `false` | Si el campo está deshabilitado |
| `readonly` | `boolean` | `false` | Si es solo lectura |
| `error` | `string` | - | Mensaje de error |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Tamaño de las estrellas |
| `onChange` | `(value: number) => void` | - | Callback al cambiar el rating |

### Ejemplo de uso en DynamicForm

```typescript
{
  id: 'calificacion',
  type: 'rating',
  label: 'Calificación del Servicio',
  maxRating: 5,
  required: true,
}
```

### Uso directo del componente

```tsx
import { RatingInput } from './components/forms/fields/RatingInput';

<RatingInput
  id="product-rating"
  label="Califica este producto"
  value={4}
  maxRating={5}
  onChange={(rating) => console.log(`Rating: ${rating}/5`)}
/>
```

---

## ColorPickerInput

Selector de color visual con entrada hexadecimal, ideal para personalización de temas.

### Características
- Picker de color nativo del navegador
- Preview visual del color seleccionado
- Input hexadecimal validado
- Icono de paleta integrado
- Formato HEX (#RRGGBB)

### Props

| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| `id` | `string` | - | Identificador único del campo (requerido) |
| `label` | `string` | - | Etiqueta del campo |
| `value` | `string` | `'#000000'` | Color en formato hexadecimal |
| `placeholder` | `string` | `'#000000'` | Texto placeholder |
| `required` | `boolean` | `false` | Si el campo es obligatorio |
| `disabled` | `boolean` | `false` | Si el campo está deshabilitado |
| `readonly` | `boolean` | `false` | Si es solo lectura |
| `error` | `string` | - | Mensaje de error |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Tamaño del componente |
| `onChange` | `(value: string) => void` | - | Callback al cambiar el color |

### Ejemplo de uso en DynamicForm

```typescript
{
  id: 'color-favorito',
  type: 'color',
  label: 'Color de Tema',
  placeholder: '#3B82F6',
  required: false,
}
```

### Uso directo del componente

```tsx
import { ColorPickerInput } from './components/forms/fields/ColorPickerInput';

<ColorPickerInput
  id="theme-color"
  label="Color Principal"
  value="#3B82F6"
  onChange={(color) => console.log(`Color seleccionado: ${color}`)}
/>
```

---

## TimeInput

Campo de entrada para hora con formato nativo del navegador.

### Características
- Formato de hora nativo (hh:mm)
- Icono de reloj integrado
- Validación de rango (min/max)
- Compatible con todos los navegadores modernos

### Props

| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| `id` | `string` | - | Identificador único del campo (requerido) |
| `label` | `string` | - | Etiqueta del campo |
| `value` | `string` | `''` | Hora en formato "HH:mm" |
| `placeholder` | `string` | - | Texto placeholder |
| `required` | `boolean` | `false` | Si el campo es obligatorio |
| `disabled` | `boolean` | `false` | Si el campo está deshabilitado |
| `readonly` | `boolean` | `false` | Si es solo lectura |
| `error` | `string` | - | Mensaje de error |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Tamaño del componente |
| `min` | `string` | - | Hora mínima permitida (HH:mm) |
| `max` | `string` | - | Hora máxima permitida (HH:mm) |
| `onChange` | `(value: string) => void` | - | Callback al cambiar la hora |
| `onBlur` | `() => void` | - | Callback al perder el foco |

### Ejemplo de uso en DynamicForm

```typescript
{
  id: 'hora-preferida',
  type: 'time',
  label: 'Hora Preferida para Notificaciones',
  min: '08:00',
  max: '22:00',
  required: false,
}
```

### Uso directo del componente

```tsx
import { TimeInput } from './components/forms/fields/TimeInput';

<TimeInput
  id="meeting-time"
  label="Hora de la reunión"
  value="14:30"
  min="09:00"
  max="18:00"
  onChange={(time) => console.log(`Hora seleccionada: ${time}`)}
/>
```

---

## CurrencyInput

Campo de entrada para moneda con formateo automático según locale y divisa.

### Características
- Formateo automático de moneda al perder el foco
- Soporte para múltiples divisas (USD, EUR, ARS, etc.)
- Locale configurable (en-US, es-AR, etc.)
- Validación de rango (min/max)
- Icono de dólar integrado
- Input numérico al enfocar, formato de moneda al desenfocar

### Props

| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| `id` | `string` | - | Identificador único del campo (requerido) |
| `label` | `string` | - | Etiqueta del campo |
| `value` | `number` | `0` | Valor numérico |
| `placeholder` | `string` | - | Texto placeholder |
| `required` | `boolean` | `false` | Si el campo es obligatorio |
| `disabled` | `boolean` | `false` | Si el campo está deshabilitado |
| `readonly` | `boolean` | `false` | Si es solo lectura |
| `error` | `string` | - | Mensaje de error |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Tamaño del componente |
| `currency` | `string` | `'USD'` | Código de divisa (ISO 4217) |
| `locale` | `string` | `'en-US'` | Locale para formateo |
| `min` | `number` | - | Valor mínimo permitido |
| `max` | `number` | - | Valor máximo permitido |
| `onChange` | `(value: number) => void` | - | Callback al cambiar el valor |
| `onBlur` | `() => void` | - | Callback al perder el foco |

### Ejemplo de uso en DynamicForm

```typescript
{
  id: 'presupuesto',
  type: 'currency',
  label: 'Presupuesto Mensual',
  currency: 'ARS',
  locale: 'es-AR',
  min: 0,
  max: 1000000,
  required: false,
}
```

### Uso directo del componente

```tsx
import { CurrencyInput } from './components/forms/fields/CurrencyInput';

<CurrencyInput
  id="budget"
  label="Presupuesto"
  value={5000}
  currency="USD"
  locale="en-US"
  min={0}
  max={100000}
  onChange={(value) => console.log(`Monto: ${value}`)}
/>
```

### Divisas soportadas
- **USD** - Dólar estadounidense
- **EUR** - Euro
- **ARS** - Peso argentino
- **MXN** - Peso mexicano
- **CLP** - Peso chileno
- **BRL** - Real brasileño
- Y todas las divisas ISO 4217

---

## URLInput

Campo de entrada para URLs con validación en tiempo real y preview.

### Características
- Validación de URL en tiempo real
- Indicador visual de URL válida/inválida (✓/✗)
- Link de preview para abrir en nueva pestaña
- Icono de enlace integrado
- Soporte para protocolo HTTPS

### Props

| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| `id` | `string` | - | Identificador único del campo (requerido) |
| `label` | `string` | - | Etiqueta del campo |
| `value` | `string` | `''` | URL |
| `placeholder` | `string` | `'https://example.com'` | Texto placeholder |
| `required` | `boolean` | `false` | Si el campo es obligatorio |
| `disabled` | `boolean` | `false` | Si el campo está deshabilitado |
| `readonly` | `boolean` | `false` | Si es solo lectura |
| `error` | `string` | - | Mensaje de error |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Tamaño del componente |
| `showPreview` | `boolean` | `true` | Mostrar link de preview |
| `onChange` | `(value: string) => void` | - | Callback al cambiar la URL |
| `onBlur` | `() => void` | - | Callback al perder el foco |

### Ejemplo de uso en DynamicForm

```typescript
{
  id: 'website',
  type: 'url',
  label: 'Sitio Web',
  placeholder: 'https://ejemplo.com',
  showPreview: true,
  required: false,
}
```

### Uso directo del componente

```tsx
import { URLInput } from './components/forms/fields/URLInput';

<URLInput
  id="company-website"
  label="Sitio Web de la Empresa"
  value="https://example.com"
  showPreview={true}
  onChange={(url) => console.log(`URL: ${url}`)}
/>
```

---

## PasswordInput

Campo de contraseña con toggle de visibilidad e indicador de fortaleza.

### Características
- Toggle para mostrar/ocultar contraseña (👁️/🙈)
- Indicador de fortaleza en tiempo real (débil/regular/buena/fuerte)
- Barra de progreso visual con colores
- Icono de candado integrado
- Análisis de seguridad: longitud, mayúsculas, números, caracteres especiales

### Props

| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| `id` | `string` | - | Identificador único del campo (requerido) |
| `label` | `string` | - | Etiqueta del campo |
| `value` | `string` | `''` | Valor de la contraseña |
| `placeholder` | `string` | - | Texto placeholder |
| `required` | `boolean` | `false` | Si el campo es obligatorio |
| `disabled` | `boolean` | `false` | Si el campo está deshabilitado |
| `readonly` | `boolean` | `false` | Si es solo lectura |
| `error` | `string` | - | Mensaje de error |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Tamaño del componente |
| `showStrength` | `boolean` | `true` | Mostrar indicador de fortaleza |
| `onChange` | `(value: string) => void` | - | Callback al cambiar la contraseña |
| `onBlur` | `() => void` | - | Callback al perder el foco |

### Criterios de fortaleza

La fortaleza de la contraseña se calcula con estos criterios:

- ✅ Longitud ≥ 8 caracteres
- ✅ Longitud ≥ 12 caracteres
- ✅ Mayúsculas Y minúsculas
- ✅ Al menos un número
- ✅ Al menos un carácter especial

**Clasificación:**
- **Débil (0-1 criterios):** Rojo - Muy insegura
- **Regular (2 criterios):** Naranja - Necesita mejoras
- **Buena (3 criterios):** Amarillo - Aceptable
- **Fuerte (4-5 criterios):** Verde - Muy segura

### Ejemplo de uso en DynamicForm

```typescript
{
  id: 'contrasena',
  type: 'password',
  label: 'Contraseña',
  placeholder: 'Ingrese una contraseña segura',
  showStrength: true,
  required: true,
}
```

### Uso directo del componente

```tsx
import { PasswordInput } from './components/forms/fields/PasswordInput';

<PasswordInput
  id="user-password"
  label="Contraseña"
  value=""
  showStrength={true}
  onChange={(password) => console.log(`Contraseña ingresada`)}
/>
```

---

## CodeInput

Editor de código con numeración de líneas y funcionalidad de copiado.

### Características
- Numeración de líneas automática
- Fuente monoespaciada
- Tema oscuro optimizado para código
- Botón de copiar al portapapeles
- Etiqueta de lenguaje de programación
- Contador de líneas y caracteres
- Redimensionamiento automático (min/max rows)
- Scroll automático para código largo

### Props

| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| `id` | `string` | - | Identificador único del campo (requerido) |
| `label` | `string` | - | Etiqueta del campo |
| `value` | `string` | `''` | Contenido del código |
| `placeholder` | `string` | `'// Escribe tu código aquí...'` | Texto placeholder |
| `required` | `boolean` | `false` | Si el campo es obligatorio |
| `disabled` | `boolean` | `false` | Si el campo está deshabilitado |
| `readonly` | `boolean` | `false` | Si es solo lectura |
| `error` | `string` | - | Mensaje de error |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Tamaño del componente |
| `language` | `string` | `'javascript'` | Lenguaje de programación |
| `showLineNumbers` | `boolean` | `true` | Mostrar números de línea |
| `minRows` | `number` | `5` | Número mínimo de filas |
| `maxRows` | `number` | `20` | Número máximo de filas |
| `onChange` | `(value: string) => void` | - | Callback al cambiar el código |
| `onBlur` | `() => void` | - | Callback al perder el foco |

### Lenguajes sugeridos
- `javascript`
- `typescript`
- `python`
- `html`
- `css`
- `json`
- `sql`
- etc.

### Ejemplo de uso en DynamicForm

```typescript
{
  id: 'codigo-snippet',
  type: 'code',
  label: 'Código de Ejemplo',
  language: 'javascript',
  showLineNumbers: true,
  minRows: 5,
  maxRows: 15,
  required: false,
}
```

### Uso directo del componente

```tsx
import { CodeInput } from './components/forms/fields/CodeInput';

<CodeInput
  id="user-code"
  label="Tu código JavaScript"
  value="function hello() {\n  console.log('Hello!');\n}"
  language="javascript"
  showLineNumbers={true}
  minRows={5}
  maxRows={20}
  onChange={(code) => console.log('Código actualizado')}
/>
```

---

## TagInput

Campo para agregar y gestionar tags dinámicamente.

### Características
- Agregar tags con **Enter** o **coma**
- Remover tags con clic en X
- Remover último tag con **Backspace** (input vacío)
- Prevención de duplicados
- Límite configurable de tags
- Contador de tags (actual/máximo)
- Visualización con badges coloreados

### Props

| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| `id` | `string` | - | Identificador único del campo (requerido) |
| `label` | `string` | - | Etiqueta del campo |
| `value` | `string[]` | `[]` | Array de tags |
| `placeholder` | `string` | `'Escribe y presiona Enter...'` | Texto placeholder |
| `required` | `boolean` | `false` | Si el campo es obligatorio |
| `disabled` | `boolean` | `false` | Si el campo está deshabilitado |
| `readonly` | `boolean` | `false` | Si es solo lectura |
| `error` | `string` | - | Mensaje de error |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Tamaño del componente |
| `maxTags` | `number` | - | Número máximo de tags permitidos |
| `onChange` | `(value: string[]) => void` | - | Callback al cambiar los tags |

### Interacciones de teclado

- **Enter** o **Coma (,):** Agregar tag
- **Backspace** (input vacío): Remover último tag
- **Click en X:** Remover tag específico

### Ejemplo de uso en DynamicForm

```typescript
{
  id: 'habilidades',
  type: 'tags',
  label: 'Habilidades Técnicas',
  placeholder: 'Escribe y presiona Enter',
  maxTags: 10,
  required: false,
}
```

### Uso directo del componente

```tsx
import { TagInput } from './components/forms/fields/TagInput';

<TagInput
  id="skills"
  label="Habilidades"
  value={['JavaScript', 'React', 'TypeScript']}
  maxTags={10}
  onChange={(tags) => console.log(`Tags: ${tags.join(', ')}`)}
/>
```

---

## SwitchInput

Toggle switch para configuraciones on/off, alternativa moderna al checkbox.

### Características
- Interfaz toggle moderna
- Descripción secundaria opcional
- Animación suave de transición
- Usa el componente Switch de Radix UI
- Ideal para configuraciones booleanas

### Props

| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| `id` | `string` | - | Identificador único del campo (requerido) |
| `label` | `string` | - | Etiqueta del campo |
| `description` | `string` | - | Texto de descripción secundario |
| `value` | `boolean` | `false` | Estado del switch (on/off) |
| `required` | `boolean` | `false` | Si el campo es obligatorio |
| `disabled` | `boolean` | `false` | Si el campo está deshabilitado |
| `error` | `string` | - | Mensaje de error |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Tamaño del componente |
| `onChange` | `(value: boolean) => void` | - | Callback al cambiar el estado |

### Ejemplo de uso en DynamicForm

```typescript
{
  id: 'notificaciones',
  type: 'switch',
  label: 'Notificaciones Push',
  description: 'Recibir notificaciones sobre actualizaciones importantes',
  required: false,
}
```

### Uso directo del componente

```tsx
import { SwitchInput } from './components/forms/fields/SwitchInput';

<SwitchInput
  id="dark-mode"
  label="Modo Oscuro"
  description="Activar tema oscuro en la aplicación"
  value={true}
  onChange={(enabled) => console.log(`Modo oscuro: ${enabled}`)}
/>
```

### Diferencia con CheckboxInput

**Cuándo usar Switch:**
- Configuraciones que se aplican inmediatamente
- Opciones on/off (activar/desactivar)
- Preferencias del usuario
- Estados binarios

**Cuándo usar Checkbox:**
- Aceptación de términos y condiciones
- Múltiples selecciones independientes
- Opciones que requieren confirmación
- Formularios que se envían al final

---

## CalendarInput

Componente de calendario interactivo para visualizar y registrar acciones por fecha, con categorización y codificación por colores.

### Características
- Vista mensual con navegación entre meses/años
- Registro de acciones asociadas a fechas específicas
- Sistema de categorías configurable con colores personalizados
- Indicadores visuales (dots/badges) en fechas con acciones
- Panel lateral/modal para ver/editar acciones del día seleccionado
- Múltiples acciones por día con agrupación por categoría
- Resaltado del día actual
- Selección de rango de fechas (opcional)
- Vista compacta/expandida

### Estructura de Datos

**Categoría de Acción:**
```typescript
interface Category {
  id: string;
  name: string;
  color: string; // HEX color
  icon?: string; // opcional
}
```

**Acción:**
```typescript
interface Action {
  id: string;
  title: string;
  description?: string;
  date: Date | string;
  categoryId: string;
  time?: string; // HH:mm
  completed?: boolean;
  metadata?: Record<string, any>;
}
```

### Props

| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| `id` | `string` | - | Identificador único (requerido) |
| `label` | `string` | - | Etiqueta del componente |
| `value` | `Action[]` | `[]` | Array de acciones registradas |
| `categories` | `Category[]` | `[]` | Categorías disponibles |
| `defaultView` | `'month' \| 'week'` | `'month'` | Vista inicial del calendario |
| `locale` | `string` | `'es-ES'` | Idioma para nombres de días/meses |
| `minDate` | `Date \| string` | - | Fecha mínima seleccionable |
| `maxDate` | `Date \| string` | - | Fecha máxima seleccionable |
| `highlightToday` | `boolean` | `true` | Resaltar día actual |
| `allowMultipleActions` | `boolean` | `true` | Permitir múltiples acciones por día |
| `showCategoryLegend` | `boolean` | `true` | Mostrar leyenda de categorías |
| `maxActionsPerDay` | `number` | - | Límite de acciones por día |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Tamaño del componente |
| `disabled` | `boolean` | `false` | Deshabilitar interacción |
| `readonly` | `boolean` | `false` | Solo lectura |
| `onChange` | `(actions: Action[]) => void` | - | Callback al modificar acciones |
| `onDateSelect` | `(date: Date) => void` | - | Callback al seleccionar fecha |
| `onActionCreate` | `(action: Action) => void` | - | Callback al crear acción |
| `onActionUpdate` | `(action: Action) => void` | - | Callback al actualizar acción |
| `onActionDelete` | `(actionId: string) => void` | - | Callback al eliminar acción |

### Elementos Visuales

**En el calendario:**
- Dots de colores bajo cada fecha (uno por categoría presente)
- Badge numérico indicando cantidad de acciones si > 3
- Borde de color en la celda del día seleccionado
- Fondo suave en el día actual
- Opacidad reducida para días fuera del mes actual

**Panel de acciones (al seleccionar un día):**
- Lista de acciones agrupadas por categoría
- Cada acción muestra: título, hora (si existe), estado (completada/pendiente)
- Botones para: agregar, editar, eliminar acciones
- Color de categoría visible en cada item

### Interacciones

1. **Click en fecha vacía** → Abre modal/panel para crear acción
2. **Click en fecha con acciones** → Muestra lista de acciones del día
3. **Hover en fecha** → Preview rápido de acciones (tooltip)
4. **Navegación** → Flechas para cambiar mes/año
5. **Drag & drop** (opcional) → Mover acciones entre fechas

### Ejemplo de uso en DynamicForm

```typescript
{
  id: 'calendario-tareas',
  type: 'calendar',
  label: 'Planificador de Actividades',
  categories: [
    { id: 'work', name: 'Trabajo', color: '#3B82F6' },
    { id: 'personal', name: 'Personal', color: '#10B981' },
    { id: 'health', name: 'Salud', color: '#EF4444' },
    { id: 'study', name: 'Estudio', color: '#F59E0B' }
  ],
  defaultView: 'month',
  locale: 'es-ES',
  highlightToday: true,
  showCategoryLegend: true,
  allowMultipleActions: true,
  required: false,
}
```

### Uso directo del componente

```tsx
import { CalendarInput } from './components/forms/fields/CalendarInput';

const categories = [
  { id: 'meeting', name: 'Reuniones', color: '#8B5CF6' },
  { id: 'deadline', name: 'Entregas', color: '#EF4444' }
];

const actions = [
  {
    id: '1',
    title: 'Reunión con cliente',
    date: '2024-01-15',
    time: '10:00',
    categoryId: 'meeting'
  }
];

<CalendarInput
  id="project-calendar"
  label="Calendario del Proyecto"
  value={actions}
  categories={categories}
  onActionCreate={(action) => console.log('Nueva acción:', action)}
  onActionUpdate={(action) => console.log('Acción actualizada:', action)}
/>
```

### Variantes Adicionales

**Modo compacto:**
- Solo muestra dots de color, sin números
- Ideal para dashboards

**Modo agenda:**
- Lista cronológica en lugar de grid
- Agrupa por día con todas las acciones

**Modo heatmap:**
- Intensidad de color según cantidad de acciones
- Útil para visualizar productividad

### Consideraciones de Implementación

- **Librería base sugerida:** `date-fns` para manejo de fechas
- **Accesibilidad:** Navegación por teclado, ARIA labels
- **Responsive:** Vista adaptativa en móviles (posible vista de lista)
- **Performance:** Virtualización si se manejan muchas acciones
- **Persistencia:** Integración con localStorage o backend

### Casos de Uso

- ✅ **Gestión de Proyectos** - Planificación de tareas y entregas
- ✅ **Agenda Personal** - Eventos, citas y recordatorios
- ✅ **RRHH** - Vacaciones, ausencias, capacitaciones
- ✅ **Educación** - Calendario académico, exámenes
- ✅ **Salud** - Citas médicas, tratamientos
- ✅ **Fitness** - Rutinas de ejercicio, seguimiento

---

## RelationInput (Actualizado)

Campo especializado para gestionar relaciones/vínculos categorizados con sistema de paginación integrado.

### Características
- Gestión de relaciones por categorías/tipos
- **Sistema de paginación automático** por tipo
- Grid responsivo (1-3 columnas)
- Contador de registros (ej: "1-6 de 20")
- Navegación visual entre páginas
- Estados vacíos informativos
- Botón de eliminación en hover
- Diseño moderno con gradientes

### Props

| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| `id` | `string` | - | Identificador único del campo (requerido) |
| `label` | `string` | - | Etiqueta del campo |
| `relationTypes` | `string[]` | - | Array de tipos de relación (requerido) |
| `relations` | `RelationTag[]` | `[]` | Array de relaciones existentes |
| `required` | `boolean` | `false` | Si el campo es obligatorio |
| `disabled` | `boolean` | `false` | Si el campo está deshabilitado |
| `error` | `string` | - | Mensaje de error |
| `itemsPerPage` | `number` | `6` | Cantidad de relaciones por página |
| `onChange` | `(relations: RelationTag[]) => void` | - | Callback al cambiar relaciones |

### Tipo RelationTag

```typescript
interface RelationTag {
  id: string;
  label: string;
  type: string;
}
```

### Ejemplo de uso en DynamicForm

```typescript
{
  id: 'vinculos',
  type: 'relation',
  label: 'Vínculos Familiares',
  relationTypes: ['Padre/Madre', 'Hijo/a', 'Hermano/a', 'Cónyuge'],
  itemsPerPage: 6,
  required: false,
}
```

### Uso directo del componente

```tsx
import { RelationInput } from './components/forms/fields/RelationInput';

const [relations, setRelations] = useState<RelationTag[]>([]);

<RelationInput
  id="family-relations"
  label="Relaciones Familiares"
  relationTypes={['Padre/Madre', 'Hijo/a', 'Hermano/a']}
  relations={relations}
  itemsPerPage={6}
  onChange={setRelations}
/>
```

### Características del Sistema de Paginación

#### Navegación
- **Botones Anterior/Siguiente** - Navegación secuencial
- **Botones de página numerados** - Acceso directo a cualquier página
- **Página actual destacada** - Indicador visual azul
- **Botones deshabilitados** - En primera/última página

#### Contador de Registros
Cada tipo muestra:
- Total de vínculos: "3 vínculos" / "1 vínculo"
- Rango visible: "1-6 de 20"

#### Configuración de Items por Página
```typescript
// 6 items por página (default)
<RelationInput itemsPerPage={6} {...props} />

// 12 items por página
<RelationInput itemsPerPage={12} {...props} />

// 3 items por página (compacto)
<RelationInput itemsPerPage={3} {...props} />
```

### Interacciones

**Agregar Relación:**
1. Seleccionar tipo en dropdown
2. Escribir nombre en input
3. Presionar "Agregar" o tecla Enter

**Eliminar Relación:**
- Hacer hover sobre la tarjeta
- Click en el botón X que aparece

**Navegar entre Páginas:**
- Click en "Anterior" / "Siguiente"
- Click en número de página directamente

### Grid Responsivo

El grid se adapta automáticamente:
- **Mobile (< 640px):** 1 columna
- **Tablet (640px-1024px):** 2 columnas
- **Desktop (> 1024px):** 3 columnas

### Estados Visuales

**Estado Vacío:**
- Icono de usuarios grande
- Mensaje: "No hay vínculos de tipo X"
- Sugerencia de uso
- Borde punteado

**Con Datos:**
- Tarjetas con gradiente azul
- Efecto hover con sombra
- Botón eliminar aparece en hover
- Bordes coloreados

**Paginación Activa:**
- Solo visible cuando hay más de 1 página
- Botones deshabilitados automáticamente
- Página actual resaltada

### Ejemplo Avanzado

```tsx
const App = () => {
  const [familyRelations, setFamilyRelations] = useState<RelationTag[]>([
    { id: '1', label: 'Juan Pérez', type: 'Padre/Madre' },
    { id: '2', label: 'María Pérez', type: 'Padre/Madre' },
    { id: '3', label: 'Pedro García', type: 'Hijo/a' },
    { id: '4', label: 'Ana García', type: 'Hijo/a' },
    { id: '5', label: 'Luis García', type: 'Hermano/a' },
    { id: '6', label: 'Sofía López', type: 'Cónyuge' },
    // ... más relaciones
  ]);

  return (
    <RelationInput
      id="family"
      label="Núcleo Familiar"
      relationTypes={[
        'Padre/Madre',
        'Hijo/a',
        'Hermano/a',
        'Cónyuge',
        'Abuelo/a',
        'Tío/a'
      ]}
      relations={familyRelations}
      itemsPerPage={6}
      onChange={setFamilyRelations}
      required
    />
  );
};
```

### Casos de Uso

- ✅ **Gestión de RRHH** - Vínculos familiares de empleados
- ✅ **Expedientes Legales** - Partes involucradas
- ✅ **CRM** - Contactos relacionados
- ✅ **Educación** - Tutores y apoderados
- ✅ **Salud** - Contactos de emergencia

### Ventajas del Diseño

1. **Escalable** - Maneja cientos de relaciones sin problemas
2. **Organizado** - Separación clara por categorías
3. **Intuitivo** - Paginación automática cuando es necesario
4. **Responsive** - Se adapta a cualquier pantalla
5. **Performante** - Solo renderiza items visibles
6. **Visual** - Feedback claro del estado

---

## Variantes de Tamaño

Todos los componentes soportan 3 tamaños mediante la prop `size`:

### Small (`sm`)
```typescript
size: 'sm'
```
- Padding: `px-2.5 py-1.5`
- Font: `text-xs` o `text-sm`
- Altura: `h-8`
- Uso: Formularios compactos, tablas

### Medium (`md`) - Default
```typescript
size: 'md'
```
- Padding: `px-3 py-2`
- Font: `text-sm` o `text-base`
- Altura: `h-10`
- Uso: Formularios estándar

### Large (`lg`)
```typescript
size: 'lg'
```
- Padding: `px-4 py-3`
- Font: `text-base` o `text-lg`
- Altura: `h-12`
- Uso: Formularios en pantallas grandes, landing pages

---

## Estados Visuales

Todos los componentes implementan los siguientes estados:

### Default
- Bordes grises
- Fondo blanco/gris oscuro
- Placeholder gris claro

### Hover
- Transición suave
- Cambios visuales sutiles

### Focus
- Borde azul brillante
- Ring de enfoque (2px)
- Outline eliminado

### Error
- Borde rojo
- Ring rojo al enfocar
- Mensaje de error debajo del campo

### Disabled
- Opacidad 50%
- Cursor `not-allowed`
- Fondo gris claro/oscuro

### Readonly
- Fondo gris claro/oscuro
- Cursor `default`
- Sin interactividad

---

## Modo Oscuro

Todos los componentes soportan **dark mode** mediante las clases de Tailwind CSS:

```css
dark:bg-gray-900
dark:text-gray-100
dark:border-gray-600
```

El sistema detecta automáticamente las preferencias del usuario o sigue la configuración del sistema operativo.

---

## Integración con DynamicForm

Todos estos componentes se integran automáticamente con `DynamicForm` mediante la configuración JSON:

```typescript
const formFields: FormField[] = [
  {
    id: 'campo-slider',
    type: 'slider',
    label: 'Mi Slider',
    min: 0,
    max: 100,
  },
  {
    id: 'campo-rating',
    type: 'rating',
    label: 'Mi Rating',
    maxRating: 5,
  },
  // ... más campos
];

<DynamicForm
  fields={formFields}
  onChange={(data) => console.log(data)}
/>
```

---

## Validación

Todos los componentes soportan validación mediante la prop `error`:

```typescript
{
  id: 'email',
  type: 'url',
  label: 'Sitio Web',
  error: 'La URL no es válida',
}
```

El mensaje de error se muestra debajo del campo con estilo rojo.

---

## Accesibilidad

Todos los componentes implementan prácticas de accesibilidad:

- ✅ Labels asociados con `htmlFor`
- ✅ ARIA attributes donde corresponde
- ✅ Navegación por teclado
- ✅ Estados focus visibles
- ✅ Mensajes de error accesibles
- ✅ Contraste de colores WCAG AA

---

## Ejemplos Completos

### Formulario de Configuración de Usuario

```typescript
const userSettingsFields: FormField[] = [
  {
    id: 'theme-color',
    type: 'color',
    label: 'Color de Tema',
    value: '#3B82F6',
  },
  {
    id: 'notifications',
    type: 'switch',
    label: 'Notificaciones',
    description: 'Recibir notificaciones por email',
    value: true,
  },
  {
    id: 'notification-time',
    type: 'time',
    label: 'Hora de Notificaciones',
    value: '09:00',
  },
  {
    id: 'rating',
    type: 'rating',
    label: 'Califica la App',
    maxRating: 5,
  },
];
```

### Formulario de Desarrollador

```typescript
const developerFields: FormField[] = [
  {
    id: 'skills',
    type: 'tags',
    label: 'Habilidades',
    maxTags: 10,
  },
  {
    id: 'github',
    type: 'url',
    label: 'GitHub Profile',
    showPreview: true,
  },
  {
    id: 'code-sample',
    type: 'code',
    label: 'Código de Ejemplo',
    language: 'typescript',
    showLineNumbers: true,
  },
];
```

---

## Notas Técnicas

### Dependencias Externas

Estos componentes utilizan:
- **Radix UI** (Switch, Slider)
- **Lucide React** (Iconos)
- **Tailwind CSS** (Estilos)
- **React 18** (Hooks)
- **TypeScript** (Tipado)

### Performance

- Uso de `React.memo` donde sea necesario
- Debounce opcional para inputs de texto
- Lazy loading de componentes pesados
- Optimización de re-renders

### Compatibilidad

- ✅ Chrome/Edge (últimas 2 versiones)
- ✅ Firefox (últimas 2 versiones)
- ✅ Safari (últimas 2 versiones)
- ✅ Mobile (iOS Safari, Chrome Android)

---

## Próximos Pasos

Para expandir aún más el sistema, considera implementar:

1. **RichTextEditor** - Editor WYSIWYG con formato
2. **SignatureInput** - Campo de firma digital con canvas
3. **DateRangeInput** - Selector de rango de fechas
4. **AutocompleteInput** - Input con sugerencias
5. **FileDropzone** - Zona de arrastrar y soltar archivos
6. **GeolocationInput** - Selector de ubicación con mapa
7. **PhoneInputInternational** - Input de teléfono con códigos de país

---

## Soporte

Para reportar bugs o solicitar nuevas funcionalidades, crea un issue en el repositorio del proyecto.

**Última actualización:** Enero 2026
**Versión:** 1.0.0