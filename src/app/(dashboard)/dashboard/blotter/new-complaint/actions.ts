"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { BlotterPartyType, BlotterCaseStatus, BlotterPriority } from "@/lib/enums";

export async function createComplaint(formData: FormData) {
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
    const complaintType = formData.get("complaintType") as string;
    if (!complaintType) throw new Error("Complaint type is required");
    
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
    
    const complaintDescription = formData.get("complaintDescription") as string;
    if (!complaintDescription) throw new Error("Complaint description is required");
    
    const preferredResolution = formData.get("preferredResolution") as string || null;
    
    // Get the official who entertained the complaint
    const entertainedBy = formData.get("entertainedBy") as string;
    if (!entertainedBy) throw new Error("Official who entertained the complaint is required");
    
    // Generate case number (CMP-YYYY-XXXX)
    const currentYear = new Date().getFullYear();
    const totalCases = await prisma.blotterCase.count({
      where: {
        caseNumber: {
          startsWith: `CMP-${currentYear}`
        }
      }
    });
    const caseNumber = `CMP-${currentYear}-${(totalCases + 1).toString().padStart(4, '0')}`;
    
    // Create blotter case for the complaint
    const newCase = await prisma.blotterCase.create({
      data: {
        caseNumber,
        reportDate,
        incidentDate: reportDate, // For complaints, incident date is the same as report date
        incidentLocation: "N/A", // Location might not be applicable for complaints
        incidentType: complaintType,
        incidentDescription: complaintDescription + (preferredResolution ? `\n\nPreferred Resolution: ${preferredResolution}` : ""),
        status,
        priority,
        createdById: session.user.id,
        entertainedBy: entertainedBy === "other" ? "Other" : entertainedBy
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
    
    // Check if there's a respondent
    const hasRespondent = formData.get("hasRespondent") === "on";
    
    if (hasRespondent) {
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
    }
    
    // Create initial status update
    await prisma.blotterStatusUpdate.create({
      data: {
        blotterCaseId: newCase.id,
        status,
        notes: `Complaint ${caseNumber} filed and registered.`,
        updatedById: session.user.id
      }
    });
    
    return { success: true, caseId: newCase.id };
  } catch (error) {
    console.error("Error creating complaint:", error);
    return { success: false, error: (error as Error).message };
  }
} 