const path = require('path');

module.exports = (plop) => {
  plop.setGenerator('email', {
    description: 'Generate an email template',
    prompts: [
      {
        type: 'input',
        name: 'name',
        message: 'Email template name:',
        validate: (input) => {
          if (!input) return 'Email template name is required';
          return true;
        },
      },
      {
        type: 'input',
        name: 'subject',
        message: 'Email subject:',
        default: '{{ pascalCase name }} Email',
      },
    ],
    actions: [
      {
        type: 'add',
        path: '../../apps/web/src/emails/{{ camelCase name }}/{{ pascalCase name }}Email.tsx',
        templateFile: 'templates/email.hbs',
      },
      {
        type: 'add',
        path: '../../apps/web/src/emails/{{ camelCase name }}/index.ts',
        templateFile: 'templates/index.hbs',
      },
      {
        type: 'modify',
        path: '../../apps/web/src/emails/index.ts',
        pattern: /(\/\/<-- INJECT EMAIL IMPORT -->)/g,
        template: "export * from './{{ camelCase name }}';\n$1",
      },
    ],
  });
};
