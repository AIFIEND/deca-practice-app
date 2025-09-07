// lib/api.ts
// Centralized API base + fetch helpers with lightweight diagnostics.

function getBaseUrl(): string {
  const isServer = typeof window === 'undefined';
  const base =
    (isServer ? process.env.API_URL : process.env.NEXT_PUBLIC_API_URL) || '';
  return base.replace(/\/+$/, ''); // strip trailing slash
}

export function apiUrl(path: string): string {
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${getBaseUrl()}${p}`;
}

export async function apiFetch(
  path: string,
  init: RequestInit = {}
): Promise<Response> {
  const url = apiUrl(path);

  // Normalize headers so we can log them.
  const headers = new Headers(init.headers || {});
  // (Auth header will be added by callers for now; diagnostics below will show it.)

  if (process.env.NODE_ENV !== 'production') {
    const logged: Record<string, string> = {};
    headers.forEach((v, k) => {
      logged[k] = k.toLowerCase() === 'authorization' ? 'Bearer ***' : v;
    });
    // Beginner-friendly, visible in browser console and Node logs:
    // Shows URL, method, and (masked) headers for 401/CORS debugging.
    // eslint-disable-next-line no-console
    console.debug('[apiFetch]', {
      url,
      method: (init.method || 'GET').toUpperCase(),
      headers: logged,
    });
  }

  return fetch(url, { ...init, headers });
}

async function readJson<T>(res: Response): Promise<T> {
  const data = (await res
    .json()
    .catch(() => ({}))) as unknown as Record<string, any>;

  if (!res.ok) {
    const err: any = new Error(data?.message || `Request failed: ${res.status}`);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data as T;
}

export async function getJson<T = any>(
  path: string,
  init: RequestInit = {}
): Promise<T> {
  const res = await apiFetch(path, { ...init, method: 'GET' });
  return readJson<T>(res);
}

export async function postJson<T = any>(
  path: string,
  body: unknown,
  init: RequestInit = {}
): Promise<T> {
  const headers = new Headers(init.headers || {});
  if (!headers.has('Content-Type')) headers.set('Content-Type', 'application/json');

  const res = await apiFetch(path, {
    ...init,
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });
  return readJson<T>(res);
}
