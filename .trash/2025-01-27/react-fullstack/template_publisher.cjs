#!/usr/bin/env node

/**
 * Template Publisher - Register new templates using plop conventions
 * 
 * Usage: node template_publisher.js <template_type> <name>
 * 
 * template_type: component | icon | email
 * name: <Name>
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Template configurations
const TEMPLATE_CONFIGS = {
  component: {
    files: [
      {
        path: 'src/components/{{ camelCase name }}/index.ts',
        template: `export { {{ pascalCase name }} } from './{{ camelCase name }}.component';
export type { {{ pascalCase name }}Props } from './{{ camelCase name }}.component';`
      },
      {
        path: 'src/components/{{ camelCase name }}/{{ camelCase name }}.component.tsx',
        template: `import React from 'react';

export interface {{ pascalCase name }}Props {
  // Add your props here
}

export const {{ pascalCase name }}: React.FC<{{ pascalCase name }}Props> = (props) => {
  return (
    <div className="{{ kebabCase name }}">
      {/* Component content */}
    </div>
  );
};`
      },
      {
        path: 'src/components/{{ camelCase name }}/{{ camelCase name }}.stories.tsx',
        template: `import type { Meta, StoryObj } from '@storybook/react';
import { {{ pascalCase name }} } from './{{ camelCase name }}.component';

const meta: Meta<typeof {{ pascalCase name }}> = {
  title: 'Components/{{ pascalCase name }}',
  component: {{ pascalCase name }},
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    // Add default props here
  },
};`
      }
    ],
    registries: [
      {
        file: 'src/components/index.ts',
        importPattern: /(\/\/<-- IMPORT COMPONENT -->)/g,
        importTemplate: "export { {{ pascalCase name }} } from './{{ camelCase name }}';\n$1",
        exportPattern: /(\/\/<-- EXPORT COMPONENT -->)/g,
        exportTemplate: "export type { {{ pascalCase name }}Props } from './{{ camelCase name }}';\n$1"
      }
    ]
  },
  
  icon: {
    files: [
      {
        path: 'src/icons/{{ camelCase name }}.svg',
        template: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- Add your SVG content here -->
</svg>`
      }
    ],
    registries: [
      {
        file: 'src/icons/index.ts',
        importPattern: /(\/\/<-- IMPORT ICON FILE -->)/g,
        importTemplate: "import { ReactComponent as {{ pascalCase name }}Img } from './{{ camelCase name }}.svg';\n$1",
        exportPattern: /(\/\/<-- EXPORT ICON COMPONENT -->)/g,
        exportTemplate: "export const {{ pascalCase name }}Icon = makeIcon({{ pascalCase name }}Img);\n$1"
      }
    ]
  },
  
  email: {
    files: [
      {
        path: 'src/templates/{{ camelCase name }}/index.ts',
        template: `export { Template } from './{{ camelCase name }}.component';
export type { {{ pascalCase name }}Props } from './{{ camelCase name }}.component';`
      },
      {
        path: 'src/templates/{{ camelCase name }}/{{ camelCase name }}.component.tsx',
        template: `import React from 'react';
import { EmailComponentProps } from '../../types';

export interface {{ pascalCase name }}Props extends EmailComponentProps {
  // Add your props here
}

export const Template: React.FC<{{ pascalCase name }}Props> = (props) => {
  return (
    <div className="email-template {{ kebabCase name }}">
      {/* Email template content */}
    </div>
  );
};`
      },
      {
        path: 'src/templates/{{ camelCase name }}/{{ camelCase name }}.stories.tsx',
        template: `import type { Meta, StoryObj } from '@storybook/react';
import { Template } from './{{ camelCase name }}.component';

const meta: Meta<typeof Template> = {
  title: 'Templates/{{ pascalCase name }}',
  component: Template,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    // Add default props here
  },
};`
      }
    ],
    registries: [
      {
        file: 'src/types.ts',
        importPattern: /(\/\/<-- INJECT EMAIL TYPE -->)/g,
        importTemplate: "{{ constantCase name }} = '{{ constantCase name }}',\n  $1"
      },
      {
        file: 'src/templates/templates.config.ts',
        importPattern: /(\/\/<-- INJECT EMAIL TEMPLATE IMPORT -->)/g,
        importTemplate: "import * as {{ pascalCase name }} from './{{ camelCase name }}';\n$1",
        exportPattern: /(\/\/<-- INJECT EMAIL TEMPLATE -->)/g,
        exportTemplate: "[EmailTemplateType.{{ constantCase name }}]: {{ pascalCase name }},\n  $1"
      }
    ]
  }
};

// Utility functions
function camelCase(str) {
  return str.replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => {
    return index === 0 ? word.toLowerCase() : word.toUpperCase();
  }).replace(/\s+/g, '');
}

function pascalCase(str) {
  return str.replace(/(?:^\w|[A-Z]|\b\w)/g, (word) => {
    return word.toUpperCase();
  }).replace(/\s+/g, '');
}

function kebabCase(str) {
  return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
}

function constantCase(str) {
  return str.replace(/([a-z])([A-Z])/g, '$1_$2').toUpperCase();
}

function replaceTemplateVars(template, name) {
  return template
    .replace(/\{\{\s*camelCase\s+name\s*\}\}/g, camelCase(name))
    .replace(/\{\{\s*pascalCase\s+name\s*\}\}/g, pascalCase(name))
    .replace(/\{\{\s*kebabCase\s+name\s*\}\}/g, kebabCase(name))
    .replace(/\{\{\s*constantCase\s+name\s*\}\}/g, constantCase(name));
}

