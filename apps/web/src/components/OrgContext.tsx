import React, { createContext, useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

interface OrgContextType {
  org: {
    id: string;
    name: string;
    slug: string;
  } | null;
  userRole: string | null;
  loading: boolean;
  error: string | null;
}

const OrgContext = createContext<OrgContextType | undefined>(undefined);

export function OrgProvider({ children }: { children: React.ReactNode }) {
  const { slug } = useParams<{ slug: string }>();
  const [org, setOrg] = useState<OrgContextType['org']>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadOrgContext = async () => {
      if (!slug) {
        setError('No organization slug provided');
        setLoading(false);
        return;
      }

      try {
        // Get the org by slug
        const { data: orgData, error: orgError } = await supabase
          .from('orgs')
          .select('id, name, slug')
          .eq('slug', slug)
          .single();

        if (orgError || !orgData) {
          setError('Organization not found');
          setLoading(false);
          return;
        }

        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setError('User not authenticated');
          setLoading(false);
          return;
        }

        // Get user's role in this org
        const { data: contact, error: contactError } = await supabase
          .from('contacts')
          .select('role')
          .eq('org_id', orgData.id)
          .eq('supabase_user_id', user.id)
          .eq('is_active', true)
          .single();

        if (contactError || !contact) {
          setError('User not authorized for this organization');
          setLoading(false);
          return;
        }

        setOrg(orgData);
        setUserRole(contact.role);
        setError(null);
      } catch (err) {
        console.error('Error loading org context:', err);
        setError('Failed to load organization context');
      } finally {
        setLoading(false);
      }
    };

    loadOrgContext();
  }, [slug]);

  const value: OrgContextType = {
    org,
    userRole,
    loading,
    error
  };

  return (
    <OrgContext.Provider value={value}>
      {children}
    </OrgContext.Provider>
  );
}

export function useOrg() {
  const context = useContext(OrgContext);
  if (context === undefined) {
    throw new Error('useOrg must be used within an OrgProvider');
  }
  return context;
}
