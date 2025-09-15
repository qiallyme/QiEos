import { createClient } from "@supabase/supabase-js";

export interface Env {
  SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
}

// CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;

    // Handle preflight requests
    if (method === "OPTIONS") {
      return new Response(null, { status: 200, headers: corsHeaders });
    }

    try {
      const supabase = createClient(
        env.SUPABASE_URL,
        env.SUPABASE_SERVICE_ROLE_KEY
      );

      // Routes
      switch (true) {
        // GET /api/apps - List available mini-apps
        case path === "/api/apps" && method === "GET":
          return await getApps(supabase, request);

        default:
          return new Response(JSON.stringify({ error: "Not found" }), {
            status: 404,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
      }
    } catch (error) {
      console.error("Apps API error:", error);
      return new Response(JSON.stringify({ error: "Internal server error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  },
};

// Get available mini-apps
async function getApps(supabase: any, request: Request): Promise<Response> {
  // For now, return a static list of available apps
  // In the future, this could be dynamic based on user permissions or feature flags
  const apps = [
    {
      id: "duplicate-cleaner",
      name: "Duplicate File Cleaner",
      description: "Find and remove duplicate files from your system",
      icon: "🗂️",
      status: "available",
    },
    {
      id: "file-flow",
      name: "File Flow Manager",
      description: "Organize and manage your file workflows",
      icon: "📁",
      status: "available",
    },
    {
      id: "quick-receipt",
      name: "Quick Receipt Scanner",
      description: "Scan and process receipts quickly",
      icon: "🧾",
      status: "available",
    },
    {
      id: "task-manager",
      name: "Task Manager",
      description: "Manage your tasks and projects",
      icon: "✅",
      status: "available",
    },
  ];

  return new Response(JSON.stringify(apps), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
