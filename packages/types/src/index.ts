// QiEOS Shared Types

export interface Claims {
  user_id: string;
  email: string;
  role: 'admin' | 'internal' | 'external' | 'public';
  org_id: string | null;
  company_ids: string[];
  department: 'public' | 'external' | 'internal';
  features: Record<string, boolean>;
  client_slug?: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  due_date?: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  assigned_to?: string;
  org_id: string;
  company_id?: string;
}

export interface File {
  id: string;
  name: string;
  size: number;
  mime_type: string;
  url: string;
  created_at: string;
  created_by: string;
  org_id: string;
  company_id?: string;
}

export interface KnowledgeBaseDoc {
  id: string;
  title: string;
  content: string;
  slug: string;
  collection_id?: string;
  is_public: boolean;
  created_at: string;
  updated_at: string;
  created_by: string;
  org_id: string;
  company_id?: string;
}
