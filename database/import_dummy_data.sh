#!/bin/bash

# Script untuk import dummy data ke database
# Usage: ./database/import_dummy_data.sh

echo "🚀 Importing dummy data to database..."

# Cek apakah DATABASE_URL sudah di-set
if [ -z "$DATABASE_URL" ]; then
    echo "❌ Error: DATABASE_URL environment variable not set"
    echo "Set DATABASE_URL first:"
    echo "  export DATABASE_URL='postgresql://user:pass@host:port/dbname'"
    exit 1
fi

# Import dummy data
echo "📥 Importing dummy_data.sql..."
psql $DATABASE_URL < database/dummy_data.sql

if [ $? -eq 0 ]; then
    echo "✅ Dummy data imported successfully!"
    echo ""
    echo "📊 Verifying data..."
    psql $DATABASE_URL -c "
    SELECT 
      (SELECT COUNT(*) FROM users) as users,
      (SELECT COUNT(*) FROM properties) as properties,
      (SELECT COUNT(*) FROM financial_transactions) as transactions,
      (SELECT COUNT(*) FROM inventory) as inventory_items,
      (SELECT COUNT(*) FROM inventory_transactions) as inventory_transactions,
      (SELECT COUNT(*) FROM property_sales) as sales;
    "
else
    echo "❌ Error importing dummy data"
    exit 1
fi