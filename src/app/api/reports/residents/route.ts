import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "../../auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"
import { differenceInYears } from "date-fns"

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
        const format = searchParams.get("format") || "json"
        const filter = searchParams.get("filter")

        const where = filter ? {
            OR: [
                { firstName: { contains: filter, mode: "insensitive" } },
                { lastName: { contains: filter, mode: "insensitive" } },
                {
                    household: {
                        OR: [
                            { houseNo: { contains: filter, mode: "insensitive" } },
                            { street: { contains: filter, mode: "insensitive" } },
                            { barangay: { contains: filter, mode: "insensitive" } },
                        ],
                    },
                },
            ],
        } : {}

        const residents = await prisma.resident.findMany({
            where,
            include: {
                household: true,
            },
            orderBy: {
                lastName: "asc",
            },
        })

        if (format === "csv") {
            const csvRows = [
                // Header
                [
                    "Last Name",
                    "First Name",
                    "Gender",
                    "Birth Date",
                    "Age",
                    "Civil Status",
                    "Contact No",
                    "House No",
                    "Street",
                    "Barangay",
                ].join(","),
                // Data rows
                ...residents.map(r => [
                    r.lastName,
                    r.firstName,
                    r.gender,
                    r.birthDate.toLocaleDateString(),
                    differenceInYears(new Date(), r.birthDate).toString(),
                    r.civilStatus,
                    r.contactNo || "",
                    r.household.houseNo,
                    r.household.street,
                    r.household.barangay,
                ].join(","))
            ]

            return new Response(csvRows.join("\n"), {
                headers: {
                    "Content-Type": "text/csv",
                    "Content-Disposition": `attachment; filename="residents-${new Date().toISOString().split("T")[0]}.csv"`,
                },
            })
        }

        return NextResponse.json(residents)
    } catch (error) {
        console.error(error)
        return NextResponse.json(
            { message: "Something went wrong" },
            { status: 500 }
        )
    }
} 