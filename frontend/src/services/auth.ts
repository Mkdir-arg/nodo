"use client";

import { apiUrl } from "./api";

export interface TokenPair { access: string; refresh: string }

function guessPublicBase(): string {
  if (typeof window === "undefined") return "http://backend:8000/api";
  const protocol = window.location.protocol;
  const hostname = window.location.hostname;
  const port = process.env.NEXT_PUBLIC_API_PORT ?? "8000";
  return `${protocol}//${hostname}:${port}/api`;
}

function ensurePublic(url: string, suffix: string) {
  // Si en navegador y quedo apuntando a backend, rehacer con base publica
  if (typeof window !== "undefined" && /\/\/backend(:\d+)?\//.test(url)) {
    const pubBase = (process.env.NEXT_PUBLIC_API_BASE ?? guessPublicBase()).replace(/\/+$/, "") + "/";
    return pubBase + suffix.replace(/^\/+/, "");
  }
  return url;
}

export async function login(username: string, password: string): Promise<TokenPair> {
  const raw = apiUrl("token/");
  const url = ensurePublic(raw, "token/");
  console.log("[auth] LOGIN URL =", url);

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  if (!res.ok) {
    let detail = `HTTP ${res.status}`;
    try { detail = (await res.json())?.detail ?? detail; } catch {}
    throw new Error(`Login failed: ${detail}`);
  }
  return res.json();
}

export async function refreshToken(refresh: string): Promise<{ access: string }> {
  const raw = apiUrl("token/refresh/");
  const url = ensurePublic(raw, "token/refresh/");
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh }),
  });
  if (!res.ok) {
    let detail = `HTTP ${res.status}`;
    try { detail = (await res.json())?.detail ?? detail; } catch {}
    throw new Error(`Refresh failed: ${detail}`);
  }
  return res.json();
}

export async function me(access: string) {
  const raw = apiUrl("auth/me/");
  const url = ensurePublic(raw, "auth/me/");
  const res = await fetch(url, { headers: { Authorization: `Bearer ${access}` } });
  if (!res.ok) throw new Error(`Me failed: HTTP ${res.status}`);
  return res.json();
}
