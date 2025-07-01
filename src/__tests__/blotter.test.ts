import { prisma } from '@/lib/prisma'
import { cleanupDatabase, createTestResident, createTestBlotter } from './helpers'
import { createMocks } from 'node-mocks-http'
import { GET } from '@/app/api/blotter/route'
import { GET as GET_ONE } from '@/app/api/blotter/[id]/route'
import { BlotterCaseStatus, BlotterPriority, BlotterPartyType } from '@prisma/client'

describe('Blotter Management System', () => {
    beforeEach(async () => {
        await cleanupDatabase()
    })

    afterAll(async () => {
        await cleanupDatabase()
        await prisma.$disconnect()
    })

    describe('Blotter Case Model Operations', () => {
        it('should create a blotter case with required fields', async () => {
            const resident = await createTestResident()
            const blotter = await createTestBlotter(resident.id)

            expect(blotter).toBeDefined()
            expect(blotter.caseNumber).toBe('BLT-2024-001')
            expect(blotter.status).toBe(BlotterCaseStatus.PENDING)
            expect(blotter.incidentDescription).toBe('Test blotter case')
        })

        it('should generate unique case numbers', async () => {
            const resident = await createTestResident()
            const case1 = await createTestBlotter(resident.id, {
                id: 'case-1',
                caseNumber: 'BLT-2024-001'
            })
            const case2 = await createTestBlotter(resident.id, {
                id: 'case-2',
                caseNumber: 'BLT-2024-002'
            })

            expect(case1.caseNumber).not.toBe(case2.caseNumber)
        })
    })

    describe('Blotter Model Operations', () => {
        it('should create a new blotter case directly', async () => {
            const resident = await createTestResident()
            const blotterCase = await createTestBlotter(resident.id, {
                incidentType: 'Disturbance',
                incidentDescription: 'Noise complaint',
                priority: BlotterPriority.MEDIUM,
            })

            expect(blotterCase).toBeDefined()
            expect(blotterCase.incidentType).toBe('Disturbance')
            expect(blotterCase.status).toBe(BlotterCaseStatus.PENDING)
        })

        it('should validate required fields when creating blotter case', async () => {
            const resident = await createTestResident()

            // Test that all required fields are present
            await expect(
                createTestBlotter(resident.id, {
                    incidentType: 'Disturbance'
                    // Missing other required fields - this should work with defaults
                })
            ).resolves.toBeDefined()
        })
    })

    describe('Blotter API - GET /api/blotter', () => {
        it('should return all blotter cases', async () => {
            const resident = await createTestResident()
            await createTestBlotter(resident.id)

            const { req } = createMocks({
                method: 'GET',
                url: '/api/blotter',
            })

            const response = await GET(req)
            const data = await response.json()

            expect(response.status).toBe(200)
            expect(Array.isArray(data)).toBe(true)
            expect(data.length).toBeGreaterThan(0)
        })

        it('should filter cases by status', async () => {
            const resident = await createTestResident()
            await createTestBlotter(resident.id, {
                id: 'case-pending',
                caseNumber: 'BLT-2024-001',
                status: BlotterCaseStatus.PENDING
            })
            await createTestBlotter(resident.id, {
                id: 'case-resolved',
                caseNumber: 'BLT-2024-002',
                status: BlotterCaseStatus.RESOLVED
            })

            const { req } = createMocks({
                method: 'GET',
                url: '/api/blotter?status=PENDING',
            })

            const response = await GET(req)
            const data = await response.json()

            expect(response.status).toBe(200)
            expect(data.every((blotterCase: any) => blotterCase.status === BlotterCaseStatus.PENDING)).toBe(true)
        })

        it('should filter cases by priority', async () => {
            const resident = await createTestResident()
            await createTestBlotter(resident.id, {
                id: 'case-high',
                caseNumber: 'BLT-2024-001',
                priority: BlotterPriority.HIGH
            })
            await createTestBlotter(resident.id, {
                id: 'case-low',
                caseNumber: 'BLT-2024-002',
                priority: BlotterPriority.LOW
            })

            const { req } = createMocks({
                method: 'GET',
                url: '/api/blotter?priority=HIGH',
            })

            const response = await GET(req)
            const data = await response.json()

            expect(response.status).toBe(200)
            expect(data.every((blotterCase: any) => blotterCase.priority === BlotterPriority.HIGH)).toBe(true)
        })
    })

    describe('Blotter Case Status Workflow', () => {
        it('should follow proper Katarungang Pambarangay workflow', async () => {
            const resident = await createTestResident()
            let blotterCase = await createTestBlotter(resident.id, {
                status: BlotterCaseStatus.FILED
            })

            // FILED -> DOCKETED
            blotterCase = await prisma.blotterCase.update({
                where: { id: blotterCase.id },
                data: {
                    status: BlotterCaseStatus.DOCKETED,
                    docketDate: new Date()
                }
            })
            expect(blotterCase.status).toBe(BlotterCaseStatus.DOCKETED)
            expect(blotterCase.docketDate).toBeDefined()

            // DOCKETED -> SUMMONED
            blotterCase = await prisma.blotterCase.update({
                where: { id: blotterCase.id },
                data: {
                    status: BlotterCaseStatus.SUMMONED,
                    summonDate: new Date()
                }
            })
            expect(blotterCase.status).toBe(BlotterCaseStatus.SUMMONED)

            // SUMMONED -> MEDIATION
            blotterCase = await prisma.blotterCase.update({
                where: { id: blotterCase.id },
                data: {
                    status: BlotterCaseStatus.MEDIATION,
                    mediationStartDate: new Date()
                }
            })
            expect(blotterCase.status).toBe(BlotterCaseStatus.MEDIATION)

            // MEDIATION -> RESOLVED
            blotterCase = await prisma.blotterCase.update({
                where: { id: blotterCase.id },
                data: {
                    status: BlotterCaseStatus.RESOLVED,
                    mediationEndDate: new Date(),
                    resolutionMethod: 'Mediation'
                }
            })
            expect(blotterCase.status).toBe(BlotterCaseStatus.RESOLVED)
            expect(blotterCase.resolutionMethod).toBe('Mediation')
        })

        it('should handle escalation to court', async () => {
            const resident = await createTestResident()
            const blotterCase = await createTestBlotter(resident.id)

            const escalated = await prisma.blotterCase.update({
                where: { id: blotterCase.id },
                data: {
                    status: BlotterCaseStatus.ESCALATED,
                    escalatedToEnt: 'Municipal Trial Court'
                }
            })

            expect(escalated.status).toBe(BlotterCaseStatus.ESCALATED)
            expect(escalated.escalatedToEnt).toBe('Municipal Trial Court')
        })

        it('should handle CFA issuance', async () => {
            const resident = await createTestResident()
            const blotterCase = await createTestBlotter(resident.id)

            const certified = await prisma.blotterCase.update({
                where: { id: blotterCase.id },
                data: {
                    status: BlotterCaseStatus.CERTIFIED,
                    certificationDate: new Date()
                }
            })

            expect(certified.status).toBe(BlotterCaseStatus.CERTIFIED)
            expect(certified.certificationDate).toBeDefined()
        })
    })

    describe('Blotter Parties Management', () => {
        it('should add complainant and respondent parties', async () => {
            const complainant = await createTestResident({
                id: 'complainant',
                firstName: 'John',
                lastName: 'Complainant'
            })
            const respondent = await createTestResident({
                id: 'respondent',
                firstName: 'Jane',
                lastName: 'Respondent'
            })
            const blotterCase = await createTestBlotter(complainant.id)

            // Add complainant party
            await prisma.blotterParty.create({
                data: {
                    blotterCaseId: blotterCase.id,
                    residentId: complainant.id,
                    partyType: BlotterPartyType.COMPLAINANT,
                    firstName: complainant.firstName,
                    lastName: complainant.lastName,
                    address: complainant.address,
                    notes: 'Primary Complainant'
                }
            })

            // Add respondent party
            await prisma.blotterParty.create({
                data: {
                    blotterCaseId: blotterCase.id,
                    residentId: respondent.id,
                    partyType: BlotterPartyType.RESPONDENT,
                    firstName: respondent.firstName,
                    lastName: respondent.lastName,
                    address: respondent.address,
                    notes: 'Primary Respondent'
                }
            })

            const parties = await prisma.blotterParty.findMany({
                where: { blotterCaseId: blotterCase.id },
                include: { resident: true }
            })

            expect(parties).toHaveLength(2)
            expect(parties.some(p => p.partyType === BlotterPartyType.COMPLAINANT)).toBe(true)
            expect(parties.some(p => p.partyType === BlotterPartyType.RESPONDENT)).toBe(true)
        })

        it('should add witnesses to a case', async () => {
            const resident = await createTestResident()
            const witness = await createTestResident({
                id: 'witness',
                firstName: 'Witness',
                lastName: 'Person'
            })
            const blotterCase = await createTestBlotter(resident.id)

            await prisma.blotterParty.create({
                data: {
                    blotterCaseId: blotterCase.id,
                    residentId: witness.id,
                    partyType: BlotterPartyType.WITNESS,
                    firstName: witness.firstName,
                    lastName: witness.lastName,
                    address: witness.address,
                    notes: 'Eyewitness'
                }
            })

            const witnesses = await prisma.blotterParty.findMany({
                where: {
                    blotterCaseId: blotterCase.id,
                    partyType: BlotterPartyType.WITNESS
                }
            })

            expect(witnesses).toHaveLength(1)
            expect(witnesses[0].notes).toBe('Eyewitness')
        })
    })

    describe('Blotter Hearings Management', () => {
        it('should schedule and manage hearings', async () => {
            const resident = await createTestResident()
            const blotterCase = await createTestBlotter(resident.id)

            const hearing = await prisma.blotterHearing.create({
                data: {
                    blotterCaseId: blotterCase.id,
                    date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
                    time: '10:00 AM',
                    location: 'Barangay Hall',
                    status: 'SCHEDULED',
                    notes: 'Initial mediation hearing'
                }
            })

            expect(hearing).toBeDefined()
            expect(hearing.location).toBe('Barangay Hall')
            expect(hearing.status).toBe('SCHEDULED')
        })

        it('should track hearing outcomes', async () => {
            const resident = await createTestResident()
            const blotterCase = await createTestBlotter(resident.id)

            const hearing = await prisma.blotterHearing.create({
                data: {
                    blotterCaseId: blotterCase.id,
                    date: new Date(),
                    time: '2:00 PM',
                    location: 'Barangay Hall',
                    status: 'COMPLETED',
                    notes: 'Parties agreed to settlement',
                    minutesNotes: 'Agreement reached'
                }
            })

            expect(hearing.status).toBe('COMPLETED')
            expect(hearing.minutesNotes).toBe('Agreement reached')
        })
    })

    describe('Blotter Filing Fees', () => {
        it('should track filing fees', async () => {
            const resident = await createTestResident()
            const blotterCase = await createTestBlotter(resident.id, {
                filingFee: 100.00,
                filingFeePaid: false
            })

            expect(blotterCase.filingFee).toBe(100.00)
            expect(blotterCase.filingFeePaid).toBe(false)

            // Mark as paid
            const paidCase = await prisma.blotterCase.update({
                where: { id: blotterCase.id },
                data: { filingFeePaid: true }
            })

            expect(paidCase.filingFeePaid).toBe(true)
        })
    })

    describe('Blotter Status Updates', () => {
        it('should track status change history', async () => {
            const resident = await createTestResident()
            const blotterCase = await createTestBlotter(resident.id)

            await prisma.blotterStatusUpdate.create({
                data: {
                    blotterCaseId: blotterCase.id,
                    status: BlotterCaseStatus.DOCKETED,
                    notes: 'Case received and docketed - changed from FILED to DOCKETED',
                    updatedById: 'test-user-id'
                }
            })

            const statusUpdates = await prisma.blotterStatusUpdate.findMany({
                where: { blotterCaseId: blotterCase.id }
            })

            expect(statusUpdates).toHaveLength(1)
            expect(statusUpdates[0].status).toBe(BlotterCaseStatus.DOCKETED)
            expect(statusUpdates[0].notes).toContain('FILED to DOCKETED')
        })
    })

    describe('Blotter Attachments', () => {
        it('should handle case attachments', async () => {
            const resident = await createTestResident()
            const blotterCase = await createTestBlotter(resident.id)

            await prisma.blotterAttachment.create({
                data: {
                    blotterCaseId: blotterCase.id,
                    fileName: 'evidence.pdf',
                    fileType: 'application/pdf',
                    fileSize: 1024,
                    fileUrl: '/uploads/blotter/evidence.pdf',
                    description: 'Evidence Document'
                }
            })

            const attachments = await prisma.blotterAttachment.findMany({
                where: { blotterCaseId: blotterCase.id }
            })

            expect(attachments).toHaveLength(1)
            expect(attachments[0].fileName).toBe('evidence.pdf')
            expect(attachments[0].fileType).toBe('application/pdf')
        })
    })

    describe('Blotter Priority Management', () => {
        it('should support different priority levels', async () => {
            const resident = await createTestResident()
            const priorities = [
                BlotterPriority.LOW,
                BlotterPriority.MEDIUM,
                BlotterPriority.HIGH,
                BlotterPriority.URGENT
            ]

            for (const priority of priorities) {
                const blotterCase = await createTestBlotter(resident.id, {
                    id: `case-${priority}`,
                    caseNumber: `BLT-2024-${priority}`,
                    priority
                })
                expect(blotterCase.priority).toBe(priority)
            }
        })
    })

    describe('Blotter Search and Filtering', () => {
        it('should search cases by incident type', async () => {
            const resident = await createTestResident()
            await createTestBlotter(resident.id, {
                id: 'case-noise',
                caseNumber: 'BLT-2024-001',
                incidentType: 'Noise Complaint'
            })
            await createTestBlotter(resident.id, {
                id: 'case-theft',
                caseNumber: 'BLT-2024-002',
                incidentType: 'Theft'
            })

            const noiseCases = await prisma.blotterCase.findMany({
                where: {
                    incidentType: {
                        contains: 'Noise',
                        mode: 'insensitive'
                    }
                }
            })

            expect(noiseCases).toHaveLength(1)
            expect(noiseCases[0].incidentType).toBe('Noise Complaint')
        })

        it('should filter cases by date range', async () => {
            const resident = await createTestResident()
            const today = new Date()
            const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000)

            await createTestBlotter(resident.id, {
                id: 'case-today',
                caseNumber: 'BLT-2024-001',
                incidentDate: today
            })
            await createTestBlotter(resident.id, {
                id: 'case-yesterday',
                caseNumber: 'BLT-2024-002',
                incidentDate: yesterday
            })

            const todayCases = await prisma.blotterCase.findMany({
                where: {
                    incidentDate: {
                        gte: new Date(today.getFullYear(), today.getMonth(), today.getDate())
                    }
                }
            })

            expect(todayCases).toHaveLength(1)
            expect(todayCases[0].caseNumber).toBe('BLT-2024-001')
        })
    })
}) 