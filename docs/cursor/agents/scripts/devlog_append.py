import argparse, os, datetime
from pathlib import Path

DEVLOG = Path("docs/DEV_LOG.md")

HEADER = """# QI-EOS Devlog

> Source of truth for daily context, decisions, and next steps.
"""

def ensure_header():
    if not DEVLOG.exists():
        DEVLOG.parent.mkdir(parents=True, exist_ok=True)
        DEVLOG.write_text(HEADER + "\n", encoding="utf-8")

def append_entry(entry:str):
    ts = datetime.datetime.now().strftime("%Y-%m-%d %H:%M")
    with DEVLOG.open("a", encoding="utf-8") as f:
        f.write("\n" + entry.strip() + "\n")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Append a session entry to docs/DEV_LOG.md")
    parser.add_argument("--entry", required=True, help="Markdown block for the session")
    args = parser.parse_args()
    ensure_header()
    append_entry(args.entry)
    ts = datetime.datetime.now().strftime("%Y-%m-%d %H:%M")
    print(f"[DEV_LOG] appended at {ts} -> {DEVLOG}")
