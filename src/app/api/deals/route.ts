import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getAuthenticatedUser } from '@/lib/middleware';
import { detectRisks } from '@/lib/intelligence/riskEngine';
import { calculateDealScore } from '@/lib/intelligence/dealScorer';
import { generateDealInsights } from '@/lib/intelligence/insights';
import { getMarketIntelligence } from '@/lib/market';
import { createDealSchema } from '@/lib/validation/schemas';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
        
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({
        success: false,
        error: 'Unauthorized'
      }, { status: 401 });
    }

    const deals = await prisma.deal.findMany({
      where: { userId: (user as any).userId },
      include: {
        supplier: true
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({
      success: true,
      data: { deals }
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({
        success: false,
        error: 'Unauthorized'
      }, { status: 401 });
    }

    const body = await request.json();
    const validation = createDealSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json({
        success: false,
        error: validation.error.issues[0]?.message || 'Validation failed'
      }, { status: 400 });
    }

    const { title, value, currency, description, supplierId } = validation.data;

    const supplier = await prisma.supplier.findUnique({
      where: { id: String(supplierId) }
    });

    if (!supplier) {
      return NextResponse.json({
        success: false,
        error: 'Supplier not found'
      }, { status: 404 });
    }

    const dealData = {
      title,
      value,
      currency: currency || 'USD',
      description,
      supplierId,
      userId: (user as any).userId
    };

    const marketIntelligence = await getMarketIntelligence(dealData.title, dealData.value);

    const tempDeal = {
      ...dealData,
      id: '',
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
      supplier: {
        country: supplier.country,
        riskScore: supplier.riskScore,
      },
      marketIntelligence
    };

    const risks = detectRisks(tempDeal);
    const score = calculateDealScore(tempDeal);
    const insights = generateDealInsights(tempDeal, []);

    const deal = await prisma.deal.create({
      data: {
        ...dealData,
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
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}
