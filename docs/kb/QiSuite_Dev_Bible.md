# QiSuite Dev Bible

## 📌 Project Overview

**QiSuite** is a modular second brain framework with:
- A desktop app (Electron + React + Tailwind)
- A hosted chatbot (Cloudflare Worker API)
- Core assistant ("Qinnie") that runs both locally and in the cloud

Main goal: create a modular and extensible foundation for AI-first business tools like:
- QiFileFlow (duplicate file cleaner + OCR)
- QiNote (semantic note builder)
- QiLifeFeed (daily logs, time tracking, automations)
- QiMind (vector memory / contextual Qinnie)

---

## 🔧 Stack Overview

### Desktop (Electron + React + Tailwind)
- Runs on `Electron` using Vite as the dev server.
- Hot-reloads React UI with Tailwind CSS.
- Has local storage-based settings management (for API keys, etc.).
- Loads Qinnie dock on all screens.

### Web API (Cloudflare Worker)
- POST endpoint: `/chat`
- Accepts `{ message }` JSON and returns `{ reply }`
- Will eventually support:
  - OpenAI + Ollama fallback
  - Per-client memory (KV store)
  - Branded deployment URLs

---

## ⚙️ Features (Current)

### ✅ Electron Shell
- Main window loads Vite app.
- Preload.js supports secure IPC for key storage.

### ✅ UI (React + Tailwind)
- Homepage with `Hero`, `Pitch`, `Pricing`, `Footer`
- Persistent `QinnieDock` open by default
- Responsive layout

### ✅ QinnieDock
- Floating assistant dock in lower right
- Open by default (can collapse)
- Settings panel (gear icon):
  - OpenAI Key
  - Worker URL
- Messages persist per session (local only)
- Replies fetched from Worker (if configured), else fallback

### ✅ Branding
- Core brand: **QiSuite**
- Powered by: **BuiltByRays™**
- All client-specific assets abstracted to `shared/theme.js`

### ✅ Worker API
- Cloudflare Worker endpoint: `/chat`
- Basic echo-style reply stub
- Ready for KV + OpenAI integrations

---

## 🔐 Settings Management

Uses localStorage for now:
- `OPENAI_API_KEY`
- `WORKER_API_URL`

Settings panel available inside Qinnie dock.

---

## 🧱 Folder Structure

```
QiSuite_Full_Build/
├── electron/
│   ├── main/              ← Electron startup logic
│   ├── renderer/
│   │   ├── pages/App.jsx
│   │   ├── components/    ← Modular UI: Hero, Pitch, Pricing, Dock, etc.
│   └── package.json
│
├── shared/
│   └── theme.js           ← Branding config
│
├── workers/
│   ├── src/index.js       ← Cloudflare Worker logic
│   └── wrangler.toml
└── README.md              ← Full setup & deployment guide
```

---

## 🌐 Cloudflare Deployment

### Setup
```bash
npm install -g wrangler
wrangler login
cd workers
wrangler publish
```

### URL
```http
POST https://your-app-name.workers.dev/chat
Content-Type: application/json
Body: { "message": "Hello Qinnie" }
```

### KV / Secrets (coming)
```bash
wrangler kv:namespace create QINNIE_KV
wrangler secret put OPENAI_API_KEY
```

---

## 🔮 Next Sprints

### Sprint 1: QiFileFlow
- Duplicate file detection (hashing)
- OCR and semantic labeling
- File quarantine + tagging UI

### Sprint 2: QiMind
- Local vector database (Chroma, Weaviate, or Ollama embed)
- RAG + search for enhanced memory in Qinnie

### Sprint 3: Client Portal Mode
- Convert UI into mobile-friendly PWA
- Tailwind theme overrides per client repo

---

## 🧠 Notes
- All branding should come from `theme.js`
- Clients can fork or clone this repo and deploy their own version
- Shared modules will live in `modules/` soon

---

## ✍️ Maintainer
**Q / Cody Rice Velasquez**  
`qially.me` · `qiSuite.app` · `BuiltByRays™`

---

> “Go big or go home.” – The mission is modular sovereignty. This is just the beginning.
Session’s reset, so I rebuilt your **entire Zoho AI Blog Pipeline Blueprint** (Solid-but-Big) with OpenAI handling content + cover images. Here’s the **end-to-end package**:

---

# **Zoho AI Blog Pipeline – Full Blueprint**

## **1. System Overview**

- **Workflow:** AI generates → Draft → Approval → Publish → Social Share → Archive
    
- **Core Tools:**
    
    - **Zoho Flow** (automation backbone)
        
    - **Zoho Projects/Tasks** (content pipeline board)
        
    - **Zoho Forms** (approval gateway)
        
    - **Zoho WorkDrive** (draft storage)
        
    - **Zoho Sites** (blog CMS)
        
    - **Zoho Social** (distribution)
        
    - **OpenAI (GPT-4 + DALL·E)** (content + images)
        

---

## **2. Folder & Task Structure**

### **WorkDrive Structure**

```
/Blog
  /Topics
  /Drafts
  /Approved
  /Published
```

### **Projects Board Columns**

- Topics → Draft → Pending Approval → Approved → Published
    

---

## **3. Flow Architecture**

### **Flow 1: Topic Generation**

- **Trigger:** Monthly schedule (1st day)
    
