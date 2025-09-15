# QiEOS Shared Packages

This directory contains shared packages used across the QiEOS monorepo.

## Packages

### @qieos/types

Shared TypeScript type definitions for the entire application.

### @qieos/utils

Shared utility functions and helpers.

### @qieos/ui

Shared React UI components built with Tailwind CSS.

## Development

To build all packages:

```bash
pnpm build
```

To build a specific package:

```bash
pnpm --filter @qieos/types build
pnpm --filter @qieos/utils build
pnpm --filter @qieos/ui build
```

## Usage

Import from any app in the monorepo:

```typescript
import { Claims, Task } from "@qieos/types";
import { formatDate, slugify } from "@qieos/utils";
import { Button, Card } from "@qieos/ui";
```
