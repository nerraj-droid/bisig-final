import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import ClientDashboardLayout from "./client-layout";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect("/login");
  }
  
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