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
        // GET /kb/public - Public knowledge base (no auth required)
        case path === "/kb/public" && method === "GET":
          return await getPublicKB();

        // GET /kb/private - Private knowledge base (requires auth)
        case path === "/kb/private" && method === "GET":
          return await getPrivateKB(supabase, request);

        default:
          return new Response(JSON.stringify({ error: "Not found" }), {
            status: 404,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
      }
    } catch (error) {
      console.error("KB API error:", error);
      return new Response(JSON.stringify({ error: "Internal server error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  },
};

// Get public KB (static files or public docs)
async function getPublicKB(): Promise<Response> {
  // For now, return a simple public KB structure
  // In production, this would read from /apps/web/public/kb/ or public kb_docs
  const publicKB = {
    docs: [
      {
        id: "getting-started",
        title: "Getting Started",
        content: "Welcome to QiEOS! This is a public knowledge base document.",
        slug: "getting-started",
        updated_at: new Date().toISOString(),
      },
    ],
  };

  return new Response(JSON.stringify(publicKB), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

// Get private KB (requires authentication)
async function getPrivateKB(
  supabase: any,
  request: Request
): Promise<Response> {
  // Get auth token from header
  const authHeader = request.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return new Response(
      JSON.stringify({ error: "Missing or invalid authorization" }),
      {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }

  const token = authHeader.substring(7);

  // Check if this is a service role key (admin access)
  if (token.includes("service_role")) {
    // Service role can access all KB documents - use service role client
    const serviceSupabase = createClient(
      process.env.SUPABASE_URL || "https://vwqkhjnkummwtvfxgqml.supabase.co",
      token
    );

    const { data: kbDocs, error: kbError } = await serviceSupabase
      .from("kb_docs")
      .select(
        `
        id,
        slug,
        title,
        content,
        tags,
        audiences,
        created_at,
        updated_at,
        kb_collections (
          name,
          path
        )
      `
      )
      .order("updated_at", { ascending: false });

    if (kbError) {
      console.error("KB fetch error:", kbError);
      return new Response(JSON.stringify({ error: "Failed to fetch KB" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ docs: kbDocs || [] }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Regular user authentication
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser(token);

  if (authError || !user) {
    return new Response(JSON.stringify({ error: "Invalid token" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Get user's org_id from contacts table
  const { data: contact } = await supabase
    .from("contacts")
    .select("org_id")
    .eq("supabase_user_id", user.id)
    .single();

  if (!contact) {
    return new Response(JSON.stringify({ error: "User not found" }), {
      status: 404,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Fetch KB documents for the user's organization
  const { data: kbDocs, error: kbError } = await supabase
    .from("kb_docs")
    .select(
      `
      id,
      slug,
      title,
      content,
      tags,
      audiences,
      created_at,
      updated_at,
      kb_collections (
        name,
        path
      )
    `
    )
    .eq("org_id", contact.org_id)
    .order("updated_at", { ascending: false });

  if (kbError) {
    console.error("KB fetch error:", kbError);
    return new Response(JSON.stringify({ error: "Failed to fetch KB" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify({ docs: kbDocs || [] }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
