# Naming Convention Rules (Plop Helpers)

When you run `npm run plop` and enter "user", here's how the naming transforms:

## Input: "User"

| What | Template Code | Output | Where It's Used |
|------|---------------|--------|-----------------|
| Type name | `{{pascalCase name}}` | `User` | `type User = ...` |
| Schema name | `{{pascalCase name}}Schema` | `UserSchema` | `export const UserSchema = z.object(...)` |
| Service object | `{{camelCase name}}Service` | `userService` | `export const userService = { ... }` |
| Hook name (single) | `use{{pascalCase name}}` | `useUser` | `export const useUser = (id) => ...` |
| Hook name (list) | `use{{pluralize (pascalCase name)}}` | `useUsers` | `export const useUsers = () => ...` |
| Folder name | `features/{{camelCase name}}/` | `features/user/` | Directory structure |
| File name (schema) | `{{camelCase name}}.schema.ts` | `user.schema.ts` | Schema file |
| File name (service) | `{{camelCase name}}.service.ts` | `user.service.ts` | Service file |
| File name (hook) | `use{{pascalCase name}}.ts` | `useUser.ts` | Hook file |
| API endpoint (single) | `/{{pluralize (kebabCase name)}}/:id` | `/users/123` | GET single user |
| API endpoint (list) | `/{{pluralize (kebabCase name)}}` | `/users` | GET all users |
| Query key (single) | `["{{kebabCase name}}", id]` | `["user", "123"]` | TanStack Query key for single item |
| Query key (list) | `["{{pluralize (kebabCase name)}}"]` | `["users"]` | TanStack Query key for list |

## Helper Functions

| Helper | Input | Output |
|--------|-------|--------|
| `pascalCase` | `user` | `User` |
| `camelCase` | `user` | `user` |
| `kebabCase` | `user` | `user` |
| `pluralize` | `user` | `users` |

## Real-World Examples

### 1. React Component (PascalCase)

```tsx
// Component name uses PascalCase
export const UserProfile = () => {
  const { data: user } = useUser("123");
  
  return (
    <div>
      <h1>{user?.name}</h1>
    </div>
  );
};
```

**Why PascalCase?** React components must start with a capital letter to distinguish them from HTML elements.

### 2. Service File (camelCase)

```typescript
// Service object uses camelCase
export const userService = {
  getById: async (id: string): Promise<User> => {
    const data = await api.url(`/users/${id}`).get().json();
    return UserSchema.parse(data);
  },
  
  getAll: async (): Promise<User[]> => {
    const data = await api.url("/users").get().json();
    return z.array(UserSchema).parse(data);
  }
};
```

**Why camelCase?** JavaScript/TypeScript convention for variables and object names.

### 3. TanStack Query Keys (kebab-case)

```typescript
// Query keys use kebab-case for consistency and readability
export const useUser = (id: string | null) => {
  return useQuery({
    queryKey: ["user", id],          // ✅ kebab-case: "user"
    queryFn: () => userService.getById(id!),
    enabled: !!id,
  });
};

export const useUsers = () => {
  return useQuery({
    queryKey: ["users"],             // ✅ kebab-case plural: "users"
    queryFn: () => userService.getAll(),
  });
};
```

**Why this key shape?**
- **Consistency**: Matches URL patterns (`/users`, `/user-profiles`).
- **Invalidation**: `["users"]` for the list, `["user", id]` for an item — mutations
  invalidate the exact keys they affect (see the generated `use<Name>.ts` hooks).
- **Readability**: Easy to read in the React Query Devtools.
