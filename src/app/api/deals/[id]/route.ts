import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getAuthenticatedUser } from '@/lib/middleware';
import { detectRisks } from '@/lib/intelligence/riskEngine';
import { calculateDealScore } from '@/lib/intelligence/dealScorer';
import { generateDealInsights } from '@/lib/intelligence/insights';
import { getMarketIntelligence } from '@/lib/market';
import { updateDealSchema } from '@/lib/validation/schemas';

const prisma = new PrismaClient();

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({
        success: false,
        error: 'Unauthorized'
      }, { status: 401 });
    }

    const body = await request.json();
    const validation = updateDealSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json({
        success: false,
        error: validation.error.issues[0]?.message || 'Validation failed'
      }, { status: 400 });
    }

    const { title, value, currency, description, status } = validation.data;

    const existingDeal = await prisma.deal.findFirst({
      where: { id: String(id), userId: (user as any).userId },
      include: {
        supplier: true
      }
    });

    if (!existingDeal) {
      return NextResponse.json({
        success: false,
        error: 'Deal not found'
      }, { status: 404 });
    }

    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (value !== undefined) updateData.value = parseFloat(String(value));
    if (currency !== undefined) updateData.currency = currency;
    if (description !== undefined) updateData.description = description;
    if (status !== undefined) updateData.status = status;

    const updatedDealData = {
      ...existingDeal,
      ...updateData
    };

    const marketIntelligence = getMarketIntelligence(updatedDealData.title, updatedDealData.value);

    const tempDeal = {
      ...updatedDealData,
      supplier: {
        country: existingDeal.supplier.country,
        riskScore: existingDeal.supplier.riskScore
      },
      marketIntelligence
    };

    const risks = detectRisks(tempDeal);
    const score = calculateDealScore(tempDeal);
    const allDeals = await prisma.deal.findMany({
      where: { userId: (user as any).userId },
      include: { supplier: true }
    });
    const insights = generateDealInsights(tempDeal, allDeals as any);

    const deal = await prisma.deal.update({
      where: { id: String(id) },
      data: {
        ...updateData,
        score,
        risks: risks as any,
        insights: insights as any
      },
      include: {
        supplier: true
      }
    });

    return NextResponse.json({
      success: true,
      data: { deal }
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({
        success: false,
        error: 'Unauthorized'
      }, { status: 401 });
    }

    const existingDeal = await prisma.deal.findFirst({
      where: { id: String(id), userId: (user as any).userId }
    });

    if (!existingDeal) {
      return NextResponse.json({
        success: false,
        error: 'Deal not found'
      }, { status: 404 });
    }

    await prisma.deal.delete({
      where: { id: String(id) }
    });

    return NextResponse.json({
      success: true,
      data: { message: 'Deal deleted successfully' }
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}
