import { useNavigate } from 'react-router-dom';
import { useUserStore } from '../store/useUserStore';
import { useSecurityStore } from '../store/useSecurityStore';
import { QrCode, Users, Phone, Building2, History as HistoryIcon, ShieldAlert, Sparkles, LogOut, ArrowRight, TrendingUp, Download, Smartphone, Zap, Flame, Droplets } from 'lucide-react';
import { useEffect } from 'react';
import { useTransactionStore } from '../store/useTransactionStore';
import { motion } from 'framer-motion';
import { useNotificationStore } from '../store/useNotificationStore';

export default function Dashboard() {
  const navigate = useNavigate();
  const { balance, logout, theme } = useUserStore();
  const { trustScore, isSuspended } = useSecurityStore();
  const simulateHistory = useTransactionStore(state => state.simulateHistory);

  useEffect(() => {
    simulateHistory();
  }, [simulateHistory]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getTrustColorInfo = (score: number) => {
    if (score >= 80) return { bg: 'bg-green-500', text: 'text-green-500', stroke: '#22c55e', label: 'Excellent' };
    if (score >= 50) return { bg: 'bg-yellow-500', text: 'text-yellow-600', stroke: '#eab308', label: 'Average' };
    return { bg: 'bg-red-500', text: 'text-red-600', stroke: '#ef4444', label: 'Poor' };
  };

  const colorInfo = getTrustColorInfo(trustScore);

  const addToast = useNotificationStore(state => state.addToast);

  useEffect(() => {
    if (isSuspended) {
      addToast('Account suspended due to suspicious activity. Visit Legal & Emergency.', 'error');
      navigate('/emergency');
    }
  }, [isSuspended, navigate, addToast]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="p-6 relative text-gray-900 dark:text-gray-100 min-h-screen pb-24"
    >
      {/* Background ambient light */}
      <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-brand-primary/10 dark:from-brand-primary/5 to-transparent -z-10 pointer-events-none" />

      {/* Header */}
      <div className="flex justify-between items-center mb-10 mt-2 relative z-10">
        <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.1 }}>
          <h1 className={`text-sm font-bold uppercase tracking-wider mb-1 transition-colors ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Total Balance</h1>
          <div className={`text-4xl font-black tracking-tighter transition-colors ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>₹ {Number(balance).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
        </motion.div>
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleLogout} 
          className="p-3 bg-white/70 dark:bg-gray-800/40 backdrop-blur-xl border border-gray-200/50 dark:border-white/10 rounded-[1.2rem] text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-700/60 transition-all shadow-sm"
        >
          <LogOut size={20} strokeWidth={2.5} />
        </motion.button>
      </div>

      {isSuspended && (
        <div className="bg-red-50 p-4 rounded-xl border border-red-200 mb-6 flex flex-col items-center">
           <ShieldAlert className="text-red-500 mb-2" size={32} />
           <h2 className="text-red-700 font-bold text-lg">Account Suspended</h2>
           <p className="text-red-600 text-sm text-center mt-1">Due to suspicious activity, your account is temporarily suspended. Contact Legal.</p>
           <button onClick={() => navigate('/emergency')} className="mt-4 bg-red-600 text-white px-6 py-2 rounded-full font-medium text-sm">
             Go to Legal Section
           </button>
        </div>
      )}

      {/* Trust Score Card */}
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, type: 'spring', stiffness: 300, damping: 20 }}
        className="bg-white/80 dark:bg-[#1A1C23]/80 backdrop-blur-2xl rounded-[2.5rem] p-6 shadow-xl shadow-gray-200/50 dark:shadow-black/40 border border-white dark:border-white/5 mb-8 w-full relative overflow-hidden flex items-center justify-between group"
      >
        <div className="z-10 bg-white/60 dark:bg-black/20 p-4 rounded-2xl backdrop-blur-md border border-white/50 dark:border-white/5 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Trust Score</h2>
            <TrendingUp size={16} className={`${colorInfo.text}`} />
          </div>
          <p className={`text-sm tracking-wide font-bold uppercase ${colorInfo.text}`}>{colorInfo.label}</p>
          <div className="mt-3 text-xs text-gray-600 dark:text-gray-400 max-w-[130px] font-medium leading-relaxed">
            Higher score unlocks faster transfers.
          </div>
        </div>

        {/* Circular Progress */}
        <div className="relative w-32 h-32 z-10 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90 drop-shadow-lg" viewBox="0 0 100 100">
            <circle
              className="text-gray-200 dark:text-gray-700"
              strokeWidth="10"
              stroke="currentColor"
              fill="transparent"
              r="40"
              cx="50"
              cy="50"
            />
            <motion.circle
              initial={{ strokeDashoffset: 251 }}
              animate={{ strokeDashoffset: 251 - (251 * trustScore) / 100 }}
              transition={{ duration: 1.5, ease: "easeOut", delay: 0.5 }}
              strokeWidth="10"
              strokeDasharray="251"
              strokeLinecap="round"
              stroke={colorInfo.stroke}
              fill="transparent"
              r="40"
              cx="50"
              cy="50"
              className="drop-shadow-md"
            />
          </svg>
          <div className="absolute flex flex-col items-center justify-center">
            <span className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter">{trustScore}<span className="text-lg text-gray-500 dark:text-gray-400 font-bold ml-0.5">%</span></span>
          </div>
        </div>

        {/* decorative background blobs */}
        <div className={`absolute -right-10 -top-10 w-32 h-32 rounded-full opacity-10 blur-2xl ${colorInfo.bg}`} />
        <div className={`absolute -left-10 -bottom-10 w-32 h-32 rounded-full opacity-10 blur-2xl ${colorInfo.bg}`} />
      </motion.div>

      {/* Quick Actions Grid */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <h3 className="text-base font-bold text-gray-900 dark:text-gray-100 mb-5 px-2 tracking-wide">Transfer Money</h3>
        <div className="grid grid-cols-4 gap-4 mb-8">
          {[
            { icon: QrCode, label: 'Scan QR', path: '/pay/qr', color: 'bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400 ring-blue-500/30' },
            { icon: Download, label: 'Receive', path: '/pay/qr-generate', color: 'bg-teal-100 text-teal-600 dark:bg-teal-500/20 dark:text-teal-400 ring-teal-500/30' },
            { icon: Users, label: 'To Contact', path: '/pay/contact', color: 'bg-purple-100 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400 ring-purple-500/30' },
            { icon: Phone, label: 'To Number', path: '/pay/number', color: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400 ring-emerald-500/30' },
            { icon: Building2, label: 'Bank', path: '/pay/bank', color: 'bg-orange-100 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400 ring-orange-500/30' },
          ].map((action, i) => (
            <motion.button 
              whileHover={{ y: -5, scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              key={i} 
              onClick={() => navigate(action.path)}
              disabled={isSuspended}
              className={`flex flex-col items-center gap-3 group ${isSuspended ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <div className={`w-16 h-16 rounded-[1.2rem] flex items-center justify-center shadow-sm border border-black/5 dark:border-white/10 ${action.color} transition-all duration-300 group-hover:shadow-lg`}>
                <action.icon size={28} strokeWidth={2} />
              </div>
              <span className="text-[11px] font-bold text-gray-700 dark:text-gray-300 text-center leading-tight tracking-wide">{action.label}</span>
            </motion.button>
          ))}
        </div>

        {/* Bills & Recharges */}
        <div className="mt-8">
          <h3 className="text-base font-bold text-gray-900 dark:text-gray-100 mb-5 px-2 tracking-wide">Bills & Recharges</h3>
          <div className="grid grid-cols-4 gap-4 mb-8">
            {[
              { icon: Smartphone, label: 'Mobile', color: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400 ring-indigo-500/30' },
              { icon: Zap, label: 'Electricity', color: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-500/20 dark:text-yellow-400 ring-yellow-500/30' },
              { icon: Flame, label: 'Gas', color: 'bg-orange-100 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400 ring-orange-500/30' },
              { icon: Droplets, label: 'Water', color: 'bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400 ring-blue-500/30' },
            ].map((bill, i) => (
              <motion.button 
                whileHover={{ y: -5, scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                key={i} 
                onClick={() => addToast(`${bill.label} service coming soon!`, 'info')}
                className="flex flex-col items-center gap-3 group"
              >
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm border border-black/5 dark:border-white/10 ${bill.color} transition-all duration-300 group-hover:shadow-lg`}>
                  <bill.icon size={24} strokeWidth={2} />
                </div>
                <span className="text-[10px] font-bold text-gray-700 dark:text-gray-300 text-center leading-tight tracking-wide">{bill.label}</span>
              </motion.button>
            ))}
          </div>
        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ delay: 0.4 }}
        className="grid grid-cols-2 gap-4"
      >
         <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/ai-advisor')}
            className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-[2rem] p-6 flex flex-col items-start shadow-xl shadow-blue-500/20 text-white relative overflow-hidden group border border-white/10"
         >
            <div className="bg-white/20 p-2.5 rounded-xl backdrop-blur-sm mb-4">
              <Sparkles size={24} className="text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight">AI Advisor</span>
            <span className="text-xs text-blue-100 mt-1 font-medium opcaity-90">Maximize your savings</span>
            
            <div className="absolute right-3 bottom-3 opacity-20 transform translate-x-4 translate-y-4 group-hover:translate-x-0 group-hover:translate-y-0 transition-transform duration-500">
              <Sparkles size={64} />
            </div>
         </motion.button>
         
         <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/history')}
            className="bg-white/80 dark:bg-[#1A1C23]/80 backdrop-blur-2xl border border-white dark:border-white/5 rounded-[2rem] p-6 flex flex-col items-start shadow-lg shadow-gray-200/50 dark:shadow-black/20 hover:shadow-xl transition-all group relative overflow-hidden"
         >
            <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-white/5 flex items-center justify-center text-gray-700 dark:text-gray-300 mb-4 group-hover:bg-brand-primary/10 group-hover:text-brand-primary transition-colors border border-gray-200/50 dark:border-white/5">
              <HistoryIcon size={24} strokeWidth={2} />
            </div>
            <span className="font-bold text-lg text-gray-900 dark:text-white tracking-tight">History</span>
            <span className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-medium flex items-center gap-1 group-hover:text-brand-primary transition-colors">
              View all <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
            </span>
         </motion.button>
      </motion.div>

      {/* Recent Transactions List */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="mt-8 mb-4">
        <div className="flex justify-between items-center px-2 mb-4">
          <h3 className={`text-base font-bold tracking-wide transition-colors ${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'}`}>Recent Transactions</h3>
          <button onClick={() => navigate('/history')} className={`text-xs font-bold transition-colors ${theme === 'dark' ? 'text-brand-primary' : 'text-blue-600'}`}>See All</button>
        </div>
        
        <div className="space-y-3">
          {useTransactionStore(state => state.transactions).slice(0, 3).map((tx, index) => (
            <motion.div 
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.6 + (index * 0.1) }}
               key={tx.id} 
               onClick={() => navigate('/history')}
               className="bg-white/80 dark:bg-[#1A1C23]/80 backdrop-blur-md p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 transition-colors cursor-pointer hover:shadow-md flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${tx.type === 'Received' ? 'bg-green-100 text-green-600 dark:bg-green-500/20 dark:text-green-400' : 'bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400'}`}>
                  {tx.partyName.substring(0, 1)}
                </div>
                <div>
                  <h4 className={`font-bold text-sm leading-none mb-1 transition-colors ${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'}`}>{tx.partyName}</h4>
                  <p className={`text-[10px] uppercase tracking-wider font-bold transition-colors ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                    {new Date(tx.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                  </p>
                </div>
              </div>
              <div className={`text-base font-black tracking-tighter transition-colors ${tx.type === 'Received' ? 'text-brand-primary' : (theme === 'dark' ? 'text-white' : 'text-gray-900')}`}>
                {tx.type === 'Sent' ? '-' : '+'}₹{tx.amount.toLocaleString()}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

    </motion.div>
  );
}
