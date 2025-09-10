import { Context, Next } from "hono";
import { getUserClaims } from "../lib/supabaseAdmin";
import type { Env } from "../index";

// Auth middleware to verify JWT and enrich context with claims
export async function authMiddleware(c: Context<{ Bindings: Env }>, next: Next) {
  try {
    // Get token from Authorization header
    const authHeader = c.req.header("Authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return c.json({ error: "Missing or invalid authorization header" }, 401);
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Get user claims
    const claims = await getUserClaims(token, c.env);

    if (!claims) {
      return c.json({ error: "Invalid or expired token" }, 401);
    }

    // Add claims to context
    c.set("claims", claims);

    await next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    return c.json({ error: "Authentication failed" }, 401);
  }
}

// Optional auth middleware - doesn't fail if no token
export async function optionalAuthMiddleware(c: Context, next: Next) {
  try {
    const authHeader = c.req.header("Authorization");

    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.substring(7);
      const claims = await getUserClaims(token);

      if (claims) {
        c.set("claims", claims);
      }
    }

    await next();
  } catch (error) {
    console.error("Optional auth middleware error:", error);
    // Continue without auth
    await next();
  }
}
