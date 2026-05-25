import React from 'react';
import { motion } from 'framer-motion';
import { Fingerprint, FileClock } from 'lucide-react';

interface Alert {
  type: 'RED' | 'YELLOW';
  title: string;
  message: string;
  icon: React.ReactNode;
}

interface GuruAlertsProps {
  alerts: Alert[];
}

export function GuruAlerts({ alerts }: GuruAlertsProps) {
  if (alerts.length === 0) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {alerts.map((alert, idx) => (
        <motion.div 
          key={idx}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className={`p-6 rounded-[2rem] border flex items-start space-x-5 relative overflow-hidden group shadow-xl transition-all ${
            alert.type === 'RED' ? 'bg-rose-600 border-rose-500 text-white shadow-rose-200/50' : 'bg-amber-100 border-amber-200 text-amber-900 shadow-amber-200/20'
          }`}
        >
          <div className={`p-3.5 rounded-2xl flex-shrink-0 shadow-inner ${alert.type === 'RED' ? 'bg-white/20' : 'bg-white shadow-sm'}`}>
            {React.cloneElement(alert.icon as React.ReactElement, { className: alert.type === 'RED' ? 'text-white' : 'text-amber-600' })}
          </div>
          <div className="relative z-10">
            <h4 className="font-black text-sm uppercase tracking-widest mb-1">{alert.title}</h4>
            <p className={`text-[10px] font-bold leading-relaxed opacity-90 ${alert.type === 'RED' ? 'text-rose-50' : 'text-amber-700'}`}>{alert.message}</p>
          </div>
          <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:rotate-12 transition-transform duration-500">
            {React.cloneElement(alert.icon as React.ReactElement, { size: 80 })}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
