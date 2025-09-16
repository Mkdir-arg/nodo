"use client";

import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { zodSchemaFromLayout } from "../zodSchemaFromLayout";
import { TextField } from "./fields/TextField";
import { NumberField } from "./fields/NumberField";
import { SelectField } from "./fields/SelectField";
import { CheckboxField } from "./fields/CheckboxField";
import { DateField } from "./fields/DateField";
import type { FormLayout, LayoutNode, FieldProps } from "../types";

function renderField(field: FieldProps) {
  switch (field.type) {
    case "text":
    case "textarea":
      return <TextField key={field.name} field={field} />;
    case "number":
      return <NumberField key={field.name} field={field} />;
    case "select":
      return <SelectField key={field.name} field={field} />;
    case "checkbox":
      return <CheckboxField key={field.name} field={field} />;
    case "date":
      return <DateField key={field.name} field={field} />;
    default:
      return null;
  }
}

export function DynamicFormRenderer({ 
  layout, 
  onSubmit, 
  defaultValues = {} 
}: {
  layout: FormLayout;
  onSubmit: (data: any) => void;
  defaultValues?: Record<string, any>;
}) {
  const schema = zodSchemaFromLayout(layout);
  
  const methods = useForm({
    resolver: zodResolver(schema),
    defaultValues,
  });
  
  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-12 gap-4">
          {layout.nodes.map((node) => {
            if (node.kind === "field" && node.field) {
              return (
                <div key={node.id} className={`col-span-${node.colSpan}`}>
                  {renderField(node.field)}
                </div>
              );
            }
            return null;
          })}
        </div>
        <Button type="submit">Enviar</Button>
      </form>
    </FormProvider>
  );
}