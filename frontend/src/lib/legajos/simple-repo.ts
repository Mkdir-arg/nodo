import { nanoid } from "nanoid";
import { apiUrl } from "@/services/api";

export async function saveTemplateSimple(templateData: any) {
  const token = localStorage.getItem('access_token');
  
  if (!token) {
    throw new Error('No hay token de autenticación');
  }

  console.log('🚀 GUARDANDO TEMPLATE SIMPLE:', templateData);

  const payload = {
    nombre: templateData.name,
    descripcion: templateData.description || '',
    schema: {
      type: 'object',
      properties: {},
      nodes: templateData.fields || [], // Usar 'nodes' para incluir UI
      sections: templateData.layout || [] // Usar 'sections' para estructura
    }
  };

  console.log('📦 PAYLOAD SIMPLE con nodos UI:', payload);
  console.log('📦 Nodos en payload:', payload.schema.nodes.map(n => ({ type: n.type, kind: n.kind })));

  const response = await fetch(apiUrl("plantillas/"), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Error ${response.status}: ${errorText}`);
  }

  const result = await response.json();
  console.log('✅ RESULTADO SIMPLE:', result);

  return {
    id: result.id,
    name: result.nombre,
    slug: result.nombre?.toLowerCase().replace(/\s+/g, '-') || 'sin-slug',
    status: result.estado === 'ACTIVO' ? 'published' : 'draft',
    fields: result.schema?.nodes || result.schema?.fields || [], // Priorizar 'nodes'
    layout: result.schema?.sections || result.schema?.layout || []
  };
}