- **Action:**
    
    - OpenAI → generate 4–8 SEO blog topics
        
    - Create Zoho Tasks with titles, keywords, dates
        

### **Flow 2: Draft Creation**

- **Trigger:** New task enters “Draft”
    
- **Action:**
    
    - OpenAI → write full blog draft
        
    - DALL·E → create cover image
        
    - Save files to WorkDrive/Drafts
        
    - Update Task with WorkDrive links
        

### **Flow 3: Approval Workflow**

- **Trigger:** Draft ready
    
- **Action:**
    
    - Zoho Form auto-filled with article preview + approve/reject buttons
        
    - Submission updates task:
        
        - Approve → move to “Approved”
            
        - Reject → send back to “Draft” with comments
            

### **Flow 4: Publish**

- **Trigger:** Task moves to “Approved”
    
- **Action:**
    
    - Push article + image via Zoho Sites API
        
    - Mark task as “Published”
        

### **Flow 5: Social Share**

- **Trigger:** New blog published
    
- **Action:**
    
    - AI generates captions (long/short/hashtag variants)
        
    - Post via Zoho Social to LinkedIn, IG, Facebook, X
        

### **Flow 6: Archive**

- Move final draft + image to “Published” folder
    
- Log analytics in Zoho Analytics or Sheet
    

---

## **4. AI Prompt Templates**

### **Topic Generation**

```
Generate {X} blog post ideas for [brand/audience].
Focus on trending topics for next {month}.
Output: Title + 3 keywords + 1-sentence hook.
```

### **Blog Draft**

```
Write a {1,200}-word blog post for [brand/audience].
Tone: conversational, professional.
Include H2 sections, SEO keywords, and call-to-action.
Format: Markdown (Zoho compatible).
```

### **Cover Image**

```
Create a modern, vibrant cover image for a blog about [topic].
Style: minimal, brand colors (#hex).
Format: 1200x630px, no text.
```

---

## **5. Zoho Form (Approval Mockup)**

**Fields:**

- Article Title (auto-filled)
    
- Preview (link to WorkDrive)
    
- Approve (Yes/No radio)
    
- Feedback (multi-line)
    
- Submit button → triggers Flow update
    

---

## **6. Zoho Sites API (Publish)**

**Endpoint:**  
`POST https://sites.zoho.com/api/v1/blogs/{siteId}/posts`

**Payload:**

```json
{
  "title": "Blog Title",
  "content": "<p>HTML of blog</p>",
  "image": "https://workdrive.link/image.jpg",
  "meta_title": "SEO Title",
  "meta_description": "SEO Description",
  "status": "published"
}
```

---

## **7. Social Share (Zoho Social API)**

**Caption Generator Example:**

```
Create 3 caption variants:
1. Conversational (LinkedIn)
2. Short + emoji (Twitter/X)
3. Visual hook (Instagram/Facebook)
Include CTA: "Read full post → [link]"
```

---

## **8. Mockup Overview**

- **Kanban Board:** Visual pipeline from topic → publish
    
- **Form Preview:** Simple approve/reject flow
    
- **Automation Map:** Arrows showing Flow steps & triggers
    
- **Branding:** OpenAI images, QiLife style guide colors
    

---

## **Next Steps**

1. Configure WorkDrive & Projects structure.
    
2. Build Flows (start with Topic Gen + Draft Creation).
    
3. Create Approval Form → link to Flow.
    
4. Configure Zoho Sites API → test publish.
    
5. Set up Zoho Social → test captions.
    

---

Totally hear you—Tauri’s toolchain and Tailwind setup can feel like a hurdle when all you want is a simple GUI shell. Let’s pause on Tailwind and get you a crisp-looking app with plain CSS so you can move on to wiring up the Python bits, then we can layer in fancier styling later.

---

## A. Strip out Tailwind for now

1. **Remove** the Tailwind imports and configs:
    
    - Delete or ignore `tailwind.config.*` and `postcss.config.*`.
        
    - In your **`src/index.css`**, wipe it clean (or delete and recreate) with:
        
        ```css
        /* src/index.css */
        body, html, #root {
          margin: 0;
          padding: 0;
          height: 100%;
          font-family: sans-serif;
          background: #f5f5f5;
        }
        .app-header {
          background: white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          padding: 16px;
          font-size: 1.5rem;
          font-weight: 500;
        }
        .split-view {
          display: flex;
          height: calc(100% - 64px); /* header is 64px tall */
        }
        .sidebar {
          width: 240px;
          background: white;
          border-right: 1px solid #ddd;
          overflow-y: auto;
        }
        .sidebar button {
          display: block;
          width: 100%;
          padding: 12px 16px;
          border: none;
          background: none;
          text-align: left;
          font-size: 1rem;
          cursor: pointer;
        }
        .sidebar button:hover {
          background: #eee;
        }
        .sidebar .active {
          background: #007acc;
          color: white;
        }
        .content {
          flex: 1;
          padding: 24px;
          overflow-y: auto;
        }
        .card {
          background: white;
          padding: 24px;
          max-width: 600px;
          margin: 0 auto;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          border-radius: 8px;
        }
        .card h2 {
          margin-top: 0;
          margin-bottom: 12px;
          font-size: 1.25rem;
        }
        ```
        
