#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
python3 -m venv .venv || true
source .venv/bin/activate
pip install -U pip
pip install -r requirements.txt
export QITASK_PORT=${QITASK_PORT:-7130}
export QITASK_BIND=${QITASK_BIND:-0.0.0.0}
mkdir -p jobs
python -m uvicorn worker:app --host "$QITASK_BIND" --port "$QITASK_PORT"
