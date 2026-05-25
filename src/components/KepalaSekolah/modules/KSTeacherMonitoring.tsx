import React from 'react';
import { motion } from 'framer-motion';
import { Users, Search, User, CheckCircle2, AlertCircle, Clock, Star } from 'lucide-react';

interface KSTeacherMonitoringProps {
  teachersCount: number;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filterType: 'ALL' | 'ALERT';
  setFilterType: (type: 'ALL' | 'ALERT') => void;
  filteredTeachers: any[];
  onTeacherClick?: (teacher: any) => void;
}

export function KSTeacherMonitoring({
  teachersCount,
  searchQuery,
  setSearchQuery,
  filterType,
  setFilterType,
  filteredTeachers,
  onTeacherClick
}: KSTeacherMonitoringProps) {
  const presentCount = filteredTeachers.filter(t => t.isPresent).length;
  const absentCount = filteredTeachers.length - presentCount;

  return (
    <div className="space-y-8">
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 px-4">
         <h3 className="text-2xl font-black text-slate-800 tracking-tighter flex items-center space-x-4">
            <div className="p-3 bg-slate-900 text-white rounded-[1.2rem] shadow-xl shadow-slate-100">
              <Users size={24} />
            </div>
            <div className="flex flex-col">
               <span>Monitoring Real-time Guru</span>
               <div className="flex items-center space-x-3 mt-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">{teachersCount} Total Guru</span>
                  <div className="flex items-center space-x-2">
                     <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                     <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">{presentCount} Hadir</span>
                  </div>
                  <div className="flex items-center space-x-2">
                     <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                     <span className="text-[9px] font-black text-rose-600 uppercase tracking-widest">{absentCount} Absen</span>
                  </div>
               </div>
            </div>
         </h3>

         <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="relative w-full sm:w-64 group">
               <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-slate-900 transition-colors" size={16} />
               <input 
                 type="text"
                 placeholder="Cari Nama Guru..."
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
                 className="w-full pl-12 pr-6 py-3.5 bg-white border border-slate-100 rounded-[1.5rem] text-[10px] font-black shadow-sm outline-none focus:ring-4 focus:ring-slate-100 transition-all placeholder:text-slate-300"
               />
            </div>
            <div className="flex p-0.5 bg-slate-100/50 backdrop-blur-sm border border-slate-100 rounded-2xl shadow-inner">
               <button 
                 onClick={() => setFilterType('ALL')}
                 className={`px-6 py-2.5 rounded-[1.1rem] text-[8px] font-black uppercase tracking-[0.15em] transition-all ${filterType === 'ALL' ? 'bg-white text-slate-900 shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
               >
                 Semua
               </button>
               <button 
                 onClick={() => setFilterType('ALERT')}
                 className={`px-6 py-2.5 rounded-[1.1rem] text-[8px] font-black uppercase tracking-[0.15em] transition-all ${filterType === 'ALERT' ? 'bg-rose-500 text-white shadow-lg shadow-rose-200' : 'text-slate-400 hover:text-slate-600'}`}
               >
                 Peringatan
               </button>
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-5">
         {filteredTeachers.map((teacher: any) => (
            <motion.div 
               key={teacher.id}
               initial={{ opacity: 0, scale: 0.98 }}
               animate={{ opacity: 1, scale: 1 }}
               whileHover={{ y: -5 }}
               onClick={() => onTeacherClick?.(teacher)}
               className={`bg-white rounded-[2rem] border p-6 transition-all duration-300 cursor-pointer relative overflow-hidden group ${
                 teacher.isWarning 
                 ? 'border-rose-200 shadow-[0_10px_30px_-15px_rgba(244,63,94,0.2)] hover:border-rose-400' 
                 : 'border-slate-100 shadow-sm hover:shadow-xl hover:border-slate-200'
               }`}
            >
               {teacher.isWarning && (
                 <div className="absolute top-0 right-0 p-4">
                    <div className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></div>
                 </div>
               )}
               
               <div className="flex flex-col h-full justify-between space-y-4">
                  <div className="flex items-center space-x-3">
                     <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border transition-all overflow-hidden ${
                       teacher.isWarning ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-slate-50 text-slate-400 border-slate-100 group-hover:bg-slate-900 group-hover:text-white'
                     }`}>
                        {teacher.avatar ? (
                          <img src={teacher.avatar} alt={teacher.nama} className="w-full h-full object-cover" />
                        ) : (
                          <User size={18} />
                        )}
                     </div>
                     <div className="overflow-hidden">
                        <h4 className="font-black text-slate-800 text-sm leading-tight uppercase truncate tracking-tight">{teacher.nama}</h4>
                        <div className="flex items-center space-x-2 mt-1">
                           <div className={`px-1.5 py-0.5 rounded text-[7px] font-black uppercase tracking-tighter ${teacher.statusColor?.replace('text-', 'bg-').replace('500', '50')} ${teacher.statusColor}`}>
                              {teacher.statusLabel}
                           </div>
                           {teacher.pendingDocs > 0 && (
                             <div className="px-1.5 py-0.5 rounded bg-amber-50 text-amber-600 text-[7px] font-black uppercase tracking-tighter">
                                {teacher.pendingDocs} PENDING
                             </div>
                           )}
                        </div>
                     </div>
                  </div>

                  <div className="space-y-4">
                     <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2 font-black">
                           <Star size={12} className="text-amber-400 fill-amber-400" />
                           <div className="text-[14px] text-slate-800">{teacher.totalPoints}</div>
                           <div className="text-[8px] text-slate-400 uppercase tracking-widest">Poin</div>
                        </div>
                        <div className={`px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest ${
                          teacher.docCompletion > 80 ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                        }`}>
                          {teacher.docCompletion}% Dokumen
                        </div>
                     </div>

                     <div className="space-y-2">
                        <div className="flex flex-col gap-1">
                           <div className="flex items-center space-x-2 text-[8px] font-black uppercase tracking-widest text-slate-400">
                             <Clock size={10} />
                             <span>{teacher.lastAttendanceTime || 'Belum Presensi'}</span>
                           </div>
                           <div className="h-1 w-full bg-slate-50 rounded-full overflow-hidden border border-slate-50">
                              <div 
                                className={`h-full transition-all duration-700 ${teacher.isWarning ? 'bg-rose-500' : 'bg-slate-900'}`}
                                style={{ width: `${teacher.docCompletion}%` }}
                              />
                           </div>
                        </div>

                        <div className={`mt-4 w-full py-3 rounded-xl border flex items-center justify-center space-x-2 transition-all ${
                          teacher.isWarning 
                          ? 'bg-rose-50 border-rose-100 text-rose-600 group-hover:bg-rose-600 group-hover:text-white group-hover:border-rose-600' 
                          : 'bg-slate-50 border-slate-100 text-slate-400 group-hover:bg-slate-900 group-hover:text-white group-hover:border-slate-900'
                        }`}>
                            <span className="text-[9px] font-black uppercase tracking-widest">Lihat Rincian</span>
                        </div>
                     </div>
                  </div>
               </div>
            </motion.div>
         ))}
         
         {filteredTeachers.length === 0 && (
            <div className="col-span-full py-20 text-center bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-100">
               <div className="text-slate-300 font-black uppercase tracking-[0.3em] text-sm italic">
                  Data Guru Tidak Ditemukan
               </div>
            </div>
         )}
      </div>
    </div>
  );
}
