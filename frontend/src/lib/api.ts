
const ACCESS_TOKEN_KEY = "access_token";
const REFRESH_TOKEN_KEY = "refresh_token";

const ABSOLUTE_URL_REGEX = /^https?:\/\//i;

const isServer = typeof window === "undefined";

function normalizeMethod(method?: string): string {
  return (method || "GET").toUpperCase();
}

function shouldForceTrailingSlash(method: string) {
  return method !== "GET" && method !== "HEAD" && method !== "OPTIONS";
}

function ensureTrailingSlash(url: string): string {
  const hashIndex = url.indexOf("#");
  const hash = hashIndex >= 0 ? url.slice(hashIndex) : "";
  const base = hashIndex >= 0 ? url.slice(0, hashIndex) : url;

  const queryIndex = base.indexOf("?");
  const search = queryIndex >= 0 ? base.slice(queryIndex) : "";
  const pathname = queryIndex >= 0 ? base.slice(0, queryIndex) : base;

  if (!pathname || pathname.endsWith("/")) {
    return url;
  }

  const newBase = `${pathname}/${search}`;
  return `${newBase}${hash}`;
}

export function resolveApiUrl(path: string): string {
  if (ABSOLUTE_URL_REGEX.test(path)) {
    return path;
  }

  const normalized = path.startsWith("/") ? path : `/${path}`;

  if (typeof window === "undefined") {
    const base = (process.env.API_URL_INTERNAL || "http://backend:8000").replace(/\/$/, "");
    return `${base}${normalized}`;
  }

  return normalized;
}

export function buildApiUrl(path: string, method?: string): string {
  const resolved = resolveApiUrl(path);
  const normalizedMethod = normalizeMethod(method);

  if (!shouldForceTrailingSlash(normalizedMethod)) {
    return resolved;
  }

  return ensureTrailingSlash(resolved);
}

function withAuth(init: RequestInit = {}): RequestInit {
  const headers = new Headers(init.headers ?? {});

  if (!isServer) {
    const token = localStorage.getItem(ACCESS_TOKEN_KEY);
    if (token && !headers.has("Authorization")) {
      headers.set("Authorization", `Bearer ${token}`);
    }
  }

  const requestInit: RequestInit = {
    ...init,
    headers,
  };

  if (!requestInit.credentials) {
    requestInit.credentials = "include";
  }

  return requestInit;
}

export async function api(path: string, init: RequestInit = {}) {
  const method = normalizeMethod(init.method);
  const target = buildApiUrl(path, method);
  const response = await fetch(target, withAuth({ ...init, method }));

  if (response.status === 401) {
    if (!isServer) {
      localStorage.removeItem(ACCESS_TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      window.location.href = "/login";
    }
    throw new Error("Unauthorized");
  }

  return response;
}

export async function getJSON<T = unknown>(path: string, init?: RequestInit): Promise<T> {
  const res = await api(path, init);

  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export async function postJSON<T = unknown>(path: string, body: unknown, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers ?? {});
  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const res = await api(path, {
    ...init,
    method: init?.method ?? "POST",
    headers,
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }

  return res.json() as Promise<T>;
}
