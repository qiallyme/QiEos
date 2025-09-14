# Agent Workflow
Love this. You’re describing a tiny **agent orchestra** with clear roles and a baton. We can do this with **four agents + one conductor** and a super-simple **turn-based sync** that works inside Cursor today (no plugins needed): a text “semaphore” file that each agent checks before acting.

Here’s the setup you can drop into your repo:

---

# 🧠 Agents (Planner → Worker → Auditor → Worker … → Logger)

We’ll add five prompts and a tiny turn-based protocol:

- **Planner** (`planner.md`) — makes/updates the plan; never edits code.
    
- **Worker** (`worker.md`) — implements the next planned step; smallest diffs.
    
- **Auditor** (`auditor.md`) — checks and proposes top 1–3 fixes; no scope creep.
    
- **Logger** (`logger.md`) — appends to `docs/DEV_LOG.md`; commits the log.
    
- **Conductor** (`conductor.md`) — controls the turn order and resets the baton.
    

And a dead-simple baton:

- `.agents/state/turn.txt` → contains exactly one of: `planner|worker|auditor|logger|close`
    
- `.agents/state/plan.json` → current plan (IDs, steps, status)
    
- `.agents/state/progress.json` → results (build/test outcomes, diffs applied, notes)
    
- `.agents/state/session.md` → running scratch notes for Logger
    

Each agent **must** precheck the baton before acting. If it’s not their turn, they print a one-liner and stop.

---

## 1) Directory layout (additions)


docs/
  cursor/
    agents/
      [[planner]]
      [[worker]].md
      [[auditor]].md        # (your updated one stays, but with precheck)
      [[logger]].md         # (your updated one stays, but with precheck)
      [[conductor]].md
      scripts/
        [[run_day]].ps1
        [[devlog_append]].py     # already exists (ensure git-root-safe)
        [[snapshot]].py          # already exists (ensure git-root-safe)
    templates/
      [[session-entry]].md       # your session template
.agents/
  state/
    [[turn]].txt
    [[plan]].json
    [[progress]].json
    [[session]].md


## 2) Conductor script (one-click loop)

**`docs/cursor/agents/scripts/run_day.ps1`**

```powershell
#Requires -Version 5
$ErrorActionPreference = "Stop"

# Always operate from Git root
$gitRoot = (git rev-parse --show-toplevel).Trim()
if (-not $gitRoot) { throw "Not in a Git repo." }
Set-Location $gitRoot

$stateDir = Join-Path $gitRoot ".agents\state"
New-Item -ItemType Directory -Force -Path $stateDir | Out-Null

$turn = Join-Path $stateDir "turn.txt"
$plan = Join-Path $stateDir "plan.json"
$prog = Join-Path $stateDir "progress.json"
$scratch = Join-Path $stateDir "session.md"

# Initialize if missing
if (-not (Test-Path $turn)) { "planner" | Set-Content -Encoding UTF8 $turn }
if (-not (Test-Path $plan)) { "{}" | Set-Content -Encoding UTF8 $plan }
if (-not (Test-Path $prog)) { "{}" | Set-Content -Encoding UTF8 $prog }
if (-not (Test-Path $scratch)) { "# Session scratch`n" | Set-Content -Encoding UTF8 $scratch }

Write-Host "Git root: $gitRoot"
Write-Host "Using baton at: $turn"

# Start-of-day snapshot (read-only)
python docs/cursor/agents/scripts/snapshot.py --mode quick --flat-text --bundle --outdir snapshots

