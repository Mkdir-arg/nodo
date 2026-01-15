import type { FormLayout, PlantillaLayoutResponse } from '@/lib/forms/types';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8000/api';

async function fetchJSON<T>(url: string, options?: RequestInit): Promise<T> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
  console.log('Token disponible:', !!token);
  console.log('URL completa:', `${API_BASE}${url}`);
  
  const response = await fetch(`${API_BASE}${url}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options?.headers,
    },
    ...options,
  });

  console.log('Response status:', response.status);
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error('Error response:', errorData);
    throw { 
      status: response.status, 
      message: errorData.error || errorData.detail || `HTTP ${response.status}: ${response.statusText}`,
      detail: errorData.detail 
    };
  }

  return response.json();
}

async function putJSON<T>(url: string, data: any): Promise<T> {
  return fetchJSON<T>(url, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

const layoutPath = (id: string) => `/plantillas/${id}/layout/`;

export async function saveLayout(plantillaId: string, layout: FormLayout): Promise<PlantillaLayoutResponse> {
  return putJSON<PlantillaLayoutResponse>(layoutPath(plantillaId), {
    layout_json: layout
  });
}

export async function fetchPlantillaLayout(plantillaId: string): Promise<PlantillaLayoutResponse> {
  return fetchJSON<PlantillaLayoutResponse>(layoutPath(plantillaId));
}

export function getPlantillaLayoutQueryOptions(plantillaId: string) {
  return {
    queryKey: ['plantilla-layout', plantillaId],
    queryFn: () => fetchPlantillaLayout(plantillaId),
  };
}

export async function createPlantilla(data: { nombre: string; descripcion?: string; schema?: any }) {
  try {
    return await fetchJSON('/plantillas/', {
      method: 'POST',
      body: JSON.stringify({
        nombre: data.nombre,
        descripcion: data.descripcion || '',
        schema: data.schema || { type: 'object', properties: {} }
      })
    });
  } catch (error: any) {
    console.error('Error en createPlantilla:', error);
    throw error;
  }
}

export async function fetchPlantillas() {
  try {
    console.log('=== INICIANDO fetchPlantillas ===');
    const response = await fetchJSON('/plantillas/');
    console.log('=== RESPONSE COMPLETO ===', response);
    console.log('=== ES ARRAY? ===', Array.isArray(response));
    return response;
  } catch (error) {
    console.error('=== ERROR EN fetchPlantillas ===', error);
    return [];
  }
}

export const plantillasKeys = {
  all: ['plantillas'] as const,
  lists: () => [...plantillasKeys.all, 'list'] as const,
  list: (filters: string) => [...plantillasKeys.lists(), { filters }] as const,
  details: () => [...plantillasKeys.all, 'detail'] as const,
  detail: (id: string) => [...plantillasKeys.details(), id] as const,
  layout: (id: string) => ['plantilla-layout', id] as const,
};

export async function fetchPlantillaFields(plantillaId: string) {
  try {
    // Obtener la plantilla completa para acceder al schema
    const plantilla = await fetchJSON(`/plantillas/${plantillaId}/`);
    const fields = [];
    
    if (plantilla.schema?.fields) {
      for (const field of plantilla.schema.fields) {
        fields.push({
          key: field.key,
          label: field.label || field.key,
          type: field.type
        });
      }
    }
    
    console.log('Campos encontrados:', fields);
    return fields;
  } catch (error) {
    console.error('Error obteniendo campos de plantilla:', error);
    return [];
  }
}