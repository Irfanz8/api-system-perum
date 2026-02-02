import 'dotenv/config';
import { supabaseAdmin } from '../src/config/supabase.js';
import db from '../src/config/database.js';

/**
 * Smart User Sync - Handles existing users
 * 
 * Strategy:
 * 1. Check if user already exists in auth by email
 * 2. If exists, get their auth ID and update database ID to match
 * 3. If not exists, create new auth user
 */

const DEFAULT_PASSWORD = 'TempPassword123!';

async function smartSync() {
  try {
    console.log('🔄 Starting smart user sync process...\n');
    
    // Find users that don't have matching auth accounts by ID
    const unsyncedUsers = await db`
      SELECT u.id as db_id, u.email, u.username, u.role 
      FROM users u
      ORDER BY u.email
    `;
    
    if (unsyncedUsers.length === 0) {
      console.log('✅ All users are already synced!');
      return;
    }
    
    console.log(`Found ${unsyncedUsers.length} users to check:\n`);
    
    let created = 0;
    let alreadyExists = 0;
    let updated = 0;
    let failed = 0;
    const errors = [];
    
    for (const user of unsyncedUsers) {
      console.log(`Checking: ${user.email}...`);
      
      try {
        // First, try to get user by email from auth
        const { data: listData, error: listError } = await supabaseAdmin.auth.admin.listUsers();
        
        if (listError) {
          console.log(`  ⚠️  Cannot list users: ${listError.message}`);
          failed++;
          errors.push({ email: user.email, error: listError.message });
          continue;
        }
        
        // Find if this email already exists in auth
        const existingAuthUser = listData.users.find(u => u.email === user.email);
        
        if (existingAuthUser) {
          console.log(`  📧 Already exists in auth with ID: ${existingAuthUser.id}`);
          
          // Check if IDs match
          if (existingAuthUser.id === user.db_id) {
            console.log(`  ✅ IDs match! No action needed.`);
            alreadyExists++;
          } else {
            console.log(`  🔄 ID mismatch! Updating database...`);
            console.log(`     DB ID: ${user.db_id} → Auth ID: ${existingAuthUser.id}`);
            
            // Update database ID to match auth ID
            try {
              // Update user_permissions
              await db`
                UPDATE user_permissions 
                SET user_id = ${existingAuthUser.id} 
                WHERE user_id = ${user.db_id}
              `;
              
              // Update user_divisions
              await db`
                UPDATE user_divisions 
                SET user_id = ${existingAuthUser.id} 
                WHERE user_id = ${user.db_id}
              `;
              
              // Delete old user record
              await db`DELETE FROM users WHERE id = ${user.db_id}`;
              
              // Insert with correct ID
              await db`
                INSERT INTO users (id, username, email, password_hash, role, is_active)
                VALUES (${existingAuthUser.id}, ${user.username}, ${user.email}, NULL, ${user.role}, true)
                ON CONFLICT (id) DO UPDATE SET
                  username = EXCLUDED.username,
                  email = EXCLUDED.email,
                  role = EXCLUDED.role
              `;
              
              console.log(`  ✅ Database updated successfully!`);
              updated++;
            } catch (dbError) {
              console.log(`  ❌ Database update failed: ${dbError.message}`);
              failed++;
              errors.push({ email: user.email, error: dbError.message });
            }
          }
        } else {
          // User doesn't exist in auth, create it
          console.log(`  ➕ Creating new auth account...`);
          
          const { data: createData, error: createError } = await supabaseAdmin.auth.admin.createUser({
            email: user.email,
            password: DEFAULT_PASSWORD,
            email_confirm: true,
            user_metadata: {
              name: user.username,
              role: user.role
            }
          });
          
          if (createError) {
            console.log(`  ❌ Failed: ${createError.message}`);
            failed++;
            errors.push({ email: user.email, error: createError.message });
            continue;
          }
          
          console.log(`  ✅ Created! Auth ID: ${createData.user.id}`);
          
          // Trigger should have synced, but check for ID mismatch
          if (createData.user.id !== user.db_id) {
            console.log(`  🔄 Updating database with new ID...`);
            
            // Update foreign keys and user record
            await db`UPDATE user_permissions SET user_id = ${createData.user.id} WHERE user_id = ${user.db_id}`;
            await db`UPDATE user_divisions SET user_id = ${createData.user.id} WHERE user_id = ${user.db_id}`;
            await db`DELETE FROM users WHERE id = ${user.db_id}`;
            
            console.log(`  ✅ Database synced!`);
          }
          
          created++;
        }
        
      } catch (err) {
        console.log(`  ❌ Error: ${err.message}`);
        failed++;
        errors.push({ email: user.email, error: err.message });
      }
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('📊 Sync Summary:');
    console.log(`  Total users processed: ${unsyncedUsers.length}`);
    console.log(`  ✅ Created new: ${created}`);
    console.log(`  ℹ️  Already existed: ${alreadyExists}`);
    console.log(`  🔄 Updated IDs: ${updated}`);
    console.log(`  ❌ Failed: ${failed}`);
    
    if (errors.length > 0) {
      console.log('\n❌ Errors:');
      errors.forEach(e => {
        console.log(`  - ${e.email}: ${e.error}`);
      });
    }
    
    if (created > 0) {
      console.log('\n⚠️  IMPORTANT:');
      console.log(`  ${created} users created with temporary password: ${DEFAULT_PASSWORD}`);
      console.log('  They should reset their password on first login.\n');
    }
    
  } catch (error) {
    console.error('❌ Sync process failed:', error);
    process.exit(1);
  }
}

// Run the sync
smartSync()
  .then(() => {
    console.log('✅ Sync process completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });
