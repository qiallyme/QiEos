"""Utility functions for file parsing and classification.

This module centralises small helpers used by the ingestion and retrieval pipeline.
"""

from __future__ import annotations

import json
import os
import re
from pathlib import Path
from typing import Dict, Optional, Tuple

import yaml


def parse_front_matter(text: str) -> Tuple[Dict[str, str], str]:
    """Extract YAML front‑matter from a markdown document.

    Returns a tuple of (metadata, remainder) where metadata is a dict parsed
    from the front‑matter and remainder is the document content without the
    front‑matter block.  If no front‑matter is found the metadata will be
    empty and the original text returned.
    """
    if text.startswith("---\n"):
        end = text.find("\n---", 4)
        if end != -1:
            fm = text[4:end]
            try:
                data = yaml.safe_load(fm) or {}
            except Exception:
                data = {}
            remainder = text[end + 4 :]
            return data, remainder
    return {}, text


def read_text_file(path: Path) -> str:
    """Read a text or markdown file and return its contents as a string."""
    return path.read_text(encoding="utf-8", errors="ignore")


def read_pdf(path: Path) -> str:
    """Extract text from a PDF file using pdfminer.six.

    If pdfminer is not installed this function will raise ImportError.
    """
    from pdfminer.high_level import extract_text  # type: ignore

    try:
        return extract_text(str(path))
    except Exception as e:
        raise RuntimeError(f"Failed to extract text from PDF {path}: {str(e)}")


def load_env_mapping(var: str) -> Dict[str, str]:
    """Parse a comma‑separated mapping from an environment variable.

    Example: "unclass:UNCLASS,classified:CLASSIFIED" -> {"unclass": "UNCLASS", ...}
    """
    mapping_str = os.getenv(var) or ""
    result: Dict[str, str] = {}
    for entry in mapping_str.split(","):
        if not entry:
            continue
        parts = entry.split(":", 1)
        if len(parts) == 2:
            key, value = parts[0].strip(), parts[1].strip()
            result[key] = value
    return result


def determine_tier_from_path(path: Path, folder_tiers: Dict[str, str]) -> Optional[str]:
    """Determine the classification tier for a file based on its parent folder.

    Looks at each part of the path relative to the data root.  Returns the tier
    name if found in the folder_tiers mapping, else None.
    """
    for part in path.parts:
        if part in folder_tiers:
            return folder_tiers[part]
    return None


def determine_tier_for_file(path: Path, folder_tiers: Dict[str, str]) -> str:
    """Determine the classification tier for a file.

    The tier is determined in the following order:
      1. YAML front‑matter field `classification` in a markdown file.
      2. Folder name mapping (e.g. `data/unclass`).
      3. Defaults to UNCLASS.
    """
    tier = None
    # Only attempt front‑matter parsing for markdown files
    if path.suffix.lower() in {".md", ".markdown"}:
        try:
            meta, _ = parse_front_matter(read_text_file(path))
            if isinstance(meta, dict) and meta.get("classification"):
                tier = str(meta["classification"]).strip().upper()
        except Exception:
            tier = None

    if not tier:
        tier = determine_tier_from_path(path, folder_tiers)

    return tier or "UNCLASS"


def load_tier_policies() -> Dict[str, bool]:
    """Load per‑tier fallback policy from the TIER_POLICIES environment variable."""
    raw = os.getenv("TIER_POLICIES", "{}")
    try:
        policies = json.loads(raw)
        return {str(k): bool(v) for k, v in policies.items()}
    except Exception:
        return {}