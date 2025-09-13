import { z } from "zod";
type Node = any;
export function zodFromTemplate(nodes: Node[]): z.ZodTypeAny {
  const shape: Record<string, z.ZodTypeAny> = {};
  const add = (key: string, t: z.ZodTypeAny, required?: boolean) => { shape[key] = required ? t : t.optional(); };
  const walk = (ns: Node[]) => ns.forEach(n => {
    if (n.type === "section") return walk(n.children || []);
    if (n.type === "group") {
      const inner: any = {};
      (n.children||[]).forEach((c:any)=>{
        if (c.type==="text"||c.type==="textarea") inner[c.key]=(c.pattern?z.string().regex(new RegExp(c.pattern)):z.string()).min(c.minLength||0).max(c.maxLength||1e9);
        else if (c.type==="number") inner[c.key]=z.number().min(c.min??-1e15).max(c.max??1e15);
        else if (c.type==="date") inner[c.key]=z.string();
        else if (c.type==="select"||c.type==="dropdown") inner[c.key]=z.string();
        else if (c.type==="multiselect") inner[c.key]=z.array(z.string());
        else if (c.type==="document") inner[c.key]=z.any();
        else if (c.type==="phone") inner[c.key]=z.string();
        else if (c.type==="cuit_razon_social") inner[c.key]=z.object({cuit:z.string(), razon_social:z.string()});
        else if (c.type==="sum") inner[c.key]=z.number();
      });
      add(n.key, z.array(z.object(inner)).min(n.minItems||0).max(n.maxItems||1e9), n.required);
      return;
    }
    if (n.type==="text"||n.type==="textarea") {
      const base = z.string().min(n.minLength||0).max(n.maxLength||1e9);
      add(n.key, n.pattern ? base.regex(new RegExp(n.pattern)) : base, n.required);
    } else if (n.type==="number"||n.type==="sum") {
      add(n.key, z.number().min(n.min??-1e15).max(n.max??1e15), n.required);
    } else if (n.type==="date") {
      add(n.key, z.string(), n.required);
    } else if (n.type==="select"||n.type==="dropdown") {
      add(n.key, z.string(), n.required);
    } else if (n.type==="multiselect") {
      add(n.key, z.array(z.string()), n.required);
    } else if (n.type==="document") {
      add(n.key, z.any(), n.required);
    } else if (n.type==="phone") {
      add(n.key, z.string(), n.required);
    } else if (n.type==="cuit_razon_social") {
      add(n.key, z.object({cuit:z.string(), razon_social:z.string()}), n.required);
    }
  });
  walk(nodes);
  return z.object(shape);
}
