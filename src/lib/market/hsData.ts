export interface HSCodeData {
  code: string;
  description: string;
  demandScore: number;
  avgPrice: number;
}

export const hsCodeDatabase: Record<string, HSCodeData> = {
  '847130': {
    code: '847130',
    description: 'Automatic data processing machines',
    demandScore: 85,
    avgPrice: 2500
  },
  '870322': {
    code: '870322',
    description: 'Automobile lighting equipment',
    demandScore: 72,
    avgPrice: 180
  },
  '300490': {
    code: '300490',
    description: 'Medicaments containing antibiotics',
    demandScore: 91,
    avgPrice: 45000
  },
  '851770': {
    code: '851770',
    description: 'Telephone sets, including cellular phones',
    demandScore: 78,
    avgPrice: 320
  },
  '842199': {
    code: '842199',
    description: 'Other office furniture',
    demandScore: 45,
    avgPrice: 250
  },
  '610910': {
    code: '610910',
    description: 'T-shirts, singlets and other vests',
    demandScore: 68,
    avgPrice: 12
  },
  '732111': {
    code: '732111',
    description: 'Steel cooking stoves',
    demandScore: 52,
    avgPrice: 85
  },
  '901380': {
    code: '901380',
    description: 'Other devices for lighting',
    demandScore: 63,
    avgPrice: 45
  },
  '392690': {
    code: '392690',
    description: 'Plates, sheets, film, foil and strip of plastics',
    demandScore: 71,
    avgPrice: 2800
  },
  '848180': {
    code: '848180',
    description: 'Automatic cash dispensers',
    demandScore: 88,
    avgPrice: 5500
  }
};

export function extractHSCodeFromTitle(title: string): string | null {
  const hsCodePattern = /\b(\d{6})\b/;
  const match = title.match(hsCodePattern);
  return match ? match[1] : null;
}

export function getHSCodeData(hsCode: string): HSCodeData | null {
  return hsCodeDatabase[hsCode] || null;
}

export function getHSCodeByKeywords(keywords: string[]): HSCodeData | null {
  const keywordMap: Record<string, string> = {
    'computer': '847130',
    'laptop': '847130',
    'car': '870322',
    'medicine': '300490',
    'phone': '851770',
    'furniture': '842199',
    'shirt': '610910',
    'steel': '732111',
    'plastic': '392690',
    'atm': '848180'
  };

  for (const keyword of keywords) {
    const lowerKeyword = keyword.toLowerCase();
    if (keywordMap[lowerKeyword]) {
      return hsCodeDatabase[keywordMap[lowerKeyword]];
    }
  }

  return null;
}
