# API Integration Guide

Everything a backend developer needs to implement, and everything a frontend developer needs to configure, so the generated code works end-to-end.

---

## 1. What the generator creates

Running `npm run plop` → **Resource** with name `User` and fields `name, email` produces:

```
src/features/user/
├── user.schema.ts       # Zod schemas + inferred TypeScript types
├── user.service.ts      # HTTP calls via Wretch (CRUD + paginated)
├── useUser.ts           # TanStack Query hooks
└── index.ts             # Barrel export
```

The service and hooks are ready — you only need to satisfy the API contract below and configure the base URL.

---

## 2. Configure the base URL

### Step 1 — copy the env template
```bash
cp .env.example .env
```

### Step 2 — set your API base URL
```env
# .env
VITE_API_BASE_URL=https://your-api.com
```

The shared Wretch client in `src/services/api.ts` reads this automatically. All generated services use it.

---

## 3. Required API contract

For a resource named `User`, the backend must expose these endpoints:

| Operation      | Method   | Path             | Request Body          | Success Response              |
|----------------|----------|------------------|-----------------------|-------------------------------|
| List all       | `GET`    | `/users`         | —                     | `User[]`                      |
| Get one        | `GET`    | `/users/:id`     | —                     | `User`                        |
| Create         | `POST`   | `/users`         | `CreateUserInput`     | `User`                        |
| Update         | `PATCH`  | `/users/:id`     | `UpdateUserInput`     | `User`                        |
| Delete         | `DELETE` | `/users/:id`     | —                     | `204 No Content`              |
| Paginated list | `GET`    | `/users?cursor=` | —                     | `{ items: User[], nextCursor?: string }` |

### Expected `User` shape
The response object must match the generated schema in `user.schema.ts`. Example:

```json
{
  "id": "abc-123",
  "name": "Jane Doe",
  "email": "jane@example.com",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

> `createdAt` and `updatedAt` are optional in the schema — the API can omit them if not needed.

---

## 4. DynamoDB pagination

The `useInfiniteUsers()` hook uses cursor-based pagination. Your Lambda must return:

```json
{
  "items": [ ...array of User objects... ],
  "nextCursor": "eyJpZCI6ImFiYy0xMjMifQ=="
}
```

Map DynamoDB's `LastEvaluatedKey` → `nextCursor` (base64-encode it server-side for URL safety). When there are no more pages, omit `nextCursor` entirely.

The service passes `?cursor=<value>` on subsequent page requests. Your Lambda reads it, decodes it, and passes it as `ExclusiveStartKey` to DynamoDB.

### Example Lambda handler (Node.js)

```ts
import { DynamoDBClient, QueryCommand } from "@aws-sdk/client-dynamodb";

const client = new DynamoDBClient({});

export const handler = async (event) => {
  const cursor = event.queryStringParameters?.cursor;

  const result = await client.send(new QueryCommand({
    TableName: "Users",
    ExclusiveStartKey: cursor
      ? JSON.parse(Buffer.from(cursor, "base64").toString())
      : undefined,
    Limit: 20,
  }));

  return {
    statusCode: 200,
    body: JSON.stringify({
      items: result.Items,
      nextCursor: result.LastEvaluatedKey
        ? Buffer.from(JSON.stringify(result.LastEvaluatedKey)).toString("base64")
        : undefined,
    }),
  };
};
```

---

## 5. Customize endpoints

If your paths differ from the default (`/users`, `/users/:id`), edit the generated service directly.

### Custom prefix
```ts
// src/features/user/user.service.ts
getAll: async () => {
  const data = await api.url('/api/v1/users').get().json();  // ← change path
  return z.array(UserSchema).parse(data);
}
```

### Tenant-scoped endpoints
```ts
getAll: async (tenantId: string) => {
  const data = await api.url(`/tenants/${tenantId}/users`).get().json();
  return z.array(UserSchema).parse(data);
}
```

### Non-REST response wrapper
If your API wraps responses in `{ data: ..., success: true }`:

```ts
getAll: async () => {
  const res = await api.url('/users').get().json<{ data: unknown }>();
  return z.array(UserSchema).parse(res.data);  // unwrap before parsing
}
```

---

## 6. Update the schema

The generated schema is a starting point. Adjust validators to match your actual data:

```ts
// Generated default
name: z.string().min(1),
email: z.string().email(),

// Common adjustments
name: z.string().min(1).max(100),        // add max length
email: z.string().email().nullable(),    // API can return null
age: z.number().int().positive(),        // constrain number fields
role: z.enum(["admin", "user"]),         // known string union
tags: z.array(z.string()).default([]),   // array field with default
```

---

## 7. Authentication

The auth middleware in `src/services/api.ts` is pre-written but commented out. To enable it:

1. Uncomment the `.middlewares([...])` block
2. Replace `localStorage.getItem("token")` with your token retrieval logic

```ts
// src/services/api.ts
export const api = wretch(import.meta.env.VITE_API_BASE_URL)
  .addon(QueryStringAddon)
  .middlewares([
    (next) => (url, opts) => {
      const token = localStorage.getItem("token"); // ← swap for your auth
      return next(url, {
        ...opts,
        headers: { ...opts.headers, ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      });
    },
  ]);
```

---

## 8. Using the hooks

```tsx
import { useUsers, useCreateUser, useUpdateUser, useDeleteUser } from "@/features/user";

// List
const { data: users, isLoading } = useUsers();

// Create
const { mutate: createUser, isPending } = useCreateUser();
createUser({ name: "Jane", email: "jane@example.com" });

// Update
const { mutate: updateUser } = useUpdateUser();
updateUser({ id: "abc-123", payload: { name: "Jane Doe" } });

// Delete
const { mutate: deleteUser } = useDeleteUser();
deleteUser("abc-123");

// Paginated (DynamoDB)
const { data, fetchNextPage, hasNextPage } = useInfiniteUsers();
const allUsers = data?.pages.flatMap((p) => p.items) ?? [];
```

---

## 9. Test your endpoints

Run `npm run dev` and open the **API Tester** tab. Enter your base URL and test each endpoint before wiring up components. See that all CRUD operations return the expected shape — Zod will surface any mismatch at runtime.
