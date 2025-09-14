#!/usr/bin/env bash
# Create Python virtual environments for the cockpit and each miniapp.
#
# This script iterates over the cockpit and each miniapp directory and
# initializes a virtual environment in a `.venv` subfolder if one does
# not already exist. It then installs the dependencies listed in
# `requirements.txt` (if present) into the environment.

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

create_venv() {
  local dir=$1
  echo "Creating venv in $dir/.venv"
  python -m venv "$dir/.venv"
  source "$dir/.venv/bin/activate"
  if [[ -f "$dir/requirements.txt" ]]; then
    pip install --upgrade pip >/dev/null
    pip install -r "$dir/requirements.txt"
  fi
  deactivate
}

# Create venv for cockpit
create_venv "$ROOT_DIR/cockpit"

# Create venvs for each miniapp
for app_dir in "$ROOT_DIR"/miniapps/*; do
  if [[ -d "$app_dir" ]]; then
    create_venv "$app_dir"
  fi
done

echo "Virtual environments created."