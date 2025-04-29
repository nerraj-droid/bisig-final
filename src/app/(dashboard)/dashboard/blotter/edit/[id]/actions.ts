"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { BlotterPartyType, BlotterCaseStatus, BlotterPriority } from "@/lib/enums";

// Get blotter case by ID
export async function getBlotterCase(id: string) {
  // Get current user
  const session = await getServerSession(authOptions);
  if (!session) {
    throw new Error("Unauthorized");
  }
  
  try {
    // Fetch the blotter case with related data
    const blotterCase = await prisma.blotterCase.findUnique({
      where: { id },
      include: {
        parties: true,
        statusUpdates: {
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      }
    });
    
    if (!blotterCase) {
      throw new Error("Blotter case not found");
    }
    
    // Split the parties into complainant and respondent
    const complainant = blotterCase.parties.find(
      party => party.partyType === BlotterPartyType.COMPLAINANT
    );
    
    const respondent = blotterCase.parties.find(
      party => party.partyType === BlotterPartyType.RESPONDENT
    );
    
    if (!complainant || !respondent) {
      throw new Error("Case data is incomplete");
    }
    
    return {
      ...blotterCase,
      complainant,
      respondent,
      currentStatus: blotterCase.statusUpdates[0]?.status || blotterCase.status
    };
  } catch (error) {
    console.error("Error fetching blotter case:", error);
    throw error;
  }
}

// Update blotter case
export async function updateBlotterCase(id: string, formData: FormData) {
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
    
    // Get original case data
    const originalCase = await prisma.blotterCase.findUnique({
      where: { id },
      include: { 
        parties: true,
        statusUpdates: {
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      }
    });
    
    if (!originalCase) {
      throw new Error("Blotter case not found");
    }
    
    // Check if status has changed
    const statusChanged = originalCase.status !== status;
    
    // Update blotter case
    const updatedCase = await prisma.blotterCase.update({
      where: { id },
      data: {
        reportDate,
        incidentDate,
        incidentTime,
        incidentLocation,
        incidentType,
        incidentDescription,
        status, // Update the status on the main case
        priority,
        entertainedBy: entertainedBy === "other" ? "Other" : entertainedBy,
        updatedAt: new Date()
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
    
    // Find complainant record
    const complainant = originalCase.parties.find(
      party => party.partyType === BlotterPartyType.COMPLAINANT
    );
    
    if (complainant) {
      // Update complainant record
      await prisma.blotterParty.update({
        where: { id: complainant.id },
        data: {
          firstName: complainantFirstName,
          middleName: complainantMiddleName,
          lastName: complainantLastName,
          address: complainantAddress,
          contactNumber: complainantContactNumber,
          email: complainantEmail,
          isResident: isComplainantResident,
          updatedAt: new Date()
        }
      });
    }
    
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
    
    // Find respondent record
    const respondent = originalCase.parties.find(
      party => party.partyType === BlotterPartyType.RESPONDENT
    );
    
    if (respondent) {
      // Update respondent record
      await prisma.blotterParty.update({
        where: { id: respondent.id },
        data: {
          firstName: respondentFirstName,
          middleName: respondentMiddleName,
          lastName: respondentLastName,
          address: respondentAddress,
          contactNumber: respondentContactNumber,
          email: respondentEmail,
          isResident: isRespondentResident,
          updatedAt: new Date()
        }
      });
    }
    
    // If status has changed, create a status update
    if (statusChanged) {
      const statusNotes = formData.get("statusNotes") as string || `Case status updated to ${status}`;
      
      await prisma.blotterStatusUpdate.create({
        data: {
          blotterCaseId: id,
          status,
          notes: statusNotes,
          updatedById: session.user.id
        }
      });
    }
    
    return { success: true, caseId: updatedCase.id };
  } catch (error) {
    console.error("Error updating blotter case:", error);
    return { success: false, error: (error as Error).message };
  }
} 