#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Run a miniapp from the root directory.

.DESCRIPTION
    This script allows you to run any miniapp from the root directory without
    having to navigate to the specific miniapp directory.

.PARAMETER AppName
    The name of the miniapp to run (e.g., "qivect-dropbox", "qi_rag_private")

.EXAMPLE
    .\scripts\run_miniapp.ps1 -AppName "qivect-dropbox"
#>

param(
    [Parameter(Mandatory=$true)]
    [string]$AppName
)

$RootDir = (Get-Item -Path $PSScriptRoot).Parent.FullName
$AppDir = Join-Path -Path $RootDir -ChildPath "miniapps" -AdditionalChildPath $AppName

if (-not (Test-Path $AppDir)) {
    Write-Error "Miniapp '$AppName' not found in $AppDir"
    Write-Host "Available miniapps:"
    Get-ChildItem -Path (Join-Path -Path $RootDir -ChildPath "miniapps") -Directory | ForEach-Object {
        Write-Host "  - $($_.Name)"
    }
    exit 1
}

$AppPy = Join-Path -Path $AppDir -ChildPath "app.py"
if (-not (Test-Path $AppPy)) {
    Write-Error "app.py not found in $AppDir"
    exit 1
}

Write-Host "Starting $AppName..."
Write-Host "Working directory: $AppDir"
Write-Host ""

# Change to the app directory and run it
Push-Location $AppDir
try {
    & python app.py
}
finally {
    Pop-Location
}