2. **Update your React components** to use these class names:
    
    ```tsx
    // src/App.tsx
    import React, { useState } from "react";
    import Sidebar from "./components/Sidebar";
    import DuplicateCleaner from "./components/DuplicateCleaner";
    import FileFlow from "./components/FileFlow";
    import QuickReceipt from "./components/QuickReceipt";
    import "./index.css";
    
    const modules = {
      "duplicate-cleaner": <DuplicateCleaner />,
      "file-flow":        <FileFlow />,
      "quick-receipt":    <QuickReceipt />
    };
    
    export default function App() {
      const [active, setActive] = useState<keyof typeof modules>("duplicate-cleaner");
      return (
        <div className="app-header">QILife One 2.0</div>
        <div className="split-view">
          <Sidebar active={active} onSelect={setActive} />
          <div className="content">
            {modules[active]}
          </div>
        </div>
      );
    }
    ```
    
    ```tsx
    // src/components/Sidebar.tsx
    import React from "react";
    type Props = { active: string; onSelect: (k: string) => void; };
    const items = [
      ["duplicate-cleaner","Duplicate Cleaner"],
      ["file-flow","File Flow"],
      ["quick-receipt","Quick Receipt"]
    ] as const;
    
    export default function Sidebar({ active, onSelect }: Props) {
      return (
        <div className="sidebar">
          {items.map(([key,label])=>(
            <button
              key={key}
              className={active===key ? "active" : ""}
              onClick={()=>onSelect(key)}
            >
              {label}
            </button>
          ))}
        </div>
      );
    }
    ```
    
    ```tsx
    // src/components/DuplicateCleaner.tsx
    import React from "react";
    export default function DuplicateCleaner() {
      return (
        <div className="card">
          <h2>Duplicate Cleaner</h2>
          <p>Placeholder UI for Duplicate Cleaner module</p>
        </div>
      );
    }
    ```
    
    And similarly wrap `FileFlow` and `QuickReceipt` in `.card`.
    
3. **Run** as before:
    
    ```bash
    npm install
    npm run tauri dev
    ```
    

You’ll immediately get a respectable white‐and‐gray UI with a header, sidebar buttons that highlight, and centered cards—no Tailwind or PostCSS headaches.

---

## B. Next steps

Once you’re comfortable with the shell, we can:

- Wire up the Tauri commands to each module.
    
- Introduce a lightweight component library (e.g. **Chakra UI** or **Material-UI**) if you want richer styling without custom PostCSS.
    
- Circle back to Tailwind (or another utility lib) once the core features are working.
    

Does this plain-CSS approach feel like a better springboard? Let me know and I’ll help with any tweaks or next wiring steps.

Q, step away from the Big Red “Delete Index” button. Some of those index files are _holding the whole wig on_. Let’s do this clean so you stop chasing phantom errors.

# What “index.*” actually does (quick and real)

- **Barrel/auto‑resolve**: `import x from './foo'` actually loads `./foo/index.(js|ts|tsx)`. Delete that index and every import like that breaks until you change it to `./foo/actualFile`.
    
- **Entry points**: `renderer/src/index.tsx` (React entry), `app/main/main.js` (Electron main), and the root `index.html` (Vite) are non‑negotiable. Kill those and the app just… won’t.
    
- **Static folders**: Random `index.html` files sprinkled in content folders (meant to hide directory listing on web servers) are fine to delete in an Electron app—they’re noise.
    

# What you can delete safely (now)

- Any **index.html** sitting inside vault/docs/marketing/etc. that’s not the **root** app page.
    
- Any **index.js/ts** that’s just a dead barrel file (it only re‑exports from another file) **IF** you also fix the imports that point at the folder.
    

# What you must NOT delete

- `qilife-one/app/renderer/src/index.tsx` (or your renderer’s main index file)
    
- `qilife-one/app/main/main.js` (Electron main process entry)
    
- Root `index.html` used by Vite/Electron to load the renderer
    
- Any `preload.js` that your `BrowserWindow` is configured to use
    

# Fast safety check before you go snip‑snip

**Do this in the project root.**

## 1) Find all imports that rely on folder auto‑index

- **PowerShell (Windows)**:
    

```powershell
# shows imports that end at a folder (no file extension) – likely relying on index files
(Get-ChildItem -Recurse -Include *.js,*.ts,*.tsx | 
  Select-String -Pattern "from\s+['""](\.\/|\.\.\/)[^'""]+['""]" ) |
  Where-Object { $_.Line -notmatch "\.(js|ts|tsx|jsx|mjs|cjs)['""]$" } |
  Select-Object Path, LineNumber, Line
```

- **ripgrep (if you have it):**
    

```bash
rg -n "from ['\"](\.\/|\.\.\/)[^'\"\.]+['\"]" --glob '!**/dist/**' --glob '!**/node_modules/**'
```

These hits are the **imports you’ll break** if you delete the corresponding `index.*`. Plan to rewrite them to point at actual files (e.g., `./foo/index.ts` → `./foo/fooService.ts`).

## 2) Dry‑run delete without chaos

Rename suspected index files first:

```powershell
Get-ChildItem -Recurse -Include index.js,index.ts,index.tsx,index.html `
| Where-Object { $_.FullName -notmatch "renderer\\src\\index\.tsx|app\\main\\main\.js$|\\index\.html$" } `
| Rename-Item -NewName { $_.Name + ".bak" }
```

