import React from 'react';
import { ShieldCheck, FileClock, Fingerprint, Trophy } from 'lucide-react';
import { StatsCard } from '../../ui/StatsCard';

interface KSStatsSummaryProps {
  pendingDocsCount: number;
  pendingPermsCount: number;
  pendingManualAttCount: number;
  mySchoolRank: number;
}

export function KSStatsSummary({ 
  pendingDocsCount, 
  pendingPermsCount, 
  pendingManualAttCount, 
  mySchoolRank 
}: KSStatsSummaryProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <StatsCard label="Dokumen Pending" value={pendingDocsCount} icon={<ShieldCheck />} color="bg-white" detail="Verifikasi Berkas Guru" />
      <StatsCard label="Persetujuan Izin" value={pendingPermsCount} icon={<FileClock />} color="bg-indigo-50" textColor="text-indigo-600" detail="Aksi Diperlukan" />
      <StatsCard label="Perbaikan Presensi" value={pendingManualAttCount} icon={<Fingerprint />} color="bg-rose-50" textColor="text-rose-600" detail="Verifikasi Manual" />
      <div className="bg-slate-900 p-7 rounded-[2.5rem] border border-slate-800 shadow-2xl text-white flex flex-col justify-center relative overflow-hidden group hover:scale-[1.02] transition-all duration-500">
          <div className="absolute -right-2 -bottom-2 opacity-10 group-hover:rotate-12 transition-transform duration-700">
             <Trophy size={100} />
          </div>
          <div className="relative z-10">
             <div className="text-[9px] font-black uppercase opacity-50 tracking-[0.3em] mb-2">Peringkat Gugus</div>
             <div className="text-3xl font-black tracking-tighter flex items-baseline space-x-2">
               <span>RANK</span>
               <span className="text-blue-400">#{mySchoolRank}</span>
             </div>
          </div>
      </div>
    </div>
  );
}
