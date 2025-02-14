"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

interface DeleteResidentButtonProps {
    residentId: string
}

export function DeleteResidentButton({ residentId }: DeleteResidentButtonProps) {
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this resident?")) return

        setLoading(true)

        try {
            const res = await fetch(`/api/residents/${residentId}`, {
                method: "DELETE",
            })

            if (!res.ok) {
                const error = await res.json()
                throw new Error(error.message)
            }

            router.push("/dashboard/residents")
            router.refresh()
        } catch (error) {
            alert(error.message)
            setLoading(false)
        }
    }

    return (
        <button
            onClick={handleDelete}
            disabled={loading}
            className="rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-500 disabled:opacity-50"
        >
            {loading ? "Deleting..." : "Delete Resident"}
        </button>
    )
} 