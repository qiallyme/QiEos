# Safety Rules

1) **No deletions.** Move anything “removed” to `.trash/YYYY-MM-DD/…`.
2) **Ask before mutating.** Print planned diffs first; wait for explicit “yes”.
3) **Smallest diffs.** Prefer surgical edits over refactors.
4) **Traceability.** Every change updates `docs/devlog.md` with what/why/how/rollback.
5) **Secrets.** Never commit env values; use `.env*` and CI variables.
6) **Reversible.** Provide clear rollback notes in PRs and in the devlog entry.
7) **Respect structure.** Don’t move/rename without explaining impacts in the devlog.

> If unsure, stop and log a question in `docs/devlog.md` under “Open Questions”.
