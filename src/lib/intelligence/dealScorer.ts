interface Deal {
  id: string;
  title: string;
  value: number;
  currency: string;
  status: string;
  description?: string;
  supplier: {
    country: string;
    riskScore: number;
  };
  marketIntelligence?: {
    demandScore: number;
    avgPrice: number;
    marketRiskScore: number;
    topImportCountries: string[];
  };
}

interface ScoringFactors {
  profitability: number;
  risk: number;
  strategic: number;
  market: number;
}

export function calculateDealScore(deal: Deal): number {
  const factors = calculateScoringFactors(deal);
  
  const weights = {
    profitability: 0.3,
    risk: 0.25,
    strategic: 0.25,
    market: 0.2
  };

  const weightedScore = 
    factors.profitability * weights.profitability +
    factors.risk * weights.risk +
    factors.strategic * weights.strategic +
    factors.market * weights.market;

  return Math.round(Math.min(100, Math.max(0, weightedScore)));
}

function calculateScoringFactors(deal: Deal): ScoringFactors {
  return {
    profitability: calculateProfitabilityScore(deal),
    risk: calculateRiskScore(deal),
    strategic: calculateStrategicScore(deal),
    market: calculateMarketScore(deal)
  };
}

function calculateProfitabilityScore(deal: Deal): number {
  let score = 50;

  if (deal.value > 5000000) score += 30;
  else if (deal.value > 1000000) score += 20;
  else if (deal.value > 500000) score += 10;
  else if (deal.value < 100000) score -= 20;

  const highMarginKeywords = ['premium', 'exclusive', 'proprietary', 'innovative'];
  const hasHighMarginKeywords = highMarginKeywords.some(keyword =>
    deal.title.toLowerCase().includes(keyword) ||
    deal.description?.toLowerCase().includes(keyword)
  );

  if (hasHighMarginKeywords) score += 15;

  return Math.min(100, Math.max(0, score));
}

function calculateRiskScore(deal: Deal): number {
  let score = 50;

  const highRiskCountries = ['RU', 'CN', 'IR', 'KP', 'SY', 'AF'];
  const lowRiskCountries = ['US', 'CA', 'GB', 'DE', 'JP', 'AU', 'NZ', 'CH', 'SE', 'NO'];

  if (highRiskCountries.includes(deal.supplier.country)) score -= 30;
  else if (lowRiskCountries.includes(deal.supplier.country)) score += 20;

  score -= deal.supplier.riskScore * 0.3;

  if (deal.value > 2000000) score -= 10;
  else if (deal.value < 100000) score += 10;

  return Math.min(100, Math.max(0, score));
}

function calculateStrategicScore(deal: Deal): number {
  let score = 40;

  const strategicKeywords = [
    'partnership', 'strategic', 'long-term', 'exclusive', 'joint venture',
    'alliance', 'collaboration', 'innovation', 'transformation'
  ];

  const matches = strategicKeywords.filter(keyword =>
    deal.title.toLowerCase().includes(keyword) ||
    deal.description?.toLowerCase().includes(keyword)
  );

  score += matches.length * 10;

  if (deal.status === 'active') score += 20;
  else if (deal.status === 'pending') score += 10;

  return Math.min(100, Math.max(0, score));
}

function calculateMarketScore(deal: Deal): number {
  let score = 50;

  // Market intelligence scoring
  if (deal.marketIntelligence?.demandScore) {
    if (deal.marketIntelligence.demandScore >= 85) score += 20;
    else if (deal.marketIntelligence.demandScore >= 70) score += 15;
    else if (deal.marketIntelligence.demandScore >= 50) score += 5;
    else score -= 10;
  }

  // Price benchmark scoring
  if (deal.marketIntelligence?.avgPrice) {
    const priceRatio = deal.value / deal.marketIntelligence.avgPrice;
    if (priceRatio >= 0.9 && priceRatio <= 1.1) score += 10;
    else if (priceRatio < 0.9) score += 15;
    else if (priceRatio > 1.1) score -= 10;
  }

  const growthKeywords = ['growth', 'expansion', 'emerging', 'new market', 'scale'];
  const hasGrowthKeywords = growthKeywords.some(keyword =>
    deal.title.toLowerCase().includes(keyword) ||
    deal.description?.toLowerCase().includes(keyword)
  );

  if (hasGrowthKeywords) score += 10;

  const techKeywords = ['technology', 'digital', 'ai', 'automation', 'software'];
  const hasTechKeywords = techKeywords.some(keyword =>
    deal.title.toLowerCase().includes(keyword) ||
    deal.description?.toLowerCase().includes(keyword)
  );

  if (hasTechKeywords) score += 10;

  if (deal.value > 1000000) score += 5;

  return Math.min(100, Math.max(0, score));
}

export function getScoreGrade(score: number): string {
  if (score >= 90) return 'A+';
  if (score >= 80) return 'A';
  if (score >= 70) return 'B+';
  if (score >= 60) return 'B';
  if (score >= 50) return 'C+';
  if (score >= 40) return 'C';
  if (score >= 30) return 'D';
  return 'F';
}
