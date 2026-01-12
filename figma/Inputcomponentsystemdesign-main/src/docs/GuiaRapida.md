# 🚀 Guía Rápida - Componentes Avanzados

Esta guía te ayudará a empezar a usar los componentes avanzados rápidamente.

---

## ⚡ Instalación y Setup

Los componentes ya están instalados y listos para usar. Solo necesitas importarlos:

```tsx
import { SliderInput } from './components/forms/fields/SliderInput';
import { RatingInput } from './components/forms/fields/RatingInput';
import { ColorPickerInput } from './components/forms/fields/ColorPickerInput';
import { TimeInput } from './components/forms/fields/TimeInput';
import { CurrencyInput } from './components/forms/fields/CurrencyInput';
import { URLInput } from './components/forms/fields/URLInput';
import { PasswordInput } from './components/forms/fields/PasswordInput';
import { CodeInput } from './components/forms/fields/CodeInput';
import { TagInput } from './components/forms/fields/TagInput';
import { SwitchInput } from './components/forms/fields/SwitchInput';
```

---

## 📝 Uso con DynamicForm (Recomendado)

La forma más fácil de usar los componentes es mediante `DynamicForm`:

```tsx
import { DynamicForm } from './components/forms/DynamicForm';

const formFields = [
  {
    id: 'rating',
    type: 'rating',
    label: 'Calificación',
    maxRating: 5,
  },
  {
    id: 'budget',
    type: 'currency',
    label: 'Presupuesto',
    currency: 'USD',
  },
];

<DynamicForm
  fields={formFields}
  onChange={(data) => console.log(data)}
/>
```

---

## 🎯 Casos de Uso Comunes

### 1. Formulario de Registro con Contraseña Segura

```typescript
const registrationForm = [
  {
    id: 'email',
    type: 'email',
    label: 'Correo Electrónico',
    required: true,
  },
  {
    id: 'password',
    type: 'password',
    label: 'Contraseña',
    showStrength: true,
    required: true,
  },
  {
    id: 'website',
    type: 'url',
    label: 'Sitio Web',
    showPreview: true,
  },
];
```

### 2. Configuración de Preferencias

```typescript
const preferencesForm = [
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
    description: 'Recibir actualizaciones',
    value: true,
  },
  {
    id: 'notification-time',
    type: 'time',
    label: 'Hora de Notificaciones',
    value: '09:00',
  },
  {
    id: 'volume',
    type: 'slider',
    label: 'Volumen',
    min: 0,
    max: 100,
    value: 75,
  },
];
```

### 3. Formulario de Reseña/Feedback

```typescript
const feedbackForm = [
  {
    id: 'rating',
    type: 'rating',
    label: 'Califica tu experiencia',
    maxRating: 5,
    required: true,
  },
  {
    id: 'satisfaction',
    type: 'slider',
    label: 'Nivel de Satisfacción',
    min: 0,
    max: 100,
    step: 10,
    showValue: true,
  },
  {
    id: 'comments',
    type: 'textarea',
    label: 'Comentarios adicionales',
  },
];
```

### 4. Perfil de Desarrollador

```typescript
const developerProfile = [
  {
    id: 'skills',
    type: 'tags',
    label: 'Habilidades Técnicas',
    maxTags: 15,
    placeholder: 'JavaScript, React, Node.js...',
  },
  {
    id: 'github',
    type: 'url',
    label: 'GitHub Profile',
    showPreview: true,
  },
  {
    id: 'portfolio',
    type: 'url',
    label: 'Portfolio',
    showPreview: true,
  },
  {
    id: 'code-sample',
    type: 'code',
    label: 'Ejemplo de Código',
    language: 'javascript',
    showLineNumbers: true,
    minRows: 10,
  },
];
```

### 5. Formulario de Presupuesto/Finanzas

```typescript
const budgetForm = [
  {
    id: 'monthly-income',
    type: 'currency',
    label: 'Ingresos Mensuales',
    currency: 'USD',
    locale: 'en-US',
    min: 0,
  },
  {
    id: 'monthly-expenses',
    type: 'currency',
    label: 'Gastos Mensuales',
    currency: 'USD',
    locale: 'en-US',
    min: 0,
  },
  {
    id: 'savings-goal',
    type: 'slider',
    label: 'Meta de Ahorro (%)',
    min: 0,
    max: 100,
    step: 5,
    showValue: true,
  },
];
```

---

## 🎨 Personalización de Estilos

### Cambiar Tamaños

