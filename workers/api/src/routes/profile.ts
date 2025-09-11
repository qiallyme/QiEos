import { Hono } from "hono";
import { z } from "zod";
import { getSupabaseAdmin } from "../lib/supabaseAdmin";
import type { Env } from "../index";

const profileRoutes = new Hono<{ Bindings: Env; Variables: { claims: any } }>();

// Profile update schema
const updateProfileSchema = z.object({
  first_name: z.string().min(1).optional(),
  last_name: z.string().min(1).optional(),
  phone: z.string().optional(),
  avatar_url: z.string().url().optional(),
});

// PATCH /me/profile - Update user profile
profileRoutes.patch("/profile", async (c) => {
  try {
    const claims = c.get("claims");
    if (!claims) {
      return c.json({ error: "Not authenticated" }, 401);
    }

    const body = await c.req.json();
    const validated = updateProfileSchema.parse(body);

    // Update the contact record
    const { data: contact, error } = await getSupabaseAdmin(c.env)
      .from("contacts")
      .update({
        ...validated,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", claims.user_id)
      .eq("org_id", claims.org_id)
      .select()
      .single();

    if (error) {
      console.error("Error updating profile:", error);
      return c.json({ error: "Failed to update profile" }, 500);
    }

    return c.json({
      success: true,
      profile: {
        user_id: contact.user_id,
        first_name: contact.first_name,
        last_name: contact.last_name,
        phone: contact.phone,
        avatar_url: contact.avatar_url,
        email: claims.email,
        role: claims.role,
        org_id: claims.org_id,
        company_ids: claims.company_ids,
        department: claims.department,
      },
    });
  } catch (error) {
    console.error("Profile update error:", error);

    if (error instanceof z.ZodError) {
      return c.json(
        { error: "Invalid request format", details: error.errors },
        400
      );
    }

    return c.json({ error: "Internal server error" }, 500);
  }
});

// GET /me/profile - Get user profile
profileRoutes.get("/profile", async (c) => {
  try {
    const claims = c.get("claims");
    if (!claims) {
      return c.json({ error: "Not authenticated" }, 401);
    }

    // Get the contact record
    const { data: contact, error } = await getSupabaseAdmin(c.env)
      .from("contacts")
      .select(
        `
        user_id,
        first_name,
        last_name,
        phone,
        avatar_url,
        created_at,
        updated_at
      `
      )
      .eq("user_id", claims.user_id)
      .eq("org_id", claims.org_id)
      .single();

    if (error) {
      console.error("Error fetching profile:", error);
      return c.json({ error: "Failed to fetch profile" }, 500);
    }

    return c.json({
      success: true,
      profile: {
        user_id: contact.user_id,
        first_name: contact.first_name,
        last_name: contact.last_name,
        phone: contact.phone,
        avatar_url: contact.avatar_url,
        email: claims.email,
        role: claims.role,
        org_id: claims.org_id,
        company_ids: claims.company_ids,
        department: claims.department,
        created_at: contact.created_at,
        updated_at: contact.updated_at,
      },
    });
  } catch (error) {
    console.error("Profile fetch error:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

export { profileRoutes };
