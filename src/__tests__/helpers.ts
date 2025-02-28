import { prisma } from '@/lib/prisma'
import { Role } from '@prisma/client'

export const createTestUser = async (role: Role = 'SUPER_ADMIN') => {
    return prisma.user.create({
        data: {
            email: `test-${Date.now()}@example.com`,
            name: 'Test User',
            role,
            password: 'test-password',
        },
    })
}

export const cleanupDatabase = async () => {
    try {
        // Delete all records from each table
        await prisma.resident.deleteMany()
        await prisma.household.deleteMany()
        await prisma.user.deleteMany()
    } catch (error) {
        console.log('Error cleaning up database:', error)
    }
}

export const createTestSession = async (role: Role = 'SUPER_ADMIN') => {
    const user = await createTestUser(role)
    return {
        user: {
            email: user.email,
            name: user.name,
            role: user.role,
        },
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    }
}

export const getAuthorizationHeader = async (role: Role = 'SUPER_ADMIN') => {
    const session = await createTestSession(role)
    return {
        headers: {
            'x-test-session': JSON.stringify(session),
        },
    }
} 