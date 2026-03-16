import { PhoneCall, ShieldAlert, Building2, ExternalLink } from 'lucide-react';
import { useSecurityStore } from '../store/useSecurityStore';
import { useUserStore } from '../store/useUserStore';
import { motion } from 'framer-motion';

export default function Emergency() {
  const { isSuspended, flags } = useSecurityStore();
  const { theme } = useUserStore();

  const handleCall = (number: string) => {
    window.location.href = `tel:${number}`;
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex flex-col bg-gray-50 dark:bg-gray-950 transition-colors duration-300 relative"
    >
      <div className="absolute top-0 left-0 w-full h-40 bg-gradient-to-b from-gray-200/20 dark:from-gray-800/20 to-transparent pointer-events-none" />

      <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md px-4 py-3 pb-4 shadow-sm border-b border-gray-100 dark:border-gray-800 flex items-center z-10 transition-colors">
          <h1 className={`text-lg font-bold transition-colors ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Legal & Emergency</h1>
      </div>

      <div className="flex-1 p-6 relative z-10">
        
        {isSuspended && (
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-900/50 rounded-[1.5rem] p-6 mb-8 text-center"
          >
            <ShieldAlert size={48} className="mx-auto text-red-600 dark:text-red-500 mb-4" />
            <h2 className="text-xl font-black text-red-800 dark:text-red-400 uppercase tracking-wide">Account Suspended</h2>
            <p className="text-red-600 dark:text-red-300 mt-2 text-sm font-medium">Your account was suspended due to {flags.length} severe fraud flags.</p>
            
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => alert('Appeal sent to bank. A reference number has been mailed to you.')}
              className="mt-6 w-full py-4 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-bold shadow-lg shadow-red-500/30 transition-all font-medium"
            >
               File Appeal to Bank
            </motion.button>
          </motion.div>
        )}

        <motion.h2 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`text-lg font-black mb-6 flex items-center gap-2 uppercase tracking-wide transition-colors ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}
        >
          <PhoneCall size={20} className={theme === 'dark' ? 'text-green-400' : 'text-brand-primary'} /> Helpline Numbers
        </motion.h2>

        <div className="grid grid-cols-1 gap-4 mb-8">
          {[
            { name: 'National Cyber Crime', number: '1930', icon: ShieldAlert, color: 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400', ring: 'focus:ring-red-200' },
            { name: 'Police Control Room', number: '100', icon: PhoneCall, color: 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400', ring: 'focus:ring-blue-200' },
            { name: 'RBI Ombudsman', number: '155260', icon: Building2, color: 'bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400', ring: 'focus:ring-orange-200' },
          ].map((contact, i) => (
            <motion.button
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              key={contact.number}
              onClick={() => handleCall(contact.number)}
              className="w-full bg-white dark:bg-gray-900 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 flex items-center justify-between group hover:shadow-md transition-all"
            >
               <div className="flex items-center gap-4">
                 <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${contact.color}`}>
                   <contact.icon size={26} />
                 </div>
                 <div className="text-left">
                   <h3 className={`font-bold leading-tight mb-0.5 transition-colors ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{contact.name}</h3>
                   <p className={`text-[11px] font-bold uppercase tracking-widest mt-1 transition-colors ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Dial {contact.number}</p>
                 </div>
               </div>
               <div className="bg-gray-50 dark:bg-gray-800 text-gray-400 dark:text-gray-500 p-3 rounded-xl group-hover:bg-brand-primary/10 group-hover:text-brand-primary transition-colors border border-gray-100 dark:border-gray-700">
                 <PhoneCall size={20} />
               </div>
            </motion.button>
          ))}
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gray-100/50 dark:bg-gray-900/50 p-6 rounded-[1.5rem] border border-gray-200 dark:border-gray-800"
        >
          <h2 className={`text-sm font-bold mb-4 uppercase tracking-wider transition-colors ${theme === 'dark' ? 'text-gray-300' : 'text-gray-800'}`}>Fraud Resolution Protocol</h2>
          <ol className={`list-decimal list-outside ml-4 space-y-3 text-sm font-medium leading-relaxed transition-colors ${theme === 'dark' ? 'text-gray-400' : 'text-gray-700'}`}>
            <li>Call 1930 immediately to freeze the fraudulent transaction.</li>
            <li>Do NOT delete any SMS or transaction proofs.</li>
            <li>Take screenshots of the disputed transaction in History.</li>
            <li>File an official complaint on the portal below.</li>
          </ol>
          <motion.a
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            href="https://cybercrime.gov.in/"
            target="_blank"
            rel="noreferrer"
            className="mt-8 w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl shadow-lg shadow-blue-500/20 transition-all font-medium"
          >
            cybercrime.gov.in <ExternalLink size={18} />
          </motion.a>
        </motion.div>
      </div>
    </motion.div>
  );
}
