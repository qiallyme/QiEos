/**
 * Billing API Endpoints
 * Handles invoices, payments, and billing operations
 */

import { createClient } from "@supabase/supabase-js";

export interface Env {
  SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  STRIPE_SECRET_KEY: string;
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
        // GET /billing/invoices - List invoices
        case path === "/billing/invoices" && method === "GET":
          return await getInvoices(supabase, orgId, url.searchParams);

        // POST /billing/invoices - Create new invoice
        case path === "/billing/invoices" && method === "POST":
          return await createInvoice(supabase, orgId, request);

        // GET /billing/invoices/:id - Get specific invoice
        case path.match(/^\/billing\/invoices\/[^\/]+$/) && method === "GET":
          const invoiceId = path.split("/")[3];
          return await getInvoice(supabase, orgId, invoiceId);

        // PUT /billing/invoices/:id - Update invoice
        case path.match(/^\/billing\/invoices\/[^\/]+$/) && method === "PUT":
          const updateInvoiceId = path.split("/")[3];
          return await updateInvoice(supabase, orgId, updateInvoiceId, request);

        // POST /billing/invoices/:id/send - Send invoice
        case path.match(/^\/billing\/invoices\/[^\/]+\/send$/) &&
          method === "POST":
          const sendInvoiceId = path.split("/")[3];
          return await sendInvoice(supabase, orgId, sendInvoiceId, request);

        // GET /billing/ledger - Get billing ledger
        case path === "/billing/ledger" && method === "GET":
          return await getBillingLedger(supabase, orgId, url.searchParams);

        default:
          return new Response(JSON.stringify({ error: "Not found" }), {
            status: 404,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
      }
    } catch (error) {
      console.error("Billing API error:", error);
      return new Response(JSON.stringify({ error: "Internal server error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  },
};

// Helper functions
async function getInvoices(
  supabase: any,
  orgId: string,
  searchParams: URLSearchParams
) {
  const { data, error } = await supabase
    .from("invoices")
    .select(
      `
      *,
      invoice_line_items(*),
      companies(name, slug)
    `
    )
    .eq("org_id", orgId)
    .order("created_at", { ascending: false });

  if (error) throw error;

  return new Response(JSON.stringify({ invoices: data }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function createInvoice(supabase: any, orgId: string, request: Request) {
  const body = await request.json();

  const { data, error } = await supabase
    .from("invoices")
    .insert({
      org_id: orgId,
      company_id: body.company_id,
      description: body.description,
      due_date: body.due_date,
      line_items: body.line_items || [],
    })
    .select()
    .single();

  if (error) throw error;

  return new Response(JSON.stringify({ invoice: data }), {
    status: 201,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function getInvoice(supabase: any, orgId: string, invoiceId: string) {
  const { data, error } = await supabase
    .from("invoices")
    .select(
      `
      *,
      invoice_line_items(*),
      companies(name, slug)
    `
    )
    .eq("id", invoiceId)
    .eq("org_id", orgId)
    .single();

  if (error) throw error;

  return new Response(JSON.stringify({ invoice: data }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function updateInvoice(
  supabase: any,
  orgId: string,
  invoiceId: string,
  request: Request
) {
  const body = await request.json();

  const { data, error } = await supabase
    .from("invoices")
    .update(body)
    .eq("id", invoiceId)
    .eq("org_id", orgId)
    .select()
    .single();

  if (error) throw error;

  return new Response(JSON.stringify({ invoice: data }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function sendInvoice(
  supabase: any,
  orgId: string,
  invoiceId: string,
  request: Request
) {
  // Update invoice status to 'sent'
  const { data, error } = await supabase
    .from("invoices")
    .update({
      status: "sent",
      issued_date: new Date().toISOString().split("T")[0],
    })
    .eq("id", invoiceId)
    .eq("org_id", orgId)
    .select()
    .single();

  if (error) throw error;

  // TODO: Integrate with email service to send invoice
  // For now, just return success

  return new Response(
    JSON.stringify({
      message: "Invoice sent successfully",
      invoice: data,
    }),
    {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    }
  );
}

async function getBillingLedger(
  supabase: any,
  orgId: string,
  searchParams: URLSearchParams
) {
  const { data, error } = await supabase
    .from("billing_ledger")
    .select(
      `
      *,
      invoices(invoice_number),
      companies(name, slug)
    `
    )
    .eq("org_id", orgId)
    .order("created_at", { ascending: false });

  if (error) throw error;

  return new Response(JSON.stringify({ ledger: data }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
