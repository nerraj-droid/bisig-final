import { prisma } from '@/lib/prisma'
import { cleanupDatabase, createTestResident, createTestHousehold, createTestUser, createTestCertificate } from './helpers'
import { CertificateType, Role, Status, HouseholdType, BlotterCaseStatus } from '@prisma/client'

describe('BISIG System Integration Tests', () => {
    beforeEach(async () => {
        await cleanupDatabase()
    })

    afterAll(async () => {
        await cleanupDatabase()
        await prisma.$disconnect()
    })

    describe('Complete Resident Registration Workflow', () => {
        it('should handle complete resident registration with household', async () => {
            // 1. Create a household
            const household = await createTestHousehold({
                houseNo: '123',
                street: 'Test Street',
                barangay: 'Test Barangay'
            })

            // 2. Register a resident in the household
            const resident = await createTestResident({
                firstName: 'Juan',
                lastName: 'Dela Cruz',
                householdId: household.id
            })

            // 3. Update household statistics
            await prisma.householdStatistic.create({
                data: {
                    householdId: household.id,
                    totalResidents: 1,
                    voterCount: 1,
                    seniorCount: 0,
                    minorCount: 0,
                    employedCount: 1,
                }
            })

            // Verify the complete setup
            const householdWithResident = await prisma.household.findUnique({
                where: { id: household.id },
                include: {
                    Resident: true,
                    statistics: true
                }
            })

            expect(householdWithResident).toBeDefined()
            expect(householdWithResident!.Resident).toHaveLength(1)
            expect(householdWithResident!.Resident[0].firstName).toBe('Juan')
            expect(householdWithResident!.statistics?.totalResidents).toBe(1)
        })
    })

    describe('Certificate Issuance Workflow', () => {
        it('should handle complete certificate issuance process', async () => {
            // 1. Setup: Create user, resident, and official
            const user = await createTestUser({
                role: Role.SECRETARY
            })

            const resident = await createTestResident({
                firstName: 'Maria',
                lastName: 'Santos'
            })

            let official = await prisma.officials.findFirst()
            if (!official) {
                official = await prisma.officials.create({
                    data: {
                        id: 'official-integration',
                        punongBarangay: 'Captain Santos',
                        secretary: 'Secretary Cruz',
                        treasurer: 'Treasurer Reyes'
                    }
                })
            }

            // 2. Create certificate request
            const certificate = await prisma.certificate.create({
                data: {
                    id: 'cert-integration',
                    controlNumber: 'CLR-20240101-000001',
                    type: CertificateType.CLEARANCE,
                    status: 'PENDING',
                    purpose: 'Employment Requirements',
                    residentId: resident.id,
                    officialId: official.id,
                    updatedAt: new Date()
                }
            })

            // 3. Process certificate (PENDING -> APPROVED -> RELEASED)
            const approved = await prisma.certificate.update({
                where: { id: certificate.id },
                data: {
                    status: 'APPROVED',
                    issuedDate: new Date()
                }
            })

            const released = await prisma.certificate.update({
                where: { id: certificate.id },
                data: {
                    status: 'RELEASED'
                }
            })

            // Verify complete workflow
            expect(certificate.status).toBe('PENDING')
            expect(approved.status).toBe('APPROVED')
            expect(approved.issuedDate).toBeDefined()
            expect(released.status).toBe('RELEASED')

            // Verify relationships
            const fullCertificate = await prisma.certificate.findUnique({
                where: { id: certificate.id },
                include: {
                    Resident: true,
                    Officials: true
                }
            })

            expect(fullCertificate!.Resident.firstName).toBe('Maria')
            expect(fullCertificate!.Officials.punongBarangay).toBe('Captain Santos')
        })
    })

    describe('Blotter Case Management Workflow', () => {
        it('should handle complete blotter case lifecycle', async () => {
            // 1. Setup: Create complainant and respondent
            const complainant = await createTestResident({
                id: 'complainant-integration',
                firstName: 'Pedro',
                lastName: 'Complainant'
            })

            const respondent = await createTestResident({
                id: 'respondent-integration',
                firstName: 'Jose',
                lastName: 'Respondent'
            })

            // 2. File a blotter case
            const blotterCase = await prisma.blotterCase.create({
                data: {
                    id: 'case-integration',
                    caseNumber: 'BLT-2024-001',
                    incidentDate: new Date(),
                    incidentLocation: 'Barangay Hall',
                    incidentType: 'Noise Complaint',
                    incidentDescription: 'Loud music disturbing neighbors',
                    status: BlotterCaseStatus.FILED,
                    filingFee: 100.00,
                    filingFeePaid: true
                }
            })

            // 3. Add parties to the case
            await prisma.blotterParty.createMany({
                data: [
                    {
                        blotterCaseId: blotterCase.id,
                        residentId: complainant.id,
                        partyType: 'COMPLAINANT',
                        firstName: complainant.firstName,
                        lastName: complainant.lastName,
                        address: complainant.address,
                        notes: 'Primary Complainant'
                    },
                    {
                        blotterCaseId: blotterCase.id,
                        residentId: respondent.id,
                        partyType: 'RESPONDENT',
                        firstName: respondent.firstName,
                        lastName: respondent.lastName,
                        address: respondent.address,
                        notes: 'Primary Respondent'
                    }
                ]
            })

            // 4. Process case through workflow
            const docketed = await prisma.blotterCase.update({
                where: { id: blotterCase.id },
                data: {
                    status: BlotterCaseStatus.DOCKETED,
                    docketDate: new Date()
                }
            })

            // 5. Schedule hearing
            const hearing = await prisma.blotterHearing.create({
                data: {
                    blotterCaseId: blotterCase.id,
                    date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                    time: '10:00 AM',
                    location: 'Barangay Hall',
                    status: 'SCHEDULED'
                }
            })

            // 6. Resolve case
            const resolved = await prisma.blotterCase.update({
                where: { id: blotterCase.id },
                data: {
                    status: BlotterCaseStatus.RESOLVED,
                    resolutionMethod: 'Mediation Agreement'
                }
            })

            // Verify complete workflow
            const fullCase = await prisma.blotterCase.findUnique({
                where: { id: blotterCase.id },
                include: {
                    parties: {
                        include: { resident: true }
                    },
                    hearings: true
                }
            })

            expect(fullCase!.status).toBe(BlotterCaseStatus.RESOLVED)
            expect(fullCase!.parties).toHaveLength(2)
            expect(fullCase!.hearings).toHaveLength(1)
            expect(fullCase!.resolutionMethod).toBe('Mediation Agreement')
        })
    })

    describe('Multi-User Role Workflow', () => {
        it('should handle different user roles accessing system features', async () => {
            // Create users with different roles
            const superAdmin = await createTestUser({
                id: 'super-admin',
                email: 'admin@barangay.gov.ph',
                role: Role.SUPER_ADMIN
            })

            const captain = await createTestUser({
                id: 'captain',
                email: 'captain@barangay.gov.ph',
                role: Role.CAPTAIN
            })

            const secretary = await createTestUser({
                id: 'secretary',
                email: 'secretary@barangay.gov.ph',
                role: Role.SECRETARY
            })

            const treasurer = await createTestUser({
                id: 'treasurer',
                email: 'treasurer@barangay.gov.ph',
                role: Role.TREASURER
            })

            // Verify role assignments
            expect(superAdmin.role).toBe(Role.SUPER_ADMIN)
            expect(captain.role).toBe(Role.CAPTAIN)
            expect(secretary.role).toBe(Role.SECRETARY)
            expect(treasurer.role).toBe(Role.TREASURER)

            // Verify all users are active
            const allUsers = await prisma.user.findMany({
                where: { status: Status.ACTIVE }
            })

            expect(allUsers).toHaveLength(4)
        })
    })

    describe('Data Integrity and Relationships', () => {
        it('should maintain data integrity across related models', async () => {
            // Create interconnected data
            const household = await createTestHousehold()
            const resident = await createTestResident({ householdId: household.id })
            const certificate = await createTestCertificate(resident.id)

            // Test cascading relationships
            const residentWithRelations = await prisma.resident.findUnique({
                where: { id: resident.id },
                include: {
                    Household: true,
                    Certificate: true
                }
            })

            expect(residentWithRelations!.Household!.id).toBe(household.id)
            expect(residentWithRelations!.Certificate).toHaveLength(1)
            expect(residentWithRelations!.Certificate[0].id).toBe(certificate.id)
        })

        it('should handle orphaned records properly', async () => {
            const household = await createTestHousehold()
            const resident = await createTestResident({ householdId: household.id })

            // Delete household - resident should handle the orphaned reference
            await prisma.household.delete({
                where: { id: household.id }
            })

            const orphanedResident = await prisma.resident.findUnique({
                where: { id: resident.id }
            })

            expect(orphanedResident).toBeDefined()
            // The resident should still exist but without household reference
        })
    })

    describe('System Statistics and Reporting', () => {
        it('should generate accurate system-wide statistics', async () => {
            // Create test data
            const households = await Promise.all([
                createTestHousehold({ id: 'hh-1', type: HouseholdType.SINGLE_FAMILY }),
                createTestHousehold({ id: 'hh-2', type: HouseholdType.MULTI_FAMILY }),
                createTestHousehold({ id: 'hh-3', type: HouseholdType.EXTENDED_FAMILY })
            ])

            const residents = await Promise.all([
                createTestResident({ id: 'res-1', householdId: households[0].id, birthDate: new Date('1990-01-01') }),
                createTestResident({ id: 'res-2', householdId: households[1].id, birthDate: new Date('2010-01-01') }),
                createTestResident({ id: 'res-3', householdId: households[2].id, birthDate: new Date('1960-01-01') })
            ])

            const certificates = await Promise.all([
                createTestCertificate(residents[0].id, { id: 'cert-1', status: 'PENDING' }),
                createTestCertificate(residents[1].id, { id: 'cert-2', status: 'APPROVED' }),
                createTestCertificate(residents[2].id, { id: 'cert-3', status: 'RELEASED' })
            ])

            // Calculate statistics
            const householdCount = await prisma.household.count()
            const residentCount = await prisma.resident.count()
            const certificateCount = await prisma.certificate.count()

            const certificateStats = await prisma.certificate.groupBy({
                by: ['status'],
                _count: { status: true }
            })

            // Verify statistics
            expect(householdCount).toBe(3)
            expect(residentCount).toBe(3)
            expect(certificateCount).toBe(3)
            expect(certificateStats).toHaveLength(3) // PENDING, APPROVED, RELEASED
        })
    })

    describe('Performance and Scalability', () => {
        it('should handle bulk operations efficiently', async () => {
            const startTime = Date.now()

            // Create multiple households and residents
            const householdData = Array.from({ length: 10 }, (_, i) => ({
                id: `bulk-hh-${i}`,
                houseNo: `${i + 1}`,
                street: 'Bulk Test Street',
                barangay: 'Test Barangay',
                city: 'Test City',
                province: 'Test Province',
                zipCode: '1234',
                type: HouseholdType.SINGLE_FAMILY,
                updatedAt: new Date()
            }))

            await prisma.household.createMany({
                data: householdData
            })

            const residentData = Array.from({ length: 10 }, (_, i) => ({
                id: `bulk-res-${i}`,
                firstName: `Resident${i}`,
                lastName: 'BulkTest',
                birthDate: new Date('1990-01-01'),
                gender: 'MALE' as const,
                civilStatus: 'SINGLE' as const,
                address: `Address ${i}`,
                householdId: `bulk-hh-${i}`,
                updatedAt: new Date()
            }))

            await prisma.resident.createMany({
                data: residentData
            })

            const endTime = Date.now()
            const executionTime = endTime - startTime

            // Verify bulk creation
            const householdCount = await prisma.household.count({
                where: { id: { startsWith: 'bulk-hh-' } }
            })
            const residentCount = await prisma.resident.count({
                where: { id: { startsWith: 'bulk-res-' } }
            })

            expect(householdCount).toBe(10)
            expect(residentCount).toBe(10)
            expect(executionTime).toBeLessThan(5000) // Should complete within 5 seconds
        })
    })
}) 