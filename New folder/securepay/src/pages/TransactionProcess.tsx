import { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTransactionStore } from '../store/useTransactionStore';
import { useSecurityStore } from '../store/useSecurityStore';
import { useUserStore } from '../store/useUserStore';
import { Loader2, AlertTriangle, CheckCircle, XCircle, Delete, ShieldCheck } from 'lucide-react';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotificationStore } from '../store/useNotificationStore';

const CORRECT_PIN = '123456';

export default function TransactionProcess() {
  const location = useLocation();
  const navigate = useNavigate();
  const { amount, partyName, type } = location.state || {};
  const { theme } = useUserStore();

  const [pin, setPin] = useState('');
  const [pinVerified, setPinVerified] = useState(false);
  const [pinError, setPinError] = useState('');
  const [pinAttempts, setPinAttempts] = useState(0);

  const [status, setStatus] = useState<'pin' | 'processing' | 'success' | 'failed' | 'cancelled'>('pin');
  const [timeLeft, setTimeLeft] = useState(8);
  const [isBigAmount, setIsBigAmount] = useState(false);
  const [showFeeBreakdown, setShowFeeBreakdown] = useState(false);

  // Fee calculation (1.5% + 18% GST on fee)
  const baseFee = amount * 0.015;
  const gst = baseFee * 0.18;
  const totalAmount = amount + baseFee + gst;
  
  const timerRef = useRef<number | null>(null);

  const { addTransaction, transactions } = useTransactionStore();
  const { evaluateFraudRules, addFlag } = useSecurityStore();
  const addToast = useNotificationStore(state => state.addToast);

  // Handle PIN key press
  const handlePinKey = (num: string) => {
    if (pin.length < 6) {
      const newPin = pin + num;
      setPin(newPin);
      setPinError('');
      if (newPin.length === 6) {
        verifyPin(newPin);
      }
    }
  };

  const handlePinBackspace = () => {
    if (pin.length > 0) setPin(pin.slice(0, -1));
  };

  const verifyPin = (currentPin: string) => {
    if (currentPin === CORRECT_PIN) {
      setPinVerified(true);
      setStatus('processing');
    } else {
      const newAttempts = pinAttempts + 1;
      setPinAttempts(newAttempts);
      setPin('');
      if (newAttempts >= 3) {
        setPinError('Too many wrong attempts. Transaction cancelled.');
        setTimeout(() => {
          setStatus('failed');
        }, 1500);
      } else {
        setPinError(`Wrong PIN. ${3 - newAttempts} attempts left.`);
      }
    }
  };

  // Process transaction after PIN verified
  useEffect(() => {
    if (!pinVerified || status !== 'processing') return;
    if (!amount || !partyName) {
      navigate('/');
      return;
    }

    const checkFraudAndProceed = () => {
      const now = new Date();
      const tenMinsAgo = new Date(now.getTime() - 10 * 60000);
      const recentTxCount = transactions.filter(t => new Date(t.date) > tenMinsAgo).length;
      
      const isFraudSuspected = evaluateFraudRules(amount, now, recentTxCount);
      
      if (isFraudSuspected) {
        addFlag(`auto-${Date.now()}`, `Suspicious transaction pattern detected for ₹${amount}`, 'Auto');
        addToast('⚠️ Suspicious activity detected — transaction flagged', 'warning');
      }

      addTransaction({ amount: totalAmount, partyName, type, status: 'Completed' });
      addToast(`₹${totalAmount.toLocaleString('en-IN')} sent to ${partyName} (Incl. fees)`, 'success');
      setStatus('success');
    };

    if (totalAmount >= 10000) {
      setIsBigAmount(true);
      timerRef.current = window.setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            checkFraudAndProceed();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      const timeout = setTimeout(() => {
        checkFraudAndProceed();
      }, 1500);
      return () => clearTimeout(timeout);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [pinVerified, status, amount, totalAmount, partyName, type, navigate, addTransaction, evaluateFraudRules, addFlag, transactions, addToast]);

  const handleCancel = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setStatus('cancelled');
    addTransaction({ amount, partyName, type, status: 'Failed' });
    addToast('Payment cancelled', 'error');
  };

  // ── PIN Entry Screen ──
  if (status === 'pin') {
    return (
      <div className={`flex justify-center min-h-screen ${theme === 'dark' ? 'bg-black' : 'bg-gray-100'}`}>
        <div className={`w-full max-w-md min-h-screen flex flex-col justify-between items-center px-6 py-8 shadow-2xl relative overflow-hidden transition-colors ${theme === 'dark' ? 'bg-gray-900' : 'bg-white'}`}>
          
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[200%] h-64 bg-blue-500/10 dark:bg-blue-500/5 rounded-[100%] blur-[80px] pointer-events-none" />

          {/* Transaction Summary */}
          <div className="w-full text-center mt-8 relative z-10">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center"
            >
              <ShieldCheck size={32} className="text-blue-500" />
            </motion.div>
            <h1 className={`text-xl font-bold mb-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Enter Transaction PIN
            </h1>
            <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              Paying <span className="font-bold text-blue-500">₹{totalAmount?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span> to {partyName}
            </p>

            {/* Fee Breakdown Toggle */}
            <div className="mt-4 px-8">
              <button 
                onClick={() => setShowFeeBreakdown(!showFeeBreakdown)}
                className={`w-full py-2.5 rounded-xl border border-dashed transition-all flex flex-col items-center gap-1 ${theme === 'dark' ? 'border-gray-700 bg-gray-800/30' : 'border-gray-200 bg-gray-50/50'}`}
              >
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gray-500 uppercase">
                  {showFeeBreakdown ? 'Hide Breakdown' : 'Show Charges Breakdown'}
                </div>
                
                <AnimatePresence>
                  {showFeeBreakdown && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="w-full px-4 overflow-hidden"
                    >
                      <div className={`w-full h-px my-2 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`} />
                      <div className="space-y-1.5 w-full pb-2">
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-500">Base Amount</span>
                          <span className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>₹{amount.toLocaleString('en-IN')}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-500">Convenience Fee (1.5%)</span>
                          <span className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>₹{baseFee.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-500">GST on Fee (18%)</span>
                          <span className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>₹{gst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </button>
            </div>

            {/* PIN Dots */}
            <div className="flex justify-center gap-5 mt-10">
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.1 + (i * 0.04) }}
                  className={clsx(
                    "w-4 h-4 rounded-full transition-all duration-300",
                    i < pin.length
                      ? "bg-blue-500 scale-125 shadow-[0_0_12px_rgba(59,130,246,0.5)]"
                      : (theme === 'dark' ? 'bg-gray-600' : 'bg-gray-300')
                  )}
                />
              ))}
            </div>

            {/* Error */}
            <div className="mt-6 h-6">
              <AnimatePresence mode="wait">
                {pinError && (
                  <motion.div
                    key="error"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="text-red-500 font-bold text-sm bg-red-50 dark:bg-red-500/10 py-1.5 px-4 rounded-full inline-block"
                  >
                    {pinError}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* PIN Keypad */}
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="w-full max-w-[280px] grid grid-cols-3 gap-y-5 gap-x-8 mb-8 relative z-10"
          >
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
              <motion.button
                whileTap={{ scale: 0.9, backgroundColor: 'rgba(59, 130, 246, 0.15)' }}
                key={num}
                onClick={() => handlePinKey(num.toString())}
                disabled={pinAttempts >= 3}
                className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl font-medium mx-auto transition-colors disabled:opacity-40 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}
              >
                {num}
              </motion.button>
            ))}
            
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => navigate('/')}
              className="w-14 h-14 rounded-full flex items-center justify-center mx-auto text-red-500 bg-red-50 dark:bg-red-500/10 transition-colors text-xs font-bold uppercase"
            >
              Cancel
            </motion.button>
            
            <motion.button
              whileTap={{ scale: 0.9, backgroundColor: 'rgba(59, 130, 246, 0.15)' }}
              onClick={() => handlePinKey('0')}
              disabled={pinAttempts >= 3}
              className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl font-medium mx-auto transition-colors disabled:opacity-40 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}
            >
              0
            </motion.button>
            
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={handlePinBackspace}
              disabled={pinAttempts >= 3}
              className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto transition-colors disabled:opacity-40 ${theme === 'dark' ? 'text-gray-400 hover:text-gray-200' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <Delete size={24} />
            </motion.button>
          </motion.div>
        </div>
      </div>
    );
  }

  // ── Success Screen ──
  if (status === 'success') {
    return (
      <div className="min-h-screen bg-green-500 flex flex-col items-center justify-center p-6 text-white text-center">
        <CheckCircle size={80} className="mb-6 animate-in zoom-in duration-500" />
        <h1 className="text-3xl font-bold mb-2">Payment Successful</h1>
        <p className="text-green-100 text-xl font-medium mb-12">₹ {totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
        <p className="text-green-50 mb-12">To: {partyName}</p>
        <button onClick={() => navigate('/')} className="w-full max-w-[280px] bg-white text-green-600 font-bold py-4 rounded-2xl shadow-lg hover:bg-green-50">
          Back to Dashboard
        </button>
      </div>
    );
  }

  // ── Failed / Cancelled Screen ──
  if (status === 'cancelled' || status === 'failed') {
    return (
      <div className="min-h-screen bg-red-500 flex flex-col items-center justify-center p-6 text-white text-center">
        <XCircle size={80} className="mb-6 animate-in zoom-in duration-500" />
        <h1 className="text-3xl font-bold mb-2">Payment {status === 'cancelled' ? 'Cancelled' : 'Failed'}</h1>
        <p className="text-red-100 mb-12">{status === 'failed' && pinAttempts >= 3 ? 'Too many wrong PIN attempts.' : 'Transaction was stopped.'}</p>
        <button onClick={() => navigate('/')} className="w-full max-w-[280px] bg-white text-red-600 font-bold py-4 rounded-2xl shadow-lg hover:bg-red-50">
          Back to Dashboard
        </button>
      </div>
    );
  }

  // ── Processing Screen ──
  return (
    <div className={clsx("min-h-screen flex flex-col items-center justify-center p-6 text-center transition-colors duration-1000", isBigAmount ? "bg-amber-500 text-white" : "bg-white text-gray-800")}>
      <Loader2 size={64} className={clsx("animate-spin mb-8", isBigAmount ? "text-white" : "text-green-500")} />
      
      <h1 className="text-2xl font-bold mb-2">Verifying with bank...</h1>
      <p className={clsx("text-lg font-medium mb-12", isBigAmount ? "text-amber-100" : "text-gray-500")}>Processing ₹ {amount?.toLocaleString('en-IN')}</p>

      {isBigAmount && (
        <div className="w-full max-w-md bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/20 animate-in slide-in-from-bottom-8 duration-700">
          <div className="flex items-center justify-center gap-3 text-amber-100 mb-4">
            <AlertTriangle size={24} />
            <span className="font-bold uppercase tracking-wider">Unusually Big Amount</span>
          </div>
          <div className="text-5xl font-black mb-6">{timeLeft}s</div>
          <p className="text-sm font-medium text-amber-50 mb-8 px-4">Take a moment to verify the details. If you suspect fraud, cancel immediately.</p>
          
          <button 
            onClick={handleCancel}
            className="w-full bg-red-600 hover:bg-red-700 active:bg-red-800 text-white text-xl font-bold py-5 rounded-2xl shadow-2xl transition-all uppercase tracking-wider"
          >
            Pause & Cancel
          </button>
        </div>
      )}
    </div>
  );
}
