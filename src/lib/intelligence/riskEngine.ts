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

interface Risk {
  type: 'geopolitical' | 'financial' | 'supplier' | 'regulatory';
  level: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  mitigation?: string;
}

export function detectRisks(deal: Deal): Risk[] {
  const risks: Risk[] = [];

  // Market risk assessment
  if (deal.marketIntelligence?.marketRiskScore && deal.marketIntelligence.marketRiskScore > 70) {
    risks.push({
      type: 'financial',
      level: 'high',
      description: `High market risk score: ${deal.marketIntelligence.marketRiskScore}`,
      mitigation: 'Consider market hedging strategies'
    });
  } else if (deal.marketIntelligence?.marketRiskScore && deal.marketIntelligence.marketRiskScore > 50) {
    risks.push({
      type: 'financial',
      level: 'medium',
      description: `Moderate market risk score: ${deal.marketIntelligence.marketRiskScore}`,
      mitigation: 'Monitor market trends closely'
    });
  }

  // Price risk assessment
  if (deal.marketIntelligence?.avgPrice && deal.value > deal.marketIntelligence.avgPrice * 1.2) {
    risks.push({
      type: 'financial',
      level: 'high',
      description: `Price significantly above market average`,
      mitigation: 'Renegotiate pricing or justify premium value'
    });
  } else if (deal.marketIntelligence?.avgPrice && deal.value > deal.marketIntelligence.avgPrice * 1.1) {
    risks.push({
      type: 'financial',
      level: 'medium',
      description: `Price above market average`,
      mitigation: 'Monitor competitive pricing'
    });
  }

  // Supplier risk assessment
  if (deal.supplier.riskScore > 70) {
    risks.push({
      type: 'supplier',
      level: 'high',
      description: `High supplier risk score: ${deal.supplier.riskScore}`,
      mitigation: 'Consider alternative suppliers or additional guarantees'
    });
  } else if (deal.supplier.riskScore > 40) {
    risks.push({
      type: 'supplier',
      level: 'medium',
      description: `Moderate supplier risk score: ${deal.supplier.riskScore}`,
      mitigation: 'Monitor supplier performance closely'
    });
  }

  // Geopolitical risk assessment
  const highRiskCountries = ['RU', 'CN', 'IR', 'KP', 'SY', 'AF'];
  const mediumRiskCountries = ['TR', 'BR', 'ZA', 'MX', 'IN'];

  if (highRiskCountries.includes(deal.supplier.country)) {
    risks.push({
      type: 'geopolitical',
      level: 'critical',
      description: `Supplier located in high-risk country: ${deal.supplier.country}`,
      mitigation: 'Implement enhanced due diligence and consider political risk insurance'
    });
  } else if (mediumRiskCountries.includes(deal.supplier.country)) {
    risks.push({
      type: 'geopolitical',
      level: 'medium',
      description: `Supplier located in medium-risk country: ${deal.supplier.country}`,
      mitigation: 'Regular monitoring of political developments'
    });
  }

  // Financial risk assessment
  if (deal.value > 1000000) {
    risks.push({
      type: 'financial',
      level: 'high',
      description: `High-value deal: $${deal.value.toLocaleString()}`,
      mitigation: 'Consider payment guarantees and milestone-based payments'
    });
  } else if (deal.value > 500000) {
    risks.push({
      type: 'financial',
      level: 'medium',
      description: `Medium-high value deal: $${deal.value.toLocaleString()}`,
      mitigation: 'Implement strong financial controls'
    });
  }

  // Regulatory risk assessment
  const regulatedKeywords = ['medical', 'pharmaceutical', 'financial', 'banking', 'defense'];
  const hasRegulatedKeywords = regulatedKeywords.some(keyword => 
    deal.title.toLowerCase().includes(keyword) || 
    deal.description?.toLowerCase().includes(keyword)
  );

  if (hasRegulatedKeywords) {
    risks.push({
      type: 'regulatory',
      level: 'high',
      description: 'Deal involves regulated industry',
      mitigation: 'Ensure compliance with relevant regulations and obtain necessary licenses'
    });
  }

  return risks;
}

export function calculateOverallRiskLevel(risks: Risk[]): 'low' | 'medium' | 'high' | 'critical' {
  if (risks.some(risk => risk.level === 'critical')) return 'critical';
  if (risks.some(risk => risk.level === 'high')) return 'high';
  if (risks.some(risk => risk.level === 'medium')) return 'medium';
  return 'low';
}
