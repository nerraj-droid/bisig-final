"use client"

import { useEffect, useState } from 'react'
import { format } from 'date-fns'

interface HistoryEntry {
    id: string
    action: string
    changes: any
    createdBy: string
    createdAt: string
}

export function HouseholdHistory({ householdId }: { householdId: string }) {
    const [history, setHistory] = useState<HistoryEntry[]>([])

    useEffect(() => {
        fetch(`/api/households/${householdId}/history`)
            .then(res => res.json())
            .then(setHistory)
    }, [householdId])

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold">History</h3>
            <div className="space-y-2">
                {history.map(entry => (
                    <div key={entry.id} className="border p-4 rounded-md">
                        <div className="flex justify-between">
                            <span className="font-medium">{entry.action}</span>
                            <span className="text-gray-500">
                                {format(new Date(entry.createdAt), 'PPpp')}
                            </span>
                        </div>
                        <div className="text-sm text-gray-600">
                            By: {entry.createdBy}
                        </div>
                        <pre className="mt-2 text-sm bg-gray-50 p-2 rounded">
                            {JSON.stringify(entry.changes, null, 2)}
                        </pre>
                    </div>
                ))}
            </div>
        </div>
    )
} 