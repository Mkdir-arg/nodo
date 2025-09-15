// zodFromTemplate.ts — helper genérico para validar a partir de tu plantilla
import { z } from "zod";

type Node = {
  id?: string;
  key?: string;
  name?: string;
  path?: string;
  type?: string;            // "text" | "number" | "date" | "select" | "checkbox" | "file" | ...
  required?: boolean;
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  integer?: boolean;
  regex?: string;           // p.ej. "^[0-9]+$"
  format?: string;          // p.ej. "email"
  multiple?: boolean;       // selects múltiples
  options?: Array<{ value?: string; label?: string } | string>;
  children?: Node[];
  nodes?: Node[];
  fields?: Node[];
};

function flatten(raw: any): Node[] {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw as Node[];
  if (Array.isArray(raw.nodes)) return raw.nodes as Node[];
  if (Array.isArray(raw.fields)) return raw.fields as Node[];
  if (Array.isArray(raw.sections)) {
    return (raw.sections as any[])
      .flatMap((s) => s?.nodes || s?.fields || [])
      .filter(Boolean);
  }
  return [];
}

function isUiNode(n:any){ return n?.kind === "ui" || String(n?.type||"").startsWith("ui:"); }

function safeName(n: Node, idx: number, used: Set<string>) {
  let base =
    n.key ||
    n.name ||
    (n.path ? String(n.path).split(".").pop() : undefined) ||
    n.id ||
    `field_${idx}`;
  base = String(base);
  let name = base;
  let i = 1;
  while (used.has(name)) {
    name = `${base}_${i++}`;
  }
  used.add(name);
  return name;
}

function schemaForNode(n: Node): z.ZodTypeAny {
  const t = (n.type || "").toLowerCase();

  // TEXT
  if (t === "text" || t === "textarea" || t === "string" || t === "") {
    let s = z.string();
    if (n.minLength != null) s = s.min(n.minLength);
    if (n.maxLength != null) s = s.max(n.maxLength);
    if (n.format === "email") s = s.email();
    if (n.regex) {
      try {
        s = s.regex(new RegExp(n.regex));
      } catch {
        /* patrón inválido → ignorar */
      }
    }
    return n.required ? s : s.optional();
  }

  // NUMBER
  if (t === "number" || t === "int" || t === "float") {
    let s = z.coerce.number();
    if (n.integer) s = s.int();
    if (n.min != null) s = s.gte(n.min);
    if (n.max != null) s = s.lte(n.max);
    return n.required ? s : s.optional();
  }

  // DATE
  if (t === "date" || t === "datetime" || t === "datetime-local") {
    let s = z.coerce.date();
    return n.required ? s : s.optional();
  }

  // SELECT
  if (t === "select" || t === "radio" || t === "dropdown") {
    const values = (n.options || [])
      .map((o) => (typeof o === "string" ? o : o?.value))
      .filter((v): v is string => typeof v === "string");

    if (n.multiple) {
      let s = values.length ? z.array(z.enum(values as [string, ...string[]])) : z.array(z.string());
      return n.required ? s.min(1) : s.optional();
    } else {
      let s = values.length ? z.enum(values as [string, ...string[]]) : z.string();
      return n.required ? s : s.optional();
    }
  }

  // CHECKBOX
  if (t === "checkbox" || t === "switch" || t === "boolean") {
    let s: z.ZodTypeAny = z.boolean();
    // si es requerido, obligamos true (marca explícita)
    if (n.required) s = s.refine((v) => v === true, { message: "Debe estar marcado" });
    return n.required ? s : s.optional();
  }

  // FILE / cualquier otro
  return n.required ? z.any() : z.any().optional();
}

export function zodFromTemplate(rawNodes: any): z.ZodObject<any> {
  const nodes = flatten(rawNodes).filter((n:any)=> !isUiNode(n));
  const used = new Set<string>();
  const shape: Record<string, z.ZodTypeAny> = {};

  nodes.forEach((n: Node, idx: number) => {
    // Soporte de grupos: si trae children/nodes/fields, flatearlos como hermanos
    const children = flatten(n)
      .concat(n.children || [])
      .filter((c:any)=> !isUiNode(c));
    if (children.length) {
      children.forEach((c, i) => {
        const name = safeName(c, i, used);
        shape[name] = schemaForNode(c);
      });
    } else {
      const name = safeName(n, idx, used);
      shape[name] = schemaForNode(n);
    }
  });

  return z.object(shape);
}
