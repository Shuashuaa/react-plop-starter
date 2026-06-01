# CLAUDE.md

The React + Vite counterpart of the Next.js Plop starter. Same scaffolding
conventions and AI guardrails, adapted for Vite + react-router-dom.

## Layout

Source lives under **`src/`**. Path alias `@/*` → `./src/*`.
Feature/UI code: `src/features/`, `src/components/`, `src/lib/`, `src/pages/`, `src/hooks/`.

## Scaffolding workflow (Plop)

This repo scaffolds code with Plop. **Generate structure first, then fill logic — never write a feature file from scratch.**

Generators (`plopfile.mjs`, templates in `stamps/`):

| Command | Creates |
|---|---|
| `npx plop Resource "<Name>"` | `src/features/<name>/` — Zod schema + wretch service + TanStack Query hooks + index |
| `npx plop Form "<Name>"` | `src/components/<Name>Form.tsx` |
| `npx plop Table "<Name>"` | `src/components/<Name>Table.tsx` — AntD Table, simple display |
| `npx plop DataTable "<Name>"` | `src/components/<Name>DataTable.tsx` — AntD Table, sort/filter/paginate |
| `npx plop Page "<Name>"` | `src/pages/<Name>Page.tsx` + registers route + nav link in `src/App.tsx` |
| `npx plop Feature "<Name>"` | Resource + Form + Page + a table — prompts for table kind: DataTable (default), Table, or None. When a table is chosen it also generates a `<Name>Manager` wiring full CRUD (New/Edit via the shared form in a modal, inline Delete with a confirm modal); the page renders the Manager. With None, the page renders a placeholder. |
| `npx plop Auth` | Amplify Gen 2 Cognito auth scaffold |

### After running a generator

1. **Read** the generated file(s).
2. Find the `[AI GUARDRAIL DIRECTIVE]` header — it lists what is locked.
3. Edit **only** inside the `AI GENERATION ZONE` markers, doing each `@AI_TASK`.
4. **Do not** rename exports, change method/hook signatures, alter query keys, swap the `api` client, or refactor imports — downstream files depend on them.

The boilerplate is the contract. Stay inside the zone.

## Data fetching

**TanStack Query v5** for server state (no SWR, no Redux/Zustand). Services use the shared
wretch `api` client in `src/lib/api/`; hooks wrap service methods in `useQuery`/`useMutation`
with consistent query keys (`[resource]` / `[resource, id]`). Client state → React Context.

## Routing

`react-router-dom`. The router shell is `src/App.tsx`. `Page`/`Feature` inject their route,
import, and nav link via the `PLOP_INJECT_IMPORT` / `PLOP_INJECT_ROUTE` / `PLOP_INJECT_LINK`
comment markers — **never remove the markers**.

## Auth

`npx plop Auth` scaffolds Amplify Gen 2 Cognito. It **force-replaces** `src/App.tsx`,
`src/main.tsx`, and `src/lib/api/index.ts` — run it **before** adding feature pages.
Cognito env vars are `VITE_*` (synced into `.env.local` by `npm run sync-env`).

## UI: Ant Design + Tailwind

**Ant Design v6 is the primary UI framework; Tailwind v4 handles layout.**

- **Components** (buttons, inputs, tables, modals, typography, alerts) come from `antd`. Don't hand-roll what AntD provides.
- **Tailwind** is for layout/spacing only (`flex`, `gap`, `grid`, margins, `max-w-*`). Use it as the escape hatch, not for component styling.
- **Theme** lives in `src/lib/antd/theme.ts` (brand `colorPrimary` + radius), applied via `<ConfigProvider>` in `src/main.tsx`. Retheme there, not with inline styles.
- **Forms** keep the React Hook Form + Zod contract. AntD inputs are wired through RHF `<Controller>`; `<Form>` is layout-only (`component={false}`, no `name` on `Form.Item`). Do **not** switch to AntD's own form data collection.
- **`<App className="contents">`** wraps the tree so `App.useApp()` (message / modal / notification static APIs) works while staying layout-transparent.

### Tailwind v4

No `tailwind.config.*`. Declare custom tokens via `@theme` in `src/index.css` when needed.

## Env (Vite)

Client env vars must be prefixed `VITE_` and read via `import.meta.env.VITE_*`
(never `process.env.*`). `VITE_API_URL` is the JSON API base URL.
