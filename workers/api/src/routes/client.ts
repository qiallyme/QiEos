/**
 * Client Portal API Endpoints
 * Handles client-specific operations and data access
 */

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

      // Get user's org_id from contacts table
      const { data: contact } = await supabase
        .from("contacts")
        .select("org_id, company_id, role")
        .eq("supabase_user_id", user.id)
        .single();

      if (!contact) {
        return new Response(JSON.stringify({ error: "User not found" }), {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const orgId = contact.org_id;
      const companyId = contact.company_id;
      const userRole = contact.role;

      // Routes
      switch (true) {
        // GET /client/dashboard - Get client dashboard data
        case path === "/client/dashboard" && method === "GET":
          return await getClientDashboard(supabase, orgId, companyId, userRole);

        // GET /client/tasks - Get client tasks
        case path === "/client/tasks" && method === "GET":
          return await getClientTasks(
            supabase,
            orgId,
            companyId,
            url.searchParams
          );

        // POST /client/tasks - Create new task
        case path === "/client/tasks" && method === "POST":
          return await createClientTask(
            supabase,
            orgId,
            companyId,
            user.id,
            request
          );

        // GET /client/projects - Get client projects
        case path === "/client/projects" && method === "GET":
          return await getClientProjects(supabase, orgId, companyId);

        // GET /client/files - Get client files
        case path === "/client/files" && method === "GET":
          return await getClientFiles(supabase, orgId, companyId);

        // GET /client/kb - Get client knowledge base
        case path === "/client/kb" && method === "GET":
          return await getClientKB(supabase, orgId, companyId);

        // GET /client/profile - Get client profile
        case path === "/client/profile" && method === "GET":
          return await getClientProfile(supabase, orgId, user.id);

        // PUT /client/profile - Update client profile
        case path === "/client/profile" && method === "PUT":
          return await updateClientProfile(supabase, orgId, user.id, request);

        default:
          return new Response(JSON.stringify({ error: "Not found" }), {
            status: 404,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
      }
    } catch (error) {
      console.error("Client API error:", error);
      return new Response(JSON.stringify({ error: "Internal server error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  },
};

// Helper functions
async function getClientDashboard(
  supabase: any,
  orgId: string,
  companyId: string,
  userRole: string
) {
  try {
    // Get task counts
    const { count: totalTasks } = await supabase
      .from("tasks")
      .select("*", { count: "exact", head: true })
      .eq("org_id", orgId)
      .eq("company_id", companyId);

    const { count: pendingTasks } = await supabase
      .from("tasks")
      .select("*", { count: "exact", head: true })
      .eq("org_id", orgId)
      .eq("company_id", companyId)
      .in("status", ["pending", "in_progress"]);

    // Get project counts
    const { count: totalProjects } = await supabase
      .from("projects")
      .select("*", { count: "exact", head: true })
      .eq("org_id", orgId)
      .eq("company_id", companyId);

    // Get recent tasks
    const { data: recentTasks } = await supabase
      .from("tasks")
      .select(
        `
        *,
        projects(name),
        contacts(first_name, last_name)
      `
      )
      .eq("org_id", orgId)
      .eq("company_id", companyId)
      .order("created_at", { ascending: false })
      .limit(5);

    const dashboard = {
      stats: {
        totalTasks: totalTasks || 0,
        pendingTasks: pendingTasks || 0,
        totalProjects: totalProjects || 0,
      },
      recentTasks: recentTasks || [],
      userRole,
    };

    return new Response(JSON.stringify(dashboard), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching client dashboard:", error);
    throw error;
  }
}

async function getClientTasks(
  supabase: any,
  orgId: string,
  companyId: string,
  searchParams: URLSearchParams
) {
  try {
    const { data, error } = await supabase
      .from("tasks")
      .select(
        `
        *,
        projects(name, slug),
        contacts(first_name, last_name)
      `
      )
      .eq("org_id", orgId)
      .eq("company_id", companyId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return new Response(JSON.stringify({ tasks: data }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching client tasks:", error);
    throw error;
  }
}

async function createClientTask(
  supabase: any,
  orgId: string,
  companyId: string,
  userId: string,
  request: Request
) {
  try {
    const body = await request.json();

    const { data, error } = await supabase
      .from("tasks")
      .insert({
        org_id: orgId,
        company_id: companyId,
        project_id: body.project_id,
        title: body.title,
        description: body.description,
        status: "pending",
        priority: body.priority || "medium",
        assigned_to: body.assigned_to,
        created_by: userId,
      })
      .select()
      .single();

    if (error) throw error;

    return new Response(JSON.stringify({ task: data }), {
      status: 201,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error creating client task:", error);
    throw error;
  }
}

async function getClientProjects(
  supabase: any,
  orgId: string,
  companyId: string
) {
  try {
    const { data, error } = await supabase
      .from("projects")
      .select(
        `
        *,
        tasks(count)
      `
      )
      .eq("org_id", orgId)
      .eq("company_id", companyId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return new Response(JSON.stringify({ projects: data }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching client projects:", error);
    throw error;
  }
}

async function getClientFiles(supabase: any, orgId: string, companyId: string) {
  try {
    const { data, error } = await supabase
      .from("drops_meta")
      .select("*")
      .eq("org_id", orgId)
      .eq("company_id", companyId)
      .eq("is_public", true)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return new Response(JSON.stringify({ files: data }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching client files:", error);
    throw error;
  }
}

async function getClientKB(supabase: any, orgId: string, companyId: string) {
  try {
    const { data, error } = await supabase
      .from("kb_docs")
      .select(
        `
        *,
        kb_collections(name, slug)
      `
      )
      .eq("org_id", orgId)
      .eq("company_id", companyId)
      .eq("is_public", true)
      .eq("is_published", true)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return new Response(JSON.stringify({ docs: data }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching client KB:", error);
    throw error;
  }
}

async function getClientProfile(supabase: any, orgId: string, userId: string) {
  try {
    const { data, error } = await supabase
      .from("contacts")
      .select(
        `
        *,
        companies(name, slug),
        orgs(name, slug)
      `
      )
      .eq("org_id", orgId)
      .eq("supabase_user_id", userId)
      .single();

    if (error) throw error;

    return new Response(JSON.stringify({ profile: data }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching client profile:", error);
    throw error;
  }
}

async function updateClientProfile(
  supabase: any,
  orgId: string,
  userId: string,
  request: Request
) {
  try {
    const body = await request.json();

    const { data, error } = await supabase
      .from("contacts")
      .update({
        first_name: body.first_name,
        last_name: body.last_name,
        phone: body.phone,
        settings: body.settings,
      })
      .eq("org_id", orgId)
      .eq("supabase_user_id", userId)
      .select()
      .single();

    if (error) throw error;

    return new Response(JSON.stringify({ profile: data }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error updating client profile:", error);
    throw error;
  }
}
