import 'dotenv/config';
import { supabaseAdmin } from '../src/config/supabase.js';
import db from '../src/config/database.js';

/**
 * Create Division Users & Admins properly via Supabase Auth
 * This ensures they sync correctly with the database via triggers
 */

const DEFAULT_PASSWORD = 'Password123!';

// Division users to create
const DIVISION_USERS = [
  // Division Admins
  { email: 'admin.keuangan@perum.com', name: 'Admin Keuangan', role: 'user', division: 'KEU', isAdmin: true },
  { email: 'admin.properti@perum.com', name: 'Admin Properti', role: 'user', division: 'PROP', isAdmin: true },
  { email: 'admin.penjualan@perum.com', name: 'Admin Penjualan', role: 'user', division: 'SALES', isAdmin: true },
  { email: 'admin.gudang@perum.com', name: 'Admin Gudang', role: 'user', division: 'WH', isAdmin: true },
  { email: 'admin.sistem@perum.com', name: 'Admin Sistem', role: 'user', division: 'ADM', isAdmin: true },
  
  // Team Members - Keuangan
  { email: 'budi.santoso@perum.com', name: 'Budi Santoso', role: 'user', division: 'KEU', isAdmin: false },
  { email: 'siti.aminah@perum.com', name: 'Siti Aminah', role: 'user', division: 'KEU', isAdmin: false },
  { email: 'ahmad.fauzi@perum.com', name: 'Ahmad Fauzi', role: 'user', division: 'KEU', isAdmin: false },
  
  // Team Members - Properti
  { email: 'dewi.lestari@perum.com', name: 'Dewi Lestari', role: 'user', division: 'PROP', isAdmin: false },
  { email: 'eko.prasetyo@perum.com', name: 'Eko Prasetyo', role: 'user', division: 'PROP', isAdmin: false },
  { email: 'fitri.handayani@perum.com', name: 'Fitri Handayani', role: 'user', division: 'PROP', isAdmin: false },
  
  // Team Members - Penjualan
  { email: 'gita.permata@perum.com', name: 'Gita Permata', role: 'user', division: 'SALES', isAdmin: false },
  { email: 'hendra.wijaya@perum.com', name: 'Hendra Wijaya', role: 'user', division: 'SALES', isAdmin: false },
  { email: 'indah.sari@perum.com', name: 'Indah Sari', role: 'user', division: 'SALES', isAdmin: false },
  { email: 'joko.susilo@perum.com', name: 'Joko Susilo', role: 'user', division: 'SALES', isAdmin: false },
  
  // Team Members - Gudang
  { email: 'kurnia.sari@perum.com', name: 'Kurnia Sari', role: 'user', division: 'WH', isAdmin: false },
  { email: 'lukman.hakim@perum.com', name: 'Lukman Hakim', role: 'user', division: 'WH', isAdmin: false },
  { email: 'maya.sari@perum.com', name: 'Maya Sari', role: 'user', division: 'WH', isAdmin: false },
  
  // Team Members - Admin/Sistem
  { email: 'nina.marlina@perum.com', name: 'Nina Marlina', role: 'user', division: 'ADM', isAdmin: false },
  { email: 'omar.bakri@perum.com', name: 'Omar Bakri', role: 'user', division: 'ADM', isAdmin: false },
];

