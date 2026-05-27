const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

export async function apiFetch(path: string, options?: RequestInit) {
  const token = localStorage.getItem("extragO_token");
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options?.headers ?? {}),
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || String(res.status));
  }
  return res.json();
}
