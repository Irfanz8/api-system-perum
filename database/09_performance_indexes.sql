-- =============================================================
-- Performance Indexes for Query Optimization
-- =============================================================
-- Run this migration to add missing indexes for frequently queried columns
-- =============================================================

-- Indexes for modules table
CREATE INDEX IF NOT EXISTS idx_modules_is_active ON modules(is_active);
CREATE INDEX IF NOT EXISTS idx_modules_code ON modules(code);
CREATE INDEX IF NOT EXISTS idx_modules_sort_order ON modules(sort_order);

-- Indexes for divisions table
CREATE INDEX IF NOT EXISTS idx_divisions_is_active ON divisions(is_active);
CREATE INDEX IF NOT EXISTS idx_divisions_code ON divisions(code);

-- Composite indexes for faster permission lookups (covering indexes)
CREATE INDEX IF NOT EXISTS idx_user_permissions_user_module 
  ON user_permissions(user_id, module_id);
CREATE INDEX IF NOT EXISTS idx_user_divisions_user_admin 
  ON user_divisions(user_id, is_division_admin);

-- Financial transactions - frequently filtered by date + type
CREATE INDEX IF NOT EXISTS idx_financial_transactions_date_type 
  ON financial_transactions(transaction_date, type);

-- Property sales - frequently filtered by date/status
CREATE INDEX IF NOT EXISTS idx_property_sales_date_status 
  ON property_sales(sale_date, status);

-- Properties - for count queries
CREATE INDEX IF NOT EXISTS idx_properties_status_type 
  ON properties(status, type);

-- Inventory - for low stock count queries
CREATE INDEX IF NOT EXISTS idx_inventory_quantity_min_stock 
  ON inventory(quantity, min_stock);

-- ANALYZE tables to update statistics after index creation
ANALYZE modules;
ANALYZE divisions;
ANALYZE user_permissions;
ANALYZE user_divisions;
ANALYZE financial_transactions;
ANALYZE property_sales;
ANALYZE properties;
ANALYZE inventory;
