# ESL Lessons App (Static, Markdown-powered)

A tiny, no-framework webapp you can deploy on Cloudflare Pages. Drop `.md` files into the `lessons/` folder, run `npm run build`, and it generates `public/lessons/index.json`. The front-end lists lessons by section and renders Markdown securely.

## Features
- Add Markdown files and folders; folders become **sections**
- Auto-generated lesson index
- Client-side search
- Clean, responsive UI
- Syntax highlighting for code
- Safe rendering with DOMPurify

## Structure
```
.
├── lessons/               # Your .md files (subfolders = sections)
│   ├── Basics/
│   │   └── communication.md
│   └── sample.md
├── public/
│   ├── index.html
│   ├── styles.css
│   ├── app.js
│   └── lessons/
│       └── index.json     # Generated
├── scripts/
│   └── generate-index.mjs
├── package.json
└── README.md
```

## Authoring
- Put lessons into `lessons/`.
- Use the first `# Heading` line as the title. If missing, the filename is used.
- Organize into subfolders to create **sections** in the sidebar.

## Build
```
npm run build
```
This scans `lessons/` and writes `public/lessons/index.json`. It also copies all `.md` files into `public/lessons/` keeping the same folder structure.

## Local Preview
```
npm i -g http-server
npm run start
```
Then open http://localhost:8080

## Deploy on Cloudflare Pages
1. Push this repo to GitHub.
2. In Cloudflare Pages, **Create a project** → **Connect to Git**.
3. Set **Build command**: `npm run build`
4. Set **Build output directory**: `public`
5. Save and deploy.
6. Whenever you commit new `.md` files under `lessons/` and push, Pages will rebuild and publish automatically.

## Notes
- If you want to avoid any build step, you can manually update `public/lessons/index.json` yourself. But it's easier to run the generator.
- Markdown is sanitized (DOMPurify) for safety. Inline HTML is removed unless safe.
