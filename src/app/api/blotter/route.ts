import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const search = searchParams.get('search');
    
    // Calculate pagination
    const skip = (page - 1) * limit;
    
    // Prepare filters
    const filters: any = {};
    
    if (status) {
      filters.status = status;
    }
    
    if (priority) {
      filters.priority = priority;
    }
    
    if (search) {
      filters.OR = [
        { caseNumber: { contains: search, mode: 'insensitive' } },
        { incidentType: { contains: search, mode: 'insensitive' } },
        { incidentLocation: { contains: search, mode: 'insensitive' } },
      ];
    }
    
    // Fetch blotter cases with pagination and filtering
    const [blotterCases, totalCount] = await Promise.all([
      prisma.blotterCase.findMany({
        where: filters,
        include: {
          parties: true,
          statusUpdates: {
            orderBy: { createdAt: 'desc' },
            take: 1
          },
          hearings: {
            orderBy: { date: 'desc' },
            take: 1
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: limit
      }),
      prisma.blotterCase.count({ where: filters })
    ]);
    
    return NextResponse.json({
      data: blotterCases,
      pagination: {
        totalPages: Math.ceil(totalCount / limit),
        totalItems: totalCount,
        currentPage: page,
        itemsPerPage: limit
      }
    });
  } catch (error) {
    console.error('Error fetching blotter cases:', error);
    return NextResponse.json(
      { error: 'Failed to fetch blotter cases' },
      { status: 500 }
    );
  }
} 