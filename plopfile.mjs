import inflection from "inflection";
import fs from "fs";
import path from "path";

export default function (plop) {
  // Literal brace helpers (escape JSX from Handlebars)
  plop.setHelper("lb", () => "{");
  plop.setHelper("rb", () => "}");

  // Pluralize helper
  plop.setHelper("pluralize", (text) => inflection.pluralize(text));

  plop.setHelper("raw", (options) => options.fn());

  // ─── Custom Action: Auth Existence Gate ──────────────────────────────────────
  plop.setActionType("checkAuthExists", function () {
    const targets = [
      "amplify/backend.ts",
      "src/amplify_outputs.ts",
      "src/components/AmplifySetup.tsx",
      "src/hooks/useAuth.ts",
      "src/pages/LoginPage.tsx",
    ];
    const cwd = process.cwd();
    const existing = targets.filter((f) => fs.existsSync(path.join(cwd, f)));
    if (existing.length > 0) {
      throw new Error(
        `Auth already scaffolded. Found:\n${existing.map((f) => `  ${f}`).join("\n")}\nRemove these files to re-run the generator.`,
      );
    }
    return "Auth files check passed.";
  });

  // ─── Custom Action: Post-scaffold Instructions ───────────────────────────────
  plop.setActionType("printSetupInstructions", function () {
    const msg = `
╔══════════════════════════════════════════════════════════════╗
║  Auth scaffolded (Cognito). Complete setup:                  ║
╚══════════════════════════════════════════════════════════════╝

  Run \x1b[1mnpm install\x1b[0m then \x1b[1mnpm run sandbox\x1b[0m
  - sandbox wraps \`ampx sandbox\`; on each deploy it auto-syncs the four
    VITE_ Cognito vars into .env.local.
  - Then \x1b[1mnpm run dev\x1b[0m and open http://localhost:5173/login
`;
    console.log(msg);
    return "Setup instructions printed.";
  });

  // ─── Router injection (react-router-dom) ─────────────────────────────────────
  // Page / Feature generators register their route + nav link in src/App.tsx via
  // the PLOP_INJECT_* markers. Returns the three modify actions for a given name.
  const routerInjectActions = () => [
    {
      type: "modify",
      path: "src/App.tsx",
      pattern: /(\/\* PLOP_INJECT_IMPORT \*\/)/,
      template:
        'import {{pascalCase name}}Page from "@/pages/{{pascalCase name}}Page";\n$1',
    },
    {
      type: "modify",
      path: "src/App.tsx",
      pattern: /(\{\/\* PLOP_INJECT_ROUTE \*\/\})/,
      template:
        '<Route path="/{{kebabCase name}}" element={<{{pascalCase name}}Page />} />\n        $1',
    },
    {
      type: "modify",
      path: "src/App.tsx",
      pattern: /(\{\/\* PLOP_INJECT_LINK \*\/\})/,
      template:
        '<Link to="/{{kebabCase name}}" className="text-sm text-blue-600 hover:text-blue-700">{{titleCase (pluralize name)}}</Link>\n        $1',
    },
  ];

  // ─── Custom Action: Feature Next-Steps Notes ─────────────────────────────────
  plop.setActionType("printFeatureNextSteps", function (answers) {
    const pascal = plop.getHelper("pascalCase")(answers.name);
    const camel = plop.getHelper("camelCase")(answers.name);
    const kebab = plop.getHelper("kebabCase")(answers.name);
    const tableFile =
      answers.table === "datatable"
        ? `src/components/${pascal}DataTable.tsx`
        : answers.table === "table"
          ? `src/components/${pascal}Table.tsx`
          : null;

    const msg = `
╔══════════════════════════════════════════════════════════════╗
║  ${pascal} scaffolded. Fill the AI GENERATION ZONES — in order: ║
╚══════════════════════════════════════════════════════════════╝

  1. Fields — define the real resource shape:
       src/features/${camel}/${camel}.schema.ts   (replace placeholder \`name\`)
       src/components/${pascal}Form.tsx            (inputs)${
         tableFile ? `\n       ${tableFile}            (columns)` : ""
       }

  2. Wiring — match the service to the REAL backend (ZONE: wiring):
       src/features/${camel}/${camel}.service.ts
       - Set each ROUTES path to the real endpoint.
       - Set UPDATE_METHOD to "put" or "patch".
       - Adjust unwrapItem/unwrapList keys to the response envelope.
${
  tableFile
    ? `
  CRUD is already wired in src/components/${pascal}Manager.tsx:
       - New + Edit open the shared ${pascal}Form in a modal (submits as-is).
       - Delete is inline per-row with a confirm modal — works unchanged.
       Customise the form fields (step 1); leave the Manager handlers intact.
`
    : ""
}
  3. Env — set the API base URL (local offline → dev resources only):
       .env.local → VITE_API_BASE_URL=https://<your-api>

  4. Verify:
       npm run dev    # route /${kebab} is registered in src/App.tsx

  Edit ONLY inside the [AI GENERATION ZONE] markers. Do not rename
  exports, change signatures, or swap the \`api\` client.
`;
    console.log(msg);
    return "Feature next-steps printed.";
  });

  // ─── Resource ────────────────────────────────────────────────────────────────
  // Creates: Zod schema + wretch service + TanStack Query hooks in src/features/<name>/
  plop.setGenerator("Resource", {
    description: "Zod schema + wretch service + TanStack Query hooks (feature module)",
    prompts: [
      {
        type: "input",
        name: "name",
        message: "Resource name (e.g. User Profile)?",
      },
    ],
    actions: [
      {
        type: "add",
        path: "src/features/{{camelCase name}}/{{camelCase name}}.schema.ts",
        templateFile: "stamps/api-service/schema.hbs",
      },
      {
        type: "add",
        path: "src/features/{{camelCase name}}/{{camelCase name}}.service.ts",
        templateFile: "stamps/api-service/service.hbs",
      },
      {
        type: "add",
        path: "src/features/{{camelCase name}}/use{{pascalCase name}}.ts",
        templateFile: "stamps/api-service/hook.hbs",
      },
      {
        type: "add",
        path: "src/features/{{camelCase name}}/index.ts",
        template:
          'export * from "./{{camelCase name}}.schema";\nexport * from "./{{camelCase name}}.service";\nexport * from "./use{{pascalCase name}}";',
      },
    ],
  });

  // ─── Form ────────────────────────────────────────────────────────────────────
  plop.setGenerator("Form", {
    description: "RHF + Zod form component",
    prompts: [{ type: "input", name: "name", message: "Resource name (e.g. User)?" }],
    actions: [
      {
        type: "add",
        path: "src/components/{{pascalCase name}}Form.tsx",
        templateFile: "stamps/components/form.hbs",
      },
    ],
  });

  // ─── Table ───────────────────────────────────────────────────────────────────
  plop.setGenerator("Table", {
    description: "AntD Table — simple display (TanStack Query fetch)",
    prompts: [{ type: "input", name: "name", message: "Resource name (e.g. User)?" }],
    actions: [
      {
        type: "add",
        path: "src/components/{{pascalCase name}}Table.tsx",
        templateFile: "stamps/components/table.hbs",
      },
    ],
  });

  // ─── DataTable ─────────────────────────────────────────────────────────────
  plop.setGenerator("DataTable", {
    description: "AntD Table component with sort, filter & pagination",
    prompts: [{ type: "input", name: "name", message: "Resource name (e.g. User)?" }],
    actions: [
      {
        type: "add",
        path: "src/components/{{pascalCase name}}DataTable.tsx",
        templateFile: "stamps/components/data-table.hbs",
      },
    ],
  });

  // ─── Page ────────────────────────────────────────────────────────────────────
  // Creates: thin route component in src/pages/<Name>Page.tsx + registers the
  // route and nav link in src/App.tsx.
  plop.setGenerator("Page", {
    description: "Thin react-router page (registers route in src/App.tsx)",
    prompts: [{ type: "input", name: "name", message: "Page / route name (e.g. Dashboard)?" }],
    actions: (answers) => [
      {
        type: "add",
        path: "src/pages/{{pascalCase name}}Page.tsx",
        templateFile: "stamps/pages/page.hbs",
        // Standalone page keeps prior behaviour: render the simple <Name>Table.
        data: {
          tableComponent: `${plop.getHelper("pascalCase")(answers.name)}Table`,
        },
      },
      ...routerInjectActions(),
    ],
  });

  // ─── Feature ─────────────────────────────────────────────────────────────────
  // One-shot: Resource + Form + Table/DataTable + Manager + Page
  plop.setGenerator("Feature", {
    description: "Full feature: schema + service + hooks + form + table + page",
    prompts: [
      {
        type: "input",
        name: "name",
        message: "Feature / resource name (e.g. Product)?",
      },
      {
        type: "list",
        name: "table",
        message: "Which table component?",
        default: "datatable",
        choices: [
          { name: "DataTable — sort, filter & pagination (AntD Table)", value: "datatable" },
          { name: "Table — AntD Table, simple display", value: "table" },
          { name: "None — no table component", value: "none" },
        ],
      },
    ],
    actions: (answers) => {
      const pascal = plop.getHelper("pascalCase")(answers.name);
      const wantsTable = answers.table === "table";
      const wantsDataTable = answers.table === "datatable";
      const hasTable = wantsTable || wantsDataTable;

      // The page renders the richer DataTable when present, else the simple
      // Table, else nothing (placeholder zone).
      const tableComponent = wantsDataTable
        ? `${pascal}DataTable`
        : wantsTable
          ? `${pascal}Table`
          : null;

      // CRUD is always on when a table exists: a Manager component wraps the
      // table with New/Edit (shared form, modal) + inline Delete (confirm).
      const managerComponent = hasTable ? `${pascal}Manager` : null;

      const actions = [
        // Schema + service + hooks
        {
          type: "add",
          path: "src/features/{{camelCase name}}/{{camelCase name}}.schema.ts",
          templateFile: "stamps/api-service/schema.hbs",
        },
        {
          type: "add",
          path: "src/features/{{camelCase name}}/{{camelCase name}}.service.ts",
          templateFile: "stamps/api-service/service.hbs",
        },
        {
          type: "add",
          path: "src/features/{{camelCase name}}/use{{pascalCase name}}.ts",
          templateFile: "stamps/api-service/hook.hbs",
        },
        {
          type: "add",
          path: "src/features/{{camelCase name}}/index.ts",
          template:
            'export * from "./{{camelCase name}}.schema";\nexport * from "./{{camelCase name}}.service";\nexport * from "./use{{pascalCase name}}";',
        },
        // Form component
        {
          type: "add",
          path: "src/components/{{pascalCase name}}Form.tsx",
          templateFile: "stamps/components/form.hbs",
        },
      ];

      if (wantsTable) {
        actions.push({
          type: "add",
          path: "src/components/{{pascalCase name}}Table.tsx",
          templateFile: "stamps/components/table.hbs",
        });
      }

      if (wantsDataTable) {
        actions.push({
          type: "add",
          path: "src/components/{{pascalCase name}}DataTable.tsx",
          templateFile: "stamps/components/data-table.hbs",
        });
      }

      // Manager — CRUD wrapper around the chosen table (always on when a table
      // exists). Renders New/Edit (shared form modal) + inline Delete + confirm.
      if (managerComponent) {
        actions.push({
          type: "add",
          path: "src/components/{{pascalCase name}}Manager.tsx",
          templateFile: "stamps/components/manager.hbs",
          data: { tableComponent },
        });
      }

      // Page — renders the Manager when present, else the bare table.
      actions.push({
        type: "add",
        path: "src/pages/{{pascalCase name}}Page.tsx",
        templateFile: "stamps/pages/page.hbs",
        data: { tableComponent, managerComponent },
      });

      // Register route + nav link in src/App.tsx.
      actions.push(...routerInjectActions());

      // Post-scaffold guidance — what the human fills in next, in order.
      actions.push({ type: "printFeatureNextSteps" });

      return actions;
    },
  });

  // ─── Auth ────────────────────────────────────────────────────────────────────
  // Amplify Gen 2 Cognito auth. Run this EARLY (before adding feature pages):
  // it force-replaces src/App.tsx (protected shell + /login route) and src/main.tsx
  // (mounts AmplifySetup). Feature/Page routes added afterwards inject cleanly.
  plop.setGenerator("Auth", {
    description: "Amplify Gen 2 Cognito auth (backend + AmplifySetup + useAuth + login page)",
    prompts: [
      {
        type: "list",
        name: "provider",
        message: "Authentication provider?",
        choices: [
          { name: "Cognito — email + password", value: "cognito" },
          { name: "Microsoft Entra (coming soon)", value: "entra", disabled: "Coming soon" },
          { name: "Both — Cognito + Entra (coming soon)", value: "both", disabled: "Coming soon" },
        ],
      },
    ],
    actions: [
      { type: "checkAuthExists" },
      // Amplify backend definition (required by ampx sandbox / sandbox delete)
      {
        type: "add",
        path: "amplify/backend.ts",
        templateFile: "stamps/auth/amplify-backend.hbs",
      },
      {
        type: "add",
        path: "amplify/auth/resource.ts",
        templateFile: "stamps/auth/amplify-auth-resource.hbs",
      },
      {
        type: "add",
        path: "amplify/package.json",
        templateFile: "stamps/auth/amplify-package.hbs",
      },
      {
        type: "add",
        path: "amplify/tsconfig.json",
        templateFile: "stamps/auth/amplify-tsconfig.hbs",
      },
      // Frontend auth files
      {
        type: "add",
        path: "src/amplify_outputs.ts",
        templateFile: "stamps/auth/amplify-outputs.hbs",
      },
      {
        type: "add",
        path: "src/components/AmplifySetup.tsx",
        templateFile: "stamps/auth/amplify-setup.hbs",
      },
      {
        type: "add",
        path: "src/hooks/useAuth.ts",
        templateFile: "stamps/auth/use-auth.hbs",
      },
      {
        type: "add",
        path: "src/pages/LoginPage.tsx",
        templateFile: "stamps/auth/login-page.hbs",
      },
      // Auth-aware router shell — protected landing + /login (keeps PLOP_INJECT markers)
      {
        type: "add",
        path: "src/App.tsx",
        templateFile: "stamps/auth/app.hbs",
        force: true,
      },
      // Mount AmplifySetup alongside the TanStack Query provider
      {
        type: "add",
        path: "src/main.tsx",
        templateFile: "stamps/auth/main.hbs",
        force: true,
      },
      // Replace the base API client with one that attaches the Amplify idToken
      {
        type: "add",
        path: "src/lib/api/index.ts",
        templateFile: "stamps/auth/api-client.hbs",
        force: true,
      },
      { type: "printSetupInstructions" },
    ],
  });
}
