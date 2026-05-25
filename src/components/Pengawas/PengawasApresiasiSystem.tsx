import React, { useState } from 'react';
import { 
  Trophy, 
  Medal, 
  Clock, 
  FileText 
} from 'lucide-react';

interface PengawasApresiasiSystemProps {
  users: any[];
  allDocuments: any[];
  teacherRankings: any[];
  principalRankings: any[];
  isKSView?: boolean;
  isTeacherView?: boolean;
}

export function PengawasApresiasiSystem({ users, allDocuments, teacherRankings, principalRankings, isKSView = false, isTeacherView = false }: PengawasApresiasiSystemProps) {
  const [activeTab, setActiveTab] = useState<'GURU' | 'KEPALA_SEKOLAH'>(isTeacherView ? 'GURU' : (isKSView ? 'KEPALA_SEKOLAH' : 'GURU'));

  const currentRankings = activeTab === 'GURU' ? teacherRankings : principalRankings;

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-br from-amber-400 to-orange-600 p-8 rounded-[3rem] text-white shadow-xl shadow-orange-600/20 relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-2xl font-black flex items-center space-x-3 text-white tracking-tight">
             <Trophy size={32} />
             <span>Sistem Apresiasi & Prestasi Digital</span>
          </h2>
          <p className="mt-2 text-white/90 max-w-lg font-medium text-sm leading-relaxed">Rekapitulasi otomatis berdasarkan Kehadiran dan Pengiriman Berkas yang telah divalidasi pembina.</p>
        </div>
        <div className="absolute top-0 right-0 p-12 opacity-10 rotate-12 scale-150">
           <Medal size={120} />
        </div>
      </div>

      <div className="flex p-1.5 bg-white rounded-2xl border border-slate-100 shadow-sm w-fit overflow-x-auto max-w-full">
        {(!isTeacherView && !isKSView) && (
          <>
            <button 
              onClick={() => setActiveTab('GURU')}
              className={`px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${activeTab === 'GURU' ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Capaian Guru
            </button>
            <button 
              onClick={() => setActiveTab('KEPALA_SEKOLAH')}
              className={`px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${activeTab === 'KEPALA_SEKOLAH' ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Capaian Manajerial KS
            </button>
          </>
        )}
        {isTeacherView && <div className="px-8 py-3 font-black text-orange-600 text-[10px] uppercase tracking-widest">Klasemen Apresiasi Guru Gugus</div>}
        {isKSView && <div className="px-8 py-3 font-black text-orange-600 text-[10px] uppercase tracking-widest">Klasemen Apresiasi Manajerial KS</div>}
      </div>

      <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-100 bg-slate-50/20">
           <h3 className="font-black text-slate-800 tracking-tight">Peringkat Akumulasi Kinerja Digital</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-[10px] text-slate-400 uppercase font-black tracking-widest border-b border-slate-100">
              <tr>
                <th className="px-8 py-6 text-center">Rank</th>
                <th className="px-8 py-6">Profil Personel</th>
                <th className="px-8 py-6">Satuan Pendidikan</th>
                <th className="px-8 py-6">Presensi dan Berkas</th>
                <th className="px-8 py-6 text-right font-black text-orange-600">Skor Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {currentRankings.map((u: any, idx: number) => (
                <tr key={u.id} className={`${idx < 3 ? 'bg-orange-50/10' : ''} hover:bg-slate-50 transition-colors`}>
                  <td className="px-8 py-6 text-center">
                    {idx === 0 ? <span className="text-2xl">🥇</span> : 
                     idx === 1 ? <span className="text-2xl">🥈</span> :
                     idx === 2 ? <span className="text-2xl">🥉</span> :
                     <span className="font-black text-slate-300">#{idx + 1}</span>}
                  </td>
                  <td className="px-8 py-6">
                    <div className="font-black text-slate-800 text-sm tracking-tight">{u.nama}</div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">NIP/NUPTK/NO HP: {u.nip}</div>
                  </td>
                  <td className="px-8 py-6 text-slate-600 font-bold text-xs uppercase tracking-tight">{u.sekolah}</td>
                  <td className="px-8 py-6">
                    <div className="flex items-center space-x-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                       <div className="flex items-center space-x-1" title="Jumlah Kehadiran"><Clock size={14} className="text-emerald-500" /><span>{u.attendanceCount || 0} Hari</span></div>
                       <div className="flex items-center space-x-1" title="Jumlah Upload Berkas"><FileText size={14} className="text-blue-500" /><span>{u.documentCount || 0} Berkas</span></div>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <span className="text-2xl font-black text-orange-600">{u.totalScore}</span>
                    <span className="ml-1 text-[10px] font-black text-slate-400 uppercase tracking-widest">Poin</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
