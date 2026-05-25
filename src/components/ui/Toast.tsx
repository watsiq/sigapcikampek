/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Info, HelpCircle, CheckCircle2, AlertCircle } from 'lucide-react';
import { Message } from '../../types';

interface ToastProps {
  message: Message | null;
}

export function Toast({ message }: ToastProps) {
  return (
    <AnimatePresence>
      {message && (
        <motion.div 
          initial={{ opacity: 0, y: 50, scale: 0.9 }} 
          animate={{ opacity: 1, y: 0, scale: 1 }} 
          exit={{ opacity: 0, scale: 0.9 }} 
          className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] px-8 py-5 bg-slate-900 text-white rounded-[2rem] shadow-2xl flex items-center space-x-4 border border-slate-700 min-w-[320px]"
        >
          {message.type === 'success' && <CheckCircle2 className="text-emerald-400 shrink-0" size={24} />}
          {message.type === 'error' && <AlertCircle className="text-rose-400 shrink-0" size={24} />}
          {message.type === 'info' && <Info className="text-blue-400 shrink-0" size={24} />}
          <span className="font-black text-[11px] uppercase tracking-widest">{message.text}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
