// frontend/src/lib/api/index.ts
import { clearStoredTokens, getAccessToken } from "@/lib/tokens";
import { apiUrl } from "@/services/api";

const ABSOLUTE_URL_REGEX = /^https?:\/\//i;
const isServer = typeof window === "undefined";

/** Normaliza método a MAYÚSCULAS */
function normalizeMethod(method?: string): string {
  return (method || "GET").toUpperCase();
}

/** Forzamos slash final en métodos no-seguros para evitar redirects de Django */
function shouldForceTrailingSlash(method: string) {
  return method !== "GET" && method !== "HEAD" && method !== "OPTIONS";
}

/** Agrega '/' antes de ? o # si falta, sin romper query/hash */
function ensureTrailingSlash(url: string): string {
  const hashIndex = url.indexOf("#");
  const hash = hashIndex >= 0 ? url.slice(hashIndex) : "";
  const baseNoHash = hashIndex >= 0 ? url.slice(0, hashIndex) : url;

  const queryIndex = baseNoHash.indexOf("?");
  const search = queryIndex >= 0 ? baseNoHash.slice(queryIndex) : "";
  const pathname = queryIndex >= 0 ? baseNoHash.slice(0, queryIndex) : baseNoHash;

  if (!pathname || pathname.endsWith("/")) return url;
  const newBase = `${pathname}/${search}`;
  return `${newBase}${hash}`;
}

/** Quita slashes iniciales y un prefijo 'api/' si viene en el path */
function normalizeIncomingPath(path: string): string {
  const p = String(path ?? "");
  if (ABSOLUTE_URL_REGEX.test(p)) return p;                // ya es absoluta
  const noLead = p.replace(/^\/+/, "");                    // quita "/" inicial
  return noLead.startsWith("api/") ? noLead.slice(4) : noLead; // quita "api/"
}

/** Resuelve URL absoluta con la base correcta (cliente/SSR) */
export function resolveApiUrl(path: string): string {
  const normalized = normalizeIncomingPath(path);
  return ABSOLUTE_URL_REGEX.test(normalized) ? normalized : apiUrl(normalized);
}

/** Construye la URL final y aplica slash según método */
export function buildApiUrl(path: string, method?: string): string {
  const resolved = resolveApiUrl(path);
  const normalizedMethod = normalizeMethod(method);
  return shouldForceTrailingSlash(normalizedMethod) ? ensureTrailingSlash(resolved) : resolved;
}

/** Inyecta Authorization y mantiene credentials=include */
function withAuth(init: RequestInit = {}): RequestInit {
  const headers = new Headers(init.headers ?? {});
  if (!isServer) {
    const token = getAccessToken?.();
    if (token && !headers.has("Authorization")) {
      headers.set("Authorization", `Bearer ${token}`);
    }
  }
  const requestInit: RequestInit = { ...init, headers };
  if (!requestInit.credentials) requestInit.credentials = "include";
  return requestInit;
}

/** Cliente base */
export async function api(path: string, init: RequestInit = {}) {
  const method = normalizeMethod(init.method);
  const target = buildApiUrl(path, method);
  const res = await fetch(target, withAuth({ ...init, method }));

  if (res.status === 401) {
    if (!isServer) {
      clearStoredTokens?.();
      window.location.href = "/login";
    }
    throw new Error("Unauthorized");
  }
  return res;
}

/** Helpers JSON */
export async function getJSON<T = unknown>(path: string, init?: RequestInit): Promise<T> {
  const res = await api(path, init);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json() as Promise<T>;
}
export async function postJSON<T = unknown>(path: string, body: unknown, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers ?? {});
  if (!headers.has("Content-Type")) headers.set("Content-Type", "application/json");
  const res = await api(path, { ...init, method: init?.method ?? "POST", headers, body: JSON.stringify(body) });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json() as Promise<T>;
}
export async function putJSON<T = unknown>(path: string, body: unknown, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers ?? {});
  if (!headers.has("Content-Type")) headers.set("Content-Type", "application/json");
  const res = await api(path, { ...init, method: "PUT", headers, body: JSON.stringify(body) });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json() as Promise<T>;
}
export async function patchJSON<T = unknown>(path: string, body: unknown, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers ?? {});
  if (!headers.has("Content-Type")) headers.set("Content-Type", "application/json");
  const res = await api(path, { ...init, method: "PATCH", headers, body: JSON.stringify(body) });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json() as Promise<T>;
}
export async function deleteJSON<T = unknown>(path: string, init?: RequestInit): Promise<T> {
  const res = await api(path, { ...(init || {}), method: "DELETE" });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const text = await res.text();
  return (text ? JSON.parse(text) : ({} as T)) as T;
}
