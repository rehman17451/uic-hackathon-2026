import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Phone, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion } from 'framer-motion';
import { useState } from 'react';

const schema = z.object({
  phone: z.string().regex(/^[6-9]\d{9}$/, "Must be a valid 10-digit Indian mobile number"),
  amount: z.number().min(1, "Amount must be at least ₹1")
});

type FormData = z.infer<typeof schema>;

export default function PayNumber() {
  const navigate = useNavigate();
  const [isProceeding, setIsProceeding] = useState(false);
  
  const { register, handleSubmit, formState: { errors }, watch } = useForm<FormData>({
    resolver: zodResolver(schema)
  });

  const phoneValue = watch('phone');

  const onSubmit = (data: FormData) => {
    setIsProceeding(true);
    setTimeout(() => {
      navigate('/pay/processing', {
        state: {
          amount: data.amount,
          partyName: `User (+91 ${data.phone})`,
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
      className="flex flex-col bg-gray-50 dark:bg-gray-900 transition-colors duration-300 relative h-full"
    >
      <div className="absolute top-0 left-0 w-full h-40 bg-gradient-to-b from-brand-primary/10 dark:from-brand-primary/5 to-transparent pointer-events-none" />

      <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md px-4 py-3 pb-4 shadow-sm border-b border-gray-100 dark:border-gray-800 flex items-center gap-4 z-10 transition-colors">
        <button onClick={() => navigate('/')} className="p-2 -ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition-colors">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-lg font-bold text-gray-900 dark:text-white">Pay by Number</h1>
      </div>

      <div className="flex-1 p-6 relative z-10 overflow-y-auto">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 flex flex-col min-h-full pb-6">
          <div className="space-y-6 flex-1">
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="bg-white dark:bg-gray-800 p-5 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors"
            >
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Mobile Number</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">+91</span>
                <input 
                  type="text"
                  maxLength={10}
                  {...register('phone')}
                  disabled={isProceeding}
                  className="w-full pl-14 pr-4 py-4 rounded-2xl bg-gray-50 dark:bg-gray-900/50 border-2 border-transparent focus:border-brand-primary focus:bg-white dark:focus:bg-gray-900 text-gray-900 dark:text-white outline-none transition-all font-semibold tracking-wider placeholder-gray-400 dark:placeholder-gray-600 disabled:opacity-50"
                  placeholder="00000 00000"
                />
              </div>
              {errors.phone && <p className="text-red-500 text-xs mt-2 ml-2 font-medium">{errors.phone.message}</p>}
              
              {/* Fake auto-suggested UPI ID */}
              {phoneValue?.length === 10 && !errors.phone && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-3 px-4 py-3 bg-brand-primary/10 dark:bg-brand-primary/20 text-green-700 dark:text-green-400 rounded-xl text-xs font-bold border border-green-200 dark:border-green-800 flex items-center"
                >
                  ✓ UPI ID: {phoneValue}@truesay verified
                </motion.div>
              )}
            </motion.div>

            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-white dark:bg-gray-800 p-5 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors"
            >
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Amount</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-light text-gray-400 dark:text-gray-500">₹</span>
                <input 
                  type="number"
                  {...register('amount', { valueAsNumber: true })}
                  disabled={isProceeding}
                  className="w-full pl-10 pr-4 py-4 rounded-2xl bg-gray-50 dark:bg-gray-900/50 border-2 border-transparent focus:border-brand-primary focus:bg-white dark:focus:bg-gray-900 text-gray-900 dark:text-white outline-none transition-all font-bold text-3xl placeholder-gray-300 dark:placeholder-gray-700 disabled:opacity-50"
                  placeholder="0"
                />
              </div>
              {errors.amount && <p className="text-red-500 text-xs mt-2 ml-2 font-medium">{errors.amount.message}</p>}
            </motion.div>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={isProceeding}
            className={`w-full text-white text-lg font-bold py-4 rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 ${isProceeding ? 'bg-gray-400 cursor-not-allowed shadow-none' : 'bg-brand-primary hover:bg-green-600 shadow-brand-primary/30'}`}
          >
            {isProceeding ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                <span>Preparing Secure Payment...</span>
              </>
            ) : (
              <>
                <Phone size={20} />
                <span>Proceed to Pay</span>
              </>
            )}
          </motion.button>
        </form>
      </div>
    </motion.div>
  );
}
