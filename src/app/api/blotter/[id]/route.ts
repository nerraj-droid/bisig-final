import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

export async function GET(
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
        },
        attachments: true
      }
    });
    
    if (!blotterCase) {
      return NextResponse.json({ error: 'Blotter case not found' }, { status: 404 });
    }
    
    return NextResponse.json(blotterCase);
  } catch (error) {
    console.error('Error fetching blotter case:', error);
    return NextResponse.json(
      { error: 'Failed to fetch blotter case' },
      { status: 500 }
    );
  }
} 