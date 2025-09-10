# Editor Configuration & Workflow

## Cursor Custom Modes (Agents)

Use these custom modes for focused development:

- **API Agent**: Server-side development in `workers/api/src/**`
- **UI Agent**: Web frontend development in `apps/web/src/**`
- **KB/RAG Agent**: Knowledge base and RAG implementation
- **Migrations Agent**: SQL migrations in `infra/supabase/migrations/**`

## Workflow Best Practices

1. **Work in small diffs**: plan → approve → apply → run → iterate
2. **Keep sacred paths read-only**: Use Git skip-worktree and OS file locks
3. **Respect .cursorrules**: Never edit paths listed in "NEVER MOVE/RENAME OR EDIT"

## File Locking (Windows)

```bat
# Make files read-only
attrib +R Q:\qieos\workers\api\wrangler.toml
attrib +R Q:\qieos\infra\supabase\migrations\*.* /s
attrib +R Q:\qieos\apps\web\public\*.* /s

# Git skip-worktree (prevents accidental commits)
git update-index --skip-worktree workers/api/wrangler.toml
git update-index --skip-worktree infra/supabase/migrations/*
git update-index --skip-worktree apps/web/public/*

# Undo skip-worktree
git update-index --no-skip-worktree <path>
```

## Daily Flow

1. Turn on the right Agent/Mode for your task
2. Ensure `.cursorrules` is active (Global Rules)
3. Work in small, focused changes
4. Keep sacred paths protected and in `.cursorignore`
