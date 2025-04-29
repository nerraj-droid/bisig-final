import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { BlotterPartyType } from '@/lib/enums';
import path from 'path';
import fs from 'fs/promises';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

// Helper function to generate a case summary based on the incident details
const generateCaseSummary = (caseData: any) => {
  // Format names from the parties data
  const complainant = caseData.complainant;
  const respondent = caseData.respondent;
  
  // Format complainant name
  const complainantName = complainant.firstName && complainant.lastName 
    ? `${complainant.firstName} ${complainant.middleName || ''} ${complainant.lastName}`.trim()
    : complainant.name || 'Unknown';
    
  // Format respondent name
  const respondentName = respondent.firstName && respondent.lastName 
    ? `${respondent.firstName} ${respondent.middleName || ''} ${respondent.lastName}`.trim()
    : respondent.name || 'Unknown';
  
  const incidentDate = new Date(caseData.incidentDate).toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  const incidentTime = caseData.incidentTime || 'an unspecified time';
  
  return `This case involves a ${caseData.incidentType.toLowerCase()} incident that occurred on ${incidentDate} at ${incidentTime} in ${caseData.incidentLocation}. The complainant, ${complainantName}, reported that the respondent, ${respondentName}, ${summarizeIncident(caseData.incidentType, caseData.incidentDescription)}.

The case was filed on ${new Date(caseData.reportDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} and is currently marked as ${caseData.status.toLowerCase()} with ${caseData.priority.toLowerCase()} priority. ${getStatusSummary(caseData)}

The barangay is actively handling this case in accordance with the Katarungang Pambarangay Law (Republic Act No. 7160), which mandates that certain disputes between residents of the same barangay be brought for amicable settlement before the Lupong Tagapamayapa.`;
};

// Helper function to summarize the incident based on type and description
const summarizeIncident = (incidentType: string, description: string) => {
  // Extract the first sentence or up to 150 characters from the description
  const firstSentence = description.split('.')[0];
  const summary = firstSentence.length > 150 ? firstSentence.substring(0, 150) + '...' : firstSentence;
  
  return summary;
};

// Helper function to generate status summary based on current status
const getStatusSummary = (caseData: any) => {
  const recentUpdate = caseData.statusUpdates && caseData.statusUpdates.length > 0 
    ? caseData.statusUpdates[0] 
    : null;
  
  if (!recentUpdate) return '';
  
  switch (caseData.status) {
    case 'PENDING':
      return 'The case is awaiting initial action and scheduling for mediation.';
    case 'ONGOING':
      return `Mediation proceedings are currently in progress. ${caseData.hearings && caseData.hearings.length > 0 ? `The most recent hearing was held on ${new Date(caseData.hearings[0].date).toLocaleDateString()}.` : ''}`;
    case 'RESOLVED':
      return 'The parties have reached an agreement and the case has been successfully resolved.';
    case 'ESCALATED':
      return 'Due to inability to reach a settlement at the barangay level, this case has been escalated to the appropriate municipal/city authority.';
    default:
      return '';
  }
};

// Function to break text into lines that fit in the PDF
const splitTextToLines = (text: string, pdf: jsPDF, maxWidth: number): string[] => {
  const lines: string[] = [];
  const words = text.split(' ');
  let currentLine = '';

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const testWidth = pdf.getTextWidth(testLine);
    
    if (testWidth > maxWidth) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }
  
  if (currentLine) {
    lines.push(currentLine);
  }
  
  return lines;
};

