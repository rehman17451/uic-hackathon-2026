import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Trash2, RotateCcw, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import { useUserStore } from '../store/useUserStore';

export default function AdminPage() {
  const navigate = useNavigate();
  const { theme } = useUserStore();

  const handleResetAll = () => {
    if (!confirm('This will erase ALL data — balance, transactions, trust score, chat, and settings. Continue?')) return;
    localStorage.removeItem('truesay-user');
    localStorage.removeItem('truesay-transactions');
    localStorage.removeItem('truesay-security');
    localStorage.removeItem('truesay-chat');
    window.location.replace('/login');
    window.location.reload();
  };

  const handleResetTransactions = () => {
    if (!confirm('Clear all transaction history?')) return;
    localStorage.removeItem('truesay-transactions');
    window.location.replace('/login');
    window.location.reload();
  };

  const handleResetSecurity = () => {
    if (!confirm('Reset trust score and fraud flags?')) return;
    localStorage.removeItem('truesay-security');
    window.location.replace('/login');
    window.location.reload();
  };

  return (
    <div className={`flex justify-center min-h-[100dvh] ${theme === 'dark' ? 'bg-black' : 'bg-gray-100'}`}>
      <div className={`w-full max-w-md min-h-[100dvh] flex flex-col shadow-2xl transition-colors ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
        
        {/* Header */}
        <div className={`px-5 py-4 flex items-center gap-4 border-b transition-colors ${theme === 'dark' ? 'border-gray-800' : 'border-gray-100'}`}>
          <button 
            onClick={() => navigate('/login')} 
            className={`p-2 -ml-2 rounded-full transition-colors ${theme === 'dark' ? 'hover:bg-gray-800 text-gray-300' : 'hover:bg-gray-100 text-gray-700'}`}
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className={`text-lg font-bold transition-colors ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Admin Settings</h1>
        </div>

        <div className="flex-1 p-6 space-y-4">

          {/* App Info */}
          <div className={`p-5 rounded-2xl border transition-colors ${theme === 'dark' ? 'bg-gray-800/50 border-gray-800' : 'bg-gray-50 border-gray-200'}`}>
            <div className="flex items-center gap-3 mb-3">
              <ShieldCheck size={20} className="text-brand-primary" />
              <h2 className={`font-bold text-sm uppercase tracking-wider ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>TrueSay v1.0</h2>
            </div>
            <p className={`text-xs font-medium leading-relaxed ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
              Secure UPI Payment Platform with AI-powered fraud detection and financial advisory.
            </p>
          </div>

          {/* Reset Options */}
          <h3 className={`text-xs font-bold uppercase tracking-widest px-1 pt-2 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>Data Management</h3>
          
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={handleResetTransactions}
            className={`w-full p-4 rounded-2xl border flex items-center gap-4 text-left transition-colors ${theme === 'dark' ? 'bg-gray-800/50 border-gray-800 hover:bg-gray-800' : 'bg-white border-gray-200 hover:bg-gray-50'}`}
          >
            <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-500/20 text-orange-500 flex items-center justify-center">
              <RotateCcw size={20} />
            </div>
            <div>
              <h4 className={`font-bold text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Clear Transactions</h4>
              <p className={`text-[11px] mt-0.5 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>Remove all payment history</p>
            </div>
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={handleResetSecurity}
            className={`w-full p-4 rounded-2xl border flex items-center gap-4 text-left transition-colors ${theme === 'dark' ? 'bg-gray-800/50 border-gray-800 hover:bg-gray-800' : 'bg-white border-gray-200 hover:bg-gray-50'}`}
          >
            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-500/20 text-blue-500 flex items-center justify-center">
              <ShieldCheck size={20} />
            </div>
            <div>
              <h4 className={`font-bold text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Reset Trust Score</h4>
              <p className={`text-[11px] mt-0.5 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>Clear fraud flags and restore score to 100%</p>
            </div>
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={handleResetAll}
            className={`w-full p-4 rounded-2xl border flex items-center gap-4 text-left transition-colors border-red-200 dark:border-red-900/50 ${theme === 'dark' ? 'bg-red-500/10 hover:bg-red-500/20' : 'bg-red-50 hover:bg-red-100'}`}
          >
            <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-500/20 text-red-500 flex items-center justify-center">
              <Trash2 size={20} />
            </div>
            <div>
              <h4 className="font-bold text-sm text-red-600 dark:text-red-400">Factory Reset</h4>
              <p className={`text-[11px] mt-0.5 ${theme === 'dark' ? 'text-red-400/60' : 'text-red-400'}`}>Erase all data and start fresh</p>
            </div>
          </motion.button>

        </div>
      </div>
    </div>
  );
}
