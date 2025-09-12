import { z } from 'zod';

export const FieldNodeSchema = z.object({
  id: z.string(),
  type: z.string(),
  key: z.string().optional(),
  label: z.string().optional(),
});

export const TemplateSchema = z.object({
  id: z.string().optional(),
  name: z.string(),
  version: z.number().optional(),
  nodes: z.array(FieldNodeSchema),
});

export type Template = z.infer<typeof TemplateSchema>;
