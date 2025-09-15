"use client";

// --- helpers de URL ---
function trimEndSlash(s: string) { return String(s ?? "").replace(/\/+$/, ""); }
function trimStartSlash(s: string) { return String(s ?? "").replace(/^\/+/, ""); }
function ensureTrailingSlash(s: string) { return trimEndSlash(s) + "/"; }
function joinUrl(base: string, path = "") {
  const b = trimEndSlash(base);
  const p = trimStartSlash(path);
  return p ? `${b}/${p}` : `${b}/`;
}

// Lee bases desde env (Next inyecta NEXT_PUBLIC_ en el bundle del browser)
function getPublicBase(): string {
  return ensureTrailingSlash(process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:8000/api/");
}
function getInternalBase(): string {
  const internal = process.env.API_URL_INTERNAL ? trimEndSlash(process.env.API_URL_INTERNAL) : "";
  return ensureTrailingSlash(internal ? `${internal}/api` : getPublicBase());
}

// Resolver SIEMPRE en runtime.
// En navegador: SIEMPRE base pública. Además, si por algún motivo
// vino 'backend' igual, forzamos a pública (airbag).
export function getApiBase(): string {
  const publicBase = getPublicBase();
  if (typeof window !== "undefined") {
    // Airbag por si algo “horneó” backend en el bundle
    return /^https?:\/\/backend(:\d+)?\//.test(publicBase) ? "http://localhost:8000/api/" : publicBase;
  }
  // SSR
  return getInternalBase();
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

// DEBUG opcional: dejalo unos minutos y mirá la consola del navegador
if (typeof window !== "undefined") {
  // @ts-ignore
  console.log("[api] runtime client base =", getApiBase(), "NEXT_PUBLIC_API_BASE =", process.env.NEXT_PUBLIC_API_BASE);
}
