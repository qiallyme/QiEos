#!/usr/bin/env python
"""Watch a directory tree and ingest documents on changes.

This script uses watchdog to monitor the directory specified by the `DATA_ROOT`
environment variable.  When a file is created or modified it will be
ingested into the appropriate Qdrant collection.

Run this script in a long‑running process alongside your API server.
"""

from __future__ import annotations

import os
import threading
import time
from pathlib import Path
from typing import Optional

from watchdog.events import FileSystemEventHandler
from watchdog.observers import Observer

from app.rag import RagEngine


class IngestionHandler(FileSystemEventHandler):
    def __init__(self, engine: RagEngine, data_root: Path) -> None:
        super().__init__()
        self.engine = engine
        self.data_root = data_root

    def on_created(self, event):
        if not event.is_directory:
            self.handle(Path(event.src_path))

    def on_modified(self, event):
        if not event.is_directory:
            self.handle(Path(event.src_path))

    def handle(self, path: Path) -> None:
        # Only process files under data_root
        try:
            path.relative_to(self.data_root)
        except ValueError:
            return
        try:
            print(f"[watcher] ingesting {path}")
            self.engine.upsert_document(path)
        except Exception as exc:
            print(f"[watcher] failed to ingest {path}: {exc}")


def main() -> None:
    data_root = Path(os.getenv("DATA_ROOT", ".")).resolve()
    print(f"Watching {data_root}")
    engine = RagEngine()
    event_handler = IngestionHandler(engine, data_root)
    observer = Observer()
    observer.schedule(event_handler, str(data_root), recursive=True)
    observer.start()
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        observer.stop()
    observer.join()


if __name__ == "__main__":
    main()