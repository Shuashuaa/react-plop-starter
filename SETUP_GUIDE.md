# Step-by-Step Guide: Creating a User Feature from Scratch

This guide shows you how to create a complete feature using JSONPlaceholder's Users API, starting from an empty project with only `stamps/*` and `plopfile.mjs`.

## Prerequisites

- Node.js installed
- Project initialized with the plop templates in `stamps/` folder
- `plopfile.mjs` configured

## Step 1: Install Dependencies

```bash
npm install
```

Make sure you have these key dependencies:
- `wretch` - HTTP client
- `@tanstack/react-query` - Data fetching hooks
- `zod` - Schema validation
- `react-router-dom` - Routing
- `plop` - Code generator
- `inflection` - Pluralization helper

## Step 2: Point the API client at JSONPlaceholder

The shared client already lives at `src/lib/api/index.ts` (wretch + config guard + auth +
401 logout). It reads its base URL from `VITE_API_URL`. Set it in `.env.local`:

```
VITE_API_URL=https://jsonplaceholder.typicode.com
```

Restart `npm run dev` after editing `.env.local`. The `TanstackQueryProvider` is already
mounted in `src/main.tsx`, so query hooks work out of the box.

## Step 3: Generate the User Feature with Plop

Run the plop generator:

```bash
npm run plop
```

When prompted:
- **Resource name**: Enter `User`

This automatically creates:
- `src/features/user/user.schema.ts` - Zod schemas
- `src/features/user/user.service.ts` - API service methods
- `src/features/user/useUser.ts` - TanStack Query hooks
- `src/features/user/index.ts` - Barrel exports

> Tip: `npx plop Feature "User"` does all of the below in one shot — schema + service +
> hooks + form + table + a CRUD `Manager` + a routed page. The steps below show the
> pieces individually.

## Step 4: Customize the User Schema

Edit `src/features/user/user.schema.ts` to match JSONPlaceholder's user structure:

```typescript
import { z } from "zod";

const AddressSchema = z.object({
  street: z.string(),
  suite: z.string(),
  city: z.string(),
  zipcode: z.string(),
  geo: z.object({
    lat: z.string(),
    lng: z.string(),
  }),
});

const CompanySchema = z.object({
  name: z.string(),
  catchPhrase: z.string(),
  bs: z.string(),
});

export const UserSchema = z.object({
  id: z.number(),
  name: z.string(),
  username: z.string(),
  email: z.string().email(),
  address: AddressSchema,
  phone: z.string(),
  website: z.string(),
  company: CompanySchema,
});

export type User = z.infer<typeof UserSchema>;

export const CreateUserSchema = UserSchema.omit({ 
  id: true,
});

export type CreateUserInput = z.infer<typeof CreateUserSchema>;

export const UpdateUserSchema = CreateUserSchema.partial();

export type UpdateUserInput = z.infer<typeof UpdateUserSchema>;
```

## Step 5: Verify the Generated Service

The generated `src/features/user/user.service.ts` should already work with JSONPlaceholder:

The service imports the shared client from `@/lib/api` and carries an
`[AI GUARDRAIL DIRECTIVE]` header plus an `AI GENERATION ZONE (wiring)` block where the
`ROUTES`, `UPDATE_METHOD`, and `unwrapItem`/`unwrapList` defaults are edited to match the
real backend. Its `ROUTES` default to the ECV convention (`/users/get/:id`, `/users/insert`,
…). For the plain JSONPlaceholder REST shape, adjust the wiring zone to:

```typescript
import { api } from "@/lib/api";
// ...
const ROUTES = {
  list: "/users",
  getById: (id: string) => `/users/${id}`,
  create: "/users",
  update: (id: string) => `/users/${id}`,
  delete: (id: string) => `/users/${id}`,
};

const UPDATE_METHOD = "patch" as "put" | "patch";

// JSONPlaceholder returns the object/array directly — no envelope to unwrap.
const unwrapItem = (data: unknown): unknown => data;
const unwrapList = (data: unknown): unknown => data;
```

