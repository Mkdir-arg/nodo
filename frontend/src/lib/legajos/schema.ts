import { z } from "zod";

export const conditionOp = z.enum(["equals","notEquals","gt","lt","exists","in"]);
export type ConditionOp = z.infer<typeof conditionOp>;

export const conditionSchema = z.object({
  key: z.string(),
  op: conditionOp,
  value: z.any().optional()
});
export type Condition = z.infer<typeof conditionSchema>;

export const fieldType = z.enum([
  "text","number","date","select","multiselect","boolean","textarea","file"
]);
export type FieldType = z.infer<typeof fieldType>;

export const optionSchema = z.object({ value: z.string(), label: z.string() });

export const fieldDefSchema = z.object({
  id: z.string(),
  key: z.string(),                // clave única dentro del template
  type: fieldType,
  label: z.string(),
  help: z.string().optional(),
  placeholder: z.string().optional(),
  required: z.boolean().optional(),
  defaultValue: z.any().optional(),
  options: z.array(optionSchema).optional(), // para select/multiselect
  ui: z.object({
    colSpan: z.number().min(1).max(12).optional(),
    readOnly: z.boolean().optional(),
    mask: z.string().optional(),
    prefix: z.string().optional(),
    suffix: z.string().optional()
  }).optional(),
  showWhen: z.array(conditionSchema).optional(),
  requiredWhen: z.array(conditionSchema).optional()
});
export type FieldDef = z.infer<typeof fieldDefSchema>;

export const layoutNodeSchema = z.lazy(() => z.object({
  type: z.enum(["row","col","section","tabs","tab","repeater","field"]),
  label: z.string().optional(),
  span: z.number().min(1).max(12).optional(),      // para col
  fieldKey: z.string().optional(),                  // para field
  children: z.array(layoutNodeSchema).optional(),
  repeater: z.object({
    columns: z.array(fieldDefSchema)
  }).optional()
}));
export type LayoutNode = z.infer<typeof layoutNodeSchema>;

export const templateSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  category: z.string().optional(), // ciudadano/comedor/centro/...
  version: z.string().default("0.1.0"),
  status: z.enum(["draft","published","archived"]).default("draft"),
  fields: z.array(fieldDefSchema),
  layout: z.array(layoutNodeSchema),
  rules: z.array(z.object({
    when: z.array(conditionSchema),
    enforce: z.array(z.object({ key: z.string(), required: z.boolean().optional() })).optional(),
    visibility: z.array(z.object({ target: z.string(), show: z.boolean() })).optional()
  })).optional()
});
export type Template = z.infer<typeof templateSchema>;

export const dossierSchema = z.object({
  id: z.string(),
  templateId: z.string(),
  templateVersion: z.string(),
  status: z.enum(["draft","active","closed"]).default("draft"),
  data: z.record(z.any())
});
export type Dossier = z.infer<typeof dossierSchema>;
