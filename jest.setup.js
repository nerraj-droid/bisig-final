require('dotenv').config({ path: '.env.test' })

// Increase timeout for tests
jest.setTimeout(30000)

// Clean up database after all tests
afterAll(async () => {
    const { prisma } = require('@/lib/prisma')
    await prisma.$disconnect()
}) 