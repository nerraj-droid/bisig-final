import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ResidentList } from "@/components/residents/resident-list";
export default async function ResidentsPage() {
  const initialResidents = await prisma.resident
    .findMany({
      take: 10,
      include: { household: true },
      orderBy: { lastName: "asc" },
    })
    .then((residents) =>
      residents.map((resident) => ({
        ...resident,
        birthDate: resident.birthDate.toISOString(),
        createdAt: resident.createdAt.toISOString(),
        updatedAt: resident.updatedAt.toISOString(),
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
