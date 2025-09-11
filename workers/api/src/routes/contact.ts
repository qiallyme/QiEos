import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";

const contactSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  email: z.string().email({ message: "Invalid email address" }),
  phone: z.string().optional(),
  message: z.string().min(1, { message: "Message is required" }),
});

const contactRoutes = new Hono();

contactRoutes.post("/", zValidator("json", contactSchema), async (c) => {
  const { name, email, phone, message } = c.req.valid("json");

  // TODO: Forward to email/webhook using CONTACT_WEBHOOK_URL
  console.log("New contact form submission:");
  console.log({ name, email, phone, message });

  return c.json({ success: true, message: "Message received" });
});

export { contactRoutes };