```typescript
{
  id: 'my-field',
  type: 'slider',
  label: 'Campo Pequeño',
  size: 'sm', // 'sm' | 'md' | 'lg'
}
```

### Manejo de Errores

```typescript
const [errors, setErrors] = useState({});

{
  id: 'email',
  type: 'email',
  label: 'Email',
  error: errors.email,
}

// Para mostrar error:
setErrors({ ...errors, email: 'El email no es válido' });

// Para limpiar error:
setErrors({ ...errors, email: undefined });
```

---

## 🔧 Tips y Mejores Prácticas

### 1. Validación en Tiempo Real

```typescript
const [formData, setFormData] = useState({});
const [errors, setErrors] = useState({});

const validateField = (fieldId: string, value: any) => {
  switch (fieldId) {
    case 'password':
      if (value.length < 8) {
        setErrors(prev => ({ 
          ...prev, 
          password: 'Mínimo 8 caracteres' 
        }));
      } else {
        setErrors(prev => ({ ...prev, password: undefined }));
      }
      break;
    case 'rating':
      if (value === 0) {
        setErrors(prev => ({ 
          ...prev, 
          rating: 'Por favor califica' 
        }));
      }
      break;
  }
};

const handleChange = (data) => {
  setFormData(data);
  // Validar cada campo modificado
  Object.keys(data).forEach(key => {
    validateField(key, data[key]);
  });
};
```

### 2. Valores Iniciales

```typescript
const initialData = {
  'theme-color': '#3B82F6',
  'notifications': true,
  'volume': 75,
  'rating': 0,
  'tags': ['JavaScript', 'React'],
};

<DynamicForm
  fields={formFields}
  initialData={initialData}
  onChange={handleChange}
/>
```

### 3. Campos Condicionales

```typescript
const formFields = [
  {
    id: 'has-website',
    type: 'switch',
    label: '¿Tienes sitio web?',
  },
  // Mostrar URL solo si has-website es true
  ...(formData['has-website'] ? [{
    id: 'website',
    type: 'url',
    label: 'URL de tu sitio',
    required: true,
  }] : []),
];
```

### 4. Campos Deshabilitados/Readonly

```typescript
{
  id: 'rating',
  type: 'rating',
  label: 'Tu calificación anterior',
  value: 4,
  readonly: true, // No se puede modificar
}

{
  id: 'submit-button',
  type: 'button',
  disabled: !isFormValid, // Deshabilitar hasta que sea válido
}
```

---

## 📱 Responsive Design

Los componentes son responsive por defecto, pero puedes controlar el layout:

```typescript
// Grid de 1 columna en móvil, 2 en tablet, 3 en desktop
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {fields.map(field => (
    <div key={field.id}>
      {renderField(field)}
    </div>
  ))}
</div>
```

---

## 🌙 Modo Oscuro

Los componentes soportan modo oscuro automáticamente. Para controlar el tema:

```tsx
// En tu componente raíz o layout
<div className="dark"> {/* Forzar modo oscuro */}
  <DynamicForm fields={fields} />
</div>

// O detectar preferencias del sistema
const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
```

---

## 🧪 Testing

### Ejemplo con Testing Library

```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { SliderInput } from './components/forms/fields/SliderInput';

test('slider cambia de valor', () => {
  const handleChange = jest.fn();
  
  render(
    <SliderInput
      id="test-slider"
      label="Test Slider"
      value={50}
      min={0}
      max={100}
      onChange={handleChange}
    />
  );
  
  const slider = screen.getByRole('slider');
  fireEvent.change(slider, { target: { value: 75 } });
  
  expect(handleChange).toHaveBeenCalledWith(75);
});
```

---

## 🔍 Debugging

### Ver Datos del Formulario en Tiempo Real

```tsx
const [formData, setFormData] = useState({});

<DynamicForm
  fields={fields}
  onChange={setFormData}
/>

{/* Debug panel */}
<pre className="mt-4 p-4 bg-gray-100 rounded">
  {JSON.stringify(formData, null, 2)}
</pre>
```

### Logs de Cambios

```tsx
const handleChange = (data) => {
  console.log('Formulario actualizado:', data);
  setFormData(data);
};
```

---

## 📊 Integración con APIs

### Enviar Datos a un Backend

```tsx
const handleSubmit = async (data) => {
  try {
    const response = await fetch('/api/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (response.ok) {
      alert('Formulario enviado exitosamente!');
    }
  } catch (error) {
    console.error('Error:', error);
  }
};

<DynamicForm
  fields={fields}
  onSubmit={handleSubmit}
/>
```

