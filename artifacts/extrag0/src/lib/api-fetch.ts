const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

export class ApiError extends Error {
  status: number;
  body: any;
  constructor(message: string, status: number, body: any) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

export async function apiFetch(path: string, options?: RequestInit) {
  const token = localStorage.getItem("extragO_token");
  let res: Response;
  try {
    res = await fetch(`${BASE}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options?.headers ?? {}),
      },
    });
  } catch (networkErr) {
    throw new ApiError("network_error", 0, null);
  }
  if (!res.ok) {
    const text = await res.text();
    let body: any = null;
    try { body = text ? JSON.parse(text) : null; } catch { /* not JSON */ }
    const message = body?.error || text || String(res.status);
    throw new ApiError(message, res.status, body);
  }
  return res.json();
}
