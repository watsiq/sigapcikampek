/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { ReactNode } from 'react';
import { motion } from 'motion/react';

interface StatsCardProps {
  label: string;
  value: string | number;
  icon: ReactNode;
  color: string; // Tailwind bg class
  textColor?: string; // Optional tailwind text color
  detail?: string;
}

export function StatsCard({ label, value, icon, color, textColor = 'text-slate-900', detail }: StatsCardProps) {
  // Extracting the base color to create a border color class
  const baseColorMatch = color.match(/bg-(\w+)-50/);
  const borderColorClass = baseColorMatch ? `border-${baseColorMatch[1]}-100` : 'border-slate-100';

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      className={`${color} ${textColor} p-8 rounded-[2.5rem] border ${borderColorClass} shadow-sm group hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-500 cursor-default relative overflow-hidden`}
    >
      {/* Decorative background icon */}
      <div className="absolute -right-6 -bottom-8 opacity-[0.08] group-hover:opacity-15 group-hover:scale-110 group-hover:rotate-12 transition-all duration-700 pointer-events-none text-current">
        {React.cloneElement(icon as React.ReactElement, { size: 140, strokeWidth: 1.5 })}
      </div>
      
      {/* Glow effect */}
      <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-white/20 rounded-full blur-3xl group-hover:bg-white/30 transition-all duration-700 pointer-events-none" />
      
      <div className="min-w-0 relative z-10">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-2.5 opacity-60 truncate leading-none">{label}</p>
        <h4 className="text-3xl font-black tracking-tighter truncate leading-none">{value}</h4>
        {detail && (
          <p className="text-[9px] font-bold mt-2.5 opacity-60 truncate flex items-center space-x-1 uppercase tracking-widest">
            <span className="w-1 h-1 rounded-full bg-current" />
            <span>{detail}</span>
          </p>
        )}
      </div>
    </motion.div>
  );
}
