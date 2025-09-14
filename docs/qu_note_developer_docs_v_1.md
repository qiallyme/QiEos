# QuNote Developer Documentation v1.0

**QuNote** is an ADHD-friendly, neurodivergent-first, open-source note-taking system designed to treat notes as a living graph. It uses Obsidian as the authoring environment, while Quartz or Docsify act as publishing layers through a lightweight adapter. QuNote emphasizes a clear schema (frontmatter), predictable folder structures, and auto-generated mind maps, allowing users to visualize connections without dependency on heavy plugins.

---

## 1. Philosophy & Design Principles

- **Single source of truth:** The Obsidian vault is canonical. Static sites are mirrors.
- **Schema over plugins:** All critical data is stored in YAML frontmatter and markdown. No lock-in.
- **Low-friction capture:** Create new notes with unique IDs and sensible defaults in seconds.
- **Structured yet forgiving:** Defaults and validation guide use without blocking writing.
- **Graph-first design:** The system renders an auto mind map at build time.
- **Neurodivergent-friendly:** Prioritizes quick capture, focus tools, color-coded energy states, saved filters, and keyboard-driven workflows.

---

## 2. Core Vocabulary

- **QNode:** A single note with identity and metadata.
- **Orbit → System → Origin:** Context taxonomy.
  - **Orbit:** Broad life area (e.g., Business, Personal, Journals, Projects, Tasks, Spiritual, Private).
  - **System:** Subdomain or program (e.g., Snippets, CFO OS, EmpowerQNow, FileFlow).
  - **Origin:** Specific source or topic (e.g., language, client, module, place).
- **Influence:** Upstream note shaping the QNode.
- **Status:** Lifecycle state (`Inbox (New)`, `Processing`, `Active`, `Done`, `Dormant`, `Archive`, `Delete`).
- **Energy:** Attention alignment (`Surge`, `High`, `Moderate`, `Low`, `Blocked`).
- **Reflective Score:** Quick importance rating, 0–9. Recommended values: 0, 3, 6, 9 for consistency.

---

## 3. Vault Directory Structure

```
/vault/
  /00-Galaxy/        # indices and dashboards
  /10-Orbits/
    /Business/
    /Personal/
    /Journals/
    /Projects/
    /Tasks/
    /Spiritual/
    /Private/
  /20-Systems/
    /Snippets/
    /CFO-OS/
    /EmpowerQNow/
    /FileFlow/
  /30-Origins/
    /Languages/
      /Python/
      /JavaScript/
      /Shell/
    /Clients/
    /Places/
  /_templates/
  /_assets/
```

QNodes can be filed under any logical home. The frontmatter retains Orbit, System, and Origin metadata, so physical placement is flexible.

---

## 4. Frontmatter Schema

Each markdown note begins with:

```yaml
---
qid: QNO-20250825-001
slug: js-fetch-retry-expo-backoff
title: Fetch with retry and exponential backoff
summary: Minimal fetch retry with exponential backoff; add jitter for production.

type: [Snippet]
orbit: Dev
system: Snippets
origin: JavaScript
influence: [QNO-5]

status: Verified
energy: High
reflective_score: 6

tags: [web, http, retry]
event_dates: []
links: []

created: 2025-08-25T01:58:00-04:00
created_by: Cody
updated: 2025-08-25T02:20:00-04:00
updated_by: Cody
---
```

