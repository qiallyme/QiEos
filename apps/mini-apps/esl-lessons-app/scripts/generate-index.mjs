import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT = path.resolve(__dirname, '..');
const LESSONS_DIR = path.join(ROOT, 'lessons');
const OUT_DIR = path.join(ROOT, 'public', 'lessons');

function ensureDir(p) {
  fs.mkdirSync(p, { recursive: true });
}

function titleFromMarkdown(md, fallback) {
  const m = md.match(/^\s*#\s+(.+)$/m);
  if (m) return m[1].trim();
  return fallback;
}

function walk(dir, base = '') {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  let files = [];
  for (const ent of entries) {
    const full = path.join(dir, ent.name);
    const rel = path.join(base, ent.name);
    if (ent.isDirectory()) {
      files = files.concat(walk(full, rel));
    } else if (ent.isFile() && ent.name.toLowerCase().endsWith('.md')) {
      files.push({ full, rel });
    }
  }
  return files;
}

function sectionFromRel(rel) {
  const parts = rel.split(path.sep);
  return parts.length > 1 ? parts[0] : 'General';
}

function slugify(p) {
  return p.replace(/\\/g, '/');
}

function main() {
  if (!fs.existsSync(LESSONS_DIR)) {
    console.error('No lessons/ directory found.');
    process.exit(1);
  }
  ensureDir(OUT_DIR);

  const files = walk(LESSONS_DIR);
  const index = [];

  for (const f of files) {
    const md = fs.readFileSync(f.full, 'utf-8');
    const title = titleFromMarkdown(md, path.basename(f.rel, '.md'));
    const section = sectionFromRel(f.rel);
    const outPath = path.join(OUT_DIR, f.rel);
    ensureDir(path.dirname(outPath));
    fs.copyFileSync(f.full, outPath);

    index.push({
      title,
      section,
      path: 'lessons/' + slugify(f.rel)
    });
  }

  // sort by section then title
  index.sort((a, b) => a.section.localeCompare(b.section) || a.title.localeCompare(b.title));

  fs.writeFileSync(path.join(OUT_DIR, 'index.json'), JSON.stringify(index, null, 2), 'utf-8');
  console.log(`Wrote ${index.length} lessons to public/lessons/index.json`);
}

main();
