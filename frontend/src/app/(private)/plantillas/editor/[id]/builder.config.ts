import type { Config } from "@measured/puck";
import { TextField } from "@/lib/forms/runtime/fields/TextField";
import { NumberField } from "@/lib/forms/runtime/fields/NumberField";
import { SelectField } from "@/lib/forms/runtime/fields/SelectField";
import { CheckboxField } from "@/lib/forms/runtime/fields/CheckboxField";
import { DateField } from "@/lib/forms/runtime/fields/DateField";

export type Props = {
  TextField: {
    field: {
      type: "text" | "textarea";
      name: string;
      label?: string;
      placeholder?: string;
      required?: boolean;
      description?: string;
    };
  };
  NumberField: {
    field: {
      type: "number";
      name: string;
      label?: string;
      placeholder?: string;
      required?: boolean;
      description?: string;
      min?: number;
      max?: number;
      step?: number;
    };
  };
  SelectField: {
    field: {
      type: "select";
      name: string;
      label?: string;
      placeholder?: string;
      required?: boolean;
      description?: string;
      options: Array<{ label: string; value: string }>;
    };
  };
  CheckboxField: {
    field: {
      type: "checkbox";
      name: string;
      label?: string;
      required?: boolean;
      description?: string;
    };
  };
  DateField: {
    field: {
      type: "date";
      name: string;
      label?: string;
      required?: boolean;
      description?: string;
      minDate?: string;
      maxDate?: string;
    };
  };
};

export const config: Config<Props> = {
  components: {
    TextField: {
      fields: {
        field: {
          type: "object",
          objectFields: {
            type: {
              type: "select",
              options: [
                { label: "Texto", value: "text" },
                { label: "Área de texto", value: "textarea" },
              ],
            },
            name: { type: "text" },
            label: { type: "text" },
            placeholder: { type: "text" },
            required: { type: "radio", options: [
              { label: "Sí", value: true },
              { label: "No", value: false },
            ]},
            description: { type: "textarea" },
          },
        },
      },
      defaultProps: {
        field: {
          type: "text",
          name: "campo",
          label: "Campo de texto",
          required: false,
        },
      },
      render: ({ field }) => <TextField field={field} />,
    },
    NumberField: {
      fields: {
        field: {
          type: "object",
          objectFields: {
            name: { type: "text" },
            label: { type: "text" },
            placeholder: { type: "text" },
            required: { type: "radio", options: [
              { label: "Sí", value: true },
              { label: "No", value: false },
            ]},
            description: { type: "textarea" },
            min: { type: "number" },
            max: { type: "number" },
            step: { type: "number" },
          },
        },
      },
      defaultProps: {
        field: {
          type: "number",
          name: "numero",
          label: "Campo numérico",
          required: false,
        },
      },
      render: ({ field }) => <NumberField field={field} />,
    },
    SelectField: {
      fields: {
        field: {
          type: "object",
          objectFields: {
            name: { type: "text" },
            label: { type: "text" },
            placeholder: { type: "text" },
            required: { type: "radio", options: [
              { label: "Sí", value: true },
              { label: "No", value: false },
            ]},
            description: { type: "textarea" },
            options: {
              type: "array",
              arrayFields: {
                label: { type: "text" },
                value: { type: "text" },
              },
            },
          },
        },
      },
      defaultProps: {
        field: {
          type: "select",
          name: "seleccion",
          label: "Campo de selección",
          required: false,
          options: [
            { label: "Opción 1", value: "opt1" },
            { label: "Opción 2", value: "opt2" },
          ],
        },
      },
      render: ({ field }) => <SelectField field={field} />,
    },
    CheckboxField: {
      fields: {
        field: {
          type: "object",
          objectFields: {
            name: { type: "text" },
            label: { type: "text" },
            required: { type: "radio", options: [
              { label: "Sí", value: true },
              { label: "No", value: false },
            ]},
            description: { type: "textarea" },
          },
        },
      },
      defaultProps: {
        field: {
          type: "checkbox",
          name: "checkbox",
          label: "Campo de checkbox",
          required: false,
        },
      },
      render: ({ field }) => <CheckboxField field={field} />,
    },
    DateField: {
      fields: {
        field: {
          type: "object",
          objectFields: {
            name: { type: "text" },
            label: { type: "text" },
            required: { type: "radio", options: [
              { label: "Sí", value: true },
              { label: "No", value: false },
            ]},
            description: { type: "textarea" },
            minDate: { type: "text" },
            maxDate: { type: "text" },
          },
        },
      },
      defaultProps: {
        field: {
          type: "date",
          name: "fecha",
          label: "Campo de fecha",
          required: false,
        },
      },
      render: ({ field }) => <DateField field={field} />,
    },
  },
};