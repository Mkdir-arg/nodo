const ACCESS_TOKEN_KEY = "access_token";
const REFRESH_TOKEN_KEY = "refresh_token";

const ABSOLUTE_URL_REGEX = /^https?:\/\//i;

const isServer = typeof window === "undefined";

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

export async function api(path: string, init?: RequestInit) {
  const response = await fetch(resolveApiUrl(path), withAuth(init));

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
