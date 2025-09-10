import { Hono } from "hono";
import { z } from "zod";
import { getUserClaims } from "../lib/supabaseAdmin";

const authRoutes = new Hono();

// Schema for session request
const sessionSchema = z.object({
  token: z.string().min(1),
});

// POST /auth/session - Verify Supabase session and return enriched claims
authRoutes.post("/session", async (c) => {
  try {
    const { token } = await c.req.json();

    // Validate input
    const validated = sessionSchema.parse({ token });

    // Get user claims from token
    const claims = await getUserClaims(validated.token);

    if (!claims) {
      return c.json({ error: "Invalid or expired token" }, 401);
    }

    // Return enriched claims
    return c.json({
      success: true,
      claims: {
        user_id: claims.user_id,
        email: claims.email,
        role: claims.role,
        org_id: claims.org_id,
        company_ids: claims.company_ids,
        department: claims.department,
        features: claims.features,
      },
    });
  } catch (error) {
    console.error("Auth session error:", error);

    if (error instanceof z.ZodError) {
      return c.json(
        { error: "Invalid request format", details: error.errors },
        400
      );
    }

    return c.json({ error: "Internal server error" }, 500);
  }
});

// GET /auth/me - Get current user info (requires auth middleware)
authRoutes.get("/me", async (c) => {
  // This would be used with auth middleware to get current user
  const claims = c.get("claims");

  if (!claims) {
    return c.json({ error: "Not authenticated" }, 401);
  }

  return c.json({
    success: true,
    user: {
      user_id: claims.user_id,
      email: claims.email,
      role: claims.role,
      org_id: claims.org_id,
      company_ids: claims.company_ids,
      department: claims.department,
      features: claims.features,
    },
  });
});

export { authRoutes };
