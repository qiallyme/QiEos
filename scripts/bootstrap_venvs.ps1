<#!
# Create Python virtual environments for the cockpit and each miniapp.
#
# This script assumes you have Python installed and available in the PATH. It
# iterates over the cockpit and each miniapp directory and creates a `.venv`
# folder if one does not exist. It then installs any dependencies from
# `requirements.txt`.
#>  

$RootDir = (Get-Item -Path $PSScriptRoot).Parent.FullName

function Create-Venv {
    param([string]$Dir)
    Write-Host "Creating venv in $Dir/.venv"
    python -m venv "$Dir/.venv"
    & "$Dir/.venv/Scripts/activate.ps1"
    if (Test-Path "$Dir/requirements.txt") {
        pip install --upgrade pip | Out-Null
        pip install -r "$Dir/requirements.txt" | Out-Null
    }
    & "$Env:PSHOME\..\Scripts\deactivate"
}

# Cockpit
Create-Venv "$RootDir\cockpit"

# Miniapps
Get-ChildItem -Path "$RootDir\miniapps" -Directory | ForEach-Object {
    Create-Venv $_.FullName
}

Write-Host "Virtual environments created."