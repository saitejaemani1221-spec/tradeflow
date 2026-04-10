'use client';

import React, { useState, useEffect } from 'react';
import { DealWithSupplier } from '@/types';
import { authFetch } from '@/lib/authFetch';

// Mock advisor function for now
async function analyzeDeal(dealId: string) {
  try {
    const response = await authFetch('/api/deals/advice', {
      method: 'POST',
      body: JSON.stringify({ dealId }),
    });
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error analyzing deal:', error);
    return {
      recommendation: 'AVOID',
      reasons: ['Analysis failed']
    };
  }
}

function getDemandBadge(demandScore: number) {
  if (demandScore >= 0.9) return { text: 'Critical', color: 'bg-red-500 text-white' };
  if (demandScore >= 0.8) return { text: 'High', color: 'bg-orange-500 text-white' };
  if (demandScore >= 0.7) return { text: 'Medium', color: 'bg-yellow-500 text-white' };
  return { text: 'Low', color: 'bg-green-500 text-white' };
}

function getScoreBadge(score: number) {
  if (score >= 80) return { text: 'A+', color: 'bg-gradient-to-r from-green-500 to-emerald-500 text-white' };
  if (score >= 70) return { text: 'A', color: 'bg-gradient-to-r from-green-500 to-emerald-500 text-white' };
  if (score >= 60) return { text: 'B+', color: 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white' };
  if (score >= 50) return { text: 'B', color: 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white' };
  return { text: 'C', color: 'bg-gradient-to-r from-red-500 to-pink-500 text-white' };
}

function getPriceComparison(dealValue: number, avgPrice: number) {
  if (avgPrice === 0) return { text: 'No market data', color: 'text-gray-400' };
  const ratio = dealValue / avgPrice;
  if (ratio >= 0.9 && ratio <= 1.1) return { text: 'At market', color: 'text-green-400' };
  if (ratio < 0.9) return { text: 'Below market', color: 'text-blue-400' };
  return { text: 'Above market', color: 'text-orange-400' };
}

export default function Dashboard() {
  const [deals, setDeals] = useState<DealWithSupplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDeals();
  }, []);

  const fetchDeals = async () => {
    try {
      const response = await authFetch('/api/deals');
      
      if (response.status === 401) {
        localStorage.removeItem("token");
        window.location.href = "/auth/login";
        return;
      }
      
      if (!response.ok) {
        throw new Error(`Failed to fetch deals: ${response.status}`);
      }
      
      const data = await response.json();
      if (data.success) {
        setDeals(data.data.deals || []);
      } else {
        setError(data.error || 'Failed to load deals');
      }
    } catch (err) {
      console.error('Error fetching deals:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="flex space-x-4 mb-8">
            <div className="w-4 h-4 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full animate-pulse"></div>
            <div className="w-4 h-4 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full animate-ping"></div>
            <div className="w-4 h-4 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full animate-ping" style={{ animationDelay: '0.5s' }}></div>
          </div>
          <h2 className="text-2xl font-semibold text-white mb-4">Loading your deals...</h2>
          <div className="w-16 h-1 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full animate-pulse"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-red-900 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mb-4">
            <span className="text-3xl">⚠️</span>
          </div>
          <h2 className="text-2xl font-semibold text-white mb-4">Something went wrong</h2>
          <p className="text-red-200 mb-8">{error}</p>
          <button 
            onClick={fetchDeals}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg font-semibold hover:from-blue-600 hover:to-cyan-600 transition-all duration-300 transform hover:scale-105"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (deals.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="mb-8">
            <div className="w-24 h-24 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full flex items-center justify-center mb-4 animate-pulse">
              <span className="text-5xl">📊</span>
            </div>
          </div>
          <h2 className="text-4xl font-bold text-white mb-4">No deals yet</h2>
          <p className="text-blue-200 text-lg mb-8">Create your first deal to start analyzing market intelligence</p>
          <div className="flex space-x-4">
            <button className="px-8 py-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-cyan-600 transition-all duration-300 transform hover:scale-105 shadow-2xl">
              Create Deal
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-black">
      <div className="max-w-7xl mx-auto py-8 px-4">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="relative">
              <div className="w-3 h-3 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full animate-pulse"></div>
              <div className="absolute inset-0 w-3 h-3 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full animate-ping"></div>
            </div>
            <h1 className="text-5xl font-bold text-white tracking-tight">
              <span className="bg-gradient-to-r from-blue-600 to-cyan-400 bg-clip-text text-transparent">
                TradeFlow
              </span>
            </h1>
          </div>
          <p className="text-blue-200 text-lg mb-8">AI-powered global trade intelligence</p>
        </div>
        
        <div className="grid grid-cols-1 gap-6">
          {deals.map((deal) => {
            const demandBadge = getDemandBadge(deal.marketIntelligence?.demandScore || 0.5);
            const scoreBadge = getScoreBadge(deal.score);
            const priceComparison = getPriceComparison(deal.value, deal.marketIntelligence?.avgPrice || 0);
            
            return (
              <div key={deal.id} className="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105 border border border-gray-200/50 hover:border-blue-400/50">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-gray-900 mb-2 bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">
                        {deal.title}
                      </h3>
                      <p className="text-gray-600 text-sm">
                        {deal.supplier.name} • {deal.supplier.country}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-4xl font-bold text-gray-900 mb-1">
                        ${deal.value.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-500">{deal.currency}</div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="text-center">
                      <div className="text-sm font-medium text-gray-500 mb-2 uppercase tracking-wider">Score</div>
                      <div className={`inline-block px-4 py-2 rounded-full text-lg font-bold ${scoreBadge.color} shadow-lg`}>
                        {scoreBadge.text}
                      </div>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-sm font-medium text-gray-500 mb-2 uppercase tracking-wider">Demand</div>
                      <div className={`inline-block px-4 py-2 rounded-full text-lg font-bold ${demandBadge.color} shadow-lg`}>
                        {demandBadge.text}
                      </div>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-sm font-medium text-gray-500 mb-2 uppercase tracking-wider">Price Analysis</div>
                      <div className={`text-sm font-semibold ${priceComparison.color}`}>
                        {priceComparison.text}
                      </div>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-sm font-medium text-gray-500 mb-2 uppercase tracking-wider">Status</div>
                      <div className={`inline-block px-4 py-2 rounded-full text-lg font-bold ${
                        deal.status === 'active' ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg' :
                        deal.status === 'pending' ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg' :
                        'bg-gradient-to-r from-gray-500 to-gray-600 text-white shadow-lg'
                      }`}>
                        {deal.status}
                      </div>
                    </div>
                  </div>
                  
                  <div className="border-t pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {deal.risks && deal.risks.length > 0 && (
                        <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-xl p-6 shadow-lg">
                          <div className="flex items-center mb-3">
                            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center mb-3">
                              <span className="text-2xl">⚠️</span>
                            </div>
                            <div className="text-sm font-medium text-red-100">Risks Detected</div>
                          </div>
                          <div className="space-y-2">
                            {deal.risks.slice(0, 3).map((risk, index) => (
                              <div key={index} className="text-red-100 text-sm flex items-start">
                                <span className="mr-2">•</span>
                                <span>{risk.description}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {deal.insights && deal.insights.length > 0 && (
                        <div className="bg-gradient-to-r from-blue-500 to-cyan-600 rounded-xl p-6 shadow-lg">
                          <div className="flex items-center mb-3">
                            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center mb-3">
                              <span className="text-2xl">💡</span>
                            </div>
                            <div className="text-sm font-medium text-cyan-100">Market Insights</div>
                          </div>
                          <div className="space-y-2">
                            {deal.insights.slice(0, 3).map((insight, index) => (
                              <div key={index} className="text-cyan-100 text-sm flex items-start">
                                <span className="mr-2">•</span>
                                <span>{insight.description}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center mt-6">
                    <button
                      onClick={() => analyzeDeal(deal.id)}
                      className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-cyan-600 transition-all duration-300 transform hover:scale-105 shadow-2xl"
                    >
                      Analyze Deal
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
