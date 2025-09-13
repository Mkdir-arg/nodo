export type HttpOptions = RequestInit & { timeoutMs?: number; auth?: boolean };

function getAccessToken() {
  // ajustá a tu auth real:
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('access_token') || null;
}

const API_BASE = (process.env.NEXT_PUBLIC_API_BASE || '').replace(/\/$/, '');

export function buildUrl(path: string) {
  const p = path.startsWith('/') ? path : `/${path}`;
  return API_BASE ? `${API_BASE}${p}` : p;
}

export async function http<T = any>(path: string, options: HttpOptions = {}): Promise<T> {
  const { timeoutMs = 8000, auth = false, headers, ...init } = options;
  const url = buildUrl(path);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  const finalHeaders = new Headers(headers || {});
  if (!finalHeaders.has('Content-Type') && init.body && typeof init.body === 'string') {
    finalHeaders.set('Content-Type', 'application/json');
  }
  if (auth) {
    const token = getAccessToken();
    if (token) finalHeaders.set('Authorization', `Bearer ${token}`);
  }

  try {
    console.log('[http]', init.method || 'GET', url);
    const res = await fetch(url, {
      ...init,
      headers: finalHeaders,
      signal: controller.signal,
      credentials: 'include',
    });
    clearTimeout(timer);

    const contentType = res.headers.get('content-type') || '';
    const text = await res.text();
    const data = contentType.includes('application/json') && text ? JSON.parse(text) : text;

    if (!res.ok) {
      console.error('[http error]', res.status, data);
      throw new Error(typeof data === 'string' && data ? data : `HTTP ${res.status}`);
    }

    return data as T;
  } catch (err: any) {
    clearTimeout(timer);
    if (err.name === 'AbortError') {
      console.error('[http timeout]', url);
      throw new Error(`Timeout after ${timeoutMs}ms`);
    }
    console.error('[http failed]', err);
    throw err;
  }
}
