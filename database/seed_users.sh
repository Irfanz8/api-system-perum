#!/bin/bash

# =============================================================
# SEED USERS via API
# Script untuk membuat users melalui endpoint /api/auth/signup
# =============================================================

API_URL="${1:-https://web-production-bd9e5.up.railway.app}"
PASSWORD="Password123!"

echo "🚀 Creating users via API: $API_URL"
echo "================================================"

# Function to create user
create_user() {
  local email=$1
  local name=$2
  local role=$3
  
  echo "Creating user: $email ($role)..."
  
  response=$(curl -s -X POST "$API_URL/api/auth/signup" \
    -H "Content-Type: application/json" \
    -d "{\"email\": \"$email\", \"password\": \"$PASSWORD\", \"name\": \"$name\", \"role\": \"$role\"}")
  
  echo "Response: $response"
  echo ""
}

# =============================================================
# CREATE USERS
# =============================================================

# Superadmin
create_user "superadmin@perumahan.com" "Super Admin" "superadmin"

# Admin per divisi
create_user "admin.keuangan@perumahan.com" "Admin Keuangan" "admin"
create_user "admin.properti@perumahan.com" "Admin Properti" "admin"
create_user "admin.penjualan@perumahan.com" "Admin Penjualan" "admin"
create_user "admin.gudang@perumahan.com" "Admin Gudang" "admin"

# Staff per divisi
create_user "staff.keuangan@perumahan.com" "Staff Keuangan" "user"
create_user "staff.properti@perumahan.com" "Staff Properti" "user"
create_user "staff.penjualan@perumahan.com" "Staff Penjualan" "user"
create_user "staff.gudang@perumahan.com" "Staff Gudang" "user"

echo "================================================"
echo "✅ Done creating users!"
echo ""
echo "📝 Next steps:"
echo "1. Go to Supabase Dashboard → Authentication → Users"
echo "2. Copy each user's UUID"
echo "3. Run the assign_divisions.sql script with the real UUIDs"
