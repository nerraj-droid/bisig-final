import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Gender, CivilStatus, Prisma, Role } from "@prisma/client";
import { stringify } from 'csv-stringify/sync';

interface ExtendedSession {
    user?: {
        name?: string | null;
        email?: string | null;
        image?: string | null;
        role?: Role;
        id?: string | null;
    };
}

export async function GET(request: NextRequest) {
    try {
        // Authenticate the user
        const session = await getServerSession(authOptions) as ExtendedSession;
        if (!session?.user) {
            return NextResponse.json(
                { message: "Unauthorized" },
                { status: 401 }
            );
        }

        // Parse query parameters for filtering
        const searchParams = request.nextUrl.searchParams;

        // Build WHERE condition for filtering
        const whereCondition: Prisma.ResidentWhereInput = {};

        // Process gender filter
        const gender = searchParams.get('gender');
        if (gender && (gender === 'MALE' || gender === 'FEMALE')) {
            whereCondition.gender = gender as Gender;
        }

        // Process civil status filter
        const civilStatus = searchParams.get('civilStatus');
        if (civilStatus && ['SINGLE', 'MARRIED', 'WIDOWED', 'DIVORCED', 'SEPARATED'].includes(civilStatus)) {
            whereCondition.civilStatus = civilStatus as CivilStatus;
        }

        // Process voter filter
        const voter = searchParams.get('voter');
        if (voter !== null) {
            whereCondition.voterInBarangay = voter === 'true';
        }

        // Process age group filter
        const ageGroup = searchParams.get('ageGroup');
        if (ageGroup) {
            const today = new Date();

            switch (ageGroup) {
                case 'child':
                    // Children: 0-12 years
                    whereCondition.birthDate = {
                        gte: new Date(today.getFullYear() - 12, today.getMonth(), today.getDate())
                    };
                    break;
                case 'young-adult':
                    // Young Adults: 13-30 years
                    whereCondition.birthDate = {
                        lt: new Date(today.getFullYear() - 12, today.getMonth(), today.getDate()),
                        gte: new Date(today.getFullYear() - 30, today.getMonth(), today.getDate())
                    };
                    break;
                case 'adult':
                    // Adults: 31-60 years
                    whereCondition.birthDate = {
                        lt: new Date(today.getFullYear() - 30, today.getMonth(), today.getDate()),
                        gte: new Date(today.getFullYear() - 60, today.getMonth(), today.getDate())
                    };
                    break;
                case 'senior':
                    // Seniors: 60+ years
                    whereCondition.birthDate = {
                        lt: new Date(today.getFullYear() - 60, today.getMonth(), today.getDate())
                    };
                    break;
            }
        }

        // Fetch residents based on filters
        const residents = await prisma.resident.findMany({
            where: whereCondition,
            include: {
                Household: true,
            },
            orderBy: {
                lastName: 'asc',
            },
        });

        // Format data for CSV
        const data = residents.map(resident => ({
            'ID': resident.id,
            'First Name': resident.firstName,
            'Middle Name': resident.middleName || '',
            'Last Name': resident.lastName,
            'Extension Name': resident.extensionName || '',
            'Birth Date': resident.birthDate ? resident.birthDate.toISOString().split('T')[0] : '',
            'Gender': resident.gender,
            'Civil Status': resident.civilStatus,
            'Contact Number': resident.contactNo || '',
            'Email': resident.email || '',
            'Occupation': resident.occupation || '',
            'Voter in Barangay': resident.voterInBarangay ? 'Yes' : 'No',
            'Father Name': resident.fatherName || '',
            'Father Middle Name': resident.fatherMiddleName || '',
            'Father Last Name': resident.fatherLastName || '',
            'Mother First Name': resident.motherFirstName || '',
            'Mother Middle Name': resident.motherMiddleName || '',
            'Mother Maiden Name': resident.motherMaidenName || '',
            'House No': resident.Household?.houseNo || '',
            'Street': resident.Household?.street || '',
            'Barangay': resident.Household?.barangay || '',
            'City': resident.Household?.city || '',
            'Province': resident.Household?.province || '',
        }));

        // Generate CSV from data
        const csvOutput = stringify(data, {
            header: true,
        });

        // Generate filename with date
        const date = new Date();
        const formattedDate = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
        const filename = `residents-data-${formattedDate}.csv`;

        // Return CSV file
        return new NextResponse(csvOutput, {
            headers: {
                'Content-Type': 'text/csv',
                'Content-Disposition': `attachment; filename="${filename}"`,
            },
        });
    } catch (error) {
        console.error("Error exporting residents:", error);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
} 
