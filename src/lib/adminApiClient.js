// Client-side fetch wrapper for an admin panel. Each app creates its own
// instance with its own CSRF marker header name (kept per-app rather than
// a shared literal, since the header name only has to agree with that
// same app's own server-side assertSameOrigin check — see apiServer.js).
//
//   import { createAdminApi } from "@studio/admin-kit/client";
//   export const { adminGet, adminPost, adminPatch, adminPut, adminDelete, adminUpload } =
//     createAdminApi({ csrfHeaderName: "x-lh-admin" });
export function createAdminApi({ csrfHeaderName }) {
  if (!csrfHeaderName) throw new Error("createAdminApi: csrfHeaderName is required");

  async function adminFetch(url, options = {}) {
    const res = await fetch(url, {
      ...options,
      headers: {
        ...(options.body && !(options.body instanceof FormData) ? { "Content-Type": "application/json" } : {}),
        [csrfHeaderName]: "1",
        ...(options.headers || {}),
      },
      credentials: "same-origin",
    });
    let data = null;
    try {
      data = await res.json();
    } catch {
      /* no body */
    }
    if (!res.ok) {
      const err = new Error(data?.error || `Помилка запиту (${res.status})`);
      err.status = res.status;
      err.data = data;
      throw err;
    }
    return data;
  }

  return {
    adminFetch,
    adminGet: (url) => adminFetch(url),
    adminPost: (url, body) => adminFetch(url, { method: "POST", body: JSON.stringify(body) }),
    adminPatch: (url, body) => adminFetch(url, { method: "PATCH", body: JSON.stringify(body) }),
    adminPut: (url, body) => adminFetch(url, { method: "PUT", body: JSON.stringify(body) }),
    adminDelete: (url) => adminFetch(url, { method: "DELETE" }),
    adminUpload: (url, file) => {
      const fd = new FormData();
      fd.append("file", file);
      return adminFetch(url, { method: "POST", body: fd });
    },
  };
}
