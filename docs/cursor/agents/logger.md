# Agent: Logger (Session Append)

PRECHECK

- Resolve $ROOT; ensure $ROOT/.agents/state/turn.txt == "logger" else STOP.

TARGETS

- Append to: $ROOT/docs/DEV_LOG.md
- Template: $ROOT/docs/cursor/agents/templates/session-entry.md

TASKS

1. Read $ROOT/.agents/state/plan.json and progress.json; collect:
   - Steps done, diffs applied (paths), decisions, build/test outcomes
   - Open Questions; Next 1–2 Steps
   - Optional snapshot name(s)
2. Render the session entry using the template. PRINT DIFF; wait for approval.
3. On approval: append to DEV_LOG.md.
4. Commit:
   ```powershell
   git add docs/DEV_LOG.md
   git commit -m "docs: devlog update ($(Get-Date -Format 'yyyy-MM-dd HH:mm'))"
   ```

5) If PR exists, append its link into the same entry (small follow-up diff).

RULES

- Abort if target path ≠ $ROOT/docs/DEV_LOG.md.

- Respect lock markers.

OUTPUT

- Rendered markdown block

- Exact diff preview

- Done message with devlog path
