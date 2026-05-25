import React from 'react';

interface PengawasHeaderProps {
  userName: string;
}

export function PengawasHeader({ userName }: PengawasHeaderProps) {
  return (
    <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-8 px-2">
      <div className="min-w-0">
        <h2 className="text-2xl md:text-4xl font-black text-slate-900 tracking-tighter leading-tight break-words">Monitoring Wilayah Binaan</h2>
        <div className="flex items-center space-x-2 mt-1">
           <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
           <p className="text-[10px] md:text-xs text-slate-400 font-black uppercase tracking-[0.2em]">Otoritas Pengawas • {userName}</p>
        </div>
      </div>
    </div>
  );
}
