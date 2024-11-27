const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testConnection() {
  try {
    console.log('🔄 Testing database connection...');

    // Test raw query to verify connection
    const result = await prisma.$queryRaw`SELECT 1 as connected`;
    
    if (result[0].connected === 1) {
      console.log('✅ Database connection successful!');
      
      // Get database information
      const tables = await prisma.$queryRaw`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
      `;
      
      console.log('\n📊 Database Tables:');
      tables.forEach(table => {
        console.log(`- ${table.table_name}`);
      });

      // Show current database URL (hiding password)
      const dbUrl = process.env.DATABASE_URL || 'Not set';
      const maskedUrl = dbUrl.replace(/\/\/.*?@/, '//****:****@');
      console.log(`\n🔌 Connected to: ${maskedUrl}`);
    }
  } catch (error) {
    console.error('\n❌ Database connection failed:');
    console.error(error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testConnection();
