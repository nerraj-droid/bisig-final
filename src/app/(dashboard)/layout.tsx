import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { SignOutButton } from "@/components/auth/sign-out-button";
import Link from "next/link";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  // Navigation items based on user role
  const navigationItems = [
    { href: "/dashboard", label: "Dashboard", roles: ["SUPER_ADMIN", "CAPTAIN", "SECRETARY", "TREASURER"] },
    { href: "/dashboard/residents", label: "Residents", roles: ["SUPER_ADMIN", "CAPTAIN", "SECRETARY"] },
    { href: "/dashboard/households", label: "Households", roles: ["SUPER_ADMIN", "CAPTAIN", "SECRETARY"] },
    { href: "/dashboard/map", label: "Map", roles: ["SUPER_ADMIN", "CAPTAIN", "SECRETARY"] },
    { href: "/dashboard/certificates", label: "Certificates", roles: ["SUPER_ADMIN", "CAPTAIN", "SECRETARY"] },
    { href: "/dashboard/reports", label: "Reports", roles: ["SUPER_ADMIN", "CAPTAIN", "TREASURER"] },
    { href: "/dashboard/users", label: "Users", roles: ["SUPER_ADMIN", "CAPTAIN"] },
  ];

  const userRole = session.user.role || "SECRETARY";

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 justify-between">
            <div className="flex">
              <div className="flex flex-shrink-0 items-center">
                <span className="text-2xl font-bold">BISIG</span>
              </div>
              <div className="ml-6 flex items-center space-x-4">
                {navigationItems
                  .filter(item => item.roles.includes(userRole))
                  .map(item => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="text-gray-700 hover:text-gray-900"
                    >
                      {item.label}
                    </Link>
                  ))}
              </div>
            </div>
            <div className="flex items-center">
              <span className="text-gray-700">
                Welcome, {session.user.name || session.user.email} ({userRole})
              </span>
              <SignOutButton />
            </div>
          </div>
        </div>
      </nav>
      <main className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">{children}</main>
    </div>
  );
}
