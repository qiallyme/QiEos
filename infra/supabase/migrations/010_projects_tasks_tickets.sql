-- QiEOS: Enhanced Projects, Tasks, and Tickets with Todoist-level features
-- Migration: 010_projects_tasks_tickets.sql
-- Purpose: Full-featured task management system with team collaboration
-- Created: 2025-01-27

-- Projects (personal and team)
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  type TEXT DEFAULT 'personal' CHECK (type IN ('personal', 'team')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'archived', 'completed')),
  color TEXT DEFAULT '#3498db', -- Hex color for project
  icon TEXT, -- Icon identifier
  settings JSONB DEFAULT '{}', -- Project-specific settings
  parent_id UUID REFERENCES projects(id), -- For project folders
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tasks with full Todoist feature set
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'completed', 'cancelled')),
  priority INTEGER DEFAULT 3 CHECK (priority BETWEEN 1 AND 4), -- 1=urgent, 4=low
  due_date TIMESTAMPTZ,
  due_time TIME, -- Specific time of day
  duration_minutes INTEGER, -- Estimated duration
  labels TEXT[] DEFAULT '{}', -- Array of label strings
  assignee_id UUID REFERENCES contacts(id),
  parent_task_id UUID REFERENCES tasks(id), -- For sub-tasks
  sort_order INTEGER DEFAULT 0,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Task Comments
CREATE TABLE IF NOT EXISTS task_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES contacts(id),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Task Attachments
CREATE TABLE IF NOT EXISTS task_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  file_type TEXT NOT NULL,
  file_path TEXT NOT NULL, -- R2 path
  uploaded_by UUID NOT NULL REFERENCES contacts(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Custom Filters (like Todoist's 150 filter views)
CREATE TABLE IF NOT EXISTS task_filters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  query TEXT NOT NULL, -- JSON query object
  is_shared BOOLEAN DEFAULT false,
  created_by UUID NOT NULL REFERENCES contacts(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Task Reminders
CREATE TABLE IF NOT EXISTS task_reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES contacts(id),
  reminder_type TEXT NOT NULL CHECK (reminder_type IN ('due_date', 'custom', 'recurring')),
  reminder_time TIMESTAMPTZ NOT NULL,
  is_sent BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Recurring Task Templates
CREATE TABLE IF NOT EXISTS recurring_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  priority INTEGER DEFAULT 3,
  duration_minutes INTEGER,
  labels TEXT[] DEFAULT '{}',
  assignee_id UUID REFERENCES contacts(id),
  recurrence_rule TEXT NOT NULL, -- RRULE format
  next_due_date TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Project Templates
CREATE TABLE IF NOT EXISTS project_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  template_data JSONB NOT NULL, -- Project structure and tasks
  is_shared BOOLEAN DEFAULT false,
  created_by UUID NOT NULL REFERENCES contacts(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Team Project Members
CREATE TABLE IF NOT EXISTS project_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  contact_id UUID NOT NULL REFERENCES contacts(id),
  role TEXT DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member', 'viewer')),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(project_id, contact_id)
);

-- Activity Log (for unlimited activity history)
CREATE TABLE IF NOT EXISTS task_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES contacts(id),
  action TEXT NOT NULL, -- created, updated, completed, commented, etc.
  details JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_filters ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE recurring_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_activity ENABLE ROW LEVEL SECURITY;

-- Basic RLS Policies (will be enhanced in 900_rls_policies.sql)
CREATE POLICY "Users can view projects in their org" ON projects FOR SELECT USING (true);
CREATE POLICY "Users can view tasks in their org" ON tasks FOR SELECT USING (true);
CREATE POLICY "Users can view task comments in their org" ON task_comments FOR SELECT USING (true);
CREATE POLICY "Users can view task attachments in their org" ON task_attachments FOR SELECT USING (true);
CREATE POLICY "Users can view task filters in their org" ON task_filters FOR SELECT USING (true);
CREATE POLICY "Users can view task reminders in their org" ON task_reminders FOR SELECT USING (true);
CREATE POLICY "Users can view recurring tasks in their org" ON recurring_tasks FOR SELECT USING (true);
CREATE POLICY "Users can view project templates in their org" ON project_templates FOR SELECT USING (true);
CREATE POLICY "Users can view project members in their org" ON project_members FOR SELECT USING (true);
CREATE POLICY "Users can view task activity in their org" ON task_activity FOR SELECT USING (true);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_projects_org_id ON projects(org_id);
CREATE INDEX IF NOT EXISTS idx_projects_type ON projects(type);
CREATE INDEX IF NOT EXISTS idx_projects_parent_id ON projects(parent_id);

CREATE INDEX IF NOT EXISTS idx_tasks_org_id ON tasks(org_id);
CREATE INDEX IF NOT EXISTS idx_tasks_project_id ON tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks(priority);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_tasks_assignee_id ON tasks(assignee_id);
CREATE INDEX IF NOT EXISTS idx_tasks_parent_task_id ON tasks(parent_task_id);
CREATE INDEX IF NOT EXISTS idx_tasks_labels ON tasks USING GIN(labels);

CREATE INDEX IF NOT EXISTS idx_task_comments_task_id ON task_comments(task_id);
CREATE INDEX IF NOT EXISTS idx_task_attachments_task_id ON task_attachments(task_id);
CREATE INDEX IF NOT EXISTS idx_task_filters_org_id ON task_filters(org_id);
CREATE INDEX IF NOT EXISTS idx_task_reminders_task_id ON task_reminders(task_id);
CREATE INDEX IF NOT EXISTS idx_task_reminders_user_id ON task_reminders(user_id);
CREATE INDEX IF NOT EXISTS idx_recurring_tasks_org_id ON recurring_tasks(org_id);
CREATE INDEX IF NOT EXISTS idx_project_members_project_id ON project_members(project_id);
CREATE INDEX IF NOT EXISTS idx_task_activity_org_id ON task_activity(org_id);
CREATE INDEX IF NOT EXISTS idx_task_activity_task_id ON task_activity(task_id);

-- Comments for documentation
COMMENT ON TABLE projects IS 'Personal and team projects with full Todoist feature set';
COMMENT ON TABLE tasks IS 'Tasks with priorities, due dates, labels, sub-tasks, and assignments';
COMMENT ON TABLE task_comments IS 'Comments on tasks for collaboration';
COMMENT ON TABLE task_attachments IS 'File attachments for tasks (stored in R2)';
COMMENT ON TABLE task_filters IS 'Custom filter views (up to 150 per user)';
COMMENT ON TABLE task_reminders IS 'Task reminders and notifications';
COMMENT ON TABLE recurring_tasks IS 'Recurring task templates with RRULE support';
COMMENT ON TABLE project_templates IS 'Reusable project templates';
COMMENT ON TABLE project_members IS 'Team project membership and roles';
COMMENT ON TABLE task_activity IS 'Unlimited activity history for tasks and projects';