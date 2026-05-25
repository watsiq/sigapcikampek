import React, { useState } from 'react';
import { 
  ChevronLeft, 
  LogIn, 
  LogOut 
} from 'lucide-react';
import { Permission } from '../../types';
import { getHolidayName } from '../../utils/holidayHelper';

interface AttendanceDetailViewProps {
  user: any;
  attendance: any[];
  permissions: Permission[];
  onBack: () => void;
}

export function AttendanceDetailView({ user, attendance, permissions, onBack }: AttendanceDetailViewProps) {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const months = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
  
  const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
  const calendarDays = [];

  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(selectedYear, selectedMonth, d);
    const dateStr = date.toISOString().split('T')[0];
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
    const holidayName = getHolidayName(date, user.schoolId);
    
    const logs = attendance.filter((a: any) => a.userId === user.id && a.timestamp.includes(dateStr));
    const clockIn = logs.find((l: any) => l.type === 'IN');
    const clockOut = logs.find((l: any) => l.type === 'OUT');
    
    const perm = permissions.find((p: any) => 
      p.status === 'APPROVED' && 
      new Date(p.startDate) <= date && 
      new Date(p.endDate) >= date
    );

    calendarDays.push({ date, dateStr, isWeekend, holidayName, clockIn, clockOut, perm });
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between mb-8 overflow-x-auto pb-2">
        <div className="flex items-center space-x-4 shrink-0">
           <button onClick={onBack} className="p-3 bg-white rounded-2xl border border-slate-100 text-slate-400 hover:text-slate-800 transition-colors shadow-sm">
              <ChevronLeft size={20} />
           </button>
           <div>
              <h2 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight">Track Kehadiran Mandiri</h2>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none mt-1">Detail harian & Riwayat kumulatif</p>
           </div>
        </div>
        <div className="flex space-x-3 shrink-0">
           <select 
              value={selectedMonth} 
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              className="px-4 py-2 bg-white border border-slate-100 rounded-xl text-[10px] font-black shadow-sm outline-none uppercase tracking-widest"
           >
              {months.map((m, i) => <option key={m} value={i}>{m}</option>)}
           </select>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
         <div className="overflow-x-auto">
            <table className="w-full text-left">
               <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                  <tr>
                     <th className="px-8 py-6">Hari & Tanggal</th>
                     <th className="px-8 py-6 text-center">Masuk / Pulang</th>
                     <th className="px-8 py-6 text-center">Status Kehadiran</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-50">
                  {calendarDays.sort((a,b) => b.date.getTime() - a.date.getTime()).map((day: any) => (
                    <tr key={day.dateStr} className={`group hover:bg-slate-50/50 transition-colors ${(day.isWeekend || day.holidayName) ? 'bg-slate-50/20' : ''}`}>
                       <td className="px-8 py-6">
                          <div className={`font-black text-sm tracking-tight ${(day.isWeekend || day.holidayName) ? 'text-slate-400' : 'text-slate-800'}`}>
                             {day.date.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })}
                          </div>
                          {day.holidayName && <span className="text-[9px] text-amber-600 font-bold uppercase tracking-widest">{day.holidayName}</span>}
                          {!day.holidayName && day.isWeekend && <span className="text-[9px] text-slate-300 font-bold uppercase tracking-widest">Akhir Pekan</span>}
                       </td>
                       <td className="px-8 py-6">
                          <div className="flex items-center justify-center space-x-6 text-xs font-bold text-slate-500">
                             <div className="flex items-center space-x-2">
                                <LogIn size={14} className={day.clockIn ? 'text-emerald-500' : 'text-slate-200'} />
                                <span>{day.clockIn ? new Date(day.clockIn.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '--:--'}</span>
                                {day.clockIn?.isManual && <span className="text-[8px] bg-amber-100 text-amber-700 px-1 rounded">M</span>}
                             </div>
                             <div className="w-4 h-px bg-slate-100" />
                             <div className="flex items-center space-x-2">
                                <LogOut size={14} className={day.clockOut ? 'text-rose-500' : 'text-slate-200'} />
                                <span>{day.clockOut ? new Date(day.clockOut.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '--:--'}</span>
                             </div>
                          </div>
                       </td>
                       <td className="px-8 py-6 text-center">
                          {day.perm ? (
                            <span className="px-4 py-1.5 bg-blue-600 text-white rounded-full text-[9px] font-black uppercase tracking-widest shadow-lg shadow-blue-600/20">
                               {day.perm.type}
                            </span>
                          ) : (day.clockIn ? (
                            <span className="px-4 py-1.5 bg-emerald-50 text-emerald-600 rounded-full text-[9px] font-black uppercase tracking-widest border border-emerald-100">
                               Hadir
                            </span>
                          ) : (day.holidayName ? (
                            <span className="px-4 py-1.5 bg-amber-50 text-amber-700 rounded-full text-[9px] font-black uppercase tracking-widest border border-amber-250">
                               {day.holidayName}
                            </span>
                          ) : (day.isWeekend ? (
                            <span className="text-[9px] text-slate-300 font-bold uppercase tracking-widest">Libur</span>
                          ) : (day.date < new Date() ? (
                            <span className="px-4 py-1.5 bg-rose-50 text-rose-600 rounded-full text-[9px] font-black uppercase tracking-widest border border-rose-100 italic">
                               Tidak Absen
                            </span>
                          ) : (
                            <span className="text-[9px] text-slate-200 font-bold uppercase tracking-widest">-</span>
                          )))))}
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
