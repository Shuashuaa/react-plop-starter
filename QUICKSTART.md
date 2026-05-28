# Quick Start: Building a CRUD App

A complete walkthrough from zero to a working Create / Read / Update / Delete app.
Uses `Product` as the example resource throughout.

---

## Prerequisites

- Node.js 18+
- AWS Lambda functions behind API Gateway (TypeScript or Python)
  — or keep `VITE_API_BASE_URL` pointing to JSONPlaceholder while building the frontend first

---

## Step 1 — Install and start

```bash
npm install
npm run dev
```

Open `http://localhost:5173`. You should see the demo page with the **Demo / API Tester** nav.

---

## Step 2 — Configure the base URL

```bash
cp .env.example .env
```

Open `.env` and set your API:

```env
VITE_API_BASE_URL=http://localhost:3000
```

> If you are still building the backend, leave this pointing to JSONPlaceholder (`https://jsonplaceholder.typicode.com`).
> The ApiTester and demo will still work for reading data.

---

## Step 3 — Generate the resource

```bash
npm run plop
```

```
? Choose a generator  › Resource
? Resource name?      › Product
? Fields, comma-separated?  › name, price, description, isActive
```

**What gets created:**

```
src/features/product/
├── product.schema.ts   ← Zod schemas + TypeScript types
├── product.service.ts  ← HTTP methods (getAll, getById, getPage, create, update, delete)
├── useProduct.ts       ← TanStack Query hooks
└── index.ts            ← Barrel export (re-exports everything)
```

### What the schema looks like

```ts
// product.schema.ts (generated)
export const ProductSchema = z.object({
  id: z.string(),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
  name: z.string().min(1),
  price: z.number(),
  description: z.string().min(1),
  isActive: z.boolean(),
});
```

> Zod types are inferred from field names: `price` → `z.number()`, `isActive` → `z.boolean()`, `description` → `z.string()`.
> Adjust validators in `product.schema.ts` anytime to match your actual API.

### What the hooks look like

```ts
// Generated hooks in useProduct.ts
useProduct(id)              // fetch one by ID
useProducts()               // fetch full list
useInfiniteProducts()       // paginated fetch (DynamoDB cursor)
useCreateProduct()          // POST mutation
useUpdateProduct()          // PATCH mutation
useDeleteProduct()          // DELETE mutation
```

---

## Step 4 — Implement the backend API

Your API must expose these six endpoints for `Product`. Here are the exact shapes the service expects.

### 4a. Endpoint contract

| Method   | Path                   | Request Body              | Success Response                              |
|----------|------------------------|---------------------------|-----------------------------------------------|
| `GET`    | `/products`            | —                         | `Product[]`                                   |
| `GET`    | `/products/:id`        | —                         | `Product`                                     |
| `GET`    | `/products?cursor=`    | —                         | `{ items: Product[], nextCursor?: string }`   |
| `POST`   | `/products`            | `CreateProductInput`      | `Product`                                     |
| `PATCH`  | `/products/:id`        | `UpdateProductInput`      | `Product`                                     |
| `DELETE` | `/products/:id`        | —                         | `204 No Content`                              |

### 4b. Expected `Product` JSON shape

```json
{
  "id": "prod-abc123",
  "name": "Wireless Keyboard",
  "price": 49.99,
  "description": "Compact mechanical keyboard",
  "isActive": true,
  "createdAt": "2024-01-15T10:00:00.000Z",
  "updatedAt": "2024-01-15T10:00:00.000Z"
}
```

### 4c. AWS Lambda (DynamoDB) example

<details>
<summary>Click to expand Lambda handler</summary>

