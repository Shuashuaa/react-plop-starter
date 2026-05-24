import wretch from "wretch";
import QueryStringAddon from "wretch/addons/queryString";

const API_URL = import.meta.env.VITE_API_URL ?? "";

export const api = wretch(API_URL)
  .addon(QueryStringAddon)
  .middlewares([
    // Config guard: fail fast with an actionable message when the API base URL
    // is missing. Without it, requests resolve to relative paths (e.g. /users)
    // and hit the Vite dev server, which returns an HTML page instead of JSON —
    // surfacing as an unreadable HTML dump in the UI.
    (next) => async (url, opts) => {
      if (!/^https?:\/\//.test(API_URL)) {
        throw new Error(
          `VITE_API_URL is not a valid base URL (got "${API_URL}"). ` +
            "Set it in .env.local to an absolute http(s) URL " +
            "(e.g. VITE_API_URL=https://your-backend.com) and restart the dev server.",
        );
      }
      const res = await next(url, opts);
      // URL is set but the endpoint returned an HTML page, not JSON — usually a
      // wrong base URL or a path that doesn't exist on the backend.
      if (!res.ok && res.headers.get("content-type")?.includes("text/html")) {
        throw new Error(
          `API returned an HTML page (status ${res.status}) from "${url}". ` +
            "Check VITE_API_URL points to a JSON API, not a web page.",
        );
      }
      return res;
    },

    // Auth: attach token from localStorage to every request.
    (next) => (url, opts) => {
      const token = localStorage.getItem("token");
      return next(url, {
        ...opts,
        headers: {
          ...opts.headers,
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
    },

    // Reactive 401 logout: clear auth state and redirect to /login (only when a
    // token was present, to avoid redirect loops on the login page itself).
    (next) => (url, opts) =>
      next(url, opts).catch((error: { status?: number }) => {
        if (error?.status === 401) {
          const hadToken = !!localStorage.getItem("token");
          localStorage.removeItem("token");
          if (hadToken) window.location.href = "/login";
        }
        throw error;
      }),
  ]);