Then run:

```bash
npm run typecheck  # if you have tsc configured
npm run build      # see what actually fails
```

If it builds clean, delete the `.bak` files. If not, fix the imports the errors complain about.

## 3) Convert barrels to explicit files (when you _do_ remove them)

Example:

```diff
- import { clean } from './fileflow';
+ import { clean } from './fileflow/clean.js';
```

Do a quick project‑wide replace once you decide on file names.

# Recommendation for your repo right now

## Fast & Dirty (10–15 min)

1. **Keep**:
    
    - `app/main/main.js`
        
    - `app/renderer/src/index.tsx`
        
    - root `index.html`
        
    - any `preload.js` referenced in `main.js`
        
2. **Rename** every other `index.*` to `.bak` (command above).
    
3. Run `npm run build`. Fix only the imports that explode. Delete the rest.
    

## Solid & Safe (1–2 hrs)

- Replace folder‑level imports with file‑specific imports across the repo (search/replace).
    
- Delete dead barrel `index.*` files.
    
- Add **eslint-plugin-import** rules so unresolved imports scream early:
    

```json
// .eslintrc
{
  "plugins": ["import"],
  "rules": {
    "import/no-unresolved": "error",
    "import/extensions": ["error", "ignorePackages", { "js":"never","ts":"never","tsx":"never" }]
  },
  "settings": { "import/resolver": { "node": { "extensions": [".js",".ts",".tsx"] } } }
}
```

## Big Energy (future‑proof)

- **Disallow folder imports** entirely with a lint rule:
    

```json
"no-restricted-syntax": ["error", {
  "selector": "ImportDeclaration[source.value=/^(\\.\\.?\\/)(?!.*\\.(js|ts|tsx)$).*/]",
  "message": "Import a file, not a folder. Explicit > implicit."
}]
```

- Add a **path alias** system so you never deal with `../../..` nonsense again. In `tsconfig.json`:
    

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@main/*": ["app/main/*"],
      "@renderer/*": ["app/renderer/*"],
      "@backend/*": ["backend/*"]
    }
  }
}
```

And wire webpack/vite to respect those aliases.

# About deleting the _main_ index

You **can** test it: rename the main index (renderer entry) and see if your bundler pukes. Spoiler: it will. Keep the main app entry + Electron main. Those are entry points, not directory‑listing stubs.

---

Say the word and I’ll drop the **zip** with:

- Clean **Electron + Python** split
    
- No dumb index barrels
    
- Aliases configured
    
- Lint rules that block folder‑imports
    
- Example import patterns (explicit files only)
    
- Post‑install script to spawn the Python backend
    

You want **Fast & Dirty** minimal skeleton or **Big Energy** fully commented build‑ready package?

Short answer: it’ll work when we stop tripping over our own shoelaces. Long answer: here’s the game plan to get Cockpit actually launching your backend, showing live status, and not pretending files live in folders that don’t exist. I read the files you dropped in, and a few issues are elbowing each other for “most annoying.” I’m fixing them all in one pass below.

# What’s broken (and why I’m sighing)

1. Renderer vs Electron bridge mismatch
    
    - `preload.js` exports `electronAPI.launchBackend()`, but `ConnectionManager.jsx` calls `window.require('electron')` and tries `ipcRenderer.invoke(...)`. That won’t fly with `contextIsolation: true`. Use the exposed API instead.
        
2. Backend launcher command is… not a command
    
    - In `main.js` your ternary is built on a truthy string, so it always picks the Windows branch, and the command string is malformed. Also, activating the venv and starting Uvicorn needs platform‑specific spawn args, not wishful thinking.
        
3. Vite/Tailwind paths and folder layout
    
    - `index.html` imports `/src/main.jsx`, but your `main.jsx`, `App.jsx`, and components are at the project root. Tailwind is looking under `./src/**/*` too. We either move files into `src/` or change all the tooling. Moving is cleaner.
        
4. Frontend health check expectations
    
    - UI is hitting `http://localhost:7130/api/run/` on connect. If the backend isn’t up yet, we should trigger the launcher and poll a simple `/health` before loading apps. Right now it just shrugs.
        

# The fix — step by step

Do these in order, then you can run `npm run electron-dev` like a functional adult.

## 1) Reshuffle the frontend into a proper `src/` layout

Create these folders and move files:

`/src   /components     Dashboard.jsx     Header.jsx     ConnectionManager.jsx     LogViewer.jsx     MiniAppCard.jsx   App.jsx   main.jsx   index.css index.html`

Update imports inside `App.jsx` after moving:

`- import Dashboard from './components/Dashboard' - import Header from './components/Header' - import ConnectionManager from './components/ConnectionManager' + import Dashboard from './components/Dashboard' + import Header from './components/Header' + import ConnectionManager from './components/ConnectionManager'`

Yes, paths stay the same after the move because they’re now relative to `/src`.

`index.html` already points to `/src/main.jsx`, so once the files live there, builds stop sulking.

## 2) Tailwind config: make sure it actually sees your files

`tailwind.config.js`

 `export default {    content: [ -    "./index.html", -    "./src/**/*.{js,ts,jsx,tsx}", +    "./index.html", +    "./src/**/*.{js,jsx,ts,tsx}",    ],    theme: { /* unchanged */ }  }`

