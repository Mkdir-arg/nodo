import { z } from "zod";

import type {
  FieldProps,
  FormLayout,
  LayoutChildNode,
  LayoutColumnNode,
  LayoutFieldNode,
  LayoutNode,
  LayoutRowNode,
  LayoutSectionNode,
  SelectOption,
} from "@/lib/forms/types";

type FieldLike =
  | (FieldProps & { type?: string; [key: string]: any })
  | ({
      id?: string;
      key?: string;
      type?: string;
      label?: string;
      required?: boolean;
      description?: string | null;
      helpText?: string | null;
      placeholder?: string | null;
      defaultValue?: unknown;
      options?: SelectOption[];
      min?: number;
      max?: number;
      minLength?: number;
      maxLength?: number;
      pattern?: string;
      minDate?: string;
      maxDate?: string;
      maxSelections?: number;
      accept?: string[] | string;
      [key: string]: any;
    } & Record<string, unknown>);

type FieldCollection = FieldLike[] | Record<string, FieldLike> | undefined;

type Lookup = {
  byId: Map<string, FieldLike>;
  byKey: Map<string, FieldLike>;
};

export interface CollectOptions {
  fields?: FieldCollection;
}

export interface ResolvedLayoutField {
  field: FieldLike;
  node: LayoutFieldNode;
  name: string;
}

const EMPTY_LAYOUT: FormLayout = { version: 1, nodes: [] };

function addCandidate(lookup: Lookup, candidate: unknown) {
  if (!candidate || typeof candidate !== "object") return;
  const maybeField = candidate as FieldLike;
  const type = typeof maybeField.type === "string" ? maybeField.type : undefined;
  if (!type) return;
  const id = typeof maybeField.id === "string" ? maybeField.id : undefined;
  const key = typeof maybeField.key === "string" ? maybeField.key : undefined;
  if (id) lookup.byId.set(id, maybeField);
  if (key) lookup.byKey.set(key, maybeField);
}

function scanForFields(value: unknown, lookup: Lookup) {
  if (!value || typeof value !== "object") return;
  const node = value as Record<string, unknown>;
  if (node.type && typeof node.type === "string" && node.type !== "section" && node.type !== "row" && node.type !== "column") {
    addCandidate(lookup, node);
  }
  if ("field" in node) addCandidate(lookup, node.field);
  if ("fieldProps" in node) addCandidate(lookup, node.fieldProps);
  if ("data" in node) addCandidate(lookup, node.data);
  if ("fields" in node && Array.isArray(node.fields)) node.fields.forEach((child) => scanForFields(child, lookup));
  if (Array.isArray((node as any).children)) (node as any).children.forEach((child: unknown) => scanForFields(child, lookup));
  if (Array.isArray((node as any).columns)) (node as any).columns.forEach((child: unknown) => scanForFields(child, lookup));
  if (Array.isArray((node as any).nodes)) (node as any).nodes.forEach((child: unknown) => scanForFields(child, lookup));
}

function buildLookup(layout: FormLayout, extra?: FieldCollection): Lookup {
  const lookup: Lookup = { byId: new Map(), byKey: new Map() };

  if (Array.isArray(layout.nodes)) {
    layout.nodes.forEach((node) => scanForFields(node, lookup));
  }

  if (extra) {
    if (Array.isArray(extra)) {
      extra.forEach((field) => addCandidate(lookup, field));
    } else {
      Object.values(extra).forEach((field) => addCandidate(lookup, field));
    }
  }

  const layoutAny = layout as any;
  if (Array.isArray(layoutAny.fields)) layoutAny.fields.forEach((field: unknown) => addCandidate(lookup, field));
  if (layoutAny.fields && typeof layoutAny.fields === "object" && !Array.isArray(layoutAny.fields)) {
    Object.values(layoutAny.fields).forEach((field: unknown) => addCandidate(lookup, field));
  }

  return lookup;
}

function resolveFieldFromLookup(node: LayoutFieldNode, lookup: Lookup): FieldLike | null {
  const anyNode = node as unknown as Record<string, unknown>;
  if (anyNode.field) {
    const candidate = anyNode.field as FieldLike;
    if (candidate && typeof candidate.type === "string") return candidate;
  }
  if (anyNode.fieldProps) {
    const candidate = anyNode.fieldProps as FieldLike;
    if (candidate && typeof candidate.type === "string") return candidate;
  }
  if (anyNode.data) {
    const candidate = anyNode.data as FieldLike;
    if (candidate && typeof candidate.type === "string") return candidate;
  }
  if (anyNode.kind === "field" && typeof anyNode.type === "string" && anyNode.type !== "field") {
    return anyNode as unknown as FieldLike;
  }

  const idsToCheck = [node.fieldId, (anyNode.field as any)?.id, anyNode.id].filter(
    (id): id is string => typeof id === "string"
  );
  for (const id of idsToCheck) {
    const match = lookup.byId.get(id);
    if (match) return match;
  }

  const keysToCheck = [node.fieldKey, anyNode.key, (anyNode.field as any)?.key].filter(
    (key): key is string => typeof key === "string"
  );
  for (const key of keysToCheck) {
    const match = lookup.byKey.get(key);
    if (match) return match;
  }

  return null;
}

