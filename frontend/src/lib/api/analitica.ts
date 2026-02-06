import { api } from '@/lib/api';

export type AnalyticsFilter =
  | { field: string; op: string; value?: unknown }
  | { and: AnalyticsFilter[] }
  | { or: AnalyticsFilter[] };

export type AnalyticsOrder = {
  field: string;
  dir?: 'asc' | 'desc';
};

export type AnalyticsMetric = {
  op: 'count';
  as?: string;
  field?: string;
};

export type AnalyticsDsl = {
  entity: 'legajos';
  mode: 'list' | 'aggregate';
  filters?: AnalyticsFilter;
  order?: AnalyticsOrder[];
  limit?: number;
  offset?: number;
  group_by?: string[];
  metrics?: AnalyticsMetric[];
};

export type AnalyticsCatalogField = {
  key: string;
  label?: string;
  type?: string;
  ops?: string[];
  system?: boolean;
  group?: string;
  sensitive?: boolean;
};

export type AnalyticsCatalog = {
  entity: string;
  fields: AnalyticsCatalogField[];
  meta?: Record<string, unknown>;
};

export type AnalyticsCatalogResponse = {
  ok: boolean;
  catalog: AnalyticsCatalog;
};

export type AnalyticsValidateResponse = {
  ok: boolean;
  dsl: AnalyticsDsl;
  catalog: {
    plantilla_id: string;
    updated_at?: string | null;
    options: {
      only_grid: boolean;
      include_system_fields: boolean;
      include_sensitive: boolean;
    };
  };
};

export type AnalyticsLegajoRow = {
  id: string;
  plantilla_id: string;
  display?: string | null;
  grid_values?: Record<string, unknown> | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export type AnalyticsListResponse = {
  ok: boolean;
  count: number;
  limit: number;
  offset: number;
  results: AnalyticsLegajoRow[];
};

export type AnalyticsAggregateResponse = {
  ok: boolean;
  mode: 'aggregate';
  count: number;
  limit: number;
  offset: number;
  groups: Record<string, unknown>[];
};

export type AnalyticsQueryResponse = AnalyticsListResponse | AnalyticsAggregateResponse;

export type AnalyticsCatalogParams = {
  plantillaId: string;
  onlyGrid?: boolean;
  includeSystemFields?: boolean;
  includeSensitive?: boolean;
};

export type AnalyticsQueryPayload = {
  plantilla_id: string;
  dsl: AnalyticsDsl;
  only_grid?: boolean;
  include_system_fields?: boolean;
  include_sensitive?: boolean;
};

/**
 * Construye querystring para el catalogo; sirve para enviar flags compatibles con el backend.
 */
function buildCatalogQuery(params: AnalyticsCatalogParams): string {
  const search = new URLSearchParams({ plantilla_id: params.plantillaId });
  if (typeof params.onlyGrid === 'boolean') search.set('only_grid', String(params.onlyGrid));
  if (typeof params.includeSystemFields === 'boolean') {
    search.set('include_system_fields', String(params.includeSystemFields));
  }
  if (typeof params.includeSensitive === 'boolean') {
    search.set('include_sensitive', String(params.includeSensitive));
  }
  const query = search.toString();
  return query ? `?${query}` : '';
}

/**
 * Ejecuta un request JSON; sirve para centralizar parseo y errores de analitica.
 */
async function requestAnalyticsJSON<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await api(path, init);
  const text = await res.text();
  let data: T | null = null;
  if (text) {
    try {
      data = JSON.parse(text) as T;
    } catch (error) {
      data = null;
    }
  }
  if (!res.ok) {
    const errorData = (data ?? {}) as { detail?: string; error?: string };
    const detail = errorData?.detail || errorData?.error || `HTTP ${res.status}`;
    throw new Error(detail);
  }
  if (!data) {
    throw new Error('Respuesta invalida del servidor.');
  }
  return data;
}

/**
 * Ejecuta un POST JSON; sirve para enviar payloads del DSL con manejo de error enriquecido.
 */
async function postAnalyticsJSON<T>(path: string, body: unknown): Promise<T> {
  const headers = new Headers();
  headers.set('Content-Type', 'application/json');
  return requestAnalyticsJSON<T>(path, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });
}

/**
 * Obtiene el catalogo de campos; sirve para descubrir que consultas estan permitidas.
 */
export async function fetchAnalyticsCatalog(
  params: AnalyticsCatalogParams
): Promise<AnalyticsCatalogResponse> {
  const query = buildCatalogQuery(params);
  return requestAnalyticsJSON<AnalyticsCatalogResponse>(`legajos/analytics/catalog/${query}`);
}

/**
 * Valida el DSL; sirve para rechazar consultas invalidas antes de ejecutar.
 */
export async function validateAnalyticsDsl(
  payload: AnalyticsQueryPayload
): Promise<AnalyticsValidateResponse> {
  return postAnalyticsJSON<AnalyticsValidateResponse>('legajos/analytics/validate/', payload);
}

/**
 * Ejecuta el DSL validado; sirve para obtener resultados de lectura de forma segura.
 */
export async function runAnalyticsQuery(
  payload: AnalyticsQueryPayload
): Promise<AnalyticsQueryResponse> {
  return postAnalyticsJSON<AnalyticsQueryResponse>('legajos/analytics/query/', payload);
}