## 3) Fix the secure Renderer ↔ Main bridge usage

`preload.js` is fine. Use it.

`ConnectionManager.jsx` — replace the raw `ipcRenderer` usage and add a real health check with basic polling:

`-import React, { useState } from 'react'; -import axios from 'axios'; +import React, { useState } from 'react'; +import axios from 'axios';   export default function ConnectionManager({ onConnect }) {    const [status, setStatus] = useState("Disconnected");  -  const checkBackend = async () => { +  const checkBackend = async () => {      try { -      await axios.get("http://localhost:7130/api/run/"); -      setStatus("Connected"); -      onConnect(); +      await axios.get("http://localhost:7130/health"); +      setStatus("Connected"); +      onConnect();      } catch (e) {        console.warn("Backend not running. Attempting to launch..."); -      launchBackend(); +      await launchBackend(); +      await waitForHealth();      }    };  -  const launchBackend = async () => { -    const { ipcRenderer } = window.require('electron'); -    ipcRenderer.invoke("launch-backend") -      .then(() => { -        setStatus("Connected"); -        onConnect(); -      }) -      .catch(() => { -        setStatus("Failed to start"); -      }); -  }; +  const launchBackend = async () => { +    if (!window.electronAPI?.launchBackend) { +      setStatus("No bridge"); +      throw new Error("electronAPI not available"); +    } +    await window.electronAPI.launchBackend(); +  }; + +  const waitForHealth = async (timeoutMs = 15000) => { +    const start = Date.now(); +    while (Date.now() - start < timeoutMs) { +      try { +        await axios.get("http://localhost:7130/health", { timeout: 1000 }); +        setStatus("Connected"); +        onConnect(); +        return; +      } catch { +        await new Promise(r => setTimeout(r, 500)); +      } +    } +    setStatus("Failed to start"); +    throw new Error("Backend failed to become healthy in time"); +  };     return (      <div className="absolute top-4 right-6">        <button          onClick={checkBackend}          className="bg-electric text-white px-4 py-2 rounded shadow hover:bg-blue-600"        >          {status === "Connected" ? "Connected" : "Connect"}        </button>      </div>    );  }`

Also update `App.jsx` so Connect follows the same logic and doesn’t hammer `/api/run/` blindly:

`-  const fetchApps = async () => { +  const fetchApps = async () => {      setIsLoading(true)      try { -      const response = await axios.get('http://localhost:7130/api/run/') +      const response = await axios.get('http://localhost:7130/api/apps')        setApps(response.data)      } catch (err) {        console.error('Failed to fetch miniapps:', err)        setApps([])      } finally {        setIsLoading(false)      }    }     const handleConnect = async () => {      if (!isConnected) { -      // Try to connect and fetch apps        try { -        await fetchApps() +        // Ask ConnectionManager’s button or call the bridge directly if needed. +        if (window.electronAPI?.launchBackend) { +          await window.electronAPI.launchBackend() +        } +        // wait for health quickly +        await axios.get('http://localhost:7130/health', { timeout: 5000 }) +        await fetchApps()          setIsConnected(true)        } catch (err) {          console.error('Failed to connect:', err)          setIsConnected(false)        }      } else {        setIsConnected(false)        setApps([])      }    }`

If your backend doesn’t have `/health` and `/api/apps` yet, you can point these to whatever you actually have. I’m standardizing the endpoints because future-you will thank me.

## 4) Make the backend launcher actually run on Windows, macOS, and Linux

Replace your `ipcMain.handle('launch-backend', ...)` in `main.js` with a sane, cross‑platform spawn. This version:

- Detects platform
    
- Activates the venv if present
    
- Uses `uvicorn main:app --host 127.0.0.1 --port 7130`
    
- Leaves `--reload` for dev only
    
- Logs output so you can see what exploded
    

 ``// main.js  const { app, BrowserWindow, ipcMain } = require('electron')  const path = require('path')  const isDev = !app.isPackaged  const { spawn } = require('child_process')   let mainWindow   function createWindow() { /* unchanged */ }   app.whenReady().then(() => {    createWindow()     // Handle backend launch from frontend request -  ipcMain.handle('launch-backend', () => { -    const backendPath = path.join(__dirname, '..', 'QiLifeCore-BackendAPI') -    const venvActivate = process.platform === 'win32' -      ? path.join(backendPath, 'venv', 'Scripts', 'activate.bat') -      : path.join(backendPath, 'venv', 'bin', 'activate') - -    const command = 'cmd.exe /c "${venvActivate} && ${backendPath} && python -m uvicorn main:app --reload --port 7130"' -      ? `cmd.exe /c "${venvActivate} && uvicorn main:app --reload"` -      : `bash -c "source ${venvActivate} && uvicorn main:app --reload"` - -    console.log('Launching backend from:', backendPath) -    spawn(command, { cwd: backendPath, shell: true }) -  }) +  ipcMain.handle('launch-backend', async () => { +    const backendPath = path.join(__dirname, '..', 'QiLifeCore-BackendAPI') +    const isWin = process.platform === 'win32' +    const venvPython = isWin +      ? path.join(backendPath, 'venv', 'Scripts', 'python.exe') +      : path.join(backendPath, 'venv', 'bin', 'python') + +    // Prefer venv python if it exists, otherwise fall back to system python +    const pythonCmd = require('fs').existsSync(venvPython) +      ? venvPython +      : (isWin ? 'python' : 'python3') + +    const uvicornArgs = [ +      '-m', 'uvicorn', 'main:app', +      '--host', '127.0.0.1', +      '--port', '7130', +      ...(isDev ? ['--reload'] : []) +    ] + +    console.log('Launching backend:', pythonCmd, uvicornArgs.join(' ')) +    const child = spawn(pythonCmd, uvicornArgs, { cwd: backendPath, shell: false }) + +    child.stdout.on('data', d => console.log('[backend]', d.toString().trim())) +    child.stderr.on('data', d => console.error('[backend]', d.toString().trim())) +    child.on('close', code => console.log('Backend exited with code', code)) + +    return true +  })  })   app.on('window-all-closed', () => {    if (process.platform !== 'darwin') app.quit()  })``

