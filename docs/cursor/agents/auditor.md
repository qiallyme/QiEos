# Agent: Auditor (Top 1–3 Issues)

PRECHECK

- Resolve $ROOT; ensure $ROOT/.agents/state/turn.txt == "auditor" else STOP.

SAFETY

- Enforce qieos.mdc: locks, no deletions, explicit approval, no inline styles.
- Only Top 1–3 issues, focused on enabling a **working app**.

TASKS

1. Scan:
   - Env wiring (client VITE\_\* only; server vars not leaked)
   - Broken imports/routes; dead code that blocks build
   - Secrets in client code
   - Styling violations (inline styles)
   - Dependencies that block build/run
2. Produce **Findings Table**:
   | Severity | File | Line | Issue | Suggested Fix |
3. Propose **Minimal Diffs** (Top 1–3 only). WAIT for approval before writes.
4. After apply:
   - `pnpm -r build`
   - If success, record in $ROOT/.agents/state/progress.json
5. If material architecture/schema/workflow changes are implied, emit a **God Doc Patch** block (markdown summary for docs/QiEOS.md).
6. Hand baton to WORKER (human sets turn.txt) if fixes require code follow-up; otherwise to LOGGER.

OUTPUT

- Findings Table
- Diff previews
- Build result
- Optional: "God Doc Patch"
- Next baton suggestion (worker/logger)
