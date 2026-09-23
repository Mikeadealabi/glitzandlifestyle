/** JSON request to an admin API route. Never throws; returns the error message to show. */
export async function send<T = Record<string, unknown>>(
  url: string,
  method: "POST" | "PATCH" | "DELETE",
  body?: unknown,
): Promise<{ ok: true; data: T } | { ok: false; error: string }> {
  try {
    const res = await fetch(url, {
      method,
      headers: body === undefined ? undefined : { "content-type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    if (res.status === 401) {
      window.location.href = "/admin/login";
      return { ok: false, error: "Your session has ended. Sign in again." };
    }
    return res.ok ? { ok: true, data } : { ok: false, error: data.error ?? `Something went wrong (${res.status}).` };
  } catch {
    return { ok: false, error: "Couldn't reach the server. Check your connection and try again." };
  }
}
