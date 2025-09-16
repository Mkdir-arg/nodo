import { nanoid } from "nanoid";
import { Template, templateSchema, Dossier, dossierSchema } from "./schema";
import { ITemplatesRepo } from "./api-repo";

type Id = string;

const kT = "legajos.templates";
const kD = "legajos.dossiers";

function get<T>(k:string, def:T): T {
  if (typeof window === "undefined") return def;
  try {
    const raw = localStorage.getItem(k);
    return raw ? JSON.parse(raw) as T : def;
  } catch (error) {
    console.warn(`Error parsing localStorage key ${k}:`, error);
    return def;
  }
}
function set<T>(k:string, v:T) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(k, JSON.stringify(v));
  } catch (error) {
    console.warn(`Error setting localStorage key ${k}:`, error);
  }
}

export class LocalRepo implements ITemplatesRepo {
  private _templatesCache: Template[] | null = null;
  
  async listTemplates() { 
    if (!this._templatesCache) {
      this._templatesCache = get<Template[]>(kT, []);
    }
    return this._templatesCache;
  }
  
  async getTemplate(id: Id) { 
    const templates = await this.listTemplates();
    return templates.find(t=>t.id===id) ?? null; 
  }
  
  async upsertTemplate(t: Template) {
    try {
      console.log('💾 LOCAL PASO 1: Template recibido:', JSON.stringify(t, null, 2));
      
      const list = await this.listTemplates();
      const idx = list.findIndex(x=>x.id===t.id);
      
      console.log('💾 LOCAL PASO 2: Parseando template...');
      const parsed = templateSchema.parse(t);
      
      console.log('💾 LOCAL PASO 3: Template parseado exitosamente:', JSON.stringify(parsed, null, 2));
      
      if (idx >= 0) list[idx] = parsed; else list.push(parsed);
      this._templatesCache = list;
      set(kT, list); 
      
      console.log('✅ LOCAL PASO 4: Guardado en localStorage exitoso');
      return parsed;
    } catch (error) {
      console.error('❌ LOCAL ERROR:', error);
      throw new Error(`Invalid template data: ${error}`);
    }
  }
  
  async publishTemplate(id: Id) {
    const list = await this.listTemplates();
    const template = list.find(t => t.id === id);
    if (!template) throw new Error("not found");
    template.status = "published";
    this._templatesCache = list;
    set(kT, list);
    return template;
  }
  async cloneTemplate(id: Id) {
    const t = await this.getTemplate(id); if (!t) throw new Error("not found");
    const copy = { ...t, id: nanoid(), slug: `${t.slug}-copy`, name: `${t.name} (Copia)`, status: "draft" as const };
    return this.upsertTemplate(copy);
  }
  async listDossiers() { return get<Dossier[]>(kD, []); }
  async createDossier(d: Omit<Dossier, "id">) {
    try {
      const parsed = dossierSchema.parse({ id: nanoid(), ...d });
      const list = await this.listDossiers(); list.push(parsed); set(kD, list); return parsed;
    } catch (error) {
      throw new Error(`Invalid dossier data: ${error}`);
    }
  }
  async getDossier(id: Id) { return (await this.listDossiers()).find(x=>x.id===id) ?? null; }
  async saveDossier(d: Dossier) {
    try {
      const list = await this.listDossiers();
      const idx = list.findIndex(x=>x.id===d.id); if (idx<0) throw new Error("not found");
      list[idx] = dossierSchema.parse(d); set(kD, list); return list[idx];
    } catch (error) {
      if (error instanceof Error && error.message === "not found") throw error;
      throw new Error(`Invalid dossier data: ${error}`);
    }
  }
}