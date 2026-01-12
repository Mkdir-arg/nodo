import { deleteJSON, getJSON, patchJSON, postJSON, putJSON } from '@/lib/api';

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

type EndpointPreference = 'plantillas' | 'formularios';

let preferredEndpoint: EndpointPreference | null = null;
const FALLBACK_ENDPOINT: EndpointPreference = 'formularios';

const endpointMap: Record<EndpointPreference, string> = {
  plantillas: '/api/plantillas/',
  formularios: '/api/formularios/',
};

const memoizedGet = new Map<string, Promise<any>>();
const memoizedExists = new Map<string, Promise<any>>();

const resolveUrl = (base: string, suffix = '') => {
  if (!suffix) return base;
  if (base.endsWith('/') && suffix.startsWith('/')) {
    return `${base}${suffix.slice(1)}`;
  }
  if (!base.endsWith('/') && !suffix.startsWith('/')) {
    return `${base}/${suffix}`;
  }
  return `${base}${suffix}`;
};

const baseSegmentMatcher = /\/api\/(plantillas|formularios)(?=\/|\?|$)/;

async function requestWithPreference<T>(path: string) {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const suffix = normalizedPath.replace(/^\//, '');

  const fetchFrom = async (endpoint: EndpointPreference): Promise<T> => {
    const substituted = baseSegmentMatcher.test(normalizedPath)
      ? normalizedPath.replace(baseSegmentMatcher, `/api/${endpoint}`)
      : resolveUrl(endpointMap[endpoint], suffix);

    return getJSON<T>(substituted);
  };

  if (preferredEndpoint) {
    try {
      return await fetchFrom(preferredEndpoint);
    } catch (error) {
      preferredEndpoint = null;
      memoizedGet.clear();
      throw error;
    }
  }

  const attempts: EndpointPreference[] = ['plantillas', 'formularios'];
  const errors: unknown[] = [];

  for (const candidate of attempts) {
    try {
      const result = await fetchFrom(candidate);
      preferredEndpoint = candidate;
      return result;
    } catch (error) {
      errors.push(error);
    }
  }

  preferredEndpoint = FALLBACK_ENDPOINT;
  throw errors[errors.length - 1];
}

const getWithFallback = <T = any>(path: string) => {
  if (!memoizedGet.has(path)) {
    memoizedGet.set(path, requestWithPreference<T>(path));
  }
  return memoizedGet.get(path) as Promise<T>;
};

export const PlantillasService = {
  fetchPlantillas: async (p: FetchPlantillasParams = {}) => {
    const qs = qsOf({
      search: p.search,
      estado: p.estado,
      page: p.page,
      page_size: p.page_size,
    });
    const res = await getWithFallback(`/api/plantillas/${qs}`);
    return normalizeList(res);
  },

  fetchPlantilla: (id: string) =>
    getWithFallback(`/api/plantillas/${id}/`),

  existsNombre: async (nombre: string, excludeId?: string) => {
    const qs = qsOf({ nombre: nombre?.trim(), exclude_id: excludeId });
    type ExistsResponse = { exists?: boolean };
    const key = `/api/plantillas/exists/${qs}`;
    if (!memoizedExists.has(key)) {
      memoizedExists.set(
        key,
        (async () => {
          try {
            const r = await requestWithPreference<ExistsResponse>(`/api/plantillas/exists/${qs}`);
            return Boolean(r?.exists);
          } catch {
            const fallback = await requestWithPreference<ExistsResponse>(`/api/formularios/exists/${qs}`);
            return Boolean(fallback?.exists);
          }
        })(),
      );
    }
    return memoizedExists.get(key) as Promise<boolean>;
  },

  savePlantilla: (payload: any) =>
    postJSON(`/api/plantillas/`, payload),

  updatePlantilla: (id: string, payload: any) =>
    putJSON(`/api/plantillas/${id}/`, payload),

  toggleEstado: (id: string) =>
    patchJSON(`/api/plantillas/${id}/toggle-estado/`, {}),

  deletePlantilla: (id: string) =>
    deleteJSON(`/api/plantillas/${id}/`),
};
