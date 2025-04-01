import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { SignOutButton } from "@/components/auth/sign-out-button";
import Link from "next/link";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);

  // Navigation items based on user role
  const navigationItems = [
    { href: "/dashboard", label: "Dashboard", roles: ["SUPER_ADMIN", "CAPTAIN", "SECRETARY", "TREASURER"] },
    { href: "/dashboard/residents", label: "Residents", roles: ["SUPER_ADMIN", "CAPTAIN", "SECRETARY"] },
    { href: "/dashboard/households", label: "Households", roles: ["SUPER_ADMIN", "CAPTAIN", "SECRETARY"] },
    { href: "/dashboard/map", label: "Map", roles: ["SUPER_ADMIN", "CAPTAIN", "SECRETARY"] },
    { href: "/dashboard/certificates", label: "Certificates", roles: ["SUPER_ADMIN", "CAPTAIN", "SECRETARY"] },
    { href: "/dashboard/reports", label: "Reports", roles: ["SUPER_ADMIN", "CAPTAIN", "TREASURER"] },
    { href: "/dashboard/finance", label: "Finance", roles: ["SUPER_ADMIN", "CAPTAIN", "TREASURER"] },
    { href: "/dashboard/users", label: "Users", roles: ["SUPER_ADMIN", "CAPTAIN"] },
  ];

  const userRole = session?.user.role || "SECRETARY";

  return (
    <div className="min-h-screen bg-gray-100">
      <main className="w-full">{children}</main>
    </div>
  );
}
