const path = require('path');

module.exports = (plop) => {
  plop.setGenerator('reactComponent', {
    description: 'Generate a React component',
    prompts: [
      {
        type: 'input',
        name: 'name',
        message: 'Component name:',
        validate: (input) => {
          if (!input) return 'Component name is required';
          if (!/^[A-Z]/.test(input)) return 'Component name must start with uppercase';
          return true;
        },
      },
      {
        type: 'confirm',
        name: 'withStory',
        message: 'Include Storybook story?',
        default: true,
      },
      {
        type: 'confirm',
        name: 'withTest',
        message: 'Include test file?',
        default: true,
      },
    ],
    actions: (data) => {
      const actions = [
        {
          type: 'add',
          path: '../../apps/web/src/components/{{ pascalCase name }}/{{ pascalCase name }}.tsx',
          templateFile: 'templates/component.hbs',
        },
        {
          type: 'add',
          path: '../../apps/web/src/components/{{ pascalCase name }}/index.ts',
          templateFile: 'templates/index.hbs',
        },
      ];

      if (data.withStory) {
        actions.push({
          type: 'add',
          path: '../../apps/web/src/components/{{ pascalCase name }}/{{ pascalCase name }}.stories.tsx',
          templateFile: 'templates/story.hbs',
        });
      }

      if (data.withTest) {
        actions.push({
          type: 'add',
          path: '../../apps/web/src/components/{{ pascalCase name }}/{{ pascalCase name }}.test.tsx',
          templateFile: 'templates/test.hbs',
        });
      }

      return actions;
    },
  });
};
