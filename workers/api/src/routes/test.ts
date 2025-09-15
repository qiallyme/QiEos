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
        // GET /test/kb - Get all KB documents (no auth required for testing)
        case path === "/test/kb" && method === "GET":
          const { data: kbDocs, error: kbError } = await supabase
            .from("kb_docs")
            .select("*")
            .order("updated_at", { ascending: false });

          if (kbError) {
            return new Response(JSON.stringify({ error: kbError.message }), {
              status: 500,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
          }

          return new Response(JSON.stringify({ docs: kbDocs || [] }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });

        // GET /test/orgs - Get all organizations (no auth required for testing)
        case path === "/test/orgs" && method === "GET":
          const { data: orgs, error: orgsError } = await supabase
            .from("orgs")
            .select("*")
            .order("created_at", { ascending: false });

          if (orgsError) {
            return new Response(JSON.stringify({ error: orgsError.message }), {
              status: 500,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
          }

          return new Response(JSON.stringify({ orgs: orgs || [] }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });

        // GET /test/contacts - Get all contacts (no auth required for testing)
        case path === "/test/contacts" && method === "GET":
          const { data: contacts, error: contactsError } = await supabase
            .from("contacts")
            .select("*")
            .order("created_at", { ascending: false });

          if (contactsError) {
            return new Response(JSON.stringify({ error: contactsError.message }), {
              status: 500,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
          }

          return new Response(JSON.stringify({ contacts: contacts || [] }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });

        default:
          return new Response(JSON.stringify({ error: "Not found" }), {
            status: 404,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
      }
    } catch (error) {
      console.error("Test API error:", error);
      return new Response(JSON.stringify({ error: "Internal server error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  },
};
