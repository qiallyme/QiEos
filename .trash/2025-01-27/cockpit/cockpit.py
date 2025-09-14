#!/usr/bin/env python3
"""Qi miniapps cockpit.

This command‑line tool discovers miniapps listed in the repository's
`miniapps.json` manifest and allows you to list them, run one of them as a
subprocess and stream its output. It is intentionally simple so that you can
extend it with additional capabilities (for example, a web UI, health
checks or termination commands) as your ecosystem grows.

Usage::

    python cockpit.py list
    python cockpit.py run <miniapp-name>

If a miniapp is run it is executed in its own working directory with the
current Python interpreter. The cockpit will forward all output lines to
standard output. Use Ctrl‑C to terminate the running miniapp.
"""

from __future__ import annotations

import argparse
import json
import os
import sys
import threading

from pathlib import Path

# Insert the repository root into sys.path so we can import from the `shared` package
repo_root = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(repo_root))

from shared.process_utils import start_subprocess, stream_process_output


def load_manifest(manifest_path: Path) -> list[dict[str, str]]:
    """Load the miniapps manifest from a JSON file.

    The manifest is expected to be a list of objects with ``name``, ``path``
    and ``description`` keys. Additional keys (such as ``entry``) are
    permitted but ignored by the cockpit.

    Parameters
    ----------
    manifest_path: Path
        Path to the ``miniapps.json`` file.

    Returns
    -------
    list
        List of manifest entries.
    """
    try:
        with open(manifest_path, "r", encoding="utf-8") as f:
            manifest = json.load(f)
        if not isinstance(manifest, list):
            raise ValueError("Manifest root must be a list")
        return manifest
    except Exception as exc:
        print(f"Error loading manifest: {exc}", file=sys.stderr)
        return []


def find_miniapp(manifest: list[dict[str, str]], name: str) -> dict[str, str] | None:
    """Return the manifest entry for a miniapp by name, or None if not found."""
    for entry in manifest:
        if entry.get("name") == name:
            return entry
    return None


def list_apps(manifest: list[dict[str, str]]) -> None:
    """Print all miniapps defined in the manifest."""
    if not manifest:
        print("No miniapps defined.")
        return
    print("Available miniapps:")
    for entry in manifest:
        name = entry.get("name", "<unknown>")
        desc = entry.get("description", "")
        print(f"  - {name}: {desc}")


def run_app(entry: dict[str, str]) -> None:
    """Run the given miniapp entry as a subprocess and stream its output."""
    rel_path = entry.get("path")
    if not rel_path:
        print("Manifest entry missing path", file=sys.stderr)
        return
    # Determine working directory and entry script
    repo_root = Path(__file__).resolve().parent.parent
    app_dir = repo_root / rel_path
    entry_script = entry.get("entry", "app.py")
    if not (app_dir / entry_script).exists():
        print(f"Entry script '{entry_script}' not found in {app_dir}", file=sys.stderr)
        return
    print(f"\nLaunching {entry.get('name')}...\n", flush=True)
    proc = start_subprocess(str(app_dir), entry_script)
    try:
        for line in stream_process_output(proc):
            print(line)
    except KeyboardInterrupt:
        print("\nStopping miniapp...", flush=True)
        proc.terminate()
    proc.wait()
    print("Miniapp exited with code", proc.returncode)


def main(argv: list[str]) -> int:
    parser = argparse.ArgumentParser(description="Qi miniapps cockpit")
    subparsers = parser.add_subparsers(dest="command", required=True)

    subparsers.add_parser("list", help="list available miniapps")
    run_parser = subparsers.add_parser("run", help="run a miniapp by name")
    run_parser.add_argument("name", help="name of the miniapp to run")

    args = parser.parse_args(argv)

    manifest_path = Path(__file__).resolve().parent.parent / "miniapps.json"
    manifest = load_manifest(manifest_path)

    if args.command == "list":
        list_apps(manifest)
        return 0
    if args.command == "run":
        entry = find_miniapp(manifest, args.name)
        if entry is None:
            print(f"Miniapp '{args.name}' not found.")
            return 1
        run_app(entry)
        return 0
    return 1


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))