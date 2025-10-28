// Lightweight API service wrapper (fetch-based).
// Place this at ui/app/services/apiService.ts so imports from app/* resolve with ../services/apiService

const API_BASE = (process.env.EXPO_PUBLIC_API_BASE || process.env.REACT_APP_API_BASE || "http://localhost:8000").replace(/\/$/, "");

type RequestInitLike = RequestInit & { body?: any };

function getToken(): string | null {
  try {
    if (typeof window !== "undefined" && (window as any).localStorage) {
      return localStorage.getItem("token");
    }
  } catch (e) {
    // ignore
  }
  return null;
}

async function request(path: string, opts: RequestInitLike = {}) {
  const headers: Record<string, string> = {
    "Accept": "application/json",
    ...((opts && opts.headers) || {})
  };

  const token = getToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;

  let body = opts.body;
  if (body && typeof body === "object" && !(body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
    body = JSON.stringify(body);
  }

  const res = await fetch(`${API_BASE}${path}`, {
    method: opts.method || "GET",
    headers,
    body,
    credentials: opts.credentials || "same-origin",
  });

  const contentType = res.headers.get("content-type") || "";
  if (!res.ok) {
    let errBody: any = null;
    if (contentType.includes("application/json")) {
      errBody = await res.json().catch(() => null);
    } else {
      errBody = await res.text().catch(() => null);
    }
    const e: any = new Error(errBody?.detail || res.statusText || "Request failed");
    e.status = res.status;
    e.body = errBody;
    throw e;
  }

  if (contentType.includes("application/json")) {
    return res.json();
  }
  return res.text();
}

export default {
  get: (path: string) => request(path, { method: "GET" }),
  post: (path: string, body?: any) => request(path, { method: "POST", body }),
  patch: (path: string, body?: any) => request(path, { method: "PATCH", body }),
  del: (path: string) => request(path, { method: "DELETE" }),
  request
};