// Function to actually generate the PDF using jsPDF
const generatePdfBuffer = async (caseData: any) => {
  try {
    // Create new PDF document (A4 size)
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
    
    // Get the public directory path
    const publicDir = path.join(process.cwd(), 'public');
    
    // Read the logo images as base64
    const bisigLogoPath = path.join(publicDir, 'bisig-logo.jpg');
    const bagongPilipinasPath = path.join(publicDir, 'bagong-pilipinas.png');
    
    // Read the image files
    const bisigLogoBuffer = await fs.readFile(bisigLogoPath);
    const bagongPilipinasBuffer = await fs.readFile(bagongPilipinasPath);
    
    // Convert to base64
    const bisigLogoBase64 = `data:image/jpeg;base64,${bisigLogoBuffer.toString('base64')}`;
    const bagongPilipinasBase64 = `data:image/png;base64,${bagongPilipinasBuffer.toString('base64')}`;
    
    // Page dimensions
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20; // margin in mm
    const usableWidth = pageWidth - (2 * margin);
    
    // Header with logos
    doc.addImage(bisigLogoBase64, 'JPEG', margin, margin, 25, 25);
    doc.addImage(bagongPilipinasBase64, 'PNG', pageWidth - margin - 25, margin, 25, 25);
    
    // Add header text
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('REPUBLIC OF THE PHILIPPINES', pageWidth / 2, margin + 10, { align: 'center' });
    doc.setFontSize(12);
    doc.text('MUNICIPALITY OF SAMPLE', pageWidth / 2, margin + 15, { align: 'center' });
    doc.text('OFFICE OF THE BARANGAY CAPTAIN', pageWidth / 2, margin + 20, { align: 'center' });
    doc.text('BARANGAY SAMPLE', pageWidth / 2, margin + 25, { align: 'center' });
    
    // Add horizontal line
    doc.setDrawColor(0);
    doc.setLineWidth(0.5);
    doc.line(margin, margin + 30, pageWidth - margin, margin + 30);
    
    // Report Title
    doc.setFontSize(16);
    doc.text('OFFICIAL BLOTTER REPORT', pageWidth / 2, margin + 40, { align: 'center' });
    
    // Case Information
    let yPos = margin + 50;
    
    // Case number, date reported, status, priority
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('BLOTTER CASE INFORMATION', margin, yPos);
    yPos += 7;
    
    doc.setDrawColor(0);
    doc.setLineWidth(0.2);
    doc.line(margin, yPos, pageWidth - margin, yPos);
    yPos += 7;
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    
    doc.text(`Case Number: ${caseData.caseNumber}`, margin, yPos);
    yPos += 5;
    
    doc.text(`Date Reported: ${new Date(caseData.reportDate).toLocaleDateString()}`, margin, yPos);
    yPos += 5;
    
    doc.text(`Status: ${caseData.status}`, margin, yPos);
    doc.text(`Priority: ${caseData.priority}`, pageWidth / 2, yPos);
    yPos += 10;
    
    // Facts of the case
    doc.setFont('helvetica', 'bold');
    doc.text('FACTS OF THE CASE', margin, yPos);
    yPos += 7;
    
    doc.setDrawColor(0);
    doc.setLineWidth(0.2);
    doc.line(margin, yPos, pageWidth - margin, yPos);
    yPos += 7;
    
    doc.setFont('helvetica', 'normal');
    
    // Split the case summary into lines that fit within margins
    const caseSummary = generateCaseSummary(caseData);
    
    // Split into paragraphs first
    const paragraphs = caseSummary.split('\n\n');
    
    // Process each paragraph separately with appropriate spacing
    for (let i = 0; i < paragraphs.length; i++) {
      const paragraph = paragraphs[i];
      const paragraphLines = splitTextToLines(paragraph, doc, usableWidth);
      
      // Check if we need a new page for this paragraph
      if (yPos + (paragraphLines.length * 5) > pageHeight - margin) {
        doc.addPage();
        yPos = margin;
      }
      
      // Render each line of the paragraph
      paragraphLines.forEach(line => {
        doc.text(line, margin, yPos);
        yPos += 5;
      });
      
      // Add space between paragraphs
      yPos += 5;
    }
    
    // Additional space after the entire case summary
    yPos += 5;
    
    // Check if we need a new page for the incident details
    if (yPos > pageHeight - 70) {
      doc.addPage();
      yPos = margin;
    }
    
    // Incident Details
    doc.setFont('helvetica', 'bold');
    doc.text('INCIDENT DETAILS', margin, yPos);
    yPos += 7;
    
    doc.setDrawColor(0);
    doc.setLineWidth(0.2);
    doc.line(margin, yPos, pageWidth - margin, yPos);
    yPos += 7;
    
    doc.setFont('helvetica', 'normal');
    
    doc.text(`Date: ${new Date(caseData.incidentDate).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })}`, margin, yPos);
    yPos += 5;
    
    doc.text(`Time: ${caseData.incidentTime || 'Not specified'}`, margin, yPos);
    yPos += 5;
    
    doc.text(`Location: ${caseData.incidentLocation}`, margin, yPos);
    yPos += 5;
    
    doc.text(`Type: ${caseData.incidentType}`, margin, yPos);
    yPos += 7;
    
    doc.text('Description:', margin, yPos);
    yPos += 5;
    
    // Split the incident description into lines
    const descriptionLines = splitTextToLines(caseData.incidentDescription, doc, usableWidth);
    
    // Check if we need a new page for the description
    if (yPos + (descriptionLines.length * 5) > pageHeight - margin) {
      doc.addPage();
      yPos = margin;
      
      // Re-add the Description label on the new page
      doc.setFont('helvetica', 'bold');
      doc.text('Description (continued):', margin, yPos);
      yPos += 5;
      doc.setFont('helvetica', 'normal');
    }
    
    descriptionLines.forEach(line => {
      doc.text(line, margin, yPos);
      yPos += 5;
      
      // Check if we're about to run out of space during rendering
      if (yPos > pageHeight - margin) {
        doc.addPage();
        yPos = margin;
      }
    });
    
    yPos += 10; // More space after description
    
    // Check if we need a new page for parties involved
    if (yPos > pageHeight - 90) {
      doc.addPage();
      yPos = margin;
    }
    
    // Parties Involved
    doc.setFont('helvetica', 'bold');
    doc.text('PARTIES INVOLVED', margin, yPos);
    yPos += 7;
    
    doc.setDrawColor(0);
    doc.setLineWidth(0.2);
    doc.line(margin, yPos, pageWidth - margin, yPos);
    yPos += 7;
    
    // Complainant
    // Check if we have enough space for at least the complainant header
    if (yPos > pageHeight - 50) {
      doc.addPage();
      yPos = margin;
    }
    
    doc.setFont('helvetica', 'bold');
    doc.text('COMPLAINANT:', margin, yPos);
    yPos += 7;
    
    doc.setFont('helvetica', 'normal');
    
    // Complainant details
    doc.setFont('helvetica', 'normal');
    yPos += 5;
    
    // Format complainant name
    const complainantName = caseData.complainant.firstName && caseData.complainant.lastName 
      ? `${caseData.complainant.firstName} ${caseData.complainant.middleName || ''} ${caseData.complainant.lastName}`.trim()
      : caseData.complainant.name || 'Unknown';
      
    doc.text(`Name: ${complainantName}`, margin + 10, yPos);
    yPos += 5;
    
    // Check if we have space for the rest of complainant details
    if (yPos > pageHeight - 40) {
      doc.addPage();
      yPos = margin;
      doc.setFont('helvetica', 'bold');
      doc.text('COMPLAINANT (continued):', margin, yPos);
      yPos += 7;
      doc.setFont('helvetica', 'normal');
    }
    
    doc.text(`Address: ${caseData.complainant.address}`, margin + 10, yPos);
    yPos += 5;
    
    if (caseData.complainant.email) {
      doc.text(`Email: ${caseData.complainant.email}`, margin + 10, yPos);
      yPos += 5;
    }
    
    // Use contactNumber or contact field depending on which is available
    const complainantContact = caseData.complainant.contactNumber || caseData.complainant.contact || 'Not provided';
    doc.text(`Contact: ${complainantContact}`, margin + 10, yPos);
    yPos += 5;
    
    if (caseData.complainant.isResident !== undefined) {
      doc.text(`Resident: ${caseData.complainant.isResident ? 'Yes' : 'No'}`, margin + 10, yPos);
      yPos += 10;
    } else {
      yPos += 5;
    }
    
    // Respondent
    // Check if we have enough space for the respondent section
    if (yPos > pageHeight - 50) {
      doc.addPage();
      yPos = margin;
    }
    
    doc.setFont('helvetica', 'bold');
    doc.text('RESPONDENT:', margin, yPos);
    yPos += 7;
    
    // Respondent details
    doc.setFont('helvetica', 'normal');
    yPos += 5;
    
    // Format respondent name
    const respondentName = caseData.respondent.firstName && caseData.respondent.lastName 
      ? `${caseData.respondent.firstName} ${caseData.respondent.middleName || ''} ${caseData.respondent.lastName}`.trim()
      : caseData.respondent.name || 'Unknown';
      
    doc.text(`Name: ${respondentName}`, margin + 10, yPos);
    yPos += 5;
    
    // Check if we have space for the rest of respondent details
    if (yPos > pageHeight - 40) {
      doc.addPage();
      yPos = margin;
      doc.setFont('helvetica', 'bold');
      doc.text('RESPONDENT (continued):', margin, yPos);
      yPos += 7;
      doc.setFont('helvetica', 'normal');
    }
    
    doc.text(`Address: ${caseData.respondent.address}`, margin + 10, yPos);
    yPos += 5;
    
    if (caseData.respondent.email) {
      doc.text(`Email: ${caseData.respondent.email}`, margin + 10, yPos);
      yPos += 5;
    }
    
    // Use contactNumber or contact field depending on which is available
    const respondentContact = caseData.respondent.contactNumber || caseData.respondent.contact || 'Not provided';
    doc.text(`Contact: ${respondentContact}`, margin + 10, yPos);
    yPos += 5;
    
    if (caseData.respondent.isResident !== undefined) {
      doc.text(`Resident: ${caseData.respondent.isResident ? 'Yes' : 'No'}`, margin + 10, yPos);
      yPos += 10;
    } else {
      yPos += 5;
    }
    
    // Check if we need a new page for hearings and history
    if (yPos > pageHeight - 70 && (caseData.hearings?.length > 0 || caseData.statusUpdates?.length > 0)) {
      doc.addPage();
      yPos = margin;
    }
    
    // Scheduled Hearings
    // Check if we have enough space for the hearings section
    if (yPos > pageHeight - 60) {
      doc.addPage();
      yPos = margin;
    }
    
    doc.setFont('helvetica', 'bold');
    doc.text('SCHEDULED HEARINGS', margin, yPos);
    yPos += 7;
    
    doc.setDrawColor(0);
    doc.setLineWidth(0.2);
    doc.line(margin, yPos, pageWidth - margin, yPos);
    yPos += 7;
    
    doc.setFont('helvetica', 'normal');
    if (caseData.hearings && caseData.hearings.length > 0) {
      caseData.hearings.forEach((hearing: any, index: number) => {
        // Check if we need a new page for this hearing
        if (yPos > pageHeight - 25) {
          doc.addPage();
          yPos = margin;
          doc.setFont('helvetica', 'bold');
          doc.text('SCHEDULED HEARINGS (continued)', margin, yPos);
          yPos += 7;
          doc.setDrawColor(0);
          doc.setLineWidth(0.2);
          doc.line(margin, yPos, pageWidth - margin, yPos);
          yPos += 7;
          doc.setFont('helvetica', 'normal');
        }
        
        const hearingDate = new Date(hearing.date);
        const hearingTime = hearing.time || 'Not specified';
        const hearingStatus = hearing.status || 'Scheduled';
        const hearingLocation = hearing.location || 'Barangay Hall';
        
        doc.text(`${index + 1}. ${hearingDate.toLocaleDateString()} at ${hearingTime}`, margin + 5, yPos);
        yPos += 5;
        
        // Check if we need space for additional details
        if (yPos > pageHeight - 15) {
          doc.addPage();
          yPos = margin;
          doc.setFont('helvetica', 'normal');
        }
        
        doc.text(`   Location: ${hearingLocation} - Status: ${hearingStatus}`, margin + 5, yPos);
        yPos += 7; // Extra space between hearings
      });
    } else {
      doc.text('No hearings scheduled', margin + 5, yPos);
      yPos += 5;
    }
    yPos += 5;
    
    // Case History
    // Check if we have enough space for the case history section
    if (yPos > pageHeight - 60) {
      doc.addPage();
      yPos = margin;
    }
    
    doc.setFont('helvetica', 'bold');
    doc.text('CASE HISTORY', margin, yPos);
    yPos += 7;
    
    doc.setDrawColor(0);
    doc.setLineWidth(0.2);
    doc.line(margin, yPos, pageWidth - margin, yPos);
    yPos += 7;
    
    doc.setFont('helvetica', 'normal');
    // Check which history field is available (statusUpdates or history)
    const historyEntries = caseData.statusUpdates?.length > 0 ? caseData.statusUpdates : 
                         caseData.history?.length > 0 ? caseData.history : null;
                         
    if (historyEntries && historyEntries.length > 0) {
      historyEntries.forEach((entry: any, index: number) => {
        // Check if we need a new page for this history entry
        if (yPos > pageHeight - 25) {
          doc.addPage();
          yPos = margin;
          doc.setFont('helvetica', 'bold');
          doc.text('CASE HISTORY (continued)', margin, yPos);
          yPos += 7;
          doc.setDrawColor(0);
          doc.setLineWidth(0.2);
          doc.line(margin, yPos, pageWidth - margin, yPos);
          yPos += 7;
          doc.setFont('helvetica', 'normal');
        }
        
        // Handle different date field names (timestamp, createdAt, date)
        const entryDate = entry.timestamp ? new Date(entry.timestamp) : 
                        entry.createdAt ? new Date(entry.createdAt) : 
                        entry.date ? new Date(entry.date) : new Date();
                        
        // Handle different note field names (note, notes, status, action)
        const entryNote = entry.note || entry.notes || entry.status || entry.action || 'Status updated';
        
        doc.text(`${index + 1}. ${entryDate.toLocaleDateString()} - ${entryNote}`, margin + 5, yPos);
        yPos += 5;
      });
    } else {
      doc.text('No case history entries', margin + 5, yPos);
      yPos += 5;
    }
    yPos += 10;
    
    // Footer
    const footerY = pageHeight - margin - 20;
    
    doc.setDrawColor(0);
    doc.setLineWidth(0.5);
    doc.line(margin, footerY - 5, pageWidth - margin, footerY - 5);
    
    doc.setFontSize(9);
    doc.text('This is an official document issued by the Barangay Office.', margin, footerY);
    doc.text(`Report generated on: ${new Date().toLocaleString()}`, margin, footerY + 5);
    
    // Signature section
    // Check if we have enough space for signatures
    if (yPos > pageHeight - 80) {
      doc.addPage();
      yPos = margin;
    }
    
    doc.setFont('helvetica', 'bold');
    doc.text('CERTIFICATION', margin, yPos);
    yPos += 10;
    
    doc.setFont('helvetica', 'normal');
    doc.text('I hereby certify that this is a true and accurate record of the blotter report filed with this office.', margin, yPos);
    yPos += 20;
    
    // Add signature lines
    const colWidth = (pageWidth - (2 * margin)) / 2;
    
    doc.text('_'.repeat(30), margin, yPos);
    doc.text('_'.repeat(30), margin + colWidth, yPos);
    yPos += 5;
    
    doc.setFont('helvetica', 'bold');
    doc.text('Punong Barangay', margin, yPos);
    doc.text('Barangay Secretary', margin + colWidth, yPos);
    yPos += 15;
    
    // Date
    doc.setFont('helvetica', 'normal');
    const currentDate = new Date().toLocaleDateString();
    doc.text(`Date: ${currentDate}`, margin, yPos);
    
    // Add page numbers to all pages
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.text(`Page ${i} of ${pageCount}`, pageWidth - 28, pageHeight - 10);
    }
    
    // Convert the PDF to a buffer
    const pdfBuffer = Buffer.from(doc.output('arraybuffer'));
    return pdfBuffer;
  } catch (error) {
    console.error('Error generating PDF:', error);
    // Fallback to text mode if PDF generation fails
    return Buffer.from(`BLOTTER REPORT - ${caseData.caseNumber}\n\nError generating PDF format: ${(error as Error).message}`);
  }
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
        statusUpdates: {
          orderBy: { createdAt: 'desc' },
          take: 5
        },
        hearings: {
          orderBy: { date: 'desc' }
        }
      }
    });
    
    if (!blotterCase) {
      return NextResponse.json({ error: 'Blotter case not found' }, { status: 404 });
    }
    
    // Format the data for the report
    const formattedCase = {
      ...blotterCase,
      complainant: blotterCase.parties.find(p => p.partyType === BlotterPartyType.COMPLAINANT),
      respondent: blotterCase.parties.find(p => p.partyType === BlotterPartyType.RESPONDENT),
    };
    
    // Generate PDF report
    const pdfBuffer = await generatePdfBuffer(formattedCase);
    
    // Return the PDF as a download
    const headers = new Headers();
    headers.set('Content-Type', 'application/pdf');
    headers.set('Content-Disposition', `attachment; filename=${blotterCase.caseNumber}-report.pdf`);
    
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers
    });
  } catch (error) {
    console.error('Error generating report:', error);
    return NextResponse.json(
      { error: 'Failed to generate report' },
      { status: 500 }
    );
  }
} 