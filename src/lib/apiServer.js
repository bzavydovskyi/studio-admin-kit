import { NextResponse } from "next/server";

export function json(data, init) {
  return NextResponse.json(data, init);
}

export function errorResponse(message, status = 400, extra, headers) {
  return NextResponse.json({ error: message, ...(extra || {}) }, { status, headers });
}

// Wraps a route handler: converts thrown errors (including requireAdmin's
// 401) into consistent JSON error responses instead of leaking stack
// traces. `mapError(e)` is an optional escape hatch for an app's own
// named error classes that need a specific status/payload (e.g. a
// booking-conflict error) — return an errorResponse() from it to handle
// one, or nothing/undefined to fall through to the generic mapping below.
export function withErrors(handler, { mapError } = {}) {
  return async (...args) => {
    try {
      return await handler(...args);
    } catch (e) {
      const mapped = mapError?.(e);
      if (mapped) return mapped;
      const status = e?.status || 500;
      const message = status === 500 ? "Внутрішня помилка сервера" : e.message;
      if (status === 500) console.error(e);
      if (status === 429) {
        const retryAfterSeconds = e?.retryAfterSeconds || 60;
        return errorResponse(message, status, { retryAfterSeconds }, { "Retry-After": String(retryAfterSeconds) });
      }
      const extra = {};
      if (e?.code) extra.code = e.code;
      if (e?.suggestions) extra.suggestions = e.suggestions;
      return errorResponse(message, status, extra);
    }
  };
}

// CSRF mitigation for cookie-authenticated mutating requests, in two layers:
//
// 1. A custom header that only the app's own admin JS ever sets. A plain
//    cross-site <form> POST (no JS) cannot add custom headers at all, and
//    a cross-site fetch() that tried to would trigger a CORS preflight
//    this server never answers with a matching Access-Control-Allow-*, so
//    the browser blocks the real request before it's ever sent.
// 2. Explicit verification that Origin (or Referer, if Origin is absent)
//    names the SAME host this request actually arrived on — the part a
//    header alone can't prove. Works for prod and every Vercel preview
//    URL alike, no allowlist to maintain, since each deployment's Origin
//    always equals its own Host.
//
// `headerName` must match the name each app's own createAdminApi() client
// was configured with (see adminApiClient.js) — it's per-app, not a
// shared literal, so one admin panel's marker never doubles as another's.
export function assertSameOrigin(req, headerName) {
  if (!headerName) throw new Error("assertSameOrigin: headerName is required");

  const marker = req.headers.get(headerName);
  if (marker !== "1") {
    const err = new Error("Заборонено");
    err.status = 403;
    throw err;
  }

  const host = req.headers.get("x-forwarded-host") || req.headers.get("host");
  const originHeader = req.headers.get("origin") || req.headers.get("referer");
  if (!host || !originHeader) {
    const err = new Error("Заборонено");
    err.status = 403;
    throw err;
  }
  let originHost;
  try {
    originHost = new URL(originHeader).host;
  } catch {
    const err = new Error("Заборонено");
    err.status = 403;
    throw err;
  }
  if (originHost !== host) {
    const err = new Error("Заборонено");
    err.status = 403;
    throw err;
  }
}
