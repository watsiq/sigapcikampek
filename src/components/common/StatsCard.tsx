/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface StatsCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
}

export function StatsCard({ label, value, icon, color }: StatsCardProps) {
  return (
    <div className="bg-white p-6 md:p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group overflow-hidden relative min-w-0">
      <div className="absolute -right-6 -bottom-6 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity rotate-12 group-hover:rotate-0 transform transition-transform duration-700 scale-150">
         {icon}
      </div>
      <div className="flex items-center space-x-6 relative z-10 w-full overflow-hidden">
        <div className={`p-5 rounded-2xl ${color} shadow-inner shrink-0 group-hover:scale-110 transition-transform`}>
          {React.isValidElement(icon) ? React.cloneElement(icon as React.ReactElement, { size: 28 } as any) : icon}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-1 truncate">{label}</p>
          <p className="text-xl md:text-2xl font-black text-slate-900 tracking-tighter truncate">{value}</p>
        </div>
      </div>
    </div>
  );
}
