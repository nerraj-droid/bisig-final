import { PrismaClient } from "@prisma/client";
import { notFound } from "next/navigation";
import ResidentDetailClient from "./client-page";

const prisma = new PrismaClient();

// Define extended resident type to include the new fields
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
  [key: string]: any; // For any other properties
}

async function getResident(id: string): Promise<ExtendedResident | null> {
  const resident = await prisma.resident.findUnique({
    where: { id },
    include: {
      Household: true
    }
  });

  if (!resident) {
    return null;
  }

  // Cast to our extended type
  return resident as unknown as ExtendedResident;
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
