#!/usr/bin/env bash
set -e
if [ -d ".venv" ]; then
  . .venv/bin/activate
fi
python app.py
