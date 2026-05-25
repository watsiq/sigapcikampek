import React from 'react';
import { motion } from 'framer-motion';
import { X, Building2, ChevronRight, BarChart3, Users } from 'lucide-react';

interface PengawasSchoolDetailDrawerProps {
  schoolDetail: any;
  onClose: () => void;
  onSelectPersonnel: (personId: string) => void;
}

export function PengawasSchoolDetailDrawer({ schoolDetail, onClose, onSelectPersonnel }: PengawasSchoolDetailDrawerProps) {
  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[80] flex justify-end">
       <motion.div 
         initial={{ x: '100%' }}
         animate={{ x: 0 }}
         exit={{ x: '100%' }}
         transition={{ type: 'spring', damping: 25, stiffness: 200 }}
         className="relative w-full max-w-lg bg-slate-50/30 backdrop-blur-md h-full shadow-2xl flex flex-col overflow-hidden"
       >
          {/* Header */}
          <div className="p-6 border-b border-white/20 flex items-center justify-between bg-white relative">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-lg overflow-hidden shrink-0">
                <Building2 size={24} />
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight truncate">{schoolDetail.schoolName}</h3>
                <div className="flex items-center space-x-2 mt-0.5">
                  <div className="px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 text-[8px] font-black uppercase tracking-widest">
                    Monitoring Satuan
                  </div>
                  <div className="flex items-center space-x-1 px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[8px] font-black uppercase tracking-widest">
                    <span>Rank #{schoolDetail.rank || '-'}</span>
                  </div>
                </div>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-400 hover:text-slate-900 border border-slate-100 shadow-sm"
            >
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-6">
             {/* Efficiency Stats Card */}
             <div className="grid grid-cols-3 gap-3">
                <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm">
                   <div className="text-[8px] font-black text-slate-400 uppercase tracking-[0.15em] mb-2">Presensi</div>
                   <div className="text-xl font-black text-slate-900 leading-none">
                      {schoolDetail.staffPresent}<span className="text-slate-300 text-xs font-normal">/</span>{schoolDetail.staffCount}
                   </div>
                   <div className="text-[8px] font-bold text-slate-400 mt-2 uppercase tracking-tighter">Hadir Hari Ini</div>
                </div>
                <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm">
                   <div className="text-[8px] font-black text-slate-400 uppercase tracking-[0.15em] mb-2">Kinerja</div>
                   <div className="text-xl font-black text-indigo-600 leading-none">{schoolDetail.totalScore}</div>
                   <div className="text-[8px] font-bold text-slate-400 mt-2 uppercase tracking-tighter">Total Poin</div>
                </div>
                <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm">
                   <div className="text-[8px] font-black text-slate-400 uppercase tracking-[0.15em] mb-2">Kelengkapan</div>
                   <div className="text-xl font-black text-emerald-600 leading-none">{schoolDetail.docCompletion}%</div>
                   <div className="text-[8px] font-bold text-slate-400 mt-2 uppercase tracking-tighter">Berkas Selesai</div>
                </div>
             </div>

             {/* Personnel List Section */}
             <section className="space-y-4">
                <div className="flex items-center justify-between px-2">
                  <h4 className="text-[10px] font-black text-slate-800 uppercase tracking-[0.2em] flex items-center">
                    <Users className="mr-2 text-indigo-500" size={14} />
                    Status Personel
                  </h4>
                  <div className="flex space-x-2">
                    {['RED', 'YELLOW', 'GREEN'].map(status => (
                      <div key={status} className={`w-2 h-2 rounded-full ${
                        status === 'RED' ? 'bg-rose-500' : 
                        status === 'YELLOW' ? 'bg-amber-500' : 'bg-emerald-500'
                      }`} />
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-2 pb-8">
                   {schoolDetail.exceptionList.map((guru: any) => (
                      <div 
                        key={guru.id} 
                        onClick={() => onSelectPersonnel(guru.id)}
                        className="p-3 bg-white border border-slate-100 rounded-2xl hover:border-indigo-100 hover:shadow-md hover:scale-[1.01] cursor-pointer transition-all group flex items-center justify-between"
                      >
                         <div className="flex items-center space-x-3 min-w-0">
                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-white text-[11px] shadow-sm shrink-0 ${
                               guru.status === 'RED' ? 'bg-rose-500' : 
                               guru.status === 'YELLOW' ? 'bg-amber-500' : 'bg-emerald-500'
                            }`}>
                               {guru.name.charAt(0)}
                            </div>
                            <div className="min-w-0">
                               <div className="flex items-center space-x-2">
                                  <div className="font-black text-slate-800 text-[11px] tracking-tight truncate">{guru.name}</div>
                                  <div className={`px-1.5 py-0.5 rounded-[4px] text-[7px] font-black uppercase tracking-tighter ${guru.role === 'KEPALA_SEKOLAH' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                                     {guru.role === 'KEPALA_SEKOLAH' ? 'KS' : 'GURU'}
                                  </div>
                               </div>
                               <div className="text-[9px] font-bold text-slate-400 font-mono mt-0.5">{guru.nip}</div>
                            </div>
                         </div>
                         <div className="flex items-center space-x-3 shrink-0 ml-3">
                            <div className="text-right">
                               <div className={`text-[9px] font-black uppercase tracking-widest leading-none ${
                                  guru.status === 'RED' ? 'text-rose-500' : 
                                  guru.status === 'YELLOW' ? 'text-amber-600' : 'text-emerald-600'
                               }`}>{guru.label}</div>
                               <div className="text-[7px] text-slate-300 font-bold uppercase mt-1 tracking-widest">{guru.docCount} BERKAS</div>
                            </div>
                            <div className="text-slate-200 group-hover:text-indigo-400 transition-all">
                               <ChevronRight size={14} />
                            </div>
                         </div>
                      </div>
                   ))}
                   {schoolDetail.exceptionList.length === 0 && (
                      <div className="p-10 text-center text-slate-300 font-bold italic text-[10px]">Belum ada data personel</div>
                   )}
                </div>
             </section>
          </div>
       </motion.div>
    </div>
  );
}
