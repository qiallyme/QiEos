import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { Env } from "..";

const waitlistSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  feature: z.string().min(1, { message: "Feature is required" }),
});

const waitlistRoutes = new Hono<{ Bindings: Env }>();

waitlistRoutes.post("/", zValidator("json", waitlistSchema), async (c) => {
  const { email, feature } = c.req.valid("json");
  const kvNamespace = c.env.WAITLIST_KV_NAMESPACE;

  // TODO: Actually use the KV Namespace binding from wrangler.toml
  // For now, we'll just log it.
  console.log(`Adding ${email} to waitlist for ${feature}.`);
  console.log(
    `(KV Namespace binding not yet configured for this route: ${kvNamespace})`
  );

  // In a real scenario, you would do something like:
  // if (kvNamespace) {
  //   await kvNamespace.put(`${feature}:${email}`, new Date().toISOString());
  // }

  return c.json({ success: true, message: "Added to waitlist" });
});

export { waitlistRoutes };
