# Slugged Route Authentication Implementation

This document describes the complete implementation of slugged route-based multi-tenant authentication for QiEOS.

## Overview

The system implements a clean, secure multi-tenant authentication flow where:
- Each organization has a unique slug (e.g., `zai`, `acme`, `techcorp`)
- Users access their organization's portal via `/:slug/*` routes
- Magic links are sent to slugged callback URLs
- Route guards enforce organization membership
- RLS policies provide database-level security

## URL Scheme

### Public Routes
- `/:slug/login` - Organization-specific login page
- `/:slug/auth/callback` - Magic link callback handler

### Protected Routes (Guarded)
- `/:slug/dashboard` - Organization dashboard
- `/:slug/tasks` - Task management
- `/:slug/files` - File management
- `/:slug/kb` - Knowledge base
- `/:slug/profile` - User profile

## Implementation Components

### 1. AuthCallback Component (`/apps/web/src/routes/auth/Callback.tsx`)

Handles magic link authentication and redirects users to the appropriate dashboard.

```tsx
// Key features:
- Extracts slug from URL params
- Handles magic link tokens from URL
- Redirects to next parameter or default dashboard
- Shows loading and error states
```

### 2. Guarded Component (`/apps/web/src/components/Guarded.tsx`)

Enforces organization membership for protected routes.

```tsx
// Key features:
- Checks if user is authenticated
- Verifies user belongs to the organization (by slug)
- Shows access denied for unauthorized users
- Provides fallback navigation options
```

### 3. SluggedLogin Component (`/apps/web/src/routes/auth/SluggedLogin.tsx`)

Organization-specific login page that sends magic links to the correct callback URL.

```tsx
// Key features:
- Displays organization name in UI
- Sends magic links to slugged callback URLs
- Includes next parameter for post-login redirect
- Shows success/error states
```

### 4. Updated AuthContext (`/apps/web/src/context/AuthContext.tsx`)

Enhanced to support slugged redirects in magic link generation.

```tsx
// Key changes:
- signInWithMagicLink now accepts slug parameter
- Generates proper callback URLs with next parameter
- Maintains backward compatibility
```

### 5. Routing Configuration (`/apps/web/src/App.tsx`)

Updated to support slugged routes with proper guards.

```tsx
// Route structure:
<Route path="/:slug/login" element={<SluggedLogin />} />
<Route path="/:slug/auth/callback" element={<AuthCallback />} />
<Route path="/:slug/*" element={
  <Guarded>
    <Routes>
      <Route path="dashboard" element={<ClientDashboard />} />
      <Route path="tasks" element={<TaskList />} />
      // ... other protected routes
    </Routes>
  </Guarded>
} />
```

## Database Schema

### Core Tables
- `orgs(id, name, slug, status, settings)` - Organizations with unique slugs
- `companies(id, org_id, name, slug, status, settings)` - Companies within orgs
- `contacts(id, org_id, company_id, supabase_user_id, email, role)` - Users linked to Supabase auth

### Helper View
- `user_orgs` - Maps Supabase users to their organization memberships for RLS

## Row Level Security (RLS) Policies

The system includes comprehensive RLS policies that ensure:
- Users can only see organizations they belong to
- Users can only access companies within their organizations
- Users can only view contacts within their organizations
- Admin/internal users can modify data within their organizations

### Key Policies
```sql
-- Users can view their orgs
CREATE POLICY "Users can view their orgs" ON orgs
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.user_orgs uo
    WHERE uo.user_id = auth.uid() AND uo.org_id = orgs.id
  )
);

-- Similar policies for companies and contacts tables
```

## Usage Examples

### 1. User Login Flow

1. User visits `https://portal.qially.com/zai/login`
2. Enters email address
3. Clicks "Send magic link"
4. Receives email with link to `https://portal.qially.com/zai/auth/callback?next=/zai/dashboard`
5. Clicks link, gets authenticated, redirected to `/zai/dashboard`

### 2. Access Control

- User tries to access `/zai/dashboard` → Guarded component checks membership
- User belongs to "zai" org → Access granted
- User doesn't belong to "zai" org → Access denied with error message

### 3. Magic Link Generation

```tsx
// In SluggedLogin component
const { error } = await supabase.auth.signInWithOtp({
  email,
  options: {
    shouldCreateUser: false,
    emailRedirectTo: `https://portal.qially.com/${slug}/auth/callback?next=/${slug}/dashboard`
  }
});
```

## Security Features

### 1. Route-Level Security
- `Guarded` component checks organization membership
- Unauthorized users see access denied page
- Automatic redirect to login for unauthenticated users

### 2. Database-Level Security
- RLS policies enforce tenant isolation
- Users can only access data within their organizations
- Policies work even if application logic is bypassed

### 3. Magic Link Security
- Links are organization-specific
- Include next parameter for proper redirect
- Use `shouldCreateUser: false` to prevent unauthorized signups

## Configuration Requirements

### 1. Supabase Auth Settings
Add these URLs to your Supabase Auth → URL Configuration:
- `https://portal.qially.com/*/auth/callback` (wildcard for all orgs)

### 2. Environment Variables
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_API_URL=http://localhost:8787
```

### 3. Database Setup
Run the RLS policies SQL file:
```bash
# Execute the SQL in your Supabase SQL Editor
psql -f slugged_auth_rls_policies.sql
```

## Edge Cases Handled

### 1. Wrong Organization Access
- User clicks magic link for wrong org → Access denied
- Clear error message with navigation options

### 2. Multiple Organization Membership
- User belongs to multiple orgs → Can access each via their slug
- No cross-org data leakage due to RLS

### 3. Invalid Slugs
- User tries non-existent org slug → 404 or access denied
- Graceful error handling

### 4. Session Management
- User signs out → Redirected to appropriate login page
- Session expires → Automatic redirect to login

## Testing the Implementation

### 1. Create Test Data
```sql
-- Insert test organization
INSERT INTO orgs (name, slug) VALUES ('Test Org', 'testorg');

-- Insert test user
INSERT INTO contacts (org_id, supabase_user_id, email, role)
SELECT id, 'test-user-uuid', 'test@example.com', 'external'
FROM orgs WHERE slug = 'testorg';
```

### 2. Test Login Flow
1. Visit `http://localhost:5173/testorg/login`
2. Enter test email
3. Check email for magic link
4. Click link and verify redirect to dashboard

### 3. Test Access Control
1. Try accessing `http://localhost:5173/otherorg/dashboard`
2. Verify access denied message
3. Test with different user accounts

## Benefits

1. **Clean URLs**: Each organization has its own namespace
2. **Secure**: Multiple layers of security (route guards + RLS)
3. **Scalable**: Easy to add new organizations
4. **User-Friendly**: Clear error messages and navigation
5. **Maintainable**: Well-structured components and policies

## Future Enhancements

1. **Organization Switching**: Allow users to switch between orgs they belong to
2. **Custom Domains**: Support `org.example.com` instead of `portal.qially.com/org`
3. **Invite System**: Streamlined user invitation flow
4. **Audit Logging**: Track access attempts and security events
5. **SSO Integration**: Support for SAML/OIDC providers

This implementation provides a robust, secure foundation for multi-tenant authentication that can scale with your organization's needs.
