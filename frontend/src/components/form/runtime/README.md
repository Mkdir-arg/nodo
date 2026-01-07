# Runtime Fields - Design System

## Resumen del Rediseño

Todos los campos de formulario runtime han sido rediseñados con:
- ✅ Glassmorphism consistente con el header
- ✅ Iconografía Lucide React
- ✅ Estados (normal, focus, error, disabled, readonly)
- ✅ Validación RHF integrada
- ✅ Accesibilidad (labels, aria, errores)
- ✅ Responsive mobile-first

## Componentes Base

### FieldShell
Wrapper común para todos los campos que maneja:
- Label con icono opcional
- Indicador de required (*)
- Mensaje de ayuda (helpText)
- Mensaje de error de RHF
- Estados visuales (error, disabled, readonly)

**Uso:**
```tsx
<FieldShell
  fieldKey="nombre"
  label="Nombre"
  required={true}
  helpText="Ingrese su nombre completo"
  icon={<Type size={16} />}
  disabled={false}
  readonly={false}
>
  <input {...} />
</FieldShell>
```

### Estilos Base (styles.ts)

**baseInputStyles**: Estilos para inputs de texto
- Glassmorphism: `bg-white/70 dark:bg-slate-900/60 backdrop-blur-md`
- Border: `border border-white/30 dark:border-slate-700/40`
- Focus: `focus:ring-2 focus:ring-slate-400/40`
- Padding: `px-4 py-3`
- Rounded: `rounded-2xl`

**baseTextareaStyles**: Extiende baseInputStyles con altura mínima

**baseSelectStyles**: Extiende baseInputStyles con flecha custom

## Campos Implementados

### Básicos
- **TextField**: text, email, textarea con iconos Type/Mail
- **NumberField**: input numérico con icono Hash
- **PhoneField**: input tel con icono Phone
- **CheckboxField**: card clickeable con CheckSquare
- **DateField**: input date con icono Calendar

### Selección
- **SelectField**: select/multiselect con iconos ChevronDown/CheckSquare

### Avanzados
- **DocumentField**: Dropzone con preview para archivos/imágenes
- **InfoField**: Bloques informativos con variantes (info/warning/error)
- **SumField**: Chip destacado con cálculo automático
- **CuitRazonSocialField**: Búsqueda con loading y error states
- **GroupField**: Repeater con drag visual y empty state

## Tokens de Diseño

### Colores
- Glass background: `bg-white/70 dark:bg-slate-900/60`
- Border: `border-white/30 dark:border-slate-700/40`
- Text: `text-slate-700 dark:text-slate-200`
- Error: `ring-red-500/40 text-red-600`

### Espaciado
- Padding interno: `px-4 py-3`
- Gap entre elementos: `gap-2` o `gap-3`
- Spacing vertical: `space-y-2` o `space-y-4`

### Bordes
- Radius: `rounded-2xl` (principal), `rounded-xl` (secundario)
- Border width: `border` (1px), `border-2` (2px para dashed)

### Sombras
- Default: `shadow-sm`
- Hover: `hover:shadow-md`

## Accesibilidad

Todos los campos implementan:
- `htmlFor` + `id` para asociar label con input
- `aria-invalid` cuando hay error
- `aria-describedby` para mensajes de error/ayuda
- `aria-required` para campos obligatorios
- Indicador visual de required (*)

## Integración con RHF

Todos los campos usan:
- `register(field.key)` para campos simples
- `Controller` para campos complejos (si aplica)
- `formState.errors[field.key]` para mostrar errores
- `watch()` para campos reactivos (Sum, CUIT)
- `setValue()` para actualizar valores programáticamente

## Mantenimiento de Shape de Datos

✅ No se modificó el shape de datos guardados:
- Text/Email/Phone: `string`
- Number: `number`
- Checkbox: `boolean`
- Select: `string`
- Multiselect: `string[]`
- Date: `string` (ISO)
- Document/Image: `string` (URL)
- Sum: `number`
- CUIT: `{ cuit: string, razon_social: string }`
- Group: `array` de objetos

## Testing

Para probar los campos, crear un formulario con:
```tsx
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import TextField from './fields/TextField';

const schema = z.object({
  nombre: z.string().min(1, 'Requerido')
});

function TestForm() {
  const methods = useForm({ resolver: zodResolver(schema) });
  
  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(console.log)}>
        <TextField field={{ key: 'nombre', label: 'Nombre', required: true }} />
        <button type="submit">Enviar</button>
      </form>
    </FormProvider>
  );
}
```
