"use client";

import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { zodSchemaFromLayout } from "../zodSchemaFromLayout";
import { TextField } from "./fields/TextField";
import TextareaField from "./fields/TextareaField";
import { NumberField } from "./fields/NumberField";
import { SelectField } from "./fields/SelectField";
import { CheckboxField } from "./fields/CheckboxField";
import { DateField } from "./fields/DateField";
import FileField from "./fields/FileField";
import PhoneField from "./fields/PhoneField";
import InfoField from "./fields/InfoField";
import type { FormLayout, LayoutNode, FieldProps } from "../types";

// Mapeo de clases para evitar problemas con Tailwind purging
const colSpanClasses: Record<number, string> = {
  1: 'col-span-1',
  2: 'col-span-2', 
  3: 'col-span-3',
  4: 'col-span-4',
  5: 'col-span-5',
  6: 'col-span-6',
  7: 'col-span-7',
  8: 'col-span-8',
  9: 'col-span-9',
  10: 'col-span-10',
  11: 'col-span-11',
  12: 'col-span-12'
};

const renderField = (field: FieldProps) => {
  switch (field.type) {
    case "text":
    case "email":
    case "cuit_razon_social":
      return <TextField key={field.name} field={field} />;
    case "textarea":
      return <TextareaField key={field.name} field={field} name={field.name} />;
    case "number":
    case "sum":
      return <NumberField key={field.name} field={field} />;
    case "phone":
      return <PhoneField key={field.name} field={field} name={field.name} />;
    case "select":
    case "dropdown":
    case "multiselect":
    case "select_with_filter":
      return <SelectField key={field.name} field={field} />;
    case "checkbox":
      return <CheckboxField key={field.name} field={field} />;
    case "date":
      return <DateField key={field.name} field={field} />;
    case "document":
    case "file":
    case "image":
      return <FileField key={field.name} field={field} name={field.name} />;
    case "info":
      return <InfoField key={field.name || field.id} field={field} />;
    case "group":
      // TODO: Implementar GroupField
      return <div key={field.name} className="p-2 border border-orange-200 bg-orange-50 rounded">Grupo iterativo (pendiente)</div>;
    default:
      console.warn(`Unsupported field type: ${field.type}`);
      return null;
  }
};

export function DynamicFormRenderer({ 
  layout, 
  onSubmit, 
  defaultValues = {} 
}: {
  layout: FormLayout;
  onSubmit: (data: any) => void;
  defaultValues?: Record<string, any>;
}) {
  const schema = useMemo(() => zodSchemaFromLayout(layout), [layout]);
  
  const methods = useForm({
    resolver: zodResolver(schema),
    defaultValues,
  });
  
  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-12 gap-6">
          {layout.nodes.map((node) => {
            if (node.kind === "field" && node.field) {
              return (
                <div key={node.id} className={colSpanClasses[node.colSpan] || 'col-span-12'}>
                  {renderField(node.field)}
                </div>
              );
            }
            return null;
          })}
        </div>
        <div className="flex justify-end pt-6 border-t border-gray-100">
          <Button 
            type="submit" 
            className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-sm transition-all duration-200 hover:shadow-md focus:ring-4 focus:ring-blue-500/20"
          >
            Enviar Formulario
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}