```ts
// handler.ts
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, ScanCommand, GetCommand, PutCommand, UpdateCommand, DeleteCommand } from "@aws-sdk/lib-dynamodb";
import { randomUUID } from "crypto";

const client = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const TABLE = "Products";

export const handler = async (event: AWSLambda.APIGatewayEvent) => {
  const method = event.httpMethod;
  const id = event.pathParameters?.id;

  // GET /products?cursor=xxx  (paginated)
  if (method === "GET" && !id && event.queryStringParameters?.cursor !== undefined) {
    const cursor = event.queryStringParameters.cursor;
    const result = await client.send(new ScanCommand({
      TableName: TABLE,
      Limit: 20,
      ExclusiveStartKey: cursor
        ? JSON.parse(Buffer.from(cursor, "base64").toString())
        : undefined,
    }));
    return ok({
      items: result.Items ?? [],
      nextCursor: result.LastEvaluatedKey
        ? Buffer.from(JSON.stringify(result.LastEvaluatedKey)).toString("base64")
        : undefined,
    });
  }

  // GET /products  (full list)
  if (method === "GET" && !id) {
    const result = await client.send(new ScanCommand({ TableName: TABLE }));
    return ok(result.Items ?? []);
  }

  // GET /products/:id
  if (method === "GET" && id) {
    const result = await client.send(new GetCommand({ TableName: TABLE, Key: { id } }));
    if (!result.Item) return notFound();
    return ok(result.Item);
  }

  // POST /products
  if (method === "POST") {
    const body = JSON.parse(event.body ?? "{}");
    const item = { ...body, id: randomUUID(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    await client.send(new PutCommand({ TableName: TABLE, Item: item }));
    return ok(item, 201);
  }

  // PATCH /products/:id
  if (method === "PATCH" && id) {
    const body = JSON.parse(event.body ?? "{}");
    const updates = Object.entries({ ...body, updatedAt: new Date().toISOString() });
    const result = await client.send(new UpdateCommand({
      TableName: TABLE,
      Key: { id },
      UpdateExpression: "SET " + updates.map((_, i) => `#k${i} = :v${i}`).join(", "),
      ExpressionAttributeNames: Object.fromEntries(updates.map(([k], i) => [`#k${i}`, k])),
      ExpressionAttributeValues: Object.fromEntries(updates.map(([, v], i) => [`:v${i}`, v])),
      ReturnValues: "ALL_NEW",
    }));
    return ok(result.Attributes);
  }

  // DELETE /products/:id
  if (method === "DELETE" && id) {
    await client.send(new DeleteCommand({ TableName: TABLE, Key: { id } }));
    return { statusCode: 204, body: "" };
  }

  return { statusCode: 405, body: "Method Not Allowed" };
};

const ok = (data: unknown, status = 200) => ({
  statusCode: status,
  headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
  body: JSON.stringify(data),
});
const notFound = () => ({ statusCode: 404, body: JSON.stringify({ message: "Not found" }) });
```

</details>

### 4d. Python Lambda example

<details>
<summary>Click to expand Python handler</summary>

```python
# handler.py
import json
import uuid
import boto3
from datetime import datetime, timezone
from boto3.dynamodb.conditions import Key

dynamodb = boto3.resource("dynamodb")
table = dynamodb.Table("Products")

def handler(event, context):
    method = event["httpMethod"]
    path_params = event.get("pathParameters") or {}
    item_id = path_params.get("id")
    query_params = event.get("queryStringParameters") or {}

    # GET /products?cursor=xxx  (paginated)
    if method == "GET" and not item_id and "cursor" in query_params:
        kwargs = {"Limit": 20}
        if query_params["cursor"]:
            import base64
            kwargs["ExclusiveStartKey"] = json.loads(
                base64.b64decode(query_params["cursor"]).decode()
            )
        result = table.scan(**kwargs)
        next_cursor = None
        if "LastEvaluatedKey" in result:
            import base64
            next_cursor = base64.b64encode(
                json.dumps(result["LastEvaluatedKey"]).encode()
            ).decode()
        return ok({"items": result["Items"], "nextCursor": next_cursor})

    # GET /products  (full list)
    if method == "GET" and not item_id:
        result = table.scan()
        return ok(result["Items"])

    # GET /products/:id
    if method == "GET" and item_id:
        result = table.get_item(Key={"id": item_id})
        item = result.get("Item")
        if not item:
            return not_found()
        return ok(item)

    # POST /products
    if method == "POST":
        body = json.loads(event.get("body") or "{}")
        now = datetime.now(timezone.utc).isoformat()
        item = {**body, "id": str(uuid.uuid4()), "createdAt": now, "updatedAt": now}
        table.put_item(Item=item)
        return ok(item, 201)

    # PATCH /products/:id
    if method == "PATCH" and item_id:
        body = json.loads(event.get("body") or "{}")
        body["updatedAt"] = datetime.now(timezone.utc).isoformat()
        updates = list(body.items())
        result = table.update_item(
            Key={"id": item_id},
            UpdateExpression="SET " + ", ".join(f"#k{i} = :v{i}" for i, _ in enumerate(updates)),
            ExpressionAttributeNames={f"#k{i}": k for i, (k, _) in enumerate(updates)},
            ExpressionAttributeValues={f":v{i}": v for i, (_, v) in enumerate(updates)},
            ReturnValues="ALL_NEW",
        )
        return ok(result["Attributes"])

    # DELETE /products/:id
    if method == "DELETE" and item_id:
        table.delete_item(Key={"id": item_id})
        return {"statusCode": 204, "body": ""}

    return {"statusCode": 405, "body": "Method Not Allowed"}


def ok(data, status=200):
    return {
        "statusCode": status,
        "headers": {"Content-Type": "application/json", "Access-Control-Allow-Origin": "*"},
        "body": json.dumps(data, default=str),
    }