# Open Cursor on repo (optional)
$cursor = "$env:LOCALAPPDATA\Programs\cursor\Cursor.exe"
if (Test-Path $cursor) { Start-Process $cursor "--folder `"$gitRoot`"" }

Write-Host "`n== Agent loop =="
while ($true) {
  $t = (Get-Content $turn -Raw).Trim().ToLower()
  switch ($t) {
    "planner" { Write-Host "🧭 Planner’s turn. Open docs/cursor/agents/planner.md and run it."; }
    "worker"  { Write-Host "🔧 Worker’s turn. Open docs/cursor/agents/worker.md and run it."; }
    "auditor" { Write-Host "🔍 Auditor’s turn. Open docs/cursor/agents/auditor.md and run it."; }
    "logger"  { Write-Host "📝 Logger’s turn. Open docs/cursor/agents/logger.md and run it."; }
    "close"   { Write-Host "✅ Closing day. Running final snapshot and exiting loop."; break }
    default   { Write-Host "Unknown turn token '$t'. Set to 'planner'."; "planner" | Set-Content $turn }
  }
  $next = Read-Host "Set next turn (planner/worker/auditor/logger/close)"
  if ($next -notin @("planner","worker","auditor","logger","close")) {
    Write-Host "Invalid; keeping current." -ForegroundColor Yellow
  } else {
    $next | Set-Content -Encoding UTF8 $turn
  }
}
# Final snapshot for the day
python docs/cursor/agents/scripts/snapshot.py --mode full --bundle --outdir snapshots
Write-Host "🎬 Day closed."
```

This doesn’t “drive” Cursor automatically (Cursor can’t be remote-controlled), but it gives you a **single loop** to run, sets the baton, and reminds you who goes next. You keep your hands on the wheel.

---

## 3) Agent prompts (drop-in with baton precheck)

### `docs/cursor/agents/planner.md`

```
# Agent: Planner (Kickoff)

PRECHECK (must pass)
- Resolve $ROOT via: `git rev-parse --show-toplevel`
- Read $ROOT/.agents/state/turn.txt; if not "planner", print "Not my turn (planner)" and STOP.
- All file reads use $ROOT-absolute paths. Never write files.

PRINCIPLES
- Plan before code. Never mutate files.
- Respect qieos.mdc (locks, no deletions, explicit approval, no inline styles).
- Drive toward a WORKING APP: build/run/auth/migrations/core routes.

TASKS
1) Read context:
   - $ROOT/docs/DEV_LOG.md (latest entry: What/Why/Next)
   - $ROOT/docs/QiEOS.md (architecture/schema/workflows)
   - `git status` (summarize untracked/modified)
2) Summarize repo state in ≤5 bullets (include any blockers).
3) Propose a plan:
   - 3–5 steps, each with:
     - id (e.g., STEP-1), goal, files to touch, success criteria, est. time (≤50m total)
   - MUST respect locks. If change requires architecture/schema/workflow updates, mark `requires_godoc=true`.
4) Print **Diff Previews** for STEP-1 ONLY (no writes).
5) Save/Update plan:
   - Write the JSON plan content to stdout in a fenced block labeled PLAN-JSON.
   - Human will copy it into $ROOT/.agents/state/plan.json (or you may request a write if tools enabled).
6) WAIT for human: “yes, apply STEP-1” or “replan”.

OUTPUT
- “Repo State” bullets
- “Proposed Plan” checklist
- “Diff Preview (STEP-1)”
- PLAN-JSON fenced block
- “Ready to apply STEP-1? (yes/no)”
```

---

### `docs/cursor/agents/worker.md`

```
# Agent: Worker (Implementor)

PRECHECK
- Resolve $ROOT; ensure $ROOT/.agents/state/turn.txt == "worker" else STOP.
- Load $ROOT/.agents/state/plan.json; pick the first step with status: "pending".
- Respect locks & qieos.mdc.

PRINCIPLES
- Smallest safe diff. No deletions (move to .trash/YYYY-MM-DD/… if removal requested).
- No inline styles in JSX/HTML; use CSS Modules/Tailwind.
- Print diffs and WAIT for “yes, apply” before writing.

TASKS
1) Show STEP summary: id, goal, files, success criteria.
2) Propose the minimal diff(s) to complete this step (unified hunks).
3) WAIT for approval. On “yes, apply”:
   - Apply exactly the approved hunks.
   - Run quick checks:
     - `pnpm -r build`
     - `pnpm -r test` (if present)
4) Update $ROOT/.agents/state/progress.json:
   - Append an entry: { stepId, appliedFiles, buildOK, testOK, notes }
5) If success, mark the step “done” (request Planner to update plan.json) or print a tiny PLAN-JSON patch:
   - `{ "STEP-1": { "status": "done" } }`
6) Hand baton to AUDITOR (human will set turn.txt).

OUTPUT
- STEP summary
- Diff preview
- After apply: build/test results
- PLAN-JSON PATCH (if any)
- “Hand to auditor”
```

---

### `docs/cursor/agents/auditor.md` (yours, with baton + scope)

```
# Agent: Auditor (Top 1–3 Issues)

PRECHECK
- Resolve $ROOT; ensure $ROOT/.agents/state/turn.txt == "auditor" else STOP.

