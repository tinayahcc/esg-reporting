// app/api/esg/scores/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    let companyId = session.user.companyId;

    // If no company ID provided, use the user's company
    if (!companyId) {
      companyId = session.user.companyId;
    }

    // Check if user has access to this company's data
    if (
      session.user.role !== "ADMIN" &&
      session.user.role !== "ESG_TEAM" &&
      session.user.companyId !== companyId
    ) {
      return NextResponse.json(
        { message: "Unauthorized to access this company's data" },
        { status: 403 }
      );
    }

    // Get ESG scores
    const scores = await prisma.eSGScore.findUnique({
      where: { companyId },
    });

    if (!scores) {
      return NextResponse.json({
        environmentalScore: 0,
        socialScore: 0,
        governanceScore: 0,
        overallScore: 0,
      });
    }

    return NextResponse.json(scores);
  } catch (error) {
    console.error("Error fetching ESG scores:", error);
    return NextResponse.json(
      { message: "Failed to fetch ESG scores" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
