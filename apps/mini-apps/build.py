from pathlib import Path
from itertools import zip_longest
import json, re

ROOT = Path(__file__).parent
EN = ROOT/"content"/"en"
ES = ROOT/"content"/"es"
OUT = ROOT/"static_build"
OUT.mkdir(exist_ok=True)

def list_md(folder: Path):
    return sorted([p for p in folder.glob("*.md")])

def merged_text(folder: Path) -> str:
    files = list_md(folder)
    out = []
    for p in files:
        out.append(f"\n\n---\n# Source: {p.name}\n\n")
        out.append(p.read_text(encoding="utf-8"))
    return "".join(out).strip()+"\n"

def pair_lines(en_text: str, es_text: str):
    ENL = en_text.splitlines()
    ESL = es_text.splitlines() if es_text else []
    rows = [{"en":e,"es":s} for e,s in zip_longest(ENL,ESL, fillvalue="")]
    return rows

def main():
    en = merged_text(EN) if EN.exists() else ""
    es = merged_text(ES) if ES.exists() else ""
    (OUT/"merged_en.md").write_text(en, encoding="utf-8")
    (OUT/"merged_es.md").write_text(es, encoding="utf-8")
    rows = pair_lines(en, es)
    # paired.html (simple, printable)
    html_rows = []
    for r in rows:
        html_rows.append(f"""<div style='display:grid;grid-template-columns:1fr 1fr;gap:12px;margin:6px 0'>
        <div style='border-left:3px solid #7c5cff;padding-left:10px;white-space:pre-wrap;font-family:ui-sans-serif,system-ui'>{r['en']}</div>
        <div style='border-left:3px solid #b27cff;padding-left:10px;white-space:pre-wrap;font-family:ui-sans-serif,system-ui'>{r['es']}</div>
        </div>""")
    html = """<!doctype html><html><head><meta charset='utf-8'>
    <meta name='viewport' content='width=device-width,initial-scale=1'>
    <title>EmpowerQNow713 — Paired</title>
    <style>body{margin:20px;background:#0b0b10;color:#e8e8f0} a{color:#c8b6ff} @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }</style>
    </head><body>
    <h1>🔱 EmpowerQNow713 — Paired (EN + ES)</h1>
    %s
    </body></html>""" % ("\n".join(html_rows))
    (OUT/"paired.html").write_text(html, encoding="utf-8")
    # index.json: per-file lists
    index = {
        "en_files":[p.name for p in list_md(EN)],
        "es_files":[p.name for p in list_md(ES)]
    }
    (OUT/"index.json").write_text(json.dumps(index, ensure_ascii=False, indent=2), encoding="utf-8")

if __name__ == "__main__":
    main()

def build_search_index(en_text: str, es_text: str):
    def to_items(txt, lang):
        items = []
        lines = txt.splitlines()
        title = ""
        for i, line in enumerate(lines, 1):
            if line.startswith("#"):
                title = re.sub(r"^#+\s*", "", line).strip()
            # pick paragraph-like lines
            if line and not line.startswith("#"):
                snippet = line.strip()
                if len(snippet) > 160:
                    snippet = snippet[:157] + "…"
                items.append({
                    "id": f"{lang}-L{i:05d}",
                    "lang": lang,
                    "line": i,
                    "title": title,
                    "text": line.strip(),
                    "snippet": snippet
                })
        return items
    return to_items(en_text, "en") + to_items(es_text, "es")

def build_anchors(en_text: str, es_text: str):
    # just count lines for stable deep-links
    return {
        "en_lines": len(en_text.splitlines()),
        "es_lines": len(es_text.splitlines())
    }

def write_static_artifacts(en, es):
    (OUT/"merged_en.md").write_text(en, encoding="utf-8")
    (OUT/"merged_es.md").write_text(es, encoding="utf-8")
    rows = pair_lines(en, es)
    # paired.html (simple, printable)
    html_rows = []
    for idx, r in enumerate(rows, 1):
        html_rows.append(f"""<div id='L{idx}' style='display:grid;grid-template-columns:1fr 1fr;gap:12px;margin:6px 0'>
        <div class='en' style='border-left:3px solid #7c5cff;padding-left:10px;white-space:pre-wrap;font-family:ui-sans-serif,system-ui'>{r['en']}</div>
        <div class='es' style='border-left:3px solid #b27cff;padding-left:10px;white-space:pre-wrap;font-family:ui-sans-serif,system-ui'>{r['es']}</div>
        </div>""")
    html = """<!doctype html><html><head><meta charset='utf-8'>
    <meta name='viewport' content='width=device-width,initial-scale=1'>
    <title>EmpowerQNow713 — Paired</title>
    <style>
    body{margin:20px;background:#0b0b10;color:#e8e8f0}
    a{color:#c8b6ff}
    @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
    .link{font-size:12px;color:#c8b6ff}
    </style>
    </head><body>
    <h1>🔱 EmpowerQNow713 — Paired (EN + ES)</h1>
    %s
    <script>
      document.querySelectorAll('[id^=L]').forEach(row=>{
        const a=document.createElement('a');
        a.textContent='¶';
        a.className='link';
        a.style.marginLeft='6px';
        a.href='#'+row.id;
        row.firstElementChild.prepend(a);
      });
    </script>
    </body></html>""" % ("\n".join(html_rows))
    (OUT/"paired.html").write_text(html, encoding="utf-8")
    # index.json (file lists)
    index = {
        "en_files":[p.name for p in list_md(EN)],
        "es_files":[p.name for p in list_md(ES)]
    }
    (OUT/"index.json").write_text(json.dumps(index, ensure_ascii=False, indent=2), encoding="utf-8")
    # search index
    idx = build_search_index(en, es)
    (OUT/"search_index.json").write_text(json.dumps(idx, ensure_ascii=False), encoding="utf-8")
    # anchors meta
    (OUT/"anchors.json").write_text(json.dumps(build_anchors(en, es), ensure_ascii=False), encoding="utf-8")

def main():
    en = merged_text(EN) if EN.exists() else ""
    es = merged_text(ES) if ES.exists() else ""
    write_static_artifacts(en, es)

if __name__ == "__main__":
    main()
