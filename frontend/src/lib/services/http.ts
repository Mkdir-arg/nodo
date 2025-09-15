import { buildApiUrl } from "@/lib/api";
import {
  clearStoredTokens,
  getAccessToken,
  getRefreshToken,
  storeTokens,
} from "@/lib/tokens";

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

async function refreshAccessToken(): Promise<string | null> {
  if (typeof window === "undefined") return null;
  const refresh = getRefreshToken();
  if (!refresh) return null;

  try {
    const res = await fetch(buildApiUrl("/api/token/refresh/", "POST"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh }),
      credentials: "include",
    });

    if (!res.ok) {
      clearStoredTokens();
      return null;
    }

    const data = await res.json().catch(() => null);
    const access = data?.access;
    if (typeof access === "string" && access) {
      storeTokens({ access, refresh });
      return access;
    }
  } catch (error) {
    console.error("[http refresh failed]", (error as Error)?.message || error);
  }

  return null;
}

async function fetchWithAuthRetry(
  url: string | URL,
  init: RequestInit,
  timeout: number,
  shouldAuth: boolean,
): Promise<Response> {
  let res = await withTimeout(fetch(url, init), timeout);
  if (res.status !== 401 || !shouldAuth || typeof window === "undefined") {
    return res;
  }

  const newAccess = await refreshAccessToken();
  if (!newAccess) {
    return res;
  }

  const headers = new Headers(init.headers as HeadersInit | undefined);
  headers.set("Authorization", `Bearer ${newAccess}`);

  const retryInit: RequestInit = {
    ...init,
    headers,
  };

  res = await withTimeout(fetch(url, retryInit), timeout);
  return res;
}

async function parseResponse(res: Response) {
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

  if (ct.includes("application/json")) {
    return text ? JSON.parse(text) : {};
  }

  return text as any;
}

export async function http(path: string, opts: HttpOptions = {}) {
  const method = (opts.method || "GET").toUpperCase();
  let target = buildUrl(path, method);

  if (typeof window !== "undefined" && typeof target === "string" && target.includes("://backend:")) {
    target = target.replace("://backend:", "://localhost:");
  }

  const { timeoutMs, auth, ...rest } = opts;
  const timeout = timeoutMs ?? 15000;
  const shouldAuth = auth !== false;

  const buildHeaders = () => {
    const headers = new Headers(rest.headers as HeadersInit | undefined);
    if (!(rest.body instanceof FormData) && !headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }
    if (shouldAuth) {
      const token = getAccessToken();
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
    }
    return headers;
  };

  const createInit = (): RequestInit => {
    const headers = buildHeaders();
    return {
      ...rest,
      method,
      headers,
      credentials: rest.credentials ?? "include",
    };
  };

  const execute = async (url: string | URL) => {
    const init = createInit();
    const res = await fetchWithAuthRetry(url, init, timeout, shouldAuth);
    return parseResponse(res);
  };

  try {
    console.info("[http]", method, target);
    return await execute(target);
  } catch (error: any) {
    console.error("[http failed]", error?.name || "", error?.message || error);

    if (typeof target === "string" && target.includes("://backend:")) {
      const fallback = target.replace("://backend:", "://localhost:");
      try {
        console.warn("[http retry]", fallback);
        return await execute(fallback);
      } catch (e2) {
        console.error("[http retry failed]", e2);
        throw e2;
      }
    }

    throw error;
  }
}
