import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useUserStore } from './useUserStore';

export interface Transaction {
  id: string;
  date: string;
  amount: number;
  partyName: string;
  status: 'Completed' | 'Pending' | 'Failed';
  trustScoreAtTime: number;
  type: 'Sent' | 'Received';
}

export interface TransactionState {
  transactions: Transaction[];
  addTransaction: (tx: Omit<Transaction, 'id' | 'date' | 'trustScoreAtTime'>) => void;
  reportFraud: (txId: string) => void;
  simulateHistory: () => void;
}

export const useTransactionStore = create<TransactionState>()(
  persist(
    (set, get) => ({
      transactions: [],
      addTransaction: (txData) => {
        const trustScore = 100;
        const newTx: Transaction = {
          ...txData,
          id: Math.random().toString(36).substr(2, 9),
          date: new Date().toISOString(),
          trustScoreAtTime: trustScore,
        };

        // Update balance dynamically
        if (newTx.status === 'Completed') {
          const { deductBalance, addBalance } = useUserStore.getState();
          if (newTx.type === 'Sent') {
            deductBalance(newTx.amount);
          } else if (newTx.type === 'Received') {
            addBalance(newTx.amount);
          }
        }

        set((state) => ({ transactions: [newTx, ...state.transactions] }));
      },
      reportFraud: (txId) => {
        const tx = get().transactions.find(t => t.id === txId);
        if (!tx) return;
      },
      simulateHistory: () => {
        if (get().transactions.length === 0) {
          set({
            transactions: [
              { id: '1', date: new Date(Date.now() - 86400000).toISOString(), amount: 2500, partyName: 'Rahul Sharma', status: 'Completed', trustScoreAtTime: 100, type: 'Sent' },
              { id: '2', date: new Date(Date.now() - 172800000).toISOString(), amount: 15000, partyName: 'Amazon', status: 'Completed', trustScoreAtTime: 100, type: 'Sent' },
              { id: '3', date: new Date(Date.now() - 259200000).toISOString(), amount: 5000, partyName: 'Priya Patel', status: 'Completed', trustScoreAtTime: 100, type: 'Received' },
            ],
          });
        }
      }
    }),
    {
      name: 'truesay-transactions',
    }
  )
);
