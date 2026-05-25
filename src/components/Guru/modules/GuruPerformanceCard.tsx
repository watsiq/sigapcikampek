import React from 'react';
import { Trophy } from 'lucide-react';

interface GuruPerformanceCardProps {
  myMonthlyDocsCount: number;
  myRankIndex: number;
  totalRankings: number;
}

export function GuruPerformanceCard({ 
  myMonthlyDocsCount, 
  myRankIndex, 
  totalRankings 
}: GuruPerformanceCardProps) {
  return (
    <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white relative overflow-hidden shadow-2xl">
      <div className="absolute top-0 right-0 p-12 opacity-10 rotate-12 scale-150">
        <Trophy size={140} />
      </div>
      <div className="relative z-10 max-w-md">
        <h3 className="text-2xl font-black mb-2 tracking-tight">Capaian Kinerja Kamu</h3>
        <p className="text-slate-400 text-sm font-medium mb-8 leading-relaxed">Terus pertahankan disiplin presensi dan pastikan RPP Lengkap & Praktik Baik Guru dikirim tepat waktu.</p>
        <div className="flex space-x-6">
          <div>
            <div className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">Status Dokumen</div>
            <div className="text-lg font-black">{myMonthlyDocsCount >= 2 ? 'LENGKAP' : 'BELUM LENGKAP'}</div>
          </div>
          <div className="w-px h-10 bg-slate-800" />
          <div>
            <div className="text-[10px] font-black text-amber-400 uppercase tracking-widest mb-1">Peringkat Apresiasi</div>
            <div className="text-lg font-black"># {myRankIndex} dari {totalRankings}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