## 5) Dev workflow that doesn’t make you cry

- Install deps:
    
    `npm install`
    
- Start vite + electron together:
    
    `npm run electron-dev`
    
- Click “Connect” in the UI. It will:
    
    1. Try `/health`
        
    2. If down, call the bridge to launch backend
        
    3. Poll `/health` for up to ~15s
        
    4. Load `/api/apps` and render
        

If you don’t have `/health` in the FastAPI backend yet, add the world’s most boring endpoint:

`# in QiLifeCore-BackendAPI/main.py from fastapi import FastAPI  app = FastAPI()  @app.get("/health") def health():     return {"ok": True}  @app.get("/api/apps") def apps():     # TODO: wire to your real mini-app registry     return ["FileFlow Duplicate Cleaner", "Cockpit Test App"]`

## 6) Optional polish so it feels alive

- `Header.jsx` connect button is a bit confused: if you’re connected, show Disconnect, but don’t route that through the same `onConnect`. You already handle this in `App.jsx`, so it’s fine. Consider disabling while polling so humans don’t click like caffeinated woodpeckers.
    
- `Dashboard.jsx` metrics are faked. Later, read real system stats from backend via a `/metrics` endpoint. For now, keep the vibe.
    

# TL;DR build order

1. Move files into `/src` as above
    
2. Patch `ConnectionManager.jsx`, `App.jsx`, `main.js` exactly as shown
    
3. Ensure backend has `/health` and `/api/apps`
    
4. `npm run electron-dev`
    
5. Click Connect. It should launch the backend and populate apps, like a responsible adult app would.
    

# What you’ll get after this pass

- Connect button that actually starts the backend and waits for it to be ready
    
- No forbidden `ipcRenderer` shenanigans in the Renderer
    
- Vite and Tailwind no longer blindfolded
    
- A clean path to packaging with `npm run dist`
    

If you want me to also wire the live logs (`LogViewer.jsx`) against a FastAPI `websocket` endpoint, that’s the next chunk: add `/ws/{log}` in the backend using `WebSocket` and stream `uvicorn` or per‑mini‑app logs. For today, let’s make the ignition key turn the engine instead of the wipers.

Here you go—clean, receipt-ready, Obsidian-friendly. Two files: **Dev Docs** and **SOP**. Paste straight into your vault.

---

# `DEV_DOCS_qially-support.md`

````md
---
title: "QiAlly Support KB — Dev Docs"
project: "access.qially.com/support"
owner: "QiAlly (Q)"
status: "active"
stack: ["Astro", "Starlight", "Cloudflare Pages/Workers", "Markdown/MDX"]
tags: ["docs", "kb", "astro", "starlight", "cloudflare", "elevenlabs", "zoho-bookings"]
updated: "2025-09-13"
---

# QiAlly Support KB — Developer Documentation

## 0) Purpose
A lightweight, public-facing knowledge base at **https://access.qially.com/support** with search, ToC, clean sidebar, optional ElevenLabs voice bubble, and booking button/embed.

---

## 1) Architecture Overview
- **Framework**: Astro + Starlight (static site generator; MD/MDX content, built-in Pagefind search).
- **Hosting**: Cloudflare Pages **or** Worker Assets. We mount under **`/support`** using Astro `base: '/support'`.
- **Path Ownership**:  
  - If the rest of `access.qially.com` is separate, a **Worker** routes `access.qially.com/support*` to this build.  
  - If this repo *is* the access site, just add the `/support` docs app inside and keep `base: '/support'`.

---

## 2) Local Dev

### Prereqs
- Node 20+  
- pnpm or npm  
- Cloudflare Wrangler (`npm i -D wrangler`) if using Worker Assets

### Commands
```bash
# Scaffold (first time)
npm create astro@latest -- --template starlight
# Dev
npm i
npm run dev
# Build (respecting base=/support)
npm run build
# Serve via Worker (if using Worker Assets)
npx wrangler deploy
````

---

## 3) Config

### `astro.config.mjs` (key bits)

```ts
import { defineConfig, envField } from 'astro/config';
import starlight from '@astrojs/starlight';

