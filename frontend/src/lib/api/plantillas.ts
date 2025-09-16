import type { FormLayout, PlantillaLayoutResponse } from '@/lib/forms/types';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8000';

async function fetchJSON<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${url}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
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
    layout_json: layout,
    layout_version: layout.version + 1
  });
}

export async function fetchPlantillaLayout(plantillaId: string): Promise<PlantillaLayoutResponse> {
  return fetchJSON<PlantillaLayoutResponse>(layoutPath(plantillaId));
}