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
  return q.toString() ? `?${q.toString()}` : '';
};

const normalizeList = (res: any) => {
  if (Array.isArray(res)) return { count: res.length, results: res };
  if (res?.results) return { count: res.count ?? res.results.length, results: res.results };
  if (res?.items) return { count: res.total ?? res.items.length, results: res.items };
  return { count: res?.count ?? 0, results: res?.results ?? [] };
};

const getWithFallback = (a: string, b: string) => http(a).catch(() => http(b));

export const PlantillasService = {
  fetchPlantillas: async (p: FetchPlantillasParams = {}) => {
    const qs = qsOf({ search: p.search, estado: p.estado, page: p.page, page_size: p.page_size });
    const res = await getWithFallback(`/plantillas/${qs}`, `/formularios/${qs}`);
    return normalizeList(res);
  },

  fetchPlantilla: (id: string) => getWithFallback(`/plantillas/${id}/`, `/formularios/${id}/`),

  existsNombre: async (nombre: string, excludeId?: string) => {
    const qs = qsOf({ nombre: nombre?.trim(), exclude_id: excludeId });
    try {
      const r = await http(`/plantillas/exists/${qs}`);
      return !!r?.exists;
    } catch {
      const r = await http(`/formularios/exists/${qs}`);
      return !!r?.exists;
    }
  },

  savePlantilla: (payload: any) =>
    http(`/plantillas/`, { method: 'POST', body: JSON.stringify(payload) }).catch(() =>
      http(`/formularios/`, { method: 'POST', body: JSON.stringify(payload) })
    ),

  updatePlantilla: (id: string, payload: any) =>
    http(`/plantillas/${id}/`, { method: 'PUT', body: JSON.stringify(payload) }).catch(() =>
      http(`/formularios/${id}/`, { method: 'PUT', body: JSON.stringify(payload) })
    ),

  deletePlantilla: (id: string) =>
    http(`/plantillas/${id}/`, { method: 'DELETE' }).catch(() =>
      http(`/formularios/${id}/`, { method: 'DELETE' })
    ),
};
