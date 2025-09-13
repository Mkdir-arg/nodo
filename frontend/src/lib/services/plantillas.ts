import { http } from './http';

export type FetchPlantillasParams = {
  search?: string;
  estado?: 'ACTIVO' | 'INACTIVO';
  page?: number;
  page_size?: number;
};

const qsOf = (o: Record<string, string | number | undefined>) => {
  const q = new URLSearchParams();
  Object.entries(o).forEach(([k, v]) => {
    if (v !== undefined && v !== null && String(v) !== '') q.set(k, String(v));
  });
  const s = q.toString();
  return s ? `?${s}` : '';
};

const getWithFallback = (a: string, b: string) => http(a).catch(() => http(b));
const postPutWithFallback = (
  m: 'POST' | 'PUT',
  a: string,
  b: string,
  payload: any,
) =>
  http(a, { method: m, body: JSON.stringify(payload) }).catch(() =>
    http(b, { method: m, body: JSON.stringify(payload) }),
  );

export const PlantillasService = {
  // LIST
  fetchPlantillas: (p: FetchPlantillasParams = {}) => {
    const qs = qsOf({ search: p.search, estado: p.estado, page: p.page, page_size: p.page_size });
    return getWithFallback(`/plantillas/${qs}`, `/formularios/${qs}`);
  },

  // DETAIL
  fetchPlantilla: (id: string) =>
    getWithFallback(`/plantillas/${id}/`, `/formularios/${id}/`),

  // EXISTS (acción de router detail=False ⇒ requiere slash)
  existsNombre: async (nombre: string, excludeId?: string) => {
    const qs = qsOf({ nombre: nombre?.trim(), exclude_id: excludeId });
    try {
      const res = await http(`/plantillas/exists/${qs}`);
      return !!(res as any)?.exists;
    } catch {
      const res = await http(`/formularios/exists/${qs}`);
      return !!(res as any)?.exists;
    }
  },

  // CREATE / UPDATE / DELETE
  savePlantilla: (payload: any) =>
    postPutWithFallback('POST', `/plantillas/`, `/formularios/`, payload),

  updatePlantilla: (id: string, payload: any) =>
    postPutWithFallback('PUT', `/plantillas/${id}/`, `/formularios/${id}/`, payload),

  deletePlantilla: (id: string) =>
    http(`/plantillas/${id}/`, { method: 'DELETE' }).catch(() =>
      http(`/formularios/${id}/`, { method: 'DELETE' }),
    ),
};
