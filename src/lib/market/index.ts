import { extractHSCodeFromTitle, getRealMarketData, getHSCodeByKeywords } from './realMarketData';
import { calculateMarketRiskScore } from './priceBenchmark';
import { calculateDemandRiskScore } from './demandEngine';
import { RealMarketData } from './realMarketData';
import { getUNComtradeData, getLivePriceEstimate } from './externalData';

export interface MarketIntelligence {
  hsCodeData: any;
  demandScore: number;
  avgPrice: number;
  marketRiskScore: number;
  topImportCountries: string[];
}

export async function getMarketIntelligence(dealTitle: string, dealValue: number): Promise<MarketIntelligence> {
  const hsCode = extractHSCodeFromTitle(dealTitle);
  const keywords = dealTitle.toLowerCase().split(' ');
  let hsCodeData = hsCode ? getRealMarketData(hsCode) : getHSCodeByKeywords(keywords);
  
  // Try external data first, fallback to internal data
  try {
    const externalData = await getUNComtradeData(hsCode || '0000');
    hsCodeData = {
      hsCode: hsCode || '0000',
      demandScore: externalData.demandScore,
      avgPrice: externalData.avgPrice,
      topImportCountries: externalData.topImportCountries
    };
  } catch (error) {
    // Use internal data as fallback
  }
  
  if (!hsCodeData) {
    return {
      hsCodeData: null,
      demandScore: 50,
      avgPrice: 0,
      marketRiskScore: 50,
      topImportCountries: []
    };
  }

  const priceRisk = calculateMarketRiskScore(dealValue, hsCodeData);
  const demandRisk = calculateDemandRiskScore(hsCodeData);
  const marketRiskScore = Math.max(priceRisk, demandRisk);

  return {
    hsCodeData,
    demandScore: hsCodeData.demandScore,
    avgPrice: hsCodeData.avgPrice,
    marketRiskScore,
    topImportCountries: hsCodeData.topImportCountries || []
  };
}
