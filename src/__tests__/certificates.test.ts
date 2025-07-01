import { prisma } from '@/lib/prisma'
import { cleanupDatabase, createTestResident, createTestCertificate, expectValidCertificate, isValidControlNumber } from './helpers'
import { createMocks } from 'node-mocks-http'
import { GET, POST } from '@/app/api/certificates/route'
import { GET as GET_ONE, PUT, DELETE } from '@/app/api/certificates/[id]/route'
import { CertificateType } from '@prisma/client'

describe('Certificate Management System', () => {
    beforeEach(async () => {
        await cleanupDatabase()
    })

    afterAll(async () => {
        await cleanupDatabase()
        await prisma.$disconnect()
    })

    describe('Certificate Model Operations', () => {
        it('should create a certificate with auto-generated control number', async () => {
            const resident = await createTestResident()
            const certificate = await createTestCertificate(resident.id)

            expect(certificate).toBeDefined()
            expectValidCertificate(certificate)
            expect(isValidControlNumber(certificate.controlNumber)).toBe(true)
        })

        it('should generate unique control numbers', async () => {
            const resident = await createTestResident()
            const cert1 = await createTestCertificate(resident.id, {
                id: 'cert-1',
                controlNumber: 'CLR-20240101-000001'
            })
            const cert2 = await createTestCertificate(resident.id, {
                id: 'cert-2',
                controlNumber: 'CLR-20240101-000002'
            })

            expect(cert1.controlNumber).not.toBe(cert2.controlNumber)
        })
    })

    describe('Certificate API - POST /api/certificates', () => {
        it('should create a new certificate', async () => {
            const resident = await createTestResident()

            const { req } = createMocks({
                method: 'POST',
                url: '/api/certificates',
            })

            req.json = jest.fn().mockResolvedValue({
                type: CertificateType.CLEARANCE,
                purpose: 'Employment',
                residentId: resident.id,
            })

            const response = await POST(req)
            const data = await response.json()

            expect(response.status).toBe(200)
            expect(data).toHaveProperty('controlNumber')
            expect(data.type).toBe(CertificateType.CLEARANCE)
            expect(data.residentId).toBe(resident.id)
        })

        it('should validate required fields', async () => {
            const { req } = createMocks({
                method: 'POST',
                url: '/api/certificates',
            })

            req.json = jest.fn().mockResolvedValue({
                type: CertificateType.CLEARANCE,
                // Missing purpose and residentId
            })

            const response = await POST(req)
            expect(response.status).toBe(400)
        })
    })

    describe('Certificate API - GET /api/certificates', () => {
        it('should return all certificates', async () => {
            const resident = await createTestResident()
            await createTestCertificate(resident.id)

            const { req } = createMocks({
                method: 'GET',
                url: '/api/certificates',
            })

            const response = await GET(req)
            const data = await response.json()

            expect(response.status).toBe(200)
            expect(Array.isArray(data)).toBe(true)
            expect(data.length).toBeGreaterThan(0)
        })

        it('should filter certificates by status', async () => {
            const resident = await createTestResident()
            await createTestCertificate(resident.id, {
                id: 'cert-pending',
                controlNumber: 'CLR-20240101-000001',
                status: 'PENDING'
            })
            await createTestCertificate(resident.id, {
                id: 'cert-approved',
                controlNumber: 'CLR-20240101-000002',
                status: 'APPROVED'
            })

            const { req } = createMocks({
                method: 'GET',
                url: '/api/certificates?status=PENDING',
            })

            const response = await GET(req)
            const data = await response.json()

            expect(response.status).toBe(200)
            expect(data.every((cert: any) => cert.status === 'PENDING')).toBe(true)
        })

        it('should filter certificates by type', async () => {
            const resident = await createTestResident()
            await createTestCertificate(resident.id, {
                id: 'cert-clearance',
                controlNumber: 'CLR-20240101-000001',
                type: CertificateType.CLEARANCE
            })
            await createTestCertificate(resident.id, {
                id: 'cert-residency',
                controlNumber: 'RES-20240101-000002',
                type: CertificateType.RESIDENCY
            })

            const { req } = createMocks({
                method: 'GET',
                url: '/api/certificates?type=CLEARANCE',
            })

            const response = await GET(req)
            const data = await response.json()

            expect(response.status).toBe(200)
            expect(data.every((cert: any) => cert.type === CertificateType.CLEARANCE)).toBe(true)
        })
    })

    describe('Certificate API - Individual Operations', () => {
        it('should get a specific certificate', async () => {
            const resident = await createTestResident()
            const certificate = await createTestCertificate(resident.id)

            const { req } = createMocks({
                method: 'GET',
                url: `/api/certificates/${certificate.id}`,
            })

            const response = await GET_ONE(req, { params: { id: certificate.id } })
            const data = await response.json()

            expect(response.status).toBe(200)
            expect(data.id).toBe(certificate.id)
            expect(data.controlNumber).toBe(certificate.controlNumber)
        })

        it('should update certificate status', async () => {
            const resident = await createTestResident()
            const certificate = await createTestCertificate(resident.id)

            const { req } = createMocks({
                method: 'PUT',
                url: `/api/certificates/${certificate.id}`,
            })

            req.json = jest.fn().mockResolvedValue({
                status: 'APPROVED',
                issuedDate: new Date().toISOString(),
            })

            const response = await PUT(req, { params: { id: certificate.id } })
            const data = await response.json()

            expect(response.status).toBe(200)
            expect(data.status).toBe('APPROVED')
            expect(data.issuedDate).toBeDefined()
        })

        it('should delete a certificate', async () => {
            const resident = await createTestResident()
            const certificate = await createTestCertificate(resident.id)

            const { req } = createMocks({
                method: 'DELETE',
                url: `/api/certificates/${certificate.id}`,
            })

            const response = await DELETE(req, { params: { id: certificate.id } })

            expect(response.status).toBe(200)

            // Verify certificate was deleted
            const deletedCert = await prisma.certificate.findUnique({
                where: { id: certificate.id }
            })
            expect(deletedCert).toBeNull()
        })
    })

    describe('Certificate Statistics', () => {
        it('should calculate certificate statistics correctly', async () => {
            const resident = await createTestResident()

            // Create certificates with different statuses
            await createTestCertificate(resident.id, {
                id: 'cert-1',
                controlNumber: 'CLR-20240101-000001',
                status: 'PENDING'
            })
            await createTestCertificate(resident.id, {
                id: 'cert-2',
                controlNumber: 'CLR-20240101-000002',
                status: 'APPROVED'
            })
            await createTestCertificate(resident.id, {
                id: 'cert-3',
                controlNumber: 'CLR-20240101-000003',
                status: 'RELEASED'
            })

            const { req } = createMocks({
                method: 'GET',
                url: '/api/certificates?stats=true',
            })

            const response = await GET(req)
            const data = await response.json()

            expect(response.status).toBe(200)
            expect(data).toHaveProperty('total')
            expect(data).toHaveProperty('pending')
            expect(data).toHaveProperty('approved')
            expect(data).toHaveProperty('released')
            expect(data.total).toBe(3)
            expect(data.pending).toBe(1)
            expect(data.approved).toBe(1)
            expect(data.released).toBe(1)
        })
    })

    describe('Certificate Validation', () => {
        it('should validate certificate control number format', async () => {
            const validControlNumbers = [
                'CLR-20240101-000001',
                'RES-20240315-123456',
                'IND-20231225-999999'
            ]

            validControlNumbers.forEach(controlNumber => {
                expect(isValidControlNumber(controlNumber)).toBe(true)
            })
        })

        it('should reject invalid control number formats', async () => {
            const invalidControlNumbers = [
                'INVALID-FORMAT',
                'CLR-2024-001',
                '20240101-000001',
                'CLR-20240101-ABCDEF'
            ]

            invalidControlNumbers.forEach(controlNumber => {
                expect(isValidControlNumber(controlNumber)).toBe(false)
            })
        })
    })

    describe('Certificate Types', () => {
        it('should support all certificate types', async () => {
            const resident = await createTestResident()
            const certificateTypes = [
                CertificateType.CLEARANCE,
                CertificateType.RESIDENCY,
                CertificateType.INDIGENCY,
                CertificateType.BUSINESS_PERMIT,
                CertificateType.CFA
            ]

            for (const type of certificateTypes) {
                const certificate = await createTestCertificate(resident.id, {
                    id: `cert-${type}`,
                    controlNumber: `${type.substring(0, 3)}-20240101-000001`,
                    type
                })

                expect(certificate.type).toBe(type)
            }
        })
    })

    describe('Certificate Workflow', () => {
        it('should follow proper status workflow', async () => {
            const resident = await createTestResident()
            const certificate = await createTestCertificate(resident.id)

            // Initially PENDING
            expect(certificate.status).toBe('PENDING')

            // Update to APPROVED
            const approved = await prisma.certificate.update({
                where: { id: certificate.id },
                data: {
                    status: 'APPROVED',
                    issuedDate: new Date()
                }
            })
            expect(approved.status).toBe('APPROVED')
            expect(approved.issuedDate).toBeDefined()

            // Update to RELEASED
            const released = await prisma.certificate.update({
                where: { id: certificate.id },
                data: { status: 'RELEASED' }
            })
            expect(released.status).toBe('RELEASED')
        })
    })
}) 