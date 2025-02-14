"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

interface User {
    id: string
    name: string | null
    email: string
    role: string
}

interface UserListProps {
    initialUsers: User[]
}

export function UserList({ initialUsers }: UserListProps) {
    const [users, setUsers] = useState(initialUsers)
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleDelete = async (userId: string) => {
        if (!confirm("Are you sure you want to delete this user?")) return

        setLoading(true)
        setError(null)

        try {
            const res = await fetch(`/api/users/${userId}`, {
                method: "DELETE",
            })

            if (!res.ok) {
                const error = await res.json()
                throw new Error(error.message)
            }

            setUsers(users.filter(user => user.id !== userId))
            router.refresh()
        } catch (error) {
            setError(error instanceof Error ? error.message : "An unknown error occurred")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div>
            {error && (
                <div className="mb-4 rounded-md bg-red-50 p-4 text-red-500">
                    {error}
                </div>
            )}
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                Name
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                Email
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                Role
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                        {users.map((user) => (
                            <tr key={user.id}>
                                <td className="whitespace-nowrap px-6 py-4">
                                    {user.name || "N/A"}
                                </td>
                                <td className="whitespace-nowrap px-6 py-4">
                                    {user.email}
                                </td>
                                <td className="whitespace-nowrap px-6 py-4">
                                    <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${user.role === "ADMIN"
                                        ? "bg-purple-100 text-purple-800"
                                        : "bg-green-100 text-green-800"
                                        }`}>
                                        {user.role}
                                    </span>
                                </td>
                                <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                                    <button
                                        onClick={() => handleDelete(user.id)}
                                        disabled={loading}
                                        className="text-red-600 hover:text-red-900 disabled:opacity-50"
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
} 