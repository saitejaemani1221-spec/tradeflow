import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/middleware';
import { analyzeDeal } from '@/lib/ai/advisor';
import { getPlanForUser, canAnalyzeDeal, decrementAnalyses } from '@/lib/plan';

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({
        success: false,
        error: 'Unauthorized'
      }, { status: 401 });
    }

    const { dealId } = await request.json();
    
    // Get user plan
    const userPlan = getPlanForUser((user as any).userId);
    
    if (!canAnalyzeDeal(userPlan)) {
      return NextResponse.json({
        success: false,
        error: 'Analysis limit reached. Upgrade to Pro plan for unlimited analyses.'
      }, { status: 429 });
    }
    
    // Get deal from database
    const response = await fetch(`/api/deals/${dealId}`);
    if (!response.ok) {
      return NextResponse.json({
        success: false,
        error: 'Deal not found'
      }, { status: 404 });
    }
    
    const deal = await response.json();
    const result = await analyzeDeal(deal.data);
    
    // Decrement remaining analyses
    const updatedPlan = decrementAnalyses(userPlan);
    
    return NextResponse.json({
      success: true,
      data: result
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}
