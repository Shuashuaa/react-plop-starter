# ReactJS Starter — with Codegen

React 19 + Vite boilerplate with built-in code generation via Plop. Scaffold full feature modules (schema + service + hooks + UI + CRUD) with a single command, then fill only the marked `[AI GENERATION ZONE]` sections.

<p align="center">
  <img src="public/plop+react.gif" alt="Plop + React" />
</p>

The React counterpart of the Next.js Plop starter — same generators and AI-guardrail conventions, adapted for Vite + react-router-dom.

## Get Started
```
> npx @ecv-ph-tech-team/claude-init scaffold-frontend --name name-of-the-project
```

```
-------- You will see something like this - Select React.js --------

> npx @ecv-ph-tech-team/claude-init scaffold-frontend --name name-of-the-project

ECV Frontend Scaffold
Creates a new ECV frontend app from a GitLab boilerplate template.

? Choose a frontend template: » - Use arrow-keys. Return to submit.
>   React.js   (Vite + TypeScript + Tailwind)
    Next.js (TypeScript + Tailwind) SSR
    Vue.js  (Vite + TypeScript + Tailwind)
    Nuxt.js (TypeScript + Tailwind) SSR

--------------------------------------------------------------------
```
```
// cd to project
> cd name-of-the-project

// to get the latest claude skills for frontend
> npx @ecv-ph-tech-team/claude-init@latest
```

## Start generating
```
npm run plop "<Name>"
```

## What each generator creates

Run `npm run plop` (pick interactively) or `npx plop <Generator> "<Name>"`. Example name `Product`:

| Command | Files created |
|---|---|
| `npx plop Resource "Product"` | `src/features/product/product.schema.ts`<br>`src/features/product/product.service.ts`<br>`src/features/product/useProduct.ts`<br>`src/features/product/index.ts` |
| `npx plop Form "Product"` | `src/components/ProductForm.tsx` |
| `npx plop Table "Product"` | `src/components/ProductTable.tsx` |
| `npx plop DataTable "Product"` | `src/components/ProductDataTable.tsx` |
| `npx plop Page "Product"` | `src/pages/ProductPage.tsx` — also registers a route + nav link in `src/App.tsx` |
| `npx plop Feature "Product"` | all of `Resource` + `src/components/ProductForm.tsx` + chosen table (`ProductDataTable.tsx` / `ProductTable.tsx`) + `src/components/ProductManager.tsx` (CRUD wrapper) + `src/pages/ProductPage.tsx` |
| `npx plop Auth` | `amplify/backend.ts`, `amplify/auth/resource.ts`, `amplify/package.json`, `amplify/tsconfig.json`, `amplify_outputs.ts`, `src/hooks/useAuth.ts`, `src/pages/LoginPage.tsx` — also force-replaces `src/App.tsx`, `src/main.tsx`, `src/lib/api/index.ts`, runs `npm run sandbox` |

`Feature` prompts for table kind (DataTable / Table / None). With **None**, no table or Manager — page renders a placeholder.

## Stack

| Layer | Tech |
|---|---|
| Framework | Vite + React 19 + TypeScript |
| Routing | react-router-dom (generated pages self-register) |
| Data fetching | TanStack Query v5 + Wretch |
| Tables | TanStack Table v8 |
| Forms | React Hook Form + Zod |
| Styling | Tailwind CSS v4 (`@tailwindcss/postcss`, no config file) |
| Codegen | Plop + Handlebars |
| Auth | AWS Amplify Gen 2 + Cognito (opt-in via `Auth` generator) |

## Layout

Source lives under **`src/`**. Path alias `@/*` → `./src/*`. Feature/UI code: `src/features/`, `src/components/`, `src/lib/`, `src/pages/`, `src/hooks/`.

---

## Setup

```bash
# 1. Install dependencies
npm install

# 2. Set environment variables
cp .env.example .env.local
# Edit .env.local → VITE_API_URL=https://your-backend.com
# (Cognito vars are auto-filled by the Auth generator — leave them for now)

# 3. Start dev server
npm run dev          # http://localhost:5173
```

