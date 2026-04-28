<h1 align="center">React + Plop Code Generator</h1>

<p align="center">
  <img src="public/plop+react.gif" alt="Plop + React" />
</p>

A React 19 + TypeScript + Vite starter with Plop.js code generation. One command scaffolds a complete, type-safe CRUD feature — schema, service, hooks, table, form, and page — wired to your AWS Lambda + DynamoDB backend.

## Features

- ⚡ **Vite** — Lightning-fast dev server and builds
- ⚛️ **React 19** — Latest React
- 📘 **TypeScript** — Strict mode, path aliases
- 🎨 **Tailwind CSS 4** — Utility-first styling
- 🔄 **TanStack Query** — Data fetching, mutations, infinite scroll
- 📊 **TanStack Table** — Headless, type-safe tables
- 🌐 **Wretch** — Lightweight HTTP client
- ✅ **Zod** — Runtime schema validation on every API response
- 🎯 **React Hook Form** — Form state and validation
- 🚀 **Plop.js** — Code generation from Handlebars templates

## Quick Start

```bash
# Install dependencies
npm install

# Copy env template and set your API base URL
cp .env.example .env

# Start development server
npm run dev

# Generate code
npm run plop
```

## Generators

All generators ask for a **resource name** and **fields** (comma-separated). Field types and validators are inferred automatically from the field name — `price` → `z.number()`, `isActive` → `z.boolean()`, `email` → `z.string().email()`.

### 1. Resource
Scaffolds the full API layer: Zod schema, Wretch service, and TanStack Query hooks.

```bash
npm run plop
# › Resource
# › Product
# › name, price, description, isActive
```

Generates:
```
src/features/product/
├── product.schema.ts    # Zod schemas + TypeScript types
├── product.service.ts   # CRUD + paginated fetch (DynamoDB cursor)
├── useProduct.ts        # useQuery, useMutation, useInfiniteQuery hooks
└── index.ts             # Barrel export
```

Hooks included: `useProduct(id)` · `useProducts()` · `useInfiniteProducts()` · `useCreateProduct()` · `useUpdateProduct()` · `useDeleteProduct()`

### 2. Table
Creates a TanStack Table component with typed columns, loading/error states, and optional Edit/Delete action buttons.

```bash
npm run plop
# › Table
# › Product
# › name, price, isActive
```

Generates: `src/components/ProductTable.tsx`

The table accepts optional `onEdit` and `onDelete` props — pass them from the page to enable action buttons.

### 3. Form
Creates a React Hook Form + Zod form. Input types are inferred from field names (`password` → `type="password"`, `price` → `type="number"`, etc.).

```bash
npm run plop
# › Form
# › Product
# › name, price, description, isActive
```

Generates: `src/components/ProductForm.tsx`

### 4. Page
Scaffolds a full CRUD page wiring the table and form together — create toggle, inline edit form, delete with confirm dialog.

```bash
npm run plop
# › Page
# › Product
# › name   (field shown in the edit header)
```

Generates: `src/pages/ProductPage.tsx`

## Recommended workflow

```
plop → Resource   schema + service + hooks
plop → Table      data table with Edit/Delete
plop → Form       validated form
plop → Page       CRUD page wiring everything together
```

Then import the page into `App.tsx`:

```tsx
import { ProductPage } from '@/pages/ProductPage';

function App() {
  return <ProductPage />;
}
```

## Project Structure

```
├── stamps/
│   ├── api-service/
│   │   ├── hook.hbs        # TanStack Query hooks template
│   │   ├── schema.hbs      # Zod schema template
│   │   └── service.hbs     # Wretch service template
│   └── components/
│       ├── table.hbs       # TanStack Table component template
│       ├── form.hbs        # React Hook Form template
│       └── page.hbs        # Full CRUD page template
├── src/
│   ├── features/           # Generated API modules
│   ├── components/
│   │   └── ApiTester.tsx   # In-browser endpoint tester
│   ├── pages/              # Generated CRUD pages
│   ├── services/
│   │   └── api.ts          # Wretch client (reads VITE_API_BASE_URL)
│   └── App.tsx
├── plopfile.mjs            # Generator definitions + Handlebars helpers
├── .env.example            # Environment variable template
├── QUICKSTART.md           # Step-by-step CRUD app guide
├── INTEGRATION.md          # API contract + DynamoDB patterns
└── NAMING_CONVENTIONS.md   # Plop helper reference
```

## Environment

```env
# .env
VITE_API_BASE_URL=https://your-api-gateway-url.amazonaws.com/prod
```

The shared Wretch client reads this automatically. Falls back to JSONPlaceholder when unset so the demo runs without a backend.

## API Tester

The dev app includes a built-in endpoint tester. Run `npm run dev`, click **API Tester**, and verify each CRUD endpoint against your Lambda before wiring up components.

## Backend

This starter is built for **AWS Lambda + DynamoDB** backends (TypeScript or Python). The generated service expects:

| Operation | Method | Path | Response |
|---|---|---|---|
| List | `GET` | `/resource` | `Item[]` |
| Get one | `GET` | `/resource/:id` | `Item` |
| Paginated | `GET` | `/resource?cursor=` | `{ items: Item[], nextCursor?: string }` |
| Create | `POST` | `/resource` | `Item` |
| Update | `PATCH` | `/resource/:id` | `Item` |
| Delete | `DELETE` | `/resource/:id` | `204` |

See [INTEGRATION.md](INTEGRATION.md) for Lambda handler examples and DynamoDB pagination details.

## Tech Stack

| Layer | Library | Version |
|---|---|---|
| UI | React | 19 |
| Build | Vite | 7 |
| Language | TypeScript | 5.9 (strict) |
| Styling | Tailwind CSS | 4 |
| Data fetching | TanStack Query | 5 |
| Tables | TanStack Table | 8 |
| HTTP | Wretch | 3 |
| Validation | Zod | 4 |
| Forms | React Hook Form | 7 |
| Code generation | Plop.js | 4 |

## Scripts

```bash
npm run dev      # Start development server
npm run build    # Type-check + build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
npm run plop     # Run code generator
```

## Documentation

- [QUICKSTART.md](QUICKSTART.md) — End-to-end guide: from `npm install` to a working CRUD app
- [INTEGRATION.md](INTEGRATION.md) — API contract, DynamoDB patterns, auth, schema customization
- [NAMING_CONVENTIONS.md](NAMING_CONVENTIONS.md) — Plop helper reference (pascalCase, pluralize, etc.)

## License

MIT
