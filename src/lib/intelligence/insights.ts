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
  createdAt: Date;
  updatedAt: Date;
  marketIntelligence?: {
    demandScore: number;
    avgPrice: number;
    marketRiskScore: number;
    topImportCountries: string[];
  };
}

interface Insight {
  type: 'opportunity' | 'warning' | 'trend' | 'recommendation';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  actionable: boolean;
  suggestion?: string;
}

export function generateDealInsights(deal: Deal, allDeals: Deal[]): Insight[] {
  const insights: Insight[] = [];

  insights.push(...generateValueInsights(deal));
  insights.push(...generateSupplierInsights(deal));
  insights.push(...generateStatusInsights(deal));
  insights.push(...generatePortfolioInsights(deal, allDeals));

  return insights.sort((a, b) => {
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    return priorityOrder[b.priority] - priorityOrder[a.priority];
  });
}

function generateValueInsights(deal: Deal): Insight[] {
  const insights: Insight[] = [];

  if (deal.value > 1000000) {
    insights.push({
      type: 'opportunity',
      title: 'High-value opportunity',
      description: `This deal represents a significant opportunity with a value of $${deal.value.toLocaleString()}`,
      priority: 'high',
      actionable: true,
      suggestion: 'Consider dedicating senior resources and implementing enhanced monitoring'
    });
  }

  if (deal.value > 5000000) {
    insights.push({
      type: 'warning',
      title: 'Concentration risk',
      description: 'Large deal represents significant concentration risk',
      priority: 'medium',
      actionable: true,
      suggestion: 'Diversify portfolio and consider deal insurance'
    });
  }

  // Market intelligence insights
  if (deal.marketIntelligence?.avgPrice && deal.value < deal.marketIntelligence.avgPrice * 0.9) {
    insights.push({
      type: 'opportunity',
      title: 'Price below global average',
      description: `Deal priced ${Math.round((1 - deal.value/deal.marketIntelligence.avgPrice) * 100)}% below market average`,
      priority: 'high',
      actionable: true,
      suggestion: 'Consider margin optimization while maintaining competitive position'
    });
  }

  if (deal.marketIntelligence?.demandScore && deal.marketIntelligence.demandScore >= 85) {
    insights.push({
      type: 'opportunity',
      title: `High demand in ${deal.marketIntelligence.topImportCountries?.join(', ') || 'global market'}`,
      description: `Product in critical demand market segment`,
      priority: 'medium',
      actionable: true,
      suggestion: 'Consider expansion opportunities in this market segment'
    });
  }

  return insights;
}

function generateSupplierInsights(deal: Deal): Insight[] {
  const insights: Insight[] = [];

  if (deal.supplier.riskScore > 70) {
    insights.push({
      type: 'warning',
      title: 'High supplier risk',
      description: `Supplier has elevated risk score of ${deal.supplier.riskScore}`,
      priority: 'high',
      actionable: true,
      suggestion: 'Implement additional due diligence and consider backup suppliers'
    });
  }

  const emergingMarkets = ['BR', 'IN', 'MX', 'ZA', 'ID', 'VN', 'PH'];
  if (emergingMarkets.includes(deal.supplier.country)) {
    insights.push({
      type: 'opportunity',
      title: 'Emerging market exposure',
      description: `Supplier located in emerging market: ${deal.supplier.country}`,
      priority: 'medium',
      actionable: true,
      suggestion: 'Monitor currency fluctuations and political developments'
    });
  }

  return insights;
}

function generateStatusInsights(deal: Deal): Insight[] {
  const insights: Insight[] = [];

  if (deal.status === 'pending') {
    const daysPending = Math.floor((Date.now() - deal.createdAt.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysPending > 30) {
      insights.push({
        type: 'warning',
        title: 'Stalled deal',
        description: `Deal has been pending for ${daysPending} days`,
        priority: 'medium',
        actionable: true,
        suggestion: 'Follow up with stakeholder or consider deal closure'
      });
    }
  }

  if (deal.status === 'active') {
    insights.push({
      type: 'trend',
      title: 'Active engagement',
      description: 'Deal is currently active and progressing',
      priority: 'low',
      actionable: false
    });
  }

  return insights;
}

function generatePortfolioInsights(deal: Deal, allDeals: Deal[]): Insight[] {
  const insights: Insight[] = [];

  const totalPortfolioValue = allDeals.reduce((sum, d) => sum + d.value, 0);
  const dealPercentage = (deal.value / totalPortfolioValue) * 100;

  if (dealPercentage > 25) {
    insights.push({
      type: 'warning',
      title: 'Portfolio concentration',
      description: `This deal represents ${dealPercentage.toFixed(1)}% of total portfolio value`,
      priority: 'high',
      actionable: true,
      suggestion: 'Consider portfolio rebalancing to reduce concentration risk'
    });
  }

  const sameCountryDeals = allDeals.filter(d => d.supplier.country === deal.supplier.country);
  if (sameCountryDeals.length > 3) {
    insights.push({
      type: 'trend',
      title: 'Geographic concentration',
      description: `${sameCountryDeals.length} deals with suppliers in ${deal.supplier.country}`,
      priority: 'medium',
      actionable: true,
      suggestion: 'Consider geographic diversification'
    });
  }

  const recentDeals = allDeals.filter(d => 
    new Date(d.createdAt).getTime() > Date.now() - (90 * 24 * 60 * 60 * 1000)
  );

  if (recentDeals.length > 5) {
    insights.push({
      type: 'trend',
      title: 'High deal velocity',
      description: `${recentDeals.length} deals created in the last 90 days`,
      priority: 'low',
      actionable: false
    });
  }

  return insights;
}

export function generatePortfolioSummary(allDeals: Deal[]): {
  totalValue: number;
  activeDeals: number;
  pendingDeals: number;
  averageDealSize: number;
  topCountries: string[];
  riskDistribution: { low: number; medium: number; high: number };
} {
  const totalValue = allDeals.reduce((sum, deal) => sum + deal.value, 0);
  const activeDeals = allDeals.filter(deal => deal.status === 'active').length;
  const pendingDeals = allDeals.filter(deal => deal.status === 'pending').length;
  const averageDealSize = allDeals.length > 0 ? totalValue / allDeals.length : 0;

  const countryCounts: Record<string, number> = {};
  allDeals.forEach(deal => {
    countryCounts[deal.supplier.country] = (countryCounts[deal.supplier.country] || 0) + 1;
  });
  const topCountries = Object.entries(countryCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([country]) => country);

  const riskDistribution = allDeals.reduce(
    (acc, deal) => {
      if (deal.supplier.riskScore < 30) acc.low++;
      else if (deal.supplier.riskScore < 70) acc.medium++;
      else acc.high++;
      return acc;
    },
    { low: 0, medium: 0, high: 0 }
  );

  return {
    totalValue,
    activeDeals,
    pendingDeals,
    averageDealSize,
    topCountries,
    riskDistribution
  };
}
