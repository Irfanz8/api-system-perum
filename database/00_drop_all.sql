-- =============================================================
-- DROP ALL TABLES - Reset Database (HATI-HATI!)
-- =============================================================
-- Jalankan ini untuk menghapus semua tabel dan memulai dari 0
-- PERINGATAN: Semua data akan hilang!
-- =============================================================

-- Drop triggers terlebih dahulu
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_deleted ON auth.users;
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
DROP TRIGGER IF EXISTS update_properties_updated_at ON properties;
DROP TRIGGER IF EXISTS update_financial_transactions_updated_at ON financial_transactions;
DROP TRIGGER IF EXISTS update_inventory_updated_at ON inventory;
DROP TRIGGER IF EXISTS update_property_sales_updated_at ON property_sales;
DROP TRIGGER IF EXISTS update_divisions_updated_at ON divisions;
DROP TRIGGER IF EXISTS update_modules_updated_at ON modules;
DROP TRIGGER IF EXISTS update_user_permissions_updated_at ON user_permissions;

-- Drop functions
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.handle_user_update() CASCADE;
DROP FUNCTION IF EXISTS public.handle_user_delete() CASCADE;
DROP FUNCTION IF EXISTS assign_user_to_division(VARCHAR, VARCHAR) CASCADE;
DROP FUNCTION IF EXISTS set_user_module_permission(VARCHAR, VARCHAR, BOOLEAN, BOOLEAN, BOOLEAN, BOOLEAN) CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- Drop semua tabel (urutan penting karena FK)
DROP TABLE IF EXISTS user_permissions CASCADE;
DROP TABLE IF EXISTS user_divisions CASCADE;
DROP TABLE IF EXISTS inventory_transactions CASCADE;
DROP TABLE IF EXISTS property_sales CASCADE;
DROP TABLE IF EXISTS financial_transactions CASCADE;
DROP TABLE IF EXISTS inventory CASCADE;
DROP TABLE IF EXISTS properties CASCADE;
DROP TABLE IF EXISTS modules CASCADE;
DROP TABLE IF EXISTS divisions CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS users_backup CASCADE;

-- Verifikasi semua tabel sudah terhapus
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';
