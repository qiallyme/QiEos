/**
 * Admin API Endpoints
 * Handles admin dashboard stats and system management
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

      // Routes
      switch (true) {
        // GET /admin/stats - Get dashboard statistics
        case path === "/admin/stats" && method === "GET":
          return await getDashboardStats(supabase);

        // GET /admin/health - Get system health
        case path === "/admin/health" && method === "GET":
          return await getSystemHealth(supabase);

        // GET /admin/tenants - List all organizations
        case path === "/admin/tenants" && method === "GET":
          return await getTenants(supabase);

        // POST /admin/tenants - Create new organization
        case path === "/admin/tenants" && method === "POST":
          return await createTenant(supabase, request);

        // GET /admin/logs - Get system logs
        case path === "/admin/logs" && method === "GET":
          return await getSystemLogs(supabase, url.searchParams);

        default:
          return new Response(JSON.stringify({ error: "Not found" }), {
            status: 404,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
      }
    } catch (error) {
      console.error("Admin API error:", error);
      return new Response(JSON.stringify({ error: "Internal server error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  },
};

// Helper functions
async function getDashboardStats(supabase: any) {
  try {
    // Get total users (contacts)
    const { count: totalUsers } = await supabase
      .from("contacts")
      .select("*", { count: "exact", head: true });

    // Get active projects
    const { count: activeProjects } = await supabase
      .from("projects")
      .select("*", { count: "exact", head: true })
      .eq("status", "active");

    // Get pending tasks
    const { count: pendingTasks } = await supabase
      .from("tasks")
      .select("*", { count: "exact", head: true })
      .in("status", ["pending", "in_progress"]);

    // Get total organizations
    const { count: totalOrgs } = await supabase
      .from("orgs")
      .select("*", { count: "exact", head: true });

    // Get recent activity (last 24 hours)
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const { count: recentActivity } = await supabase
      .from("tasks")
      .select("*", { count: "exact", head: true })
      .gte("created_at", yesterday.toISOString());

    const stats = {
      totalUsers: totalUsers || 0,
      activeProjects: activeProjects || 0,
      pendingTasks: pendingTasks || 0,
      totalOrgs: totalOrgs || 0,
      recentActivity: recentActivity || 0,
      systemHealth: "online",
      timestamp: new Date().toISOString(),
    };

    return new Response(JSON.stringify(stats), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    throw error;
  }
}

async function getSystemHealth(supabase: any) {
  try {
    // Test database connection
    const { error: dbError } = await supabase
      .from("orgs")
      .select("count")
      .limit(1);

    const health = {
      status: dbError ? "unhealthy" : "healthy",
      database: dbError ? "disconnected" : "connected",
      timestamp: new Date().toISOString(),
      services: {
        database: dbError ? "error" : "ok",
        worker: "ok",
        api: "ok",
      },
      error: dbError?.message || null,
    };

    return new Response(JSON.stringify(health), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error checking system health:", error);
    throw error;
  }
}

async function getTenants(supabase: any) {
  try {
    const { data, error } = await supabase
      .from("orgs")
      .select(`
        *,
        companies(count),
        contacts(count)
      `)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return new Response(JSON.stringify({ tenants: data }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching tenants:", error);
    throw error;
  }
}

async function createTenant(supabase: any, request: Request) {
  try {
    const body = await request.json();

    const { data, error } = await supabase
      .from("orgs")
      .insert({
        name: (body as any).name,
        slug: (body as any).slug,
        settings: (body as any).settings || {},
      })
      .select()
      .single();

    if (error) throw error;

    return new Response(JSON.stringify({ tenant: data }), {
      status: 201,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error creating tenant:", error);
    throw error;
  }
}

async function getSystemLogs(supabase: any, searchParams: URLSearchParams) {
  try {
    // For now, return mock logs since we don't have a logs table yet
    const logs = [
      {
        id: "1",
        level: "info",
        message: "System started successfully",
        timestamp: new Date().toISOString(),
        source: "worker",
      },
      {
        id: "2",
        level: "info",
        message: "Database connection established",
        timestamp: new Date(Date.now() - 60000).toISOString(),
        source: "database",
      },
      {
        id: "3",
        level: "warning",
        message: "High memory usage detected",
        timestamp: new Date(Date.now() - 120000).toISOString(),
        source: "system",
      },
    ];

    return new Response(JSON.stringify({ logs }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching system logs:", error);
    throw error;
  }
}
