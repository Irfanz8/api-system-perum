-- =============================================================
-- MIGRATION: Division Admin Feature
-- =============================================================
-- Adds is_division_admin flag to user_divisions table
-- Allows assigning division admins who can manage their team
-- =============================================================

-- =============================================================
-- 1. ADD is_division_admin COLUMN
-- =============================================================
ALTER TABLE user_divisions 
ADD COLUMN IF NOT EXISTS is_division_admin BOOLEAN DEFAULT false;

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_divisions_admin 
ON user_divisions(division_id, is_division_admin) 
WHERE is_division_admin = true;

-- =============================================================
-- 2. CREATE HELPER VIEWS
-- =============================================================

-- View: Division Admins
CREATE OR REPLACE VIEW division_admins AS
SELECT 
    ud.division_id,
    d.name as division_name,
    d.code as division_code,
    u.id as user_id,
    u.email,
    u.username,
    u.role,
    ud.assigned_by,
    ud.created_at
FROM user_divisions ud
JOIN users u ON ud.user_id = u.id
JOIN divisions d ON ud.division_id = d.id
WHERE ud.is_division_admin = true AND u.is_active = true;

-- View: Division Members (all users in division including admins)
CREATE OR REPLACE VIEW division_members AS
SELECT 
    ud.division_id,
    d.name as division_name,
    d.code as division_code,
    u.id as user_id,
    u.email,
    u.username,
    u.role,
    ud.is_division_admin,
    ud.assigned_by,
    ud.created_at
FROM user_divisions ud
JOIN users u ON ud.user_id = u.id
JOIN divisions d ON ud.division_id = d.id
WHERE u.is_active = true
ORDER BY ud.is_division_admin DESC, u.created_at ASC;

-- =============================================================
-- 3. HELPER FUNCTIONS
-- =============================================================

-- Function: Check if user is division admin
CREATE OR REPLACE FUNCTION is_user_division_admin(p_user_id UUID, p_division_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM user_divisions
        WHERE user_id = p_user_id 
        AND division_id = p_division_id 
        AND is_division_admin = true
    );
END;
$$ LANGUAGE plpgsql;

-- Function: Get user's managed divisions (where user is division admin)
CREATE OR REPLACE FUNCTION get_user_managed_divisions(p_user_id UUID)
RETURNS TABLE(division_id UUID, division_name VARCHAR, division_code VARCHAR) AS $$
BEGIN
    RETURN QUERY
    SELECT d.id, d.name, d.code
    FROM user_divisions ud
    JOIN divisions d ON ud.division_id = d.id
    WHERE ud.user_id = p_user_id 
    AND ud.is_division_admin = true
    AND d.is_active = true;
END;
$$ LANGUAGE plpgsql;

-- Function: Assign division admin
CREATE OR REPLACE FUNCTION assign_division_admin(
    p_user_id UUID, 
    p_division_id UUID, 
    p_assigned_by UUID
)
RETURNS BOOLEAN AS $$
BEGIN
    -- Check if user already in division
    IF EXISTS (SELECT 1 FROM user_divisions WHERE user_id = p_user_id AND division_id = p_division_id) THEN
        -- Update to admin
        UPDATE user_divisions
        SET is_division_admin = true, assigned_by = p_assigned_by
        WHERE user_id = p_user_id AND division_id = p_division_id;
    ELSE
        -- Insert as admin
        INSERT INTO user_divisions (user_id, division_id, is_division_admin, assigned_by)
        VALUES (p_user_id, p_division_id, true, p_assigned_by);
    END IF;
    RETURN TRUE;
EXCEPTION WHEN OTHERS THEN
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql;

-- Function: Remove division admin (but keep in division)
CREATE OR REPLACE FUNCTION remove_division_admin(p_user_id UUID, p_division_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE user_divisions
    SET is_division_admin = false
    WHERE user_id = p_user_id AND division_id = p_division_id;
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- =============================================================
-- 4. DATA MIGRATION (Optional - for existing data)
-- =============================================================

-- Promote first admin in each division as division admin
-- Comment out if you want to manually assign division admins
/*
WITH first_admins AS (
    SELECT DISTINCT ON (ud.division_id) 
        ud.id,
        ud.division_id,
        ud.user_id
    FROM user_divisions ud
    JOIN users u ON ud.user_id = u.id
    WHERE u.role = 'admin'
    ORDER BY ud.division_id, ud.created_at ASC
)
UPDATE user_divisions
SET is_division_admin = true
WHERE id IN (SELECT id FROM first_admins);
*/

-- =============================================================
-- VERIFICATION QUERIES
-- =============================================================

-- Check division admins
-- SELECT * FROM division_admins ORDER BY division_name;

-- Check all division members
-- SELECT * FROM division_members ORDER BY division_name, is_division_admin DESC;

-- Test function
-- SELECT is_user_division_admin('user-uuid', 'division-uuid');
-- SELECT * FROM get_user_managed_divisions('user-uuid');
