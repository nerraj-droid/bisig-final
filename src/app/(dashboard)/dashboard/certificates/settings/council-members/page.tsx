import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { CouncilMemberList } from "@/components/certificates/council-member-list"
import { Role } from "@prisma/client"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export const metadata = {
  title: "Council Members | Barangay Management System",
  description: "Manage barangay officials and council members.",
}

async function getCouncilMembers() {
  const councilMembers = await prisma.councilMember.findMany({
    orderBy: { order: 'asc' }
  })

  return councilMembers
}

export default async function CouncilMembersPage() {
  const session = await getServerSession(authOptions)

  // Only admins and captains can access this page
  if (!session?.user || (session.user.role !== Role.SUPER_ADMIN && session.user.role !== Role.CAPTAIN)) {
    redirect("/dashboard")
  }

  const councilMembers = await getCouncilMembers()

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <Link href="/dashboard/certificates" className="flex items-center text-sm text-muted-foreground hover:text-primary mb-2">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Certificates
        </Link>

        <h1 className="text-3xl font-bold text-[#006B5E]">Council Members</h1>
        <p className="text-muted-foreground">
          Manage your barangay officials and council members for official documents.
        </p>
      </div>

      <div className="bg-white rounded-lg shadow">
        <CouncilMemberList councilMembers={councilMembers} />
      </div>
    </div>
  )
} 