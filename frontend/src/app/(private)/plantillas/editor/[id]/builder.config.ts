import type { ComponentConfig, Config, FieldConfig } from "@measured/puck";

export type BuilderFieldConfig = FieldConfig;
export type BuilderComponentConfig = ComponentConfig<Record<string, unknown>>;

const baseFieldControls: Record<string, BuilderFieldConfig> = {
  key: {
    type: "text",
    label: "Identificador",
    helperText:
      "Se utiliza para enlazar el campo con los datos de la plantilla. Debe ser único dentro del formulario.",
  },
  label: {
    type: "text",
    label: "Etiqueta visible",
    helperText: "Texto mostrado como título principal del campo.",
  },
  description: {
    type: "textarea",
    label: "Descripción",
    helperText: "Mensaje de ayuda que se mostrará debajo del campo.",
  },
  required: {
    type: "checkbox",
    label: "Es requerido",
    helperText: "Determina si el campo es obligatorio para el usuario.",
    defaultValue: false,
  },
};

const builderComponents: Record<string, BuilderComponentConfig> = {
  text: {
    label: "Campo de texto",
    description: "Entrada de texto de una sola línea.",
    category: "fields",
    defaultProps: {
      label: "Campo sin título",
      placeholder: "Ingresá un valor",
      required: false,
    },
    fields: {
      ...baseFieldControls,
      placeholder: {
        type: "text",
        label: "Placeholder",
        helperText: "Texto de ejemplo que se mostrará dentro del campo.",
      },
      maxLength: {
        type: "number",
        label: "Longitud máxima",
        helperText: "Cantidad máxima de caracteres permitidos.",
      },
    },
  },
  number: {
    label: "Número",
    description: "Campo numérico con validaciones básicas.",
    category: "fields",
    defaultProps: {
      label: "Número",
      placeholder: "0",
      required: false,
    },
    fields: {
      ...baseFieldControls,
      placeholder: {
        type: "text",
        label: "Placeholder",
        helperText: "Texto de ejemplo que se mostrará dentro del campo.",
      },
      minValue: {
        type: "number",
        label: "Valor mínimo",
        helperText: "Restringe el valor mínimo permitido.",
      },
      maxValue: {
        type: "number",
        label: "Valor máximo",
        helperText: "Restringe el valor máximo permitido.",
      },
      step: {
        type: "number",
        label: "Incremento",
        helperText: "Valor utilizado para incrementar o decrementar.",
      },
    },
  },
  select: {
    label: "Lista desplegable",
    description: "Permite seleccionar una opción entre múltiples alternativas.",
    category: "fields",
    defaultProps: {
      label: "Seleccioná una opción",
      required: false,
    },
    fields: {
      ...baseFieldControls,
      placeholder: {
        type: "text",
        label: "Placeholder",
        helperText: "Mensaje mostrado cuando no hay una opción seleccionada.",
      },
      options: {
        type: "textarea",
        label: "Opciones",
        helperText: "Ingresá una opción por línea en el formato valor|Etiqueta.",
      },
    },
  },
  date: {
    label: "Fecha",
    description: "Selector de fecha simple.",
    category: "fields",
    defaultProps: {
      label: "Fecha",
      required: false,
    },
    fields: {
      ...baseFieldControls,
      minDate: {
        type: "date",
        label: "Fecha mínima",
        helperText: "Limita la selección a fechas posteriores o iguales.",
      },
      maxDate: {
        type: "date",
        label: "Fecha máxima",
        helperText: "Limita la selección a fechas anteriores o iguales.",
      },
    },
  },
  checkbox: {
    label: "Casilla",
    description: "Campo booleano para activar o desactivar una opción.",
    category: "fields",
    defaultProps: {
      label: "Aceptar",
      required: false,
    },
    fields: {
      ...baseFieldControls,
      defaultChecked: {
        type: "checkbox",
        label: "Marcado por defecto",
        helperText: "Define si la casilla aparece marcada inicialmente.",
        defaultValue: false,
      },
    },
  },
  file: {
    label: "Archivo",
    description: "Permite adjuntar documentos al formulario.",
    category: "fields",
    defaultProps: {
      label: "Documento",
      required: false,
    },
    fields: {
      ...baseFieldControls,
      accept: {
        type: "text",
        label: "Formatos permitidos",
        helperText: "Lista de extensiones separadas por coma (por ejemplo: pdf,jpg).",
      },
      maxSizeMB: {
        type: "number",
        label: "Tamaño máximo (MB)",
        helperText: "Restringe el tamaño máximo por archivo en megabytes.",
      },
      isNewFileFlag: {
        type: "checkbox",
        label: "Requiere archivo nuevo",
        helperText: "Obliga a subir un documento diferente al existente.",
        defaultValue: false,
      },
    },
  },
  section: {
    label: "Sección",
    description: "Agrupa campos relacionados bajo un mismo encabezado.",
    category: "structure",
    defaultProps: {
      title: "Nueva sección",
    },
    fields: {
      title: {
        type: "text",
        label: "Título",
        helperText: "Nombre principal mostrado en el encabezado de la sección.",
      },
      description: {
        type: "textarea",
        label: "Descripción",
        helperText: "Texto opcional que se muestra debajo del título.",
      },
      showBorder: {
        type: "checkbox",
        label: "Mostrar borde",
        helperText: "Agrega un contorno visual alrededor de la sección.",
        defaultValue: true,
      },
    },
  },
  tabs: {
    label: "Pestañas",
    description: "Organiza contenidos en pestañas horizontales.",
    category: "structure",
    defaultProps: {
      title: "Conjunto de pestañas",
    },
    fields: {
      title: {
        type: "text",
        label: "Título",
        helperText: "Nombre general del contenedor de pestañas.",
      },
      tabs: {
        type: "textarea",
        label: "Listado de pestañas",
        helperText: "Ingresá una pestaña por línea. Cada pestaña creará un contenedor.",
      },
      description: {
        type: "textarea",
        label: "Descripción",
        helperText: "Texto introductorio que acompaña el conjunto de pestañas.",
      },
    },
  },
  repeater: {
    label: "Repetidor",
    description: "Permite repetir un grupo de campos dinámicamente.",
    category: "structure",
    defaultProps: {
      label: "Grupo",
      minItems: 0,
    },
    fields: {
      ...baseFieldControls,
      minItems: {
        type: "number",
        label: "Mínimo de ítems",
        helperText: "Cantidad mínima de repeticiones permitidas.",
      },
      maxItems: {
        type: "number",
        label: "Máximo de ítems",
        helperText: "Cantidad máxima de repeticiones permitidas.",
      },
    },
  },
};

export const builderConfig: Config<typeof builderComponents> = {
  categories: [
    {
      id: "fields",
      label: "Campos",
      components: ["text", "number", "select", "date", "checkbox", "file"],
    },
    {
      id: "structure",
      label: "Estructura",
      components: ["section", "tabs", "repeater"],
    },
  ],
  components: builderComponents,
};

export type BuilderComponentId = keyof typeof builderComponents;
export type BuilderConfig = typeof builderConfig;

export default builderConfig;
