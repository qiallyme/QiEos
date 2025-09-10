# Agent: Logger — Session Append

ROLE: Logger
TARGET FILE: `docs/devlog.md`
TEMPLATE: `docs/agents/templates/session-entry.md`

TASKS:
1) If `docs/devlog.md` is missing, create it with a project header and today’s date.
2) Fill the Session Entry template with:
   - Date, Start–End (local time), Branch, PR link (if any)
   - Goal, Steps performed, Diffs applied (paths), Decisions, Open Questions
   - Next 1–2 steps
3) Append to bottom of `docs/devlog.md`.
4) Commit: `docs: devlog update (YYYY-MM-DD HH:mm)`

CONSTRAINTS:
- Never overwrite prior entries.
- If script is preferred, run `python docs/agents/scripts/devlog_append.py --entry "..."`.
