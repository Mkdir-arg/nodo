"use client";

import { apiUrl } from "./api";

export interface TokenPair { access: string; refresh: string }

function base(): string { return apiUrl(""); }

function ensurePublic(url: string, suffix: string) {
  // Si en navegador y quedó apuntando a backend, rehace con la base pública
  if (typeof window !== "undefined" && /\/\/backend(:\d+)?\//.test(url)) {
    const pub = (process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:8000/api/").replace(/\/+$/, "") + "/";
    return pub + suffix.replace(/^\/+/, "");
  }
  return url;
}

export async function login(username: string, password: string): Promise<TokenPair> {
  const raw = apiUrl("token/");
  const url = ensurePublic(raw, "token/");
  console.log("[auth] BASE =", base(), "LOGIN URL =", url);

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
