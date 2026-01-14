// frontend_service/lib/api.ts
import { getSession } from "next-auth/react";

// 1. Get the Backend URL from environment or default to localhost
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// Helper to join paths cleanly (avoids double slashes like //api)
function joinUrl(base: string, path: string) {
  const cleanBase = base.replace(/\/+$/, ""); // Remove trailing slash
  const cleanPath = path.replace(/^\/+/, ""); // Remove leading slash
  return `${cleanBase}/${cleanPath}`;
}

export async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const url = joinUrl(API_BASE, endpoint);
  
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  // 2. Handle Errors (404, 500, 401, etc.)
  if (!response.ok) {
    let errorMessage = `API Error: ${response.status} ${response.statusText}`;
    try {
        // Try to parse the error message from the backend JSON
        const errorData = await response.json();
        if (errorData.message) errorMessage = errorData.message;
    } catch (e) {
        // If JSON parse fails, stick with the status text
    }
    throw new Error(errorMessage);
  }

  return response;
}

export async function postJson(endpoint: string, data: any, options: RequestInit = {}) {
  const res = await apiFetch(endpoint, {
    ...options,
    method: "POST",
    body: JSON.stringify(data),
  });
  return res.json();
}
