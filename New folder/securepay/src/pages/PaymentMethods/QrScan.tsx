import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { useNavigate } from 'react-router-dom';
import { useSecurityStore } from '../../store/useSecurityStore';
import { useUserStore } from '../../store/useUserStore';
import { ArrowLeft, CheckCircle2, CameraOff } from 'lucide-react';
import { motion } from 'framer-motion';

export default function QrScan() {
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [amount, setAmount] = useState('');
  const [partyName, setPartyName] = useState('Merchant Store');
  const [error, setError] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const navigate = useNavigate();
  const trustScore = useSecurityStore(state => state.trustScore);
  const { theme } = useUserStore();

  const startScanner = async () => {
    setError(null);
    try {
      const devices = await Html5Qrcode.getCameras();
      if (!devices || devices.length === 0) {
        setError('No camera found on this device.');
        return;
      }

      const scanner = new Html5Qrcode('qr-reader');
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 220, height: 220 },
          aspectRatio: 1,
        },
        (decodedText) => {
          // QR decoded successfully
          scanner.stop().then(() => {
            scannerRef.current = null;
            setScanning(false);
            setScanResult(decodedText);

            // Extract UPI data: upi://pay?pa=merchant@upi&pn=Merchant Store&am=500
            if (decodedText.includes('am=')) {
              const match = decodedText.match(/am=([0-9.]+)/);
              if (match) setAmount(match[1]);
            }
            if (decodedText.includes('pn=')) {
              const match = decodedText.match(/pn=([^&]+)/);
              if (match) setPartyName(decodeURIComponent(match[1]));
            }
          }).catch(console.error);
        },
        () => {
          // QR scan error (frame without QR) — ignore
        }
      );

      setScanning(true);
    } catch (err: any) {
      console.error('Camera error:', err);
      if (err?.toString?.().includes('NotAllowedError')) {
        setError('Camera access denied. Please allow camera permission in your browser settings and reload the page.');
      } else {
        setError(err?.message || 'Could not start camera. Make sure you have a camera available.');
      }
    }
  };

  useEffect(() => {
    if (!scanResult) {
      startScanner();
    }

    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {});
        scannerRef.current = null;
      }
    };
  }, []);

  const handlePay = () => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) return;
    
    navigate('/pay/processing', { 
      state: { 
        amount: numAmount, 
        partyName, 
        type: 'Sent' 
      } 
    });
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex flex-col bg-gray-50 dark:bg-gray-950 transition-colors duration-300 relative"
    >
      <div className="absolute top-0 left-0 w-full h-40 bg-gradient-to-b from-green-500/10 dark:from-green-500/5 to-transparent pointer-events-none" />

      {/* Header */}
      <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md px-4 py-3 pb-4 shadow-sm border-b border-gray-100 dark:border-gray-800 flex items-center gap-4 z-10 transition-colors">
        <button onClick={() => navigate(-1)} className={`p-2 -ml-2 rounded-full transition-colors ${theme === 'dark' ? 'hover:bg-gray-800 text-gray-300' : 'hover:bg-gray-100 text-gray-700'}`}>
          <ArrowLeft size={24} />
        </button>
        <h1 className={`text-lg font-bold transition-colors ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Scan QR Code</h1>
      </div>

      {!scanResult ? (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex-1 flex flex-col items-center pt-6 relative z-10 px-6"
        >
          <div className="text-center mb-6">
            <h2 className={`font-bold text-xl tracking-tight transition-colors ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Point Camera at QR
            </h2>
            <p className={`text-sm mt-1.5 font-medium transition-colors ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              Scan any UPI QR code to pay instantly
            </p>
          </div>
          
          {/* Camera Viewfinder */}
          <div className="relative w-full max-w-[320px] aspect-square mx-auto">
            {/* Corner decorations */}
            <div className="absolute top-0 left-0 w-10 h-10 border-l-4 border-t-4 border-brand-primary dark:border-green-400 rounded-tl-2xl z-20" />
            <div className="absolute top-0 right-0 w-10 h-10 border-r-4 border-t-4 border-brand-primary dark:border-green-400 rounded-tr-2xl z-20" />
            <div className="absolute bottom-0 left-0 w-10 h-10 border-l-4 border-b-4 border-brand-primary dark:border-green-400 rounded-bl-2xl z-20" />
            <div className="absolute bottom-0 right-0 w-10 h-10 border-r-4 border-b-4 border-brand-primary dark:border-green-400 rounded-br-2xl z-20" />
            
            {/* Scanning line animation */}
            {scanning && (
              <motion.div 
                className="absolute left-4 right-4 h-0.5 bg-gradient-to-r from-transparent via-brand-primary to-transparent z-20 opacity-80"
                animate={{ top: ['10%', '90%', '10%'] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
              />
            )}

            {/* Camera feed container */}
            <div 
              id="qr-reader" 
              className="w-full h-full rounded-2xl overflow-hidden bg-black shadow-2xl shadow-brand-primary/20"
              style={{ position: 'relative' }}
            />
          </div>

          {/* Error message */}
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-800 rounded-2xl p-4 text-center max-w-[320px]"
            >
              <CameraOff size={24} className="mx-auto text-red-500 mb-2" />
              <p className="text-sm text-red-600 dark:text-red-400 font-medium">{error}</p>
              <button 
                onClick={() => { setError(null); startScanner(); }}
                className="mt-3 px-4 py-2 bg-red-500 text-white rounded-full text-xs font-bold"
              >
                Try Again
              </button>
            </motion.div>
          )}

          {/* Status indicator */}
          {scanning && !error && (
            <div className="mt-6 flex items-center gap-2">
              <span className="w-2 h-2 bg-brand-primary rounded-full animate-pulse shadow-[0_0_6px_rgba(34,197,94,0.5)]" />
              <span className={`text-xs font-bold uppercase tracking-wider transition-colors ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                Scanning...
              </span>
            </div>
          )}

          {/* Manual UPI Entry */}
          <div className="w-full max-w-[320px] mt-6">
            <div className="flex items-center gap-3 mb-3">
              <div className={`flex-1 h-px transition-colors ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-200'}`} />
              <span className={`text-[10px] font-bold uppercase tracking-widest transition-colors ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>or enter manually</span>
              <div className={`flex-1 h-px transition-colors ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-200'}`} />
            </div>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="UPI ID (e.g. user@oksbi)"
                value={partyName === 'Merchant Store' ? '' : partyName}
                onChange={(e) => setPartyName(e.target.value || 'Merchant Store')}
                className={`w-full px-4 py-3 rounded-xl border-2 border-transparent focus:border-brand-primary outline-none transition-all font-medium text-sm placeholder-gray-400 dark:placeholder-gray-600 ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}
              />
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-light text-gray-400 dark:text-gray-500">₹</span>
                <input
                  type="number"
                  placeholder="Amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 rounded-xl border-2 border-transparent focus:border-brand-primary outline-none transition-all font-bold text-lg placeholder-gray-400 dark:placeholder-gray-600 ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}
                />
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  if (!amount || parseFloat(amount) <= 0) return;
                  if (partyName === 'Merchant Store' || !partyName) return;
                  navigate('/pay/processing', {
                    state: { amount: parseFloat(amount), partyName, type: 'Sent' }
                  });
                }}
                disabled={!amount || parseFloat(amount) <= 0 || partyName === 'Merchant Store' || !partyName}
                className="w-full bg-brand-primary hover:bg-green-600 disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl shadow-lg shadow-brand-primary/30 transition-all text-sm"
              >
                Pay via UPI
              </motion.button>
            </div>
          </div>
        </motion.div>
      ) : (
        /* Scan Result & Payment */
        <motion.div 
           initial={{ opacity: 0, scale: 0.95 }}
           animate={{ opacity: 1, scale: 1 }}
           className="flex-1 flex flex-col p-6 relative z-10"
        >
           <div className="bg-white dark:bg-gray-900 rounded-[1.5rem] p-6 shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col items-center transition-colors">
             <motion.div 
               initial={{ scale: 0 }}
               animate={{ scale: 1 }}
               transition={{ type: 'spring', bounce: 0.5 }}
               className="w-16 h-16 bg-green-100 dark:bg-green-500/20 text-brand-primary dark:text-green-400 rounded-2xl flex items-center justify-center mb-4 border border-green-200 dark:border-green-800"
             >
               <CheckCircle2 size={32} />
             </motion.div>
             <p className={`text-sm font-bold uppercase tracking-wider transition-colors ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Paying to</p>
             <h2 className={`text-2xl font-black mt-1 tracking-tight text-center transition-colors ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{partyName}</h2>
             <p className="text-[10px] text-gray-400 dark:text-gray-600 mt-2 bg-gray-50 dark:bg-gray-950 px-3 py-1 rounded-full border border-gray-100 dark:border-gray-800 break-all text-center">
               {scanResult}
             </p>
             
             {trustScore < 100 && (
               <div className="mt-5 px-4 py-2 bg-yellow-50 dark:bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 text-xs rounded-full font-bold border border-yellow-200 dark:border-yellow-900/50">
                 Caution: Your Trust Score is {trustScore}%
               </div>
             )}

             <div className="w-full mt-8 relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-3xl font-light text-gray-400 dark:text-gray-500">₹</span>
                <input 
                  type="number"
                  value={amount || ''}
                  onChange={(e) => setAmount(e.target.value)}
                  className={`w-full text-5xl font-bold bg-gray-50 dark:bg-gray-950 rounded-2xl py-6 pl-12 pr-4 outline-none border-2 border-transparent focus:border-brand-primary dark:focus:border-green-500 transition-colors placeholder-gray-300 dark:placeholder-gray-700 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}
                  placeholder="0"
                  autoFocus
                />
             </div>
           </div>

           <div className="mt-auto pt-6">
             <motion.button
               whileHover={{ scale: 1.02 }}
               whileTap={{ scale: 0.98 }}
               onClick={handlePay}
               disabled={!amount || parseFloat(amount) <= 0}
               className="w-full bg-brand-primary hover:bg-green-600 active:bg-green-700 disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:cursor-not-allowed text-white text-lg font-bold py-4 rounded-2xl shadow-lg shadow-brand-primary/30 transition-all flex justify-center items-center"
             >
               Proceed to Pay
             </motion.button>
           </div>
        </motion.div>
      )}
    </motion.div>
  );
}
