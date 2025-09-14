#Requires -Version 5
param(
  [switch]$Bundle,
  [switch]$FlatText
)

$ErrorActionPreference = "Stop"
$repo = Split-Path -Parent $PSCommandPath | Split-Path -Parent  # repo root if script is scripts/kickoff.ps1
Set-Location $repo

Write-Host "== QiEOS Kickoff ==" -ForegroundColor Cyan

# 1) Pull latest
git pull
Write-Host "Pulled latest." -ForegroundColor DarkGray

# 2) Snapshot (read-only)
$py = "python"
if (-not (Get-Command $py -ErrorAction SilentlyContinue)) { $py = "py" }
$flags = @("--mode","quick","--outdir","snapshots")
if ($Bundle)   { $flags += "--bundle" }
if ($FlatText) { $flags += "--flat-text" }

& $py "scripts/snapshot.py" @flags

# 3) Show git status and ask to proceed
git status
$ans = Read-Host "Continue to session start commit? (y/N)"
if ($ans -notin @("y","Y")) { Write-Host "Aborted by user."; exit 0 }

# 4) Start session commit
git add .
git commit -m ("chore(session): start " + (Get-Date -Format "yyyy-MM-dd HH:mm")) | Out-Null

# 5) Open Cursor (optional – comment out if already running)
# Adjust path if needed:
$cursor = "$env:LOCALAPPDATA\Programs\cursor\Cursor.exe"
if (Test-Path $cursor) {
  Start-Process -FilePath $cursor -ArgumentList @("--folder",$repo) -WindowStyle Normal
}

# 6) Auditor reminder (manual in Cursor)
Write-Host "`nOpen Cursor and run Auditor (docs/agents/auditor.md). Fix top 1–3 issues only." -ForegroundColor Yellow
$ans = Read-Host "Press Enter when Auditor fixes are applied (or type 'abort' to stop)"
if ($ans -eq "abort") { Write-Host "Aborted by user."; exit 0 }

# 7) Logger reminder (manual in Cursor)
Write-Host "Run Logger to append today's session entry (docs/agents/logger.md)." -ForegroundColor Yellow
$null = Read-Host "Press Enter to continue"

# 8) PR step
$ans = Read-Host "Create PR now? (y/N)"
if ($ans -in @("y","Y")) {
  git push -u origin HEAD
  Write-Host "Pushed. Create PR in GitHub, then paste the PR link into today's devlog entry." -ForegroundColor Green
} else {
  Write-Host "Skipping PR push for now." -ForegroundColor DarkGray
}

Write-Host "`nKickoff complete." -ForegroundColor Cyan
