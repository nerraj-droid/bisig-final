import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "../../auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"
import { Prisma } from "@prisma/client"

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions)
        if (!session) {
            return NextResponse.json(
                { message: "Unauthorized" },
                { status: 401 }
            )
        }

        const { searchParams } = new URL(req.url)
        const format = searchParams.get("format")
        const filter = searchParams.get("filter")

        let where: Prisma.HouseholdWhereInput = {}

        if (filter) {
            where = {
                OR: [
                    { houseNo: { contains: filter, mode: Prisma.QueryMode.insensitive } },
                    { street: { contains: filter, mode: Prisma.QueryMode.insensitive } },
                    { barangay: { contains: filter, mode: Prisma.QueryMode.insensitive } }
                ]
            }
        }

        const households = await prisma.household.findMany({
            where,
            include: {
                Resident: true
            }
        })

        if (!households) {
            return NextResponse.json(
                { message: "No households found" },
                { status: 404 }
            )
        }

        if (format === "csv") {
            const headers = [
                "House Number",
                "Street",
                "Barangay",
                "City",
                "Province",
                "Zip Code",
                "Latitude",
                "Longitude",
                "Created At",
                "Number of Residents"
            ]

            const rows = households.map(h => [
                h.houseNo,
                h.street,
                h.barangay,
                h.city,
                h.province,
                h.zipCode,
                h.latitude,
                h.longitude,
                h.createdAt.toISOString(),
                h.Resident.length
            ])

            const csvContent = [
                headers.join(","),
                ...rows.map(row => row.map(cell => `"${cell}"`).join(","))
            ].join("\n")

            return new NextResponse(csvContent, {
                headers: {
                    "Content-Type": "text/csv",
                    "Content-Disposition": `attachment; filename="households-${new Date().toISOString().split("T")[0]}.csv"`
                }
            })
        }

        return NextResponse.json(households)
    } catch (error) {
        console.error("Error fetching households:", error)
        return NextResponse.json(
            { message: "Failed to fetch households" },
            { status: 500 }
        )
    }
} 
