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
        // GET /orgs - List organizations (admin only)
        case path === "/orgs" && method === "GET":
          return await getOrgs(supabase, request);

        // POST /orgs - Create new organization (admin only)
        case path === "/orgs" && method === "POST":
          return await createOrg(supabase, request);

        // GET /orgs/:id - Get specific organization
        case path.match(/^\/orgs\/[^\/]+$/) && method === "GET":
          const orgId = path.split("/")[2];
          return await getOrg(supabase, orgId, request);

        default:
          return new Response(JSON.stringify({ error: "Not found" }), {
            status: 404,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
      }
    } catch (error) {
      console.error("Orgs API error:", error);
      return new Response(JSON.stringify({ error: "Internal server error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  },
};

// Get all organizations (admin only)
async function getOrgs(supabase: any, request: Request): Promise<Response> {
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

  // Check if user is admin
  const { data: contact } = await supabase
    .from("contacts")
    .select("role")
    .eq("supabase_user_id", user.id)
    .single();

  if (!contact || contact.role !== "admin") {
    return new Response(JSON.stringify({ error: "Admin access required" }), {
      status: 403,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Fetch all organizations
  const { data: orgs, error: orgsError } = await supabase
    .from("orgs")
    .select(
      `
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
    `
    )
    .order("created_at", { ascending: false });

  if (orgsError) {
    console.error("Orgs fetch error:", orgsError);
    return new Response(
      JSON.stringify({ error: "Failed to fetch organizations" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }

  return new Response(JSON.stringify({ orgs: orgs || [] }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

// Create new organization (admin only)
async function createOrg(supabase: any, request: Request): Promise<Response> {
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

  // Check if user is admin
  const { data: contact } = await supabase
    .from("contacts")
    .select("role")
    .eq("supabase_user_id", user.id)
    .single();

  if (!contact || contact.role !== "admin") {
    return new Response(JSON.stringify({ error: "Admin access required" }), {
      status: 403,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Parse request body
  const body = await request.json();
  const { name, slug } = body as { name: string; slug: string };

  if (!name || !slug) {
    return new Response(
      JSON.stringify({ error: "Name and slug are required" }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }

  // Create organization
  const { data: org, error: orgError } = await supabase
    .from("orgs")
    .insert({ name, slug })
    .select()
    .single();

  if (orgError) {
    console.error("Org creation error:", orgError);
    return new Response(
      JSON.stringify({ error: "Failed to create organization" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }

  return new Response(JSON.stringify({ org }), {
    status: 201,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

// Get specific organization
async function getOrg(
  supabase: any,
  orgId: string,
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

  // Check if user has access to this organization
  const { data: contact } = await supabase
    .from("contacts")
    .select("org_id, role")
    .eq("supabase_user_id", user.id)
    .single();

  if (!contact) {
    return new Response(JSON.stringify({ error: "User not found" }), {
      status: 404,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Admin can access any org, others only their own
  if (contact.role !== "admin" && contact.org_id !== orgId) {
    return new Response(JSON.stringify({ error: "Access denied" }), {
      status: 403,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Fetch organization
  const { data: org, error: orgError } = await supabase
    .from("orgs")
    .select(
      `
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
    `
    )
    .eq("id", orgId)
    .single();

  if (orgError) {
    console.error("Org fetch error:", orgError);
    return new Response(JSON.stringify({ error: "Organization not found" }), {
      status: 404,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify({ org }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
