const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixTenantStatus() {
  try {
    console.log('🔄 Fixing tenant status...');

    // Find all verified admin users
    const verifiedAdmins = await prisma.user.findMany({
      where: {
        isVerified: true,
        role: 'admin'
      },
      include: {
        tenant: true
      }
    });

    console.log(`\n📊 Found ${verifiedAdmins.length} verified admin users`);

    // Update their tenants to active status
    for (const admin of verifiedAdmins) {
      if (admin.tenant.status === 'pending') {
        await prisma.tenant.update({
          where: { id: admin.tenant.id },
          data: { status: 'active' }
        });
        console.log(`✅ Updated tenant status for ${admin.tenant.companyName} to active`);
      } else {
        console.log(`ℹ️ Tenant ${admin.tenant.companyName} already ${admin.tenant.status}`);
      }
    }

    console.log('\n✨ Tenant status update complete!');

  } catch (error) {
    console.error('❌ Error fixing tenant status:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixTenantStatus();
