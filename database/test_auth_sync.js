import 'dotenv/config';
import { supabaseAdmin } from '../src/config/supabase.js';
import db from '../src/config/database.js';

/**
 * ALTERNATIVE SYNC APPROACH
 * 
 * Instead of creating new auth users, this deletes the database-only users
 * and lets them re-register via the API.
 * 
 * This is safer and avoids conflicts with triggers.
 */

const TEMP_PASSWORD = 'TempPassword123!';

async function createSingleUserInAuth() {
  try {
    console.log('🧪 Testing: Creating a single test user in Supabase Auth...\n');
    
    const testEmail = 'test.sync@perum.com';
    
    // Check if exists in database
    const dbUser = await db`SELECT * FROM users WHERE email = ${testEmail} LIMIT 1`;
    
    if (dbUser.length > 0) {
      console.log(`⚠️  User ${testEmail} already exists in database. Deleting first...`);
      await db`DELETE FROM user_permissions WHERE user_id = ${dbUser[0].id}`;
      await db`DELETE FROM user_divisions WHERE user_id = ${dbUser[0].id}`;
      await db`DELETE FROM users WHERE id = ${dbUser[0].id}`;
      console.log('✅ Deleted from database\n');
    }
    
    // Try creating in Supabase Auth
    console.log('Creating in Supabase Auth...');
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email: testEmail,
      password: TEMP_PASSWORD,
      email_confirm: true,
      user_metadata: {
        name: 'Test Sync User',
        role: 'user'
      }
    });
    
    if (error) {
      console.log('❌ Supabase Auth creation failed:');
      console.log('   Error:', error.message);
      console.log('   Code:', error.code);
      console.log('   Status:', error.status);
      console.log('\nFull error object:', JSON.stringify(error, null, 2));
      
      if (error.status === 500) {
        console.log('\n⚠️  500 Error usually means:');
        console.log('   1. Database trigger is causing errors');
        console.log('   2. Auth service is down');
        console.log('   3. Permissions issue with service role key');
        console.log('\n❓ Have you installed the database triggers yet?');
        console.log('   Run the SQL in: database/06_auth_sync_trigger.sql');
      }
      
      process.exit(1);
    }
    
    console.log('✅ Created in Supabase Auth!');
    console.log('   User ID:', data.user.id);
    console.log('   Email:', data.user.email);
    
    // Check if it was synced to database via trigger
    console.log('\nChecking if trigger synced to database...');
    const syncedUser = await db`SELECT * FROM users WHERE id = ${data.user.id}`;
    
    if (syncedUser.length > 0) {
      console.log('✅ TRIGGER WORKED! User synced to database automatically!');
      console.log('   Database record:', syncedUser[0]);
    } else {
      console.log('❌ TRIGGER NOT WORKING! User NOT synced to database.');
      console.log('   Please install triggers: database/06_auth_sync_trigger.sql');
    }
    
    console.log('\n✅ Test complete! You can delete this test user if needed.');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  }
}

// Run test
createSingleUserInAuth()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
