"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

interface DeleteHouseholdButtonProps {
    householdId: string
}

export function DeleteHouseholdButton({ householdId }: DeleteHouseholdButtonProps) {
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this household? This will also remove all resident associations.")) return

        setLoading(true)

        try {
            const res = await fetch(`/api/households/${householdId}`, {
                method: "DELETE",
            })

            if (!res.ok) {
                const error = await res.json()
                throw new Error(error.message)
            }

            router.push("/dashboard/households")
            router.refresh()
        } catch (error) {
            alert(error instanceof Error ? error.message : "An unknown error occurred")
            setLoading(false)
        }
    }

    return (
        <button
            onClick={handleDelete}
            disabled={loading}
            className="rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-500 disabled:opacity-50"
        >
            {loading ? "Deleting..." : "Delete Household"}
        </button>
    )
} 