function isLayoutFieldNode(node: LayoutNode | LayoutChildNode): node is LayoutFieldNode {
  return node && typeof node === "object" && (node as any).type === "field";
}

function ensureArray<T>(value: T | T[] | undefined | null): T[] {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

function traverseChildren(
  node: LayoutNode | LayoutChildNode,
  lookup: Lookup,
  acc: ResolvedLayoutField[],
  usedNames: Set<string>,
  fallbackIndex: { current: number }
) {
  if (!node || typeof node !== "object") return;

  if ((node as LayoutSectionNode).type === "section") {
    const section = node as LayoutSectionNode;
    ensureArray(section.children).forEach((child) => traverseChildren(child, lookup, acc, usedNames, fallbackIndex));
    return;
  }

  if ((node as LayoutRowNode).type === "row") {
    const row = node as LayoutRowNode;
    ensureArray(row.columns).forEach((column) => traverseChildren(column, lookup, acc, usedNames, fallbackIndex));
    return;
  }

  if ((node as LayoutColumnNode).type === "column") {
    const column = node as LayoutColumnNode;
    ensureArray(column.children).forEach((child) => traverseChildren(child, lookup, acc, usedNames, fallbackIndex));
    return;
  }

  if (isLayoutFieldNode(node)) {
    const fieldNode = node as LayoutFieldNode;
    const field = resolveFieldFromLookup(fieldNode, lookup);
    if (!field || typeof field.type !== "string") {
      fallbackIndex.current += 1;
      return;
    }
    const baseName =
      (typeof field.key === "string" && field.key) ||
      (typeof fieldNode.fieldKey === "string" && fieldNode.fieldKey) ||
      (typeof (field as any).name === "string" && (field as any).name) ||
      (typeof fieldNode.fieldId === "string" && fieldNode.fieldId) ||
      fieldNode.id ||
      `field_${fallbackIndex.current + 1}`;
    fallbackIndex.current += 1;

    const safeBase = String(baseName).trim() || `field_${fallbackIndex.current}`;
    let candidate = safeBase;
    let suffix = 1;
    while (usedNames.has(candidate)) {
      candidate = `${safeBase}_${suffix++}`;
    }
    usedNames.add(candidate);

    acc.push({ field, node: fieldNode, name: candidate });
    return;
  }

  const anyNode = node as unknown as Record<string, unknown>;
  if (Array.isArray(anyNode.children)) anyNode.children.forEach((child) => traverseChildren(child as any, lookup, acc, usedNames, fallbackIndex));
  if (Array.isArray(anyNode.columns)) anyNode.columns.forEach((child) => traverseChildren(child as any, lookup, acc, usedNames, fallbackIndex));
  if (Array.isArray(anyNode.nodes)) anyNode.nodes.forEach((child) => traverseChildren(child as any, lookup, acc, usedNames, fallbackIndex));
}

export function collectLayoutFields(layout?: FormLayout | null, options?: CollectOptions): ResolvedLayoutField[] {
  const normalized = layout ?? EMPTY_LAYOUT;
  const lookup = buildLookup(normalized, options?.fields);
  const resolved: ResolvedLayoutField[] = [];
  const usedNames = new Set<string>();
  const fallbackIndex = { current: 0 };

  ensureArray(normalized.nodes).forEach((node) => traverseChildren(node as LayoutNode, lookup, resolved, usedNames, fallbackIndex));

  return resolved;
}

function preprocessNumber(value: unknown) {
  if (value === "" || value === null || value === undefined) return undefined;
  if (typeof value === "number") return Number.isFinite(value) ? value : undefined;
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : value;
  }
  return value;
}

function getOptions(field: FieldLike): string[] {
  if (!field || typeof field !== "object") return [];
  const raw = (field as any).options as SelectOption[] | undefined;
  if (!Array.isArray(raw)) return [];
  return raw
    .map((opt) => {
      if (!opt) return undefined;
      if (typeof opt === "string") return opt;
      if (typeof opt.value === "string") return opt.value;
      return undefined;
    })
    .filter((value): value is string => typeof value === "string");
}

