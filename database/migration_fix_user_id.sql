-- Migration script untuk memperbaiki tipe data created_by dari INTEGER ke UUID
-- Jalankan script ini jika tabel sudah ada sebelumnya

-- Drop foreign key constraints terlebih dahulu
ALTER TABLE IF EXISTS financial_transactions DROP CONSTRAINT IF EXISTS financial_transactions_created_by_fkey;
ALTER TABLE IF EXISTS inventory_transactions DROP CONSTRAINT IF EXISTS inventory_transactions_created_by_fkey;
ALTER TABLE IF EXISTS property_sales DROP CONSTRAINT IF EXISTS property_sales_created_by_fkey;

-- Ubah tipe data kolom created_by dari INTEGER ke UUID
ALTER TABLE IF EXISTS financial_transactions ALTER COLUMN created_by TYPE UUID USING created_by::text::uuid;
ALTER TABLE IF EXISTS inventory_transactions ALTER COLUMN created_by TYPE UUID USING created_by::text::uuid;
ALTER TABLE IF EXISTS property_sales ALTER COLUMN created_by TYPE UUID USING created_by::text::uuid;

-- Tambahkan kembali foreign key constraints
ALTER TABLE IF EXISTS financial_transactions 
    ADD CONSTRAINT financial_transactions_created_by_fkey 
    FOREIGN KEY (created_by) REFERENCES users(id);

ALTER TABLE IF EXISTS inventory_transactions 
    ADD CONSTRAINT inventory_transactions_created_by_fkey 
    FOREIGN KEY (created_by) REFERENCES users(id);

ALTER TABLE IF EXISTS property_sales 
    ADD CONSTRAINT property_sales_created_by_fkey 
    FOREIGN KEY (created_by) REFERENCES users(id);