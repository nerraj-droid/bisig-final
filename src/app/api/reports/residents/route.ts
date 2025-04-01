import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
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

        let where: Prisma.ResidentWhereInput = {}

        if (filter) {
            where = {
                OR: [
                    { firstName: { contains: filter, mode: Prisma.QueryMode.insensitive } },
                    { lastName: { contains: filter, mode: Prisma.QueryMode.insensitive } },
                    { middleName: { contains: filter, mode: Prisma.QueryMode.insensitive } }
                ]
            }
        }

        const residents = await prisma.resident.findMany({
            where,
            include: {
                Household: true
            }
        })

        if (!residents || residents.length === 0) {
            return NextResponse.json(
                { message: "No residents found" },
                { status: 404 }
            )
        }

        if (format === "csv") {
            const headers = [
                "First Name",
                "Middle Name",
                "Last Name",
                "Gender",
                "Birth Date",
                "Civil Status",
                "Voter Status",
                "House Number",
                "Street",
                "Barangay",
                "Created At"
            ]

            const rows = residents.map(r => [
                r.firstName,
                r.middleName || "",
                r.lastName,
                r.gender,
                r.birthDate.toISOString(),
                r.civilStatus,
                r.voterInBarangay ? "Yes" : "No",
                r.Household?.houseNo || "",
                r.Household?.street || "",
                r.Household?.barangay || "",
                r.createdAt.toISOString()
            ])

            const csvContent = [
                headers.join(","),
                ...rows.map(row => row.map(cell => `"${cell}"`).join(","))
            ].join("\n")

            return new NextResponse(csvContent, {
                headers: {
                    "Content-Type": "text/csv",
                    "Content-Disposition": `attachment; filename="residents-${new Date().toISOString().split("T")[0]}.csv"`
                }
            })
        }

        return NextResponse.json(residents)
    } catch (error) {
        console.error("Error fetching residents:", error)
        return NextResponse.json(
            { message: "Failed to fetch residents" },
            { status: 500 }
        )
    }
} 
