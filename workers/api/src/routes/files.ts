import { Hono } from "hono";
import { z } from "zod";
import { supabaseAdmin } from "../lib/supabaseAdmin";

const fileRoutes = new Hono();

// File schemas
const signUploadSchema = z.object({
  filename: z.string().min(1),
  content_type: z.string().min(1),
  size: z.number().positive(),
  company_id: z.string().uuid().optional(),
});

const completeUploadSchema = z.object({
  key: z.string().min(1),
  filename: z.string().min(1),
  content_type: z.string().min(1),
  size: z.number().positive(),
  company_id: z.string().uuid().optional(),
});

// POST /files/sign-upload - Get signed URL for upload
fileRoutes.post("/sign-upload", async (c) => {
  try {
    const claims = c.get("claims");
    if (!claims) {
      return c.json({ error: "Not authenticated" }, 401);
    }

    const body = await c.req.json();
    const validated = signUploadSchema.parse(body);

    // Check company access if specified
    if (
      validated.company_id &&
      !claims.company_ids?.includes(validated.company_id)
    ) {
      return c.json({ error: "Access denied to company" }, 403);
    }

    // Generate unique key for the file
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 15);
    const key = `uploads/${claims.org_id}/${
      validated.company_id || "shared"
    }/${timestamp}-${randomId}-${validated.filename}`;

    // Create signed URL for upload (this would use R2's presigned URL API)
    // For now, we'll return a mock signed URL
    const signedUrl = `https://r2.example.com/${key}?signature=mock-signature`;

    return c.json({
      success: true,
      signed_url: signedUrl,
      key,
      expires_in: 3600, // 1 hour
    });
  } catch (error) {
    console.error("Sign upload error:", error);

    if (error instanceof z.ZodError) {
      return c.json(
        { error: "Invalid request format", details: error.errors },
        400
      );
    }

    return c.json({ error: "Internal server error" }, 500);
  }
});

// POST /files/complete - Complete upload and save metadata
fileRoutes.post("/complete", async (c) => {
  try {
    const claims = c.get("claims");
    if (!claims) {
      return c.json({ error: "Not authenticated" }, 401);
    }

    const body = await c.req.json();
    const validated = completeUploadSchema.parse(body);

    // Check company access if specified
    if (
      validated.company_id &&
      !claims.company_ids?.includes(validated.company_id)
    ) {
      return c.json({ error: "Access denied to company" }, 403);
    }

    // Save file metadata to database
    const { data: file, error } = await supabaseAdmin
      .from("files")
      .insert({
        key: validated.key,
        filename: validated.filename,
        content_type: validated.content_type,
        size: validated.size,
        org_id: claims.org_id,
        company_id: validated.company_id || null,
        uploaded_by: claims.user_id,
        uploaded_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error("Error saving file metadata:", error);
      return c.json({ error: "Failed to save file metadata" }, 500);
    }

    return c.json({
      success: true,
      file: {
        id: file.id,
        key: file.key,
        filename: file.filename,
        content_type: file.content_type,
        size: file.size,
        uploaded_at: file.uploaded_at,
        download_url: `/files/download/${file.id}`,
      },
    });
  } catch (error) {
    console.error("Complete upload error:", error);

    if (error instanceof z.ZodError) {
      return c.json(
        { error: "Invalid request format", details: error.errors },
        400
      );
    }

    return c.json({ error: "Internal server error" }, 500);
  }
});

// GET /files - List files
fileRoutes.get("/", async (c) => {
  try {
    const claims = c.get("claims");
    if (!claims) {
      return c.json({ error: "Not authenticated" }, 401);
    }

    const { company_id } = c.req.query();

    // Build query based on role and company access
    let query = supabaseAdmin
      .from("files")
      .select(
        `
        id,
        key,
        filename,
        content_type,
        size,
        uploaded_at,
        company_id,
        uploaded_by
      `
      )
      .eq("org_id", claims.org_id);

    // If company_id is specified, check access
    if (company_id) {
      if (!claims.company_ids?.includes(company_id)) {
        return c.json({ error: "Access denied to company" }, 403);
      }
      query = query.eq("company_id", company_id);
    } else if (claims.role === "external") {
      // External users can only see files for their companies
      query = query.in("company_id", claims.company_ids || []);
    }

    const { data: files, error } = await query.order("uploaded_at", {
      ascending: false,
    });

    if (error) {
      console.error("Error fetching files:", error);
      return c.json({ error: "Failed to fetch files" }, 500);
    }

    // Add download URLs
    const filesWithUrls =
      files?.map((file) => ({
        ...file,
        download_url: `/files/download/${file.id}`,
      })) || [];

    return c.json({ success: true, files: filesWithUrls });
  } catch (error) {
    console.error("Files GET error:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// GET /files/download/:id - Get download URL
fileRoutes.get("/download/:id", async (c) => {
  try {
    const claims = c.get("claims");
    if (!claims) {
      return c.json({ error: "Not authenticated" }, 401);
    }

    const fileId = c.req.param("id");

    // Get file metadata
    const { data: file, error } = await supabaseAdmin
      .from("files")
      .select("*")
      .eq("id", fileId)
      .eq("org_id", claims.org_id)
      .single();

    if (error || !file) {
      return c.json({ error: "File not found" }, 404);
    }

    // Check company access
    if (file.company_id && !claims.company_ids?.includes(file.company_id)) {
      return c.json({ error: "Access denied to file" }, 403);
    }

    // Generate signed download URL (this would use R2's presigned URL API)
    const downloadUrl = `https://r2.example.com/${file.key}?download=true&signature=mock-download-signature`;

    return c.json({
      success: true,
      download_url: downloadUrl,
      filename: file.filename,
      content_type: file.content_type,
      size: file.size,
    });
  } catch (error) {
    console.error("File download error:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// DELETE /files/:id - Delete file
fileRoutes.delete("/:id", async (c) => {
  try {
    const claims = c.get("claims");
    if (!claims) {
      return c.json({ error: "Not authenticated" }, 401);
    }

    const fileId = c.req.param("id");

    // Get file metadata
    const { data: file, error } = await supabaseAdmin
      .from("files")
      .select("*")
      .eq("id", fileId)
      .eq("org_id", claims.org_id)
      .single();

    if (error || !file) {
      return c.json({ error: "File not found" }, 404);
    }

    // Check company access
    if (file.company_id && !claims.company_ids?.includes(file.company_id)) {
      return c.json({ error: "Access denied to file" }, 403);
    }

    // Delete from R2 (this would use R2's delete API)
    // await r2.delete(file.key)

    // Delete metadata from database
    const { error: deleteError } = await supabaseAdmin
      .from("files")
      .delete()
      .eq("id", fileId);

    if (deleteError) {
      console.error("Error deleting file metadata:", deleteError);
      return c.json({ error: "Failed to delete file" }, 500);
    }

    return c.json({ success: true });
  } catch (error) {
    console.error("File delete error:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

export { fileRoutes };
