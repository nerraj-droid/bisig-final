// Jest setup for BISIG testing suite
const { config } = require('dotenv')

// Load test environment variables
config({ path: '.env.test' })

// Mock NextAuth for all tests
jest.mock('next-auth', () => ({
    __esModule: true,
    default: jest.fn(() => null),
    getServerSession: jest.fn(() => ({
        user: {
            id: 'test-user-id',
            email: 'test@example.com',
            name: 'Test User',
            role: 'SUPER_ADMIN',
            status: 'ACTIVE',
        }
    }))
}))

// Mock NextAuth options
jest.mock('@/lib/auth', () => ({
    authOptions: {
        providers: [],
        session: { strategy: 'jwt' },
        callbacks: {
            jwt: jest.fn(),
            session: jest.fn(),
        }
    }
}))

// Mock file uploads
jest.mock('fs', () => ({
    ...jest.requireActual('fs'),
    writeFileSync: jest.fn(),
    unlinkSync: jest.fn(),
    existsSync: jest.fn(() => true),
}))

// Mock image processing
jest.mock('sharp', () => jest.fn(() => ({
    resize: jest.fn().mockReturnThis(),
    jpeg: jest.fn().mockReturnThis(),
    toBuffer: jest.fn().mockResolvedValue(Buffer.from('test')),
})))

// Set test timeout
jest.setTimeout(30000)

// Global test setup
beforeAll(() => {
    console.log('🧪 Starting BISIG Test Suite')
})

afterAll(() => {
    console.log('✅ BISIG Test Suite Completed')
}) 