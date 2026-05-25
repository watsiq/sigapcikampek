import React from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

export function PageLoader() {
  return (
    <div className="flex flex-col items-center justify-center p-20 w-full animate-in fade-in duration-500">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
        className="text-blue-500 mb-4"
      >
        <Loader2 size={48} />
      </motion.div>
      <p className="text-slate-400 font-black text-xs uppercase tracking-[0.3em] animate-pulse">Menyiapkan Otoritas...</p>
    </div>
  );
}