function schemaForField(field: FieldLike): z.ZodTypeAny | null {
  const type = typeof field.type === "string" ? field.type.toLowerCase() : "";
  const required = !!field.required;

  if (["text", "textarea", "string", "phone", "cuit_razon_social"].includes(type)) {
    let schema = z.string({
      required_error: "Campo obligatorio",
      invalid_type_error: "Debe ser texto",
    });
    const minLength = typeof (field as any).minLength === "number" ? (field as any).minLength : undefined;
    const maxLength = typeof (field as any).maxLength === "number" ? (field as any).maxLength : undefined;
    if (typeof minLength === "number") schema = schema.min(minLength);
    if (typeof maxLength === "number") schema = schema.max(maxLength);
    if (field.pattern) {
      try {
        schema = schema.regex(new RegExp(field.pattern));
      } catch {
        /* ignore invalid pattern */
      }
    }
    return required ? schema.min(1, { message: "Campo obligatorio" }) : schema.optional();
  }

  if (["number", "int", "float", "decimal", "sum"].includes(type)) {
    let numberSchema = z.number({
      required_error: "Campo obligatorio",
      invalid_type_error: "Debe ser un número",
    });

    if (typeof field.min === "number") {
      numberSchema = numberSchema.min(field.min, { message: `Debe ser ≥ ${field.min}` });
    }
    if (typeof field.max === "number") {
      numberSchema = numberSchema.max(field.max, { message: `Debe ser ≤ ${field.max}` });
    }

    const processed = z.preprocess(preprocessNumber, numberSchema);
    return required ? processed : processed.optional();
  }

  if (type === "date" || type === "datetime" || type === "datetime-local") {
    const parseDate = (value: unknown) => {
      if (value === "" || value === null || value === undefined) return undefined;
      if (value instanceof Date) return value;
      if (typeof value === "string") {
        const parsed = new Date(value);
        return Number.isNaN(parsed.getTime()) ? value : parsed;
      }
      return value;
    };
    const minDate = field.minDate ? new Date(field.minDate) : undefined;
    const maxDate = field.maxDate ? new Date(field.maxDate) : undefined;

    if (required) {
      let schema: z.ZodTypeAny = z.preprocess(
        parseDate,
        z.date({ required_error: "Campo obligatorio", invalid_type_error: "Fecha inválida" })
      );
      if (minDate && !Number.isNaN(minDate.getTime())) {
        schema = schema.refine((value) => value >= minDate, {
          message: `Debe ser posterior a ${minDate.toISOString().slice(0, 10)}`,
        });
      }
      if (maxDate && !Number.isNaN(maxDate.getTime())) {
        schema = schema.refine((value) => value <= maxDate, {
          message: `Debe ser anterior a ${maxDate.toISOString().slice(0, 10)}`,
        });
      }
      return schema;
    }
    let schema: z.ZodTypeAny = z
      .preprocess(parseDate, z.date({ invalid_type_error: "Fecha inválida" }))
      .optional();
    if (minDate && !Number.isNaN(minDate.getTime())) {
      schema = schema.refine((value) => value === undefined || value >= minDate, {
        message: `Debe ser posterior a ${minDate.toISOString().slice(0, 10)}`,
      });
    }
    if (maxDate && !Number.isNaN(maxDate.getTime())) {
      schema = schema.refine((value) => value === undefined || value <= maxDate, {
        message: `Debe ser anterior a ${maxDate.toISOString().slice(0, 10)}`,
      });
    }
    return schema;
  }

  if (["select", "dropdown", "select_with_filter", "radio"].includes(type)) {
    const values = getOptions(field);
    if (values.length >= 1) {
      const enumSchema = z.enum(values as [string, ...string[]], {
        required_error: "Campo obligatorio",
      });
      return required ? enumSchema : enumSchema.optional();
    }
    let schema = z.string({ required_error: "Campo obligatorio" });
    return required ? schema.min(1, { message: "Campo obligatorio" }) : schema.optional();
  }

  if (type === "multiselect") {
    let schema = z.array(z.string());
    if (required) schema = schema.min(1, { message: "Seleccione al menos una opción" });
    if (typeof field.maxSelections === "number") {
      schema = schema.max(field.maxSelections, {
        message: `Puede seleccionar hasta ${field.maxSelections}`,
      });
    }
    return required ? schema : schema.optional();
  }

  if (["checkbox", "switch", "boolean"].includes(type)) {
    let schema = z.boolean();
    if (required) {
      return schema.refine((value) => value === true, { message: "Debe estar marcado" });
    }
    return schema.optional();
  }

  if (type === "file" || type === "document") {
    let schema: z.ZodTypeAny = z.any();
    if (required) {
      schema = schema.refine((value) => value != null, { message: "Archivo requerido" });
    } else {
      schema = schema.optional();
    }
    return schema;
  }

  if (type === "info" || type === "group") {
    return null;
  }

  const fallback = z.any();
  return required ? fallback : fallback.optional();
}

export function zodSchemaFromLayout(layout?: FormLayout | null, options?: CollectOptions) {
  const fields = collectLayoutFields(layout ?? EMPTY_LAYOUT, options);
  const shape: Record<string, z.ZodTypeAny> = {};

  fields.forEach(({ field, name }) => {
    const schema = schemaForField(field);
    if (schema) {
      shape[name] = schema;
    }
  });

  return z.object(shape);
}
