import { prisma } from '@/lib/prisma'
import { cleanupDatabase, createTestHousehold, createTestResident, expectValidHousehold } from './helpers'
import { createMocks } from 'node-mocks-http'
import { GET, POST } from '@/app/api/households/route'
import { GET as GET_ONE, PATCH, DELETE } from '@/app/api/households/[id]/route'
import { HouseholdType, HouseholdStatus } from '@prisma/client'

describe('Household Management System', () => {
    beforeEach(async () => {
        await cleanupDatabase()
    })

    afterAll(async () => {
        await cleanupDatabase()
        await prisma.$disconnect()
    })

    describe('Household Model Operations', () => {
        it('should create a household with required fields', async () => {
            const household = await createTestHousehold()

            expect(household).toBeDefined()
            expectValidHousehold(household)
            expect(household.type).toBe(HouseholdType.SINGLE_FAMILY)
            expect(household.status).toBeDefined()
        })

        it('should support different household types', async () => {
            const types = [
                HouseholdType.SINGLE_FAMILY,
                HouseholdType.MULTI_FAMILY,
                HouseholdType.EXTENDED_FAMILY,
                HouseholdType.SINGLE_PERSON,
                HouseholdType.NON_FAMILY,
                HouseholdType.OTHER
            ]

            for (const type of types) {
                const household = await createTestHousehold({
                    id: `household-${type}`,
                    type
                })
                expect(household.type).toBe(type)
            }
        })
    })

    describe('Household API - POST /api/households', () => {
        it('should create a new household', async () => {
            const { req } = createMocks({
                method: 'POST',
                url: '/api/households',
            })

            req.json = jest.fn().mockResolvedValue({
                houseNo: '123',
                street: 'Main Street',
                barangay: 'Test Barangay',
                city: 'Test City',
                province: 'Test Province',
                zipCode: '1234',
                type: HouseholdType.SINGLE_FAMILY,
            })

            const response = await POST(req)
            const data = await response.json()

            expect(response.status).toBe(200)
            expect(data.houseNo).toBe('123')
            expect(data.type).toBe(HouseholdType.SINGLE_FAMILY)
        })

        it('should validate required fields', async () => {
            const { req } = createMocks({
                method: 'POST',
                url: '/api/households',
            })

            req.json = jest.fn().mockResolvedValue({
                houseNo: '123',
                // Missing required fields
            })

            const response = await POST(req)
            expect(response.status).toBe(400)
        })
    })

    describe('Household API - GET /api/households', () => {
        it('should return all households', async () => {
            await createTestHousehold()

            const { req } = createMocks({
                method: 'GET',
                url: '/api/households',
            })

            const response = await GET(req)
            const data = await response.json()

            expect(response.status).toBe(200)
            expect(Array.isArray(data)).toBe(true)
            expect(data.length).toBeGreaterThan(0)
        })

        it('should filter households by type', async () => {
            await createTestHousehold({
                id: 'household-single',
                type: HouseholdType.SINGLE_FAMILY
            })
            await createTestHousehold({
                id: 'household-multi',
                type: HouseholdType.MULTI_FAMILY
            })

            const { req } = createMocks({
                method: 'GET',
                url: '/api/households?type=SINGLE_FAMILY',
            })

            const response = await GET(req)
            const data = await response.json()

            expect(response.status).toBe(200)
            expect(data.every((household: any) => household.type === HouseholdType.SINGLE_FAMILY)).toBe(true)
        })

        it('should search households by address', async () => {
            await createTestHousehold({
                id: 'household-main',
                street: 'Main Street'
            })
            await createTestHousehold({
                id: 'household-second',
                street: 'Second Street'
            })

            const { req } = createMocks({
                method: 'GET',
                url: '/api/households?search=Main',
            })

            const response = await GET(req)
            const data = await response.json()

            expect(response.status).toBe(200)
            expect(data.length).toBeGreaterThan(0)
            expect(data.some((household: any) => household.street.includes('Main'))).toBe(true)
        })
    })

    describe('Household API - Individual Operations', () => {
        it('should get a specific household with residents', async () => {
            const household = await createTestHousehold()
            const resident = await createTestResident({
                id: 'resident-in-household',
                householdId: household.id
            })

            const { req } = createMocks({
                method: 'GET',
                url: `/api/households/${household.id}`,
            })

            const response = await GET_ONE(req, { params: { id: household.id } })
            const data = await response.json()

            expect(response.status).toBe(200)
            expect(data.id).toBe(household.id)
            expect(data).toHaveProperty('Resident')
            expect(Array.isArray(data.Resident)).toBe(true)
        })

        it('should update household information', async () => {
            const household = await createTestHousehold()

            const { req } = createMocks({
                method: 'PUT',
                url: `/api/households/${household.id}`,
            })

            req.json = jest.fn().mockResolvedValue({
                houseNo: '456',
                street: 'Updated Street',
                type: HouseholdType.EXTENDED_FAMILY,
            })

            const response = await PATCH(req, { params: { id: household.id } })
            const data = await response.json()

            expect(response.status).toBe(200)
            expect(data.houseNo).toBe('456')
            expect(data.street).toBe('Updated Street')
            expect(data.type).toBe(HouseholdType.EXTENDED_FAMILY)
        })

        it('should delete a household', async () => {
            const household = await createTestHousehold()

            const { req } = createMocks({
                method: 'DELETE',
                url: `/api/households/${household.id}`,
            })

            const response = await DELETE(req, { params: { id: household.id } })

            expect(response.status).toBe(200)

            // Verify household was deleted
            const deletedHousehold = await prisma.household.findUnique({
                where: { id: household.id }
            })
            expect(deletedHousehold).toBeNull()
        })
    })

    describe('Household Statistics', () => {
        it('should calculate household statistics', async () => {
            const household = await createTestHousehold()

            // Add residents to household
            await createTestResident({
                id: 'resident-1',
                householdId: household.id,
                birthDate: new Date('1990-01-01') // Adult
            })
            await createTestResident({
                id: 'resident-2',
                householdId: household.id,
                birthDate: new Date('2010-01-01') // Minor
            })
            await createTestResident({
                id: 'resident-3',
                householdId: household.id,
                birthDate: new Date('1950-01-01') // Senior
            })

            // Create household statistics
            await prisma.householdStatistic.create({
                data: {
                    householdId: household.id,
                    totalResidents: 3,
                    voterCount: 2,
                    seniorCount: 1,
                    minorCount: 1,
                    employedCount: 2,
                }
            })

            const stats = await prisma.householdStatistic.findUnique({
                where: { householdId: household.id }
            })

            expect(stats).toBeDefined()
            expect(stats!.totalResidents).toBe(3)
            expect(stats!.seniorCount).toBe(1)
            expect(stats!.minorCount).toBe(1)
        })
    })

    describe('Household Location Data', () => {
        it('should store GPS coordinates', async () => {
            const household = await createTestHousehold({
                latitude: 14.5995,
                longitude: 120.9842, // Manila coordinates
            })

            expect(household.latitude).toBe(14.5995)
            expect(household.longitude).toBe(120.9842)
        })

        it('should handle households without GPS coordinates', async () => {
            const household = await createTestHousehold({
                latitude: null,
                longitude: null,
            })

            expect(household.latitude).toBeNull()
            expect(household.longitude).toBeNull()
        })
    })

    describe('Household Status Management', () => {
        it('should support different household statuses', async () => {
            const statuses = [
                HouseholdStatus.ACTIVE,
                HouseholdStatus.INACTIVE,
                HouseholdStatus.RELOCATED,
                HouseholdStatus.MERGED,
                HouseholdStatus.ARCHIVED
            ]

            for (const status of statuses) {
                const household = await createTestHousehold({
                    id: `household-${status}`,
                    status
                })
                expect(household.status).toBe(status)
            }
        })

        it('should handle household merging', async () => {
            const household1 = await createTestHousehold({
                id: 'household-1'
            })
            const household2 = await createTestHousehold({
                id: 'household-2'
            })

            // Merge household2 into household1
            const mergedHousehold = await prisma.household.update({
                where: { id: household1.id },
                data: {
                    mergedFrom: [household2.id],
                    status: HouseholdStatus.ACTIVE
                }
            })

            await prisma.household.update({
                where: { id: household2.id },
                data: {
                    mergedInto: household1.id,
                    status: HouseholdStatus.MERGED
                }
            })

            expect(mergedHousehold.mergedFrom).toContain(household2.id)

            const mergedFromHousehold = await prisma.household.findUnique({
                where: { id: household2.id }
            })
            expect(mergedFromHousehold!.mergedInto).toBe(household1.id)
            expect(mergedFromHousehold!.status).toBe(HouseholdStatus.MERGED)
        })
    })

    describe('Household History Tracking', () => {
        it('should track household history changes', async () => {
            const household = await createTestHousehold()

            const historyEntry = {
                action: 'UPDATE',
                timestamp: new Date().toISOString(),
                changes: {
                    houseNo: { from: '001', to: '002' },
                    street: { from: 'Old Street', to: 'New Street' }
                },
                userId: 'test-user-id'
            }

            const updatedHousehold = await prisma.household.update({
                where: { id: household.id },
                data: {
                    houseNo: '002',
                    street: 'New Street',
                    history: [historyEntry]
                }
            })

            expect(Array.isArray(updatedHousehold.history)).toBe(true)
            expect(updatedHousehold.history.length).toBe(1)
            expect(updatedHousehold.history[0]).toMatchObject(historyEntry)
        })
    })

    describe('Household Address Validation', () => {
        it('should validate complete address information', async () => {
            const household = await createTestHousehold({
                houseNo: '123',
                street: 'Main Street',
                barangay: 'Test Barangay',
                city: 'Test City',
                province: 'Test Province',
                zipCode: '1234'
            })

            expect(household.houseNo).toBe('123')
            expect(household.street).toBe('Main Street')
            expect(household.barangay).toBe('Test Barangay')
            expect(household.city).toBe('Test City')
            expect(household.province).toBe('Test Province')
            expect(household.zipCode).toBe('1234')
        })
    })
}) 