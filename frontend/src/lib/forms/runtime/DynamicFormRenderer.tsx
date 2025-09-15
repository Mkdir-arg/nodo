"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import clsx from "clsx";
import { Fragment, useMemo } from "react";
import { FormProvider, useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import type {
  FormLayout,
  LayoutChildNode,
  LayoutColumnNode,
  LayoutFieldNode,
  LayoutNode,
  LayoutRowNode,
  LayoutSectionNode,
} from "@/lib/forms/types";
import {
  collectLayoutFields,
  type CollectOptions,
  type ResolvedLayoutField,
  zodSchemaFromLayout,
} from "@/lib/forms/zodSchemaFromLayout";

import CheckboxField from "./fields/CheckboxField";
import DateField from "./fields/DateField";
import FileField from "./fields/FileField";
import MultiSelectField from "./fields/MultiSelectField";
import NumberField from "./fields/NumberField";
import RadioField from "./fields/RadioField";
import SelectField from "./fields/SelectField";
import SwitchField from "./fields/SwitchField";
import TextField from "./fields/TextField";
import TextareaField from "./fields/TextareaField";

type FieldCollection = CollectOptions["fields"];

type RuntimeFieldComponent = ({
  field,
  name,
}: {
  field: any;
  name: string;
  layout: LayoutFieldNode;
}) => JSX.Element | null;

const FIELD_COMPONENTS: Record<string, RuntimeFieldComponent> = {
  text: ({ field, name }) => <TextField field={field} name={name} />,
  string: ({ field, name }) => <TextField field={field} name={name} />,
  phone: ({ field, name }) => <TextField field={field} name={name} />,
  cuit_razon_social: ({ field, name }) => <TextField field={field} name={name} />,
  textarea: ({ field, name }) => <TextareaField field={field} name={name} />,
  number: ({ field, name }) => <NumberField field={field} name={name} />,
  int: ({ field, name }) => <NumberField field={field} name={name} />,
  float: ({ field, name }) => <NumberField field={field} name={name} />,
  decimal: ({ field, name }) => <NumberField field={field} name={name} />,
  sum: ({ field, name }) => <NumberField field={field} name={name} />,
  select: ({ field, name }) => <SelectField field={field} name={name} />,
  dropdown: ({ field, name }) => <SelectField field={field} name={name} />,
  select_with_filter: ({ field, name }) => <SelectField field={field} name={name} />,
  multiselect: ({ field, name }) => <MultiSelectField field={field} name={name} />,
  date: ({ field, name }) => <DateField field={field} name={name} />,
  datetime: ({ field, name }) => <DateField field={field} name={name} />,
  "datetime-local": ({ field, name }) => <DateField field={field} name={name} />,
  radio: ({ field, name }) => <RadioField field={field} name={name} />,
  checkbox: ({ field, name }) => <CheckboxField field={field} name={name} />,
  boolean: ({ field, name }) => <CheckboxField field={field} name={name} />,
  switch: ({ field, name }) => <SwitchField field={field} name={name} />,
  file: ({ field, name }) => <FileField field={field} name={name} />,
  document: ({ field, name }) => <FileField field={field} name={name} />,
};

const COL_SPAN_CLASS: Record<number, string> = {
  1: "col-span-1",
  2: "col-span-2",
  3: "col-span-3",
  4: "col-span-4",
  5: "col-span-5",
  6: "col-span-6",
  7: "col-span-7",
  8: "col-span-8",
  9: "col-span-9",
  10: "col-span-10",
  11: "col-span-11",
  12: "col-span-12",
};

function asArray<T>(value: T | T[] | undefined | null): T[] {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

function colSpanClass(span?: number) {
  if (typeof span !== "number") return COL_SPAN_CLASS[12];
  const normalized = Math.min(12, Math.max(1, Math.round(span)));
  return COL_SPAN_CLASS[normalized] ?? COL_SPAN_CLASS[12];
}

function getFieldComponent(field: any): RuntimeFieldComponent | undefined {
  const type = typeof field?.type === "string" ? field.type.toLowerCase() : "";
  return FIELD_COMPONENTS[type];
}

type ResolvedMap = Map<string, ResolvedLayoutField>;

function buildResolvedMap(fields: ResolvedLayoutField[]): ResolvedMap {
  const map: ResolvedMap = new Map();
  fields.forEach((resolved) => {
    const keys = [
      resolved.node.id,
      resolved.node.fieldId,
      resolved.node.fieldKey,
      (resolved.field as any)?.id,
      (resolved.field as any)?.key,
    ].filter((key): key is string => typeof key === "string" && key.length > 0);
    keys.push(resolved.name);
    keys.forEach((key) => {
      if (!map.has(key)) {
        map.set(key, resolved);
      }
    });
  });
  return map;
}

export interface DynamicFormRendererProps {
  layout?: FormLayout | null;
  fields?: FieldCollection;
  initialValues?: Record<string, unknown>;
  onSubmit?: (values: Record<string, unknown>) => void;
  submitLabel?: string;
  className?: string;
}

export default function DynamicFormRenderer({
  layout,
  fields,
  initialValues,
  onSubmit,
  submitLabel = "Guardar",
  className,
}: DynamicFormRendererProps) {
  const resolvedFields = useMemo(() => collectLayoutFields(layout, { fields }), [layout, fields]);

  const resolvedMap = useMemo(() => buildResolvedMap(resolvedFields), [resolvedFields]);

  const schema = useMemo(() => zodSchemaFromLayout(layout, { fields }), [layout, fields]);

  const defaultValues = useMemo(() => {
    const defaults: Record<string, unknown> = { ...(initialValues ?? {}) };
    resolvedFields.forEach(({ field, name }) => {
      if (defaults[name] !== undefined) return;
      if (field && typeof field === "object" && "defaultValue" in field && (field as any).defaultValue !== undefined) {
        defaults[name] = (field as any).defaultValue;
        return;
      }
      const type = typeof field?.type === "string" ? field.type.toLowerCase() : "";
      if (type === "multiselect" && defaults[name] === undefined) defaults[name] = [];
      if (["checkbox", "switch", "boolean"].includes(type) && defaults[name] === undefined) {
        defaults[name] = false;
      }
    });
    return defaults;
  }, [resolvedFields, initialValues]);

  const methods = useForm({
    resolver: zodResolver(schema),
    defaultValues,
    mode: "onBlur",
  });

  const submitHandler = onSubmit ?? ((values: Record<string, unknown>) => console.log("Form submit", values));

  const renderField = (node: LayoutFieldNode, withinColumn = false) => {
    const lookupKeys = [node.id, node.fieldId, node.fieldKey].filter(
      (key): key is string => typeof key === "string" && key.length > 0
    );
    let resolved: ResolvedLayoutField | undefined;
    for (const key of lookupKeys) {
      resolved = resolvedMap.get(key);
      if (resolved) break;
    }
    if (!resolved) {
      resolved = resolvedMap.get(node.id);
    }
    if (!resolved) {
      const missingClass = withinColumn ? "" : colSpanClass(node.colSpan);
      return (
        <div
          key={node.id}
          className={clsx(
            missingClass,
            "rounded-lg border border-dashed border-red-300 bg-red-50/50 p-3 text-sm text-red-600 dark:border-red-500/60 dark:bg-red-500/10"
          )}
        >
          Campo no disponible
        </div>
      );
    }

    const component = getFieldComponent(resolved.field);
    const wrapperClass = withinColumn ? undefined : colSpanClass(resolved.node.colSpan);

    if (!component) {
      return (
        <div
          key={resolved.node.id}
          className={clsx(
            wrapperClass,
            "rounded-lg border border-dashed border-amber-300 bg-amber-50/60 p-3 text-sm text-amber-700 dark:border-amber-500/70 dark:bg-amber-500/10"
          )}
        >
          Tipo de campo "{resolved.field?.type ?? "desconocido"}" sin soporte
        </div>
      );
    }

    return (
      <div key={resolved.node.id} className={wrapperClass}>
        {component({ field: resolved.field, name: resolved.name, layout: resolved.node })}
      </div>
    );
  };

  const renderChild = (child: LayoutChildNode, withinColumn = false): JSX.Element | null => {
    if (!child) return null;
    if ((child as LayoutSectionNode).type === "section") {
      return renderSection(child as LayoutSectionNode);
    }
    if ((child as LayoutRowNode).type === "row") {
      return renderRow(child as LayoutRowNode);
    }
    if ((child as LayoutFieldNode).type === "field") {
      return renderField(child as LayoutFieldNode, withinColumn);
    }
    return null;
  };

  const renderColumn = (column: LayoutColumnNode, index = 0): JSX.Element => {
    const spanClass = colSpanClass(column.span);
    const key = column.id ?? `column-${index}`;
    return (
      <div key={key} className={clsx(spanClass, "space-y-4")}> 
        {asArray(column.children).map((child, childIndex) => (
          <Fragment key={(child as any)?.id ?? `${key}-child-${childIndex}`}>
            {renderChild(child, true)}
          </Fragment>
        ))}
      </div>
    );
  };

  const renderRow = (row: LayoutRowNode): JSX.Element => {
    const columns = asArray(row.columns);
    const gutter = typeof row.gutter === "number" ? row.gutter : 16;
    return (
      <div
        key={row.id}
        className="grid grid-cols-12"
        style={{ columnGap: `${gutter}px`, rowGap: `${gutter}px` }}
      >
        {columns.length > 0
          ? columns.map((column, columnIndex) => renderColumn(column, columnIndex))
          : asArray((row as any).children).map((child, index) => (
              <Fragment key={(child as any)?.id ?? `${row.id}-field-${index}`}>
                {renderField(child as LayoutFieldNode)}
              </Fragment>
            ))}
      </div>
    );
  };

  const renderSection = (section: LayoutSectionNode): JSX.Element => {
    const rows = asArray(section.children);
    return (
      <section
        key={section.id}
        className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900/40"
      >
        {(section.title || section.description) && (
          <header className="space-y-1">
            {section.title ? (
              <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">{section.title}</h2>
            ) : null}
            {section.description ? (
              <p className="text-sm text-slate-500 dark:text-slate-400">{section.description}</p>
            ) : null}
          </header>
        )}
        <div className="space-y-4">
          {rows.map((row) => renderRow(row))}
        </div>
      </section>
    );
  };

  const renderNode = (node: LayoutNode): JSX.Element | null => {
    if (!node) return null;
    switch (node.type) {
      case "section":
        return renderSection(node as LayoutSectionNode);
      case "row":
        return renderRow(node as LayoutRowNode);
      case "column":
        return renderColumn(node as LayoutColumnNode);
      case "field":
        return renderField(node as LayoutFieldNode);
      default:
        return null;
    }
  };

  if (!layout || !asArray(layout.nodes).length) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-white/70 p-6 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-300">
        No hay campos configurados en este formulario.
      </div>
    );
  }

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={methods.handleSubmit(submitHandler)}
        className={clsx("space-y-6", className)}
        noValidate
      >
        {asArray(layout.nodes).map((node, index) => (
          <Fragment key={(node as any)?.id ?? `node-${index}`}>
            {renderNode(node as LayoutNode)}
          </Fragment>
        ))}

        <div className="pt-2">
          <Button type="submit">{submitLabel}</Button>
        </div>
      </form>
    </FormProvider>
  );
}
