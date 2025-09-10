# API Keys Configuration Guide

## 🔐 **Where to Store API Keys**

### 1. **Environment Variables (Recommended)**
Store all API keys in environment variables:

**File: `.env.local`** (create this file, it's gitignored)
```bash
# Cursor Agent API Keys
CURSOR_AGENT_API_KEY=your_cursor_agent_key_here
CURSOR_BACKGROUND_AGENT_KEY=your_background_agent_key_here

# Other API Keys
OPENAI_API_KEY=your_openai_key_here
SUPABASE_URL=your_supabase_url_here
SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# Cloudflare
CLOUDFLARE_API_TOKEN=your_cloudflare_token_here
CLOUDFLARE_ACCOUNT_ID=your_account_id_here

# Stripe
STRIPE_SECRET_KEY=your_stripe_secret_key_here
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret_here
```

### 2. **Cursor Agent Configuration**
For Cursor-specific agent keys, you can also store them in:

**File: `.cursor/agents/config.json`** (create this file, it's gitignored)
```json
{
  "background_agent": {
    "api_key": "your_background_agent_key_here",
    "endpoint": "https://api.cursor.sh/agents"
  },
  "custom_agents": {
    "api_agent": "your_api_agent_key_here",
    "ui_agent": "your_ui_agent_key_here"
  }
}
```

### 3. **Worker Environment Variables**
For Cloudflare Workers, store secrets in:

**File: `workers/api/wrangler.toml`** (this file is protected by .cursorrules)
```toml
[vars]
ENVIRONMENT = "development"

[[kv_namespaces]]
binding = "CACHE"
id = "your_kv_namespace_id"

# Secrets are set via: wrangler secret put SECRET_NAME
# wrangler secret put OPENAI_API_KEY
# wrangler secret put SUPABASE_SERVICE_ROLE_KEY
```

## 🚫 **NEVER Store API Keys In:**
- ❌ Source code files
- ❌ Committed configuration files
- ❌ Public repositories
- ❌ Client-side code
- ❌ Documentation (except examples with placeholders)

## ✅ **Security Best Practices:**
1. **Use environment variables** for all API keys
2. **Create `.env.local`** for local development
3. **Use Cloudflare Workers secrets** for production
4. **Never commit** `.env.local` or `.env` files
5. **Use `.env.example`** as a template for other developers
6. **Rotate keys regularly**
7. **Use different keys** for development/staging/production

## 🔧 **Setup Instructions:**

1. **Copy the example file:**
   ```bash
   cp .env.example .env.local
   ```

2. **Fill in your actual API keys** in `.env.local`

3. **For Cloudflare Workers, set secrets:**
   ```bash
   cd workers/api
   wrangler secret put OPENAI_API_KEY
   wrangler secret put SUPABASE_SERVICE_ROLE_KEY
   ```

4. **For Cursor agents, configure in Cursor settings** or use the `.cursor/agents/config.json` file

## 📝 **Environment File Template:**
Use `.env.example` as a template - it's committed to git but contains no real secrets.
