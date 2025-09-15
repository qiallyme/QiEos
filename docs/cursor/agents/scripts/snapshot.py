#!/usr/bin/env python3
import argparse, os, sys, json, hashlib, subprocess, datetime, zipfile
from pathlib import Path

# Get the git root directory dynamically
import subprocess
try:
    git_root = subprocess.run(["git", "rev-parse", "--show-toplevel"],
                             capture_output=True, text=True, cwd=Path(__file__).parent).stdout.strip()
    ROOT = Path(git_root)
except:
    # Fallback to relative path if git command fails
    ROOT = Path(__file__).resolve().parents[4] / "QiEOS"
SNAPDIR = ROOT.parent / "snapshots"
DEFAULT_IGNORE = [
    ".git/", "node_modules/", "dist/", "build/", ".cache/", ".turbo/",
    ".next/", ".DS_Store", "*.log", "*.tmp", "*.lock", "*.env", ".trash/",
    "$RECYCLE.BIN/", "System Volume Information/", "Thumbs.db"
]

def run(cmd, cwd=ROOT):
    return subprocess.run(cmd, cwd=cwd, shell=True, capture_output=True, text=True)

def sha256_file(p: Path, max_bytes=None):
    h = hashlib.sha256()
    with p.open("rb") as f:
        if max_bytes:
            h.update(f.read(max_bytes))
        else:
            for chunk in iter(lambda: f.read(1024*1024), b""):
                h.update(chunk)
    return h.hexdigest()

def should_ignore(path: Path, patterns):
    try:
        s = str(path).replace("\\","/") + ("/" if path.is_dir() else "")

        # Check for Windows system directories and files
        if any(part.startswith('$') for part in path.parts):
            return True
        if any(part in ['System Volume Information', 'RECYCLER', 'RECYCLED'] for part in path.parts):
            return True

        for pat in patterns:
            # simple glob-ish check
            if pat.endswith("/"):
                if s.find(pat) != -1:
                    return True
            else:
                # Use path.name for filename patterns, full path for directory patterns
                if "/" in pat:
                    # Directory pattern - check against full path
                    if s.find(pat) != -1:
                        return True
                else:
                    # Filename pattern - check against just the filename
                    try:
                        if path.name == pat or path.match(pat):
                            return True
                    except (OSError, ValueError):
                        # If path operations fail, fall back to string matching
                        if path.name == pat:
                            return True
        return False
    except (OSError, ValueError, AttributeError):
        # If any path operations fail, be conservative and don't ignore
        return False

def collect_files(root: Path, patterns):
    count = 0
    def walk_dir(path: Path, depth=0):
        nonlocal count
        if depth > 10:  # Prevent infinite recursion
            return
        try:
            for item in path.iterdir():
                count += 1
                if count % 1000 == 0:
                    print(f"[info] Processed {count} items...")
                try:
                    if should_ignore(item, patterns):
                        continue
                    if item.is_dir():
                        yield from walk_dir(item, depth + 1)
                    elif item.is_file():
                        yield item
                except (PermissionError, FileNotFoundError, OSError) as e:
                    # Skip files/dirs we can't access
                    print(f"[warn] Skipping {item}: {e}")
                    continue
        except (PermissionError, FileNotFoundError, OSError) as e:
            print(f"[warn] Cannot access directory {path}: {e}")
            return

    try:
        print(f"[info] Starting file collection from {root}")
        yield from walk_dir(root)
        print(f"[info] File collection complete. Processed {count} total items.")
    except (PermissionError, FileNotFoundError, OSError) as e:
        print(f"[error] Cannot access root directory {root}: {e}")
        return

def git_info():
    def g(args): return run(f"git {args}")
    branch = g("rev-parse --abbrev-ref HEAD").stdout.strip() or "detached"
    sha = g("rev-parse --short HEAD").stdout.strip()
    status = g("status --porcelain=v1").stdout.strip().splitlines()
    diffstat = g("diff --stat").stdout.strip()
    return {
        "branch": branch,
        "head": sha,
        "dirty": len(status) > 0,
        "status": status,
        "diffstat": diffstat,
        "remote": run("git remote -v").stdout.strip().splitlines(),
    }

