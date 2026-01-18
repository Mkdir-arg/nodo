import { nanoid } from "nanoid";
import { Template, templateSchema, Dossier, dossierSchema } from "./schema";
import { apiUrl } from "@/services/api";

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

async function fetchWithAuth<T>(path: string, options?: RequestInit): Promise<T> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
  const url = apiUrl(path);
  
  console.log('Fetching:', url);
  
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => 'Sin detalles');
    throw new Error(`Backend no disponible: HTTP ${response.status} - ${errorText}`);
  }

  return response.json();
}

export class ApiRepo implements ITemplatesRepo {
  async listTemplates(): Promise<Template[]> {
    try {
      const data = await fetchWithAuth<any[]>('plantillas/');
      return data.map(item => ({
        id: item.id?.toString() || nanoid(),
        name: item.nombre || item.name || 'Sin nombre',
        slug: item.nombre?.toLowerCase().replace(/\s+/g, '-') || 'sin-slug',
        status: item.estado === 'ACTIVO' ? 'published' : 'draft',
        fields: item.schema?.nodes || item.schema?.fields || [],
        layout: item.schema?.sections || item.schema?.layout || [],
        version: item.version?.toString() || '1',
        createdAt: item.created_at || new Date().toISOString(),
        updatedAt: item.updated_at || new Date().toISOString()
      } as Template));
    } catch (error) {
      console.error('Error fetching templates:', error);
      throw new Error(`Backend no disponible: ${error}`);
    }
  }

  async getTemplate(id: Id): Promise<Template | null> {
    try {
      console.log('🔍 API: Fetching template with ID:', id);
      const item = await fetchWithAuth<any>(`plantillas/${id}/`);
      console.log('📝 API: Raw response:', item);
      
      let fields = [];
      let layout = [];
      
      if (item.schema) {
        fields = item.schema.nodes || item.schema.fields || [];
        layout = item.schema.sections || item.schema.layout || [];
      }
      
      // No validar con Zod, retornar directamente
      const result = {
        id: item.id?.toString() || id,
        name: item.nombre || item.name || 'Sin nombre',
        slug: item.nombre?.toLowerCase().replace(/\s+/g, '-') || 'sin-slug',
        status: item.estado === 'ACTIVO' ? 'published' : 'draft',
        fields,
        layout,
        version: item.version?.toString() || '1',
        createdAt: item.created_at || new Date().toISOString(),
        updatedAt: item.updated_at || new Date().toISOString()
      };
      
      console.log('✅ API: Template parsed successfully:', result);
      return result as Template;
    } catch (error) {
      console.error('❌ API: Error fetching template:', error);
      return null;
    }
  }

  async upsertTemplate(t: Template): Promise<Template> {
    try {
      console.log('📝 API PASO 1: Template recibido:', JSON.stringify(t, null, 2));
      
      const payload = {
        nombre: t.name,
        descripcion: t.description || '',
        schema: {
          type: 'object',
          properties: {},
          nodes: t.fields || [],
          sections: t.layout || []
        }
      };
      
      console.log('📦 API PASO 2: Payload:', JSON.stringify(payload, null, 2));

      const method = t.id && t.id !== 'new' && !t.id.startsWith('temp-') ? 'PUT' : 'POST';
      const path = method === 'PUT' ? `plantillas/${t.id}/` : 'plantillas/';
      
      console.log(`🚀 API PASO 3: Enviando ${method} a ${path}`);
      
      const item = await fetchWithAuth<any>(path, {
        method,
        body: JSON.stringify(payload)
      });

      console.log('📨 API PASO 4: Respuesta del backend:', JSON.stringify(item, null, 2));

      const result = {
        id: item.id?.toString() || t.id,
        name: item.nombre || t.name,
        slug: t.slug || item.nombre?.toLowerCase().replace(/\s+/g, '-') || 'sin-slug',
        status: item.estado === 'ACTIVO' ? 'published' : 'draft',
        fields: item.schema?.nodes || item.schema?.fields || t.fields || [],
        layout: item.schema?.sections || item.schema?.layout || t.layout || [],
        version: item.version?.toString() || t.version || '1',
        createdAt: item.created_at || t.createdAt,
        updatedAt: item.updated_at || new Date().toISOString()
      };
      
      console.log('✅ API PASO 5: Template parseado exitosamente:', JSON.stringify(result, null, 2));
      return result as Template;
    } catch (error) {
      console.error('❌ API ERROR:', error);
      throw error;
    }
  }

