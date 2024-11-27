const { execSync } = require('child_process');
const path = require('path');

async function syncDatabase() {
  try {
    console.log('🔄 Starting database sync...');

    // Run prisma generate
    console.log('\n📦 Generating Prisma Client...');
    execSync('npx prisma generate', { stdio: 'inherit' });

    // Run prisma db push
    console.log('\n⬆️ Pushing schema to database...');
    execSync('npx prisma db push', { stdio: 'inherit' });

    console.log('\n✅ Database sync completed successfully!');
    
    // Run the test script to verify
    console.log('\n🔍 Testing connection...');
    require('./test-db');

  } catch (error) {
    console.error('\n❌ Error during database sync:', error);
    process.exit(1);
  }
}

// Run the sync
syncDatabase();
