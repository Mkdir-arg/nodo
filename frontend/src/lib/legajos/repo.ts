import { nanoid } from "nanoid";
import { Template, templateSchema, Dossier, dossierSchema } from "./schema";

type Id = string;

export interface ITemplatesRepo {
  listTemplates(): Promise<Template[]>;
  getTemplate(id: Id): Promise<Template | null>;
  upsertTemplate(t: Template): Promise<Template>;
  publishTemplate(id: Id): Promise<Template>;
  cloneTemplate(id: Id): Promise<Template>;
  listDossiers(): Promise<Dossier[]>;
  createDossier(d: Omit<Dossier,"id">): Promise<Dossier>;
  getDossier(id: Id): Promise<Dossier | null>;
  saveDossier(d: Dossier): Promise<Dossier>;
}

const kT = "legajos.templates";
const kD = "legajos.dossiers";

function get<T>(k:string, def:T): T {
  if (typeof window === "undefined") return def;
  const raw = localStorage.getItem(k);
  return raw ? JSON.parse(raw) as T : def;
}
function set<T>(k:string, v:T) {
  if (typeof window === "undefined") return;
  localStorage.setItem(k, JSON.stringify(v));
}

export class LocalRepo implements ITemplatesRepo {
  async listTemplates() { return get<Template[]>(kT, []); }
  async getTemplate(id: Id) { return (await this.listTemplates()).find(t=>t.id===id) ?? null; }
  async upsertTemplate(t: Template) {
    const list = await this.listTemplates();
    const idx = list.findIndex(x=>x.id===t.id);
    const parsed = templateSchema.parse(t);
    if (idx >= 0) list[idx] = parsed; else list.push(parsed);
    set(kT, list); return parsed;
  }
  async publishTemplate(id: Id) {
    const t = await this.getTemplate(id); if (!t) throw new Error("not found");
    t.status = "published"; return this.upsertTemplate(t);
  }
  async cloneTemplate(id: Id) {
    const t = await this.getTemplate(id); if (!t) throw new Error("not found");
    const copy = { ...t, id: nanoid(), slug: `${t.slug}-copy`, name: `${t.name} (Copia)`, status: "draft" as const };
    return this.upsertTemplate(copy);
  }
  async listDossiers() { return get<Dossier[]>(kD, []); }
  async createDossier(d) {
    const parsed = dossierSchema.parse({ id: nanoid(), ...d });
    const list = await this.listDossiers(); list.push(parsed); set(kD, list); return parsed;
  }
  async getDossier(id: Id) { return (await this.listDossiers()).find(x=>x.id===id) ?? null; }
  async saveDossier(d: Dossier) {
    const list = await this.listDossiers();
    const idx = list.findIndex(x=>x.id===d.id); if (idx<0) throw new Error("not found");
    list[idx] = dossierSchema.parse(d); set(kD, list); return list[idx];
  }
}

export const repo: ITemplatesRepo = new LocalRepo(); // TODO: luego reemplazar por API real