### JSON Schema (Frontmatter)

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "QuNoteFrontmatter",
  "type": "object",
  "required": ["qid", "slug", "title"],
  "properties": {
    "qid": {"type": "string", "pattern": "^QNO-[0-9]{8}-[0-9]{3}$"},
    "slug": {"type": "string"},
    "title": {"type": "string"},
    "summary": {"type": "string"},
    "type": {"type": ["string", "array"]},
    "orbit": {"type": "string"},
    "system": {"type": "string"},
    "origin": {"type": "string"},
    "influence": {"type": "array", "items": {"type": "string"}},
    "status": {"type": "string"},
    "energy": {"type": "string"},
    "reflective_score": {"type": "integer", "minimum": 0, "maximum": 9},
    "tags": {"type": "array", "items": {"type": "string"}},
    "event_dates": {"type": "array", "items": {"type": "string"}},
    "links": {"type": "array", "items": {"type": "string", "format": "uri"}},
    "created": {"type": "string"},
    "created_by": {"type": "string"},
    "updated": {"type": "string"},
    "updated_by": {"type": "string"}
  }
}
```

> **Note:** Earlier scoring values are accepted, but QuNote recommends 0, 3, 6, and 9 for simplicity.

---

## 5. Mapping from Notion CSV

| Notion Column                  | QuNote Frontmatter  | Notes |
|---|---|---|
| Title                          | `title`             | Use as-is. |
| Type                           | `type`              | Split on commas into an array. |
| Origin / Orbit / System        | `origin`, `orbit`, `system` | Map directly. |
| Influence / Linked Node        | `influence`, `links`| Internal links → `influence`; external → `links`. |
| Tags                           | `tags`              | Split and trim. |
| Status / Energy / Score        | `status`, `energy`, `reflective_score` | Normalize values. |
| Contextual Summary & Insight   | `summary`           | First paragraph only. |
| Description                    | body                | Main content. |
| Created / Last Edited          | `created`, `updated`| Parse to ISO 8601. Optional `created_by`, `updated_by`. |
| QuNote ID                      | `qid`               | Retain or generate. |
| Event Dates                    | `event_dates`       | Parse into list. |

---

## 6. Linking Conventions

- **Internal:** `[[qid Title]]` or `[[qid]]`. Converted to `[Title](relative/path)` at build.
- **Backlinks:** Native in Quartz; generated footer in Docsify.
- **Cross-references:** Defined in frontmatter under `influence`.

---

## 7. IDs, Slugs, and Naming

- **QID:** `QNO-YYYYMMDD-XXX` (e.g., `QNO-20250825-003`).
- **Slug:** Kebab case, filesystem safe. Default is derived from title.
- **Filename:** `YYYYMMDD--slug--qid.md` for sortability and stability.

---

## 8. Build Targets

### Docsify
- Lightweight, no build runtime.
- QuNote generates `_sidebar.md` grouped by Orbit/System.
- Adds code block copy buttons and backlinks footer.

### Quartz
- Supports Obsidian-style links and backlinks.
- QuNote syncs vault into `site/quartz/content/`.

**Shared theme:** Both use `site/theme.css` for consistency.

**Commands:**
```
python tools/build.py docsify
python tools/build.py quartz
python tools/build.py both
```

---

## 9. Auto Mind Map

QuNote produces a `graph.json` to power an interactive D3 mind map.

- **Nodes:** Represent QNodes with metadata (status, energy, tags, etc.).
- **Edges:** Derived from wikilinks, frontmatter `influence`, and taxonomy.
- **Viewer:** Docsify uses `/graph.html`; Quartz embeds as a custom page.

---

## 10. Tooling

- **build.py:** Orchestrates verification, sync, sidebar, graph.
- **verify_frontmatter.py:** Validates required keys and normalizes values.
- **sync_content.py:** Copies markdown to site directories and rewrites links.
- **build_sidebar.py:** Generates Docsify sidebar from frontmatter.
- **build_graph.py:** Produces `graph.json` from links and metadata.

All scripts are Python-only; optional dependencies: `pyyaml`, `python-frontmatter`.

---

## 11. Reference Implementations

**Wikilink Regex**
```python
WIKILINK = re.compile(r"\[\[([^\]|#]+)(?:\|([^\]]+))?\]\]")
```

**QID Generator**
```python
def next_qid(today, existing):
    base = today.strftime("%Y%m%d")
    seq = 1
    while True:
        qid = f"QNO-{base}-{seq:03d}"
        if qid not in existing:
            return qid
        seq += 1
