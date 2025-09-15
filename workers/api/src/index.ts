import { createClient } from "@supabase/supabase-js";
import tasksRouter from "./routes/tasks";
import aiRouter from "./routes/ai-quick-add";

export interface Env {
  SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  JWT_ISSUER: string;
  JWT_SECRET: string;
}

export default {
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext
  ): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;

    // CORS headers
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    };

    // Handle preflight requests
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 200, headers: corsHeaders });
    }

    try {
      // Initialize Supabase client
      const supabase = createClient(
        env.SUPABASE_URL,
        env.SUPABASE_SERVICE_ROLE_KEY
      );

      // Route to appropriate handler
      if (path.startsWith("/tasks") || path.startsWith("/projects")) {
        return await tasksRouter.fetch(request, env);
      }

      if (path.startsWith("/ai")) {
        return await aiRouter.fetch(request, env);
      }

      // Route: POST /auth/session
      if (path === "/auth/session" && request.method === "POST") {
        const body = (await request.json()) as { token: string };
        const { token } = body;

        if (!token) {
          return new Response(
            JSON.stringify({ success: false, error: "Token required" }),
            {
              status: 400,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }

        // Verify the JWT token with Supabase
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser(token);

        if (authError || !user) {
          return new Response(
            JSON.stringify({ success: false, error: "Invalid token" }),
            {
              status: 401,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }

        // Get user profile and client slug with JOIN query
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select(
            `
            id,
            email,
            full_name,
            role,
            avatar_url,
            is_active,
            onboarding_complete,
            preferred_locale,
            timezone,
            metadata,
            sms_opt_in,
            email_opt_in,
            last_sign_in_at,
            mfa_enabled,
            tos_version,
            privacy_version,
            consent_at,
            created_at,
            updated_at,
            memberships!inner(
              client_id,
              role,
              clients!inner(
                id,
                name,
                status,
                slugs!inner(
                  slug
                )
              )
            )
          `
          )
          .eq("id", user.id)
          .single();

        if (profileError) {
          console.error("Profile fetch error:", profileError);
          return new Response(
            JSON.stringify({ success: false, error: "Profile not found" }),
            {
              status: 404,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }

        // Extract client slug from the nested data
        let clientSlug: string | undefined;
        if (profileData.memberships && profileData.memberships.length > 0) {
          const membership = profileData.memberships[0] as any;
          if (
            membership.clients &&
            Array.isArray(membership.clients.slugs) &&
            membership.clients.slugs.length > 0
          ) {
            clientSlug = membership.clients.slugs[0].slug;
          }
        }

        // Build claims object
        const claims = {
          user_id: user.id,
          email: profileData.email,
          role: profileData.role,
          org_id: profileData.memberships?.[0]?.client_id || null,
          company_ids:
            profileData.memberships?.map((m: any) => m.client_id) || [],
          department: profileData.role === "admin" ? "internal" : "external",
          features: {
            // Default features - you can customize this based on your needs
            crm: true,
            projects: true,
            tasks: true,
            messaging: true,
            kb: true,
            ai_rag: true,
            billing: true,
            lms: false,
            client_tools: true,
            voice_assistant: false,
            vision_tools: false,
            client_sites: true,
            public_drops: true,
          },
          client_slug: clientSlug,
        };

        return new Response(
          JSON.stringify({
            success: true,
            claims,
          }),
          {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      // Route: GET /health
      if (path === "/health" && request.method === "GET") {
        return new Response(
          JSON.stringify({
            status: "ok",
            timestamp: new Date().toISOString(),
          }),
          {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      // 404 for unmatched routes
      return new Response(JSON.stringify({ error: "Not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    } catch (error) {
      console.error("Worker error:", error);
      return new Response(
        JSON.stringify({
          error: "Internal server error",
          message: error instanceof Error ? error.message : "Unknown error",
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
  },
};
