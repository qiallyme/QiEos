#!/usr/bin/env python
"""CLI tool to ingest documents from a folder.

Usage:
    python scripts/ingest.py /path/to/file_or_folder

The script walks through the provided path.  If a file is given it is ingested
directly; if a directory is given all files within are ingested recursively.

The ingestion honours classification tiers defined in your environment.
"""

from __future__ import annotations

import argparse
from pathlib import Path

from app.rag import RagEngine


def ingest_path(engine: RagEngine, path: Path) -> None:
    if path.is_dir():
        for item in path.rglob("*"):
            if item.is_file():
                print(f"Ingesting {item}")
                engine.upsert_document(item)
    elif path.is_file():
        print(f"Ingesting {path}")
        engine.upsert_document(path)
    else:
        print(f"Skipping unknown path: {path}")


def main() -> None:
    parser = argparse.ArgumentParser(description="Ingest documents into Qdrant.")
    parser.add_argument("paths", nargs="+", type=Path, help="Files or directories to ingest")
    args = parser.parse_args()

    engine = RagEngine()
    for path in args.paths:
        ingest_path(engine, path)


if __name__ == "__main__":
    main()