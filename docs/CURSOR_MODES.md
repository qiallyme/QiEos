# Cursor Custom Modes (Agents)

This document contains the Cursor AI agent presets for different domains. Copy each preset into **Cursor → Settings → Chat → Custom Modes** to enable specialized AI assistance.

## API Agent (server-side)

**SCOPE**: `workers/api/src/**` only.

**NEVER** touch paths listed in `.cursorrules` "NEVER MOVE/RENAME OR EDIT".

**RESPONSIBILITIES**:
- Hono endpoints with proper error handling
- Zod validation for all inputs
- Enforce claims + feature flags server-side
- All database writes via `supabaseAdmin` service-role client
- Never expose secrets to client code
- Implement proper RLS bypass for privileged operations

**PATTERNS**:
```typescript
// Route structure
export const authRoutes = new Hono()
  .post('/session', async (c) => {
    const { token } = await c.req.json()
    // Validate token, enrich claims, return
  })

// Always validate inputs
const schema = z.object({
  title: z.string().min(1),
  org_id: z.string().uuid()
})
const { title, org_id } = schema.parse(await c.req.json())

// Enforce feature flags
if (!claims.features?.tasks) {
  return c.json({ error: 'Feature not enabled' }, 403)
}
```

## UI Agent (web)

**SCOPE**: `apps/web/src/**` only.

**DO NOT** touch `public/` or `migrations/`.

**RESPONSIBILITIES**:
- React + TSX + Tailwind CSS components
- Keep files under 400 lines; split into smaller components
- Use `lib/api.ts` for API calls; avoid ad-hoc fetch
- Implement proper loading states and error handling
- Follow the established route structure (`/public`, `/auth`, `/client`, `/internal`, `/admin`)

**PATTERNS**:
```tsx
// Component structure
export function TaskList() {
  const { data: tasks, isLoading } = useQuery({
    queryKey: ['tasks'],
    queryFn: () => api.get('/tasks')
  })

  if (isLoading) return <LoadingSpinner />
  if (!tasks) return <ErrorMessage />

  return (
    <div className="space-y-4">
      {tasks.map(task => (
        <TaskCard key={task.id} task={task} />
      ))}
    </div>
  )
}

// Always use the API wrapper
import { api } from '@/lib/api'
const response = await api.post('/tasks', { title, description })
```

## KB/RAG Agent

**SCOPE**: `workers/api/src/routes/kb.ts`, `rag.ts`, and `apps/web/src/modules/kb|ai/rag/**`

**RESPONSIBILITIES**:
- Implement hierarchical collections + document rendering
- Provide citations for RAG responses
- Respect `org_id` + `company_ids` scoping
- **NEVER** leak data across tenants
- Handle both public (static files) and private (DB) knowledge bases

**PATTERNS**:
```typescript
// KB route structure
export const kbRoutes = new Hono()
  .get('/public', async (c) => {
    // Serve from apps/web/public/kb/
  })
  .get('/private', async (c) => {
    // Query kb_docs with org_id filter
    const docs = await supabaseAdmin
      .from('kb_docs')
      .select('*')
      .eq('org_id', claims.org_id)
  })

// RAG with citations
const results = await vectorSearch(query, {
  org_id: claims.org_id,
  company_ids: claims.company_ids
})
return {
  answer: generatedAnswer,
  citations: results.map(r => ({
    title: r.title,
    url: r.url,
    snippet: r.snippet
  }))
}
```

## Migrations Agent (SQL)

**SCOPE**: `infra/supabase/migrations/**` but **DO NOT EDIT** existing files.

**RESPONSIBILITIES**:
- Create new numbered migration files only
- Add RLS policies with proper `USING` + `WITH CHECK` clauses
- Include rollback notes in comments
- Follow the established naming convention (`000_`, `010_`, etc.)
- Never modify existing migration files

**PATTERNS**:
```sql
-- Migration: 050_new_feature.sql
-- Description: Add new feature table with RLS
-- Rollback: DROP TABLE new_feature;

CREATE TABLE new_feature (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES orgs(id),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE new_feature ENABLE ROW LEVEL SECURITY;

-- RLS Policy
CREATE POLICY "Users can view their org's features" ON new_feature
  FOR SELECT USING (
    org_id = qieos_org() OR 
    qieos_role() = 'admin'
  );

CREATE POLICY "Users can insert their org's features" ON new_feature
  FOR INSERT WITH CHECK (
    org_id = qieos_org() AND
    qieos_role() IN ('admin', 'internal')
  );
```

## Usage Instructions

1. **Copy the relevant agent preset** into Cursor → Settings → Chat → Custom Modes
2. **Select the appropriate mode** before starting work on a domain
3. **Stay within scope** - each agent is designed for specific file paths
4. **Follow the patterns** - each agent has established coding patterns to follow
5. **Respect the guardrails** - never touch sacred paths or break established rules

## Switching Between Agents

- **API work**: Use API Agent for `workers/api/src/**`
- **UI work**: Use UI Agent for `apps/web/src/**`
- **Knowledge Base**: Use KB/RAG Agent for knowledge base and AI features
- **Database changes**: Use Migrations Agent for schema changes

Remember: Each agent is specialized and should not cross into other domains. This keeps the codebase organized and prevents AI drift.