-- Auth Field Standardization Migration
-- This migration standardizes the user ID field in contacts table
-- Date: 2025-01-27

-- Add supabase_user_id column if it doesn't exist
ALTER TABLE contacts 
ADD COLUMN IF NOT EXISTS supabase_user_id UUID;

-- Copy data from user_id to supabase_user_id for existing records
UPDATE contacts 
SET supabase_user_id = user_id 
WHERE supabase_user_id IS NULL AND user_id IS NOT NULL;

-- Add unique constraint on supabase_user_id
ALTER TABLE contacts 
ADD CONSTRAINT contacts_supabase_user_id_unique UNIQUE (supabase_user_id);

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_contacts_supabase_user_id ON contacts(supabase_user_id);

-- Note: user_id column is kept for backward compatibility
-- It can be removed in a future migration after all systems are updated