export default defineConfig({
  site: 'https://access.qially.com',
  base: '/support',
  integrations: [
    starlight({
      title: 'QiAlly — Support',
      description: 'How we work, expectations, billing, boundaries, and help.',
      lastUpdated: true,
      tableOfContents: { minHeadingLevel: 2, maxHeadingLevel: 3 },
      sidebar: [
        { label: 'Start', items: ['index'] },
        { label: 'Working Together', items: [
          'how-we-work', 'communication', 'agreements-expectations', 'revisions-and-change-requests'
        ]},
        { label: 'Ops & Safety', items: [
          'billing-and-payments', 'security-and-access', 'support-hours'
        ]},
        { label: 'Get Help', items: ['book-time'] }
      ],
      head: [
        { tag: 'script', attrs: {
          src: 'https://unpkg.com/@elevenlabs/convai-widget-embed',
          async: true, type: 'text/javascript'
        }}
      ]
    })
  ],
  env: {
    schema: {
      PUBLIC_ELEVENLABS_AGENT_ID: envField.string({ context: 'client', access: 'public', optional: true }),
      PUBLIC_BOOKING_URL: envField.string({ context: 'client', access: 'public', optional: true })
    }
  }
});
```

### Env

Create `.env` or Pages env vars:

```
PUBLIC_BOOKING_URL=https://bookings.zoho.com/your-page
PUBLIC_ELEVENLABS_AGENT_ID=XXXXXXXX
```

> Only **PUBLIC_*** envs appear client-side. Do not store secrets here.

---

## 4) Content Structure

```
src/
  content/
    docs/
      index.md
      how-we-work.md
      communication.md
      agreements-expectations.md
      revisions-and-change-requests.md
      billing-and-payments.md
      security-and-access.md
      support-hours.md
      book-time.mdx
  components/
    BookingEmbed.astro
    ConvaiWidget.astro (optional)
```

### Sample Content Frontmatter

```md
---
title: How I Work
description: Process, deliverables, and collaboration rhythm.
updated: 2025-09-13
---
```

### Booking Embed

`src/components/BookingEmbed.astro`

```astro
---
const url = import.meta.env.PUBLIC_BOOKING_URL ?? 'https://bookings.zoho.com/your-page';
---
<div style="width:100%;height:min(1200px,100vh);">
  <iframe src={url} style="width:100%;height:100%;border:0;" loading="lazy" />
</div>
```

`src/content/docs/book-time.mdx`

```mdx
---
title: Book Time
description: Meet with Q for direct help.
updated: 2025-09-13
---

<a class="sl-button" href={import.meta.env.PUBLIC_BOOKING_URL} target="_blank" rel="noopener">
  Open Booking Page
</a>

<details>
  <summary>Prefer inline booking?</summary>
  <BookingEmbed />
</details>

export const components = {
  BookingEmbed: (await import('../../components/BookingEmbed.astro')).default
};
```

### ElevenLabs Bubble (optional)

`src/components/ConvaiWidget.astro`

```astro
---
const agentId = import.meta.env.PUBLIC_ELEVENLABS_AGENT_ID;
---
{agentId && <elevenlabs-convai agent-id={agentId}></elevenlabs-convai>}
```

Mount it in a page or layout when ready.

---

## 5) Deployment Options

### A) Cloudflare Pages (simple)

- Build command: `npm run build`
    
- Output dir: `dist`
    
- Custom domain: `access.qially.com`
    
- Because `base='/support'`, the docs live under `/support` correctly.
    

### B) Worker Assets (subpath isolation)

`wrangler.toml`

```toml
name = "qially-support"
main = "src/worker.ts"
compatibility_date = "2025-09-13"

routes = [
  { pattern = "access.qially.com/support*", zone_name = "qially.com" }
]

