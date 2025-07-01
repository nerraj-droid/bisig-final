import { PrismaClient, CertificateType } from "@prisma/client";
import { randomUUID } from "crypto";

const prisma = new PrismaClient();

export interface CertificateData {
  id?: string;
  purpose: string;
  controlNumber: string;
  status: string;
  issuedDate?: Date;
  officialId: string;
  residentId: string;
  type: CertificateType;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CertificateCreateInput {
  purpose: string;
  residentId: string;
  type: CertificateType;
  officialId?: string;
}

export interface CertificateWithResident {
  id: string;
  purpose: string;
  controlNumber: string;
  status: string;
  issuedDate: Date | null;
  officialId: string;
  createdAt: Date;
  residentId: string;
  type: CertificateType;
  updatedAt: Date;
  Resident: {
    id: string;
    firstName: string;
    middleName: string | null;
    lastName: string;
    address: string;
    civilStatus: string;
    gender: string;
    birthDate: Date;
  };
  Officials: {
    id: string;
    punongBarangay: string;
    secretary: string | null;
    treasurer: string | null;
  };
}

// Generate unique control number
export function generateControlNumber(type: CertificateType): string {
  const year = new Date().getFullYear();
  const month = String(new Date().getMonth() + 1).padStart(2, '0');
  const day = String(new Date().getDate()).padStart(2, '0');
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();

  const typePrefix = {
    CLEARANCE: 'CLR',
    RESIDENCY: 'RES',
    BUSINESS_PERMIT: 'BPT',
    INDIGENCY: 'IND',
    CFA: 'CFA'
  };

  return `${typePrefix[type]}-${year}${month}${day}-${random}`;
}

export async function createCertificate(data: CertificateCreateInput): Promise<CertificateWithResident> {
  // Get default official if not provided
  let officialId = data.officialId;
  if (!officialId) {
    const defaultOfficial = await prisma.officials.findFirst();
    if (!defaultOfficial) {
      throw new Error("No officials found. Please create an official first.");
    }
    officialId = defaultOfficial.id;
  }

  const controlNumber = generateControlNumber(data.type);
  const now = new Date();

  const certificate = await prisma.certificate.create({
    data: {
      id: randomUUID(),
      purpose: data.purpose,
      controlNumber,
      status: "PENDING",
      officialId,
      residentId: data.residentId,
      type: data.type,
      updatedAt: now,
    },
    include: {
      Resident: {
        select: {
          id: true,
          firstName: true,
          middleName: true,
          lastName: true,
          address: true,
          civilStatus: true,
          gender: true,
          birthDate: true,
        }
      },
      Officials: {
        select: {
          id: true,
          punongBarangay: true,
          secretary: true,
          treasurer: true,
        }
      },
    },
  });

  return certificate;
}

export async function getCertificates(): Promise<CertificateWithResident[]> {
  return await prisma.certificate.findMany({
    include: {
      Resident: {
        select: {
          id: true,
          firstName: true,
          middleName: true,
          lastName: true,
          address: true,
          civilStatus: true,
          gender: true,
          birthDate: true,
        }
      },
      Officials: {
        select: {
          id: true,
          punongBarangay: true,
          secretary: true,
          treasurer: true,
        }
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
}

export async function getCertificateById(id: string): Promise<CertificateWithResident | null> {
  return await prisma.certificate.findUnique({
    where: { id },
    include: {
      Resident: {
        select: {
          id: true,
          firstName: true,
          middleName: true,
          lastName: true,
          address: true,
          civilStatus: true,
          gender: true,
          birthDate: true,
        }
      },
      Officials: {
        select: {
          id: true,
          punongBarangay: true,
          secretary: true,
          treasurer: true,
        }
      },
    },
  });
}

export async function getCertificateByControlNumber(controlNumber: string): Promise<CertificateWithResident | null> {
  return await prisma.certificate.findUnique({
    where: { controlNumber },
    include: {
      Resident: {
        select: {
          id: true,
          firstName: true,
          middleName: true,
          lastName: true,
          address: true,
          civilStatus: true,
          gender: true,
          birthDate: true,
        }
      },
      Officials: {
        select: {
          id: true,
          punongBarangay: true,
          secretary: true,
          treasurer: true,
        }
      },
    },
  });
}

export async function updateCertificateStatus(id: string, status: string, issuedDate?: Date): Promise<CertificateWithResident> {
  return await prisma.certificate.update({
    where: { id },
    data: {
      status,
      issuedDate: status === "RELEASED" ? (issuedDate || new Date()) : null,
      updatedAt: new Date(),
    },
    include: {
      Resident: {
        select: {
          id: true,
          firstName: true,
          middleName: true,
          lastName: true,
          address: true,
          civilStatus: true,
          gender: true,
          birthDate: true,
        }
      },
      Officials: {
        select: {
          id: true,
          punongBarangay: true,
          secretary: true,
          treasurer: true,
        }
      },
    },
  });
}

export async function deleteCertificate(id: string): Promise<void> {
  await prisma.certificate.delete({
    where: { id },
  });
}

export async function getCertificatesByResident(residentId: string): Promise<CertificateWithResident[]> {
  return await prisma.certificate.findMany({
    where: { residentId },
    include: {
      Resident: {
        select: {
          id: true,
          firstName: true,
          middleName: true,
          lastName: true,
          address: true,
          civilStatus: true,
          gender: true,
          birthDate: true,
        }
      },
      Officials: {
        select: {
          id: true,
          punongBarangay: true,
          secretary: true,
          treasurer: true,
        }
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
}

export async function getCertificatesByType(type: CertificateType): Promise<CertificateWithResident[]> {
  return await prisma.certificate.findMany({
    where: { type },
    include: {
      Resident: {
        select: {
          id: true,
          firstName: true,
          middleName: true,
          lastName: true,
          address: true,
          civilStatus: true,
          gender: true,
          birthDate: true,
        }
      },
      Officials: {
        select: {
          id: true,
          punongBarangay: true,
          secretary: true,
          treasurer: true,
        }
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
}

// Certificate statistics
export async function getCertificateStats() {
  const [total, pending, released, byType] = await Promise.all([
    prisma.certificate.count(),
    prisma.certificate.count({ where: { status: "PENDING" } }),
    prisma.certificate.count({ where: { status: "RELEASED" } }),
    prisma.certificate.groupBy({
      by: ['type'],
      _count: { type: true },
    }),
  ]);

  return {
    total,
    pending,
    released,
    byType: byType.map(item => ({
      type: item.type,
      count: item._count.type,
    })),
  };
}
