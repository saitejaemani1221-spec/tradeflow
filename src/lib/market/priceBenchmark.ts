import { RealMarketData } from './realMarketData';

export function calculateMarketRiskScore(dealValue: number, marketData: RealMarketData): number {
  const priceDeviation = Math.abs((dealValue - marketData.avgPrice) / marketData.avgPrice);
  const demandRisk = 100 - (marketData.demandScore * 100);
  
  return Math.min(100, (priceDeviation * 50) + (demandRisk * 0.5));
}

export function getMarketData(marketData: RealMarketData) {
  return {
    demandScore: marketData.demandScore,
    avgPrice: marketData.avgPrice,
    marketRiskScore: 0
  };
}
