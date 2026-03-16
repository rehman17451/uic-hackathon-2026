import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface FraudFlag {
  id: string;
  timestamp: string;
  reason: string;
  source: 'Auto' | 'Report';
}

interface SecurityState {
  trustScore: number;
  flags: FraudFlag[];
  isSuspended: boolean;
  addFlag: (txId: string, reason: string, source?: 'Auto' | 'Report') => void;
  evaluateFraudRules: (amount: number, time: Date, recentCount: number) => boolean;
}

export const useSecurityStore = create<SecurityState>()(
  persist(
    (set) => ({
      trustScore: 100,
      flags: [],
      isSuspended: false,
      addFlag: (id, reason, source = 'Report') => {
        const newFlag: FraudFlag = {
          id: id + '-' + Date.now(),
          timestamp: new Date().toISOString(),
          reason,
          source
        };
        
        set((state) => {
          const newFlags = [newFlag, ...state.flags];
          const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
          const recentFlags = newFlags.filter(f => new Date(f.timestamp).getTime() > thirtyDaysAgo);
          
          const isSuspended = recentFlags.length >= 5;
          const trustScore = Math.max(0, 100 - (state.flags.length + 1) * 10);
          
          return { flags: newFlags, trustScore, isSuspended };
        });
      },
      evaluateFraudRules: (amount, time, recentCount) => {
        if (amount > 50000) return true;
        if (recentCount >= 5) return true;
        const hour = time.getHours();
        if (hour >= 2 && hour < 5) return true;
        return false;
      }
    }),
    {
      name: 'truesay-security',
    }
  )
);
