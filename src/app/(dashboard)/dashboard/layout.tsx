import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import ClientDashboardLayout from "./client-layout";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  // Get user data from session
  const userName = session?.user?.name || "User";
  const userRole = session?.user?.role || "SECRETARY";

  return (
    <ClientDashboardLayout
      userName={userName}
      userRole={userRole}
    >
      {children}
    </ClientDashboardLayout>
  );
} 