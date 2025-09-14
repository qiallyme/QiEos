# QiPortals MVP - Cloudflare-first Portal Suite

A modern, cloudflare-first monorepo with glassmorphism design and MCP knowledge base integration.

## 🏗️ Architecture

- **apps/web**: React + Vite + TanStack Router with glassmorphism UI
- **workers/mcp-kb**: Cloudflare Worker for MCP knowledge base operations
- **packages/ui**: Shared UI components and plop generators

## 🚀 Quick Start

```bash
# Install dependencies
pnpm install

# Start development
pnpm dev

# Generate components
pnpm plop
```

## 📦 Available Scripts

- `pnpm dev` - Start all development servers
- `pnpm build` - Build all packages
- `pnpm plop` - Run plop generators
- `pnpm ui:add <component>` - Add shadcn/ui components

## 🎨 Features

- **Glassmorphism Design**: Modern translucent UI with backdrop blur effects
- **Cloudflare Workers**: Edge-first architecture with global distribution
- **MCP Integration**: Model Context Protocol for AI knowledge base
- **Plop Generators**: Code generation for CRUD operations and email templates
- **Type Safety**: Full TypeScript support across the monorepo

## 🔧 Development

### Adding Components
```bash
# Generate a new React component
pnpm plop reactComponent

# Generate CRUD operations
pnpm plop crud

# Generate email templates
pnpm plop email
```

### Adding UI Components
```bash
# Add shadcn/ui components
pnpm ui:add button card input
```

## 📁 Project Structure

```
├── apps/
│   └── web/                 # React web application
├── workers/
│   └── mcp-kb/             # Cloudflare Worker for MCP
├── packages/
│   └── ui/                 # Shared UI components and generators
└── package.json            # Root package configuration
```

## 🌐 Deployment

### Web App
Deploy to Cloudflare Pages or any static hosting provider.

### Worker
Deploy using Wrangler:
```bash
cd workers/mcp-kb
pnpm deploy
```

## 📝 License

MIT