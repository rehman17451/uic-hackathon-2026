import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, User, ShieldAlert, CheckCircle2, Loader2 } from 'lucide-react';
import { useSecurityStore } from '../../store/useSecurityStore';
import { motion, AnimatePresence } from 'framer-motion';

const MOCK_CONTACTS = [
  { id: '1', name: 'Rahul Sharma', phone: '+91 9876543210', trust: 87 },
  { id: '2', name: 'Priya Patel', phone: '+91 8765432109', trust: 100 },
  { id: '3', name: 'Amit Kumar', phone: '+91 7654321098', trust: 40 },
  { id: '4', name: 'Sneha Gupta', phone: '+91 6543210987', trust: 100 },
  { id: '5', name: 'Vikram Singh', phone: '+91 5432109876', trust: 95 },
];

export default function PayContact() {
  const [search, setSearch] = useState('');
  const [selectedContact, setSelectedContact] = useState<typeof MOCK_CONTACTS[0] | null>(null);
  const [amount, setAmount] = useState('');
  const [isProceeding, setIsProceeding] = useState(false);
  const navigate = useNavigate();
  const myTrustScore = useSecurityStore(state => state.trustScore);

  const filteredContacts = MOCK_CONTACTS.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.phone.includes(search)
  );

  const handlePay = () => {
    if (!selectedContact || !amount || isProceeding) return;
    setIsProceeding(true);
    setTimeout(() => {
      navigate('/pay/processing', {
        state: {
          amount: parseFloat(amount),
          partyName: selectedContact.name,
          type: 'Sent'
        }
      });
    }, 1000);
  };

  if (selectedContact) {
    return (
      <motion.div 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        className="flex flex-col bg-gray-50 dark:bg-gray-950 transition-colors duration-300 relative"
      >
        <div className="absolute top-0 left-0 w-full h-40 bg-gradient-to-b from-purple-500/10 dark:from-purple-500/5 to-transparent pointer-events-none" />

        <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md px-4 py-3 pb-4 shadow-sm border-b border-gray-100 dark:border-gray-800 flex items-center gap-4 z-10 sticky top-0 transition-colors">
          <button onClick={() => setSelectedContact(null)} className="p-2 -ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition-colors">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-lg font-bold text-gray-900 dark:text-white">Pay Contact</h1>
        </div>
        
        <div className="flex-1 flex flex-col p-6 relative z-10">
           <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="bg-white dark:bg-gray-900 rounded-[1.5rem] p-6 shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col items-center transition-colors"
           >
             <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-2xl flex items-center justify-center mb-4 border border-purple-200 dark:border-purple-800/50">
               <User size={32} />
             </div>
             <p className="text-sm text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider">Paying to</p>
             <h2 className="text-2xl font-black text-gray-900 dark:text-white mt-1 tracking-tight">{selectedContact.name}</h2>
             <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-medium">{selectedContact.phone}</p>
             
             {/* Dynamic Trust Score Banner - CRITICAL SECURITY FEATURE */}
             <div className={`mt-4 px-4 py-2 text-xs rounded-full font-bold border flex items-center gap-2 ${
                selectedContact.trust < 50 ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-900/50' : 
                selectedContact.trust < 90 ? 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-500/10 dark:text-yellow-400 dark:border-yellow-900/50' :
                'bg-green-50 text-green-700 border-green-200 dark:bg-green-500/10 dark:text-green-400 dark:border-green-900/50'
             }`}>
               {selectedContact.trust < 50 ? <ShieldAlert size={14} /> : <CheckCircle2 size={14} />}
               Receiver Trust Score: {selectedContact.trust}%
               {selectedContact.trust < 50 && ' - High Fraud Risk!'}
             </div>

             <div className="w-full mt-8 relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-3xl font-light text-gray-400 dark:text-gray-500">₹</span>
                <input 
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full text-5xl font-bold text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-950 rounded-2xl py-6 pl-12 pr-4 outline-none border-2 border-transparent focus:border-purple-500 transition-colors placeholder-gray-300 dark:placeholder-gray-700"
                  placeholder="0"
                  autoFocus
                />
             </div>
           </motion.div>

           {myTrustScore < 100 && (
              <p className="text-center mt-6 text-sm text-gray-500 dark:text-gray-400 font-medium">Your Trust Score: {myTrustScore}%</p>
           )}

           <div className="mt-auto pt-6">
             <motion.button
               whileHover={{ scale: 1.02 }}
               whileTap={{ scale: 0.98 }}
               onClick={handlePay}
               disabled={!amount || parseFloat(amount) <= 0 || isProceeding}
               className={`w-full text-white text-lg font-bold py-4 rounded-2xl shadow-lg transition-all flex justify-center items-center gap-2 ${isProceeding ? 'bg-gray-400 cursor-not-allowed shadow-none' : 'bg-purple-600 hover:bg-purple-700 shadow-purple-500/30'}`}
             >
               {isProceeding ? (
                 <>
                   <Loader2 size={20} className="animate-spin" />
                   <span>Preparing Secure Payment...</span>
                 </>
               ) : (
                 selectedContact.trust < 50 ? 'Pay Anyway (Risky)' : 'Proceed to Pay'
               )}
             </motion.button>
           </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex flex-col bg-gray-50 dark:bg-gray-950 transition-colors duration-300 relative"
    >
      <div className="absolute top-0 left-0 w-full h-40 bg-gradient-to-b from-purple-500/10 dark:from-purple-500/5 to-transparent pointer-events-none" />

      <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md px-4 py-3 pb-4 shadow-sm border-b border-gray-100 dark:border-gray-800 flex items-center gap-4 z-10 sticky top-0 transition-colors">
        <button onClick={() => navigate('/')} className="p-2 -ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition-colors"><ArrowLeft size={24} /></button>
        <h1 className="text-lg font-bold text-gray-900 dark:text-white">Select Contact</h1>
      </div>

      <div className="p-6 relative z-10">
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" size={20} />
          <input 
            type="text"
            placeholder="Search by name or number"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 focus:border-purple-500 focus:ring-2 focus:ring-purple-200/50 dark:focus:ring-purple-500/20 text-gray-900 dark:text-white outline-none transition-all shadow-sm placeholder-gray-400 dark:placeholder-gray-600 font-medium"
          />
        </div>

        <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-3 px-1 uppercase tracking-wider">All Contacts</h3>
        <div className="bg-white dark:bg-gray-900 rounded-3xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-800 transition-colors">
          <AnimatePresence>
            {filteredContacts.map((contact, i) => (
              <motion.button 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ delay: i * 0.05 }}
                key={contact.id}
                onClick={() => setSelectedContact(contact)}
                className={`w-full flex items-center p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors ${i !== filteredContacts.length - 1 ? 'border-b border-gray-100 dark:border-gray-800' : ''}`}
              >
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-xl flex items-center justify-center font-bold text-lg mr-4 border border-purple-200 dark:border-purple-800/50">
                  {contact.name.charAt(0)}
                </div>
                <div className="flex-1 text-left">
                  <h4 className="font-bold text-gray-900 dark:text-white leading-tight mb-0.5">{contact.name}</h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">{contact.phone}</p>
                </div>
                <div className="flex flex-col items-end">
                  <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${
                    contact.trust < 50 ? 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400' : 'bg-green-50 text-green-600 dark:bg-green-500/10 dark:text-green-400'
                  }`}>
                    T-Score: {contact.trust}%
                  </span>
                </div>
              </motion.button>
            ))}
          </AnimatePresence>
          {filteredContacts.length === 0 && (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400 font-medium">No contacts found</div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
