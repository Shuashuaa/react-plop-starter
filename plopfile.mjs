import inflection from 'inflection';

export default function (plop) {
  plop.setHelper('lb', () => '{');
  plop.setHelper('rb', () => '}');

  plop.setHelper('pluralize', (text) => inflection.pluralize(text));

  plop.setHelper('raw', (options) => options.fn());

  // Infers the HTML input type from a field name
  plop.setHelper('inputType', (fieldName) => {
    const n = fieldName.toLowerCase();
    if (n.includes('email')) return 'email';
    if (n.includes('password')) return 'password';
    if (n.includes('phone') || n.includes('tel')) return 'tel';
    if (n.includes('url') || n.includes('website') || n.includes('link')) return 'url';
    if (n === 'age' || n.includes('count') || n.includes('price') || n.includes('amount') || n.includes('qty') || n.includes('quantity')) return 'number';
    if (n.includes('date') && !n.includes('update') && !n.includes('create')) return 'date';
    return 'text';
  });

  // Infers the Zod validator from a field name
  plop.setHelper('zodType', (fieldName) => {
    const n = fieldName.toLowerCase();
    if (n === 'age' || n.includes('count') || n.includes('price') || n.includes('amount') || n.includes('qty') || n.includes('quantity')) return 'z.number()';
    if (n.startsWith('is') || n.startsWith('has') || n.includes('active') || n.includes('enabled') || n.includes('visible')) return 'z.boolean()';
    if (n.includes('email')) return 'z.string().email()';
    if (n.includes('url') || n.includes('website') || n.includes('link')) return 'z.string().url()';
    if (n.includes('password')) return 'z.string().min(8)';
    return 'z.string().min(1)';
  });

  // Converts camelCase/snake_case field names into readable labels
  plop.setHelper('label', (fieldName) => {
    return fieldName
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .replace(/[_-]+/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase());
  });

  const parseFields = (raw) =>
    raw.split(',').map((f) => f.trim()).filter(Boolean);

  plop.setGenerator('Resource', {
    description: 'Create a Zod + Wretch + SWR feature module (schema, service, hooks)',
    prompts: [
      {
        type: 'input',
        name: 'name',
        message: 'Resource name (e.g. User, Product)?',
      },
      {
        type: 'input',
        name: 'rawFields',
        message: 'Fields, comma-separated (e.g. name, email, age)?',
        validate: (v) => v.trim().length > 0 || 'At least one field is required',
      },
    ],
    actions(data) {
      data.fields = parseFields(data.rawFields);
      return [
        {
          type: 'add',
          path: 'src/features/{{camelCase name}}/use{{pascalCase name}}.ts',
          templateFile: 'stamps/api-service/hook.hbs',
        },
        {
          type: 'add',
          path: 'src/features/{{camelCase name}}/{{camelCase name}}.service.ts',
          templateFile: 'stamps/api-service/service.hbs',
        },
        {
          type: 'add',
          path: 'src/features/{{camelCase name}}/{{camelCase name}}.schema.ts',
          templateFile: 'stamps/api-service/schema.hbs',
        },
        {
          type: 'add',
          path: 'src/features/{{camelCase name}}/index.ts',
          template:
            'export * from "./use{{pascalCase name}}";\nexport * from "./{{camelCase name}}.schema";\nexport * from "./{{camelCase name}}.service";',
        },
      ];
    },
  });

  plop.setGenerator('Table', {
    description: 'Create a table component for a resource',
    prompts: [
      {
        type: 'input',
        name: 'name',
        message: 'Resource name (e.g. User)?',
      },
      {
        type: 'input',
        name: 'rawFields',
        message: 'Fields to display, comma-separated (e.g. name, email)?',
        validate: (v) => v.trim().length > 0 || 'At least one field is required',
      },
    ],
    actions(data) {
      data.fields = parseFields(data.rawFields);
      return [
        {
          type: 'add',
          path: 'src/components/{{pascalCase name}}Table.tsx',
          templateFile: 'stamps/components/table.hbs',
        },
      ];
    },
  });

  plop.setGenerator('Form', {
    description: 'Create a form component for a resource',
    prompts: [
      {
        type: 'input',
        name: 'name',
        message: 'Resource name (e.g. User)?',
      },
      {
        type: 'input',
        name: 'rawFields',
        message: 'Fields, comma-separated (e.g. name, email, password)?',
        validate: (v) => v.trim().length > 0 || 'At least one field is required',
      },
    ],
    actions(data) {
      data.fields = parseFields(data.rawFields);
      return [
        {
          type: 'add',
          path: 'src/components/{{pascalCase name}}Form.tsx',
          templateFile: 'stamps/components/form.hbs',
        },
      ];
    },
  });

  plop.setGenerator('Page', {
    description: 'Create a full CRUD page (requires Resource, Table, and Form to be generated first)',
    prompts: [
      {
        type: 'input',
        name: 'name',
        message: 'Resource name (e.g. Product)?',
      },
      {
        type: 'input',
        name: 'displayField',
        message: 'Field to show in the edit header (e.g. name, title, email)?',
        default: 'name',
      },
    ],
    actions: [
      {
        type: 'add',
        path: 'src/pages/{{pascalCase name}}Page.tsx',
        templateFile: 'stamps/components/page.hbs',
      },
    ],
  });
}
