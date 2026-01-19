-- Update schema untuk allow NULL pada created_by
-- Jalankan script ini jika kolom created_by belum bisa NULL

-- Update financial_transactions
ALTER TABLE financial_transactions 
ALTER COLUMN created_by DROP NOT NULL;

-- Update inventory_transactions  
ALTER TABLE inventory_transactions
ALTER COLUMN created_by DROP NOT NULL;

-- Update property_sales
ALTER TABLE property_sales
ALTER COLUMN created_by DROP NOT NULL;