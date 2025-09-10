# Agent: Auditor — Quick Scan

ROLE: Auditor
SCOPE: Entire repo, with focus on env wiring, routes, dead code, and security blunders.
SAFETY: See `docs/agents/safety-rules.md`.

TASK:
1) Scan for:
   - Missing envs or mistaken variable names (VITE_* vs non-VITE in client code).
   - Broken imports/routes and unused components.
   - Stale dependencies with known issues (list only top 3 to fix now).
   - Secrets accidentally committed.
2) Produce a **Findings Table**:
   | Severity | File | Line | Issue | Suggested Fix |
3) Propose **Minimal Diffs** for the top 3 fixes.
4) Ask for confirmation; on approval, apply fixes and call Logger.

OUTPUT:
- Findings table
- Minimal diffs
- “Ready to apply?” prompt
