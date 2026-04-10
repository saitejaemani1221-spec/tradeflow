export interface ExternalMarketData {
  demandScore: number;
  avgPrice: number;
  topImportCountries: string[];
}

export async function getUNComtradeData(hsCode: string): Promise<ExternalMarketData> {
  try {
    const response = await fetch(`https://comtradeplus.un.org/api/v1/getHSCodeData?hsCode=${hsCode}`);
    if (!response.ok) {
      throw new Error('Failed to fetch UN Comtrade data');
    }
    const data = await response.json();
    
    return {
      demandScore: data.demandScore || 0.5,
      avgPrice: data.avgPrice || 1000,
      topImportCountries: data.topImportCountries || ['USA', 'China']
    };
  } catch (error) {
    // Fallback to mock data
    return {
      demandScore: 0.7,
      avgPrice: 1500,
      topImportCountries: ['USA', 'Germany', 'China']
    };
  }
}

export async function getLivePriceEstimate(hsCode: string): Promise<number> {
  try {
    const response = await fetch(`https://api.example.com/market/price?hsCode=${hsCode}`);
    if (!response.ok) {
      throw new Error('Failed to fetch price data');
    }
    const data = await response.json();
    return data.price || 1000;
  } catch (error) {
    return 1000;
  }
}
