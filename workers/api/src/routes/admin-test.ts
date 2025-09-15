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
        // GET /admin-test/kb - Get all KB documents (no auth required for testing)
        case path === "/admin-test/kb" && method === "GET":
          return await getAllKB(supabase);

        // GET /admin-test/orgs - Get all organizations (no auth required for testing)
        case path === "/admin-test/orgs" && method === "GET":
          return await getAllOrgs(supabase);

        // GET /admin-test/contacts - Get all contacts (no auth required for testing)
        case path === "/admin-test/contacts" && method === "GET":
          return await getAllContacts(supabase);

        default:
          return new Response(JSON.stringify({ error: "Not found" }), {
            status: 404,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
      }
    } catch (error) {
      console.error("Admin test API error:", error);
      return new Response(JSON.stringify({ error: "Internal server error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  },
};

// Get all KB documents (admin access)
async function getAllKB(supabase: any): Promise<Response> {
  const { data: kbDocs, error: kbError } = await supabase
    .from("kb_docs")
    .select(`
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
    `)
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

// Get all organizations (admin access)
async function getAllOrgs(supabase: any): Promise<Response> {
  const { data: orgs, error: orgsError } = await supabase
    .from("orgs")
    .select(`
      id,
      slug,
      name,
      created_at,
      updated_at,
      companies (
        id,
        name,
        slug
      )
    `)
    .order("created_at", { ascending: false });

  if (orgsError) {
    console.error("Orgs fetch error:", orgsError);
    return new Response(JSON.stringify({ error: "Failed to fetch organizations" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify({ orgs: orgs || [] }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

// Get all contacts (admin access)
async function getAllContacts(supabase: any): Promise<Response> {
  const { data: contacts, error: contactsError } = await supabase
    .from("contacts")
    .select(`
      id,
      email,
      full_name,
      role,
      created_at,
      updated_at,
      orgs (
        name,
        slug
      ),
      companies (
        name,
        slug
      )
    `)
    .order("created_at", { ascending: false });

  if (contactsError) {
    console.error("Contacts fetch error:", contactsError);
    return new Response(JSON.stringify({ error: "Failed to fetch contacts" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify({ contacts: contacts || [] }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
