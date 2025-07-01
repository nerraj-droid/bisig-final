import { prisma } from '@/lib/prisma'
import { Gender, CivilStatus, Role, Status, CertificateType, HouseholdType, BlotterCaseStatus } from '@prisma/client'

// Database cleanup utility
export async function cleanupDatabase() {
    const tablenames = await prisma.$queryRaw<Array<{ tablename: string }>>`
    SELECT tablename FROM pg_tables WHERE schemaname='public'
  `

    const tables = tablenames
        .map(({ tablename }) => tablename)
        .filter(name => name !== '_prisma_migrations')
        .map(name => `"public"."${name}"`)
        .join(', ')

    try {
        await prisma.$executeRawUnsafe(`TRUNCATE TABLE ${tables} CASCADE;`)
    } catch (error) {
        console.log({ error })
    }
}

// Test data factories
export const createTestUser = async (overrides = {}) => {
    return await prisma.user.create({
        data: {
            id: 'test-user-id',
            email: 'test@example.com',
            name: 'Test User',
            password: 'test-password',
            role: Role.SUPER_ADMIN,
            status: Status.ACTIVE,
            updatedAt: new Date(),
            ...overrides,
        },
    })
}

export const createTestResident = async (overrides = {}) => {
    return await prisma.resident.create({
        data: {
            id: 'test-resident-id',
            firstName: 'John',
            middleName: 'Middle',
            lastName: 'Doe',
            birthDate: new Date('1990-01-01'),
            gender: Gender.MALE,
            civilStatus: CivilStatus.SINGLE,
            contactNo: '09123456789',
            email: 'john.doe@example.com',
            occupation: 'Engineer',
            address: '123 Test Street',
            updatedAt: new Date(),
            ...overrides,
        },
    })
}

export const createTestHousehold = async (overrides = {}) => {
    return await prisma.household.create({
        data: {
            id: 'test-household-id',
            houseNo: '001',
            street: 'Test Street',
            barangay: 'Test Barangay',
            city: 'Test City',
            province: 'Test Province',
            zipCode: '1234',
            type: HouseholdType.SINGLE_FAMILY,
            updatedAt: new Date(),
            ...overrides,
        },
    })
}

export const createTestCertificate = async (residentId: string, overrides = {}) => {
    // First create an official if not exists
    let official = await prisma.officials.findFirst()
    if (!official) {
        official = await prisma.officials.create({
            data: {
                id: 'test-official-id',
                punongBarangay: 'Test Captain',
                secretary: 'Test Secretary',
                treasurer: 'Test Treasurer',
            }
        })
    }

    return await prisma.certificate.create({
        data: {
            id: 'test-certificate-id',
            controlNumber: 'CLR-20240101-000001',
            type: CertificateType.CLEARANCE,
            status: 'PENDING',
            purpose: 'Test Purpose',
            residentId,
            officialId: official.id,
            updatedAt: new Date(),
            ...overrides,
        },
    })
}

export const createTestCouncilMember = async (overrides = {}) => {
    return await prisma.councilMember.create({
        data: {
            name: 'Test Official',
            position: 'Barangay Captain',
            order: 1,
            ...overrides,
        },
    })
}

export const createTestBlotter = async (residentId: string, overrides = {}) => {
    return await prisma.blotterCase.create({
        data: {
            id: 'test-blotter-id',
            caseNumber: 'BLT-2024-001',
            incidentDate: new Date(),
            incidentLocation: 'Test Location',
            incidentType: 'Complaint',
            incidentDescription: 'Test blotter case',
            status: BlotterCaseStatus.PENDING,
            ...overrides,
        },
    })
}

// API test helpers
export const createMockRequest = (method: string, url: string, body?: any, query?: any) => {
    const req = {
        method,
        url,
        headers: {},
        json: jest.fn().mockResolvedValue(body || {}),
        nextUrl: {
            searchParams: new URLSearchParams(query || {}),
        },
    }
    return req
}

export const createMockResponse = () => {
    const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
        end: jest.fn().mockReturnThis(),
    }
    return res
}

// Assertion helpers
export const expectValidResident = (resident: any) => {
    expect(resident).toHaveProperty('id')
    expect(resident).toHaveProperty('firstName')
    expect(resident).toHaveProperty('lastName')
    expect(resident).toHaveProperty('birthDate')
    expect(resident).toHaveProperty('gender')
    expect(resident).toHaveProperty('civilStatus')
}

export const expectValidHousehold = (household: any) => {
    expect(household).toHaveProperty('id')
    expect(household).toHaveProperty('householdNumber')
    expect(household).toHaveProperty('type')
    expect(household).toHaveProperty('barangay')
    expect(household).toHaveProperty('totalMembers')
}

export const expectValidCertificate = (certificate: any) => {
    expect(certificate).toHaveProperty('id')
    expect(certificate).toHaveProperty('controlNumber')
    expect(certificate).toHaveProperty('type')
    expect(certificate).toHaveProperty('status')
    expect(certificate).toHaveProperty('residentId')
}

// Database state helpers
export const getResidentCount = async () => {
    return await prisma.resident.count()
}

export const getHouseholdCount = async () => {
    return await prisma.household.count()
}

export const getCertificateCount = async () => {
    return await prisma.certificate.count()
}

// Test data validation
export const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
}

export const isValidPhoneNumber = (phone: string) => {
    const phoneRegex = /^(\+63|0)[0-9]{10}$/
    return phoneRegex.test(phone)
}

export const isValidControlNumber = (controlNumber: string) => {
    const controlRegex = /^[A-Z]{3}-\d{8}-\d{6}$/
    return controlRegex.test(controlNumber)
} 