---

## Code Generation (Plop)

Run a generator by name with the resource name as an argument:

```bash
npx plop Resource  "<Name>"
npx plop Form      "<Name>"
npx plop Table     "<Name>"
npx plop DataTable "<Name>"
npx plop Page      "<Name>"
npx plop Feature   "<Name>"
npx plop Auth
```

Or run `npm run plop` with no args to pick interactively.

| Generator | Creates |
|---|---|
| `Resource` | `src/features/<name>/` — schema + service + hooks + barrel index |
| `Form` | `src/components/<Name>Form.tsx` |
| `Table` | `src/components/<Name>Table.tsx` — plain HTML table |
| `DataTable` | `src/components/<Name>DataTable.tsx` — TanStack Table, sort/filter/paginate |
| `Page` | `src/pages/<Name>Page.tsx` + route + nav link in `src/App.tsx` |
| `Feature` | All of the Above |
| `Auth` | Amplify Gen 2 backend + Cognito frontend scaffold |

### After running a generator

1. **Read** the generated file(s).
2. Find the `[AI GUARDRAIL DIRECTIVE]` header — it lists what is locked.
3. Edit **only** inside the `AI GENERATION ZONE` markers.
4. **Do not** rename exports, change method/hook signatures, alter query keys, or swap the `api` client — downstream files depend on them.

The boilerplate is the contract. Stay inside the zone.

### Example: scaffold a full feature

```bash
npx plop Feature "Product"
# > Which table component?  DataTable | Table | None
```

Output in `src/features/product/`:

```
src/features/product/
├── product.schema.ts     # Zod types (ProductSchema, ProductPayload, etc.)
├── product.service.ts    # Wretch API calls (getProduct, listProducts, createProduct, ...)
├── useProduct.ts         # TanStack Query hooks
└── index.ts              # Barrel exports
```

Plus `src/components/ProductForm.tsx`, a table (`ProductDataTable` or `ProductTable`), a `ProductManager.tsx` CRUD wrapper, and `src/pages/ProductPage.tsx`.

- **DataTable / Table** → also generates a `<Name>Manager` component wiring full CRUD: New/Edit via the shared form in a modal, inline Delete with a confirm modal. The page renders the Manager.
- **None** → the page renders a placeholder.

### Generated hooks (`useProduct.ts`)

```ts
useProduct(id)          // GET /products/:id
useProducts()           // GET /products
useCreateProduct()      // POST /products  → invalidates list
useUpdateProduct()      // PUT/PATCH /products/:id → invalidates detail + list
useDeleteProduct()      // DELETE /products/:id → invalidates list
```

All mutations auto-invalidate related queries on success.

### `Auth` generator — Amplify Gen 2 + Cognito

```bash
npx plop Auth
# > Cognito — email + password
```

Scaffolds the **Amplify Gen 2 backend** and the **frontend auth layer**:

| File | Description |
|---|---|
| `amplify/backend.ts` | Gen 2 backend definition (consumed by `ampx sandbox`) |
| `amplify/auth/resource.ts` | Cognito auth resource (email + password) |
| `amplify/package.json`, `amplify/tsconfig.json` | Backend workspace config |
| `amplify_outputs.ts` | Env-backed Amplify config (no credentials in source) |
| `src/hooks/useAuth.ts` | `useAuthGuard(required)` — protects routes client-side |
| `src/pages/LoginPage.tsx` | Login + Signup + Email confirmation flow |

**Generator also automatically:**
- **Force-replaces** `src/App.tsx` (protected dashboard + `/login` route), `src/main.tsx`, and `src/lib/api/index.ts`
- Swaps the api client auth middleware to Amplify `fetchAuthSession`
- Runs `npm run sandbox` — wraps `ampx sandbox` and auto-syncs `.env.local` on each deploy

