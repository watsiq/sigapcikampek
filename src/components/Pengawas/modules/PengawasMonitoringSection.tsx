import React from 'react';
import { motion } from 'framer-motion';
import { Building2, Search, School } from 'lucide-react';

interface PengawasMonitoringSectionProps {
  schoolsCount: number;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filterType: 'ALL' | 'ALERT' | 'WARNING';
  setFilterType: (type: 'ALL' | 'ALERT' | 'WARNING') => void;
  filteredSchools: any[];
  onSchoolClick: (school: any) => void;
}

export function PengawasMonitoringSection({
  schoolsCount,
  searchQuery,
  setSearchQuery,
  filterType,
  setFilterType,
  filteredSchools,
  onSchoolClick
}: PengawasMonitoringSectionProps) {
  return (
    <div className="space-y-8">
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 px-4">
         <h3 className="text-2xl font-black text-slate-800 tracking-tighter flex items-center space-x-4">
            <div className="p-3 bg-indigo-600 text-white rounded-[1.2rem] shadow-xl shadow-indigo-100">
              <Building2 size={24} />
            </div>
            <div className="flex flex-col">
               <span>Monitoring Real-time Satuan Pendidikan</span>
               <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">{schoolsCount} Sekolah Terdaftar</span>
            </div>
         </h3>

         <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="relative w-full sm:w-64 group">
               <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors" size={16} />
               <input 
                 type="text"
                 placeholder="Cari Satuan..."
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
                 className="w-full pl-12 pr-6 py-3.5 bg-white border border-slate-100 rounded-[1.5rem] text-[10px] font-black shadow-sm outline-none focus:ring-4 focus:ring-indigo-100 transition-all placeholder:text-slate-300"
               />
            </div>
            <div className="flex p-0.5 bg-slate-100/50 backdrop-blur-sm border border-slate-100 rounded-2xl shadow-inner">
               <button 
                 onClick={() => setFilterType('ALL')}
                 className={`px-6 py-2.5 rounded-[1.1rem] text-[8px] font-black uppercase tracking-[0.15em] transition-all ${filterType === 'ALL' ? 'bg-white text-indigo-600 shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
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
         {filteredSchools.map((school: any) => (
            <motion.div 
              key={school.schoolName}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ y: -5 }}
              onClick={() => onSchoolClick(school)}
              className={`bg-white rounded-[2rem] border p-6 transition-all duration-300 cursor-pointer relative overflow-hidden group ${
                school.missingAttendanceCount > 0 
                ? 'border-rose-200 shadow-[0_10px_30px_-15px_rgba(244,63,94,0.2)] hover:border-rose-400' 
                : 'border-slate-100 shadow-sm hover:shadow-xl hover:border-indigo-200'
              }`}
            >
               {school.missingAttendanceCount > 0 && (
                 <div className="absolute top-0 right-0 p-4">
                    <div className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></div>
                 </div>
               )}
               
               <div className="flex flex-col h-full justify-between space-y-4">
                  <div className="flex items-center space-x-3">
                     <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border transition-all ${
                       school.missingAttendanceCount > 0 ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-slate-50 text-slate-400 border-slate-100 group-hover:bg-indigo-600 group-hover:text-white'
                     }`}>
                        <School size={18} />
                     </div>
                     <div className="overflow-hidden">
                        <h4 className="font-black text-slate-800 text-sm leading-tight uppercase truncate tracking-tight">{school.schoolName}</h4>
                        <div className="flex items-center space-x-2 mt-1">
                           <div className={`px-1.5 py-0.5 rounded text-[7px] font-black uppercase tracking-tighter ${school.ksPresent ? 'bg-indigo-50 text-indigo-600' : 'bg-rose-50 text-rose-500'}`}>
                              KS: {school.ksPresent ? 'HADIR' : 'ABSEN'}
                           </div>
                           {school.pendingKSDocs > 0 && (
                             <div className="px-1.5 py-0.5 rounded bg-amber-50 text-amber-600 text-[7px] font-black uppercase tracking-tighter">
                                {school.pendingKSDocs} BERKAS KS
                             </div>
                           )}
                        </div>
                        <div className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1.5 truncate">Pimpinan: {school.ksName}</div>
                     </div>
                  </div>

                  <div className="space-y-4">
                     <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3 font-black">
                           <div className="text-[14px] text-slate-800">{school.totalScore}</div>
                           <div className="text-[8px] text-slate-400 uppercase tracking-widest">Poin</div>
                        </div>
                        <div className={`px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest ${
                          school.docCompletion > 80 ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                        }`}>
                          {school.docCompletion}% Valid
                        </div>
                     </div>

                     <div className="space-y-1.5">
                        <div className="flex justify-between items-center text-[8px] font-black uppercase tracking-widest">
                           <span className={school.missingAttendanceCount > 0 ? "text-rose-500" : "text-slate-400"}>
                             Presensi: {school.staffPresent}/{school.staffCount}
                           </span>
                           {school.pendingDocs > school.pendingKSDocs && <span className="text-amber-500">{school.pendingDocs - school.pendingKSDocs} Guru Pending</span>}
                        </div>
                        <div className="h-1 w-full bg-slate-50 rounded-full overflow-hidden border border-slate-50">
                           <div 
                             className={`h-full transition-all duration-700 ${school.missingAttendanceCount > 0 ? 'bg-rose-500' : 'bg-indigo-600'}`}
                             style={{ width: `${(school.staffPresent / school.staffCount) * 100}%` }}
                           />
                        </div>
                        
                        <div className={`mt-4 w-full py-3 rounded-xl border flex items-center justify-center space-x-2 transition-all ${
                          school.missingAttendanceCount > 0 
                          ? 'bg-rose-50 border-rose-100 text-rose-600 group-hover:bg-rose-600 group-hover:text-white group-hover:border-rose-600' 
                          : 'bg-indigo-50 border-indigo-100 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-600'
                        }`}>
                            <span className="text-[9px] font-black uppercase tracking-widest">Lihat Rincian Satuan</span>
                        </div>
                     </div>
                  </div>
               </div>
            </motion.div>
         ))}
      </div>
    </div>
  );
}
