import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { EditHouseholdForm } from "@/components/households/edit-household-form"

export default async function EditHouseholdPage({
    params,
}: {
    params: { householdId: string }
}) {
    const household = await prisma.household.findUnique({
        where: { id: params.householdId },
    })

    if (!household) {
        notFound()
    }

    return (
        <div className="mx-auto max-w-3xl">
            <h1 className="mb-8 text-2xl font-bold">Edit Household</h1>
            <div className="rounded-lg bg-white p-6 shadow-sm">
                <EditHouseholdForm household={household} />
            </div>
        </div>
    )
} 