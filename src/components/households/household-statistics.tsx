"use client"

import { useEffect, useState } from 'react'
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend
} from 'recharts'

interface HouseholdStats {
    totalResidents: number
    voterCount: number
    seniorCount: number
    minorCount: number
    employedCount: number
}

export function HouseholdStatistics({ householdId }: { householdId: string }) {
    const [stats, setStats] = useState<HouseholdStats | null>(null)

    useEffect(() => {
        fetch(`/api/households/${householdId}/statistics`)
            .then(res => res.json())
            .then(setStats)
    }, [householdId])

    if (!stats) return <div>Loading statistics...</div>

    const chartData = [
        { name: 'Total', value: stats.totalResidents },
        { name: 'Voters', value: stats.voterCount },
        { name: 'Seniors', value: stats.seniorCount },
        { name: 'Minors', value: stats.minorCount },
        { name: 'Employed', value: stats.employedCount },
    ]

    return (
        <div className="p-4">
            <h3 className="text-lg font-semibold mb-4">Household Statistics</h3>
            <BarChart width={600} height={300} data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#8884d8" />
            </BarChart>
        </div>
    )
} 