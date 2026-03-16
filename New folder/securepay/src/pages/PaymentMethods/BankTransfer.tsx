import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Building2, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion } from 'framer-motion';
import { useState } from 'react';

const schema = z.object({
  accountNumber: z.string().min(9, "Account Number must be at least 9 digits").max(18, "Account Number too long"),
  ifsc: z.string().regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, "Invalid IFSC Code format"),
  accountHolder: z.string().min(3, "Name must be at least 3 characters"),
  amount: z.number().min(1, "Amount must be at least ₹1")
});

type FormData = z.infer<typeof schema>;

export default function BankTransfer() {
  const navigate = useNavigate();
  const [isProceeding, setIsProceeding] = useState(false);
  
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema)
  });

  const onSubmit = (data: FormData) => {
    setIsProceeding(true);
    setTimeout(() => {
      navigate('/pay/processing', {
        state: {
          amount: data.amount,
          partyName: data.accountHolder,
          type: 'Sent'
        }
      });
    }, 1000);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex flex-col bg-gray-50 dark:bg-gray-950 transition-colors duration-300 relative"
    >
      <div className="absolute top-0 left-0 w-full h-40 bg-gradient-to-b from-orange-500/10 dark:from-orange-500/5 to-transparent pointer-events-none" />

      <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md px-4 py-3 pb-4 shadow-sm border-b border-gray-100 dark:border-gray-800 flex items-center gap-4 z-10 transition-colors">
        <button onClick={() => navigate('/')} className="p-2 -ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition-colors">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-lg font-bold text-gray-900 dark:text-white">Bank Transfer</h1>
      </div>

      <div className="flex-1 p-6 relative z-10">
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col">
          <div className="space-y-4 flex-1">
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="bg-white dark:bg-gray-900 p-5 rounded-[1.5rem] shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col gap-4 transition-colors"
            >
              
              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5 ml-1">Account Number</label>
                <input 
                  type="text"
                  {...register('accountNumber')}
                  className="w-full px-4 py-3.5 rounded-xl bg-gray-50 dark:bg-gray-950 border-2 border-transparent focus:border-orange-500 focus:bg-white dark:focus:bg-gray-900 outline-none transition-all font-medium text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600"
                  placeholder="Enter Account Number"
                />
                {errors.accountNumber && <p className="text-red-500 text-xs mt-1 ml-2 font-medium">{errors.accountNumber.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5 ml-1">IFSC Code</label>
                <input 
                  type="text"
                  {...register('ifsc')}
                  className="w-full px-4 py-3.5 rounded-xl bg-gray-50 dark:bg-gray-950 border-2 border-transparent focus:border-orange-500 focus:bg-white dark:focus:bg-gray-900 outline-none transition-all font-medium text-gray-900 dark:text-white uppercase placeholder-gray-400 dark:placeholder-gray-600"
                  placeholder="e.g. HDFC0001234"
                />
                {errors.ifsc && <p className="text-red-500 text-xs mt-1 ml-2 font-medium">{errors.ifsc.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5 ml-1">Account Holder Name</label>
                <input 
                  type="text"
                  {...register('accountHolder')}
                  className="w-full px-4 py-3.5 rounded-xl bg-gray-50 dark:bg-gray-950 border-2 border-transparent focus:border-orange-500 focus:bg-white dark:focus:bg-gray-900 outline-none transition-all font-medium text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600"
                  placeholder="Full Name"
                />
                {errors.accountHolder && <p className="text-red-500 text-xs mt-1 ml-2 font-medium">{errors.accountHolder.message}</p>}
              </div>

            </motion.div>

            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-white dark:bg-gray-900 p-5 rounded-[1.5rem] shadow-sm border border-gray-100 dark:border-gray-800 transition-colors"
            >
              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 ml-1">Transfer Amount</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-light text-gray-400 dark:text-gray-500">₹</span>
                <input 
                  type="number"
                  {...register('amount', { valueAsNumber: true })}
                  className="w-full pl-10 pr-4 py-4 rounded-xl bg-gray-50 dark:bg-gray-950 border-2 border-transparent focus:border-orange-500 focus:bg-white dark:focus:bg-gray-900 outline-none transition-all font-bold text-3xl text-gray-900 dark:text-white placeholder-gray-300 dark:placeholder-gray-700"
                  placeholder="0"
                />
              </div>
              {errors.amount && <p className="text-red-500 text-xs mt-1 ml-2 font-medium">{errors.amount.message}</p>}
            </motion.div>
          </div>

          <div className="pt-6">
             <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isProceeding}
              className={`w-full text-white text-lg font-bold py-4 rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 ${isProceeding ? 'bg-gray-400 cursor-not-allowed shadow-none' : 'bg-orange-500 hover:bg-orange-600 shadow-orange-500/30'}`}
             >
               {isProceeding ? (
                 <>
                   <Loader2 size={20} className="animate-spin" />
                   <span>Preparing Secure Transfer...</span>
                 </>
               ) : (
                 <>
                   <Building2 size={20} />
                   <span>Transfer Money</span>
                 </>
               )}
             </motion.button>
          </div>
        </form>
      </div>
    </motion.div>
  );
}
