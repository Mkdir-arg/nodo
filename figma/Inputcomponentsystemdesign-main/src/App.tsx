import React, { useState } from 'react';
import { DynamicForm } from './components/forms/DynamicForm';
import { PaginatorUI } from './components/forms/ui/PaginatorUI';
import { FormField, FormData, FormSection } from './types/form';
import { FileText, Users, Building2, Save } from 'lucide-react';

export default function App() {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<FormData>({});

  // Definir las secciones del formulario
  const formSections: FormSection[] = [
    {
      id: 'section-1',
      title: 'Datos Personales',
      fields: [
        {
          id: 'ui-header',
          type: 'ui:header',
          headerTitle: 'Formulario de Registro',
          headerDescription: 'Complete todos los campos requeridos para continuar con el proceso',
        },
        {
          id: 'banner-info',
          type: 'ui:banner',
          bannerType: 'info',
          bannerMessage: 'Todos los campos marcados con asterisco (*) son obligatorios.',
        },
        {
          id: 'nombre',
          type: 'text',
          label: 'Nombre',
          placeholder: 'Ingrese su nombre',
          required: true,
          size: 'md',
        },
        {
          id: 'apellido',
          type: 'text',
          label: 'Apellido',
          placeholder: 'Ingrese su apellido',
          required: true,
          size: 'md',
        },
        {
          id: 'email',
          type: 'email',
          label: 'Correo Electrónico',
          placeholder: 'ejemplo@correo.com',
          required: true,
          size: 'md',
        },
        {
          id: 'tipo-documento',
          type: 'select',
          label: 'Tipo de Documento',
          required: true,
          options: [
            { value: 'dni', label: 'DNI' },
            { value: 'pasaporte', label: 'Pasaporte' },
            { value: 'cedula', label: 'Cédula' },
          ],
        },
        {
          id: 'numero-documento',
          type: 'number',
          label: 'Número de Documento',
          placeholder: '12345678',
          required: true,
        },
        {
          id: 'fecha-nacimiento',
          type: 'date',
          label: 'Fecha de Nacimiento',
          required: true,
        },
        {
          id: 'telefono',
          type: 'phone',
          label: 'Teléfono',
          placeholder: '+54 9 11 1234-5678',
          required: false,
        },
        {
          id: 'divider-1',
          type: 'ui:divider',
          label: 'Dirección',
        },
        {
          id: 'provincia',
          type: 'select_with_filter',
          label: 'Provincia',
          required: true,
          options: [
            { value: 'buenos-aires', label: 'Buenos Aires' },
            { value: 'cordoba', label: 'Córdoba' },
            { value: 'santa-fe', label: 'Santa Fe' },
            { value: 'mendoza', label: 'Mendoza' },
            { value: 'tucuman', label: 'Tucumán' },
            { value: 'entre-rios', label: 'Entre Ríos' },
            { value: 'salta', label: 'Salta' },
            { value: 'misiones', label: 'Misiones' },
            { value: 'chaco', label: 'Chaco' },
            { value: 'corrientes', label: 'Corrientes' },
          ],
        },
        {
          id: 'municipio',
          type: 'select',
          label: 'Municipio',
          required: true,
          options: [
            { value: 'caba', label: 'Ciudad Autónoma de Buenos Aires' },
            { value: 'la-plata', label: 'La Plata' },
            { value: 'mar-del-plata', label: 'Mar del Plata' },
            { value: 'rosario', label: 'Rosario' },
          ],
        },
        {
          id: 'calle',
          type: 'text',
          label: 'Calle',
          placeholder: 'Av. Corrientes',
          required: true,
        },
        {
          id: 'numero',
          type: 'number',
          label: 'Número',
          placeholder: '1234',
          required: true,
        },
      ],
    },
    {
      id: 'section-2',
      title: 'Información Adicional',
      fields: [
        {
          id: 'ocupacion',
          type: 'radio',
          label: 'Ocupación',
          required: true,
          options: [
            { value: 'empleado', label: 'Empleado en relación de dependencia' },
            { value: 'independiente', label: 'Trabajador independiente' },
            { value: 'estudiante', label: 'Estudiante' },
            { value: 'jubilado', label: 'Jubilado/Pensionado' },
            { value: 'desempleado', label: 'Desempleado' },
          ],
        },
        {
          id: 'divider-2',
          type: 'ui:divider',
        },
        {
          id: 'intereses',
          type: 'multiselect',
          label: 'Áreas de Interés',
          required: false,
          options: [
            { value: 'tecnologia', label: 'Tecnología' },
            { value: 'deportes', label: 'Deportes' },
            { value: 'arte', label: 'Arte y Cultura' },
            { value: 'ciencia', label: 'Ciencia' },
            { value: 'musica', label: 'Música' },
            { value: 'viajes', label: 'Viajes' },
          ],
        },
        {
          id: 'biografia',
          type: 'textarea',
          label: 'Biografía',
          placeholder: 'Cuéntenos un poco sobre usted...',
          required: false,
        },
        {
          id: 'acepta-terminos',
          type: 'checkbox',
          label: 'Acepto los términos y condiciones del servicio',
          required: true,
        },
        {
          id: 'acepta-newsletter',
          type: 'checkbox',
          label: 'Deseo recibir información y novedades por correo electrónico',
          required: false,
        },
      ],
    },
    {
      id: 'section-3',
      title: 'Documentación y Vínculos',
      fields: [
        {
          id: 'banner-warning',
          type: 'ui:banner',
          bannerType: 'warning',
          bannerMessage: 'Asegúrese de que los documentos estén en formato PDF y no superen los 10MB.',
        },
        {
          id: 'documento-identidad',
          type: 'document',
          label: 'Documento de Identidad (Frente)',
          required: true,
          accept: '.pdf,.jpg,.jpeg,.png',
          maxSize: 10,
        },
        {
          id: 'foto-perfil',
          type: 'image',
          label: 'Foto de Perfil',
          required: false,
          maxSize: 5,
        },
        {
          id: 'divider-3',
          type: 'ui:divider',
          label: 'Vínculos Familiares',
        },
        {
          id: 'info-vinculos',
          type: 'info',
          label: 'Información',
          value: 'A continuación puede vincular legajos familiares. Esto es opcional pero ayuda a mantener un registro completo.',
        },
        {
          id: 'relaciones',
          type: 'ui:relation',
          label: 'Vínculos Familiares',
          relationTypes: ['Hijo/a', 'Madre', 'Padre', 'Cónyuge', 'Hermano/a'],
          relations: [],
          required: false,
        },
      ],
    },
    {
      id: 'section-4',
      title: 'Datos Empresariales',
      fields: [
        {
          id: 'tiene-empresa',
          type: 'radio',
          label: '¿Posee una empresa?',
          required: true,
          options: [
            { value: 'si', label: 'Sí' },
            { value: 'no', label: 'No' },
          ],
        },
        {
          id: 'empresa-info',
          type: 'cuit_razon_social',
          label: 'Información Empresarial',
          required: false,
        },
        {
          id: 'divider-4',
          type: 'ui:divider',
          label: 'Referencias Laborales',
        },
        {
          id: 'referencias',
          type: 'group',
          label: 'Referencias Laborales',
          groupFields: [
            {
              id: 'nombre-ref',
              type: 'text',
              label: 'Nombre Completo',
              required: true,
            },
            {
              id: 'empresa-ref',
              type: 'text',
              label: 'Empresa',
              required: true,
            },
            {
              id: 'telefono-ref',
              type: 'phone',
              label: 'Teléfono',
              required: true,
            },
            {
              id: 'email-ref',
              type: 'email',
              label: 'Email',
              required: true,
            },
          ],
          maxItems: 3,
          required: false,
        },
        {
          id: 'divider-5',
          type: 'ui:divider',
          label: 'Cálculo de Ingresos',
        },
        {
          id: 'ingreso-principal',
          type: 'number',
          label: 'Ingreso Principal',
          placeholder: '0.00',
          required: false,
        },
        {
          id: 'ingreso-adicional',
          type: 'number',
          label: 'Ingresos Adicionales',
          placeholder: '0.00',
          required: false,
        },
        {
          id: 'total-ingresos',
          type: 'sum',
          label: 'Total de Ingresos Mensuales',
          sumFields: ['ingreso-principal', 'ingreso-adicional'],
        },
      ],
    },
    {
      id: 'section-5',
      title: 'Componentes Avanzados',
      fields: [
        {
          id: 'ui-header-advanced',
          type: 'ui:header',
          headerTitle: 'Campos de Entrada Avanzados',
          headerDescription: 'Explora los nuevos componentes disponibles para formularios dinámicos',
        },
        {
          id: 'banner-new-components',
          type: 'ui:banner',
          bannerType: 'info',
          bannerMessage: 'Esta sección demuestra 10 nuevos componentes de entrada avanzados.',
        },
        {
          id: 'website',
          type: 'url',
          label: 'Sitio Web',
          placeholder: 'https://ejemplo.com',
          required: false,
          showPreview: true,
        },
        {
          id: 'contrasena',
          type: 'password',
          label: 'Contraseña',
          placeholder: 'Ingrese una contraseña segura',
          required: false,
          showStrength: true,
        },
        {
          id: 'divider-advanced-1',
          type: 'ui:divider',
          label: 'Preferencias',
        },
        {
          id: 'calificacion',
          type: 'rating',
          label: 'Calificación del Servicio',
          maxRating: 5,
          required: false,
        },
        {
          id: 'volumen',
          type: 'slider',
          label: 'Nivel de Satisfacción',
          min: 0,
          max: 100,
          step: 5,
          showValue: true,
          required: false,
        },
        {
          id: 'notificaciones',
          type: 'switch',
          label: 'Notificaciones Push',
          description: 'Recibir notificaciones sobre actualizaciones importantes',
          required: false,
        },
        {
          id: 'modo-oscuro',
          type: 'switch',
          label: 'Modo Oscuro',
          description: 'Activar tema oscuro en la aplicación',
          required: false,
        },
        {
          id: 'divider-advanced-2',
          type: 'ui:divider',
          label: 'Personalización',
        },
        {
          id: 'color-favorito',
          type: 'color',
          label: 'Color de Tema',
          placeholder: '#3B82F6',
          required: false,
        },
        {
          id: 'hora-preferida',
          type: 'time',
          label: 'Hora Preferida para Notificaciones',
          required: false,
        },
        {
          id: 'presupuesto',
          type: 'currency',
          label: 'Presupuesto Mensual',
          currency: 'ARS',
          locale: 'es-AR',
          min: 0,
          max: 1000000,
          required: false,
        },
        {
          id: 'divider-advanced-3',
          type: 'ui:divider',
          label: 'Desarrollo',
        },
        {
          id: 'habilidades',
          type: 'tags',
          label: 'Habilidades Técnicas',
          placeholder: 'Escribe y presiona Enter',
          maxTags: 10,
          required: false,
        },
        {
          id: 'codigo-snippet',
          type: 'code',
          label: 'Código de Ejemplo',
          language: 'javascript',
          showLineNumbers: true,
          minRows: 5,
          maxRows: 15,
          placeholder: '// Escribe tu código aquí...',
          required: false,
        },
      ],
    },
  ];

  const steps = formSections.map((section, index) => ({
    id: section.id,
    label: section.title,
    completed: index < currentStep,
  }));

  const handleFormChange = (data: FormData) => {
    setFormData(data);
  };

  const handleNext = () => {
    if (currentStep < formSections.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleStepChange = (step: number) => {
    setCurrentStep(step);
  };

  const handleSubmit = (data: FormData) => {
    console.log('Form submitted:', data);
    alert('Formulario enviado correctamente! Revisa la consola para ver los datos.');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                Sistema de Formularios Dinámicos
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Constructor de formularios con validación y componentes reutilizables
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-8">
          {/* Paginator */}
          <PaginatorUI
            steps={steps}
            currentStep={currentStep}
            onStepChange={handleStepChange}
            onNext={handleNext}
            onPrevious={handlePrevious}
          />

          {/* Form */}
          <div className="mt-8">
            <DynamicForm
              fields={formSections[currentStep].fields}
              initialData={formData}
              onChange={handleFormChange}
              onSubmit={handleSubmit}
            />
          </div>

          {/* Action Buttons */}
          {currentStep === formSections.length - 1 && (
            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={() => handleSubmit(formData)}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-green-500 hover:bg-green-600 text-white font-semibold transition-colors"
              >
                <Save className="w-5 h-5" />
                Enviar Formulario
              </button>
            </div>
          )}
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900">
                <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                32+ Componentes
              </h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Inputs básicos, avanzados, selección múltiple, fechas, archivos y más
            </p>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900">
                <Users className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                Totalmente Tipado
              </h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              TypeScript completo con validaciones y autocompletado
            </p>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900">
                <Building2 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                Modo Oscuro
              </h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Diseño adaptable a tema claro y oscuro automáticamente
            </p>
          </div>
        </div>

        {/* Component List */}
        <div className="mt-8 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Componentes Disponibles
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              'Text Input',
              'Email Input',
              'Number Input',
              'Phone Input',
              'Textarea',
              'Select',
              'Multiselect',
              'Radio Buttons',
              'Checkbox',
              'Date Picker',
              'Select with Filter',
              'Document Upload',
              'Image Upload',
              'CUIT + Razón Social',
              'Relation Tags',
              'Info Field',
              'Sum Field',
              'Group (Iterativo)',
              'Slider Input',
              'Rating Input',
              'Color Picker',
              'Time Input',
              'Currency Input',
              'URL Input',
              'Password Input',
              'Code Input',
              'Tag Input',
              'Switch Input',
              'Header UI',
              'Divider UI',
              'Banner UI',
              'Paginator UI',
            ].map((component) => (
              <div
                key={component}
                className="px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm text-gray-700 dark:text-gray-300"
              >
                {component}
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}