import { RealMarketData } from './realMarketData';

export function calculateDemandRiskScore(hsCodeData: RealMarketData): number {
  return 100 - (hsCodeData.demandScore * 100);
}
