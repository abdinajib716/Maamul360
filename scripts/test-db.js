const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testConnection() {
  try {
    // Test the connection by attempting to query the database
    const result = await prisma.$queryRaw`SELECT 1+1 as result`
    console.log('✅ Database connection successful!')
    console.log('Test query result:', result)
  } catch (error) {
    console.error('❌ Database connection failed:')
    console.error(error)
  } finally {
    await prisma.$disconnect()
  }
}

testConnection()
