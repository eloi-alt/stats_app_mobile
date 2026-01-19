-- ============================================
-- STATS APP - Row Level Security Migration
-- Table: sleep_records
-- ============================================
-- Purpose: Enable RLS to ensure users can only access their own data.
-- This is critical for data isolation, especially for future React Native app.
-- 
-- Run this migration in Supabase Dashboard > SQL Editor
-- or via Supabase CLI: supabase db push
-- ============================================

-- Enable Row Level Security on sleep_records table
ALTER TABLE public.sleep_records ENABLE ROW LEVEL SECURITY;

-- ============================================
-- SELECT Policy: Users can only read their own records
-- ============================================
CREATE POLICY "select_own_data" 
ON public.sleep_records
FOR SELECT 
USING (auth.uid() = user_id);

-- ============================================
-- INSERT Policy: Users can only insert records for themselves
-- ============================================
CREATE POLICY "insert_own_data" 
ON public.sleep_records
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- ============================================
-- UPDATE Policy: Users can only update their own records
-- ============================================
CREATE POLICY "update_own_data" 
ON public.sleep_records
FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- ============================================
-- DELETE Policy: Users can only delete their own records
-- ============================================
CREATE POLICY "delete_own_data" 
ON public.sleep_records
FOR DELETE 
USING (auth.uid() = user_id);

-- ============================================
-- Verification Query (optional)
-- Run this to confirm policies are active:
-- ============================================
-- SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
-- FROM pg_policies
-- WHERE tablename = 'sleep_records';
