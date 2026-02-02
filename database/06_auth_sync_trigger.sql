-- =============================================================
-- Auto-Sync Supabase Auth Users to Public Users Table
-- =============================================================
-- This creates a database trigger that automatically creates a record
-- in the public.users table whenever a new user signs up via Supabase Auth.
-- =============================================================

-- Create function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    user_role TEXT := 'user';
    user_name TEXT;
BEGIN
    -- Extract role from user_metadata, default to 'user'
    user_role := COALESCE(NEW.raw_user_meta_data->>'role', 'user');
    
    -- Extract name from user_metadata
    user_name := COALESCE(
        NEW.raw_user_meta_data->>'name',
        NEW.raw_user_meta_data->>'full_name',
        split_part(NEW.email, '@', 1)
    );
    
    -- Insert into public.users table
    INSERT INTO public.users (
        id,
        username,
        email,
        password_hash,
        role,
        is_active,
        created_at,
        updated_at
    ) VALUES (
        NEW.id,
        REPLACE(LOWER(user_name), ' ', '_'),
        NEW.email,
        NULL, -- password is managed by Supabase Auth
        user_role,
        true,
        NOW(),
        NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        username = EXCLUDED.username,
        updated_at = NOW();
    
    RETURN NEW;
END;
$$;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger on auth.users table
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- =============================================================
-- Optional: Update trigger for user updates
-- =============================================================

CREATE OR REPLACE FUNCTION public.handle_user_update()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    user_role TEXT;
    user_name TEXT;
BEGIN
    -- Extract role from updated user_metadata
    user_role := COALESCE(NEW.raw_user_meta_data->>'role', OLD.raw_user_meta_data->>'role', 'user');
    
    -- Extract name from user_metadata
    user_name := COALESCE(
        NEW.raw_user_meta_data->>'name',
        NEW.raw_user_meta_data->>'full_name',
        split_part(NEW.email, '@', 1)
    );
    
    -- Update public.users table
    UPDATE public.users SET
        email = NEW.email,
        username = REPLACE(LOWER(user_name), ' ', '_'),
        role = user_role,
        updated_at = NOW()
    WHERE id = NEW.id;
    
    RETURN NEW;
END;
$$;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;

-- Create trigger for updates
CREATE TRIGGER on_auth_user_updated
    AFTER UPDATE ON auth.users
    FOR EACH ROW
    WHEN (
        OLD.email IS DISTINCT FROM NEW.email OR
        OLD.raw_user_meta_data IS DISTINCT FROM NEW.raw_user_meta_data
    )
    EXECUTE FUNCTION public.handle_user_update();

-- =============================================================
-- Optional: Delete trigger
-- =============================================================

CREATE OR REPLACE FUNCTION public.handle_user_delete()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Soft delete: Mark as inactive instead of deleting
    UPDATE public.users SET
        is_active = false,
        updated_at = NOW()
    WHERE id = OLD.id;
    
    RETURN OLD;
END;
$$;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_deleted ON auth.users;

-- Create trigger for deletions
CREATE TRIGGER on_auth_user_deleted
    AFTER DELETE ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_user_delete();

-- =============================================================
-- Verification
-- =============================================================

-- List all triggers on auth.users
-- SELECT * FROM information_schema.triggers WHERE event_object_table = 'users' AND event_object_schema = 'auth';

-- Test: Create a user and check if it syncs
-- This should be done via Supabase Auth API, not directly
