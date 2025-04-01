"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { BlotterPartyType, BlotterCaseStatus, BlotterPriority } from "@/lib/enums";

export async function createBlotterCase(formData: FormData) {
  // Get current user
  const session = await getServerSession(authOptions);
  if (!session) {
    throw new Error("Unauthorized");
  }
  
  try {
    // Validate that formData is not null or undefined
    if (!formData) {
      throw new Error("Form data is missing");
    }
    
    // Extract form data with validation
    const incidentType = formData.get("incidentType") as string;
    if (!incidentType) throw new Error("Incident type is required");
    
    const priorityValue = formData.get("priority") as string;
    if (!priorityValue) throw new Error("Priority is required");
    // Convert string to enum value
    const priority = priorityValue as BlotterPriority;
    
    const statusValue = formData.get("status") as string;
    if (!statusValue) throw new Error("Status is required");
    // Convert string to enum value
    const status = statusValue as BlotterCaseStatus;
    
    const reportDateStr = formData.get("reportDate") as string;
    if (!reportDateStr) throw new Error("Report date is required");
    const reportDate = new Date(reportDateStr);
    
    const incidentDateStr = formData.get("incidentDate") as string;
    if (!incidentDateStr) throw new Error("Incident date is required");
    const incidentDate = new Date(incidentDateStr);
    
    const incidentTime = formData.get("incidentTime") as string;
    const incidentLocation = formData.get("incidentLocation") as string;
    if (!incidentLocation) throw new Error("Incident location is required");
    
    const incidentDescription = formData.get("incidentDescription") as string;
    if (!incidentDescription) throw new Error("Incident description is required");
    
    // Get the official who entertained the report
    const entertainedBy = formData.get("entertainedBy") as string;
    if (!entertainedBy) throw new Error("Official who entertained the report is required");
    
    // Generate case number (BLT-YYYY-XXXX)
    const currentYear = new Date().getFullYear();
    const totalCases = await prisma.blotterCase.count({
      where: {
        caseNumber: {
          startsWith: `BLT-${currentYear}`
        }
      }
    });
    const caseNumber = `BLT-${currentYear}-${(totalCases + 1).toString().padStart(4, '0')}`;
    
    // Create blotter case
    const newCase = await prisma.blotterCase.create({
      data: {
        caseNumber,
        reportDate,
        incidentDate,
        incidentTime,
        incidentLocation,
        incidentType,
        incidentDescription,
        status,
        priority,
        createdById: session.user.id,
        entertainedBy: entertainedBy === "other" ? "Other" : entertainedBy // Store the official ID or "Other"
      }
    });
    
    // Extract and validate complainant data
    const complainantFirstName = formData.get("complainantFirstName") as string;
    if (!complainantFirstName) throw new Error("Complainant first name is required");
    
    const complainantLastName = formData.get("complainantLastName") as string;
    if (!complainantLastName) throw new Error("Complainant last name is required");
    
    const complainantMiddleName = formData.get("complainantMiddleName") as string || null;
    const complainantAddress = formData.get("complainantAddress") as string;
    if (!complainantAddress) throw new Error("Complainant address is required");
    
    const complainantContactNumber = formData.get("complainantContactNumber") as string || null;
    const complainantEmail = formData.get("complainantEmail") as string || null;
    const isComplainantResident = formData.get("isResident") === "on";
    
    // Create complainant record
    await prisma.blotterParty.create({
      data: {
        blotterCaseId: newCase.id,
        partyType: BlotterPartyType.COMPLAINANT,
        firstName: complainantFirstName,
        middleName: complainantMiddleName,
        lastName: complainantLastName,
        address: complainantAddress,
        contactNumber: complainantContactNumber,
        email: complainantEmail,
        isResident: isComplainantResident,
      }
    });
    
    // Extract and validate respondent data
    const respondentFirstName = formData.get("respondentFirstName") as string;
    if (!respondentFirstName) throw new Error("Respondent first name is required");
    
    const respondentLastName = formData.get("respondentLastName") as string;
    if (!respondentLastName) throw new Error("Respondent last name is required");
    
    const respondentMiddleName = formData.get("respondentMiddleName") as string || null;
    const respondentAddress = formData.get("respondentAddress") as string;
    if (!respondentAddress) throw new Error("Respondent address is required");
    
    const respondentContactNumber = formData.get("respondentContactNumber") as string || null;
    const respondentEmail = formData.get("respondentEmail") as string || null;
    const isRespondentResident = formData.get("respondentIsResident") === "on";
    
    // Create respondent record
    await prisma.blotterParty.create({
      data: {
        blotterCaseId: newCase.id,
        partyType: BlotterPartyType.RESPONDENT,
        firstName: respondentFirstName,
        middleName: respondentMiddleName,
        lastName: respondentLastName,
        address: respondentAddress,
        contactNumber: respondentContactNumber,
        email: respondentEmail,
        isResident: isRespondentResident,
      }
    });
    
    // Create initial status update
    await prisma.blotterStatusUpdate.create({
      data: {
        blotterCaseId: newCase.id,
        status, // This is now properly typed as BlotterCaseStatus
        notes: `Case ${caseNumber} filed and registered.`,
        updatedById: session.user.id
      }
    });
    
    return { success: true, caseId: newCase.id };
  } catch (error) {
    console.error("Error creating blotter case:", error);
    return { success: false, error: (error as Error).message };
  }
} 