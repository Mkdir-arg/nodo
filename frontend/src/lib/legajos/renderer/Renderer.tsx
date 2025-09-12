"use client";
import { useMemo } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { Template, LayoutNode, FieldDef } from "../schema";
import { evalConditions } from "../conditions";
import { TextField, NumberField, TextArea, Checkbox, SelectField } from "./Controls";

function FieldControl({ field, values, form }:{ field: FieldDef, values: any, form: any }) {
  // visibilidad condicional
  const visible = evalConditions(field.showWhen, values);
  if (!visible) return null;

  switch (field.type) {
    case "text": return <TextField form={form} name={field.key} label={field.label} placeholder={field.placeholder} readOnly={field.ui?.readOnly} />;
    case "number": return <NumberField form={form} name={field.key} label={field.label} />;
    case "textarea": return <TextArea form={form} name={field.key} label={field.label} />;
    case "boolean": return <Checkbox form={form} name={field.key} label={field.label} />;
    case "select": return <SelectField form={form} name={field.key} label={field.label} options={field.options ?? []} />;
    default: return <div className="text-xs text-gray-400">Tipo no implementado: {field.type}</div>;
  }
}

function findField(fields: FieldDef[], key?: string) {
  return fields.find(f => f.key === key);
}

function Node({ node, template, form }:{ node: LayoutNode, template: Template, form:any }) {
  const values = form.getValues();

  if (node.type === "row") {
    return <div className="grid grid-cols-12 gap-4">{node.children?.map((ch,i)=><Node key={i} node={ch} template={template} form={form} />)}</div>;
  }
  if (node.type === "col") {
    const span = node.span ?? 12;
    return <div className={`col-span-${Math.min(Math.max(span,1),12)}`}>{node.children?.map((ch,i)=><Node key={i} node={ch} template={template} form={form} />)}</div>;
  }
  if (node.type === "section") {
    return (
      <div className="border border-gray-700 rounded-xl p-4 mb-4">
        {node.label && <h3 className="text-lg text-white font-semibold mb-3">{node.label}</h3>}
        {node.children?.map((ch,i)=><Node key={i} node={ch} template={template} form={form} />)}
      </div>
    );
  }
  if (node.type === "field") {
    const f = findField(template.fields, node.fieldKey);
    return f ? <FieldControl field={f} values={values} form={form} /> : null;
  }
  // tabs / repeater quedan para siguiente commit del MVP
  return null;
}

export default function DynamicForm({ template, defaultValues, onSubmit }:{
  template: Template, defaultValues?: any, onSubmit?: (values:any)=>void
}) {
  const form = useForm({ defaultValues: useMemo(()=>defaultValues ?? {}, [defaultValues]) });
  return (
    <FormProvider {...form}>
      <form className="space-y-2" onSubmit={form.handleSubmit(v => onSubmit?.(v))}>
        {template.layout.map((n,i)=><Node key={i} node={n} template={template} form={form} />)}
        <div className="pt-2">
          <button type="submit" className="rounded-xl px-4 py-2 bg-blue-600 text-white">Guardar</button>
        </div>
      </form>
    </FormProvider>
  );
}
