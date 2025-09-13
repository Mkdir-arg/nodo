const API_BASE = (process.env.NEXT_PUBLIC_API_BASE || '').replace(/\/$/, ''); // ej: http://localhost:8000/api

function buildUrl(path: string) {
  const p = path.startsWith('/') ? path : `/${path}`;
  return API_BASE ? `${API_BASE}${p}` : p; // sin base => usa tal cual (solo si tenés rewrites)
}

async function apiFetch(path: string, init?: RequestInit) {
  const url = buildUrl(path);
  const res = await fetch(url, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) },
    credentials: 'include',
  });

  const contentType = res.headers.get('content-type') || '';
  const bodyText = await res.text();

  if (!res.ok) {
    // Si vino HTML, probablemente es el 404 de Next (no pegó en Django)
    if (contentType.includes('text/html')) {
      throw new Error(
        `Error ${res.status} desde ${url}. Verificá NEXT_PUBLIC_API_BASE o el rewrite de /api → backend.`
      );
    }
    // Intenta parsear mensaje JSON
    try {
      const json = JSON.parse(bodyText);
      throw new Error(json?.detail || json?.message || bodyText);
    } catch {
      throw new Error(bodyText || `HTTP ${res.status}`);
    }
  }

  // Respuesta OK
  if (contentType.includes('application/json')) {
    return bodyText ? JSON.parse(bodyText) : {};
  }
  // si fuera vacío o texto
  return bodyText as any;
}

export type FetchPlantillasParams = {
  search?: string;
  estado?: 'ACTIVO' | 'INACTIVO';
  page?: number;
  page_size?: number;
};

async function getWithFallback(pathA: string, pathB: string) {
  try {
    return await apiFetch(pathA);
  } catch (e) {
    return await apiFetch(pathB);
  }
}

async function postPutWithFallback(
  method: 'POST' | 'PUT',
  pathA: string,
  pathB: string,
  payload: any
) {
  try {
    return await apiFetch(pathA, { method, body: JSON.stringify(payload) });
  } catch {
    return await apiFetch(pathB, { method, body: JSON.stringify(payload) });
  }
}

export const PlantillasService = {
  fetchPlantillas: (p: FetchPlantillasParams = {}) => {
    const q = new URLSearchParams();
    if (p.search) q.set('search', p.search);
    if (p.estado) q.set('estado', p.estado);
    if (p.page) q.set('page', String(p.page));
    if (p.page_size) q.set('page_size', String(p.page_size));
    return getWithFallback(`/plantillas?${q}`, `/formularios?${q}`);
  },

  fetchPlantilla: (id: string) =>
    getWithFallback(`/plantillas/${id}`, `/formularios/${id}`),

  existsNombre: async (nombre: string, excludeId?: string) => {
    const q = new URLSearchParams({ nombre });
    if (excludeId) q.set('exclude_id', excludeId);
    try {
      const r = await getWithFallback(
        `/plantillas/exists?${q}`,
        `/formularios/exists?${q}`
      );
      return !!r.exists; // true si YA existe
    } catch (e) {
      // Si hay 404 HTML (Next), devolvemos false para no bloquear, pero logeamos
      console.warn('existsNombre falló:', e);
      return false;
    }
  },

  savePlantilla: (payload: any) =>
    postPutWithFallback('POST', `/plantillas`, `/formularios`, payload),

  updatePlantilla: (id: string, payload: any) =>
    postPutWithFallback('PUT', `/plantillas/${id}`, `/formularios/${id}`, payload),

  deletePlantilla: (id: string) =>
    apiFetch(`/plantillas/${id}`, { method: 'DELETE' }).catch(() =>
      apiFetch(`/formularios/${id}`, { method: 'DELETE' })
    ),
};
