import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { EditResidentForm } from "@/components/residents/edit-resident-form"

interface PageProps {
    params: Promise<{
        residentId: string;
    }>;
}


export default async function EditResidentPage({
    params,
}: PageProps) {
    const [resident, households] = await Promise.all([
        prisma.resident.findUnique({
            where: { id: (await params).residentId },
            select: {
                id: true,
                firstName: true,
                middleName: true,
                lastName: true,
                extensionName: true,
                alias: true,
                birthDate: true,
                gender: true,
                civilStatus: true,
                contactNo: true,
                email: true,
                occupation: true,
                educationalAttainment: true,
                bloodType: true,
                religion: true,
                ethnicGroup: true,
                nationality: true,
                address: true,
                userPhoto: true,
                motherMaidenName: true,
                motherMiddleName: true,
                motherFirstName: true,
                fatherName: true,
                fatherLastName: true,
                fatherMiddleName: true,
                familySerialNumber: true,
                headOfHousehold: true,
                familyRole: true,
                voterInBarangay: true,
                votersIdNumber: true,
                lastVotingParticipationDate: true,
                householdId: true,
            },
        }),
        prisma.household.findMany({
            select: {
                id: true,
                houseNo: true,
                street: true,
            },
            orderBy: {
                createdAt: "desc",
            },
        }),
    ])

    if (!resident) {
        notFound()
    }

    return (
        <div className="mx-auto max-w-3xl">
            <h1 className="mb-8 text-2xl font-bold">Edit Resident</h1>
            <div className="rounded-lg bg-white p-6 shadow-sm">
                <EditResidentForm resident={resident} households={households} />
            </div>
        </div>
    )
} 