import { createClient } from "@supabase/supabase-js";

// Public Supabase client for client-side auth
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.warn('Missing Supabase environment variables. Please check your environment configuration.')
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// API client for Worker endpoints
export const api = {
  async request(endpoint: string, options: RequestInit = {}) {
    const token = await supabase.auth.getSession();

    const response = await fetch(`${import.meta.env.VITE_API_URL}${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(token.data.session?.access_token && {
          Authorization: `Bearer ${token.data.session.access_token}`,
        }),
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ error: "Request failed" }));
      throw new Error(error.error || "Request failed");
    }

    return response.json();
  },

  get(endpoint: string) {
    return this.request(endpoint, { method: "GET" });
  },

  post(endpoint: string, data?: any) {
    return this.request(endpoint, {
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    });
  },

  patch(endpoint: string, data?: any) {
    return this.request(endpoint, {
      method: "PATCH",
      body: data ? JSON.stringify(data) : undefined,
    });
  },

  delete(endpoint: string) {
    return this.request(endpoint, { method: "DELETE" });
  },
};
