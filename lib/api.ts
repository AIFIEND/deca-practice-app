// lib/api.ts
const raw =
  process.env.NEXT_PUBLIC_API_URL || // works in browser and server
  process.env.API_URL;               // optional server-only backup

if (!raw) {
  throw new Error("Missing NEXT_PUBLIC_API_URL or API_URL");
}

// Remove trailing slashes so we do not get double slashes
const BASE = raw.replace(/\/+$/, "");





// Builds a full URL from "/api/whatever"
export function apiUrl(path: string): string {
  const p = path.startsWith("/") ? path : `/${path}`;
  return new URL(p, BASE).toString();
}

// Generic fetch that sends JSON by default
export async function apiFetch(path: string, init: RequestInit = {}) {
  return fetch(apiUrl(path), {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init.headers || {}),
    },
  });
}

// Convenience for POSTing JSON and parsing JSON back
export async function postJson<T>(
  path: string,
  body: unknown,
  init?: RequestInit
): Promise<{ res: Response; data: T }> {
  const res = await apiFetch(path, {
    method: "POST",
    body: JSON.stringify(body),
    ...(init || {}),
  });
  const data = (await res.json().catch(() => ({}))) as T;
  return { res, data };
}
