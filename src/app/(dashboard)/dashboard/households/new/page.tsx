import { HouseholdForm } from "@/components/households/household-form"

export default function NewHouseholdPage() {
    return (
        <div className="mx-auto max-w-3xl">
            <h1 className="mb-8 text-2xl font-bold">Add New Household</h1>
            <div className="rounded-lg bg-white p-6 shadow-sm">
                <HouseholdForm />
            </div>
        </div>
    )
} 