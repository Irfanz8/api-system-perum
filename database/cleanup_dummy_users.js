import 'dotenv/config';
import db from '../src/config/database.js';

/**
 * Clean up dummy/seed users that can't be synced to Supabase Auth
 * 
 * These users were created by seed scripts and don't have real auth accounts.
 * Since they're failing to sync, we'll remove them to keep the database clean.
 */

async function cleanupDummyUsers() {
  try {
    console.log('🧹 Cleaning up dummy/seed users...\n');
    
    const dummyEmails = [
      'admin.gudang@perum.com',
      'admin.keuangan@perum.com',
      'admin.penjualan@perum.com',
      'admin.properti@perum.com',
      'admin.sistem@perum.com',
      'ahmad.fauzi@perum.com',
      'budi.santoso@perum.com',
      'dewi.lestari@perum.com',
      'eko.prasetyo@perum.com',
      'fitri.handayani@perum.com',
      'gita.permata@perum.com',
      'hendra.wijaya@perum.com',
      'indah.sari@perum.com',
      'joko.susilo@perum.com',
      'kurnia.sari@perum.com',
      'lukman.hakim@perum.com',
      'maya.sari@perum.com',
      'nina.marlina@perum.com',
      'omar.bakri@perum.com',
      'siti.aminah@perum.com'
    ];
    
    let deletedCount = 0;
    
    for (const email of dummyEmails) {
      // Get user ID first
      const user = await db`SELECT id FROM users WHERE email = ${email}`;
      
      if (user.length === 0) {
        console.log(`⏭️  ${email} - not found, skipping`);
        continue;
      }
      
      const userId = user[0].id;
      console.log(`🗑️  Deleting ${email}...`);
      
      // Delete related records first
      await db`DELETE FROM user_permissions WHERE user_id = ${userId}`;
      await db`DELETE FROM user_divisions WHERE user_id = ${userId}`;
      await db`DELETE FROM users WHERE id = ${userId}`;
      
      console.log(`   ✅ Deleted`);
      deletedCount++;
    }
    
    console.log('\n' + '='.repeat(60));
    console.log(`✅ Cleanup complete! Deleted ${deletedCount} dummy users.`);
    console.log('\n💡 These were seed/test users that couldn\'t be synced to Supabase Auth.');
    console.log('   Real users (with @perumahan.com and @gmail.com) are unaffected.\n');
    
  } catch (error) {
    console.error('❌ Cleanup failed:', error);
    process.exit(1);
  }
}

// Run cleanup
cleanupDummyUsers()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
