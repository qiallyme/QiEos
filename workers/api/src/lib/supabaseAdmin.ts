import { createClient } from "@supabase/supabase-js";
import type { Env } from '../index';

// Service-role client for server-side operations
// This bypasses RLS and should only be used in Workers
export const getSupabaseAdmin = (env: Env) => {
  const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = env;

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Missing required Supabase environment variables: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  }

  return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
};

// Helper to get user claims from JWT
export async function getUserClaims(token: string, env: Env) {
  try {
    const supabaseAdmin = getSupabaseAdmin(env);
    const {
      data: { user },
      error,
    } = await supabaseAdmin.auth.getUser(token);

    if (error || !user) {
      return null;
    }

    // Get user's org and company associations
    const { data: contact } = await supabaseAdmin
      .from("contacts")
      .select(
        `
        id,
        org_id,
        department,
        companies (
          id,
          name
        )
      `
      )
      .eq("user_id", user.id)
      .single();

    if (!contact) {
      return null;
    }

    // Get feature flags for org and companies
    const { data: orgFeatures } = await supabaseAdmin
      .from("org_features")
      .select("feature_key")
      .eq("org_id", contact.org_id)
      .eq("enabled", true);

    const companyIds = contact.companies?.map((c: any) => c.id) || [];

    const { data: companyFeatures } = await supabaseAdmin
      .from("company_features")
      .select("feature_key")
      .in("company_id", companyIds)
      .eq("enabled", true);

    // Merge feature flags
    const features: Record<string, boolean> = {};
    orgFeatures?.forEach((f) => (features[f.feature_key] = true));
    companyFeatures?.forEach((f) => (features[f.feature_key] = true));

    return {
      user_id: user.id,
      email: user.email,
      role:
        contact.department === "public"
          ? "public"
          : contact.department === "external"
          ? "external"
          : contact.department === "internal"
          ? "internal"
          : "admin",
      org_id: contact.org_id,
      company_ids: companyIds,
      department: contact.department,
      features,
    };
  } catch (error) {
    console.error("Error getting user claims:", error);
    return null;
  }
}
