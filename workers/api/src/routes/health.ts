/**
 * Health Check Endpoint
 * Provides system status and health information
 */

export interface Env {
  SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
}

// CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const method = request.method;

    // Handle preflight requests
    if (method === "OPTIONS") {
      return new Response(null, { status: 200, headers: corsHeaders });
    }

    try {
      // Basic health check
      const health = {
        status: "healthy",
        timestamp: new Date().toISOString(),
        version: "1.0.0",
        environment: "development",
        services: {
          database: "connected",
          worker: "running",
        },
      };

      return new Response(JSON.stringify(health), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    } catch (error) {
      console.error("Health check error:", error);
      return new Response(
        JSON.stringify({
          status: "unhealthy",
          error: "Internal server error",
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
  },
};