```

**Normalization Maps**
```python
STATUS_MAP = {
  'inbox': 'Inbox (New)', 'processing': 'Processing', 'active': 'Active',
  'done': 'Done', 'dormant': 'Dormant', 'archive': 'Archive',
  'verified': 'Verified', 'delete': 'Delete'
}
ENERGY_MAP = {
  'surge': 'Surge', 'high': 'High', 'moderate': 'Moderate',
  'low': 'Low', 'blocked': 'Blocked'
}
```

---

## 12. Accessibility Features

- **Quick capture:** CLI spawns new QNode with ID and defaults.
- **Focus mode:** CSS hides sidebars/backlinks for reading.
- **Energy tint:** UI cues based on `energy` value.
- **Saved filters:** Predefined searches for focus.
- **Weekly review:** Surfaces random verified notes and stale inbox items.
- **Keyboard-first:** Minimal reliance on mouse.

---

## 13. Static Site Details

- **Docsify:** Minimal index, Prism highlighting, copy buttons, `_sidebar.md`, and `graph.html`.
- **Quartz:** Uses `content/` folder; `quartz.config.ts` imports `theme.css`; includes graph viewer page.

---

## 14. Testing

- **Unit tests:** Link resolution, QID generation, frontmatter validation.
- **Snapshot tests:** Compare fixture vault outputs.
- **Smoke test:** `python tools/build.py both` should complete successfully.

---

## 15. Migration Guide (Notion → QuNote)

1. Export Notion table as CSV.
2. Run `python tools/migrate_notion_csv.py path/to.csv`.
3. Generated markdown includes mapped frontmatter and content.
4. Verify QIDs, statuses, and energy normalization.
5. Build with `python tools/build.py both`.

**Edge cases handled:**
- Energy level case mismatches.
- Reflective score conversion.
- Origin/Orbit/Influence containing Notion URLs.

---

## 16. Security & Privacy

- No telemetry or external calls.
- Graph excludes private orbit by default.
- Option to exclude sensitive folders from sync.

---

## 17. Governance

- **License:** MIT.
- **Branching:** `main` is protected; PRs require passing tests.
- **Code Style:** Black (Python), Prettier (Markdown/JS).
- **Commits:** Conventional Commits enforced.
- **Issue Labels:** `bug`, `feat`, `docs`, `build`.

---

## 18. Roadmap

- Optional Electron wrapper for a standalone desktop app.
- Visual Kanban for status inside Docsify.
- Mermaid auto-diagrams for taxonomy clusters.
- Export/import adapters for Notion, Obsidian cache, and Google Drive text.

---

## 19. Templates

**QNode (General)**
```md
---
qid: QNO-{{date:YYYYMMDD}}-{{seq}}
slug: {{slug}}
title: {{title}}
summary: ""

type: [Note]
orbit: Journals
system:
origin:
influence: []

status: Inbox (New)
energy: Moderate
reflective_score: 3

tags: []
event_dates: []
links: []

created: {{now}}
created_by: {{user}}
updated: {{now}}
updated_by: {{user}}
---

## Notes
```

**Snippet**
```md
---
qid: QNO-{{date}}-{{seq}}
slug: {{slug}}
title: {{title}}
summary: ""

type: [Snippet]
orbit: Dev
system: Snippets
origin: {{language}}
status: Verified
energy: High
reflective_score: 6

tags: []
---

## Purpose

## Snippet
```{{language}}
# code here
```

## Notes
```

---

## 20. Repository Structure

```
qnote/
├─ vault/
│  ├─ 10-Orbits/
│  ├─ _templates/
│  └─ _assets/
├─ site/
│  ├─ docsify/
│  │  ├─ index.html
│  │  ├─ _sidebar.md (generated)
│  │  ├─ graph.html (viewer)
│  │  └─ theme.css
│  └─ quartz/
│     ├─ content/
│     └─ quartz.config.ts
├─ tools/
│  ├─ build.py
│  ├─ verify_frontmatter.py
│  ├─ sync_content.py
│  ├─ build_sidebar.py
│  ├─ build_graph.py
│  └─ migrate_notion_csv.py
├─ tests/
│  ├─ test_frontmatter.py
│  ├─ test_links.py
│  └─ fixtures/
├─ .pre-commit-config.yaml
├─ README.md
└─ LICENSE
```

---

## 21. Quick Start

1. Copy the repo skeleton.
2. Add your Obsidian vault under `/vault`.
3. Run `python tools/build.py both`.
4. Serve `site/docsify/` or build Quartz.

You now have a schema-driven, graph-visualized, Obsidian-authored knowledge base with interchangeable Quartz or Docsify outputs.

