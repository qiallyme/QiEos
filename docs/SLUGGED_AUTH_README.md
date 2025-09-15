# Slugged Route-Based Multi-Tenant Authentication

This implementation provides a clean, secure multi-tenant authentication system using slugged routes (e.g., `/zai/dashboard`) with proper tenant isolation and access control.

## 🏗️ Architecture Overview

### URL Scheme

- **Public routes**: `/:slug/login`, `/:slug/auth/callback`
- **Protected routes**: `/:slug/dashboard`, `/:slug/tasks`, `/:slug/*`

### Key Components

1. **SluggedLogin** - Organization-specific login page
2. **AuthCallback** - Handles magic link redirects with slug context
3. **Guarded** - Route guard that enforces slug-based access control
4. **OrgContext** - Provides organization context to child components
5. **RLS Policies** - Database-level tenant isolation

## 🚀 Implementation Details

### 1. Magic Link Authentication

When a user requests a magic link, it includes the slugged callback URL:

```typescript
const { error } = await supabase.auth.signInWithOtp({
  email,
  options: {
    shouldCreateUser: false,
    emailRedirectTo: `https://portal.qially.com/${slug}/auth/callback?next=/${slug}/dashboard`,
  },
});
```

### 2. Route Guarding

The `Guarded` component checks:

- User is authenticated
- User belongs to the organization for the given slug
- User has required role (if specified)
- User has access to required feature (if specified)

```typescript
<Route
  path="/:slug/*"
  element={
    <Guarded>
      <Routes>
        <Route path="dashboard" element={<SluggedDashboard />} />
        <Route path="tasks" element={<TaskList />} />
        {/* ... more routes */}
      </Routes>
    </Guarded>
  }
/>
```

### 3. Organization Context

The `OrgContext` provides organization details to child components:

```typescript
const { org, userRole, loading, error } = useOrg();
```

### 4. Database Security

Row Level Security (RLS) policies ensure tenant isolation at the database level:

```sql
-- Users can only see organizations they belong to
CREATE POLICY "Users can view their org" ON orgs
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM public.user_orgs uo
    WHERE uo.user_id = auth.uid()
      AND uo.org_id = orgs.id
  )
);
```

## 📁 File Structure

```
apps/web/src/
├── components/
│   ├── Guarded.tsx              # Route guard for slug-based access
│   └── OrgContext.tsx           # Organization context provider
├── routes/
│   ├── auth/
│   │   ├── SluggedLogin.tsx     # Organization-specific login
│   │   └── Callback.tsx         # Updated to handle slugs
│   └── client/
│       └── SluggedDashboard.tsx # Dashboard with org context
├── lib/
│   └── authUtils.ts             # Helper functions for auth
└── context/
    └── AuthContext.tsx          # Updated to support slugged redirects
```

## 🔧 Setup Instructions

### 1. Database Setup

Run the RLS policies migration:

```sql
-- Execute the contents of slugged_auth_rls_policies.sql
-- This creates the user_orgs view and RLS policies
```

### 2. Supabase Configuration

Whitelist the slugged callback URLs in Supabase Auth → URL Configuration:

```
https://portal.qially.com/*/auth/callback
```

### 3. Environment Variables

Ensure your environment variables are set:

```env
VITE_SUPABASE_URL="your_supabase_url"
VITE_SUPABASE_ANON_KEY="your_supabase_anon_key"
VITE_API_URL="http://localhost:8787"
```

## 🎯 Usage Examples

### 1. Basic Organization Access

```typescript
// User visits /zai/dashboard
// Guarded component checks if user belongs to 'zai' org
// If yes, shows dashboard; if no, shows access denied
```

### 2. Role-Based Access

```typescript
<Route
  path="/:slug/admin/*"
  element={
    <Guarded requiredRole="admin">
      <AdminRoutes />
    </Guarded>
  }
/>
```

### 3. Feature-Based Access

```typescript
<Route
  path="/:slug/billing"
  element={
    <Guarded requiredFeature="billing">
      <BillingPage />
    </Guarded>
  }
/>
```

### 4. Organization Context in Components

```typescript
function MyComponent() {
  const { org, userRole } = useOrg();

  return (
    <div>
      <h1>Welcome to {org?.name}</h1>
      <p>Your role: {userRole}</p>
    </div>
  );
}
```

## 🔒 Security Features

### 1. Multi-Layer Protection

- **Route Guard**: Checks access at the component level
- **RLS Policies**: Enforces isolation at the database level
- **JWT Claims**: Validates permissions in the API layer

### 2. Tenant Isolation

- Users can only access organizations they belong to
- Database queries are automatically scoped by organization
- No cross-tenant data leakage possible

### 3. Access Control

- Role-based permissions (admin, internal, external, public)
- Feature-based access control
- Organization-specific user management

## 🚨 Edge Cases Handled

### 1. Wrong Organization Access

- User tries to access `/wrong-org/dashboard`
- Guarded component shows "Access Denied" with helpful message
- Provides links to correct login or home page

### 2. Magic Link on Wrong Slug

- User receives magic link for `/org-a/auth/callback`
- But tries to use it on `/org-b/auth/callback`
- AuthCallback redirects to appropriate login page

### 3. Multiple Organization Memberships

- User belongs to multiple organizations
- Each organization has its own slugged routes
- User can access all their organizations independently

### 4. Organization Not Found

- User tries to access non-existent organization slug
- Clear error message with suggestions
- Graceful fallback to home page

## 🧪 Testing

### 1. Test Organization Access

```typescript
// Create test org with slug 'test-org'
// Create user and add to org
// Test accessing /test-org/dashboard
// Verify access is granted/denied correctly
```

### 2. Test Magic Links

```typescript
// Send magic link to /test-org/auth/callback
// Verify link works and redirects correctly
// Test with wrong organization slug
```

### 3. Test RLS Policies

```sql
-- Test that users can only see their org data
-- Verify cross-tenant access is blocked
-- Test role-based access within org
```

## 🔄 Migration from Existing System

### 1. Update Existing Routes

- Replace `/client/*` routes with `/:slug/*` routes
- Update ProtectedRoute usage to Guarded
- Add organization context where needed

### 2. Update Authentication Flow

- Modify magic link generation to include slug
- Update callback handling for slugged URLs
- Test existing user flows

### 3. Database Migration

- Run RLS policies migration
- Update existing data to ensure proper org relationships
- Test tenant isolation

## 📚 API Reference

### Guarded Component Props

```typescript
interface GuardedProps {
  children: React.ReactNode;
  requiredRole?: string; // 'admin' | 'internal' | 'external' | 'public'
  requiredFeature?: string; // Feature flag name
}
```

### OrgContext Hook

```typescript
interface OrgContextType {
  org: { id: string; name: string; slug: string } | null;
  userRole: string | null;
  loading: boolean;
  error: string | null;
}
```

### Auth Utils

```typescript
// Check if user has access to org slug
checkOrgAccess(slug: string): Promise<AccessResult>

// Get all orgs user has access to
getUserOrgs(): Promise<{ orgs: OrgInfo[]; error?: string }>

// Create magic link for specific org
createMagicLink(email: string, slug: string, next?: string): Promise<Result>
```

## 🎉 Benefits

1. **Clean URLs**: `/zai/dashboard` instead of complex query parameters
2. **Secure**: Multi-layer security with RLS and route guards
3. **Scalable**: Easy to add new organizations and features
4. **User-Friendly**: Clear error messages and intuitive navigation
5. **Maintainable**: Well-structured code with clear separation of concerns

This implementation provides a robust foundation for multi-tenant applications with proper security, scalability, and user experience.