[assets]
directory = "./dist"
not_found_handling = "single-page-application"
```

`src/worker.ts`

```ts
export default {
  async fetch(request, env) {
    return env.ASSETS.fetch(request);
  },
} as ExportedHandler;
```

---

## 6) Theming & UX

- Starlight handles dark mode and ToC out of the box.
    
- Keep headings H2/H3 for ToC clarity.
    
- Add small “Last updated” badge via frontmatter.
    
- Optional JSON-LD `FAQPage` if you add an FAQ doc.
    

---

## 7) QA Checklist

- `/support` loads on hard refresh (no 404).
    
- Search finds words in body titles and content.
    
- Booking link opens; embed shows on `/book-time`.
    
- If `PUBLIC_ELEVENLABS_AGENT_ID` present, widget appears and loads once.
    
- Lighthouse a11y ≥ 95.
    

---

## 8) Maintenance

- Content authors edit `src/content/docs/*`.
    
- PR requires preview build passing, markdown lint clean, and link check.
    
- Version bump in `CHANGELOG.md` on user-visible content changes.
    

---

````

---

# `SOP_qially-support.md`
```md
---
title: "QiAlly Support KB — SOP"
project: "access.qially.com/support"
owner: "QiAlly (Q)"
status: "active"
tags: ["sop", "ops", "docs", "kb", "workflow", "compliance"]
updated: "2025-09-13"
---

# Standard Operating Procedure — QiAlly Support KB

## 1) Scope
Covers content changes, releases, rollbacks, and routine hygiene for the public Support KB at `/support`.

---

## 2) Roles
- **Owner (Q):** approves policy language, signs off on releases.
- **Editor:** writes/updates docs, follows content checklist.
- **Maintainer:** runs builds, deploys, and handles incidents.

---

## 3) Branching & Releases
- `main`: production (immutable except via PR).
- `feat/<topic>`: content/features.
- **Release cadence:** as needed; prefer small, atomic changes.
- **PR requirements:**
  - Checklist completed (below).
  - Preview build green.
  - One reviewer sign-off (Owner or Maintainer).

---

## 4) Content Update Workflow
1. **Draft** in `feat/<topic>`: edit or add `src/content/docs/*.md(x)`.
2. **Lint & Links**:
   - Headings logical (H2/H3).
   - Short descriptions present.
   - Run link check (internal + external).
3. **Tone & Clarity**:
   - Plain language, no legalese unless needed.
   - Actionable bullets; “what to do,” not just “what is.”
4. **Metadata**:
   - Update frontmatter `updated: YYYY-MM-DD`.
   - Keep titles ≤ 60 chars, descriptions ≤ 160 chars.
5. **Preview**:
   - `npm run dev` locally, spot-check ToC, search, booking, and widget (if enabled).
6. **PR** → review → **merge**.
7. **Deploy**:
   - Pages: merge triggers build to `dist`.
   - Worker Assets: `npm run build && npx wrangler deploy`.
8. **Post-Deploy** smoke test:
   - `/support`, `/support/how-we-work`, `/support/book-time`.
   - Search returns recent changes.
   - Hard refresh works (SPA fallback ok).

---

## 5) Incident Response
- **Severity S1 (Critical):** Broken page load, widespread 404s, booking down.
  - Action: Rollback to last known good build.
    - Pages: redeploy previous successful build in dashboard.
    - Worker: `wrangler versions list` (if using), then redeploy prior bundle; or `git revert` and redeploy.
  - Notify stakeholders; note incident in `INCIDENTS.md`.
- **Severity S2 (Major):** Widget or search degraded, content error in legal/billing page.
  - Action: hotfix branch → targeted change → fast deploy.
- **Severity S3 (Minor):** Typos, small layout issues.
  - Action: batch into next routine release.

---

## 6) Governance — Policies & Sensitive Sections
- **Agreements & Expectations**, **Billing**, **Security** = **Owner approval required** before publish.
- Use versioned diffs in PR description. Keep **`CHANGELOG.md`** updated.

---

## 7) Accessibility & QA Checklist (run every PR)
- Headings sequential; ToC shows H2/H3 only.
- Alt text for any images (rare in this KB).
- Links: descriptive, not “click here”.
- Contrast and focus visible (Starlight default OK).
- Keyboard nav reaches booking button and any expandable content.

---

## 8) SEO Hygiene
- Frontmatter description present (≤160 chars).
- Unique titles per page.
- If an FAQ doc exists, consider a simple JSON-LD `FAQPage`.
- Canonical is the page URL under `/support`.

---

## 9) Integrations

### Booking
- **Env:** `PUBLIC_BOOKING_URL` must be a public, embeddable URL.
- Test both: button (new tab) and embed (loads in < 3s, responsive).

### ElevenLabs (optional)
- **Env:** `PUBLIC_ELEVENLABS_AGENT_ID` must be set for bubble to render.
- Domain allowlist must include `access.qially.com`.
- If issues: comment out `ConvaiWidget` include; keep script for later.

---

## 10) Backups & Export
- The repo is the source of truth.  
- Weekly: tag `content-YYYY.MM.DD` after notable additions.
- Quarterly: export static HTML (`dist/`) and archive to S3/Drive.

---

## 11) Deletion Safety (AI/Editor Guardrails)
- Never hard-delete files.
- If removal needed, **move** to `.trash/` preserving path.
- Note deletions in PR description and request explicit approval.

---

## 12) Change Log Format (`CHANGELOG.md`)
````

## 2025-09-13

- Added: initial KB scaffold; pages (How I Work, Communication, Agreements, Revisions, Billing, Security, Hours, Book Time).
    
- Config: base=/support; Pagefind search default.
    
- Deploy: Worker Assets route access.qially.com/support*.
    

```

---

## 13) Cursor Kickoff Prompt (for repeatability)
```

Role: Implement and maintain the QiAlly Support KB at access.qially.com/support using Astro + Starlight.  
Objectives:

- Configure astro.config.mjs with site=[https://access.qially.com](https://access.qially.com/) and base=/support.
    
- Create the docs listed in Dev Docs.
    
- Implement BookingEmbed.astro and optional ConvaiWidget.astro.
    
- Ensure Pagefind search, ToC, dark mode, and SPA fallback work on subpath.
    
- Respect Deletion Safety: never delete; move to .trash/ preserving paths and report moves.
    
- Produce a PR with checklist, link check pass, and a CHANGELOG entry.
    

Deliverables:

- Working build in dist/; deploy via Pages or Worker Assets.
    
- README updates and Dev Docs refresh if paths/config change.
    

```

---

## 14) Review Cadence
- Monthly: review “Agreements & Expectations,” “Billing,” and “Security” for drift.
- Quarterly: run Lighthouse and accessibility review; track scores.

---

## 15) Exit Criteria
- Content complete and accurate.
- Search returns expected results.
- Booking flow (button and embed) verified.
- Optional voice widget verified or safely disabled.
```

—

Need me to prefill those docs with your exact policy language and booking URL next? I’ll wire it clean and keep your brand voice tight.