function ensureDirectoryExists(filePath) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function createSnapshot() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const snapshotDir = `snapshots/${timestamp}`;
  
  if (!fs.existsSync('snapshots')) {
    fs.mkdirSync('snapshots');
  }
  
  try {
    execSync(`git add -A && git stash push -m "Template Publisher Snapshot ${timestamp}"`, { stdio: 'pipe' });
    console.log(`✅ Created snapshot: ${snapshotDir}`);
  } catch (error) {
    console.log('⚠️  Could not create git snapshot, continuing...');
  }
}

function checkRegistryPatterns(config, name) {
  const errors = [];
  
  for (const registry of config.registries) {
    if (!fs.existsSync(registry.file)) {
      errors.push(`Registry file not found: ${registry.file}`);
      continue;
    }
    
    const content = fs.readFileSync(registry.file, 'utf8');
    
    if (registry.importPattern && !registry.importPattern.test(content)) {
      errors.push(`Import pattern not found in ${registry.file}: ${registry.importPattern}`);
    }
    
    if (registry.exportPattern && !registry.exportPattern.test(content)) {
      errors.push(`Export pattern not found in ${registry.file}: ${registry.exportPattern}`);
    }
  }
  
  return errors;
}

function previewChanges(config, name) {
  console.log('\n📋 PREVIEW OF CHANGES:');
  console.log('='.repeat(50));
  
  console.log('\n📁 FILES TO CREATE:');
  for (const file of config.files) {
    const filePath = replaceTemplateVars(file.path, name);
    console.log(`  + ${filePath}`);
  }
  
  console.log('\n📝 REGISTRY MODIFICATIONS:');
  for (const registry of config.registries) {
    if (fs.existsSync(registry.file)) {
      console.log(`  ~ ${registry.file}`);
      
      if (registry.importPattern) {
        const importLine = replaceTemplateVars(registry.importTemplate, name);
        console.log(`    + ${importLine.trim()}`);
      }
      
      if (registry.exportPattern) {
        const exportLine = replaceTemplateVars(registry.exportTemplate, name);
        console.log(`    + ${exportLine.trim()}`);
      }
    }
  }
  
  console.log('\n' + '='.repeat(50));
}

function createTemplate(templateType, name) {
  const config = TEMPLATE_CONFIGS[templateType];
  
  if (!config) {
    console.error(`❌ Unknown template type: ${templateType}`);
    console.error('Available types: component, icon, email');
    process.exit(1);
  }
  
  console.log(`🚀 Creating ${templateType} template: ${name}`);
  
  // Check registry patterns first
  const errors = checkRegistryPatterns(config, name);
  if (errors.length > 0) {
    console.error('\n❌ REGISTRY PATTERN ERRORS:');
    errors.forEach(error => console.error(`  - ${error}`));
    console.error('\n🛑 STOPPING - Manual review required');
    process.exit(1);
  }
  
  // Show preview
  previewChanges(config, name);
  
  // Create snapshot
  createSnapshot();
  
  const createdFiles = [];
  const modifiedFiles = [];
  
  // Create files
  for (const file of config.files) {
    const filePath = replaceTemplateVars(file.path, name);
    const content = replaceTemplateVars(file.template, name);
    
    ensureDirectoryExists(filePath);
    fs.writeFileSync(filePath, content);
    createdFiles.push(filePath);
    console.log(`✅ Created: ${filePath}`);
  }
  
  // Modify registries
  for (const registry of config.registries) {
    if (!fs.existsSync(registry.file)) {
      console.log(`⚠️  Registry file not found: ${registry.file}`);
      continue;
    }
    
    let content = fs.readFileSync(registry.file, 'utf8');
    let modified = false;
    
    if (registry.importPattern) {
      const importLine = replaceTemplateVars(registry.importTemplate, name);
      content = content.replace(registry.importPattern, importLine);
      modified = true;
    }
    
    if (registry.exportPattern) {
      const exportLine = replaceTemplateVars(registry.exportTemplate, name);
      content = content.replace(registry.exportPattern, exportLine);
      modified = true;
    }
    
    if (modified) {
      fs.writeFileSync(registry.file, content);
      modifiedFiles.push(registry.file);
      console.log(`✅ Modified: ${registry.file}`);
    }
  }
  
  // Show git status and diff
  console.log('\n📊 GIT STATUS:');
  try {
    const status = execSync('git status --porcelain', { encoding: 'utf8' });
    if (status.trim()) {
      console.log(status);
    } else {
      console.log('No changes detected');
    }
  } catch (error) {
    console.log('⚠️  Could not get git status');
  }
  
  console.log('\n📋 SUMMARY:');
  console.log(`Created files: ${createdFiles.length}`);
  createdFiles.forEach(file => console.log(`  + ${file}`));
  
  console.log(`Modified files: ${modifiedFiles.length}`);
  modifiedFiles.forEach(file => console.log(`  ~ ${file}`));
  
  console.log('\n✅ Template creation completed successfully!');
}

// Main execution
function main() {
  const args = process.argv.slice(2);
  
  if (args.length !== 2) {
    console.error('Usage: node template_publisher.js <template_type> <name>');
    console.error('template_type: component | icon | email');
    console.error('name: <Name>');
    process.exit(1);
  }
  
  const [templateType, name] = args;
  
  if (!name || name.trim() === '') {
    console.error('❌ Name cannot be empty');
    process.exit(1);
  }
  
  createTemplate(templateType, name.trim());
}

if (require.main === module) {
  main();
}

module.exports = { createTemplate, TEMPLATE_CONFIGS };
