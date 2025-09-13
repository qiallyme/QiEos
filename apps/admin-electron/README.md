# QiEOS Admin Cockpit

Desktop application for QiEOS administrators. Provides secure access to all administrative functions through a Worker-only API boundary.

## Architecture

- **Main Process**: Secure Electron window with context isolation
- **Preload Script**: Secure IPC bridge for communication
- **Renderer**: React app with routing for admin dashboard
- **API Communication**: All privileged operations go through Worker API

## Security Model

- No direct database access from renderer
- All privileged operations via Worker API
- Context isolation enabled
- No node integration in renderer

## Development

```bash
# Install dependencies
pnpm install

# Development mode
pnpm dev

# Build for production
pnpm build

# Package for distribution
pnpm dist
```

## Manual Cleanup Required

The `n8n/` folder needs to be removed from this directory. It contains 7,000+ files that are not part of QiEOS.

**To clean up:**
```bash
# Move n8n folder to trash (preserving path)
move apps\admin-electron\n8n .trash\2025-01-27\apps\admin-electron\n8n
```

## Features

- Dashboard with system overview
- Tenant management
- CRM operations
- Project and task management
- Knowledge base editor
- Document ingest for RAG
- Billing desk
- Script runner
- Database migrations
- System auditor

All features communicate exclusively with the Worker API - no direct database access.