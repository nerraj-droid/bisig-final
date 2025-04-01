import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "../../auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions)
        if (!session) {
            return NextResponse.json(
                { message: "Unauthorized" },
                { status: 401 }
            )
        }

        // First, get some random residents to associate with relief records
        const residents = await prisma.resident.findMany({
            take: 10,
            orderBy: {
                createdAt: "desc"
            }
        })

        if (residents.length === 0) {
            return NextResponse.json(
                { message: "No residents found to create relief records for" },
                { status: 404 }
            )
        }

        // Create relief record types
        const reliefTypes = [
            "Food Pack",
            "Financial Aid",
            "Medical Supplies",
            "Clothing",
            "Shelter Materials"
        ]

        // Create relief record statuses
        const statuses = ["PENDING", "APPROVED", "DISTRIBUTED", "REJECTED"]

        // Create sample relief records
        const reliefRecords = []

        for (const resident of residents) {
            // Create 1-3 relief records per resident
            const recordCount = Math.floor(Math.random() * 3) + 1

            for (let i = 0; i < recordCount; i++) {
                const randomType = reliefTypes[Math.floor(Math.random() * reliefTypes.length)]
                const randomStatus = statuses[Math.floor(Math.random() * statuses.length)]
                const randomAmount = Math.floor(Math.random() * 5000) + 500 // Random amount between 500 and 5500

                const record = await prisma.reliefRecord.create({
                    data: {
                        type: randomType,
                        amount: randomAmount,
                        status: randomStatus,
                        notes: `Sample relief record for ${resident.firstName} ${resident.lastName}`,
                        residentId: resident.id,
                        // Create some records in the past, some recent
                        createdAt: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000)
                    }
                })

                reliefRecords.push(record)
            }
        }

        return NextResponse.json({
            message: `Successfully created ${reliefRecords.length} sample relief records`,
            count: reliefRecords.length
        })
    } catch (error) {
        console.error("Error creating sample relief records:", error)
        return NextResponse.json(
            { message: "Failed to create sample relief records", error: (error as Error).message },
            { status: 500 }
        )
    }
} 
