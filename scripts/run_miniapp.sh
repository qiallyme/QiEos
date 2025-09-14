#!/usr/bin/env bash
# Run a miniapp from the root directory.

set -euo pipefail

# Get the root directory
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

# Check if app name is provided
if [ $# -eq 0 ]; then
    echo "Usage: $0 <app-name>"
    echo "Available miniapps:"
    for app_dir in "$ROOT_DIR"/miniapps/*; do
        if [ -d "$app_dir" ]; then
            echo "  - $(basename "$app_dir")"
        fi
    done
    exit 1
fi

APP_NAME="$1"
APP_DIR="$ROOT_DIR/miniapps/$APP_NAME"

# Check if app directory exists
if [ ! -d "$APP_DIR" ]; then
    echo "Error: Miniapp '$APP_NAME' not found in $APP_DIR"
    echo "Available miniapps:"
    for app_dir in "$ROOT_DIR"/miniapps/*; do
        if [ -d "$app_dir" ]; then
            echo "  - $(basename "$app_dir")"
        fi
    done
    exit 1
fi

# Check if app.py exists
if [ ! -f "$APP_DIR/app.py" ]; then
    echo "Error: app.py not found in $APP_DIR"
    exit 1
fi

echo "Starting $APP_NAME..."
echo "Working directory: $APP_DIR"
echo ""

# Change to the app directory and run it
cd "$APP_DIR"
python app.py
