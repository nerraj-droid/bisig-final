import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ResidentList } from "@/components/residents/resident-list";

export default async function ResidentsPage() {
  const initialResidents = await prisma.resident
    .findMany({
      take: 10,
      select: {
        id: true,
        firstName: true,
        middleName: true,
        lastName: true,
        extensionName: true,
        birthDate: true,
        gender: true,
        civilStatus: true,
        contactNo: true,
        email: true,
        occupation: true,
        voterInBarangay: true,
        headOfHousehold: true,
        Household: {
          select: {
            houseNo: true,
            street: true,
          },
        },
      },
      orderBy: { lastName: "asc" },
    })
    .then((residents) =>
      residents.map((resident) => ({
        ...resident,
        birthDate: resident.birthDate.toISOString(),
      }))
    );

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Residents</h1>
        <Link
          href="/dashboard/residents/new"
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500"
        >
          Add Resident
        </Link>
      </div>
      <ResidentList initialResidents={initialResidents} />
    </div>
  );
}
