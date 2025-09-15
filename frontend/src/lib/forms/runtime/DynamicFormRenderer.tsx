"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import clsx from "clsx";
import { Fragment, useMemo, useState } from "react";
import { FormProvider, useForm, useFieldArray } from "react-hook-form";

import { Button } from "@/components/ui/button";
import type {
  FormLayout,
  LayoutChildNode,
  LayoutColumnNode,
  LayoutFieldNode,
  LayoutNode,
  LayoutRepeaterNode,
  LayoutRowNode,
  LayoutSectionNode,
  LayoutTabsNode,
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

function buildNameFromPath(path: string[], stack: string[]): string {
  if (!path.length) return "";
  const parts: string[] = [];
  let stackIndex = 0;
  path.forEach((segment) => {
    if (segment === "*") {
      const value = stack[stackIndex] ?? "0";
      parts.push(value);
      stackIndex += 1;
    } else {
      parts.push(segment);
    }
  });
  return parts.join(".");
}

function getValueAtPath(target: Record<string, unknown>, path: string[]): unknown {
  if (!path.length) return undefined;
  let current: unknown = target;
  for (const segment of path) {
    if (segment === "*") return undefined;
    if (!current || typeof current !== "object") return undefined;
    current = (current as Record<string, unknown>)[segment];
  }
  return current;
}

function setValueAtPath(target: Record<string, unknown>, path: string[], value: unknown) {
  if (!path.length) return;
  if (path.some((segment) => segment === "*")) return;
  let current: Record<string, unknown> = target;
  path.forEach((segment, index) => {
    if (index === path.length - 1) {
      if (current[segment] === undefined) {
        current[segment] = value;
      }
      return;
    }
    const existing = current[segment];
    if (!existing || typeof existing !== "object") {
      current[segment] = {};
    }
    current = current[segment] as Record<string, unknown>;
  });
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
    resolvedFields.forEach(({ field, path }) => {
      if (!path.length) return;
      if (path.some((segment) => segment === "*")) return;
      const existing = getValueAtPath(defaults, path);
      if (existing !== undefined) return;
      if (field && typeof field === "object" && "defaultValue" in field && (field as any).defaultValue !== undefined) {
        setValueAtPath(defaults, path, (field as any).defaultValue);
        return;
      }
      const type = typeof field?.type === "string" ? field.type.toLowerCase() : "";
      if (type === "multiselect") {
        setValueAtPath(defaults, path, []);
        return;
      }
      if (["checkbox", "switch", "boolean"].includes(type)) {
        setValueAtPath(defaults, path, false);
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

  const renderField = (
    node: LayoutFieldNode,
    withinColumn = false,
    repeaterStack: string[] = [],
  ) => {
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

    const fieldName = buildNameFromPath(resolved.path, repeaterStack);

    return (
      <div key={resolved.node.id} className={wrapperClass}>
        {component({ field: resolved.field, name: fieldName, layout: resolved.node })}
      </div>
    );
  };

  function TabsNodeRenderer({
    node,
    repeaterStack,
  }: {
    node: LayoutTabsNode;
    repeaterStack: string[];
  }) {
    const tabs = asArray(node.tabs);
    const childrenMap = (node.tabsChildren ?? {}) as Record<string, LayoutChildNode[] | LayoutChildNode | undefined>;
    const fallbackTabId =
      tabs.find((tab) => typeof tab?.id === "string" && tab.id)?.id ?? Object.keys(childrenMap)[0] ?? "";
    const [activeTab, setActiveTab] = useState(fallbackTabId);

    const effectiveTabId =
      activeTab && (childrenMap[activeTab] !== undefined || tabs.some((tab) => tab?.id === activeTab))
        ? activeTab
        : fallbackTabId;

    const renderTabChildren = (tabId: string) => {
      const children = asArray(childrenMap[tabId] as LayoutChildNode[]);
      if (children.length === 0) {
        return (
          <div className="rounded-lg border border-dashed border-slate-300/80 p-4 text-xs text-slate-500 dark:border-slate-600/70 dark:text-slate-400">
            Esta pestaña no tiene campos.
          </div>
        );
      }
      return children.map((child, index) => (
        <Fragment key={(child as any)?.id ?? `${node.id}-${tabId}-${index}`}>
          {renderChild(child, false, repeaterStack)}
        </Fragment>
      ));
    };

    return (
      <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900/40">
        {(node.title || node.description) && (
          <header className="space-y-1">
            {node.title ? (
              <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100">{node.title}</h3>
            ) : null}
            {node.description ? (
              <p className="text-sm text-slate-500 dark:text-slate-400">{node.description}</p>
            ) : null}
          </header>
        )}
        <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-2 dark:border-slate-700">
          {tabs.map((tab) => {
            const tabId = typeof tab?.id === "string" ? tab.id : "";
            if (!tabId) return null;
            const isActive = tabId === effectiveTabId;
            return (
              <button
                type="button"
                key={tabId}
                onClick={() => setActiveTab(tabId)}
                className={clsx(
                  "rounded-md px-3 py-1 text-xs font-medium transition",
                  isActive
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                )}
              >
                {tab?.title || "Pestaña"}
              </button>
            );
          })}
        </div>
        <div className="space-y-4 pt-4">
          {effectiveTabId ? renderTabChildren(effectiveTabId) : null}
        </div>
      </section>
    );
  }

  function RepeaterNodeRenderer({
    node,
    repeaterStack,
  }: {
    node: LayoutRepeaterNode;
    repeaterStack: string[];
  }) {
    const name =
      (typeof node.fieldKey === "string" && node.fieldKey) ||
      (typeof (node as any).key === "string" && (node as any).key) ||
      (typeof (node as any).name === "string" && (node as any).name) ||
      node.id;
    const minItems = typeof node.minItems === "number" ? node.minItems : 0;
    const maxItems = typeof node.maxItems === "number" ? node.maxItems : undefined;

    const { fields: items, append, remove } = useFieldArray({
      control: methods.control,
      name,
    });

    const handleAdd = () => {
      if (typeof maxItems === "number" && items.length >= maxItems) return;
      append({});
    };

    const allowRemove = items.length > minItems;

    return (
      <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900/40">
        {(node.title || node.description) && (
          <header className="space-y-1">
            {node.title ? (
              <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100">{node.title}</h3>
            ) : null}
            {node.description ? (
              <p className="text-sm text-slate-500 dark:text-slate-400">{node.description}</p>
            ) : null}
          </header>
        )}
        <div className="space-y-4">
          {items.length === 0 ? (
            <div className="rounded-lg border border-dashed border-slate-300/80 p-4 text-xs text-slate-500 dark:border-slate-600/70 dark:text-slate-400">
              Todavía no agregaste elementos.
            </div>
          ) : (
            items.map((item, index) => (
              <div
                key={item.id ?? `${name}-${index}`}
                className="space-y-4 rounded-lg border border-slate-200 bg-slate-50/60 p-4 dark:border-slate-700 dark:bg-slate-900/60"
              >
                {asArray(node.children).map((row, rowIndex) => (
                  <Fragment key={(row as any)?.id ?? `${node.id}-row-${index}-${rowIndex}`}>
                    {renderRow(row, [...repeaterStack, String(index)])}
                  </Fragment>
                ))}
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    disabled={!allowRemove}
                    className="rounded-md border border-red-300 px-3 py-1 text-xs text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-red-500/70 dark:text-red-200 dark:hover:bg-red-900/40"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={handleAdd}
            disabled={typeof maxItems === "number" && items.length >= maxItems}
            className="rounded-md border border-slate-300 px-3 py-1 text-xs text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            Agregar ítem
          </button>
        </div>
      </section>
    );
  }

  const renderChild = (
    child: LayoutChildNode,
    withinColumn = false,
    repeaterStack: string[] = [],
  ): JSX.Element | null => {
    if (!child) return null;
    if ((child as LayoutSectionNode).type === "section") {
      return renderSection(child as LayoutSectionNode, repeaterStack);
    }
    if ((child as LayoutRowNode).type === "row") {
      return renderRow(child as LayoutRowNode, repeaterStack);
    }
    if ((child as LayoutTabsNode).type === "tabs") {
      return (
        <TabsNodeRenderer
          key={(child as LayoutTabsNode).id}
          node={child as LayoutTabsNode}
          repeaterStack={repeaterStack}
        />
      );
    }
    if ((child as LayoutRepeaterNode).type === "repeater") {
      return (
        <RepeaterNodeRenderer
          key={(child as LayoutRepeaterNode).id}
          node={child as LayoutRepeaterNode}
          repeaterStack={repeaterStack}
        />
      );
    }
    if ((child as LayoutFieldNode).type === "field") {
      return renderField(child as LayoutFieldNode, withinColumn, repeaterStack);
    }
    return null;
  };

  const renderColumn = (
    column: LayoutColumnNode,
    index = 0,
    repeaterStack: string[] = [],
  ): JSX.Element => {
    const spanClass = colSpanClass(column.span);
    const key = column.id ?? `column-${index}`;
    return (
      <div key={key} className={clsx(spanClass, "space-y-4")}>
        {asArray(column.children).map((child, childIndex) => (
          <Fragment key={(child as any)?.id ?? `${key}-child-${childIndex}`}>
            {renderChild(child, true, repeaterStack)}
          </Fragment>
        ))}
      </div>
    );
  };

  const renderRow = (row: LayoutRowNode, repeaterStack: string[] = []): JSX.Element => {
    const columns = asArray(row.columns);
    const gutter = typeof row.gutter === "number" ? row.gutter : 16;
    return (
      <div
        key={row.id}
        className="grid grid-cols-12"
        style={{ columnGap: `${gutter}px`, rowGap: `${gutter}px` }}
      >
        {columns.length > 0
          ? columns.map((column, columnIndex) => renderColumn(column, columnIndex, repeaterStack))
          : asArray((row as any).children).map((child, index) => (
              <Fragment key={(child as any)?.id ?? `${row.id}-field-${index}`}>
                {renderField(child as LayoutFieldNode, false, repeaterStack)}
              </Fragment>
            ))}
      </div>
    );
  };

  const renderSection = (
    section: LayoutSectionNode,
    repeaterStack: string[] = [],
  ): JSX.Element => {
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
          {rows.map((row) => renderRow(row, repeaterStack))}
        </div>
      </section>
    );
  };

  const renderNode = (node: LayoutNode, repeaterStack: string[] = []): JSX.Element | null => {
    if (!node) return null;
    switch (node.type) {
      case "section":
        return renderSection(node as LayoutSectionNode, repeaterStack);
      case "row":
        return renderRow(node as LayoutRowNode, repeaterStack);
      case "column":
        return renderColumn(node as LayoutColumnNode, 0, repeaterStack);
      case "field":
        return renderField(node as LayoutFieldNode, false, repeaterStack);
      case "tabs":
        return (
          <TabsNodeRenderer
            key={node.id}
            node={node as LayoutTabsNode}
            repeaterStack={repeaterStack}
          />
        );
      case "repeater":
        return (
          <RepeaterNodeRenderer
            key={node.id}
            node={node as LayoutRepeaterNode}
            repeaterStack={repeaterStack}
          />
        );
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
            {renderNode(node as LayoutNode, [])}
          </Fragment>
        ))}

        <div className="pt-2">
          <Button type="submit">{submitLabel}</Button>
        </div>
      </form>
    </FormProvider>
  );
}
