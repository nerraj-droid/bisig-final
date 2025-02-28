import { prisma } from '@/lib/prisma'
import { cleanupDatabase } from './helpers'
import { createMocks } from 'node-mocks-http'
import { GET, POST } from '@/app/api/residents/route'
import { GET as GET_ONE, PATCH, DELETE } from '@/app/api/residents/[residentId]/route'
import { Gender, CivilStatus, Role, Status } from '@prisma/client'

// Mock NextAuth
jest.mock('next-auth', () => ({
    __esModule: true,
    default: jest.fn(() => null),
    getServerSession: jest.fn(() => ({
        user: {
            email: 'test@example.com',
            name: 'Test User',
            role: Role.SUPER_ADMIN,
            status: Status.ACTIVE,
        }
    }))
}))

describe('Residents API', () => {
    beforeEach(async () => {
        await cleanupDatabase()
    })

    afterAll(async () => {
        await cleanupDatabase()
        await prisma.$disconnect()
    })

    const mockResident = {
        firstName: 'John',
        middleName: 'Doe',
        lastName: 'Smith',
        birthDate: '1990-01-01',
        gender: Gender.MALE,
        civilStatus: CivilStatus.SINGLE,
        contactNo: '1234567890',
        email: 'john@example.com',
        occupation: 'Engineer',
        address: '123 Test St',
    }

    describe('POST /api/residents', () => {
        it('should create a new resident', async () => {
            const { req, res } = createMocks({
                method: 'POST',
                url: '/api/residents',
            })

            // Mock the json method
            req.json = jest.fn().mockResolvedValue(mockResident)

            const response = await POST(req)
            const data = await response.json()

            expect(response.status).toBe(200)
            expect(data).toMatchObject({
                ...mockResident,
                birthDate: expect.any(String),
            })
        })
    })

    describe('GET /api/residents', () => {
        it('should return all residents', async () => {
            // Create a test resident first
            const resident = await prisma.resident.create({
                data: {
                    ...mockResident,
                    birthDate: new Date(mockResident.birthDate),
                },
            })

            const { req, res } = createMocks({
                method: 'GET',
                url: '/api/residents',
            })

            const response = await GET(req)
            const data = await response.json()

            expect(response.status).toBe(200)
            expect(Array.isArray(data)).toBe(true)
            expect(data.length).toBeGreaterThan(0)
            expect(data[0]).toMatchObject({
                firstName: mockResident.firstName,
                lastName: mockResident.lastName,
            })
        })

        it('should filter residents by search query', async () => {
            // Create test residents
            await prisma.resident.create({
                data: {
                    ...mockResident,
                    birthDate: new Date(mockResident.birthDate),
                },
            })

            const { req, res } = createMocks({
                method: 'GET',
                url: '/api/residents?search=John',
            })

            const response = await GET(req)
            const data = await response.json()

            expect(response.status).toBe(200)
            expect(Array.isArray(data)).toBe(true)
            expect(data.length).toBeGreaterThan(0)
            expect(data.every((r: any) =>
                r.firstName.includes('John') || r.lastName.includes('John')
            )).toBe(true)
        })
    })

    describe('GET /api/residents/[residentId]', () => {
        it('should return a specific resident', async () => {
            const resident = await prisma.resident.create({
                data: {
                    ...mockResident,
                    birthDate: new Date(mockResident.birthDate),
                },
            })

            const { req, res } = createMocks({
                method: 'GET',
                url: `/api/residents/${resident.id}`,
                query: {
                    residentId: resident.id,
                },
            })

            const response = await GET_ONE(req, { params: { residentId: resident.id } })
            const data = await response.json()

            expect(response.status).toBe(200)
            expect(data).toMatchObject({
                id: resident.id,
                firstName: mockResident.firstName,
                lastName: mockResident.lastName,
            })
        })
    })

    describe('PATCH /api/residents/[residentId]', () => {
        it('should update a resident', async () => {
            const resident = await prisma.resident.create({
                data: {
                    ...mockResident,
                    birthDate: new Date(mockResident.birthDate),
                },
            })

            const updates = {
                firstName: 'Jane',
                occupation: 'Developer',
            }

            const { req, res } = createMocks({
                method: 'PATCH',
                url: `/api/residents/${resident.id}`,
                query: {
                    residentId: resident.id,
                },
            })

            // Mock the json method
            req.json = jest.fn().mockResolvedValue({
                ...mockResident,
                ...updates,
            })

            const response = await PATCH(req, { params: { residentId: resident.id } })
            const data = await response.json()

            expect(response.status).toBe(200)
            expect(data).toMatchObject({
                id: resident.id,
                ...updates,
            })
        })
    })

    describe('DELETE /api/residents/[residentId]', () => {
        it('should delete a resident', async () => {
            const resident = await prisma.resident.create({
                data: {
                    ...mockResident,
                    birthDate: new Date(mockResident.birthDate),
                },
            })

            const { req, res } = createMocks({
                method: 'DELETE',
                url: `/api/residents/${resident.id}`,
                query: {
                    residentId: resident.id,
                },
            })

            const response = await DELETE(req, { params: { residentId: resident.id } })
            expect(response.status).toBe(200)

            // Verify the resident was deleted
            const deletedResident = await prisma.resident.findUnique({
                where: { id: resident.id },
            })
            expect(deletedResident).toBeNull()
        })
    })
}) 