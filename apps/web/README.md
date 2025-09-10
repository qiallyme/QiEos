# QiEOS Web Application

The main web application for QiEOS, built with React + Vite + TypeScript.

## Features

- **Authentication**: Supabase Auth integration with JWT claims
- **Task Management**: Create, update, and manage tasks with tenant scoping
- **File Storage**: Upload and manage files with R2 integration
- **Knowledge Base**: Public and private documentation system
- **Profile Management**: Update user profile information
- **Responsive Design**: Mobile-first design with Tailwind CSS

## Development Setup

1. **Install dependencies**
   ```bash
   pnpm install
   ```

2. **Configure environment**
   Create a `.env` file with:
   ```env
   VITE_SUPABASE_URL=https://vwqkhjnkummwtvfxgqml.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ3cWtoam5rdW1td3R2ZnhncW1sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYwMDMwNDksImV4cCI6MjA3MTU3OTA0OX0.Q1_W-sq8iKVPfJ2HfTS2hGNmK5jjzsy50cHszhB_6VQ
   VITE_API_URL=http://localhost:8787
   ```

3. **Start development server**
   ```bash
   pnpm dev
   ```

4. **Build for production**
   ```bash
   pnpm build
   ```

## Project Structure

```
src/
├── components/          # Reusable UI components
├── context/            # React context providers
├── hooks/              # Custom React hooks
├── lib/                # Utility libraries
├── modules/            # Feature modules
│   ├── tasks/          # Task management
│   ├── files/          # File management
│   └── kb/             # Knowledge base
├── routes/             # Route components
│   ├── auth/           # Authentication pages
│   ├── client/         # Client portal pages
│   └── public/         # Public pages
├── store/              # State management
└── styles/             # Global styles
```

## Key Components

- **AuthProvider**: Manages authentication state and claims
- **ProtectedRoute**: Route guard for authenticated users
- **TaskList**: Task management interface
- **FileUpload**: Drag-and-drop file upload
- **KnowledgeBase**: Documentation browser

## API Integration

The app communicates with the QiEOS API Worker through the `lib/supabaseClient.ts` module, which provides:

- Automatic JWT token handling
- Request/response interceptors
- Error handling
- Type-safe API calls

## Deployment

The app is designed to be deployed to Cloudflare Pages with automatic builds from the main branch.