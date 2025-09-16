import { nanoid } from "nanoid";

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
      fields: templateData.fields || [],
      layout: templateData.layout || []
    }
  };

  console.log('📦 PAYLOAD SIMPLE:', payload);

  const response = await fetch('http://localhost:8000/api/plantillas/', {
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
    fields: result.schema?.fields || [],
    layout: result.schema?.layout || []
  };
}