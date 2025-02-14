import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "../auth/[...nextauth]/route"
import { differenceInYears } from "date-fns"


const PAGE_SIZE = 10

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (!session) {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        const searchParams = request.nextUrl.searchParams
        const query = searchParams.get("query") || ""
        const barangay = searchParams.get("barangay")
        const gender = searchParams.get("gender")
        const civilStatus = searchParams.get("civilStatus")
        const ageRange = searchParams.get("ageRange")
        const householdSize = searchParams.get("householdSize")
        const page = parseInt(searchParams.get("page") || "1")
        const skip = (page - 1) * PAGE_SIZE

        console.log("Search params:", {
            query,
            barangay,
            gender,
            civilStatus,
            ageRange,
            householdSize,
            page,
            skip
        })

        // Build the where clause for residents
        const residentsWhere: any = {}
        const householdsWhere: any = {}

        // Add text search if query exists
        if (query) {
            residentsWhere.OR = [
                { firstName: { contains: query, mode: "insensitive" } },
                { lastName: { contains: query, mode: "insensitive" } },
            ]
            householdsWhere.OR = [
                { houseNo: { contains: query, mode: "insensitive" } },
                { street: { contains: query, mode: "insensitive" } },
                { barangay: { contains: query, mode: "insensitive" } },
            ]
        }

        // Add filters
        if (barangay) {
            residentsWhere.household = { barangay }
            householdsWhere.barangay = barangay
        }
        if (gender) {
            residentsWhere.gender = gender
        }
        if (civilStatus) {
            residentsWhere.civilStatus = civilStatus
        }
        if (ageRange) {
            const [min, max] = ageRange.split("-").map(Number)
            const today = new Date()
            const minDate = new Date(today.getFullYear() - (max || 200), today.getMonth(), today.getDate())
            const maxDate = new Date(today.getFullYear() - min, today.getMonth(), today.getDate())

            residentsWhere.birthDate = {
                lte: maxDate,
                gte: minDate,
            }
        }
        if (householdSize) {
            const [min, max] = householdSize.split("-").map(Number)
            householdsWhere.residents = {
                some: {},
                _count: {
                    gte: min,
                    lte: max || 999,
                },
            }
        }

        console.log("Query conditions:", {
            residentsWhere,
            householdsWhere
        })

        // Execute queries
        const [residents, households, totalResidents, totalHouseholds] = await Promise.all([
            prisma.resident.findMany({
                where: residentsWhere,
                include: {
                    household: true,
                },
                take: PAGE_SIZE,
                skip,
                orderBy: { lastName: 'asc' },
            }),
            prisma.household.findMany({
                where: householdsWhere,
                include: {
                    residents: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                        },
                    },
                },
                take: PAGE_SIZE,
                skip,
                orderBy: { createdAt: 'desc' },
            }),
            prisma.resident.count({ where: residentsWhere }),
            prisma.household.count({ where: householdsWhere }),
        ])

        console.log("Search results:", {
            residentsCount: residents.length,
            householdsCount: households.length,
            totalResidents,
            totalHouseholds
        })

        return NextResponse.json({
            residents: residents.map(resident => ({
                ...resident,
                age: differenceInYears(new Date(), resident.birthDate),
            })),
            households,
            pagination: {
                totalResidents,
                totalHouseholds,
                pageSize: PAGE_SIZE,
                currentPage: page,
                totalPages: Math.ceil(Math.max(totalResidents, totalHouseholds) / PAGE_SIZE),
            }
        })
    } catch (error) {
        console.error("Search error:", error)
        return new NextResponse("Internal Server Error", { status: 500 })
    }
} 