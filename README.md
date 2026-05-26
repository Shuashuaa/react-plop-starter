# ReactJS Starter — with Codegen

React 19 + Vite boilerplate with built-in code generation via Plop. Scaffold full feature modules (schema + service + hooks + UI + CRUD) with a single command, then fill only the marked `[AI GENERATION ZONE]` sections.

<p align="center">
  <img src="public/plop+react.gif" alt="Plop + React" />
</p>

The React counterpart of the Next.js Plop starter — same generators and AI-guardrail
conventions, adapted for Vite + react-router-dom.

## Features

- ⚡ **Vite** — lightning-fast dev server and build
- ⚛️ **React 19** + **TypeScript**
- 🎨 **Tailwind CSS v4** — utility-first styling (no `tailwind.config`; `@import "tailwindcss"`)
- 🔄 **TanStack Query v5** — server state (queries + mutations + cache invalidation)
- 📊 **TanStack Table v8** — sortable/filterable/paginated DataTable
- 🌐 **Wretch** — HTTP client (config guard + auth token + 401 logout)
- ✅ **Zod** + 🎯 **React Hook Form** — validated forms
- 🧭 **react-router-dom** — routing; generated pages self-register
- 🔐 **AWS Amplify Gen 2** — optional Cognito auth scaffold
- 🚀 **Plop.js** — code generation

## Quick Start

```bash
npm install
npm run dev          # http://localhost:5173
npm run plop         # run a generator
```

Set the API base URL in `.env.local` (see `.env.example`):

```
VITE_API_URL=https://your-backend.com
```

## Generators

| Command | Creates |
|---|---|
| `npx plop Resource "<Name>"` | `src/features/<name>/` — Zod schema + wretch service + TanStack Query hooks + barrel |
| `npx plop Form "<Name>"` | `src/components/<Name>Form.tsx` — RHF + Zod |
| `npx plop Table "<Name>"` | `src/components/<Name>Table.tsx` — plain HTML table |
| `npx plop DataTable "<Name>"` | `src/components/<Name>DataTable.tsx` — TanStack Table (sort/filter/paginate) |
| `npx plop Page "<Name>"` | `src/pages/<Name>Page.tsx` + registers a route + nav link in `src/App.tsx` |
| `npx plop Feature "<Name>"` | Resource + Form + Page + a table (prompts: DataTable / Table / None). With a table it also generates a `<Name>Manager` wiring full CRUD (New/Edit via modal, inline Delete with confirm) and the page renders it. |
| `npx plop Auth` | Amplify Gen 2 Cognito auth scaffold (run early — see below) |

### After running a generator

1. **Read** the generated file(s) and find the `[AI GUARDRAIL DIRECTIVE]` header.
2. Edit **only** inside the `AI GENERATION ZONE` markers.
3. **Do not** rename exports, change hook/method signatures, alter query keys, or swap the `api` client — downstream files depend on them.

## Routing

`react-router-dom` powers routing (Vite has no file-based routing). The router lives in
`src/App.tsx`; `Page` and `Feature` register their route, import, and nav link via the
`PLOP_INJECT_*` markers — **don't remove those comment markers**.

## Auth (optional)

`npx plop Auth` scaffolds Amplify Gen 2 Cognito. It **force-replaces** `src/App.tsx`
(protected dashboard + `/login`), `src/main.tsx`, and `src/lib/api/index.ts`, so run it
**early**, before adding feature pages (those still inject cleanly afterward).

```bash
npx plop Auth
npm install
npm run sandbox      # wraps `ampx sandbox`; auto-syncs VITE_ Cognito vars to .env.local
npm run dev          # http://localhost:5173/login
```

## Project Structure

```
root/
├── stamps/                  # Handlebars templates the generators render
│   ├── api-service/         # schema.hbs · service.hbs · hook.hbs
│   ├── components/          # form.hbs · table.hbs · data-table.hbs · manager.hbs
│   ├── pages/               # page.hbs
│   └── auth/                # Amplify Gen 2 + login/useAuth/api-client
├── scripts/                 # sandbox.mjs · sync-amplify-env.mjs
├── src/
│   ├── features/            # generated feature modules
│   ├── components/          # generated components + ui/ class constants
│   ├── lib/
│   │   ├── api/             # wretch client
│   │   ├── tanstack-query/  # QueryClient provider
│   │   └── utils/cn.ts      # clsx + tailwind-merge
│   ├── App.tsx              # router shell (PLOP_INJECT_* markers)
│   └── main.tsx
├── plopfile.mjs
└── package.json
```

## Scripts

```bash
npm run dev          # start dev server (5173)
npm run build        # type-check + production build
npm run preview      # preview production build
npm run lint         # ESLint (zero warnings expected)
npm run plop         # run a generator
npm run sandbox      # ampx sandbox + auto env sync (after Auth)
npm run sync-env     # write VITE_ Cognito vars from amplify_outputs.json
```

## Documentation

- [SETUP_GUIDE.md](SETUP_GUIDE.md) — setup instructions
- [NAMING_CONVENTIONS.md](NAMING_CONVENTIONS.md) — naming rules
- [CLAUDE.md](CLAUDE.md) — scaffolding workflow & conventions for AI-assisted edits

## License

MIT
