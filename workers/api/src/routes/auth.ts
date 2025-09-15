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

      // Route: POST /auth/session
      if (path === "/auth/session" && method === "POST") {
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

        // Get user profile from contacts table (not profiles)
        const { data: contact, error: contactError } = await supabase
          .from("contacts")
          .select(
            `
            id,
            email,
            first_name,
            last_name,
            phone,
            role,
            org_id,
            company_id,
            companies(
              id,
              name,
              slug,
              org_id
            ),
            orgs(
              id,
              name,
              slug
            )
          `
          )
          .eq("supabase_user_id", user.id)
          .single();

        if (contactError || !contact) {
          return new Response(
            JSON.stringify({ success: false, error: "User profile not found" }),
            {
              status: 404,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }

        // Get user's company IDs for access control
        const { data: userCompanies } = await supabase
          .from("contacts")
          .select("company_id")
          .eq("supabase_user_id", user.id)
          .not("company_id", "is", null);

        const companyIds = userCompanies?.map((c) => c.company_id) || [];

        // Get feature flags for the user's org and companies
        const { data: orgFeatures } = await supabase
          .from("org_features")
          .select("feature_key")
          .eq("org_id", contact.org_id)
          .eq("is_enabled", true);

        const { data: companyFeatures } = await supabase
          .from("company_features")
          .select("feature_key")
          .in("company_id", companyIds)
          .eq("is_enabled", true);

        const features: Record<string, boolean> = {};

        // Merge org and company features
        orgFeatures?.forEach((f) => (features[f.feature_key] = true));
        companyFeatures?.forEach((f) => (features[f.feature_key] = true));

        // Build enriched claims
        const claims = {
          user_id: user.id,
          email: contact.email,
          first_name: contact.first_name,
          last_name: contact.last_name,
          phone: contact.phone,
          role: contact.role || "external",
          org_id: contact.org_id,
          org_name: contact.orgs?.[0]?.name,
          org_slug: contact.orgs?.[0]?.slug,
          company_ids: companyIds,
          company_id: contact.company_id,
          company_name: contact.companies?.[0]?.name,
          company_slug: contact.companies?.[0]?.slug,
          features,
          scopes: ["read", "write"], // Basic scopes
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

      // 404 for unmatched routes
      return new Response(JSON.stringify({ error: "Not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    } catch (error) {
      console.error("Auth API error:", error);
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