SAFETY
- Enforce qieos.mdc: locks, no deletions, explicit approval, no inline styles.
- Only Top 1–3 issues, focused on enabling a **working app**.

TASKS
1) Scan:
   - Env wiring (client VITE_* only; server vars not leaked)
   - Broken imports/routes; dead code that blocks build
   - Secrets in client code
   - Styling violations (inline styles)
   - Dependencies that block build/run
2) Produce **Findings Table**:
   | Severity | File | Line | Issue | Suggested Fix |
3) Propose **Minimal Diffs** (Top 1–3 only). WAIT for approval before writes.
4) After apply:
   - `pnpm -r build`
   - If success, record in $ROOT/.agents/state/progress.json
5) If material architecture/schema/workflow changes are implied, emit a **God Doc Patch** block (markdown summary for docs/QiEOS.md).
6) Hand baton to WORKER (human sets turn.txt) if fixes require code follow-up; otherwise to LOGGER.

OUTPUT
- Findings Table
- Diff previews
- Build result
- Optional: “God Doc Patch”
- Next baton suggestion (worker/logger)
```

---

### `docs/cursor/agents/logger.md` (yours, with baton + strict path)

```
# Agent: Logger (Session Append)

PRECHECK
- Resolve $ROOT; ensure $ROOT/.agents/state/turn.txt == "logger" else STOP.

TARGETS
- Append to: $ROOT/docs/DEV_LOG.md
- Template: $ROOT/docs/cursor/agents/templates/session-entry.md

TASKS
1) Read $ROOT/.agents/state/plan.json and progress.json; collect:
   - Steps done, diffs applied (paths), decisions, build/test outcomes
   - Open Questions; Next 1–2 Steps
   - Optional snapshot name(s)
2) Render the session entry using the template. PRINT DIFF; wait for approval.
3) On approval: append to DEV_LOG.md.
4) Commit:
   ```powershell
   git add docs/DEV_LOG.md
   git commit -m "docs: devlog update ($(Get-Date -Format 'yyyy-MM-dd HH:mm'))"
```

5. If PR exists, append its link into the same entry (small follow-up diff).
    

RULES

- Abort if target path ≠ $ROOT/docs/DEV_LOG.md.
    
- Respect lock markers.
    

OUTPUT

- Rendered markdown block
    
- Exact diff preview
    
- Done message with devlog path
    

```

---

### `docs/cursor/agents/conductor.md` (optional helper prompt)

```

# Agent: Conductor (Orchestrator)

ROLE

- Switch turn between agents using $ROOT/.agents/state/turn.txt
    
- Keep the loop Planner → Worker → Auditor → Worker … → Logger
    
- End day with “close” turn.
    

TASKS

- When asked “next”, set turn.txt to the requested agent.
    
- If asked “status”, summarize plan.json + progress.json + current turn.
    
- If asked “replan”, set turn.txt=planner and ping Planner.
    

```

---

## 4) How you use it (day in the life)

1) **Start**  
   - Run `docs/cursor/agents/scripts/run_day.ps1`  
   - It snapshots and sets turn=`planner`
2) **Planner** makes/updates plan (prints PLAN-JSON); you approve; set next turn=`worker`
3) **Worker** implements STEP-1 (tiny diff → build/test → progress.json); set next turn=`auditor`
4) **Auditor** fixes Top 1–3 (if any) → build/test; suggests next baton (`worker` if fixes need follow-up, else `logger`)
5) Loop Worker ↔ Auditor as needed.  
6) **Logger** appends session entry to `docs/DEV_LOG.md` and commits.
7) Conductor `close` → final snapshot.

Everything happens safely, visibly, and with a shared plan/progress state.

---

## 5) Safety & discipline baked-in

- **Wrong directory problem** is solved: every agent’s PRECHECK resolves `$ROOT` via `git rev-parse --show-toplevel` and uses absolute paths (they refuse to run if not in the repo).
- **Locks honored** (folder/file/section); **no deletions**; **inline styles banned**; **diffs then approval**.
- **God Doc stays true**: Auditor/Planner emit God Doc patches when architecture/schema/workflow change.
- **Traceability**: Logger pulls facts from `plan.json` and `progress.json` so your `DEV_LOG.md` is accurate.

---

Want me to generate the actual **files** (the five prompts + the PS1) with these contents so you can paste them straight in?
```