import { supabase } from './supabaseClient';

/**
 * Check if the current user has access to a specific organization slug
 */
export async function checkOrgAccess(slug: string): Promise<{
  hasAccess: boolean;
  orgId?: string;
  userRole?: string;
  error?: string;
}> {
  try {
    // Get the org by slug
    const { data: org, error: orgError } = await supabase
      .from('orgs')
      .select('id')
      .eq('slug', slug)
      .single();

    if (orgError || !org) {
      return { hasAccess: false, error: 'Organization not found' };
    }

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { hasAccess: false, error: 'User not authenticated' };
    }

    // Check if user is a contact in this org
    const { data: contact, error: contactError } = await supabase
      .from('contacts')
      .select('id, role, company_id')
      .eq('org_id', org.id)
      .eq('supabase_user_id', user.id)
      .eq('is_active', true)
      .maybeSingle();

    if (contactError || !contact) {
      return { hasAccess: false, error: 'User not authorized for this organization' };
    }

    return {
      hasAccess: true,
      orgId: org.id,
      userRole: contact.role
    };
  } catch (error) {
    console.error('Error checking org access:', error);
    return { hasAccess: false, error: 'Failed to verify access' };
  }
}

/**
 * Get all organizations the current user has access to
 */
export async function getUserOrgs(): Promise<{
  orgs: Array<{ id: string; slug: string; name: string; role: string }>;
  error?: string;
}> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { orgs: [], error: 'User not authenticated' };
    }

    const { data: userOrgs, error } = await supabase
      .from('user_orgs')
      .select('org_id, org_slug, role')
      .eq('user_id', user.id);

    if (error) {
      return { orgs: [], error: error.message };
    }

    // Get org details
    const orgIds = userOrgs?.map(uo => uo.org_id) || [];
    if (orgIds.length === 0) {
      return { orgs: [] };
    }

    const { data: orgs, error: orgsError } = await supabase
      .from('orgs')
      .select('id, name, slug')
      .in('id', orgIds);

    if (orgsError) {
      return { orgs: [], error: orgsError.message };
    }

    const result = orgs?.map(org => {
      const userOrg = userOrgs?.find(uo => uo.org_id === org.id);
      return {
        id: org.id,
        slug: org.slug,
        name: org.name,
        role: userOrg?.role || 'external'
      };
    }) || [];

    return { orgs: result };
  } catch (error) {
    console.error('Error getting user orgs:', error);
    return { orgs: [], error: 'Failed to get user organizations' };
  }
}

/**
 * Create a magic link for a specific org slug
 */
export async function createMagicLink(email: string, slug: string, next?: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const nextParam = next ? `?next=${encodeURIComponent(next)}` : '';
    const emailRedirectTo = `https://portal.qially.com/${slug}/auth/callback${nextParam}`;

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo,
        shouldCreateUser: false,
      },
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Error creating magic link:', error);
    return { success: false, error: 'Failed to send magic link' };
  }
}
