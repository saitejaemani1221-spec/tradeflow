export interface UserPlan {
  plan: 'FREE' | 'PRO';
  analysesRemaining: number;
  resetDate: Date;
}

export const FREE_PLAN_LIMIT = 5;
export const PRO_PLAN_LIMIT = Infinity;

export function getPlanForUser(userId: string): UserPlan {
  // In production, this would check database
  // For now, return free plan
  return {
    plan: 'FREE',
    analysesRemaining: FREE_PLAN_LIMIT,
    resetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
  };
}

export function canAnalyzeDeal(userPlan: UserPlan): boolean {
  return userPlan.analysesRemaining > 0;
}

export function decrementAnalyses(userPlan: UserPlan): UserPlan {
  return {
    ...userPlan,
    analysesRemaining: Math.max(0, userPlan.analysesRemaining - 1)
  };
}