def main():
    ap = argparse.ArgumentParser(description="QiEOS snapshot/archiver")
    ap.add_argument("--mode", choices=["quick","full"], default="quick")
    ap.add_argument("--bundle", action="store_true", help="also create git bundle")
    ap.add_argument("--flat-text", action="store_true", help="create a single code_extraction_*.txt")
    ap.add_argument("--include-trash", action="store_true", help="include .trash directory")
    ap.add_argument("--outdir", default=str(SNAPDIR))
    ap.add_argument("--max-hash-mb", type=int, default=16, help="cap per-file hash bytes for speed")
    args = ap.parse_args()

    ignore = list(DEFAULT_IGNORE)
    if args.include_trash:
        ignore = [p for p in ignore if p != ".trash/"]
    # allow .snapignore overrides
    snapignore = ROOT / ".snapignore"
    if snapignore.exists():
        extra = [ln.strip() for ln in snapignore.read_text(encoding="utf-8").splitlines() if ln.strip() and not ln.strip().startswith("#")]
        ignore.extend(extra)

    SNAPDIR.mkdir(parents=True, exist_ok=True)
    gi = git_info()
    ts = datetime.datetime.now().strftime("%Y%m%d-%H%M")
    base = f"QiEOS-snap-{ts}-{gi['branch']}-{gi['head'] or 'nohead'}"
    zpath = Path(args.outdir) / f"{base}.zip"
    mpath = Path(args.outdir) / f"{base}.manifest.json"
    tpath = Path(args.outdir) / f"{base}.code_extraction.txt"

    # collect
    files = list(collect_files(ROOT, ignore))
    manifest = {
        "repo": str(ROOT),
        "generated_at": ts,
        "branch": gi["branch"],
        "head": gi["head"],
        "dirty": gi["dirty"],
        "status": gi["status"],
        "diffstat": gi["diffstat"],
        "count_files": 0,
        "total_bytes": 0,
        "files": []
    }

    max_bytes = args.max_hash_mb * 1024 * 1024
    if args.mode == "quick":
        # hash only up to max_bytes; still zip full files
        pass  # behavior same; we just cap hashing

    # create zip + manifest
    with zipfile.ZipFile(zpath, "w", compression=zipfile.ZIP_DEFLATED) as zf:
        for fp in files:
            rel = fp.relative_to(ROOT)
            try:
                size = fp.stat().st_size
            except FileNotFoundError:
                continue
            manifest["files"].append({
                "path": str(rel).replace("\\","/"),
                "size": size,
                "sha256": sha256_file(fp, max_bytes=max_bytes)
            })
            manifest["count_files"] += 1
            manifest["total_bytes"] += size
            zf.write(fp, arcname=str(rel))

        # add current git patch for easy human read
        patch = run("git diff").stdout
        zf.writestr("_git_diff.patch", patch)
        zf.writestr("_git_status.txt", "\n".join(gi["status"]))
        zf.writestr("_git_remote.txt", "\n".join(gi["remote"]))

    mpath.write_text(json.dumps(manifest, indent=2), encoding="utf-8")

    # optional flat text extraction
    if args.flat_text:
        with tpath.open("w", encoding="utf-8", errors="ignore") as out:
            out.write(f"# Code Extraction — {base}\n\n")
            for fp in files:
                rel = str(fp.relative_to(ROOT)).replace("\\","/")
                out.write(f"\n\n===== FILE: {rel} =====\n")
                try:
                    out.write(fp.read_text(encoding="utf-8", errors="ignore"))
                except Exception as e:
                    out.write(f"\n[non-text or read error: {e}]\n")

    # optional git bundle for bare restore (includes all refs)
    bpath = None
    if args.bundle:
        bpath = Path(args.outdir) / f"{base}.bundle"
        run(f"git bundle create {bpath} --all")

    print(f"[snap] zip:      {zpath}")
    print(f"[snap] manifest: {mpath}")
    if args.flat_text:
        print(f"[snap] text:     {tpath}")
    if args.bundle:
        print(f"[snap] bundle:   {bpath}")

if __name__ == "__main__":
    main()
