import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Copy, CheckCircle, Loader2 } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { motion } from 'framer-motion';
import { useUserStore } from '../../store/useUserStore';

export default function QrGenerate() {
  const navigate = useNavigate();
  const { theme } = useUserStore();
  const [upiId, setUpiId] = useState('');
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [generated, setGenerated] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const upiUrl = `upi://pay?pa=${upiId || 'user@truesay'}&pn=${encodeURIComponent(name || 'TrueSay User')}${amount ? `&am=${amount}` : ''}&cu=INR`;

  const handleGenerate = () => {
    if (!upiId.trim() || isGenerating) return;
    setIsGenerating(true);
    setTimeout(() => {
      setGenerated(true);
      setIsGenerating(false);
    }, 800);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(upiUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const svg = document.querySelector('#qr-code-svg svg') as SVGSVGElement;
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.onload = () => {
      canvas.width = 512;
      canvas.height = 512;
      ctx?.fillRect(0, 0, 512, 512);
      if (ctx) {
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, 512, 512);
      }
      ctx?.drawImage(img, 0, 0, 512, 512);
      const url = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `truesay-qr-${name || 'payment'}.png`;
      link.href = url;
      link.click();
    };
    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex flex-col bg-gray-50 dark:bg-gray-950 transition-colors duration-300 relative"
    >
      <div className="absolute top-0 left-0 w-full h-40 bg-gradient-to-b from-purple-500/10 dark:from-purple-500/5 to-transparent pointer-events-none" />

      {/* Header */}
      <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md px-4 py-3 pb-4 shadow-sm border-b border-gray-100 dark:border-gray-800 flex items-center gap-4 z-10 transition-colors">
        <button onClick={() => navigate('/')} className={`p-2 -ml-2 rounded-full transition-colors ${theme === 'dark' ? 'hover:bg-gray-800 text-gray-300' : 'hover:bg-gray-100 text-gray-700'}`}>
          <ArrowLeft size={24} />
        </button>
        <h1 className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Generate Payment QR</h1>
      </div>

      <div className="flex-1 p-6 relative z-10">
        {!generated ? (
          <div className="space-y-5">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className={`p-5 rounded-3xl shadow-sm border transition-colors ${theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'}`}
            >
              <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ml-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>UPI ID *</label>
              <input
                type="text"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                className={`w-full px-4 py-3.5 rounded-xl border-2 border-transparent focus:border-purple-500 outline-none transition-all font-medium ${theme === 'dark' ? 'bg-gray-950 text-white placeholder-gray-600' : 'bg-gray-50 text-gray-900 placeholder-gray-400'}`}
                placeholder="e.g. yourname@oksbi"
              />
            </motion.div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className={`p-5 rounded-3xl shadow-sm border transition-colors ${theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'}`}
            >
              <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ml-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Your Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={`w-full px-4 py-3.5 rounded-xl border-2 border-transparent focus:border-purple-500 outline-none transition-all font-medium ${theme === 'dark' ? 'bg-gray-950 text-white placeholder-gray-600' : 'bg-gray-50 text-gray-900 placeholder-gray-400'}`}
                placeholder="Name shown to payer"
              />
            </motion.div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className={`p-5 rounded-3xl shadow-sm border transition-colors ${theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'}`}
            >
              <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ml-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Amount (Optional)</label>
              <div className="relative">
                <span className={`absolute left-4 top-1/2 -translate-y-1/2 text-xl font-light ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>₹</span>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className={`w-full pl-10 pr-4 py-3.5 rounded-xl border-2 border-transparent focus:border-purple-500 outline-none transition-all font-bold text-xl ${theme === 'dark' ? 'bg-gray-950 text-white placeholder-gray-600' : 'bg-gray-50 text-gray-900 placeholder-gray-400'}`}
                  placeholder="0 (any amount)"
                />
              </div>
            </motion.div>

            <motion.button
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleGenerate}
              disabled={!upiId.trim() || isGenerating}
              className={`w-full text-white text-lg font-bold py-4 rounded-2xl shadow-lg transition-all mt-4 flex items-center justify-center gap-2 ${isGenerating ? 'bg-gray-400 cursor-not-allowed shadow-none' : 'bg-purple-500 hover:bg-purple-600 shadow-purple-500/30'}`}
            >
              {isGenerating ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  <span>Generating Secure QR...</span>
                </>
              ) : (
                'Generate QR Code'
              )}
            </motion.button>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center"
          >
            {/* QR Code */}
            <div className={`p-6 rounded-3xl shadow-lg border ${theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'}`}>
              <div id="qr-code-svg" className="bg-white p-4 rounded-2xl">
                <QRCodeSVG
                  value={upiUrl}
                  size={220}
                  level="H"
                  includeMargin={false}
                  fgColor="#111827"
                  bgColor="#ffffff"
                />
              </div>
              <div className="text-center mt-4">
                <h3 className={`font-bold text-lg ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{name || 'TrueSay User'}</h3>
                <p className={`text-xs font-medium mt-1 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>{upiId}</p>
                {amount && (
                  <p className="text-purple-500 font-bold text-xl mt-2">₹{parseFloat(amount).toLocaleString('en-IN')}</p>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 mt-6 w-full max-w-[280px]">
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleCopy}
                className={`flex-1 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-colors ${
                  copied
                    ? 'bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400'
                    : (theme === 'dark' ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200')
                }`}
              >
                {copied ? <CheckCircle size={16} /> : <Copy size={16} />}
                {copied ? 'Copied!' : 'Copy Link'}
              </motion.button>

              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleDownload}
                className={`flex-1 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-colors ${theme === 'dark' ? 'bg-purple-500/20 text-purple-400 hover:bg-purple-500/30' : 'bg-purple-50 text-purple-600 hover:bg-purple-100'}`}
              >
                <Download size={16} />
                Save PNG
              </motion.button>
            </div>

            {/* New QR */}
            <button
              onClick={() => setGenerated(false)}
              className={`mt-4 text-sm font-semibold ${theme === 'dark' ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'} transition-colors`}
            >
              ← Generate another
            </button>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
