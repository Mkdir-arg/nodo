import { z } from 'zod';

export const relationNodeConfigSchema = z.object({
  relation_type: z.string().min(1, 'El tipo de relación es requerido'),
  inverse_relation_type: z.string().min(1, 'El tipo de relación inversa es requerido'),
  target_plantilla_id: z.string().uuid('Debe ser un UUID válido'),
  title: z.string().min(1, 'El título es requerido'),
  description: z.string().optional(),
  allow_create: z.boolean().default(true),
  allow_remove: z.boolean().default(true),
  display_fields: z.array(z.string()).min(1, 'Debe tener al menos un campo de visualización'),
  search_fields: z.array(z.string()).min(1, 'Debe tener al menos un campo de búsqueda'),
});

export const relationNodeSchema = z.object({
  id: z.string(),
  type: z.literal('ui:relation'),
  kind: z.literal('ui'),
  config: relationNodeConfigSchema,
});
