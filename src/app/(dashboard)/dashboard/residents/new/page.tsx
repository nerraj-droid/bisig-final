import { prisma } from "@/lib/prisma"
import { ResidentForm } from "@/components/residents/resident-form"

export default async function NewResidentPage() {
    const households = await prisma.household.findMany({
        select: {
            id: true,
            houseNo: true,
            street: true,
        },
        orderBy: {
            createdAt: "desc",
        },
    })

    return (
        <div className="mx-auto max-w-3xl">
            <h1 className="mb-8 text-2xl font-bold">Add New Resident</h1>
            <div className="rounded-lg bg-white p-6 shadow-sm">
                <ResidentForm households={households} />
            </div>
        </div>
    )
} 