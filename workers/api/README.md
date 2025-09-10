# QiEOS API Worker

The main API worker for QiEOS, built with Cloudflare Workers and Hono.

## Features

- **Authentication**: JWT verification and claims enrichment
- **Task Management**: CRUD operations with tenant scoping
- **File Storage**: R2 integration with signed URLs
- **Knowledge Base**: Public and private documentation API
- **Profile Management**: User profile updates
- **Multi-tenant**: Organization and company-based access control

## Development Setup

1. **Install dependencies**
   ```bash
   pnpm install
   ```

2. **Configure environment**
   Update `wrangler.toml` with your environment variables:
   ```toml
   [vars]
   SUPABASE_URL = "your_supabase_url"
   SUPABASE_SERVICE_ROLE_KEY = "your_service_role_key"
   OPENAI_API_KEY = "your_openai_key"
   STRIPE_SECRET_KEY = "your_stripe_key"
   ```

3. **Start development server**
   ```bash
   pnpm dev
   ```

4. **Deploy to Cloudflare**
   ```bash
   pnpm deploy
   ```

## API Endpoints

### Authentication
- `POST /auth/session` - Verify session and return claims
- `GET /auth/me` - Get current user info

### Tasks
- `GET /tasks` - List tasks (tenant-scoped)
- `POST /tasks` - Create new task
- `PATCH /tasks/:id` - Update task
- `DELETE /tasks/:id` - Delete task

### Files
- `POST /files/sign-upload` - Get signed upload URL
- `POST /files/complete` - Complete upload and save metadata
- `GET /files` - List files (tenant-scoped)
- `GET /files/download/:id` - Get download URL
- `DELETE /files/:id` - Delete file

### Knowledge Base
- `GET /kb/public` - Get public articles
- `GET /kb/private` - Get private articles (tenant-scoped)
- `GET /kb/collections` - Get collections
- `GET /kb/article/:id` - Get specific article

### Profile
- `GET /me/profile` - Get user profile
- `PATCH /me/profile` - Update user profile

## Security

- All endpoints (except public KB) require authentication
- JWT tokens are verified and enriched with claims
- Tenant scoping enforced at the database level
- RLS policies prevent cross-tenant data access

## Database Schema

The worker expects the following Supabase tables:
- `orgs` - Organizations
- `companies` - Companies within organizations
- `contacts` - User contacts with org/company associations
- `tasks` - Task management
- `files` - File metadata
- `kb_collections` - Knowledge base collections
- `kb_docs` - Knowledge base documents
- `org_features` - Feature flags per organization
- `company_features` - Feature flags per company

## Error Handling

All endpoints return consistent error responses:
```json
{
  "error": "Error message",
  "details": "Additional error details (optional)"
}
```

Success responses include a `success: true` flag and relevant data.
