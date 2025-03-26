import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "../../auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"
import { Role } from "@prisma/client"

// Get barangay information
export async function GET() {
    try {
        const session = await getServerSession(authOptions)

        // Everyone can read barangay info, no authorization required for GET

        const barangayInfo = await prisma.BarangayInfo.findFirst({
            where: { id: "1" },
        }) || {
            id: "1",
            name: "",
            district: "",
            city: "",
            province: "",
            address: "",
            contactNumber: "",
            email: "",
            website: "",
            postalCode: "",
            logo: "",
            headerImage: "",
            footerText: ""
        }

        return NextResponse.json(barangayInfo)
    } catch (error) {
        console.error("Error fetching barangay info:", error)
        return NextResponse.json(
            { message: "Failed to fetch barangay information" },
            { status: 500 }
        )
    }
}

// Update barangay information
export async function PUT(req: Request) {
    try {
        const session = await getServerSession(authOptions)

        // Only admins and captains can update barangay info
        if (!session?.user || (session.user.role !== Role.SUPER_ADMIN && session.user.role !== Role.CAPTAIN)) {
            return NextResponse.json(
                { message: "Unauthorized. Only administrators and captains can update barangay information." },
                { status: 401 }
            )
        }

        try {
            const data = await req.json()
            const {
                id,
                name,
                district,
                city,
                province,
                address,
                contactNumber,
                email,
                website,
                postalCode,
                logo,
                headerImage,
                footerText
            } = data

            // Validate required fields
            if (!name || !city || !province) {
                return NextResponse.json(
                    { message: "Missing required fields" },
                    { status: 400 }
                )
            }

            // Check if record exists
            const existingInfo = await prisma.BarangayInfo.findFirst({
                where: { id: id || "1" },
            })

            let barangayInfo

            if (existingInfo) {
                // Update existing record
                barangayInfo = await prisma.BarangayInfo.update({
                    where: { id: id || "1" },
                    data: {
                        name,
                        district,
                        city,
                        province,
                        address,
                        contactNumber,
                        email,
                        website,
                        postalCode,
                        logo,
                        headerImage,
                        footerText,
                        updatedAt: new Date(),
                    },
                })
            } else {
                // Create new record
                barangayInfo = await prisma.BarangayInfo.create({
                    data: {
                        id: id || "1",
                        name,
                        district,
                        city,
                        province,
                        address,
                        contactNumber,
                        email,
                        website,
                        postalCode,
                        logo,
                        headerImage,
                        footerText,
                    },
                })
            }

            return NextResponse.json(barangayInfo)
        } catch (jsonError) {
            console.error("Error parsing request body:", jsonError)
            return NextResponse.json(
                { message: "Invalid request format" },
                { status: 400 }
            )
        }
    } catch (error) {
        console.error("Error updating barangay info:", error)
        return NextResponse.json(
            { message: "Failed to update barangay information" },
            { status: 500 }
        )
    }
} 