def not_found():
    return {"statusCode": 404, "body": json.dumps({"message": "Not found"})}
```

</details>

---

## Step 5 — Test your endpoints with ApiTester

1. Run `npm run dev`
2. Click **API Tester** in the nav
3. Make sure **Base URL** shows your API URL
4. Test each operation in order:

| Click         | Set path to         | Check                                    |
|---------------|---------------------|------------------------------------------|
| GET quick test | `/products`        | Returns array (even if empty `[]`)       |
| POST          | `/products`         | Body: `{"name":"Test","price":9.99,"description":"desc","isActive":true}` → returns created object with `id` |
| GET           | `/products/<id>`    | Returns the created product              |
| PATCH         | `/products/<id>`    | Body: `{"price":14.99}` → returns updated product |
| GET           | `/products`         | Shows updated product in the list        |
| DELETE        | `/products/<id>`    | Returns 204                              |
| GET           | `/products`         | Product is gone                          |

If all 7 pass, your backend is ready.

---

## Step 6 — Generate the UI components

### Table component

```bash
npm run plop
```

```
? Choose a generator  › Table
? Resource name?      › Product
? Fields to display?  › name, price, isActive
```

Generated: `src/components/ProductTable.tsx`

### Form component

```bash
npm run plop
```

```
? Choose a generator  › Form
? Resource name?      › Product
? Fields?             › name, price, description, isActive
```

Generated: `src/components/ProductForm.tsx`

---

## Step 7 — Generate the CRUD page

```bash
npm run plop
```

```
? Choose a generator        › Page
? Resource name?            › Product
? Field for edit header?    › name
```

Generated: `src/pages/ProductPage.tsx`

This produces a fully wired CRUD page: create form toggle, edit form with pre-filled values, delete with confirm dialog, and the table with Edit / Delete buttons already connected.

> The Table generator also includes `onEdit` and `onDelete` props by default — no manual edits needed.

---

## Step 8 — Add the page to App.tsx

Open `src/App.tsx` and import your page:

```tsx
import { ProductPage } from "@/pages/ProductPage";

// Inside the App component, replace <Demo /> with:
{view === 'demo' ? <ProductPage /> : <ApiTester />}
```

Or replace the entire demo section with just:

```tsx
function App() {
  return <ProductPage />;
}
```

---

## Step 10 — Enable infinite scroll (DynamoDB pagination)

When your list grows large, switch the table from `useProducts()` to `useInfiniteProducts()`.

In `src/components/ProductTable.tsx`:

```tsx
import { useInfiniteProducts } from "@/features/product";

export const ProductTable = ({ onEdit, onDelete }: ProductTableProps) => {
  const { data, isLoading, error, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteProducts();

  // Flatten pages into a single array
  const products = data?.pages.flatMap((page) => page.items) ?? [];

  const table = useReactTable({
    data: products,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  // ... same render, add a Load More button at the bottom:
  return (
    <>
      {/* table JSX */}
      {hasNextPage && (
        <button
          onClick={() => fetchNextPage()}
          disabled={isFetchingNextPage}
          className="mt-4 px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50"
        >
          {isFetchingNextPage ? "Loading…" : "Load more"}
        </button>
      )}
    </>
  );
};
```

The `cursor` is handled automatically — `useInfiniteProducts()` passes the `nextCursor` from each page as the `cursor` query param for the next page.

---

## Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| Zod parse error in the console | API response shape doesn't match the schema | Compare the actual API response (ApiTester) to `product.schema.ts` and adjust the validators |
| `useProducts` returns `undefined` | API returned non-array or wrong shape | Check ApiTester GET `/products` — confirm it returns `Product[]` |
| Create/Update doesn't refresh the list | Cache invalidation failed | Check that your API returns the created/updated item, not just `{ success: true }` |
| Delete returns 200 instead of 204 | Some APIs return `{}` on delete | In `product.service.ts`, change `.res()` to `.json()` |
| CORS error | Backend missing CORS headers | Add `Access-Control-Allow-Origin: *` (or your frontend domain) to API responses |
| `nextCursor` always undefined | DynamoDB scan returning all items at once | Set a `Limit` on your Scan/Query command |

---

## What's next

- **Sorting** — add `getSortedRowModel()` to `useReactTable` and `onSortingChange` state
- **Column filters** — add `getFilteredRowModel()` and filter inputs above the table
- **Auth** — uncomment the middleware in `src/services/api.ts`
- **Multiple resources** — repeat Steps 3–9 for each entity (`Order`, `Customer`, etc.)
- **Tests** — `msw` is already installed; create `src/mocks/handlers.ts` to mock API responses
