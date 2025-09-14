const path = require('path');

module.exports = (plop) => {
  plop.setGenerator('crud', {
    description: 'Generate CRUD operations for a resource',
    prompts: [
      {
        type: 'input',
        name: 'name',
        message: 'Resource name (singular):',
        validate: (input) => {
          if (!input) return 'Resource name is required';
          return true;
        },
      },
      {
        type: 'input',
        name: 'fields',
        message: 'Fields (comma-separated, e.g., name,email,age):',
        default: 'name,email',
      },
    ],
    actions: [
      {
        type: 'add',
        path: '../../apps/web/src/pages/{{ pascalCase name }}/index.tsx',
        templateFile: 'templates/list.hbs',
      },
      {
        type: 'add',
        path: '../../apps/web/src/pages/{{ pascalCase name }}/create.tsx',
        templateFile: 'templates/create.hbs',
      },
      {
        type: 'add',
        path: '../../apps/web/src/pages/{{ pascalCase name }}/edit.tsx',
        templateFile: 'templates/edit.hbs',
      },
      {
        type: 'add',
        path: '../../apps/web/src/components/{{ pascalCase name }}/{{ pascalCase name }}Form.tsx',
        templateFile: 'templates/form.hbs',
      },
      {
        type: 'add',
        path: '../../apps/web/src/components/{{ pascalCase name }}/{{ pascalCase name }}Card.tsx',
        templateFile: 'templates/card.hbs',
      },
      {
        type: 'modify',
        path: '../../apps/web/src/routes/__root.tsx',
        pattern: /(\/\/<-- INJECT ROUTE IMPORT -->)/g,
        template: "import { {{ pascalCase name }}Routes } from './{{ pascalCase name }}';\n$1",
      },
    ],
  });
};
