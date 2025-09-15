/**
 * CRM API Endpoints
 * Handles contacts, companies, and CRM operations
 */

import { createClient } from "@supabase/supabase-js";

export interface Env {
  SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
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
        .select("org_id")
        .eq("supabase_user_id", user.id)
        .single();

      if (!contact) {
        return new Response(JSON.stringify({ error: "User not found" }), {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const orgId = contact.org_id;

      // Routes
      switch (true) {
        // GET /crm/contacts - List contacts
        case path === "/crm/contacts" && method === "GET":
          return await getContacts(supabase, orgId, url.searchParams);

        // POST /crm/contacts - Create new contact
        case path === "/crm/contacts" && method === "POST":
          return await createContact(supabase, orgId, request);

        // GET /crm/contacts/:id - Get specific contact
        case path.match(/^\/crm\/contacts\/[^\/]+$/) && method === "GET":
          const contactId = path.split("/")[3];
          return await getContact(supabase, orgId, contactId);

        // PUT /crm/contacts/:id - Update contact
        case path.match(/^\/crm\/contacts\/[^\/]+$/) && method === "PUT":
          const updateContactId = path.split("/")[3];
          return await updateContact(supabase, orgId, updateContactId, request);

        // GET /crm/companies - List companies
        case path === "/crm/companies" && method === "GET":
          return await getCompanies(supabase, orgId, url.searchParams);

        // POST /crm/companies - Create new company
        case path === "/crm/companies" && method === "POST":
          return await createCompany(supabase, orgId, request);

        // GET /crm/companies/:id - Get specific company
        case path.match(/^\/crm\/companies\/[^\/]+$/) && method === "GET":
          const companyId = path.split("/")[3];
          return await getCompany(supabase, orgId, companyId);

        // PUT /crm/companies/:id - Update company
        case path.match(/^\/crm\/companies\/[^\/]+$/) && method === "PUT":
          const updateCompanyId = path.split("/")[3];
          return await updateCompany(supabase, orgId, updateCompanyId, request);

        default:
          return new Response(JSON.stringify({ error: "Not found" }), {
            status: 404,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
      }
    } catch (error) {
      console.error("CRM API error:", error);
      return new Response(JSON.stringify({ error: "Internal server error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  },
};

// Helper functions
async function getContacts(
  supabase: any,
  orgId: string,
  searchParams: URLSearchParams
) {
  const { data, error } = await supabase
    .from("contacts")
    .select(
      `
      *,
      companies(name, slug)
    `
    )
    .eq("org_id", orgId)
    .order("created_at", { ascending: false });

  if (error) throw error;

  return new Response(JSON.stringify({ contacts: data }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function createContact(supabase: any, orgId: string, request: Request) {
  const body = await request.json();

  const { data, error } = await supabase
    .from("contacts")
    .insert({
      org_id: orgId,
      company_id: (body as any).company_id,
      email: (body as any).email,
      first_name: (body as any).first_name,
      last_name: (body as any).last_name,
      phone: (body as any).phone,
      role: (body as any).role || "external",
    })
    .select()
    .single();

  if (error) throw error;

  return new Response(JSON.stringify({ contact: data }), {
    status: 201,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function getContact(supabase: any, orgId: string, contactId: string) {
  const { data, error } = await supabase
    .from("contacts")
    .select(
      `
      *,
      companies(name, slug)
    `
    )
    .eq("id", contactId)
    .eq("org_id", orgId)
    .single();

  if (error) throw error;

  return new Response(JSON.stringify({ contact: data }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function updateContact(
  supabase: any,
  orgId: string,
  contactId: string,
  request: Request
) {
  const body = await request.json();

  const { data, error } = await supabase
    .from("contacts")
    .update(body)
    .eq("id", contactId)
    .eq("org_id", orgId)
    .select()
    .single();

  if (error) throw error;

  return new Response(JSON.stringify({ contact: data }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function getCompanies(
  supabase: any,
  orgId: string,
  searchParams: URLSearchParams
) {
  const { data, error } = await supabase
    .from("companies")
    .select(
      `
      *,
      departments(name, type),
      contacts(count)
    `
    )
    .eq("org_id", orgId)
    .order("created_at", { ascending: false });

  if (error) throw error;

  return new Response(JSON.stringify({ companies: data }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function createCompany(supabase: any, orgId: string, request: Request) {
  const body = await request.json();

  const { data, error } = await supabase
    .from("companies")
    .insert({
      org_id: orgId,
      department_id: (body as any).department_id,
      name: (body as any).name,
      slug: (body as any).slug,
    })
    .select()
    .single();

  if (error) throw error;

  return new Response(JSON.stringify({ company: data }), {
    status: 201,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function getCompany(supabase: any, orgId: string, companyId: string) {
  const { data, error } = await supabase
    .from("companies")
    .select(
      `
      *,
      departments(name, type),
      contacts(*)
    `
    )
    .eq("id", companyId)
    .eq("org_id", orgId)
    .single();

  if (error) throw error;

  return new Response(JSON.stringify({ company: data }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function updateCompany(
  supabase: any,
  orgId: string,
  companyId: string,
  request: Request
) {
  const body = await request.json();

  const { data, error } = await supabase
    .from("companies")
    .update(body)
    .eq("id", companyId)
    .eq("org_id", orgId)
    .select()
    .single();

  if (error) throw error;

  return new Response(JSON.stringify({ company: data }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