Leave the CRUD method bodies below the wiring zone unchanged.

## Step 6: Verify the Generated Hooks

The generated `src/features/user/useUser.ts` provides these hooks:

```typescript
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { userService } from "./user.service";

// Hook for a single user
export const useUser = (id: string | null) => {
  return useQuery({
    queryKey: ["user", id],
    queryFn: () => userService.getById(id!),
    enabled: !!id,
  });
};

// Hook for the full list
export const useUsers = () => {
  return useQuery({
    queryKey: ["users"],
    queryFn: () => userService.getAll(),
  });
};
```

Available hooks (all generated):
- `useUser(id)` - Fetch single user
- `useUsers()` - Fetch all users
- `useCreateUser()` - Create mutation (invalidates `["users"]`)
- `useUpdateUser()` - Update mutation, called as `mutate({ id, payload })`
- `useDeleteUser()` - Delete mutation, called as `mutate(id)`

## Step 7: Create a Component to Display Users

Create `src/components/UserList.tsx`:

```typescript
import { useUsers } from "@/features/user";

export const UserList = () => {
  const { data: users, error, isLoading } = useUsers();

  if (isLoading) return <div>📡 Loading users...</div>;
  if (error) return <div>❌ Error: {error.message}</div>;

  return (
    <div style={{ padding: "20px" }}>
      <h2>User Directory</h2>
      <table border={1} style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ backgroundColor: "#f0f0f0" }}>
            <th style={{ padding: "8px" }}>ID</th>
            <th style={{ padding: "8px" }}>Name</th>
            <th style={{ padding: "8px" }}>Email</th>
            <th style={{ padding: "8px" }}>Website</th>
          </tr>
        </thead>
        <tbody>
          {users?.map((user) => (
            <tr key={user.id}>
              <td style={{ padding: "8px", textAlign: "center" }}>{user.id}</td>
              <td style={{ padding: "8px" }}>{user.name}</td>
              <td style={{ padding: "8px" }}>{user.email}</td>
              <td style={{ padding: "8px" }}>{user.website}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
```

## Step 8: Register a route

Don't hand-edit the router by adding components manually. Generate a page — it registers its
own route and nav link in `src/App.tsx` via the `PLOP_INJECT_*` markers:

```bash
npx plop Page "User"     # creates src/pages/UserPage.tsx, wires /user
```

Or skip Steps 3–8 entirely with `npx plop Feature "User"`, which generates the schema,
service, hooks, form, a table, a CRUD `Manager`, and the routed page in one shot. Render your
`UserList` (or the generated table) inside the page's `AI GENERATION ZONE`.

## Step 9: Run the Development Server

```bash
npm run dev
```

Open your browser to `http://localhost:5173` (or the port shown in terminal).

You should see a table displaying 10 users from JSONPlaceholder!

## What You Get

Your generated feature includes:

✅ Type-safe API calls with Zod validation  
✅ Automatic data fetching with TanStack Query  
✅ CRUD operations (Create, Read, Update, Delete)  
✅ Optimistic updates and cache management  
✅ Error handling and loading states  
✅ Pluralized API endpoints automatically  

## Bonus: Using Individual User Hook

To fetch a single user:

```typescript
import { useUser } from "@/features/user";

export const UserDetail = ({ userId }: { userId: string }) => {
  const { data: user, error, isLoading } = useUser(userId);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!user) return <div>User not found</div>;

  return (
    <div>
      <h2>{user.name}</h2>
      <p>Email: {user.email}</p>
      <p>Phone: {user.phone}</p>
      <p>Company: {user.company.name}</p>
    </div>
  );
};
```

## Summary

1. Install dependencies
2. Set `VITE_API_URL` in `.env.local`
3. Run `npm run plop` and enter "User" (or use `Feature` for the whole stack)
4. Customize the schema and the service wiring zone to match the API
5. Generate a page (`npx plop Page "User"`) — it registers its own route
6. Run `npm run dev`

That's it! The plop generator handles all the boilerplate, and you just wire up the UI.
