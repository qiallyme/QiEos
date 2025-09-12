#!/usr/bin/env node
// Build public KB into Neurite wiki view
// - Reads markdown or html files from apps/web/public/kb
// - Emits HTML pages under apps/Nuerite/Neurite/wiki/pages/kb
// - Generates a simple index.html with links

import fs from 'fs';
import fsp from 'fs/promises';
import path from 'path';

const repoRoot = process.cwd();
const kbSrcDir = path.resolve(repoRoot, 'apps', 'web', 'public', 'kb');
const neuritePagesDir = path.resolve(
  repoRoot,
  'apps',
  'Nuerite',
  'Neurite',
  'wiki',
  'pages',
  'kb',
);

function basicMarkdownToHtml(md) {
  let html = md;
  // code blocks ```
  html = html.replace(/```([\s\S]*?)```/g, (_, code) => `<pre><code>${escapeHtml(code.trim())}</code></pre>`);
  // inline code
  html = html.replace(/`([^`]+)`/g, (_, code) => `<code>${escapeHtml(code)}</code>`);
  // headings
  html = html.replace(/^######\s+(.*)$/gm, '<h6>$1</h6>');
  html = html.replace(/^#####\s+(.*)$/gm, '<h5>$1</h5>');
  html = html.replace(/^####\s+(.*)$/gm, '<h4>$1</h4>');
  html = html.replace(/^###\s+(.*)$/gm, '<h3>$1</h3>');
  html = html.replace(/^##\s+(.*)$/gm, '<h2>$1</h2>');
  html = html.replace(/^#\s+(.*)$/gm, '<h1>$1</h1>');
  // bold/italics
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');
  // links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
  // paragraphs
  html = html
    .split(/\n\n+/)
    .map((block) => {
      if (/^<h[1-6]>/.test(block) || /^<pre>/.test(block) || /^<ul>/.test(block) || /^<ol>/.test(block)) return block;
      return `<p>${block}</p>`;
    })
    .join('\n');
  return html;
}

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

async function ensureDir(dir) {
  await fsp.mkdir(dir, { recursive: true });
}

async function readAllFilesRecursive(dir) {
  const entries = await fsp.readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await readAllFilesRecursive(full)));
    } else {
      files.push(full);
    }
  }
  return files;
}

function makeTitleFromFilename(name) {
  const base = name.replace(/\.(md|html)$/i, '');
  return base
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (m) => m.toUpperCase());
}

function wrapHtml(title, body) {
  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${title}</title>
    <link rel="stylesheet" href="/wiki/css/wikistyle.css" />
  </head>
  <body>
    <main class="kb-doc">
      <h1>${title}</h1>
      ${body}
      <hr />
      <p><a href="./index.html">Back to KB Index</a></p>
    </main>
  </body>
</html>`;
}

async function run() {
  if (!fs.existsSync(kbSrcDir)) {
    console.log(`[kb] Source not found (skipping): ${kbSrcDir}`);
    return;
  }
  const srcFiles = await readAllFilesRecursive(kbSrcDir);
  if (srcFiles.length === 0) {
    console.log('[kb] No files under apps/web/public/kb (nothing to build).');
    return;
  }

  await ensureDir(neuritePagesDir);

  const items = [];
  for (const file of srcFiles) {
    const rel = path.relative(kbSrcDir, file);
    const ext = path.extname(file).toLowerCase();
    if (!['.md', '.html', '.htm'].includes(ext)) continue;

    const outRel = rel.replace(/\.(md)$/i, '.html');
    const outPath = path.join(neuritePagesDir, outRel);
    await ensureDir(path.dirname(outPath));

    const raw = await fsp.readFile(file, 'utf8');
    let html;
    if (ext === '.md') {
      html = basicMarkdownToHtml(raw);
    } else {
      html = raw;
    }
    const title = makeTitleFromFilename(path.basename(outPath));
    const wrapped = wrapHtml(title, html);
    await fsp.writeFile(outPath, wrapped, 'utf8');

    const link = outRel.replace(/\\/g, '/');
    items.push({ title, link });
  }

  // Write index
  const indexHtml = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Knowledge Base</title>
    <link rel="stylesheet" href="/wiki/css/wikistyle.css" />
  </head>
  <body>
    <main class="kb-index">
      <h1>Knowledge Base</h1>
      <ul>
        ${items
          .sort((a, b) => a.title.localeCompare(b.title))
          .map((i) => `<li><a href="./${i.link}">${i.title}</a></li>`) 
          .join('\n')}
      </ul>
    </main>
  </body>
</html>`;
  await fsp.writeFile(path.join(neuritePagesDir, 'index.html'), indexHtml, 'utf8');

  console.log(`[kb] Built ${items.length} page(s) into ${neuritePagesDir}`);
}

run().catch((err) => {
  console.error('[kb] Build failed:', err);
  process.exit(1);
});


