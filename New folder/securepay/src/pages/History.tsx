import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Filter, AlertOctagon } from 'lucide-react';
import { useTransactionStore } from '../store/useTransactionStore';
import { useUserStore } from '../store/useUserStore';
import type { Transaction } from '../store/useTransactionStore';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';

export default function History() {
  const navigate = useNavigate();
  const { transactions, reportFraud } = useTransactionStore();
  const { theme } = useUserStore();
  
  const [filterMode, setFilterMode] = useState<'all' | 'high_amount'>('all');
  const [reportedTxIds, setReportedTxIds] = useState<Set<string>>(new Set());

  const handleReportFraud = (tx: Transaction) => {
    if (window.confirm(`Are you sure you want to report fraud for transaction of ₹${tx.amount} with ${tx.partyName}? This will flag the account.`)) {
      reportFraud(tx.id);
      setReportedTxIds(new Set(reportedTxIds).add(tx.id));
      alert("Fraud reported successfully. Trust score engine updated.");
    }
  };

  const filteredTransactions = transactions.filter(tx => {
    if (filterMode === 'high_amount') return tx.amount >= 10000;
    return true;
  });

  // Prepare chart data (reverse to chronological order for chart)
  const chartData = [...transactions].reverse().map(tx => ({
    name: new Date(tx.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
    amount: tx.amount
  }));

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex flex-col bg-gray-50 dark:bg-gray-950 transition-colors duration-300"
    >
      <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl px-4 py-3 pb-4 shadow-sm border-b border-gray-100 dark:border-gray-800 flex items-center justify-between z-10 transition-colors">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/')} className={`p-2 -ml-2 rounded-full transition-colors ${theme === 'dark' ? 'hover:bg-gray-800 text-gray-300' : 'hover:bg-gray-100 text-gray-700'}`}>
            <ArrowLeft size={24} />
          </button>
          <h1 className={`text-lg font-bold transition-colors ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>History</h1>
        </div>
        <button 
          onClick={() => setFilterMode(prev => prev === 'all' ? 'high_amount' : 'all')}
          className={`p-2 rounded-full flex items-center gap-2 text-sm font-bold transition-colors ${filterMode === 'high_amount' ? 'bg-brand-primary/10 text-brand-primary' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
        >
          <Filter size={18} />
          {filterMode === 'high_amount' ? '> ₹10k' : 'Filter'}
        </button>
      </div>

      <div className="p-4 bg-white dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-800 shadow-sm transition-colors">
        <h3 className={`text-xs font-bold uppercase tracking-wider mb-4 px-2 transition-colors ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Spending Trend</h3>
        <div className="h-40 w-full overflow-hidden text-xs">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(156, 163, 175, 0.2)" />
              <XAxis dataKey="name" tick={{fill: '#9ca3af'}} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={(val) => `₹${val/1000}k`} tick={{fill: '#9ca3af'}} axisLine={false} tickLine={false} width={45} />
              <Tooltip 
                formatter={(value: any) => [`₹${value}`, 'Amount']} 
                contentStyle={{ backgroundColor: 'rgba(17, 24, 39, 0.9)', border: 'none', borderRadius: '12px', color: '#fff' }}
              />
              <Line type="monotone" dataKey="amount" stroke="#22c55e" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="flex-1 p-4 pb-20">
        {filteredTransactions.length === 0 ? (
          <div className="text-center text-gray-400 py-12">No transactions found</div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence>
              {filteredTransactions.map((tx, index) => (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.05 }}
                  key={tx.id} 
                  className="bg-white dark:bg-gray-900/80 p-5 rounded-[1.5rem] shadow-sm shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-gray-800 transition-colors"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className={`font-bold transition-colors ${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'}`}>{tx.partyName}</h3>
                      <p className={`text-[11px] font-medium tracking-wide transition-colors ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{new Date(tx.date).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</p>
                    </div>
                    <div className={`text-lg font-black tracking-tight transition-colors ${tx.type === 'Received' ? 'text-brand-primary' : (theme === 'dark' ? 'text-white' : 'text-gray-900')}`}>
                      {tx.type === 'Sent' ? '-' : '+'}₹{tx.amount.toLocaleString()}
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-50 dark:border-gray-800">
                    <div className="flex gap-2">
                       <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${tx.status === 'Completed' ? 'bg-green-50 text-green-600 dark:bg-brand-primary/10 dark:text-brand-primary' : 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400'}`}>
                         {tx.status}
                       </span>
                       <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
                         Trust: {tx.trustScoreAtTime}%
                       </span>
                    </div>

                    {!reportedTxIds.has(tx.id) && tx.type === 'Sent' ? (
                       <button 
                         onClick={() => handleReportFraud(tx)}
                         className="flex items-center gap-1 text-[10px] font-bold text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 bg-red-50 dark:bg-red-500/10 px-2 py-1 rounded-full border border-red-100 dark:border-red-900/50 transition-colors"
                       >
                         <AlertOctagon size={12} />
                         REPORT
                       </button>
                    ) : reportedTxIds.has(tx.id) ? (
                       <span className="text-[10px] font-bold text-red-600 dark:text-red-400 flex items-center gap-1">
                         <AlertOctagon size={12} /> FRAUD REPORTED
                       </span>
                    ) : null}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </motion.div>
  );
}
