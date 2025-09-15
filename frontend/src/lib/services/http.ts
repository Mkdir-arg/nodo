
import { buildApiUrl } from "@/lib/api";

export type HttpOptions = RequestInit & { timeoutMs?: number; auth?: boolean };

export function buildUrl(path: string, method = "GET") {
  return buildApiUrl(path, method);

}

function withTimeout<T>(p: Promise<T>, ms = 15000) {
  return new Promise<T>((resolve, reject) => {
    const id = setTimeout(() => reject(new Error(`Timeout ${ms}ms`)), ms);
    p.then(
      (v) => {
        clearTimeout(id);
        resolve(v);
      },
      (e) => {
        clearTimeout(id);
        reject(e);
      },
    );
  });
}

export async function http(path: string, opts: HttpOptions = {}) {

  const method = (opts.method || "GET").toUpperCase();
  let url = buildUrl(path, method);
  if (typeof window !== "undefined" && typeof url === "string" && url.includes("://backend:")) {
    url = url.replace("://backend:", "://localhost:");

  }

  const headers: Record<string, string> = { ...(opts.headers as any) };
  if (!(opts.body instanceof FormData) && !("Content-Type" in headers)) {
    headers["Content-Type"] = "application/json";
  }
  if (opts.auth !== false && typeof window !== "undefined") {
    const token = localStorage.getItem("access_token");
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  const cfg: RequestInit = {
    ...opts,
    method,
    headers,
    credentials: opts.credentials ?? "include",
  };

  try {

    console.info("[http]", method, url);

    const res = await withTimeout(fetch(url, cfg), opts.timeoutMs || 15000);

    const ct = res.headers.get("content-type") || "";
    const text = await res.text();

    if (!res.ok) {
      if (ct.includes("text/html")) {
        const snippet = (text || "").slice(0, 400);
        throw new Error(`HTTP ${res.status}. HTML: ${snippet}`);
      }
      try {
        const json = text ? JSON.parse(text) : {};
        throw new Error(json?.detail || json?.message || `HTTP ${res.status}`);
      } catch {
        throw new Error(text || `HTTP ${res.status}`);
      }
    }

    return ct.includes("application/json") ? (text ? JSON.parse(text) : {}) : (text as any);
  } catch (e: any) {
    console.error("[http failed]", e?.name || "", e?.message || e);

    if (typeof url === "string" && url.includes("://backend:")) {
      const fallback = url.replace("://backend:", "://localhost:");
      try {
        console.warn("[http retry]", fallback);
        const res = await withTimeout(fetch(fallback, cfg), opts.timeoutMs || 15000);
        if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
        const ct = res.headers.get("content-type") || "";
        const text = await res.text();
        return ct.includes("application/json") ? (text ? JSON.parse(text) : {}) : (text as any);
      } catch (e2) {
        console.error("[http retry failed]", e2);
        throw e2;
      }
    }

    throw e;
  }
}
