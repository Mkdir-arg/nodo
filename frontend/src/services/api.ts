// frontend/src/services/api.ts
function trimEndSlash(s: string) { return String(s ?? "").replace(/\/+$/, ""); }
function trimStartSlash(s: string) { return String(s ?? "").replace(/^\/+/, ""); }
function ensureTrailingSlash(s: string) { return trimEndSlash(s) + "/"; }
function joinUrl(base: string, path = "") {
  const b = trimEndSlash(base);
  const p = trimStartSlash(path);
  return p ? `${b}/${p}` : `${b}/`;
}

// ¡IMPORTANTE! Resolver en runtime, no top-level:
export function getApiBase(): string {
  const publicBase = ensureTrailingSlash(process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:8000/api/");
  const internalBase = ensureTrailingSlash(
    (process.env.API_URL_INTERNAL ? trimEndSlash(process.env.API_URL_INTERNAL) + "/api" : publicBase)
  );
  // Si hay window => estamos en el navegador ⇒ usar publicBase
  return (typeof window === "undefined") ? internalBase : publicBase;
}

export const apiUrl = (path = "") => joinUrl(getApiBase(), path);

export async function fetchJSON<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(apiUrl(path), init);
  if (!res.ok) {
    let detail = `HTTP ${res.status}`;
    try { detail = (await res.json())?.detail ?? detail; } catch {}
    throw new Error(detail);
  }
  return res.json();
}
