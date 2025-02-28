import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { DeleteResidentButton } from "@/components/residents/delete-resident-button"
import { format } from "date-fns"

interface PageProps {
    params: Promise<{
        residentId: string;
    }>;
}


export default async function ResidentPage({ params }: PageProps) {
    const { residentId } = await params

    const resident = await prisma.resident.findUnique({
        where: { id: residentId },
        select: {
            id: true,
            firstName: true,
            middleName: true,
            lastName: true,
            extensionName: true,
            alias: true,
            birthDate: true,
            gender: true,
            civilStatus: true,
            contactNo: true,
            email: true,
            occupation: true,
            educationalAttainment: true,
            bloodType: true,
            religion: true,
            ethnicGroup: true,
            nationality: true,
            address: true,
            userPhoto: true,
            motherMaidenName: true,
            motherMiddleName: true,
            motherFirstName: true,
            fatherName: true,
            fatherLastName: true,
            fatherMiddleName: true,
            familySerialNumber: true,
            headOfHousehold: true,
            familyRole: true,
            voterInBarangay: true,
            votersIdNumber: true,
            lastVotingParticipationDate: true,
            Household: {
                select: {
                    id: true,
                    houseNo: true,
                    street: true,
                    barangay: true,
                    city: true,
                    province: true,
                    zipCode: true,
                },
            },
        },
    })

    if (!resident) {
        notFound()
    }

    return (
        <div>
            <div className="mb-6 flex items-center justify-between">
                <h1 className="text-2xl font-bold">Resident Details</h1>
                <div className="flex space-x-4">
                    <Link
                        href={`/dashboard/residents/${resident.id}/edit`}
                        className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500"
                    >
                        Edit Resident
                    </Link>
                    <DeleteResidentButton residentId={resident.id} />
                </div>
            </div>

            <div className="grid gap-6">
                <div className="rounded-lg bg-white p-6 shadow-sm">
                    <h2 className="mb-4 text-lg font-semibold">Personal Information</h2>
                    <dl className="grid gap-4 md:grid-cols-2">
                        <div>
                            <dt className="text-sm font-medium text-gray-500">Full Name</dt>
                            <dd className="text-gray-900">
                                {resident.lastName}, {resident.firstName} {resident.middleName}
                                {resident.extensionName && ` ${resident.extensionName}`}
                            </dd>
                        </div>
                        {resident.alias && (
                            <div>
                                <dt className="text-sm font-medium text-gray-500">Alias</dt>
                                <dd className="text-gray-900">{resident.alias}</dd>
                            </div>
                        )}
                        <div>
                            <dt className="text-sm font-medium text-gray-500">Birth Date</dt>
                            <dd className="text-gray-900">
                                {format(new Date(resident.birthDate), "MMMM d, yyyy")}
                            </dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-gray-500">Gender</dt>
                            <dd className="text-gray-900">{resident.gender}</dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-gray-500">Civil Status</dt>
                            <dd className="text-gray-900">{resident.civilStatus}</dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-gray-500">Contact Number</dt>
                            <dd className="text-gray-900">{resident.contactNo || "N/A"}</dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-gray-500">Email</dt>
                            <dd className="text-gray-900">{resident.email || "N/A"}</dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-gray-500">Occupation</dt>
                            <dd className="text-gray-900">{resident.occupation || "N/A"}</dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-gray-500">Educational Attainment</dt>
                            <dd className="text-gray-900">{resident.educationalAttainment || "N/A"}</dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-gray-500">Blood Type</dt>
                            <dd className="text-gray-900">{resident.bloodType || "N/A"}</dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-gray-500">Religion</dt>
                            <dd className="text-gray-900">{resident.religion || "N/A"}</dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-gray-500">Ethnic Group</dt>
                            <dd className="text-gray-900">{resident.ethnicGroup || "N/A"}</dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-gray-500">Nationality</dt>
                            <dd className="text-gray-900">{resident.nationality}</dd>
                        </div>
                    </dl>
                </div>

                <div className="rounded-lg bg-white p-6 shadow-sm">
                    <h2 className="mb-4 text-lg font-semibold">Family Information</h2>
                    <dl className="grid gap-4 md:grid-cols-2">
                        <div>
                            <dt className="text-sm font-medium text-gray-500">Mother's Name</dt>
                            <dd className="text-gray-900">
                                {resident.motherFirstName && resident.motherMaidenName
                                    ? `${resident.motherFirstName} ${resident.motherMiddleName || ""} ${resident.motherMaidenName}`
                                    : "N/A"}
                            </dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-gray-500">Father's Name</dt>
                            <dd className="text-gray-900">
                                {resident.fatherName && resident.fatherLastName
                                    ? `${resident.fatherName} ${resident.fatherMiddleName || ""} ${resident.fatherLastName}`
                                    : "N/A"}
                            </dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-gray-500">Family Serial Number</dt>
                            <dd className="text-gray-900">{resident.familySerialNumber || "N/A"}</dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-gray-500">Family Role</dt>
                            <dd className="text-gray-900">{resident.familyRole || "N/A"}</dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-gray-500">Head of Household</dt>
                            <dd className="text-gray-900">{resident.headOfHousehold ? "Yes" : "No"}</dd>
                        </div>
                    </dl>
                </div>

                <div className="rounded-lg bg-white p-6 shadow-sm">
                    <h2 className="mb-4 text-lg font-semibold">Voter Information</h2>
                    <dl className="grid gap-4 md:grid-cols-2">
                        <div>
                            <dt className="text-sm font-medium text-gray-500">Voter in Barangay</dt>
                            <dd className="text-gray-900">{resident.voterInBarangay ? "Yes" : "No"}</dd>
                        </div>
                        {resident.voterInBarangay && (
                            <>
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">Voter's ID Number</dt>
                                    <dd className="text-gray-900">{resident.votersIdNumber || "N/A"}</dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">Last Voting Participation</dt>
                                    <dd className="text-gray-900">
                                        {resident.lastVotingParticipationDate
                                            ? format(new Date(resident.lastVotingParticipationDate), "MMMM d, yyyy")
                                            : "N/A"}
                                    </dd>
                                </div>
                            </>
                        )}
                    </dl>
                </div>

                <div className="rounded-lg bg-white p-6 shadow-sm">
                    <h2 className="mb-4 text-lg font-semibold">Household Information</h2>
                    {resident.Household ? (
                        <>
                            <div className="mb-4">
                                <div className="font-medium text-gray-900">
                                    {resident.Household.houseNo} {resident.Household.street}
                                </div>
                                <div className="text-sm text-gray-500">
                                    {resident.Household.barangay}, {resident.Household.city},
                                    {resident.Household.province} {resident.Household.zipCode}
                                </div>
                            </div>
                            <Link
                                href={`/dashboard/households/${resident.Household.id}`}
                                className="text-sm text-blue-600 hover:text-blue-500"
                            >
                                View Household Details
                            </Link>
                        </>
                    ) : (
                        <div className="flex items-center justify-between">
                            <p className="text-gray-500">No household assigned</p>
                            <Link
                                href={`/dashboard/residents/${resident.id}/edit`}
                                className="text-sm text-blue-600 hover:text-blue-500"
                            >
                                Assign to Household
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
} 