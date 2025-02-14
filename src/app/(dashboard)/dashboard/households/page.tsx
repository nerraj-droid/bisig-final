import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { HouseholdList } from "@/components/households/household-list";

export default async function HouseholdsPage() {
  const initialHouseholds = await prisma.household
    .findMany({
      take: 10,
      include: { residents: true },
      orderBy: { createdAt: "desc" },
    })
    .then((households) =>
      households.map((household) => ({
        ...household,
        createdAt: household.createdAt.toISOString(),
        updatedAt: household.updatedAt.toISOString(),
      }))
    );

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Households</h1>
        <Link
          href="/dashboard/households/new"
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500"
        >
          Add Household
        </Link>
      </div>
      <HouseholdList initialHouseholds={initialHouseholds} />
    </div>
  );
}
