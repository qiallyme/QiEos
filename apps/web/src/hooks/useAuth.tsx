import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { createClient } from "@supabase/supabase-js";
import { api } from "../lib/api";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://vwqkhjnkummwtvfxgqml.supabase.co";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ3cWtoam5rdW1td3R2ZnhncW1sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYwMDMwNDksImV4cCI6MjA3MTU3OTA0OX0.YourAnonKeyHere";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface Claims {
  user_id: string;
  email: string;
  role: string;
  org_id: string | null;
  company_ids: string[];
  department: string;
  features: {
    crm: boolean;
    projects: boolean;
    tasks: boolean;
    messaging: boolean;
    kb: boolean;
    ai_rag: boolean;
    billing: boolean;
    lms: boolean;
    client_tools: boolean;
    voice_assistant: boolean;
    vision_tools: boolean;
    client_sites: boolean;
    public_drops: boolean;
  };
  client_slug?: string;
}

interface AuthContextType {
  user: any;
  claims: Claims | null;
  loading: boolean;
  signIn: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshClaims: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [claims, setClaims] = useState<Claims | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.access_token) {
        api.setToken(session.access_token);
        enrichClaims(session.access_token);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null);

      if (session?.access_token) {
        api.setToken(session.access_token);
        await enrichClaims(session.access_token);
      } else {
        api.setToken(null);
        setClaims(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const enrichClaims = async (token: string) => {
    try {
      const response = await api.post("/auth/session", { token });
      if (response.success) {
        setClaims(response.claims);
      }
    } catch (error) {
      console.error("Failed to enrich claims:", error);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string) => {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) throw error;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  const refreshClaims = async () => {
    if (user) {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.access_token) {
        await enrichClaims(session.access_token);
      }
    }
  };

  const value = {
    user,
    claims,
    loading,
    signIn,
    signOut,
    refreshClaims,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

