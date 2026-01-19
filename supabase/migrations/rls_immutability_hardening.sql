-- ============================================
-- STATS APP - RLS Hardening Migration
-- Advanced Security Policies for Immutability
-- ============================================
-- 
-- PURPOSE:
-- Implement "Defense in Depth" by adding time-based immutability
-- to prevent retroactive modification of health records.
-- 
-- SECURITY RATIONALE:
-- Health and financial data should be treated as audit logs.
-- Once recorded, historical data should not be easily modified
-- as this could mask fraudulent activity or data manipulation.
-- 
-- BEHAVIOR:
-- - Records older than 24 hours cannot be UPDATED or DELETED
-- - This applies to sleep_records (expandable to other tables)
-- - Users can still INSERT new records freely
-- - Fresh records (< 24h) can still be corrected
-- 
-- RUN: Via Supabase Dashboard > SQL Editor
-- ============================================

-- ============================================
-- STEP 1: Drop existing UPDATE policy
-- ============================================
DROP POLICY IF EXISTS "update_own_data" ON public.sleep_records;

-- ============================================
-- STEP 2: Create IMMUTABLE UPDATE policy
-- Users can only update records created within last 24 hours
-- ============================================
CREATE POLICY "update_own_recent_data" 
ON public.sleep_records
FOR UPDATE 
USING (
    auth.uid() = user_id 
    AND created_at > NOW() - INTERVAL '24 hours'
)
WITH CHECK (
    auth.uid() = user_id
);

-- SECURITY NOTE:
-- The USING clause restricts WHICH rows can be targeted for update.
-- If created_at is older than 24h, the update silently affects 0 rows.
-- This is by design - attackers don't get specific error messages.

-- ============================================
-- STEP 3: Drop existing DELETE policy
-- ============================================
DROP POLICY IF EXISTS "delete_own_data" ON public.sleep_records;

-- ============================================
-- STEP 4: Create IMMUTABLE DELETE policy
-- Users can only delete records created within last 24 hours
-- ============================================
CREATE POLICY "delete_own_recent_data" 
ON public.sleep_records
FOR DELETE 
USING (
    auth.uid() = user_id 
    AND created_at > NOW() - INTERVAL '24 hours'
);

-- SECURITY NOTE:
-- After 24 hours, records become immutable audit logs.
-- This prevents:
-- 1. Attackers from deleting evidence after gaining access
-- 2. Accidental bulk deletion of historical data
-- 3. Manipulation of health trends for insurance fraud

-- ============================================
-- STEP 5: Ensure created_at column exists
-- (May need to add if not present)
-- ============================================
-- Run this ONLY if created_at doesn't exist:
-- ALTER TABLE public.sleep_records 
-- ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

-- ============================================
-- STEP 6: Apply same policies to other tables
-- (Optional - run separately for each table)
-- ============================================

-- For sport_sessions:
-- DROP POLICY IF EXISTS "update_own_data" ON public.sport_sessions;
-- CREATE POLICY "update_own_recent_data" ON public.sport_sessions FOR UPDATE 
-- USING (auth.uid() = user_id AND created_at > NOW() - INTERVAL '24 hours')
-- WITH CHECK (auth.uid() = user_id);

-- DROP POLICY IF EXISTS "delete_own_data" ON public.sport_sessions;
-- CREATE POLICY "delete_own_recent_data" ON public.sport_sessions FOR DELETE 
-- USING (auth.uid() = user_id AND created_at > NOW() - INTERVAL '24 hours');

-- ============================================
-- VERIFICATION
-- ============================================
-- To verify policies are active:
-- SELECT policyname, cmd, qual 
-- FROM pg_policies 
-- WHERE tablename = 'sleep_records';

-- Expected result:
-- | policyname              | cmd    | qual                                           |
-- |-------------------------|--------|------------------------------------------------|
-- | select_own_data         | SELECT | (auth.uid() = user_id)                         |
-- | insert_own_data         | INSERT | NULL                                           |
-- | update_own_recent_data  | UPDATE | (auth.uid() = user_id AND created_at > ...)    |
-- | delete_own_recent_data  | DELETE | (auth.uid() = user_id AND created_at > ...)    |
