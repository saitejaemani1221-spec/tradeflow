export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

export interface Supplier {
  id: string;
  name: string;
  email: string;
  country: string;
  riskScore: number;
  createdAt: string;
  updatedAt: string;
}

export interface Deal {
  id: string;
  title: string;
  value: number;
  currency: string;
  status: string;
  score: number;
  risks: any[];
  insights: any[];
  description?: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
  supplierId: string;
}

export interface DealWithSupplier extends Deal {
  supplier: Supplier;
  marketIntelligence?: {
    demandScore: number;
    avgPrice: number;
    marketRiskScore: number;
    topImportCountries: string[];
  };
}
