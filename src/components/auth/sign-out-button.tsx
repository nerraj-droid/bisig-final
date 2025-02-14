"use client"

import { signOut } from "next-auth/react"

export function SignOutButton() {
    return (
        <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="ml-4 rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white hover:bg-red-500"
        >
            Sign Out
        </button>
    )
} 