#!/usr/bin/env bash
set -euo pipefail
APPDIR="$(cd "$(dirname "$0")/.."; pwd)"
SERVICE_FILE=/etc/systemd/system/qitaskworker.service

sudo bash -c "cat > $SERVICE_FILE" <<'UNIT'
[Unit]
Description=QiTask Worker
After=network-online.target

[Service]
WorkingDirectory=APPDIR_PLACEHOLDER
ExecStart=APPDIR_PLACEHOLDER/.venv/bin/uvicorn worker:app --host 0.0.0.0 --port 7130
Restart=always
Environment=QITASK_WORKDIR=APPDIR_PLACEHOLDER/jobs

[Install]
WantedBy=multi-user.target
UNIT

sudo sed -i "s#APPDIR_PLACEHOLDER#$APPDIR#g" "$SERVICE_FILE"
sudo systemctl daemon-reload
echo "Installed service to $SERVICE_FILE"
