import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UserState {
  balance: number;
  isAuthenticated: boolean;
  pinLockoutUntil: number | null;
  wrongAttempts: number;
  theme: 'light' | 'dark';
  setBalance: (amount: number) => void;
  deductBalance: (amount: number) => void;
  addBalance: (amount: number) => void;
  login: () => void;
  logout: () => void;
  recordWrongAttempt: () => void;
  resetAttempts: () => void;
  toggleTheme: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      balance: 45200.50,
      isAuthenticated: false,
      pinLockoutUntil: null,
      wrongAttempts: 0,
      theme: 'light',
      setBalance: (amount) => set({ balance: amount }),
      deductBalance: (amount) => set((state) => ({ balance: Math.max(0, state.balance - amount) })),
      addBalance: (amount) => set((state) => ({ balance: state.balance + amount })),
      login: () => set({ isAuthenticated: true, wrongAttempts: 0 }),
      logout: () => set({ isAuthenticated: false }),
      toggleTheme: () => set((state) => {
        const newTheme = state.theme === 'light' ? 'dark' : 'light';
        return { theme: newTheme };
      }),
      recordWrongAttempt: () => {
        const attempts = get().wrongAttempts + 1;
        if (attempts >= 3) {
          const lockoutTime = Date.now() + 5 * 60 * 1000;
          set({ wrongAttempts: attempts, pinLockoutUntil: lockoutTime });
        } else {
          set({ wrongAttempts: attempts });
        }
      },
      resetAttempts: () => set({ wrongAttempts: 0, pinLockoutUntil: null }),
    }),
    {
      name: 'truesay-user',
    }
  )
);
