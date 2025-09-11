import { Hono } from "hono";
import { cors } from "hono/cors";
import { authRoutes } from "./routes/auth";
import { taskRoutes } from "./routes/tasks";
import { fileRoutes } from "./routes/files";
import { kbRoutes } from "./routes/kb";
import { profileRoutes } from "./routes/profile";
import { authMiddleware } from "./middleware/auth";
import { contactRoutes } from "./routes/contact";
import { waitlistRoutes } from "./routes/waitlist";

// Define the bindings we expect from wrangler.toml
export interface Env {
  SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  OPENAI_API_KEY?: string;
  STRIPE_SECRET_KEY?: string;
  JWT_ISSUER?: string;
  EMBEDDING_DIM?: string;
  CORS_ORIGINS?: string;
  R2: R2Bucket;
  WAITLIST_KV_NAMESPACE?: any; // Using `any` for KV Namespace binding
  [key: string]: any;
}

const app = new Hono<{ Bindings: Env; Variables: { claims: any } }>();

// CORS middleware
app.use("*", async (c, next) => {
  const corsOrigins = c.env?.CORS_ORIGINS?.split(",") || [
    "http://localhost:5173",
    "https://qieos.pages.dev",
  ];

  return cors({
    origin: corsOrigins,
    credentials: true,
  })(c, next);
});

// Health check
app.get("/health", (c) => {
  return c.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Public API routes
app.route("/contact", contactRoutes);
app.route("/waitlist", waitlistRoutes);

// Auth routes (no middleware needed)
app.route("/auth", authRoutes);

// Protected routes (require auth middleware)
app.use("/tasks", authMiddleware);
app.use("/files", authMiddleware);
app.use("/kb", authMiddleware);
app.use("/me", authMiddleware);

// Route handlers
app.route("/tasks", taskRoutes);
app.route("/files", fileRoutes);
app.route("/kb", kbRoutes);
app.route("/me", profileRoutes);

export default app;