async function createDivisionUsers() {
  try {
    console.log('🚀 Creating Division Users via Supabase Auth...\n');
    console.log(`Total users to create: ${DIVISION_USERS.length}\n`);
    
    let created = 0;
    let skipped = 0;
    let failed = 0;
    const errors = [];
    
    for (const userData of DIVISION_USERS) {
      console.log(`Creating: ${userData.email} (${userData.division} ${userData.isAdmin ? 'Admin' : 'Member'})...`);
      
      try {
        // Create user in Supabase Auth
        const { data, error } = await supabaseAdmin.auth.admin.createUser({
          email: userData.email,
          password: DEFAULT_PASSWORD,
          email_confirm: true,
          user_metadata: {
            name: userData.name,
            role: userData.role
          }
        });
        
        if (error) {
          if (error.message.includes('already registered')) {
            console.log(`  ⏭️  Already exists, skipping`);
            skipped++;
          } else {
            console.log(`  ❌ Failed: ${error.message}`);
            failed++;
            errors.push({ email: userData.email, error: error.message });
          }
          continue;
        }
        
        console.log(`  ✅ Created! ID: ${data.user.id.substring(0, 8)}...`);
        created++;
        
        // Wait a bit for trigger to sync
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Get division ID
        const divisions = await db`SELECT id FROM divisions WHERE code = ${userData.division}`;
        if (divisions.length === 0) {
          console.log(`  ⚠️  Division ${userData.division} not found, skipping assignment`);
          continue;
        }
        
        const divisionId = divisions[0].id;
        
        // Assign to division
        await db`
          INSERT INTO user_divisions (user_id, division_id, is_division_admin)
          VALUES (${data.user.id}, ${divisionId}, ${userData.isAdmin})
          ON CONFLICT (user_id, division_id) 
          DO UPDATE SET is_division_admin = ${userData.isAdmin}
        `;
        
        console.log(`  📂 Assigned to division ${userData.division}${userData.isAdmin ? ' as admin' : ''}`);
        
        // Grant permissions based on division and admin status
        const modules = await db`SELECT id, code FROM modules WHERE is_active = true`;
        
        for (const module of modules) {
          let canView = false, canCreate = false, canUpdate = false, canDelete = false;
          
          if (userData.isAdmin) {
            // Division admins get full access to their module
            if (
              (userData.division === 'KEU' && module.code === 'keuangan') ||
              (userData.division === 'PROP' && module.code === 'properti') ||
              (userData.division === 'SALES' && module.code === 'penjualan') ||
              (userData.division === 'WH' && module.code === 'persediaan') ||
              (userData.division === 'ADM' && ['users', 'divisions'].includes(module.code))
            ) {
              canView = canCreate = canUpdate = canDelete = true;
            }
            
            // All admins can view dashboard and reports
            if (['dashboard', 'reports'].includes(module.code)) {
              canView = true;
            }
            
            // System admin can view roles
            if (userData.division === 'ADM' && module.code === 'roles') {
              canView = true;
            }
          } else {
            // Regular users get view access to their division's module
            if (
              (userData.division === 'KEU' && module.code === 'keuangan') ||
              (userData.division === 'PROP' && module.code === 'properti') ||
              (userData.division === 'SALES' && module.code === 'penjualan') ||
              (userData.division === 'WH' && module.code === 'persediaan')
            ) {
              canView = true;
            }
            
            // All users can view dashboard
            if (module.code === 'dashboard') {
              canView = true;
            }
          }
          
          if (canView || canCreate || canUpdate || canDelete) {
            await db`
              INSERT INTO user_permissions (user_id, module_id, can_view, can_create, can_update, can_delete)
              VALUES (${data.user.id}, ${module.id}, ${canView}, ${canCreate}, ${canUpdate}, ${canDelete})
              ON CONFLICT (user_id, module_id) 
              DO UPDATE SET
                can_view = ${canView},
                can_create = ${canCreate},
                can_update = ${canUpdate},
                can_delete = ${canDelete}
            `;
          }
        }
        
        console.log(`  🔐 Permissions granted`);
        
      } catch (err) {
        console.log(`  ❌ Error: ${err.message}`);
        failed++;
        errors.push({ email: userData.email, error: err.message });
      }
      
      console.log('');
    }
    
    console.log('='.repeat(60));
    console.log('📊 Summary:');
    console.log(`  ✅ Created: ${created}`);
    console.log(`  ⏭️  Skipped (already exists): ${skipped}`);
    console.log(`  ❌ Failed: ${failed}`);
    
    if (errors.length > 0) {
      console.log('\n❌ Errors:');
      errors.forEach(e => console.log(`  - ${e.email}: ${e.error}`));
    }
    
    console.log('\n📝 Credentials:');
    console.log(`  Email: [any user above]`);
    console.log(`  Password: ${DEFAULT_PASSWORD}`);
    console.log('\n✅ All users are synced between Supabase Auth and Database!');
    
  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
}

// Run
createDivisionUsers()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
