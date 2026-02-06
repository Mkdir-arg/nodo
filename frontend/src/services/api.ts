"use client";

// URL helpers
function trimEndSlash(s: string) { return String(s ?? "").replace(/\/+$/, ""); }
function trimStartSlash(s: string) { return String(s ?? "").replace(/^\/+/, ""); }
function ensureTrailingSlash(s: string) { return trimEndSlash(s) + "/"; }
function joinUrl(base: string, path = "") {
  const b = trimEndSlash(base);
  const p = trimStartSlash(path);
  return p ? `${b}/${p}` : `${b}/`;
}

function guessPublicBase(): string {
  if (typeof window === "undefined") return "http://backend:8000/api";
  const protocol = window.location.protocol;
  const hostname = window.location.hostname;
  const port = process.env.NEXT_PUBLIC_API_PORT ?? "8000";
  return `${protocol}//${hostname}:${port}/api`;
}

// Next inyecta NEXT_PUBLIC_* en el bundle del browser
function getPublicBase(): string {
  return ensureTrailingSlash(process.env.NEXT_PUBLIC_API_BASE ?? guessPublicBase());
}

function getInternalBase(): string {
  const internal = process.env.API_BASE_INTERNAL ? trimEndSlash(process.env.API_BASE_INTERNAL) : "";
  return ensureTrailingSlash(internal || getPublicBase());
}

// Resolver SIEMPRE en runtime.
// En navegador: SIEMPRE base publica. Si vino "backend" en el bundle, forzar publica.
export function getApiBase(): string {
  const publicBase = getPublicBase();
  if (typeof window !== "undefined") {
    return /^https?:\/\/backend(:\d+)?\//.test(publicBase) ? ensureTrailingSlash(guessPublicBase()) : publicBase;
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

// DEBUG opcional: dejalo unos minutos y mira la consola del navegador
if (typeof window !== "undefined") {
  // @ts-ignore
  console.log("[api] runtime client base =", getApiBase(), "NEXT_PUBLIC_API_BASE =", process.env.NEXT_PUBLIC_API_BASE);
}
