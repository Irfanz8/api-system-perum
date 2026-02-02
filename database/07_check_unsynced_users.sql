-- =============================================================
-- Sync Existing Database Users to Supabase Auth
-- =============================================================
-- WARNING: This script creates users in Supabase Auth for users
-- that exist in the database but not in auth.users
-- =============================================================

-- This script generates the commands you need to run to create users
-- You'll need to use the Supabase Admin API from your Node.js application

-- First, let's see which users need to be synced
SELECT 
    u.id,
    u.email,
    u.username,
    u.role,
    CASE 
        WHEN au.id IS NULL THEN 'NOT IN SUPABASE AUTH'
        ELSE 'EXISTS IN SUPABASE AUTH'
    END as auth_status
FROM public.users u
LEFT JOIN auth.users au ON u.id = au.id
WHERE au.id IS NULL
ORDER BY u.created_at;

-- =============================================================
-- IMPORTANT NOTES:
-- =============================================================
-- 1. Users that exist in public.users but not in auth.users 
--    CANNOT be synced backwards automatically due to security
-- 2. You have TWO options:
--    
--    OPTION A (Recommended): Create users via Supabase Auth
--    - Use the Supabase Admin API to create each user
--    - The trigger will automatically sync them to public.users
--    
--    OPTION B: Ask users to register themselves
--    - Send invitation emails
--    - Users register via /api/auth/signup
--
-- =============================================================

-- For OPTION A, you'll need to create a Node.js script to bulk create users
-- See: /Users/irfanapr8/Downloads/Private/api-system-perum/database/sync_users_to_auth.js