### Cargar Datos desde una API

```tsx
useEffect(() => {
  const loadData = async () => {
    const response = await fetch('/api/user-preferences');
    const data = await response.json();
    setFormData(data);
  };
  
  loadData();
}, []);

<DynamicForm
  fields={fields}
  initialData={formData}
  onChange={setFormData}
/>
```

---

## 🎓 Ejemplos Avanzados

### Formulario Multi-Paso con Validación

```tsx
const [currentStep, setCurrentStep] = useState(0);
const [formData, setFormData] = useState({});
const [errors, setErrors] = useState({});

const formSteps = [
  {
    title: 'Información Personal',
    fields: [
      { id: 'name', type: 'text', label: 'Nombre', required: true },
      { id: 'email', type: 'email', label: 'Email', required: true },
    ],
  },
  {
    title: 'Preferencias',
    fields: [
      { id: 'theme', type: 'color', label: 'Color de Tema' },
      { id: 'notifications', type: 'switch', label: 'Notificaciones' },
    ],
  },
];

const validateStep = (stepIndex) => {
  const step = formSteps[stepIndex];
  const stepErrors = {};
  
  step.fields.forEach(field => {
    if (field.required && !formData[field.id]) {
      stepErrors[field.id] = 'Este campo es requerido';
    }
  });
  
  setErrors(stepErrors);
  return Object.keys(stepErrors).length === 0;
};

const handleNext = () => {
  if (validateStep(currentStep)) {
    setCurrentStep(prev => prev + 1);
  }
};

return (
  <div>
    <h2>{formSteps[currentStep].title}</h2>
    
    <DynamicForm
      fields={formSteps[currentStep].fields.map(field => ({
        ...field,
        error: errors[field.id],
      }))}
      initialData={formData}
      onChange={setFormData}
    />
    
    <button onClick={handleNext}>Siguiente</button>
  </div>
);
```

---

## 🔗 Referencias Rápidas

### Todos los Tipos Disponibles

```typescript
type FieldType = 
  | 'slider'      // Control deslizante
  | 'rating'      // Estrellas de calificación
  | 'color'       // Selector de color
  | 'time'        // Selector de hora
  | 'currency'    // Input de moneda
  | 'url'         // Input de URL
  | 'password'    // Input de contraseña
  | 'code'        // Editor de código
  | 'tags'        // Gestor de tags
  | 'switch';     // Toggle on/off
```

### Props Comunes a Todos

```typescript
interface CommonProps {
  id: string;               // Requerido
  label?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  size?: 'sm' | 'md' | 'lg';
  onChange?: (value: any) => void;
}
```

---

## 💡 Preguntas Frecuentes

### ¿Cómo cambio el idioma de los placeholders?

Edita directamente los campos:

```typescript
{
  id: 'password',
  type: 'password',
  label: 'Password',
  placeholder: 'Enter a secure password',
}
```

### ¿Puedo usar estos componentes fuera de DynamicForm?

¡Sí! Todos los componentes funcionan independientemente:

```tsx
import { RatingInput } from './components/forms/fields/RatingInput';

<RatingInput
  id="standalone-rating"
  label="Rate this"
  value={rating}
  onChange={setRating}
/>
```

### ¿Cómo agrego validaciones personalizadas?

Usa el prop `error` con tu lógica de validación:

```tsx
const validatePassword = (password) => {
  if (password.length < 8) return 'Muy corta';
  if (!/[A-Z]/.test(password)) return 'Necesita mayúscula';
  return undefined;
};

{
  id: 'password',
  type: 'password',
  error: validatePassword(formData.password),
}
```

### ¿Los componentes son accesibles?

Sí, todos implementan:
- Labels apropiados
- ARIA attributes
- Navegación por teclado
- Estados focus visibles

---

## 📚 Recursos Adicionales

- **Documentación Completa:** `/docs/ComponentesAvanzados.md`
- **Ejemplos de Código:** `/App.tsx` (Sección 5: Componentes Avanzados)
- **Tipos TypeScript:** `/types/form.ts`

---

## 🆘 Soporte

Si encuentras problemas o tienes preguntas:

1. Revisa la documentación completa
2. Inspecciona los ejemplos en App.tsx
3. Revisa los tipos en `/types/form.ts`
4. Consulta el código fuente en `/components/forms/fields/`

---

**¡Feliz codificación! 🚀**
