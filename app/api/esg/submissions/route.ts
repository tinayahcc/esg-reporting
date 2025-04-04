// app/api/esg/submissions/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }
    const { type } = await request.json();
    const companyId = session.user.companyId;

    // Build query filters
    const filters: any = {};
    
    if (type) {
      filters.type = type;
    }
    
    // If user is not admin or ESG team, restrict to their company
    if (session.user.role !== 'ADMIN' && session.user.role !== 'esg_team') {
      filters.companyId = session.user.companyId;
    } else if (companyId) {
      // Admin or ESG team can filter by company
      filters.companyId = companyId;
    }

    const submissions = await prisma.submission.findMany({
      where: filters,
      include: {
        company: {
          select: {
            id: true,
            name: true,
          },
        },
        submittedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        reviewer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        submittedAt: 'desc',
      },
    });

    return NextResponse.json(submissions);
  } catch (error) {
    console.error('Error fetching submissions:', error);
    return NextResponse.json(
      { message: 'Failed to fetch submissions' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}