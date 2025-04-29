import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { BlotterCaseStatus } from '@/lib/enums';

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
    const data = await request.json();
    
    // Validate required fields
    if (!data.status || !Object.values(BlotterCaseStatus).includes(data.status)) {
      return NextResponse.json({ error: 'Invalid status provided' }, { status: 400 });
    }
    
    // Check if the case exists
    const existingCase = await prisma.blotterCase.findUnique({
      where: { id }
    });
    
    if (!existingCase) {
      return NextResponse.json({ error: 'Blotter case not found' }, { status: 404 });
    }
    
    // Prepare data for case update
    const updateData: any = {
      status: data.status,
      updatedAt: new Date()
    };
    
    // Add specific fields based on the status
    if (data.filingFee !== undefined) {
      updateData.filingFee = data.filingFee;
    }
    
    if (data.filingFeePaid !== undefined) {
      updateData.filingFeePaid = data.filingFeePaid;
    }
    
    if (data.docketDate) {
      updateData.docketDate = new Date(data.docketDate);
    }
    
    if (data.summonDate) {
      updateData.summonDate = new Date(data.summonDate);
    }
    
    if (data.mediationStartDate) {
      updateData.mediationStartDate = new Date(data.mediationStartDate);
    }
    
    if (data.mediationEndDate) {
      updateData.mediationEndDate = new Date(data.mediationEndDate);
    }
    
    if (data.conciliationStartDate) {
      updateData.conciliationStartDate = new Date(data.conciliationStartDate);
    }
    
    if (data.conciliationEndDate) {
      updateData.conciliationEndDate = new Date(data.conciliationEndDate);
    }
    
    if (data.extensionDate) {
      updateData.extensionDate = new Date(data.extensionDate);
    }
    
    if (data.certificationDate) {
      updateData.certificationDate = new Date(data.certificationDate);
    }
    
    if (data.resolutionMethod) {
      updateData.resolutionMethod = data.resolutionMethod;
    }
    
    if (data.escalatedToEnt) {
      updateData.escalatedToEnt = data.escalatedToEnt;
    }
    
    // Update the case
    const updatedCase = await prisma.blotterCase.update({
      where: { id },
      data: updateData
    });
    
    // Create a status update record
    await prisma.blotterStatusUpdate.create({
      data: {
        blotterCaseId: id,
        status: data.status,
        notes: data.remarks || `Case status updated to ${data.status}`,
        updatedById: session.user.id,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });
    
    return NextResponse.json({
      success: true,
      message: 'Status updated successfully',
      case: updatedCase
    });
  } catch (error) {
    console.error('Error updating blotter status:', error);
    return NextResponse.json(
      { error: 'Failed to update blotter status', details: (error as Error).message },
      { status: 500 }
    );
  }
} 