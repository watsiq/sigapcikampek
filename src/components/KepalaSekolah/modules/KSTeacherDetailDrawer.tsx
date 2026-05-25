import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, MapPin, Clock, Calendar, Star, FileText, CheckCircle2, AlertCircle, Download, ExternalLink, PieChart } from 'lucide-react';
import { Attendance, DocumentInfo, Permission } from '../../../types';
import { MONTHS } from '../../../constants';
import { GuruAttendanceChart } from '../../Guru/modules/GuruAttendanceChart';
import { getHolidayName } from '../../../utils/holidayHelper';

interface KSTeacherDetailDrawerProps {
  teacher: any;
  onClose: () => void;
  allAttendance: Attendance[];
  allDocuments: DocumentInfo[];
  allPermissions: Permission[];
  onSelectDoc: (doc: DocumentInfo) => void;
}

export function KSTeacherDetailDrawer({
  teacher,
  onClose,
  allAttendance,
  allDocuments,
  allPermissions,
  onSelectDoc
}: KSTeacherDetailDrawerProps) {
  const [selectedMonth, setSelectedMonth] = React.useState(new Date().getMonth());

  const teacherAttendance = allAttendance
    .filter(a => a.userId === teacher.id);
  
  const teacherDocs = allDocuments
    .filter(d => d.userId === teacher.id);

  const teacherPermissions = allPermissions
    .filter(p => p.userId === teacher.id);

  const getMonthlyStats = (month: number) => {
    const year = new Date().getFullYear();
    const stats = {
      hadirNormal: 0,
      hadirPerbaikan: 0,
      tidakMasuk: 0,
      tidakKeluar: 0,
      izinCuti: 0,
      dinasLuar: 0,
      tidakHadir: 0,
      hariLibur: 0,
      workDays: 0
    };

    const monthEnd = new Date(year, month + 1, 0);
    const now = new Date();
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

    for (let d = 1; d <= monthEnd.getDate(); d++) {
      const dDate = new Date(year, month, d);
      const day = dDate.getDay();
      const isWeekend = day === 0 || day === 6;
      const dayDateStart = new Date(year, month, d, 0, 0, 0);

      if (dayDateStart > endOfToday) continue;

      const holidayName = getHolidayName(dDate, teacher.schoolId);
      if (isWeekend || holidayName) {
        stats.hariLibur++;
        continue;
      }

      stats.workDays++;

      const dayLogs = teacherAttendance.filter(a => {
        const logDate = new Date(a.timestamp);
        return logDate.getDate() === d && logDate.getMonth() === month && logDate.getFullYear() === year;
      });
      
      const inLog = dayLogs.find(l => l.type === 'IN');
      const outLog = dayLogs.find(l => l.type === 'OUT');
      
      const effectiveInLog = inLog && (!inLog.isManual || inLog.status === 'APPROVED') ? inLog : null;
      const effectiveOutLog = outLog && (!outLog.isManual || outLog.status === 'APPROVED') ? outLog : null;
      
      const dayPermission = teacherPermissions.find(p => {
         const pStart = new Date(p.startDate);
         const pEnd = new Date(p.endDate);
         const dStart = new Date(pStart.getFullYear(), pStart.getMonth(), pStart.getDate());
         const dEnd = new Date(pEnd.getFullYear(), pEnd.getMonth(), pEnd.getDate());
         return dayDateStart >= dStart && dayDateStart <= dEnd && p.status === 'APPROVED';
      });

      if (dayPermission) {
        if (dayPermission.type === 'DINAS_LUAR') {
           stats.dinasLuar++;
        } else {
           stats.izinCuti++;
        }
      } else {
        if (effectiveInLog && effectiveOutLog) {
          const bothNormal = !effectiveInLog.isManual && !effectiveOutLog.isManual;

          if (bothNormal) stats.hadirNormal++;
          else stats.hadirPerbaikan++;
        } else if (effectiveInLog && !effectiveOutLog) {
          stats.tidakKeluar++;
        } else if (!effectiveInLog && effectiveOutLog) {
          stats.tidakMasuk++;
        } else {
          stats.tidakHadir++;
        }
      }
    }
    return stats;
  };

  const monthlyStats = getMonthlyStats(selectedMonth);

  const chartData = [
    { name: 'Hadir Normal', value: monthlyStats.hadirNormal, color: '#10b981' },
    { name: 'Hadir Perbaikan', value: monthlyStats.hadirPerbaikan, color: '#059669' },
    { name: 'Tidak Masuk', value: monthlyStats.tidakMasuk, color: '#ef4444' },
    { name: 'Tidak Keluar', value: monthlyStats.tidakKeluar, color: '#f59e0b' },
    { name: 'Dinas', value: monthlyStats.dinasLuar, color: '#8b5cf6' },
    { name: 'Izin/Cuti', value: monthlyStats.izinCuti, color: '#3b82f6' },
    { name: 'Tidak Hadir', value: monthlyStats.tidakHadir, color: '#94a3b8' },
    { name: 'Hari Libur', value: monthlyStats.hariLibur, color: '#cbd5e1' },
  ].filter(d => d.value > 0);

  const sortedAttendance = [...teacherAttendance]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const sortedDocs = [...teacherDocs]
    .sort((a, b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime());

  const getTeacherStatus = () => {
    const today = new Date();
    const todayStr = today.toDateString();
    
    // Check Permission first
    const todayPermission = teacherPermissions.find(p => {
      const start = new Date(p.startDate);
      const end = new Date(p.endDate);
      const current = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const pStart = new Date(start.getFullYear(), start.getMonth(), start.getDate());
      const pEnd = new Date(end.getFullYear(), end.getMonth(), end.getDate());
      return current >= pStart && current <= pEnd && p.status === 'APPROVED';
    });

    if (todayPermission) {
      return {
        label: todayPermission.type === 'DINAS_LUAR' ? 'Dinas Luar' : 'Izin/Cuti',
        color: 'bg-indigo-100 text-indigo-700'
      };
    }

    const todayAttendance = teacherAttendance.filter(a => new Date(a.timestamp).toDateString() === todayStr);
    const hasIn = todayAttendance.some(a => a.type === 'IN');
    const hasOut = todayAttendance.some(a => a.type === 'OUT');

    if (hasIn && hasOut) {
      return { label: 'Sudah Pulang', color: 'bg-blue-100 text-blue-700' };
    }
    if (hasIn) {
      return { label: 'Di Sekolah', color: 'bg-emerald-100 text-emerald-700' };
    }
    
    // Check if it's weekend
    const day = today.getDay();
    if (day === 0 || day === 6) {
      return { label: 'Libur Akhir Pekan', color: 'bg-slate-100 text-slate-400' };
    }

    return { label: 'Tidak Hadir', color: 'bg-rose-100 text-rose-700' };
  };

  const currentStatus = getTeacherStatus();

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex justify-end">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        />
        
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
              <div className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center shadow-lg overflow-hidden shrink-0">
                {teacher.avatar ? (
                  <img src={teacher.avatar} alt={teacher.nama} className="w-full h-full object-cover" />
                ) : (
                  <User size={24} />
                )}
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight truncate">{teacher.nama}</h3>
                {teacher.role === 'GURU' && (
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">
                    {teacher.jabatan || 'Guru Kelas'} {teacher.kelas ? `• ${teacher.kelas}` : ''}
                  </p>
                )}
                <div className="flex items-center space-x-2 mt-0.5">
                  <div className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${currentStatus.color}`}>
                    {currentStatus.label}
                  </div>
                  <div className="flex items-center space-x-1 px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 text-[8px] font-black uppercase tracking-widest">
                    <Star size={8} className="fill-amber-700" />
                    <span>{teacher.totalPoints} Poin</span>
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
            <div className="grid grid-cols-2 gap-3">
               <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm">
                  <div className="text-[8px] font-black text-slate-400 uppercase tracking-[0.15em] mb-2">Administrasi</div>
                  <div className="flex items-end justify-between mb-2">
                    <span className="text-2xl font-black text-slate-900 leading-none">{teacher.docCompletion}%</span>
                    <span className="text-[9px] font-bold text-slate-400">Selesai</span>
                  </div>
                  <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                     <div className="h-full bg-slate-900 rounded-full" style={{ width: `${teacher.docCompletion}%` }} />
                  </div>
               </div>
               <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="text-[8px] font-black text-slate-400 uppercase tracking-[0.15em] mb-1">Menunggu Validasi</div>
                    <div className="text-2xl font-black text-slate-900">{teacher.pendingDocs}</div>
                  </div>
                  <div className="flex items-center text-[8px] font-black text-amber-600 bg-amber-50 self-start px-2 py-0.5 rounded-full mt-2 tracking-widest uppercase italic">Butuh Perhatian</div>
               </div>
            </div>

            {/* Attendance Analytics */}
            <section className="space-y-4">
              <div className="flex items-center justify-between px-2">
                <h4 className="text-[10px] font-black text-slate-800 uppercase tracking-[0.2em] flex items-center">
                  <PieChart className="mr-2 text-indigo-500" size={14} />
                  Kuantitas Kehadiran
                </h4>
                <div className="h-px bg-slate-200 flex-1 mx-4" />
              </div>
              <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-1 overflow-hidden">
                <GuruAttendanceChart 
                  selectedMonth={selectedMonth}
                  setSelectedMonth={setSelectedMonth}
                  chartData={chartData}
                />
              </div>
            </section>

            {/* Activities */}
            <div className="grid grid-cols-1 gap-6">
              {/* Last Activity */}
              <section className="space-y-4">
                <h4 className="text-[10px] font-black text-slate-800 uppercase tracking-[0.2em] flex items-center px-2">
                  <Clock className="mr-2 text-slate-400" size={14} />
                  Log Terbaru
                </h4>
                <div className="bg-white border border-slate-100 rounded-[2rem] overflow-hidden shadow-sm">
                  <div className="divide-y divide-slate-50">
                    {sortedAttendance.slice(0, 3).map((att, i) => (
                      <div key={i} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                        <div className="flex items-center space-x-3">
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${att.type === 'IN' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                            {att.type === 'IN' ? <CheckCircle2 size={14} /> : <Clock size={14} />}
                          </div>
                          <div>
                            <div className="text-[11px] font-black text-slate-800">{new Date(att.timestamp).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</div>
                            <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{att.type === 'IN' ? 'IN' : 'OUT'} • {new Date(att.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                          </div>
                        </div>
                        {att.isManual && <span className="px-1.5 py-0.5 rounded bg-amber-50 text-amber-600 text-[8px] font-black uppercase tracking-tighter shadow-sm border border-amber-100">REV</span>}
                      </div>
                    ))}
                    {sortedAttendance.length === 0 && (
                      <div className="p-8 text-center text-slate-300 font-bold italic text-[10px]">Belum ada aktivitas presensi</div>
                    )}
                  </div>
                </div>
              </section>

              {/* Top Docs */}
              <section className="space-y-4 pb-4">
                <h4 className="text-[10px] font-black text-slate-800 uppercase tracking-[0.2em] flex items-center px-2">
                  <FileText className="mr-2 text-slate-400" size={14} />
                  Dokumen Utama
                </h4>
                <div className="bg-white border border-slate-100 rounded-[2rem] overflow-hidden shadow-sm">
                   <div className="divide-y divide-slate-50">
                      {sortedDocs.slice(0, 3).map((doc, i) => (
                        <div 
                          key={i} 
                          onClick={() => doc.status === 'APPROVED' && onSelectDoc(doc)}
                          className={`p-4 flex items-center justify-between transition-colors ${doc.status === 'APPROVED' ? 'hover:bg-slate-50 cursor-pointer group' : ''}`}
                        >
                          <div className="flex items-center space-x-3 shrink-0 min-w-0">
                            <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${doc.status === 'APPROVED' ? 'bg-blue-50 text-blue-600' : doc.status === 'PENDING' ? 'bg-amber-50 text-amber-600' : 'bg-rose-50 text-rose-600'}`}>
                              <FileText size={14} />
                            </div>
                            <div className="min-w-0">
                              <div className="text-[11px] font-black text-slate-800 truncate">{doc.fileName}</div>
                              <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest truncate">{doc.type.split('_')[0]}</div>
                            </div>
                          </div>
                          <div className="text-right shrink-0 ml-2">
                             <div className={`px-1.5 py-0.5 rounded-md text-[7px] font-black uppercase tracking-widest ${
                                doc.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-600' : doc.status === 'PENDING' ? 'bg-amber-50 text-amber-600' : 'bg-rose-50 text-rose-600'
                             }`}>
                                {doc.status}
                             </div>
                          </div>
                        </div>
                      ))}
                      {sortedDocs.length === 0 && (
                        <div className="p-8 text-center text-slate-300 font-bold italic text-[10px]">Belum ada data dokumen</div>
                      )}
                   </div>
                </div>
              </section>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
