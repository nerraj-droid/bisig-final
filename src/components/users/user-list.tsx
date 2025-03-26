"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Role } from "@prisma/client"
import { Search, Trash2, Edit, UserPlus } from "lucide-react"
import Link from "next/link"

interface User {
    id: string
    name: string | null
    email: string
    role: Role
}

interface UserListProps {
    initialUsers: User[]
}

export function UserList({ initialUsers }: UserListProps) {
    const [users, setUsers] = useState(initialUsers)
    const [filteredUsers, setFilteredUsers] = useState(initialUsers)
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [searchTerm, setSearchTerm] = useState("")
    const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

    const handleSearch = (term: string) => {
        setSearchTerm(term)
        if (!term.trim()) {
            setFilteredUsers(users)
            return
        }

        const filtered = users.filter(user =>
            user.name?.toLowerCase().includes(term.toLowerCase()) ||
            user.email.toLowerCase().includes(term.toLowerCase()) ||
            user.role.toLowerCase().includes(term.toLowerCase())
        )
        setFilteredUsers(filtered)
    }

    const handleDelete = async (userId: string) => {
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

            const updatedUsers = users.filter(user => user.id !== userId)
            setUsers(updatedUsers)
            setFilteredUsers(
                searchTerm.trim()
                    ? updatedUsers.filter(user =>
                        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        user.email.toLowerCase().includes(searchTerm.toLowerCase()))
                    : updatedUsers
            )
            router.refresh()
        } catch (error) {
            setError(error instanceof Error ? error.message : "An unknown error occurred")
        } finally {
            setLoading(false)
            setConfirmDelete(null)
        }
    }

    const getRoleBadgeStyles = (role: Role) => {
        switch (role) {
            case Role.SUPER_ADMIN:
                return "bg-purple-100 text-purple-800"
            case Role.CAPTAIN:
                return "bg-red-100 text-red-800"
            case Role.SECRETARY:
                return "bg-blue-100 text-blue-800"
            case Role.TREASURER:
                return "bg-amber-100 text-amber-800"
            default:
                return "bg-gray-100 text-gray-800"
        }
    }

    return (
        <div>
            {error && (
                <div className="mb-4 rounded-md bg-red-50 p-4 text-red-500">
                    {error}
                </div>
            )}

            <div className="mb-6 flex items-center justify-between">
                <div className="relative flex-1 max-w-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search users..."
                        value={searchTerm}
                        onChange={(e) => handleSearch(e.target.value)}
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    />
                </div>

                <Link
                    href="/dashboard/users/new"
                    className="inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                    <UserPlus className="mr-2 h-4 w-4" />
                    New User
                </Link>
            </div>

            <div className="overflow-x-auto rounded-md border">
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
                        {filteredUsers.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                                    {searchTerm ? "No users match your search" : "No users found"}
                                </td>
                            </tr>
                        ) : (
                            filteredUsers.map((user) => (
                                <tr key={user.id} className="hover:bg-gray-50">
                                    <td className="whitespace-nowrap px-6 py-4">
                                        {user.name || "N/A"}
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4">
                                        {user.email}
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4">
                                        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${getRoleBadgeStyles(user.role)}`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                                        <div className="flex justify-end items-center space-x-2">
                                            <Link
                                                href={`/dashboard/users/${user.id}/edit`}
                                                className="text-blue-600 hover:text-blue-800"
                                            >
                                                <Edit className="h-4 w-4" />
                                            </Link>
                                            <button
                                                onClick={() => setConfirmDelete(user.id)}
                                                className="text-red-600 hover:text-red-800"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Delete Confirmation Modal */}
            {confirmDelete && (
                <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
                    <div className="bg-white rounded-lg p-6 max-w-sm mx-auto">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Confirm Deletion</h3>
                        <p className="text-sm text-gray-500 mb-6">
                            Are you sure you want to delete this user? This action cannot be undone.
                        </p>
                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={() => setConfirmDelete(null)}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => confirmDelete && handleDelete(confirmDelete)}
                                disabled={loading}
                                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                            >
                                {loading ? "Deleting..." : "Delete"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
} 