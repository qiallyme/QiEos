# Template Publisher

A Node.js script that follows plop conventions to register new templates (components, icons, emails) with automatic registry injection.

## Features

- ✅ **Plop-style template generation** with handlebars-style variable replacement
- ✅ **Automatic registry injection** using pattern matching
- ✅ **Safety checks** - stops if registry patterns are missing
- ✅ **Preview functionality** - shows changes before applying
- ✅ **Git integration** - shows status and diff (when in git repo)
- ✅ **Snapshot creation** - creates backups before changes
- ✅ **Multiple template types** - component, icon, email

## Usage

```bash
node template_publisher.cjs <template_type> <name>
```

### Template Types

#### Component
```bash
node template_publisher.cjs component ClientTicketCard
```

Creates:
- `src/components/clientTicketCard/index.ts`
- `src/components/clientTicketCard/clientTicketCard.component.tsx`
- `src/components/clientTicketCard/clientTicketCard.stories.tsx`

Modifies:
- `src/components/index.ts` (adds import and export)

#### Icon
```bash
node template_publisher.cjs icon UserProfile
```

Creates:
- `src/icons/userProfile.svg`

Modifies:
- `src/icons/index.ts` (adds import and export)

#### Email
```bash
node template_publisher.cjs email WelcomeEmail
```

Creates:
- `src/templates/welcomeEmail/index.ts`
- `src/templates/welcomeEmail/welcomeEmail.component.tsx`
- `src/templates/welcomeEmail/welcomeEmail.stories.tsx`

Modifies:
- `src/types.ts` (adds enum value)
- `src/templates/templates.config.ts` (adds import and mapping)

## Registry Patterns

The script uses specific comment patterns for injection:

### Component Registry
```typescript
// src/components/index.ts
//<-- IMPORT COMPONENT -->
//<-- EXPORT COMPONENT -->
```

### Icon Registry
```typescript
// src/icons/index.ts
//<-- IMPORT ICON FILE -->
//<-- EXPORT ICON COMPONENT -->
```

### Email Registry
```typescript
// src/types.ts
export enum EmailTemplateType {
  //<-- INJECT EMAIL TYPE -->
}

// src/templates/templates.config.ts
//<-- INJECT EMAIL TEMPLATE IMPORT -->
//<-- INJECT EMAIL TEMPLATE -->
```

## Safety Features

### Pattern Validation
Before creating any files, the script validates that all required registry patterns exist:

```bash
❌ REGISTRY PATTERN ERRORS:
  - Import pattern not found in src/components/index.ts: /(\/\/<-- IMPORT COMPONENT -->)/g
  - Export pattern not found in src/components/index.ts: /(\/\/<-- EXPORT COMPONENT -->)/g

🛑 STOPPING - Manual review required
```

### Preview Mode
Shows exactly what will be created and modified:

```bash
📋 PREVIEW OF CHANGES:
==================================================

📁 FILES TO CREATE:
  + src/components/clientTicketCard/index.ts
  + src/components/clientTicketCard/clientTicketCard.component.tsx
  + src/components/clientTicketCard/clientTicketCard.stories.tsx

📝 REGISTRY MODIFICATIONS:
  ~ src/components/index.ts
    + export { ClientTicketCard } from './clientTicketCard';
    + export type { ClientTicketCardProps } from './clientTicketCard';
```

### Git Integration
When run in a git repository:
- Creates snapshots before changes
- Shows git status
- Shows diff of changes

## Template Variables

The script supports handlebars-style variable replacement:

- `{{ camelCase name }}` - clientTicketCard
- `{{ pascalCase name }}` - ClientTicketCard  
- `{{ kebabCase name }}` - client-ticket-card
- `{{ constantCase name }}` - CLIENT_TICKET_CARD

## Example Output

```bash
$ node template_publisher.cjs component ClientTicketCard

🚀 Creating component template: ClientTicketCard

📋 PREVIEW OF CHANGES:
==================================================

📁 FILES TO CREATE:
  + src/components/clientTicketCard/index.ts
  + src/components/clientTicketCard/clientTicketCard.component.tsx
  + src/components/clientTicketCard/clientTicketCard.stories.tsx

📝 REGISTRY MODIFICATIONS:
  ~ src/components/index.ts
    + export { ClientTicketCard } from './clientTicketCard';
    + export type { ClientTicketCardProps } from './clientTicketCard';

==================================================
✅ Created: src/components/clientTicketCard/index.ts
✅ Created: src/components/clientTicketCard/clientTicketCard.component.tsx
✅ Created: src/components/clientTicketCard/clientTicketCard.stories.tsx
✅ Modified: src/components/index.ts

📊 GIT STATUS:
A  src/components/clientTicketCard/index.ts
A  src/components/clientTicketCard/clientTicketCard.component.tsx
A  src/components/clientTicketCard/clientTicketCard.stories.tsx
M  src/components/index.ts

📋 SUMMARY:
Created files: 3
  + src/components/clientTicketCard/index.ts
  + src/components/clientTicketCard/clientTicketCard.component.tsx
  + src/components/clientTicketCard/clientTicketCard.stories.tsx
Modified files: 1
  ~ src/components/index.ts

✅ Template creation completed successfully!
```

## Requirements

- Node.js
- Git (optional, for git integration)

## File Structure

```
src/
├── components/
│   ├── index.ts                    # Component registry
│   └── clientTicketCard/
│       ├── index.ts
│       ├── clientTicketCard.component.tsx
│       └── clientTicketCard.stories.tsx
├── icons/
│   ├── index.ts                    # Icon registry
│   ├── makeIcon.ts
│   └── userProfile.svg
├── templates/
│   ├── templates.config.ts         # Email template registry
│   └── welcomeEmail/
│       ├── index.ts
│       ├── welcomeEmail.component.tsx
│       └── welcomeEmail.stories.tsx
└── types.ts                        # Email types
```
