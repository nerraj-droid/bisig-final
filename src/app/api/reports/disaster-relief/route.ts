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
        const reliefType = searchParams.get("reliefType") || "summary"

        // Get all relief records with related data
        const reliefRecords = await prisma.reliefRecord.findMany({
            include: {
                resident: {
                    include: {
                        Household: true
                    }
                }
            },
            orderBy: {
                createdAt: "desc"
            }
        })

        if (!reliefRecords || reliefRecords.length === 0) {
            return NextResponse.json(
                { message: "No relief records found" },
                { status: 404 }
            )
        }

        if (format === "csv") {
            if (reliefType === "summary") {
                // Summary report - one row per relief record
                const headers = [
                    "Date",
                    "Type",
                    "Amount",
                    "Status",
                    "Resident Name",
                    "House Number",
                    "Street",
                    "Barangay",
                    "Notes"
                ]

                const rows = reliefRecords.map((r: any) => [
                    r.createdAt.toISOString(),
                    r.type,
                    r.amount.toString(),
                    r.status,
                    `${r.resident.firstName} ${r.resident.lastName}`,
                    r.resident.Household?.houseNo || "",
                    r.resident.Household?.street || "",
                    r.resident.Household?.barangay || "",
                    r.notes || ""
                ])

                const csvContent = [
                    headers.join(","),
                    ...rows.map((row: string[]) => row.map((cell: string) => `"${cell}"`).join(","))
                ].join("\n")

                return new NextResponse(csvContent, {
                    headers: {
                        "Content-Type": "text/csv",
                        "Content-Disposition": `attachment; filename="disaster-relief-summary-${new Date().toISOString().split("T")[0]}.csv"`
                    }
                })
            } else {
                // Detailed report - includes all resident information
                const headers = [
                    "Date",
                    "Type",
                    "Amount",
                    "Status",
                    "First Name",
                    "Middle Name",
                    "Last Name",
                    "Gender",
                    "Birth Date",
                    "Civil Status",
                    "Contact No",
                    "House Number",
                    "Street",
                    "Barangay",
                    "City",
                    "Province",
                    "Zip Code",
                    "Notes"
                ]

                const rows = reliefRecords.map((r: any) => [
                    r.createdAt.toISOString(),
                    r.type,
                    r.amount.toString(),
                    r.status,
                    r.resident.firstName,
                    r.resident.middleName || "",
                    r.resident.lastName,
                    r.resident.gender,
                    r.resident.birthDate.toISOString(),
                    r.resident.civilStatus,
                    r.resident.contactNo || "",
                    r.resident.Household?.houseNo || "",
                    r.resident.Household?.street || "",
                    r.resident.Household?.barangay || "",
                    r.resident.Household?.city || "",
                    r.resident.Household?.province || "",
                    r.resident.Household?.zipCode || "",
                    r.notes || ""
                ])

                const csvContent = [
                    headers.join(","),
                    ...rows.map((row: string[]) => row.map((cell: string) => `"${cell}"`).join(","))
                ].join("\n")

                return new NextResponse(csvContent, {
                    headers: {
                        "Content-Type": "text/csv",
                        "Content-Disposition": `attachment; filename="disaster-relief-detailed-${new Date().toISOString().split("T")[0]}.csv"`
                    }
                })
            }
        }

        return NextResponse.json(reliefRecords)
    } catch (error) {
        console.error("Error fetching relief records:", error)
        return NextResponse.json(
            { message: "Failed to fetch relief records" },
            { status: 500 }
        )
    }
} 
