import { z } from 'zod';

export const HeaderBackgroundSchema = z.object({
  mode: z.literal('image'),
  imageUrl: z.string().url('URL de imagen inválida'),
  overlay: z.object({
    enabled: z.boolean(),
    opacity: z.number().min(0).max(1),
    blur: z.number().min(0).optional()
  })
});

export const HeaderTopbarSchema = z.object({
  enabled: z.boolean(),
  position: z.literal('top-right'),
  actions: z.array(z.enum(['theme', 'notifications', 'profile', 'logout'])),
  logoutLabel: z.string().min(1)
});

export const HeaderActionSchema = z.object({
  id: z.string().min(1),
  icon: z.string().min(1),
  type: z.enum(['navigate', 'command']),
  to: z.string().optional(),
  name: z.enum(['print']).optional(),
  label: z.string().optional()
}).refine(
  (data) => {
    if (data.type === 'navigate') return !!data.to;
    if (data.type === 'command') return !!data.name;
    return true;
  },
  {
    message: 'Navigate actions require "to", command actions require "name"'
  }
);

export const HeaderCardSchema = z.object({
  enabled: z.boolean(),
  glass: z.object({
    blur: z.number().min(0).max(50),
    opacity: z.number().min(0).max(1)
  }),
  leftIcon: z.object({
    enabled: z.boolean(),
    icon: z.string().min(1),
    gradient: z.object({
      from: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Color hex inválido'),
      to: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Color hex inválido'),
      angle: z.number().min(0).max(360)
    })
  }),
  title: z.string().min(1),
  subtitle: z.string().min(1),
  actions: z.array(HeaderActionSchema)
});

export const HeaderConfigSchema = z.object({
  background: HeaderBackgroundSchema,
  topbar: HeaderTopbarSchema,
  card: HeaderCardSchema
});

export const HeaderNodeSchema = z.object({
  id: z.string(),
  type: z.literal('ui:header'),
  kind: z.literal('ui'),
  variant: z.enum(['basic', 'hero-glass']),
  config: HeaderConfigSchema,
  layout: z.object({
    i: z.string(),
    x: z.number(),
    y: z.number(),
    w: z.number(),
    h: z.number()
  })
});

export type HeaderConfigType = z.infer<typeof HeaderConfigSchema>;