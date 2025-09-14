---
title: QiEOS Daily Kickoff → Close → Resume
status: active
last_updated: 2025-09-13
---

# 🌀 Daily Kickoff → Close → Resume (Human + Agent)

This is the one doc you need for a dev day:
- Start the day
- Work safely with agents
- Close your session cleanly
- Know exactly how to resume tomorrow

> **Safety is implicit.** All steps obey `qieos.mdc` (locks, no deletions, explicit approval, no inline styles) and the God Doc in `docs/QiEOS.md`.

---

## 📁 Paths & Files (reference only)

- **Workspace Root**: `Q:\` (where docs/ and QiEos/ live)
- **Repo Root**: `Q:\QiEos\` (the actual QiEOS monorepo)
- **God Doc**: `Q:\docs\QiEOS.md`
- **Dev Log**: `Q:\docs\DEV_LOG.md`
- **Trash**: `Q:\QiEos\.trash\YYYY-MM-DD\...`
- **Agent prompts**:
  - Kickoff → `Q:\docs\cursor\agents\kickoff.md`
  - Auditor → `Q:\docs\cursor\agents\auditor.md`
  - Logger → `Q:\docs\cursor\agents\logger.md`
- **Agent templates**:
  - Session entry → `Q:\docs\cursor\agents\templates\session-entry.md`
  - PR change summary → `Q:\docs\cursor\agents\templates\change-summary.md`
- **Scripts**:
  - Snapshot (Python) → `Q:\docs\cursor\agents\scripts\snapshot.py`
  - Kickoff (PS1) → `Q:\docs\cursor\agents\scripts\kickoff.ps1`
  - Code extraction (PS1) → `Q:\docs\cursor\agents\scripts\code_extraction.ps1`

---

## 1) Verify Environment

```powershell
cd Q:\QiEos
git status
git pull
```

* Ensure you’re on the correct branch (main or feature).
* Run a snapshot before changes:

```powershell
cd Q:\
python docs/cursor/agents/scripts/snapshot.py --mode quick --flat-text --bundle --outdir snapshots
```

* **Optional one-click start**:
  Desktop shortcut target:

  ```powershell
  powershell.exe -ExecutionPolicy Bypass -File "Q:\docs\cursor\agents\scripts\kickoff.ps1" -Bundle -FlatText
  ```

  This:

  1. Runs `git pull`
  2. Creates a **read-only snapshot** (zip + manifest + optional code\_extraction.txt + git bundle)
  3. Pauses for **explicit approval** before starting the session

---

## 2) Kickoff (plan before code)

Open **Cursor** at repo root. In Cursor, open and paste the prompt from:

```
Q:\docs\cursor\agents\kickoff.md
```

Approve the plan only after it shows **diff previews** (no writes yet).
Say **“yes, apply”** when ready.

---

## 3) Snapshot (read-only) & Start Session Commit

If you didn't use the .ps1 launcher, take a snapshot now:

```powershell
cd Q:\
python docs/cursor/agents/scripts/snapshot.py --mode quick --flat-text --bundle --outdir snapshots
```

Start the session commit:

```powershell
cd Q:\QiEos
git add .
git commit -m "chore(session): start $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
```

---

## 4) Minimal Work Loop (small, approved diffs)

Repeat this loop for each change:

* **Plan**: propose change in Cursor (diff preview only). Respect locks (`LOCKED.md`, `🚫 LOCKED`, `LOCK-START/END`).
* **Approve**: if safe and surgical, say **“yes, apply.”**
* **Build & test**:

  ```powershell
  cd Q:\QiEos
  pnpm -r build
  pnpm -r test
  #Optional quick smoke check (adjust to your app)
  #pnpm -r dev # or: pnpm start / electron . / uvicorn ...
  ```
* **Commit**:

  ```powershell
  cd Q:\QiEos
  git add .
  git commit -m "feat/fix/chore: <one-line summary>"
  ```

---

## 5) Audit (top 1–3 issues only)

Open and paste the prompt from:

```
Q:\docs\cursor\agents\auditor.md
```

Rules:

* Fix only the top **1–3** findings.
* Abort if diffs touch locked files/folders/sections.
* If JSX `style={}` appears → propose Inline→CSS Modules refactor (preview only).

Approve minimal diffs → apply → commit.

---

## 6) Log the Session (append to DEV_LOG)

Open and use the Logger prompt from:

```
Q:\docs\cursor\agents\logger.md
```

Tell Logger to apply the template at:

```
Q:\docs\cursor\agents\templates\session-entry.md
```

Logger fills fields (time, branch/PR, what/why/how/test/diffs/decisions/rollback/open Qs/next steps), prints the markdown diff, waits for approval, then appends to:

```
Q:\docs\DEV_LOG.md
```

---

## 7) PR Prep (if this block is PR-worthy)

Push your branch:

```powershell
cd Q:\QiEos
git push -u origin HEAD
```

Open a PR in GitHub.
PR description: paste the template at:

```
Q:\docs\cursor\agents\templates\change-summary.md
```

Copy PR link → have Logger update today’s DEV_LOG entry with the link.

---

## 8) Close the Session (end of day)

* **Final snapshot (optional but recommended)**:

  ```powershell
  cd Q:\
  python docs/cursor/agents/scripts/snapshot.py --mode full --bundle --outdir snapshots
  ```
* **Make resumption easy**:

  * Ensure DEV_LOG entry has **Next 1–2 Steps**.
  * Add a short `# TODO(next)` in the file you’ll touch first tomorrow.
* **Push final commits**:

  ```powershell
  cd Q:\QiEos
  git push
  ```
* If today changed architecture/schema/workflow, update the **God Doc**:

  ```powershell
  cd Q:\QiEos
  vim ../docs/QiEOS.md
  git add ../docs/QiEOS.md
  git commit -m "docs(godoc): update schema/workflow notes [$(Get-Date -Format 'yyyy-MM-dd')]"
  git push
  ```

---

## 9) Resume Tomorrow

```powershell
cd Q:\QiEos
git pull
code .   # or Cursor.exe --folder .
```

Open the latest session in:

```
Q:\docs\DEV_LOG.md
```

* Skim **What Changed**, **Open Questions**, **Next 1–2 Steps**.
* Re-run Kickoff (`Q:\docs\cursor\agents\kickoff.md`) for a new plan.
* If a PR is open, sync branch and continue.

---

## ✅ Non-Negotiables (enforced by `qieos.mdc`)

* **No deletions.** Move to `Q:\QiEos\.trash/YYYY-MM-DD/...`
* **Respect locks.** Abort if `LOCKED.md`, `🚫 LOCKED`, or `LOCK-START/END`.
* **Inline styles banned.** Never use `style={}`; always CSS Modules or Tailwind.
* **Explicit approval.** Agents show diffs; you must say **"yes, apply."**
* **Traceability.** Every applied change logged in `Q:\docs\DEV_LOG.md` with rollback notes.

---

## 🧰 Quick Commands (reference)

**Manual snapshot:**

```powershell
cd Q:\
python docs/cursor/agents/scripts/snapshot.py --mode quick --flat-text --bundle --outdir snapshots
```

**Open Cursor (default Windows path):**

```powershell
$env:LOCALAPPDATA\Programs\cursor\Cursor.exe --folder Q:\QiEos
```

**Code extraction only:**

```powershell
powershell.exe -ExecutionPolicy Bypass -File "Q:\docs\cursor\agents\scripts\code_extraction.ps1"
```
---
