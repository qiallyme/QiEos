# EmpowerQNow713 — deploy quick guide

## One-time
python -m venv .venv
# Windows: . .venv/Scripts/activate   | macOS/Linux: source .venv/bin/activate
python scripts/qauto.py

## Push
git remote add origin <YOUR-REPO-URL>
git branch -M main
git push -u origin main

## Cloudflare Pages
- Create project -> Connect repo
- Build command: (leave blank)
- Output directory: /
- Add Custom Domain: empowerqnow.com (and www if desired)

## TTS (optional)
- Install wrangler: npm i -g wrangler
- Set secret: wrangler secret put ELEVEN_API_KEY
- Deploy worker: wrangler deploy workers/tts-worker.js --name empowerq-tts
- Set TTS_ENDPOINT in static/index.html to your worker URL (e.g., https://empowerq-tts.<your-subdomain>.workers.dev/speak)
