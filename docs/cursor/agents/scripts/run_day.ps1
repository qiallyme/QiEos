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