const state = {
  index: [],
  grouped: {},
  current: null,
};

const navEl = document.getElementById('nav');
const contentEl = document.getElementById('content');
const searchEl = document.getElementById('search');

async function fetchIndex() {
  try {
    const res = await fetch('lessons/index.json', { cache: 'no-store' });
    if (!res.ok) throw new Error('No index.json yet. Run the build.');
    const data = await res.json();
    state.index = data;
    groupIndex();
    renderNav();
  } catch (e) {
    contentEl.innerHTML = `<p style="color:#fca5a5">Index not found. Make sure to run <code>npm run build</code> to generate <code>public/lessons/index.json</code>.</p>`;
  }
}

function groupIndex() {
  const grouped = {};
  for (const item of state.index) {
    if (!grouped[item.section]) grouped[item.section] = [];
    grouped[item.section].push(item);
  }
  // sort each section's lessons by title
  Object.values(grouped).forEach(arr => arr.sort((a,b) => a.title.localeCompare(b.title)));
  state.grouped = grouped;
}

function renderNav(filter = '') {
  const f = filter.trim().toLowerCase();
  navEl.innerHTML = '';

  const sections = Object.keys(state.grouped).sort((a,b) => a.localeCompare(b));
  for (const section of sections) {
    const lessons = state.grouped[section].filter(l => {
      return !f || l.title.toLowerCase().includes(f);
    });
    if (!lessons.length) continue;

    const secEl = document.createElement('div');
    secEl.className = 'section';
    const h = document.createElement('h3');
    h.textContent = section;
    secEl.appendChild(h);

    const ul = document.createElement('ul');
    ul.className = 'lessons';
    for (const l of lessons) {
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = `#${encodeURIComponent(l.path)}`;
      a.textContent = l.title;
      if (state.current === l.path) a.classList.add('active');
      li.appendChild(a);
      ul.appendChild(li);
    }
    secEl.appendChild(ul);
    navEl.appendChild(secEl);
  }
}

async function renderLesson(pathname) {
  try {
    const res = await fetch(pathname, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to load lesson: ' + pathname);
    const md = await res.text();

    // Configure marked
    marked.setOptions({
      gfm: true,
      breaks: true,
      highlight(code, lang) {
        try { return hljs.highlight(code, { language: lang }).value; }
        catch { return hljs.highlightAuto(code).value; }
      }
    });

    const dirty = marked.parse(md);
    const clean = DOMPurify.sanitize(dirty, { USE_PROFILES: { html: true } });
    contentEl.innerHTML = clean;

    // scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // set active link
    state.current = pathname;
    renderNav(searchEl.value);
  } catch (e) {
    contentEl.innerHTML = `<p style="color:#fca5a5">${e.message}</p>`;
  }
}

function handleHashChange() {
  const hash = decodeURIComponent(location.hash.replace(/^#/, ''));
  if (!hash) return;
  renderLesson(hash);
}

searchEl.addEventListener('input', (e) => {
  renderNav(e.target.value);
});

window.addEventListener('hashchange', handleHashChange);

(async function init() {
  await fetchIndex();
  if (location.hash) handleHashChange();
  else {
    // show first lesson if exists
    const first = state.index[0];
    if (first) {
      location.hash = encodeURIComponent(first.path);
    } else {
      contentEl.innerHTML = '<p style="color:#9ca3af">No lessons yet. Add .md files under <code>lessons/</code> and run <code>npm run build</code>.</p>';
    }
  }
})();
