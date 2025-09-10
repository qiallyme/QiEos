// Core type definitions for QiEOS

export interface User {
  id: string;
  email: string;
  name?: string;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'todo' | 'in_progress' | 'done';
  project_id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface Claims {
  role: 'admin' | 'user';
  user_id: string;
  email: string;
}
