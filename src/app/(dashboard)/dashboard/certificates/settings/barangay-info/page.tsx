import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { BarangayInfoForm } from "@/components/certificates/barangay-info-form"
import { BarangayInfo, Role } from "@prisma/client"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export const metadata = {
  title: "Barangay Information | Barangay Management System",
  description: "Manage your barangay information and contact details.",
}

async function getBarangayInfo() {
  // Get or create barangay info
  const barangayInfo = await prisma.barangayInfo.findFirst({
    where: { id: "1" }, // We'll use a single record approach
  }) || {
    id: "1",
    name: "",
    district: "",
    city: "",
    province: "",
    contactNumber: "",
    email: "",
    website: "",
    postalCode: "",
    logo: "",
    headerImage: "",
    footerText: ""
  }

  return barangayInfo
}

export default async function BarangayInfoPage() {
  const session = await getServerSession(authOptions)

  // Only admins and captains can access this page
  if (!session?.user || (session.user.role !== Role.SUPER_ADMIN && session.user.role !== Role.CAPTAIN)) {
    redirect("/dashboard")
  }

  const barangayInfo = await getBarangayInfo()

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <Link href="/dashboard/certificates" className="flex items-center text-sm text-muted-foreground hover:text-primary mb-2">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Certificates
        </Link>

        <h1 className="text-3xl font-bold text-[#006B5E]">Barangay Information</h1>
        <p className="text-muted-foreground">
          Manage your barangay details that will appear on certificates and official documents.
        </p>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <BarangayInfoForm barangayInfo={barangayInfo as BarangayInfo} />
      </div>
    </div>
  )
} 