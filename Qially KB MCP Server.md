
Model Context Protocol (MCP) server for QiAlly that crawls public KB pages and returns clean context to agents.

## What it does
- Exposes a tool `crawl_kb(url, scope, max_pages, include_paths, exclude_paths, max_chars_per_page)`
- Fetches seed page, follows same-origin links (bounded), strips HTML to text
- Returns `{ summary, sources, chunks[] }`
- Caches results in Cloudflare KV for 30 minutes

## Endpoints
- `GET /health` → `200 ok`
- `POST /mcp/tools/list` → JSON tool schema
- `POST /mcp/tools/call` → run a tool by name and arguments

## Quick start
```bash
npm i
npm i -D wrangler
npx wrangler kv namespace create KB_CACHE
npx wrangler secret put MCP_BEARER   # paste long random token
npx wrangler deploy
