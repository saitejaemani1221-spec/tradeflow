export interface DealAdvisorResult {
  recommendation: 'GOOD' | 'NEGATIVE' | 'AVOID';
  reasons: string[];
}

export async function analyzeDeal(deal: any): Promise<DealAdvisorResult> {
  const { marketIntelligence, value, title } = deal;
  
  if (!marketIntelligence) {
    return {
      recommendation: 'AVOID',
      reasons: ['No market data available']
    };
  }

  const { demandScore, avgPrice } = marketIntelligence;
  const priceRatio = value / avgPrice;
  
  // Simple rule-based analysis
  if (demandScore >= 0.8 && priceRatio <= 0.9) {
    return {
      recommendation: 'GOOD',
      reasons: ['High market demand', 'Price below market average']
    };
  }
  
  if (demandScore < 0.6 || priceRatio > 1.3) {
    return {
      recommendation: 'AVOID',
      reasons: ['Low market demand', 'Price significantly above market']
    };
  }
  
  return {
    recommendation: 'NEGATIVE',
    reasons: ['Moderate market conditions', 'Price near market average']
  };
}
