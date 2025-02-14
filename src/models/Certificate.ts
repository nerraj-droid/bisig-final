import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export interface Certificate {
  id: string;
  residentName: string;
  address: string;
  purpose: string;
  controlNumber: string;
  status: "Pending" | "Approved" | "Rejected";
  issuedDate?: Date;
  officials: {
    punongBarangay: string;
    secretary?: string;
    treasurer?: string;
  };
}

export async function createCertificate(data: Certificate) {
  return await prisma.certificate.create({
    data,
  });
}

export async function getCertificates() {
  return await prisma.certificate.findMany();
}
