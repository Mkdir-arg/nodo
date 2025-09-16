import type { FormLayout, PlantillaLayoutResponse } from '@/lib/forms/types';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8000';

async function fetchJSON<T>(url: string, options?: RequestInit): Promise<T> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
  const response = await fetch(`${API_BASE}${url}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => 'Sin detalles');
    throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText}`);
  }

  return response.json();
}

async function putJSON<T>(url: string, data: any): Promise<T> {
  return fetchJSON<T>(url, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

const layoutPath = (id: string) => `/api/plantillas/${id}/layout/`;

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
  return fetchJSON('/api/plantillas/', {
    method: 'POST',
    body: JSON.stringify({
      nombre: data.nombre,
      descripcion: data.descripcion || '',
      schema: data.schema || { type: 'object', properties: {} }
    })
  });
}