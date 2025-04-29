import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { BlotterCaseStatus, BlotterPartyType } from '@/lib/enums';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { format } from 'date-fns';

// Function to create a CFA certificate
const generateCertificate = async (caseData: any) => {
  // Set up the PDF document
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  
  // Page setup
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  
  // Header - Barangay details
  const barangayInfo = await prisma.barangayInfo.findFirst();
  doc.setFont('helvetica', 'bold');
  doc.text('REPUBLIC OF THE PHILIPPINES', pageWidth / 2, margin, { align: 'center' });
  doc.text(barangayInfo?.city || 'City', pageWidth / 2, margin + 6, { align: 'center' });
  doc.text(`BARANGAY ${barangayInfo?.name || ''}`, pageWidth / 2, margin + 12, { align: 'center' });
  doc.text('OFFICE OF THE LUPONG TAGAPAMAYAPA', pageWidth / 2, margin + 18, { align: 'center' });
  
  // Divider
  doc.setLineWidth(0.5);
  doc.line(margin, margin + 25, pageWidth - margin, margin + 25);
  
  // Certificate Header
  doc.setFontSize(16);
  doc.text('CERTIFICATION TO FILE ACTION', pageWidth / 2, margin + 35, { align: 'center' });
  
  // Certificate Body
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  
  let yPos = margin + 50;
  
  // Case details
  doc.text(`Case No: ${caseData.caseNumber}`, margin, yPos);
  yPos += 10;
  
  // For title
  doc.text('COMPLAINANT/S:', margin, yPos);
  yPos += 10;
  
  // Get complainant
  const complainant = caseData.parties.find(
    (party: any) => party.partyType === BlotterPartyType.COMPLAINANT
  );
  
  // Complainant details
  if (complainant) {
    const complainantName = `${complainant.firstName} ${complainant.middleName ? complainant.middleName + ' ' : ''}${complainant.lastName}`.trim();
    doc.text(`   ${complainantName}`, margin, yPos);
    yPos += 6;
    doc.text(`   ${complainant.address}`, margin, yPos);
    yPos += 12;
  }
  
  // For title
  doc.text('RESPONDENT/S:', margin, yPos);
  yPos += 10;
  
  // Get respondent
  const respondent = caseData.parties.find(
    (party: any) => party.partyType === BlotterPartyType.RESPONDENT
  );
  
  // Respondent details
  if (respondent) {
    const respondentName = `${respondent.firstName} ${respondent.middleName ? respondent.middleName + ' ' : ''}${respondent.lastName}`.trim();
    doc.text(`   ${respondentName}`, margin, yPos);
    yPos += 6;
    doc.text(`   ${respondent.address}`, margin, yPos);
    yPos += 16;
  }
  
  // Certificate content
  const contentText = [
    "This is to certify that:",
    "",
    "1. There was a personal confrontation between the parties before the Punong Barangay but mediation failed;",
    "",
    "2. The Punong Barangay set the meeting of parties for potential settlement;",
    "",
    "3. After the lapse of the fifteen (15)-day period from date of mediation session, no settlement has been reached;",
    "",
    "4. Therefore, as provided under the Revised Katarungang Pambarangay Law (RA 7160), the corresponding complaint for the dispute may now be filed in court/government office."
  ];
  
  contentText.forEach(line => {
    if (line === "") {
      yPos += 6;
    } else {
      const splitLines = doc.splitTextToSize(line, pageWidth - (margin * 2));
      splitLines.forEach((splitLine: any) => {
        doc.text(splitLine, margin, yPos);
        yPos += 6;
      });
    }
  });
  
  yPos += 10;
  
  // Date issued
  const today = format(new Date(), "MMMM dd, yyyy");
  doc.text(`Issued this ${today} at Barangay ${barangayInfo?.name || ''}, ${barangayInfo?.city || ''}.`, margin, yPos);
  
  yPos += 30;
  
  // Signature
  doc.setFont('helvetica', 'bold');
  doc.text("CERTIFIED BY:", margin, yPos);
  
  yPos += 30;
  
  const officials = await prisma.officials.findFirst();
  
  if (officials) {
    doc.setFont('helvetica', 'bold');
    doc.text(officials.punongBarangay.toUpperCase(), margin + 30, yPos);
    
    yPos += 6;
    
    doc.setFont('helvetica', 'normal');
    doc.text("Punong Barangay", margin + 30, yPos);
  }
  
  yPos += 20;
  
  // Notes section
  doc.setFontSize(10);
  doc.text("Note: This certification is valid for filing complaint in court/government office within five (5) days from date of issuance.", margin, yPos);
  
  yPos += 5;
  doc.text("Reference: Republic Act 7160 (Local Government Code of 1991)", margin, yPos);
  
  return doc.output('arraybuffer');
};

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { id } = params;
    
    // Fetch blotter case with relevant data
    const blotterCase = await prisma.blotterCase.findUnique({
      where: { id },
      include: {
        parties: true,
      }
    });
    
    if (!blotterCase) {
      return NextResponse.json({ error: 'Blotter case not found' }, { status: 404 });
    }
    
    // Check if case is in the right status for CFA
    if (blotterCase.status !== BlotterCaseStatus.CERTIFIED && blotterCase.status !== BlotterCaseStatus.EXTENDED) {
      // If not in right status, return error
      if (blotterCase.status !== BlotterCaseStatus.EXTENDED) {
        return NextResponse.json(
          { error: `Case must be in ${BlotterCaseStatus.EXTENDED} status to issue a CFA or ${BlotterCaseStatus.CERTIFIED} to download it` },
          { status: 400 }
        );
      }
    }
    
    // If case is in EXTENDED status, update it to CERTIFIED
    if (blotterCase.status === BlotterCaseStatus.EXTENDED) {
      await prisma.blotterCase.update({
        where: { id },
        data: {
          status: BlotterCaseStatus.CERTIFIED as any,
          certificationDate: new Date(),
          updatedAt: new Date()
        }
      });
      
      // Add status update record
      await prisma.blotterStatusUpdate.create({
        data: {
          blotterCaseId: id,
          status: BlotterCaseStatus.CERTIFIED as any,
          notes: "Certification to File Action (CFA) has been issued.",
          updatedById: session.user.id,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      });
    }
    
    // Generate certificate PDF
    const pdfBuffer = await generateCertificate(blotterCase);
    
    // Return the PDF as a download
    const headers = new Headers();
    headers.set('Content-Type', 'application/pdf');
    headers.set('Content-Disposition', `attachment; filename=${blotterCase.caseNumber}-certification.pdf`);
    
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers
    });
  } catch (error) {
    console.error('Error generating certificate:', error);
    return NextResponse.json(
      { error: 'Failed to generate certificate' },
      { status: 500 }
    );
  }
} 