"use server";

import { prisma } from "@/lib/prisma";
import { BlotterCaseStatus, BlotterPriority, BlotterPartyType } from "@/lib/enums";

// Define the filtering criteria type
export type FilterCriteria = {
  status?: BlotterCaseStatus;
  priority?: BlotterPriority;
  startDate?: Date;
  endDate?: Date;
  incidentType?: string;
  searchTerm?: string;
  page?: number;
  pageSize?: number;
};

// Type for formatted case display
export type FormattedCase = {
  id: string;
  caseNumber: string;
  reportDate: Date;
  incidentDate: Date;
  incidentTime: string | null;
  incidentLocation: string;
  incidentType: string;
  status: BlotterCaseStatus;
  priority: BlotterPriority;
  complainant: string;
  respondent: string;
  lastUpdated: Date;
  createdBy: string;
};

// Function to get blotter data with filtering
export async function getBlotterData(filters: FilterCriteria = {}): Promise<{
  totalCount: number;
  pendingCount: number;
  ongoingCount: number;
  resolvedCount: number;
  escalatedCount: number;
  cases: FormattedCase[];
  totalPages: number;
  currentPage: number;
}> {
  const { 
    status, 
    priority, 
    startDate, 
    endDate, 
    incidentType, 
    searchTerm,
    page = 1,
    pageSize = 10
  } = filters;
  
  // Build query conditions
  const where: any = {
    ...(status && { status }),
    ...(priority && { priority }),
    ...(startDate && endDate && { 
      incidentDate: { 
        gte: startDate,
        lte: endDate
      } 
    }),
    ...(incidentType && { incidentType }),
    ...(searchTerm && {
      OR: [
        { caseNumber: { contains: searchTerm, mode: 'insensitive' } },
        { incidentLocation: { contains: searchTerm, mode: 'insensitive' } },
        { incidentType: { contains: searchTerm, mode: 'insensitive' } },
        { incidentDescription: { contains: searchTerm, mode: 'insensitive' } },
        {
          parties: {
            some: {
              OR: [
                { firstName: { contains: searchTerm, mode: 'insensitive' } },
                { lastName: { contains: searchTerm, mode: 'insensitive' } },
              ]
            }
          }
        }
      ]
    })
  };
  
  // Get counts
  const totalCount = await (prisma as any).blotterCase.count({ where });
  const pendingCount = await (prisma as any).blotterCase.count({ where: { ...where, status: BlotterCaseStatus.PENDING } });
  const ongoingCount = await (prisma as any).blotterCase.count({ where: { ...where, status: BlotterCaseStatus.ONGOING } });
  const resolvedCount = await (prisma as any).blotterCase.count({ where: { ...where, status: BlotterCaseStatus.RESOLVED } });
  const escalatedCount = await (prisma as any).blotterCase.count({ where: { ...where, status: BlotterCaseStatus.ESCALATED } });
  
  // Get cases with pagination
  const skip = (page - 1) * pageSize;
  const cases = await (prisma as any).blotterCase.findMany({
    where,
    include: {
      parties: true,
      statusUpdates: {
        orderBy: {
          createdAt: 'desc'
        },
        take: 1
      },
      hearings: false,
      attachments: false
    },
    orderBy: {
      reportDate: 'desc'
    },
    skip,
    take: pageSize
  });
  
  // Process cases for display
  const formattedCases = cases.map((caseItem: any) => {
    const complainant = caseItem.parties.find((p: any) => p.partyType === BlotterPartyType.COMPLAINANT);
    const respondent = caseItem.parties.find((p: any) => p.partyType === BlotterPartyType.RESPONDENT);
    
    const complainantName = complainant 
      ? `${complainant.firstName} ${complainant.middleName ? complainant.middleName + ' ' : ''}${complainant.lastName}`
      : 'N/A';
      
    const respondentName = respondent
      ? `${respondent.firstName} ${respondent.middleName ? respondent.middleName + ' ' : ''}${respondent.lastName}`
      : 'N/A';
    
    return {
      id: caseItem.id,
      caseNumber: caseItem.caseNumber,
      reportDate: caseItem.reportDate,
      incidentDate: caseItem.incidentDate,
      incidentTime: caseItem.incidentTime,
      incidentLocation: caseItem.incidentLocation,
      incidentType: caseItem.incidentType,
      status: caseItem.status as BlotterCaseStatus,
      priority: caseItem.priority as BlotterPriority,
      complainant: complainantName,
      respondent: respondentName,
      lastUpdated: caseItem.statusUpdates[0]?.createdAt || caseItem.createdAt,
      createdBy: caseItem.createdBy?.name || 'Bisig'
    };
  });
  
  return {
    totalCount,
    pendingCount,
    ongoingCount,
    resolvedCount,
    escalatedCount,
    cases: formattedCases,
    totalPages: Math.ceil(totalCount / pageSize),
    currentPage: page
  };
} 