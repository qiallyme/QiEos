#!/usr/bin/env python3
import os
import sys
import io
from pathlib import Path


ROOT = Path(__file__).resolve().parent
OUTPUT = ROOT / "code_extraction_output.md"


EXCLUDE_DIRS = {
    ".git",
    "node_modules",
    "dist",
    "build",
    "out",
    ".next",
    ".turbo",
    ".vercel",
    "coverage",
    ".astro",
    ".vscode",
    "tmp",
    "logs",
}

BINARY_EXTENSIONS = {
    ".png", ".jpg", ".jpeg", ".gif", ".svg", ".ico", ".webp", ".avif",
    ".mp4", ".mov", ".webm", ".mp3", ".wav", ".ogg",
    ".woff", ".woff2", ".ttf", ".eot",
    ".pdf", ".zip", ".tar", ".gz", ".tgz", ".7z", ".rar",
    ".psd", ".ai", ".sketch", ".DS_Store",
    ".map", ".wasm",
}

ALLOWED_TEXT_EXTENSIONS = {
    # Code
    ".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs",
    ".css", ".scss", ".sass", ".less",
    ".astro",
    ".py", ".sh", ".ps1", ".bat",
    ".go", ".rs", ".java", ".kt", ".gradle", ".xml",
    ".toml", ".yaml", ".yml", ".ini",
    ".json", ".jsonc",
    ".md", ".mdx",
    ".sql",
    ".tf",
    ".txt",
}

MAX_FILE_SIZE_BYTES = 2 * 1024 * 1024  # 2MB safety cap


LANG_MAP = {
    ".ts": "ts",
    ".tsx": "tsx",
    ".js": "js",
    ".jsx": "jsx",
    ".mjs": "js",
    ".cjs": "js",
    ".css": "css",
    ".scss": "scss",
    ".sass": "sass",
    ".less": "less",
    ".astro": "astro",
    ".py": "python",
    ".sh": "bash",
    ".ps1": "powershell",
    ".bat": "bat",
    ".go": "go",
    ".rs": "rust",
    ".java": "java",
    ".kt": "kotlin",
    ".gradle": "groovy",
    ".xml": "xml",
    ".toml": "toml",
    ".yaml": "yaml",
    ".yml": "yaml",
    ".ini": "ini",
    ".json": "json",
    ".jsonc": "json",
    ".md": "md",
    ".mdx": "mdx",
    ".sql": "sql",
    ".tf": "hcl",
    ".txt": "text",
}


def is_excluded_dir(path: Path) -> bool:
    return any(part in EXCLUDE_DIRS for part in path.parts)


def should_include_file(path: Path) -> bool:
    ext = path.suffix.lower()
    if ext in BINARY_EXTENSIONS:
        return False
    if ext in ALLOWED_TEXT_EXTENSIONS:
        return True
    # Allow dotfiles like .env.example (but skip generic .env secrets)
    if path.name == ".env.example":
        return True
    # Otherwise skip unknown extensions
    return False


def detect_lang(ext: str) -> str:
    return LANG_MAP.get(ext.lower(), "text")


def read_text_file(path: Path) -> str:
    # Try utf-8, fallback to latin-1 to avoid crashes
    for enc in ("utf-8", "utf-8-sig", "latin-1"):
        try:
            return path.read_text(encoding=enc)
        except Exception:
            continue
    return ""


def main() -> int:
    files: list[Path] = []
    for root, dirs, filenames in os.walk(ROOT):
        root_path = Path(root)
        # prune excluded dirs in-place for performance
        dirs[:] = [d for d in dirs if not is_excluded_dir(root_path / d)]
        for fname in filenames:
            fpath = root_path / fname
            if should_include_file(fpath):
                try:
                    if fpath.stat().st_size <= MAX_FILE_SIZE_BYTES:
                        files.append(fpath)
                except OSError:
                    continue

    files.sort(key=lambda p: str(p).lower())

    with io.open(OUTPUT, "w", encoding="utf-8") as out:
        out.write("## Code Extraction\n\n")
        out.write(f"Root: {ROOT.as_posix()}\n\n")
        for f in files:
            rel = f.relative_to(ROOT).as_posix()
            ext = f.suffix.lower()
            lang = detect_lang(ext)
            out.write(f"### {rel}\n\n")
            out.write(f"```{lang}\n")
            out.write(read_text_file(f))
            out.write("\n`````\n\n".replace("`````", "```"))

    print(f"Wrote {len(files)} files to {OUTPUT}")
    return 0


if __name__ == "__main__":
    sys.exit(main())


