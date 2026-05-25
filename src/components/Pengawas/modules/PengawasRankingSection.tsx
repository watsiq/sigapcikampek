import React from 'react';
import { BarChart3 } from 'lucide-react';

interface PengawasRankingSectionProps {
  schoolRankings: any[];
}

export function PengawasRankingSection({ schoolRankings }: PengawasRankingSectionProps) {
  const avgCompletion = Math.round(schoolRankings.reduce((acc: number, s: any) => acc + s.docCompletion, 0) / schoolRankings.length || 0);

  return (
    <div className="lg:col-span-1 space-y-6">
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col h-fit overflow-hidden relative">
         <div className="p-8 border-b border-slate-100 bg-slate-50 text-slate-900 relative">
            <h3 className="font-black text-xs uppercase tracking-[0.2em] flex items-center space-x-3">
              <BarChart3 size={18} className="text-indigo-600" />
              <span>Klasemen Wilayah</span>
            </h3>
         </div>
         <div className="p-6 space-y-4">
            {schoolRankings.slice(0, 5).map((school: any, idx: number) => (
              <div key={school.schoolName} className="p-5 bg-slate-50 rounded-3xl border border-slate-100 flex items-center justify-between group hover:bg-white hover:border-blue-300 hover:shadow-xl transition-all">
                 <div className="flex items-center space-x-5">
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-lg shadow-sm transition-transform group-hover:scale-110 ${
                      idx === 0 ? 'bg-amber-500 text-white shadow-amber-500/30' : 
                      idx === 1 ? 'bg-slate-300 text-white shadow-inner' : 
                      'bg-white text-slate-400 border border-slate-100 shadow-sm'
                    }`}>
                      {idx + 1}
                    </div>
                    <div>
                       <div className="text-sm font-black text-slate-800 leading-none tracking-tighter truncate max-w-[120px]">{school.schoolName}</div>
                       <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Poin: {school.totalScore}</div>
                    </div>
                 </div>
              </div>
            ))}
         </div>
         <div className="p-8 bg-slate-50 border-t border-slate-100 shadow-inner">
            <div className="flex justify-between items-center text-[10px] font-black text-slate-500 mb-3 uppercase tracking-tighter">
               <span>Kelengkapan Berkas</span>
               <span className="text-indigo-600 font-black">
                 {avgCompletion}%
               </span>
            </div>
            <div className="h-2 bg-white rounded-full overflow-hidden border border-slate-100">
               <div className="h-full bg-indigo-500 transition-all duration-1000 shadow-[0_0_10px_rgba(99,102,241,0.5)]" style={{ width: `${avgCompletion}%` }}></div>
            </div>
         </div>
      </div>
    </div>
  );
}
