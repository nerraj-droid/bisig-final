import { getServerSession } from "next-auth";
import { authOptions } from "../../api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import CertificatesPage from "./certificates/page";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  const [totalResidents, totalHouseholds, mappedHouseholds] = await Promise.all([
    prisma.resident.count(),
    prisma.household.count(),
    prisma.household.count({
      where: {
        latitude: { not: null },
        longitude: { not: null },
      },
    }),
  ]);

  const stats = [
    {
      name: "Total Residents",
      value: totalResidents,
      href: "/dashboard/residents",
    },
    {
      name: "Total Households",
      value: totalHouseholds,
      href: "/dashboard/households",
    },
    {
      name: "Mapped Households",
      value: mappedHouseholds,
      href: "/dashboard/map",
      detail: `${Math.round((mappedHouseholds / totalHouseholds) * 100)}% mapped`,
    },
  ];

  return (
    <div className="rounded-lg bg-white p-8 shadow-sm">
      <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
      <p className="mt-2 text-gray-600">Welcome to your dashboard, {session?.user?.name || session?.user?.email}</p>
      <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <Link
            key={stat.name}
            href={stat.href}
            className="block rounded-lg bg-white p-6 shadow-sm transition hover:bg-gray-50"
          >
            <dt className="text-sm font-medium text-gray-500">{stat.name}</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">{stat.value}</dd>
            {stat.detail && <div className="mt-1 text-sm text-gray-500">{stat.detail}</div>}
          </Link>
        ))}
      </div>
      <CertificatesPage />
    </div>
  );
}
