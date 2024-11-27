const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function resetDatabase() {
  try {
    console.log('🔄 Starting database reset...');

    // Delete all records from tables in reverse order of dependencies
    console.log('Deleting existing records...');
    
    await prisma.$transaction([
      // First, delete user-related data
      prisma.user.deleteMany({}),
      
      // Then delete tenant data
      prisma.tenant.deleteMany({}),
    ]);

    console.log('✅ Database reset successful!');

    // Test connection and show tables
    const tableCount = await prisma.$queryRaw`
      SELECT COUNT(*) as count 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;
    
    console.log(`📊 Number of tables in database: ${tableCount[0].count}`);
    
    // Show current database URL (hiding password)
    const dbUrl = process.env.DATABASE_URL || 'Not set';
    const maskedUrl = dbUrl.replace(/\/\/.*?@/, '//****:****@');
    console.log(`🔌 Connected to database: ${maskedUrl}`);

  } catch (error) {
    console.error('❌ Error during database reset:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the reset
resetDatabase();
