const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkUsers() {
  try {
    console.log('🔍 Checking user verification status...');

    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        isVerified: true,
        verificationToken: true,
        verificationExpires: true,
        role: true,
        tenant: {
          select: {
            companyName: true,
            status: true
          }
        }
      }
    });

    console.log('\n📊 Users in database:', users.length);
    
    users.forEach(user => {
      console.log(`\n👤 User: ${user.email}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Verified: ${user.isVerified}`);
      console.log(`   Company: ${user.tenant.companyName}`);
      console.log(`   Tenant Status: ${user.tenant.status}`);
      if (user.verificationToken) {
        console.log(`   Verification URL: http://localhost:3000/verify-email?token=${user.verificationToken}`);
        console.log(`   Expires: ${user.verificationExpires}`);
      }
    });

  } catch (error) {
    console.error('❌ Error checking users:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUsers();