Run `Auth` **early**, before adding feature pages — `Page`/`Feature` still inject cleanly afterward via the `PLOP_INJECT_*` markers.

**Re-running:** Generator detects existing auth files and aborts with a list. Delete the listed files to re-scaffold.

---

## Project Structure

```
root/
├── stamps/                  # Plop Handlebars templates
│   ├── api-service/         # schema.hbs · service.hbs · hook.hbs
│   ├── components/          # form.hbs · table.hbs · data-table.hbs · manager.hbs
│   ├── pages/               # page.hbs
│   └── auth/                # Amplify Gen 2 + login / useAuth / api-client
├── scripts/
│   ├── sandbox.mjs          # Wraps `ampx sandbox`, auto-syncs env on deploy
│   └── sync-amplify-env.mjs # Upserts Cognito vars into .env.local
├── src/
│   ├── features/            # generated feature modules
│   ├── components/
│   │   ├── ui/index.ts      # Shared Tailwind class constants
│   │   └── *Form / *Table / *Manager   (generated)
│   ├── lib/
│   │   ├── api/             # Wretch HTTP client
│   │   ├── tanstack-query/  # QueryClient provider
│   │   └── utils/cn.ts      # clsx + tailwind-merge
│   ├── hooks/               # useAuth added by Auth generator
│   ├── pages/               # generated pages
│   ├── App.tsx              # router shell (PLOP_INJECT_* markers)
│   └── main.tsx
├── amplify/                 # Amplify Gen 2 backend (added by Auth generator)
├── plopfile.mjs
└── package.json
```

---

## Routing

`react-router-dom` powers routing (Vite has no file-based routing). The router shell lives in `src/App.tsx`; `Page` and `Feature` register their route, import, and nav link via the `PLOP_INJECT_IMPORT` / `PLOP_INJECT_ROUTE` / `PLOP_INJECT_LINK` comment markers — **don't remove those markers**.

---

## Authentication

Not bundled by default. Run `npx plop Auth` to scaffold Amplify Gen 2 + Cognito. Once scaffolded:

- `useAuthGuard(true)` — protected route, redirects to `/login` if unauthenticated
- `useAuthGuard(false)` — public route, redirects to `/` if already signed in
- Login page handles sign-in, sign-up, and email confirmation flows
- `npm run sandbox` deploys the backend and keeps `.env.local` Cognito vars in sync

```bash
npx plop Auth
npm install
npm run sandbox      # wraps `ampx sandbox`; auto-syncs VITE_ Cognito vars to .env.local
npm run dev          # http://localhost:5173/login
```

---

## API Client

Wretch instance pre-configured with:
- Base URL from `VITE_API_URL`
- Query string addon
- Auth middleware (Bearer token from `localStorage` by default; `Auth` generator swaps it to Amplify `fetchAuthSession`)
- 401 logout handler

```ts
import api from '@/lib/api'

const data = await api.get('/products').json()
```

---

## Design System

Shared Tailwind class strings exported from `src/components/ui/index.ts`:

```ts
import { inputClass, labelClass, buttonClass } from '@/components/ui'
```

Tailwind v4 — declare custom tokens via `@theme` in `src/index.css` (no `tailwind.config.*`).

---

## Scripts

```bash
npm run dev        # Dev server with React Query DevTools (5173)
npm run build      # Type-check + production build
npm run preview    # Preview production build
npm run plop       # Scaffold interactively (or: npx plop <Generator> "<Name>")
npm run lint       # ESLint
npm run sandbox    # ampx sandbox + auto-sync .env.local on deploy
npm run sync-env   # Upsert Cognito vars from amplify_outputs.json into .env.local
```

---

## Documentation

- [SETUP_GUIDE.md](SETUP_GUIDE.md) — setup instructions
- [NAMING_CONVENTIONS.md](NAMING_CONVENTIONS.md) — naming rules
- [CLAUDE.md](CLAUDE.md) — scaffolding workflow & conventions for AI-assisted edits

## License

MIT
