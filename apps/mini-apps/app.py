import os
from pathlib import Path
from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse, PlainTextResponse, HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware

BASE = Path(__file__).parent
CONTENT = BASE / "content"

app = FastAPI(title="EmpowerQNow Bible")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve static index.html
app.mount("/static", StaticFiles(directory=str(BASE/"static")), name="static")

def list_md(lang: str):
    folder = CONTENT / lang
    if not folder.exists():
        raise HTTPException(404, f"Language folder not found: {lang}")
    return sorted([p for p in folder.glob("*.md")])

def merged_text(lang: str) -> str:
    files = list_md(lang)
    if not files:
        return f"# (No markdown files found for lang={lang})"
    out = []
    for p in files:
        out.append(f"\n\n---\n# Source: {p.name}\n\n")
        out.append(p.read_text(encoding="utf-8"))
    return "".join(out)

@app.get("/", response_class=HTMLResponse)
def home():
    return (BASE/"static"/"index.html").read_text(encoding="utf-8")

@app.get("/api/files/{lang}")
def api_files(lang: str):
    return [p.name for p in list_md(lang)]

@app.get("/api/merged/{lang}", response_class=PlainTextResponse)
def api_merged(lang: str):
    return merged_text(lang)

@app.get("/raw/{lang}/{name}", response_class=PlainTextResponse)
def raw_file(lang: str, name: str):
    path = CONTENT/lang/name
    if not path.exists():
        raise HTTPException(404, "File not found")
    return path.read_text(encoding="utf-8")

# Convenience for local dev: return this script for inspection
@app.get("/app.py", response_class=PlainTextResponse)
def show_app():
    return (BASE/"app.py").read_text(encoding="utf-8")

from itertools import zip_longest
def pair_lines(en_text: str, es_text: str) -> str:
    en_lines = [l for l in en_text.splitlines()]
    es_lines = [l for l in es_text.splitlines()]
    rows = []
    for en, es in zip_longest(en_lines, es_lines, fillvalue=""):
        rows.append({"en": en, "es": es})
    return rows

@app.get("/api/paired", response_class=HTMLResponse)
def api_paired():
    en = merged_text("en")
    try:
        es = merged_text("es")
    except Exception:
        es = ""
    rows = pair_lines(en, es)
    # Simple HTML render for print/export
    html_rows = []
    for r in rows:
        html_rows.append(f"""<div style='display:grid;grid-template-columns:1fr 1fr;gap:12px;margin:6px 0'>
        <div style='border-left:3px solid #7c5cff;padding-left:10px;white-space:pre-wrap;font-family:ui-sans-serif,system-ui'>{r['en']}</div>
        <div style='border-left:3px solid #b27cff;padding-left:10px;white-space:pre-wrap;font-family:ui-sans-serif,system-ui'>{r['es']}</div>
        </div>""")
    html = """<!doctype html><html><head><meta charset='utf-8'>
    <title>EmpowerQNow713 — Paired</title>
    <style>@media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }</style>
    </head><body>
    <h1>🔱 EmpowerQNow713 — Paired (EN + ES)</h1>
    %s
    </body></html>""" % ("\n".join(html_rows))
    return html

@app.get("/export/print", response_class=HTMLResponse)
def export_print():
    # Same as /api/paired but with minimalist print styling
    return api_paired()
