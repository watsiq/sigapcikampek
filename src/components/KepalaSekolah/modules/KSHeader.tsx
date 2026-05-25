import React from 'react';
import { FileSpreadsheet } from 'lucide-react';

interface KSHeaderProps {
  sekolah: string;
  npsn?: string;
}

export function KSHeader({ sekolah, npsn }: KSHeaderProps) {
  return (
    <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-8 px-2">
      <div className="min-w-0">
        <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tighter leading-tight truncate">Otoritas Satuan Pendidikan</h2>
        <div className="flex items-center space-x-2 mt-1">
           <span className="w-2 h-2 rounded-full bg-blue-500"></span>
           <p className="text-[10px] md:text-xs text-slate-400 font-black uppercase tracking-[0.2em] truncate">
             Dashboard Kontrol & Verifikasi Terpadu • {sekolah} {npsn ? `• NPSN: ${npsn}` : ''}
           </p>
        </div>
      </div>
    </div>
  );
}
