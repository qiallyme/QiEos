import { createClient } from "@supabase/supabase-js";
import tasksRouter from "./routes/tasks";
import aiRouter from "./routes/ai-quick-add";
import healthRouter from "./routes/health";
import billingRouter from "./routes/billing";
import crmRouter from "./routes/crm";
import adminRouter from "./routes/admin";
import clientRouter from "./routes/client";
import authRouter from "./routes/auth";

export interface Env {
  SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  JWT_ISSUER: string;
  JWT_SECRET: string;
  OPENAI_API_KEY: string;
  STRIPE_SECRET_KEY: string;
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

      if (path.startsWith("/billing")) {
        return await billingRouter.fetch(request, env);
      }

      if (path.startsWith("/crm")) {
        return await crmRouter.fetch(request, env);
      }

      if (path.startsWith("/admin")) {
        return await adminRouter.fetch(request, env);
      }

      if (path.startsWith("/client")) {
        return await clientRouter.fetch(request, env);
      }

      if (path === "/health") {
        return await healthRouter.fetch(request, env);
      }

      if (path.startsWith("/auth")) {
        return await authRouter.fetch(request, env);
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
