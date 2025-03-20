import ResidentDetailClient from "./client-page";
import { PrismaClient } from "@prisma/client";
import { notFound } from "next/navigation";

// Define the type interface based on what's used in client-page.tsx
interface ExtendedResident {
  id: string;
  firstName: string;
  middleName: string | null;
  lastName: string;
  birthDate: Date;
  gender: string;
  civilStatus: string;
  contactNo: string | null;
  email: string | null;
  occupation: string | null;
  employmentStatus: string | null;
  unemploymentReason: string | null;
  educationalAttainment: string | null;
  address: string;
  headOfHousehold: boolean;
  voterInBarangay: boolean;
  sectors: string[];
  identityType: string | null;
  proofOfIdentity: string | null;
  extensionName: string | null;
  motherMaidenName: string | null;
  motherMiddleName: string | null;
  motherFirstName: string | null;
  fatherName: string | null;
  fatherLastName: string | null;
  fatherMiddleName: string | null;
  Household: {
    id: string;
    houseNo: string;
    street: string;
  } | null;
  identityNumber: string | null;
  userPhoto: string | null;
  identityIssueDate: string | null;
  identityExpiry: string | null;
  identityDocumentPath: string | null;
  nationality: string | null;
  religion: string | null;
  ethnicGroup: string | null;
  bloodType: string | null;
  alias: string | null;
  [key: string]: any; // For any other properties
}

const prisma = new PrismaClient();

async function getResident(id: string): Promise<ExtendedResident | null> {
  try {
    const resident = await prisma.resident.findUnique({
      where: { id },
      include: {
        Household: true,
      }
    });

    if (!resident) {
      return null;
    }

    // Cast to our extended type and then add any processing
    const baseResident = resident as unknown as ExtendedResident;

    // Process identity document data
    // Check if identity document path exists in the new field
    if (baseResident.identityDocumentPath) {
      if (baseResident.identityDocumentPath.startsWith('DOCUMENT:')) {
        baseResident.proofOfIdentity = baseResident.identityDocumentPath.substring(9);
      } else {
        baseResident.proofOfIdentity = baseResident.identityDocumentPath;
      }
    }
    // Fallback to legacy format if needed
    else if (baseResident.identityNumber?.startsWith('DOCUMENT:') && !baseResident.proofOfIdentity) {
      baseResident.proofOfIdentity = baseResident.identityNumber.substring(9);
    }

    // Make sure boolean fields are properly set
    baseResident.voterInBarangay = baseResident.voterInBarangay || false;
    baseResident.headOfHousehold = baseResident.headOfHousehold || false;

    // Ensure sectors is an array
    baseResident.sectors = baseResident.sectors || [];

    console.log("Processed resident data:", {
      identityType: baseResident.identityType,
      identityNumber: baseResident.identityNumber,
      identityDocumentPath: baseResident.identityDocumentPath,
      proofOfIdentity: baseResident.proofOfIdentity,
      occupation: baseResident.occupation,
      employmentStatus: baseResident.employmentStatus,
      sectors: baseResident.sectors,
      fullObject: JSON.stringify(baseResident)
    });

    return baseResident;
  } catch (error) {
    console.error("Error fetching resident:", error);
    return null;
  } finally {
    await prisma.$disconnect();
  }
}

export default async function ResidentDetailPage({ params }: { params: { id: string } }) {
  // Await the params object (if it's a promise)
  const resolvedParams = await Promise.resolve(params);

  if (!resolvedParams?.id) {
    notFound();
  }

  const resident = await getResident(resolvedParams.id);

  if (!resident) {
    notFound();
  }

  return <ResidentDetailClient resident={resident} />;
}
