# 📊 Tabla de Referencia - Componentes Avanzados

Guía visual rápida para elegir el componente adecuado para cada situación.

---

## 🎯 Comparativa Rápida

| Componente | Tipo de Dato | Caso de Uso Principal | Interacción |
|------------|--------------|----------------------|-------------|
| **SliderInput** | `number` | Valores numéricos en rango (0-100) | Arrastrar slider |
| **RatingInput** | `number` | Calificaciones y reseñas (1-5 estrellas) | Click en estrellas |
| **ColorPickerInput** | `string` (hex) | Personalización de colores (#RRGGBB) | Color picker + input |
| **TimeInput** | `string` (HH:mm) | Horarios y programación | Selector nativo |
| **CurrencyInput** | `number` | Montos monetarios con formato | Input numérico |
| **URLInput** | `string` | Enlaces y sitios web | Input de texto |
| **PasswordInput** | `string` | Contraseñas con validación | Input + toggle |
| **CodeInput** | `string` | Fragmentos de código fuente | Textarea monospace |
| **TagInput** | `string[]` | Listas de etiquetas/keywords | Input + badges |
| **SwitchInput** | `boolean` | Configuraciones on/off | Toggle switch |

---

## 🔢 Tipos de Datos Retornados

```typescript
// SliderInput
onChange: (value: number) => void
// Ejemplo: 75

// RatingInput
onChange: (value: number) => void
// Ejemplo: 4

// ColorPickerInput
onChange: (value: string) => void
// Ejemplo: "#3B82F6"

// TimeInput
onChange: (value: string) => void
// Ejemplo: "14:30"

// CurrencyInput
onChange: (value: number) => void
// Ejemplo: 1500.50

// URLInput
onChange: (value: string) => void
// Ejemplo: "https://example.com"

// PasswordInput
onChange: (value: string) => void
// Ejemplo: "MyP@ssw0rd"

// CodeInput
onChange: (value: string) => void
// Ejemplo: "function hello() {\n  console.log('Hi');\n}"

// TagInput
onChange: (value: string[]) => void
// Ejemplo: ["JavaScript", "React", "TypeScript"]

// SwitchInput
onChange: (value: boolean) => void
// Ejemplo: true
```

---

## 📏 Dimensiones por Tamaño

| Componente | Small (sm) | Medium (md) | Large (lg) |
|------------|-----------|-------------|------------|
| **Altura** | 32px (h-8) | 40px (h-10) | 48px (h-12) |
| **Padding X** | 10px (px-2.5) | 12px (px-3) | 16px (px-4) |
| **Padding Y** | 6px (py-1.5) | 8px (py-2) | 12px (py-3) |
| **Texto** | 12-14px | 14-16px | 16-18px |

---

## ✨ Características Especiales

| Componente | Característica Única | Beneficio |
|------------|---------------------|-----------|
| **SliderInput** | Indicadores de rango (min/max) | Contexto visual del rango |
| **RatingInput** | Efecto hover en estrellas | Interacción intuitiva |
| **ColorPickerInput** | Preview + input hex | Dos formas de elegir color |
| **TimeInput** | Formato nativo del navegador | Compatibilidad universal |
| **CurrencyInput** | Auto-formateo al desenfocar | Formato profesional automático |
| **URLInput** | Validación en tiempo real + preview | Feedback inmediato |
| **PasswordInput** | Indicador de fortaleza 4 niveles | Mejora seguridad del usuario |
| **CodeInput** | Numeración de líneas + copiar | Experiencia de IDE |
| **TagInput** | Prevención de duplicados | Lista limpia sin repetidos |
| **SwitchInput** | Cambio inmediato | Feedback visual instantáneo |

---

## 🎨 Estados Disponibles

| Estado | SliderInput | RatingInput | ColorPickerInput | TimeInput | CurrencyInput | URLInput | PasswordInput | CodeInput | TagInput | SwitchInput |
|--------|-------------|-------------|------------------|-----------|---------------|----------|---------------|-----------|----------|-------------|
| Default | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Hover | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Focus | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Error | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Disabled | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Readonly | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |

---

## 🎯 Casos de Uso Recomendados

### Configuración de Usuario
```typescript
✅ SwitchInput    - Activar/desactivar notificaciones
✅ ColorPickerInput - Personalizar tema
✅ TimeInput      - Hora preferida
✅ SliderInput    - Nivel de privacidad (0-100%)
```

### E-commerce
```typescript
✅ RatingInput     - Calificar productos
✅ CurrencyInput   - Precio, presupuesto
✅ SliderInput     - Rango de precios (filtros)
✅ TagInput        - Categorías de productos
```

### Desarrolladores
```typescript
✅ CodeInput       - Snippets de código
✅ URLInput        - Repository URLs
✅ TagInput        - Tecnologías, frameworks
✅ PasswordInput   - API keys, tokens
```

### Formularios de Registro
```typescript
✅ PasswordInput   - Contraseña con validación
✅ URLInput        - Sitio web, redes sociales
✅ TimeInput       - Disponibilidad horaria
✅ TagInput        - Intereses, habilidades
```

### Encuestas y Feedback
```typescript
✅ RatingInput     - Satisfacción (estrellas)
✅ SliderInput     - Nivel de acuerdo (escala)
✅ SwitchInput     - Preguntas Sí/No
✅ CodeInput       - Feedback técnico
```

---

## 🔧 Props Específicas por Componente

### SliderInput
```typescript
min: number           // Valor mínimo (default: 0)
max: number           // Valor máximo (default: 100)
step: number          // Incremento (default: 1)
showValue: boolean    // Mostrar valor (default: true)
```

### RatingInput
```typescript
maxRating: number     // Número de estrellas (default: 5)
readonly: boolean     // Solo lectura
```

### ColorPickerInput
```typescript
value: string         // Formato hexadecimal (#RRGGBB)
```

### TimeInput
```typescript
min: string           // Hora mínima (HH:mm)
max: string           // Hora máxima (HH:mm)
```

### CurrencyInput
```typescript
currency: string      // Código ISO (USD, EUR, ARS...)
locale: string        // Formato local (en-US, es-AR...)
min: number          // Monto mínimo
max: number          // Monto máximo
```

### URLInput
```typescript
showPreview: boolean  // Mostrar link externo (default: true)
```

### PasswordInput
```typescript
showStrength: boolean // Indicador de fortaleza (default: true)
```

### CodeInput
```typescript
language: string          // Lenguaje (javascript, python...)
showLineNumbers: boolean  // Numeración (default: true)
minRows: number          // Filas mínimas (default: 5)
maxRows: number          // Filas máximas (default: 20)
```

### TagInput
```typescript
maxTags: number       // Límite de tags
value: string[]       // Array de strings
```

### SwitchInput
```typescript
description: string   // Texto secundario
value: boolean       // Estado on/off
```

---

## ⌨️ Atajos de Teclado

| Componente | Tecla | Acción |
|------------|-------|--------|
| **RatingInput** | `1-5` | Seleccionar rating |
| **RatingInput** | `←→` | Navegar estrellas |
| **TagInput** | `Enter` | Agregar tag |
| **TagInput** | `,` (coma) | Agregar tag |
| **TagInput** | `Backspace` | Borrar último tag (input vacío) |
| **PasswordInput** | N/A | Toggle visibilidad con botón |
| **CodeInput** | `Tab` | Insertar tab (si soportado) |
| **SwitchInput** | `Space` | Toggle on/off |
| **SliderInput** | `←→` | Incrementar/decrementar |

---

## 🌈 Colores de Estado

### Border Colors

| Estado | Color | Clase Tailwind |
|--------|-------|----------------|
| Default | Gris | `border-gray-300 dark:border-gray-600` |
| Focus | Azul | `border-blue-500` |
| Error | Rojo | `border-red-500` |
| Disabled | Gris claro | `border-gray-300` (opacidad 50%) |

### Ring Colors (Focus)

| Estado | Color | Clase Tailwind |
|--------|-------|----------------|
| Normal | Azul | `ring-blue-200 dark:ring-blue-900` |
| Error | Rojo | `ring-red-200 dark:ring-red-900` |

### Indicadores Especiales

**PasswordInput - Fortaleza:**
- 🔴 Débil: `bg-red-500`
- 🟠 Regular: `bg-orange-500`
- 🟡 Buena: `bg-yellow-500`
- 🟢 Fuerte: `bg-green-500`

**RatingInput - Estrellas:**
- ⭐ Activa: `fill-yellow-400 text-yellow-400`
- ☆ Inactiva: `text-gray-300 dark:text-gray-600`

**TagInput - Badges:**
- 🏷️ Tag: `bg-blue-100 dark:bg-blue-900/30 border-blue-200`

---

## 📱 Compatibilidad Mobile

| Componente | Touch-Friendly | Comentarios |
|------------|----------------|-------------|
| SliderInput | ✅ Excelente | Fácil de arrastrar |
| RatingInput | ✅ Excelente | Botones grandes |
| ColorPickerInput | ✅ Buena | Picker nativo móvil |
| TimeInput | ✅ Excelente | Teclado nativo |
| CurrencyInput | ✅ Buena | Teclado numérico |
| URLInput | ✅ Buena | Teclado URL |
| PasswordInput | ✅ Buena | Toggle grande |
| CodeInput | ⚠️ Regular | Mejor en desktop |
| TagInput | ✅ Buena | Badges grandes |
| SwitchInput | ✅ Excelente | Touch target grande |

---

## 🔍 Performance

| Componente | Re-renders | Optimización |
|------------|-----------|--------------|
| SliderInput | Media | Debounce recomendado |
| RatingInput | Baja | Optimizado |
| ColorPickerInput | Baja | onChange al cambiar |
| TimeInput | Baja | onChange al cambiar |
| CurrencyInput | Media | Formateo al blur |
| URLInput | Media | Validación en onChange |
| PasswordInput | Alta | Cálculo en cada tecla |
| CodeInput | Alta | Considera debounce |
| TagInput | Media | Re-render al agregar/quitar |
| SwitchInput | Baja | Cambio inmediato |

### Recomendaciones de Optimización

```typescript
// Para componentes con onChange frecuente
import { useDebouncedCallback } from 'use-debounce';

const debouncedChange = useDebouncedCallback(
  (value) => {
    // Tu lógica aquí
  },
  300
);

<SliderInput onChange={debouncedChange} />
```

---

## 🎓 Nivel de Complejidad

| Componente | Complejidad | Curva de Aprendizaje |
|------------|-------------|---------------------|
| SwitchInput | ⭐ Básico | Muy fácil |
| SliderInput | ⭐ Básico | Muy fácil |
| TimeInput | ⭐ Básico | Muy fácil |
| RatingInput | ⭐⭐ Intermedio | Fácil |
| ColorPickerInput | ⭐⭐ Intermedio | Fácil |
| URLInput | ⭐⭐ Intermedio | Moderado |
| TagInput | ⭐⭐ Intermedio | Moderado |
| PasswordInput | ⭐⭐⭐ Avanzado | Moderado |
| CurrencyInput | ⭐⭐⭐ Avanzado | Moderado |
| CodeInput | ⭐⭐⭐ Avanzado | Avanzado |

---

## 🆚 Comparaciones

### SwitchInput vs CheckboxInput

| Aspecto | SwitchInput | CheckboxInput |
|---------|-------------|---------------|
| **Uso** | Configuraciones on/off | Aceptación/selección múltiple |
| **Visual** | Toggle moderno | Checkbox tradicional |
| **Feedback** | Inmediato | Requiere submit |
| **Ejemplo** | "Activar modo oscuro" | "Acepto términos" |

### SliderInput vs NumberInput

| Aspecto | SliderInput | NumberInput |
|---------|-------------|-------------|
| **Precisión** | Menos preciso (visual) | Muy preciso |
| **UX** | Más intuitivo | Más directo |
| **Rango** | Visible siempre | No visible |
| **Ejemplo** | "Nivel de satisfacción" | "Edad exacta" |

### TagInput vs MultiSelectInput

| Aspecto | TagInput | MultiSelectInput |
|---------|----------|------------------|
| **Opciones** | Libre (cualquier texto) | Predefinidas |
| **UX** | Input + agregar | Lista + seleccionar |
| **Validación** | Manual | Automática |
| **Ejemplo** | "Habilidades" (libre) | "Provincias" (lista) |

### PasswordInput vs TextInput

| Aspecto | PasswordInput | TextInput (type="password") |
|---------|---------------|---------------------------|
| **Seguridad** | Indicador de fortaleza | Solo oculta texto |
| **UX** | Toggle visibilidad | Siempre oculto |
| **Validación** | Visual en tiempo real | Manual |
| **Ejemplo** | Registro de usuario | Login rápido |

---

## 📊 Métricas de Uso

### Tamaño de Bundle (estimado)

| Componente | Tamaño | Dependencias Externas |
|------------|--------|----------------------|
| SliderInput | ~2KB | Radix UI Slider |
| RatingInput | ~1.5KB | Lucide (Star) |
| ColorPickerInput | ~1KB | Lucide (Palette) |
| TimeInput | ~1KB | Lucide (Clock) |
| CurrencyInput | ~2KB | Lucide (DollarSign) |
| URLInput | ~1.5KB | Lucide (Link, icons) |
| PasswordInput | ~2.5KB | Lucide (Eye, Lock) |
| CodeInput | ~3KB | Lucide (Code, Copy) |
| TagInput | ~2KB | Lucide (Tag, X) |
| SwitchInput | ~1.5KB | Radix UI Switch |

---

## 🎯 Matriz de Decisión

### ¿Qué componente usar?

```
¿Necesitas un valor numérico?
├─ Sí
│  ├─ ¿En un rango visible? → SliderInput
│  ├─ ¿Calificación/estrellas? → RatingInput
│  └─ ¿Cantidad monetaria? → CurrencyInput
│
├─ ¿Necesitas texto?
│  ├─ ¿URL/enlace? → URLInput
│  ├─ ¿Contraseña? → PasswordInput
│  ├─ ¿Código fuente? → CodeInput
│  └─ ¿Lista de palabras? → TagInput
│
├─ ¿Necesitas color?
│  └─ Sí → ColorPickerInput
│
├─ ¿Necesitas hora?
│  └─ Sí → TimeInput
│
└─ ¿Necesitas on/off?
   └─ Sí → SwitchInput
```

---

## 📚 Recursos Rápidos

### Links de Documentación
- **Completa:** `/docs/ComponentesAvanzados.md`
- **Guía Rápida:** `/docs/GuiaRapida.md`
- **Esta tabla:** `/docs/TablaReferencia.md`

### Archivos de Código
- **Componentes:** `/components/forms/fields/`
- **Tipos:** `/types/form.ts`
- **Demo:** `/App.tsx` (Sección 5)

---

**Última actualización:** Enero 2026 | **Versión:** 1.0.0
