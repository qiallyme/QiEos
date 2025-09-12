import React, { createContext, useContext, useEffect, useState } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase, api } from "../lib/supabaseClient";

export interface Claims {
  user_id: string;
  email: string;
  role: "admin" | "internal" | "external" | "public";
  org_id: string;
  company_ids: string[];
  department: string;
  features: Record<string, boolean>;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  claims: Claims | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithMagicLink: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshClaims: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [claims, setClaims] = useState<Claims | null>(null);
  const [loading, setLoading] = useState(true);

  // Get enriched claims from Worker
  const refreshClaims = async () => {
    if (!session?.access_token) {
      setClaims(null);
      return;
    }

    try {
      const response = await api.post("/auth/session", {
        token: session.access_token,
      });

      if (response.success) {
        setClaims(response.claims);
      } else {
        setClaims(null);
      }
    } catch (error) {
      console.error("Failed to get claims:", error);
      setClaims(null);
    }
  };

  // Sign in with email and password
  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw error;
    }
  };

  // Send magic link to email
  const signInWithMagicLink = async (email: string) => {
    const redirectBase = import.meta.env.VITE_SITE_URL || window.location.origin;
    const emailRedirectTo = `${redirectBase}/auth/login`;
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo },
    });
    if (error) throw error;
  };

  // Sign out
  const signOut = async () => {
    await supabase.auth.signOut();
  };

  // Initialize auth state
  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (session) {
        await refreshClaims();
      } else {
        setClaims(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Refresh claims when session changes
  useEffect(() => {
    if (session) {
      refreshClaims();
    }
  }, [session]);

  const value = {
    user,
    session,
    claims,
    loading,
    signIn,
    signInWithMagicLink,
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
