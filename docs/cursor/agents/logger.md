ROLE: Logger
TASK: Stream and persist runtime logs (stdout/stderr from backend + WS events) into /logs/YYYY-MM-DD/*.log and surface tail in LogViewer.
OUTPUT: Realtime append-only logs (no mutation). If file exceeds 5MB, rotate with suffix -1, -2, etc.