  async publishTemplate(id: Id): Promise<Template> {
    const template = await this.getTemplate(id);
    if (!template) throw new Error("Template not found");
    
    template.status = "published";
    return this.upsertTemplate(template);
  }

  async cloneTemplate(id: Id): Promise<Template> {
    const t = await this.getTemplate(id);
    if (!t) throw new Error("Template not found");
    
    const copy = { 
      ...t, 
      id: nanoid(), 
      slug: `${t.slug}-copy`, 
      name: `${t.name} (Copia)`, 
      status: "draft" as const 
    };
    return this.upsertTemplate(copy);
  }

  // Métodos de dossiers - implementación básica (ajustar según tu API)
  async listDossiers(): Promise<Dossier[]> {
    try {
      const data = await fetchWithAuth<any[]>('legajos/');
      return data.map(item => dossierSchema.parse({
        id: item.id?.toString() || nanoid(),
        templateId: item.template_id?.toString() || '',
        name: item.nombre || item.name || 'Sin nombre',
        data: item.data || {},
        createdAt: item.created_at || new Date().toISOString(),
        updatedAt: item.updated_at || new Date().toISOString()
      }));
    } catch (error) {
      console.error('Error fetching dossiers:', error);
      return [];
    }
  }

  async createDossier(d: Omit<Dossier, "id">): Promise<Dossier> {
    try {
      const payload = {
        template_id: d.templateId,
        nombre: d.name,
        data: d.data
      };

      const item = await fetchWithAuth<any>('legajos/', {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      return dossierSchema.parse({
        id: item.id?.toString() || nanoid(),
        templateId: item.template_id?.toString() || d.templateId,
        name: item.nombre || d.name,
        data: item.data || d.data,
        createdAt: item.created_at || new Date().toISOString(),
        updatedAt: item.updated_at || new Date().toISOString()
      });
    } catch (error) {
      console.error('Error creating dossier:', error);
      throw new Error(`Backend no disponible: ${error}`);
    }
  }

  async getDossier(id: Id): Promise<Dossier | null> {
    try {
      const item = await fetchWithAuth<any>(`legajos/${id}/`);
      return dossierSchema.parse({
        id: item.id?.toString() || id,
        templateId: item.template_id?.toString() || '',
        name: item.nombre || item.name || 'Sin nombre',
        data: item.data || {},
        createdAt: item.created_at || new Date().toISOString(),
        updatedAt: item.updated_at || new Date().toISOString()
      });
    } catch (error) {
      console.error('Error fetching dossier:', error);
      return null;
    }
  }

  async saveDossier(d: Dossier): Promise<Dossier> {
    try {
      const payload = {
        template_id: d.templateId,
        nombre: d.name,
        data: d.data
      };

      const item = await fetchWithAuth<any>(`legajos/${d.id}/`, {
        method: 'PUT',
        body: JSON.stringify(payload)
      });

      return dossierSchema.parse({
        id: item.id?.toString() || d.id,
        templateId: item.template_id?.toString() || d.templateId,
        name: item.nombre || d.name,
        data: item.data || d.data,
        createdAt: item.created_at || d.createdAt,
        updatedAt: item.updated_at || new Date().toISOString()
      });
    } catch (error) {
      console.error('Error saving dossier:', error);
      throw new Error(`Backend no disponible: ${error}`);
    }
  }
}
