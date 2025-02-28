import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "../../../auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"

export async function GET(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions)
        if (!session) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
        }

        const stats = await prisma.householdStatistics.findUnique({
            where: { householdId: params.id }
        })

        if (!stats) {
            return NextResponse.json({ message: "Statistics not found" }, { status: 404 })
        }

        return NextResponse.json(stats)
    } catch (error) {
        console.error(error)
        return NextResponse.json({ message: "Failed to fetch statistics" }, { status: 500 })
    }
}

export async function PUT(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions)
        if (!session) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
        }

        const household = await prisma.household.findUnique({
            where: { id: params.id },
            include: { residents: true }
        })

        if (!household) {
            return NextResponse.json({ message: "Household not found" }, { status: 404 })
        }

        // Calculate statistics
        const now = new Date()
        const stats = {
            totalResidents: household.residents.length,
            voterCount: household.residents.filter(r => r.voterInBarangay).length,
            seniorCount: household.residents.filter(r => {
                const age = Math.floor((now.getTime() - r.birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000))
                return age >= 60
            }).length,
            minorCount: household.residents.filter(r => {
                const age = Math.floor((now.getTime() - r.birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000))
                return age < 18
            }).length,
            employedCount: household.residents.filter(r => r.occupation).length
        }

        // Update statistics
        const updatedStats = await prisma.householdStatistics.upsert({
            where: { householdId: params.id },
            create: {
                householdId: params.id,
                ...stats
            },
            update: stats
        })

        return NextResponse.json(updatedStats)
    } catch (error) {
        console.error(error)
        return NextResponse.json({ message: "Failed to update statistics" }, { status: 500 })
    }
} 