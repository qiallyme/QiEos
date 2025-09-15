import { createClient } from "@supabase/supabase-js";

export interface Env {
  SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  R2: R2Bucket;
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

      // Get auth token from header
      const authHeader = request.headers.get("Authorization");
      if (!authHeader?.startsWith("Bearer ")) {
        return new Response(
          JSON.stringify({ error: "Missing or invalid authorization" }),
          {
            status: 401,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      const token = authHeader.substring(7);
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser(token);

      if (authError || !user) {
        return new Response(JSON.stringify({ error: "Invalid token" }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Get user's org_id from contacts table
      const { data: contact } = await supabase
        .from("contacts")
        .select("org_id, id, company_id")
        .eq("supabase_user_id", user.id)
        .single();

      if (!contact) {
        return new Response(JSON.stringify({ error: "User not found" }), {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const orgId = contact.org_id;
      const contactId = contact.id;
      const companyId = contact.company_id;

      // Routes
      switch (true) {
        // POST /files/sign-upload - Get signed upload URL
        case path === "/files/sign-upload" && method === "POST":
          return await signUpload(
            supabase,
            env,
            orgId,
            companyId,
            contactId,
            request
          );

        // POST /files/complete - Mark upload as complete
        case path === "/files/complete" && method === "POST":
          return await completeUpload(
            supabase,
            orgId,
            companyId,
            contactId,
            request
          );

        // GET /files - List files
        case path === "/files" && method === "GET":
          return await listFiles(supabase, orgId, companyId, url.searchParams);

        // DELETE /files/:id - Delete file
        case path.match(/^\/files\/[^\/]+$/) && method === "DELETE":
          const fileId = path.split("/")[2];
          return await deleteFile(supabase, env, orgId, fileId);

        default:
          return new Response(JSON.stringify({ error: "Not found" }), {
            status: 404,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
      }
    } catch (error) {
      console.error("Files API error:", error);
      return new Response(JSON.stringify({ error: "Internal server error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  },
};

// Helper functions
async function signUpload(
  supabase: any,
  env: Env,
  orgId: string,
  companyId: string | null,
  contactId: string,
  request: Request
) {
  const body = (await request.json()) as any;
  const { filename, content_type, size } = body;

  if (!filename || !content_type || !size) {
    return new Response(JSON.stringify({ error: "Missing required fields" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Generate unique file key
  const fileId = crypto.randomUUID();
  const fileKey = `files/${orgId}/${fileId}/${filename}`;

  // Create signed upload URL
  const signedUrl = await env.R2.getSignedUrl("PUT", fileKey, {
    expiresIn: 3600, // 1 hour
  });

  // Store file metadata in database
  const { data: fileRecord, error } = await supabase
    .from("files")
    .insert({
      id: fileId,
      org_id: orgId,
      company_id: companyId,
      uploaded_by: contactId,
      filename,
      content_type,
      size,
      file_key: fileKey,
      status: "uploading",
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating file record:", error);
    return new Response(
      JSON.stringify({ error: "Failed to create file record" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }

  return new Response(
    JSON.stringify({
      success: true,
      file_id: fileId,
      signed_url: signedUrl,
      file_record: fileRecord,
    }),
    {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    }
  );
}

async function completeUpload(
  supabase: any,
  orgId: string,
  companyId: string | null,
  contactId: string,
  request: Request
) {
  const body = (await request.json()) as any;
  const { file_id } = body;

  if (!file_id) {
    return new Response(JSON.stringify({ error: "File ID required" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Update file status to completed
  const { data, error } = await supabase
    .from("files")
    .update({
      status: "completed",
      uploaded_at: new Date().toISOString(),
    })
    .eq("id", file_id)
    .eq("org_id", orgId)
    .select()
    .single();

  if (error) {
    console.error("Error completing upload:", error);
    return new Response(
      JSON.stringify({ error: "Failed to complete upload" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }

  return new Response(
    JSON.stringify({
      success: true,
      file: data,
    }),
    {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    }
  );
}

async function listFiles(
  supabase: any,
  orgId: string,
  companyId: string | null,
  searchParams: URLSearchParams
) {
  const limit = parseInt(searchParams.get("limit") || "50");
  const offset = parseInt(searchParams.get("offset") || "0");

  let query = supabase
    .from("files")
    .select(
      `
      *,
      uploader:contacts!files_uploaded_by_fkey(first_name, last_name, email)
    `
    )
    .eq("org_id", orgId)
    .eq("status", "completed")
    .order("uploaded_at", { ascending: false })
    .range(offset, offset + limit - 1);

  // Filter by company if user is not admin
  if (companyId) {
    query = query.eq("company_id", companyId);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error listing files:", error);
    return new Response(JSON.stringify({ error: "Failed to list files" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  return new Response(
    JSON.stringify({
      files: data || [],
    }),
    {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    }
  );
}

async function deleteFile(
  supabase: any,
  env: Env,
  orgId: string,
  fileId: string
) {
  // Get file record
  const { data: file, error: fetchError } = await supabase
    .from("files")
    .select("*")
    .eq("id", fileId)
    .eq("org_id", orgId)
    .single();

  if (fetchError || !file) {
    return new Response(JSON.stringify({ error: "File not found" }), {
      status: 404,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Delete from R2
  try {
    await env.R2.delete(file.file_key);
  } catch (r2Error) {
    console.error("Error deleting from R2:", r2Error);
    // Continue with database deletion even if R2 deletion fails
  }

  // Delete from database
  const { error: deleteError } = await supabase
    .from("files")
    .delete()
    .eq("id", fileId)
    .eq("org_id", orgId);

  if (deleteError) {
    console.error("Error deleting file record:", deleteError);
    return new Response(JSON.stringify({ error: "Failed to delete file" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  return new Response(
    JSON.stringify({
      success: true,
      message: "File deleted successfully",
    }),
    {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    }
  );
}
