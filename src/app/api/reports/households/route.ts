import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "../../auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"

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
                { houseNo: { contains: filter, mode: "insensitive" } },
                { street: { contains: filter, mode: "insensitive" } },
                { barangay: { contains: filter, mode: "insensitive" } },
            ],
        } : {}

        const households = await prisma.household.findMany({
            where,
            include: {
                residents: {
                    select: {
                        firstName: true,
                        lastName: true,
                        gender: true,
                        birthDate: true,
                        civilStatus: true,
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        })

        if (format === "csv") {
            const csvRows = [
                // Header
                [
                    "House No",
                    "Street",
                    "Barangay",
                    "City",
                    "Province",
                    "ZIP Code",
                    "Total Residents",
                    "Mapped",
                    "Created At",
                ].join(","),
                // Data rows
                ...households.map((h: {
                    houseNo: string,
                    street: string,
                    barangay: string,
                    city: string,
                    province: string,
                    zipCode: string,
                    latitude: number | null,
                    longitude: number | null,
                    createdAt: Date,
                    residents: any[]
                }) => [
                    h.houseNo,
                    h.street,
                    h.barangay,
                    h.city,
                    h.province,
                    h.zipCode,
                    h.residents.length,
                    h.latitude && h.longitude ? "Yes" : "No",
                    new Date(h.createdAt).toLocaleDateString(),
                ].join(","))
            ]

            return new Response(csvRows.join("\n"), {
                headers: {
                    "Content-Type": "text/csv",
                    "Content-Disposition": `attachment; filename="households-${new Date().toISOString().split("T")[0]}.csv"`,
                },
            })
        }

        return NextResponse.json(households)
    } catch (error) {
        console.error(error)
        return NextResponse.json(
            { message: "Something went wrong" },
            { status: 500 }
        )
    }
} 