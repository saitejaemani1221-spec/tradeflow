export interface RealMarketData {
  hsCode: string;
  demandScore: number;
  avgPrice: number;
  topImportCountries: string[];
}

export const realMarketDatabase: Record<string, RealMarketData> = {
  '1006': {
    hsCode: '1006',
    demandScore: 0.95,
    avgPrice: 85000,
    topImportCountries: ['Netherlands', 'Germany', 'USA']
  },
  '8703': {
    hsCode: '8703',
    demandScore: 0.88,
    avgPrice: 4500,
    topImportCountries: ['China', 'Germany', 'Japan']
  },
  '3004': {
    hsCode: '3004',
    demandScore: 0.92,
    avgPrice: 120000,
    topImportCountries: ['India', 'Ireland', 'USA']
  },
  '8517': {
    hsCode: '8517',
    demandScore: 0.91,
    avgPrice: 380,
    topImportCountries: ['China', 'Vietnam', 'South Korea']
  },
  '8421': {
    hsCode: '8421',
    demandScore: 0.82,
    avgPrice: 95,
    topImportCountries: ['China', 'Vietnam', 'Poland']
  },
  '6105': {
    hsCode: '6105',
    demandScore: 0.79,
    avgPrice: 15,
    topImportCountries: ['Bangladesh', 'Vietnam', 'India']
  },
  '7323': {
    hsCode: '7323',
    demandScore: 0.73,
    avgPrice: 120,
    topImportCountries: ['China', 'India', 'Turkey']
  },
  '8542': {
    hsCode: '8542',
    demandScore: 0.85,
    avgPrice: 65,
    topImportCountries: ['China', 'Mexico', 'Germany']
  },
  '3926': {
    hsCode: '3926',
    demandScore: 0.89,
    avgPrice: 1800,
    topImportCountries: ['China', 'USA', 'Germany']
  },
  '8483': {
    hsCode: '8483',
    demandScore: 0.93,
    avgPrice: 3200,
    topImportCountries: ['USA', 'China', 'Japan']
  }
};

export function getRealMarketData(hsCode: string): RealMarketData | null {
  return realMarketDatabase[hsCode] || null;
}

export function extractHSCodeFromTitle(title: string): string | null {
  const hsCodePattern = /\b(\d{4})\b/;
  const match = title.match(hsCodePattern);
  return match ? match[1] : null;
}

export function getHSCodeByKeywords(keywords: string[]): RealMarketData | null {
  const keywordMap: Record<string, string> = {
    'phone': '8517',
    'mobile': '8517',
    'computer': '1006',
    'laptop': '1006',
    'server': '1006',
    'medicine': '3004',
    'pharmaceutical': '3004',
    'furniture': '8421',
    'table': '8421',
    'chair': '8421',
    'clothing': '6105',
    'textile': '6105',
    'shirt': '6105',
    'steel': '7323',
    'metal': '7323',
    'cooking': '7323',
    'stove': '7323',
    'lighting': '8542',
    'lamp': '8542',
    'plastic': '3926',
    'film': '3926',
    'atm': '8483',
    'cash': '8483',
    'banking': '8483'
  };

  for (const keyword of keywords) {
    const lowerKeyword = keyword.toLowerCase();
    if (keywordMap[lowerKeyword]) {
      return realMarketDatabase[keywordMap[lowerKeyword]];
    }
  }

  return null;
}
