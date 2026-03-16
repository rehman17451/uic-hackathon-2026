import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '../store/useUserStore';
import { Fingerprint, Delete, Settings } from 'lucide-react';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';

const CORRECT_PIN = '123456';

export default function PinLogin() {
  const [pin, setPin] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [lockTimeRemaining, setLockTimeRemaining] = useState<number>(0);
  const [isVerifying, setIsVerifying] = useState(false);
  
  const navigate = useNavigate();
  const { login, pinLockoutUntil, recordWrongAttempt } = useUserStore();

  useEffect(() => {
    let interval: number;
    if (pinLockoutUntil) {
      interval = window.setInterval(() => {
        const remaining = pinLockoutUntil - Date.now();
        if (remaining <= 0) {
          useUserStore.getState().resetAttempts();
          setLockTimeRemaining(0);
        } else {
          setLockTimeRemaining(Math.ceil(remaining / 1000));
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [pinLockoutUntil]);

  const handleKeyPress = (num: string) => {
    if (lockTimeRemaining > 0 || isVerifying) return;
    if (pin.length < 6) {
      const newPin = pin + num;
      setPin(newPin);
      setErrorMsg('');
      if (newPin.length === 6) {
        verifyPin(newPin);
      }
    }
  };

  const handleBackspace = () => {
    if (pin.length > 0 && !isVerifying) setPin(pin.slice(0, -1));
  };

  const verifyPin = (currentPin: string) => {
    if (currentPin === CORRECT_PIN) {
      setIsVerifying(true);
      setTimeout(() => {
        login();
        navigate('/', { replace: true });
      }, 1200);
    } else {
      recordWrongAttempt();
      setPin('');
      const newAttempts = useUserStore.getState().wrongAttempts;
      if (newAttempts >= 3) {
         setErrorMsg('Too many failed attempts. Locked.');
      } else {
         setErrorMsg(`Wrong PIN. ${3 - newAttempts} attempts left.`);
      }
    }
  };

  return (
    <div className="flex justify-center bg-gray-900 min-h-screen">
      <div className="w-full max-w-md bg-white dark:bg-gray-900 min-h-screen flex flex-col justify-between items-center px-6 py-12 shadow-2xl relative overflow-hidden transition-colors duration-300">
        
        {/* Decorative background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[200%] h-96 bg-brand-primary/10 dark:bg-brand-primary/5 rounded-[100%] blur-[80px] pointer-events-none" />

        {/* Settings button */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          onClick={() => navigate('/admin')}
          className="absolute top-5 right-5 p-2.5 rounded-full bg-black/5 dark:bg-white/10 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-all z-20"
        >
          <Settings size={20} />
        </motion.button>

        <div className="w-full text-center mt-12 relative z-10">
          <motion.h1 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight"
          >
            Enter TrueSay PIN
          </motion.h1>
          <motion.p 
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-gray-500 dark:text-gray-400 text-sm mt-2 font-medium"
          >
            Default PIN is 123456
          </motion.p>
          
          <div className="flex justify-center gap-5 mt-14 min-h-[40px]">
            <AnimatePresence mode="wait">
              {isVerifying ? (
                <motion.div
                  key="verifying"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center gap-4 w-full max-w-[200px]"
                >
                  <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden relative">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: '100%' }}
                      transition={{ duration: 1, ease: "easeInOut" }}
                      className="h-full bg-brand-primary shadow-[0_0_15px_rgba(34,197,94,0.6)]"
                    />
                  </div>
                  <motion.span 
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1, repeat: Infinity }}
                    className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-primary"
                  >
                    Charging Energy
                  </motion.span>
                </motion.div>
              ) : (
                <div className="flex justify-center gap-5">
                  {[...Array(6)].map((_, i) => (
                    <motion.div 
                      key={i} 
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.2 + (i * 0.05) }}
                      className={clsx(
                        "w-4 h-4 rounded-full transition-all duration-300",
                        i < pin.length ? "bg-gray-900 dark:bg-white scale-125 shadow-[0_0_12px_rgba(0,0,0,0.3)] dark:shadow-[0_0_12px_rgba(255,255,255,0.5)]" : "bg-gray-300 dark:bg-gray-500"
                      )} 
                    />
                  ))}
                </div>
              )}
            </AnimatePresence>
          </div>

          <div className="mt-10 h-6">
            <AnimatePresence mode="wait">
              {errorMsg && !isVerifying && (
                <motion.div 
                  key="error"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="text-red-500 font-bold text-sm bg-red-50 dark:bg-red-500/10 py-1.5 px-4 rounded-full inline-block"
                >
                  {lockTimeRemaining > 0 
                    ? `Account locked. Try again in ${Math.floor(lockTimeRemaining / 60)}:${(lockTimeRemaining % 60).toString().padStart(2, '0')}`
                    : errorMsg}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <motion.div 
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="w-full max-w-[280px] grid grid-cols-3 gap-y-6 gap-x-8 mb-12 relative z-10"
        >
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <motion.button
              whileTap={{ scale: 0.9, backgroundColor: 'rgba(156, 163, 175, 0.2)' }}
              key={num}
              onClick={() => handleKeyPress(num.toString())}
              disabled={lockTimeRemaining > 0}
              className="w-16 h-16 rounded-full flex items-center justify-center text-3xl font-normal text-gray-800 dark:text-white mx-auto transition-colors disabled:opacity-50"
            >
              {num}
            </motion.button>
          ))}
          
          <motion.button 
            whileTap={{ scale: 0.9 }}
            disabled={lockTimeRemaining > 0}
            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto text-brand-primary dark:text-green-400 bg-brand-primary/5 dark:bg-green-400/10 transition-colors disabled:opacity-50"
          >
            <Fingerprint size={32} strokeWidth={1.5} />
          </motion.button>
          
          <motion.button
            whileTap={{ scale: 0.9, backgroundColor: 'rgba(156, 163, 175, 0.2)' }}
            onClick={() => handleKeyPress('0')}
            disabled={lockTimeRemaining > 0}
            className="w-16 h-16 rounded-full flex items-center justify-center text-3xl font-normal text-gray-800 dark:text-white mx-auto transition-colors disabled:opacity-50"
          >
            0
          </motion.button>
          
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={handleBackspace}
            disabled={lockTimeRemaining > 0}
            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors disabled:opacity-50"
          >
            <Delete size={28} strokeWidth={1.5} />
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
}
