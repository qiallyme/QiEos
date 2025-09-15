import { createClient } from "@supabase/supabase-js";

export interface Env {
  SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  JWT_ISSUER: string;
  JWT_SECRET: string;
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
        .select("org_id, id")
        .eq("supabase_user_id", user.id)
        .single();

      if (!contact) {
        return new Response(JSON.stringify({ error: "User not found" }), {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const orgId = contact.org_id;
      const contactId = contact.id;

      // Routes
      switch (true) {
        // GET /tasks - List tasks
        case path === "/tasks" && method === "GET":
          return await getTasks(supabase, orgId, url.searchParams);

        // POST /tasks - Create new task
        case path === "/tasks" && method === "POST":
          return await createTask(supabase, orgId, contactId, request);

        // GET /projects - List projects
        case path === "/projects" && method === "GET":
          return await getProjects(supabase, orgId);

        // POST /projects - Create project
        case path === "/projects" && method === "POST":
          return await createProject(supabase, orgId, request);

        default:
          return new Response(JSON.stringify({ error: "Not found" }), {
            status: 404,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
      }
    } catch (error) {
      console.error("Tasks API error:", error);
      return new Response(JSON.stringify({ error: "Internal server error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  },
};

// Helper functions
async function getTasks(
  supabase: any,
  orgId: string,
  searchParams: URLSearchParams
) {
  const projectId = searchParams.get("project_id");
  const status = searchParams.get("status");
  const limit = parseInt(searchParams.get("limit") || "50");

  let query = supabase
    .from("tasks")
    .select(
      `
      *,
      project:projects(name, color),
      assignee:contacts!tasks_assignee_id_fkey(first_name, last_name, email)
    `
    )
    .eq("org_id", orgId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (projectId) query = query.eq("project_id", projectId);
  if (status) query = query.eq("status", status);

  const { data, error } = await query;

  if (error) throw error;

  return new Response(JSON.stringify({ tasks: data || [] }), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function createTask(
  supabase: any,
  orgId: string,
  contactId: string,
  request: Request
) {
  const body = (await request.json()) as any;
  const { title, description, project_id, priority, due_date, labels } = body;

  if (!title) {
    return new Response(JSON.stringify({ error: "Title is required" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const { data, error } = await supabase
    .from("tasks")
    .insert({
      org_id: orgId,
      title,
      description: description || "",
      project_id: project_id || null,
      priority: priority || 3,
      due_date: due_date || null,
      labels: labels || [],
    })
    .select()
    .single();

  if (error) throw error;

  // Log activity
  await supabase.from("task_activity").insert({
    org_id: orgId,
    task_id: data.id,
    user_id: contactId,
    action: "created",
    details: { title, project_id },
  });

  return new Response(JSON.stringify({ task: data }), {
    status: 201,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function getProjects(supabase: any, orgId: string) {
  const { data, error } = await supabase
    .from("projects")
    .select(
      `
      *,
      task_count:tasks(count)
    `
    )
    .eq("org_id", orgId)
    .order("created_at", { ascending: false });

  if (error) throw error;

  return new Response(JSON.stringify({ projects: data || [] }), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function createProject(supabase: any, orgId: string, request: Request) {
  const body = (await request.json()) as any;
  const { name, description, type, color } = body;

  if (!name) {
    return new Response(JSON.stringify({ error: "Name is required" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const { data, error } = await supabase
    .from("projects")
    .insert({
      org_id: orgId,
      name,
      description: description || "",
      type: type || "personal",
      color: color || "#3498db",
    })
    .select()
    .single();

  if (error) throw error;

  return new Response(JSON.stringify({ project: data }), {
    status: 201,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
