// app/api/esg/submit/route.ts
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

    const { type, data } = await request.json();

    // Validate type
    if (!['ENVIRONMENTAL', 'SOCIAL', 'GOVERNANCE'].includes(type)) {
      return NextResponse.json(
        { message: 'Invalid submission type' },
        { status: 400 }
      );
    }

    // Create submission
    const submission = await prisma.submission.create({
      data: {
        type,
        status: 'PENDING',
        data: JSON.stringify(data),
        companyId: session.user.companyId,
        submittedById: session.user.id,
        submittedAt: new Date(),
      },
    });

    return NextResponse.json(submission);
  } catch (error) {
    console.error('Error submitting ESG data:', error);
    return NextResponse.json(
      { message: 'Failed to submit ESG data' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}