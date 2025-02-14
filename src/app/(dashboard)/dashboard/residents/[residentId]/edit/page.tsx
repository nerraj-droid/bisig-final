import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { EditResidentForm } from "@/components/residents/edit-resident-form"

export default async function EditResidentPage({
    params,
}: {
    params: { residentId: string }
}) {
    const [resident, households] = await Promise.all([
        prisma.resident.findUnique({
            where: { id: params.residentId },
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