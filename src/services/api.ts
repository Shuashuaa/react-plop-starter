import wretch from "wretch";
import QueryStringAddon from "wretch/addons/queryString";
// import { z } from "zod";

export const api = wretch(import.meta.env.VITE_API_BASE_URL ?? "https://jsonplaceholder.typicode.com")
  .addon(QueryStringAddon); // Helps with ?id=123 params
//   .middlewares([
//     // 1. Auth Middleware: Automatically attaches token to every request
//     (next) => (url, opts) => {
//       const token = localStorage.getItem("token");
//       const authHeader = token ? { Authorization: `Bearer ${token}` } : {};
      
//       return next(url, {
//         ...opts,
//         headers: {
//           ...opts.headers,
//           ...authHeader,
//         },
//       });
//     },

//     // 2. Global Error Logger: Catch 401s, 500s, or Zod errors
//     (next) => (url, opts) => {
//       return next(url, opts).catch((error) => {
//         if (error.status === 401) {
//           console.error("Unauthorized! Redirecting to login...");
//           // window.location.href = "/login";
//         }
        
//         // If it's a Zod Error (Validation failed)
//         if (error instanceof z.ZodError) {
//           console.error("API Data Mismatch:", error.errors);
//         }

//         throw error;
//       });
//     },
//   ]);