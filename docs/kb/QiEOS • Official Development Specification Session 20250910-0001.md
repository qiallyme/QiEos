---
title: QI‑EOS Dev Workflow & Session Log
author: Q (QiAlly)
project: QI‑EOS (primary) + QI‑LA (secondary)
repo: (primary) QI‑EOS • (secondary) QI‑LA
status: active
last_reviewed: 2025-09-10
labels: [devlog, cursor, agents]
---

# 🔁 Daily Quick-Start (Open Cursor)

1. **Sync context**  
   - Read the latest *Session Log* entry below.  
   - Run `git status` and skim open PRs/issues.
2. **Kickoff prompt in Cursor (paste block):**  
   ```text
   You are my repo concierge. Read the repo, summarize current state in 5 bullets, list top 3 next actions aligned to the Dev Plan below, and generate a safe task list. Never delete; if needed, move files to .trash/ with timestamp. Ask before running commands that change files.
   ```
3. **Pick the highest-impact task** from the *Today Focus* list and move it to **In‑Progress**.  
4. **Timebox**: 25–50 min block. Update the *Session Log* as you go.  
5. **Commit** with conventional commits; link to task id from *Task Board*.  
6. **PR + Note**: open a small PR, paste the *Change Summary* template.

---

# 🧭 Dev Plan (MVP Anchor)

- **Codebases**: QI‑EOS (primary), QI‑LA (secondary/companion).  
- **Follow the repo README** for stack specifics; keep the workflow generic and reversible.  
- **Principles**: smallest PRs, safe changes (no deletes; use `.trash/`), working software over grand refactors.  
- **Sprint goal**: verify skeleton builds, wire agent prompts, and keep Session Log current.

---

# ✅ Definition of Done (per task)

- Unit/Smoke tested locally.  
- Build passes; deploy preview OK.  
- Docs updated in this file.  
- Reversible (no destructive ops; .trash/ if needed).  

---

# 🔐 Safety Rules for Agents

- **Never delete**, only move to `.trash/YYYY‑MM‑DD/`.  
- Require confirmation before running commands that change files or infra.  
- Log all actions under *Session Log > Steps*.  

---

# 🧩 Working Agreements

- **Small PRs**, one thing per PR.  
- **Conventional commits**: `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `style:`, `ci:`.  
- **Branch naming**: `feat/<module>-<slug>` e.g. `feat/auth-otp-flow`.  

---

# 🗂️ Repo Map (keep updated)

```
/ (root)
  /src
    /components
    /pages
    /modules
      /auth
      /dashboard
      /chat
      /tickets
      /tasks
  /public
  /scripts
  /docs
  .trash/
```

---

# 📋 Today Focus

- [ ] Point this devlog at **QI‑EOS** & add `/docs/agents.md` to that repo.  
- [ ] Run **Auditor** against QI‑EOS; fix the top finding only; open a tiny PR.  
- [ ] Confirm envs per QI‑EOS README (document in `/docs/env.md`).

---

# 🧠 Agent Prompts (save to /docs/agents.md)

## Repo Concierge (Cursor)
```
ROLE: Repo Concierge
PRINCIPLES: Truth > speed; reversible changes; smallest diff; ask before mutating.
SAFETY: Never delete; stage to .trash/TIMESTAMP; print diff before apply.
TASK: On start, summarize repo, list top 3 next actions from this Dev Plan, propose a 30‑min plan.
OUTPUT: Markdown summary + checklists fit for this devlog.
```

## Auditor
```
ROLE: Auditor
TASK: Scan repo, flag risky patterns, missing envs, miswired routes, dead code, secrets, and outdated deps.
OUTPUT: Findings table (severity, file, line, fix), then minimal diff to fix top 3.
```

---

# 🧾 Session Log

> Use one entry per focused block (25–50 min). Keep it terse but useful.

## 2025‑09‑10 — Restart after break
- **Context**: Returning from break; need workflow and confirmation of agent setup.
- **Goal**: Re‑establish Cursor quickstart, add devlog, verify agent prompts present.
- **Steps**:
  1) Created this devlog; added Quick‑Start and Agent Prompts.  
  2) Plan: add `/docs/agents.md` to repo; wire Cursor startup prompt.  
- **Decisions**: Keep Supabase OTP for now; Cloudflare swap later if desired.  
- **Next**: See *Next Actions* below.

## 2025‑09‑10 — Repo correction to QI‑EOS
- **Context**: Previous doc referenced QiPortals; user clarified: focus repos are **QI‑EOS** and **QI‑LA**.  
- **Goal**: Retarget devlog + tasks to QI‑EOS.  
- **Steps**: Updated header (title/project/repo), Dev Plan, Today Focus.  
- **Next**: Create `/docs/agents.md` in QI‑EOS; run Auditor; open PR with Change Summary template.

---

# 🧱 Decisions Log

- **2025‑09‑10**: Primary repo set to **QI‑EOS**; **QI‑LA** tracked as secondary.  

---

# 🧰 Environment Checklist

- [ ] Cloudflare Pages connected to GitHub repo; preview deploys enabled.  
- [ ] Pages env vars: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, etc.  
- [ ] Worker KV/DB bounds (if used) documented in `/docs/env.md`.  
- [ ] Supabase: tables created (clients, tickets, updates), RLS policies noted.  

---

# 🗺️ Next Actions (tiny steps)

1) Add `/docs/agents.md` with Repo Concierge + Auditor prompts (copy from above).  
2) Commit & push; paste PR link here; run Auditor and fix top 1 issue.

---

# 📦 Change Summary Template (paste in PR)

**What changed**: _one‑liner_.  
**Why**: aligns to Dev Plan (goal).  
**How to test**: steps.  
**Rollback**: revert commit; restore from `.trash/` if files moved.  

---

# 📝 Notes

- Keep this file open while coding; update *Session Log* as the source of truth.

