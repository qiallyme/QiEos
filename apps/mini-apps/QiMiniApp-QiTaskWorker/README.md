# QiMiniApp — QiTaskWorker

Offload heavy jobs from your main box to a worker machine over your LAN or Tailscale.
Zero brokers. Simple REST API. Logs and status included.

## Features
- FastAPI worker with in-memory queue
- Submit commands, optional file upload
- Live status polling with tail of logs
- Outputs and logs stored per-job in `jobs/<job_id>/`
- Cross-platform start scripts (Windows/Linux)
- Optional service install (systemd or NSSM)
- Tiny CLI (`qpush.py`) and PowerShell helper

## Quick Start

### On the worker machine
1. Install Python 3.10+
2. Open terminal in `app/` and run:
   - Windows:
     ```powershell
     .\scripts\run_worker.bat
     ```
   - Linux/macOS:
     ```bash
     ./scripts/run_worker.sh
     ```
3. Confirm health:
   - Visit `http://<worker-ip>:7130/health`

### On the main machine (client)
1. Ensure Python 3.10+
2. Open terminal in `client/` and run:
   - Windows:
     ```powershell
     .\scripts\qpush.bat -w http://<worker-ip>:7130 -c "ffmpeg -version"
     ```
   - Linux/macOS:
     ```bash
     ./scripts/qpush.sh -w http://<worker-ip>:7130 -c "ffmpeg -version"
     ```

## Examples
- Transcode using a shared path:
  ```powershell
  .\scripts\qpush.bat -w http://100.x.y.z:7130 -c "ffmpeg -i \\SERVER\media\in.mkv -c:v libx264 -preset veryfast \\SERVER\media\out.mp4"
  ```
- Run a Python script remotely:
  ```bash
  ./scripts/qpush.sh -w http://100.x.y.z:7130 -c "python process_dataset.py --in /mnt/share/set1 --out /mnt/share/out"
  ```

## Service install (optional)

### Linux (systemd)
```bash
sudo ./scripts/install_service_linux.sh
sudo systemctl enable qitaskworker
sudo systemctl start qitaskworker
```

### Windows (NSSM)
1. Download NSSM (https://nssm.cc/download) and put `nssm.exe` somewhere in PATH.
2. Run:
```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\install_service_windows.ps1
```

## Cockpit integration
A `manifest.json` is included for detection by the QiLife Cockpit. Health endpoint: `/health`.
