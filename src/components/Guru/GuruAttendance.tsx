import React, { useState, useEffect } from 'react';
import { 
  Fingerprint, 
  MapPin, 
  LogIn, 
  LogOut, 
  FileClock,
  Clock,
  Edit3,
  CheckCircle2,
  AlertCircle,
  X,
  History,
  School,
  Calendar
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Attendance, Permission, SchoolInfo } from '../../types';
import { useNotifications } from '../../context/NotificationContext';
import { getHolidayName } from '../../utils/holidayHelper';
import { KSSchoolHolidays } from '../KepalaSekolah/modules/KSSchoolHolidays';

interface GuruAttendanceProps {
  user: any;
  attendance: Attendance[];
  setAttendance: (attendance: Attendance[] | ((prev: Attendance[]) => Attendance[])) => void;
  permissions: Permission[];
  schools: SchoolInfo[];
}

export function GuruAttendance({ user, attendance, setAttendance, permissions, schools }: GuruAttendanceProps) {
  const { showToast } = useNotifications();
  const [activeView, setActiveView] = useState<'DAILY' | 'LOG' | 'HOLIDAY'>('DAILY');
  const [locating, setLocating] = useState(false);
  const [coords, setCoords] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // Repair Modal State
  const [showRepairModal, setShowRepairModal] = useState(false);
  const [repairDate, setRepairDate] = useState('');
  const [repairTimeIn, setRepairTimeIn] = useState('07:00');
  const [repairTimeOut, setRepairTimeOut] = useState('14:00');
  const [repairCheckIn, setRepairCheckIn] = useState(false);
  const [repairCheckOut, setRepairCheckOut] = useState(false);
  const [repairReason, setRepairReason] = useState('');
  const [originalData, setOriginalData] = useState<{in?: Attendance, out?: Attendance}>({});

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setCoords(`${pos.coords.latitude.toFixed(6)}, ${pos.coords.longitude.toFixed(6)}`);
      }, () => setCoords("-6.4021, 107.4589"));
    }
  }, []);

  const todayStr = currentTime.toISOString().split('T')[0];
  const userAttendance = attendance.filter(a => a.userId === user.id);
  
  const getAttendanceForDay = (dateStr: string) => {
    const dayLogs = userAttendance.filter(a => a.timestamp.includes(dateStr));
    const inLog = dayLogs.find(l => l.type === 'IN');
    const outLog = dayLogs.find(l => l.type === 'OUT');
    return { inLog, outLog };
  };

  const { inLog: todayIn, outLog: todayOut } = getAttendanceForDay(todayStr);

  const canEdit = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const targetMonth = date.getMonth();
    const targetYear = date.getFullYear();
    const monthDiff = (currentYear - targetYear) * 12 + (currentMonth - targetMonth);
    return monthDiff <= 1;
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371e3; // metres
    const φ1 = lat1 * Math.PI/180;
    const φ2 = lat2 * Math.PI/180;
    const Δφ = (lat2-lat1) * Math.PI/180;
    const Δλ = (lon2-lon1) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c; // in metres
  };

  const resolveLocationName = (lat: number, lng: number) => {
    // Check all registered schools
    for (const school of schools) {
      if (school.lat && school.lng) {
        const dist = calculateDistance(lat, lng, school.lat, school.lng);
        if (dist <= (school.radius || 200)) {
          return school.name;
        }
      }
    }
    return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
  };

  const handleAttendance = (type: 'IN' | 'OUT') => {
    setLocating(true);
    
    const recordAttendance = (latitude: number, longitude: number) => {
      const timestamp = new Date().toISOString();
      const locationLabel = resolveLocationName(latitude, longitude);
      
      // Check if it's the user's specifically assigned school
      const userSchool = schools.find(s => s.id === user.schoolId);
      let isAtHomeSchool = false;
      if (userSchool && userSchool.lat && userSchool.lng) {
        const dist = calculateDistance(latitude, longitude, userSchool.lat, userSchool.lng);
        if (dist <= (userSchool.radius || 200)) {
          isAtHomeSchool = true;
        }
      }

      const newLog: Attendance = {
        id: Date.now().toString(),
        userId: user.id,
        schoolId: user.schoolId,
        timestamp,
        type,
        location: locationLabel,
        isAtSchool: isAtHomeSchool
      };
      
      setAttendance(prev => [...prev, newLog]);
      setLocating(false);
      showToast(`Berhasil Presensi ${type === 'IN' ? 'Masuk' : 'Pulang'}! ${isAtHomeSchool ? ' (Sesuai Unit Kerja)' : ` (${locationLabel})`}`, 'success');
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => recordAttendance(pos.coords.latitude, pos.coords.longitude),
        () => {
          // Fallback to default/manual if failed
          recordAttendance(-6.4021, 107.4589);
          showToast('Gagal mendapatkan lokasi akurat, menggunakan default wilayah.', 'info');
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    } else {
      recordAttendance(-6.4021, 107.4589);
      setLocating(false);
    }
  };

  const openRepair = (dateStr: string) => {
    const { inLog, outLog } = getAttendanceForDay(dateStr);
    setRepairDate(dateStr);
    setOriginalData({ in: inLog, out: outLog });
    
    // Pre-fill with existing time or defaults
    if (inLog) {
      setRepairTimeIn(new Date(inLog.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }));
    } else {
      setRepairTimeIn('07:00');
    }
    
    if (outLog) {
      setRepairTimeOut(new Date(outLog.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }));
    } else {
      setRepairTimeOut('14:00');
    }

    setRepairCheckIn(false);
    setRepairCheckOut(false);
    setShowRepairModal(true);
  };

  const handleRepairSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!repairReason) return showToast('Alasan perbaikan wajib diisi', 'error');
    if (!repairCheckIn && !repairCheckOut) return showToast('Pilih bagian yang ingin diperbaiki (Masuk/Pulang)', 'error');

    const newEntries: Attendance[] = [];
    const baseId = Date.now();

    if (repairCheckIn) {
      newEntries.push({
        id: (baseId).toString(),
        userId: user.id,
        schoolId: user.schoolId,
        timestamp: `${repairDate}T${repairTimeIn}:00Z`,
        type: 'IN',
        location: 'Perbaikan Manual',
        isManual: true,
        status: 'PENDING',
        reason: repairReason
      });
    }

    if (repairCheckOut) {
      newEntries.push({
        id: (baseId + 1).toString(),
        userId: user.id,
        schoolId: user.schoolId,
        timestamp: `${repairDate}T${repairTimeOut}:00Z`,
        type: 'OUT',
        location: 'Perbaikan Manual',
        isManual: true,
        status: 'PENDING',
        reason: repairReason
      });
    }

    setAttendance(prev => [...prev, ...newEntries]);
    showToast('Pengajuan perbaikan dikirim. Menunggu persetujuan Kepala Sekolah.', 'info');
    setShowRepairModal(false);
    setRepairReason('');
  };

  const getStatusDisplay = (dateStr: string) => {
    const dayDate = new Date(dateStr);
    const dayOfWeek = dayDate.getDay();

    // Permission Check First (if approved)
    const dayDateStart = new Date(dayDate.getFullYear(), dayDate.getMonth(), dayDate.getDate());
    
    const approvedPermission = permissions.find(p => {
      if (p.userId !== user.id || p.status !== 'APPROVED') return false;
      const pStart = new Date(p.startDate);
      const pEnd = new Date(p.endDate);
      const dStart = new Date(pStart.getFullYear(), pStart.getMonth(), pStart.getDate());
      const dEnd = new Date(pEnd.getFullYear(), pEnd.getMonth(), pEnd.getDate());
      return dayDateStart >= dStart && dayDateStart <= dEnd;
    });

    if (approvedPermission) {
      const label = approvedPermission.type === 'DINAS_LUAR' ? 'Dinas Luar' : 
                    approvedPermission.type === 'IZIN' ? 'Izin' : 'Cuti';
      return { label, color: 'text-blue-600', icon: <FileClock size={14} /> };
    }

    // Weekend & National Holiday Check
    const holidayName = getHolidayName(dayDate, user.schoolId);
    if (dayOfWeek === 0 || dayOfWeek === 6 || holidayName) {
      return { label: holidayName || 'Hari Libur', color: 'text-slate-400', icon: <Clock size={14} /> };
    }

    const { inLog, outLog } = getAttendanceForDay(dateStr);
    
    // Check if there are pending manual repairs
    const hasPending = (inLog?.isManual && inLog.status === 'PENDING') || (outLog?.isManual && outLog.status === 'PENDING');
    
    if (hasPending) {
      return { label: 'Menunggu Persetujuan', color: 'text-amber-500', icon: <Clock size={14} /> };
    }

    // Attendance Log Evaluation
    if (inLog && outLog) {
      // Check if both are effective (either normal or approved manual)
      const inEffective = !inLog.isManual || inLog.status === 'APPROVED';
      const outEffective = !outLog.isManual || outLog.status === 'APPROVED';

      if (inEffective && outEffective) {
        const bothNormal = !inLog.isManual && !outLog.isManual;
        return { 
          label: bothNormal ? 'Hadir' : 'Hadir (Perbaikan)', 
          color: 'text-emerald-600', 
          icon: <CheckCircle2 size={14} /> 
        };
      }
      
      // If one part is pending or rejected
      return { label: 'Hadir (Belum Sah)', color: 'text-amber-600', icon: <AlertCircle size={14} /> };
    }
    
    // If only one exists
    if (inLog && !outLog) return { label: 'Tidak Keluar', color: 'text-amber-600', icon: <AlertCircle size={14} /> };
    if (!inLog && outLog) return { label: 'Tidak Masuk', color: 'text-rose-500', icon: <AlertCircle size={14} /> };
    
    return { label: 'Tidak Hadir', color: 'text-rose-500', icon: <X size={14} /> };
  };

  // Generate days for history
  const getDaysInMonth = (month: number, year: number) => {
    const days = [];
    // Use manual date construction to avoid UTC shift issues
    const now = new Date();
    const endOfMonth = new Date(year, month + 1, 0).getDate();
    
    const currentMonthToday = now.getMonth();
    const currentYearToday = now.getFullYear();
    const isCurrentMonth = month === currentMonthToday && year === currentYearToday;
    
    const maxDay = isCurrentMonth ? now.getDate() : endOfMonth;

    for (let d = 1; d <= maxDay; d++) {
      const yearStr = year.toString();
      const monthStr = (month + 1).toString().padStart(2, '0');
      const dayStr = d.toString().padStart(2, '0');
      days.push(`${yearStr}-${monthStr}-${dayStr}`);
    }
    
    return days.reverse();
  };

  const historyDays = getDaysInMonth(selectedMonth, selectedYear);
  const MONTHS = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header Tabs */}
      <div className="flex bg-white p-2 rounded-2xl border border-slate-100 shadow-sm w-fit mx-auto md:mx-0 flex-wrap gap-y-2">
         <button onClick={() => setActiveView('DAILY')} className={`flex items-center space-x-2 px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${activeView === 'DAILY' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}>
           <Clock size={14} />
           <span>Kehadiran Harian</span>
         </button>
         <button onClick={() => setActiveView('LOG')} className={`flex items-center space-x-2 px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${activeView === 'LOG' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}>
           <History size={14} />
           <span>Riwayat</span>
         </button>
         {user.role === 'KEPALA_SEKOLAH' && (
           <button onClick={() => setActiveView('HOLIDAY')} className={`flex items-center space-x-2 px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${activeView === 'HOLIDAY' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}>
             <Calendar size={14} />
             <span>Kelola Kalender Pendidikan</span>
           </button>
         )}
      </div>

      {activeView === 'DAILY' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
           {/* Real-time Clock Card */}
           <div className="lg:col-span-12 bg-slate-900 rounded-[3rem] p-10 text-white relative overflow-hidden shadow-2xl">
              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                 <div>
                    <h2 className="text-4xl font-black tracking-tight mb-2">
                       {currentTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </h2>
                    <p className="text-slate-400 font-bold uppercase tracking-[0.3em] text-[10px]">
                       {currentTime.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                 </div>
                 <div className="flex bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 space-x-6">
                    <div className="text-center">
                       <p className="text-[8px] font-black uppercase tracking-widest text-slate-400 mb-1">Presensi Masuk</p>
                       <p className={`text-sm font-black ${todayIn ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {todayIn ? new Date(todayIn.timestamp).toLocaleTimeString('id-ID', { hour:'2-digit', minute:'2-digit' }) : '--:--'}
                       </p>
                    </div>
                    <div className="w-px bg-white/10"></div>
                    <div className="text-center">
                       <p className="text-[8px] font-black uppercase tracking-widest text-slate-400 mb-1">Presensi Pulang</p>
                       <p className={`text-sm font-black ${todayOut ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {todayOut ? new Date(todayOut.timestamp).toLocaleTimeString('id-ID', { hour:'2-digit', minute:'2-digit' }) : '--:--'}
                       </p>
                    </div>
                 </div>
              </div>
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/20 blur-[100px] -mr-32 -mt-32 rounded-full"></div>
           </div>

           {/* Presensi Action Card */}
           <div className="lg:col-span-12">
              <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-xl font-black text-slate-800 flex items-center space-x-3 tracking-tighter">
                    <Fingerprint size={24} className="text-blue-600" />
                    <span>Panel Presensi Mandiri</span>
                  </h3>
                  <div className="flex items-center space-x-2 px-3 py-1 bg-blue-50 text-[10px] font-black text-blue-600 rounded-full uppercase tracking-widest border border-blue-100">
                     <MapPin size={12} />
                     <span>Area Terverifikasi</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <button
                    onClick={() => handleAttendance('IN')}
                    disabled={locating || !!todayIn}
                    className={`group relative flex flex-col items-start justify-center p-12 rounded-[3.5rem] border-2 transition-all overflow-hidden ${
                      todayIn ? 'bg-slate-50 border-slate-100 text-slate-300' : 'bg-white border-emerald-100 text-emerald-700 hover:border-emerald-500 hover:shadow-2xl hover:shadow-emerald-500/10 active:scale-95'
                    }`}
                  >
                    <div className={`absolute -right-6 -bottom-10 opacity-[0.05] transition-all duration-700 pointer-events-none ${todayIn ? 'text-slate-200' : 'text-emerald-500 group-hover:scale-110 group-hover:rotate-12 group-hover:opacity-10'}`}>
                       <LogIn size={200} strokeWidth={1} />
                    </div>
                    <span className="font-black text-3xl tracking-tighter relative z-10 uppercase">Hadir</span>
                    <span className="text-[10px] uppercase font-black tracking-[0.2em] mt-2 opacity-60 relative z-10">
                       {todayIn ? `Terverifikasi @ ${new Date(todayIn.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}` : "Klik Presensi Datang"}
                    </span>
                  </button>

                  <button
                    onClick={() => handleAttendance('OUT')}
                    disabled={locating || !todayIn || !!todayOut}
                    className={`group relative flex flex-col items-start justify-center p-12 rounded-[3.5rem] border-2 transition-all overflow-hidden ${
                      !todayIn || !!todayOut ? 'bg-slate-50 border-slate-100 text-slate-300' : 'bg-white border-rose-100 text-rose-700 hover:border-rose-500 hover:shadow-2xl hover:shadow-rose-500/10 active:scale-95'
                    }`}
                  >
                    <div className={`absolute -right-6 -bottom-10 opacity-[0.05] transition-all duration-700 pointer-events-none ${!todayIn || !!todayOut ? 'text-slate-200' : 'text-rose-500 group-hover:scale-110 group-hover:rotate-12 group-hover:opacity-10'}`}>
                       <LogOut size={200} strokeWidth={1} />
                    </div>
                    <span className="font-black text-3xl tracking-tighter relative z-10 uppercase">Pulang</span>
                    <span className="text-[10px] uppercase font-black tracking-[0.2em] mt-2 opacity-60 relative z-10">
                       {todayOut ? `Terverifikasi @ ${new Date(todayOut.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}` : "Klik Presensi Pulang"}
                    </span>
                  </button>
                </div>
              </div>
           </div>
        </div>
      )}

      {activeView === 'LOG' && (
        <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden">
           <div className="p-10 border-b border-slate-100 bg-slate-50/30 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                 <h4 className="text-xl font-black text-slate-800 tracking-tight">Riwayat Presensi Harian</h4>
                 <p className="text-xs text-slate-400 font-medium mt-1">Data aktivitas presensi kamu</p>
              </div>
              <div className="flex items-center space-x-3 bg-white p-2 rounded-2xl border border-slate-100 shadow-sm">
                 <select 
                   value={selectedMonth}
                   onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                   className="text-[10px] font-black uppercase tracking-widest bg-transparent outline-none cursor-pointer"
                 >
                   {MONTHS.map((m, i) => <option key={m} value={i}>{m}</option>)}
                 </select>
                 <div className="w-px h-4 bg-slate-200"></div>
                 <select 
                   value={selectedYear}
                   onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                   className="text-[10px] font-black uppercase tracking-widest bg-transparent outline-none cursor-pointer"
                 >
                   {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
                 </select>
              </div>
           </div>
           
           <div className="overflow-x-auto hidden md:block">
              <table className="w-full text-left min-w-[800px]">
                 <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100">
                    <tr>
                       <th className="px-10 py-6">Tanggal</th>
                       <th className="px-10 py-6">Jam Masuk</th>
                       <th className="px-10 py-6">Jam Keluar</th>
                       <th className="px-10 py-6">Lokasi</th>
                       <th className="px-10 py-6">Status Harian</th>
                       <th className="px-10 py-6 text-right">Aksi</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-50">
                    {historyDays.map((dateStr) => {
                      const { inLog, outLog } = getAttendanceForDay(dateStr);
                      const status = getStatusDisplay(dateStr);
                      
                      return (
                        <tr key={dateStr} className="hover:bg-slate-50/80 transition-colors group">
                           <td className="px-10 py-6">
                              <div className="font-black text-slate-800 text-sm tracking-tight">
                                 {new Date(dateStr).toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' })}
                              </div>
                           </td>
                           <td className="px-10 py-6">
                              {inLog ? (
                                <div className="flex flex-col">
                                   <span className="text-xs font-black text-slate-700">{new Date(inLog.timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
                                   <span className={`text-[8px] font-black uppercase tracking-widest ${inLog.isManual ? (inLog.status === 'APPROVED' ? 'text-emerald-500' : 'text-amber-500') : 'text-slate-400'}`}>
                                      <div className="flex items-center space-x-1">
                                         <span>{inLog.isManual ? (inLog.status === 'APPROVED' ? 'Hadir (Perbaikan)' : 'Menunggu Persetujuan') : 'Hadir'}</span>
                                      </div>
                                   </span>
                                </div>
                              ) : <span className="text-slate-300 text-xs font-black">--:--</span>}
                           </td>
                           <td className="px-10 py-6">
                              {outLog ? (
                                <div className="flex flex-col">
                                   <span className="text-xs font-black text-slate-700">{new Date(outLog.timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
                                   <span className={`text-[8px] font-black uppercase tracking-widest ${outLog.isManual ? (outLog.status === 'APPROVED' ? 'text-emerald-500' : 'text-amber-500') : 'text-slate-400'}`}>
                                      <div className="flex items-center space-x-1">
                                         <span>{outLog.isManual ? (outLog.status === 'APPROVED' ? 'Hadir (Perbaikan)' : 'Menunggu Persetujuan') : 'Hadir'}</span>
                                      </div>
                                   </span>
                                </div>
                              ) : <span className="text-slate-300 text-xs font-black">--:--</span>}
                           </td>
                           <td className="px-10 py-6">
                               <div className="flex flex-col">
                                  <div className="flex items-center space-x-2">
                                     <MapPin size={12} className="text-slate-400" />
                                     <span className="text-xs font-black text-slate-700 tracking-tight">
                                        {inLog?.location || outLog?.location || 'Tidak Terdeteksi'}
                                     </span>
                                  </div>
                                  {(inLog?.isAtSchool || outLog?.isAtSchool) && (
                                     <span className="text-[8px] font-black text-blue-500 uppercase tracking-widest mt-1 ml-5">Sesuai Unit Kerja</span>
                                  )}
                               </div>
                           </td>
                           <td className="px-10 py-6">
                              <div className={`flex items-center space-x-2 text-[10px] font-black uppercase tracking-widest ${status.color}`}>
                                 {status.icon}
                                 <span>{status.label}</span>
                              </div>
                           </td>
                           <td className="px-10 py-6 text-right">
                              {canEdit(dateStr) ? (
                                <button 
                                  onClick={() => openRepair(dateStr)}
                                  className="p-3 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-blue-600 hover:border-blue-200 hover:shadow-lg transition-all"
                                  title="Perbaikan Data"
                                >
                                   <Edit3 size={18} />
                                </button>
                              ) : (
                                <div className="p-3 text-slate-300 cursor-not-allowed" title="Batas waktu perbaikan berakhir">
                                  <AlertCircle size={18} />
                                </div>
                              )}
                           </td>
                        </tr>
                      );
                    })}
                 </tbody>
              </table>
           </div>

           {/* Mobile View: Cards */}
           <div className="md:hidden divide-y divide-slate-100">
              {historyDays.map((dateStr) => {
                const { inLog, outLog } = getAttendanceForDay(dateStr);
                const status = getStatusDisplay(dateStr);
                return (
                  <div key={dateStr} className="p-6 space-y-4">
                    <div className="flex justify-between items-start">
                       <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{new Date(dateStr).toLocaleDateString('id-ID', { weekday: 'long' })}</p>
                          <h5 className="font-black text-slate-800">{new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</h5>
                       </div>
                       {canEdit(dateStr) ? (
                          <button 
                            onClick={() => openRepair(dateStr)}
                            className="p-3 bg-slate-50 text-blue-600 rounded-2xl active:scale-95 transition-all"
                          >
                             <Edit3 size={18} />
                          </button>
                       ) : (
                          <div className="p-3 text-slate-200">
                             <AlertCircle size={18} />
                          </div>
                       )}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                       <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col">
                          <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Masuk</p>
                          <p className="text-xs font-black text-slate-700">{inLog ? new Date(inLog.timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) : '--:--'}</p>
                          {inLog && (
                            <span className={`text-[7px] font-black uppercase tracking-widest mt-1 ${inLog.isManual ? (inLog.status === 'APPROVED' ? 'text-emerald-500' : 'text-amber-500') : 'text-slate-400'}`}>
                              <div className="flex items-center space-x-1">
                                <span>{inLog.isManual ? (inLog.status === 'APPROVED' ? 'Hadir (Perbaikan)' : 'Menunggu Persetujuan') : 'Hadir'}</span>
                              </div>
                            </span>
                          )}
                       </div>
                       <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col">
                          <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Pulang</p>
                          <p className="text-xs font-black text-slate-700">{outLog ? new Date(outLog.timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) : '--:--'}</p>
                          {outLog && (
                            <span className={`text-[7px] font-black uppercase tracking-widest mt-1 ${outLog.isManual ? (outLog.status === 'APPROVED' ? 'text-emerald-500' : 'text-amber-500') : 'text-slate-400'}`}>
                              <div className="flex items-center space-x-1">
                                <span>{outLog.isManual ? (outLog.status === 'APPROVED' ? 'Hadir (Perbaikan)' : 'Menunggu Persetujuan') : 'Hadir'}</span>
                              </div>
                            </span>
                          )}
                       </div>
                    </div>

                    <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100 flex items-center space-x-3">
                       <MapPin size={14} className="text-blue-600" />
                       <div>
                          <p className="text-[8px] font-black text-blue-400 uppercase tracking-widest">Titik Lokasi Presensi</p>
                          <p className="text-[10px] font-black text-blue-700">{inLog?.location || outLog?.location || 'Lokasi tidak terekam'}</p>
                       </div>
                    </div>
                    
                    <div className={`flex items-center space-x-2 text-[10px] font-black uppercase tracking-widest ${status.color}`}>
                       {status.icon}
                       <span>{status.label}</span>
                    </div>
                  </div>
                );
              })}
           </div>
        </div>
      )}

      {/* Repair Modal */}
      {showRepairModal && (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
           <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowRepairModal(false)}></div>
           <div className="relative bg-white w-full max-w-xl max-h-[90vh] rounded-[3rem] shadow-2xl overflow-hidden border border-slate-100 flex flex-col">
              <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50 shrink-0">
                 <div>
                    <h3 className="text-xl font-black text-slate-800 tracking-tight">Perbaikan Kehadiran/Kepulangan</h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Tanggal: {new Date(repairDate).toLocaleDateString('id-ID', { dateStyle: 'full' })}</p>
                 </div>
                 <button onClick={() => setShowRepairModal(false)} className="p-2 text-slate-400 hover:text-rose-500 transition-colors">
                    <X size={24} />
                 </button>
              </div>
              
              <div className="flex-1 overflow-y-auto">
                <form onSubmit={handleRepairSubmit} className="p-10 space-y-6">
                   {/* Preview Existing */}
                   <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className={`p-4 rounded-2xl border ${originalData.in ? 'bg-emerald-50/30 border-emerald-100' : 'bg-rose-50/30 border-rose-100'}`}>
                         <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Eksisting Masuk</p>
                         <p className={`text-xs font-black ${originalData.in ? 'text-emerald-700' : 'text-rose-600'}`}>
                            {originalData.in ? new Date(originalData.in.timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) : 'Tidak Masuk'}
                         </p>
                      </div>
                      <div className={`p-4 rounded-2xl border ${originalData.out ? 'bg-emerald-50/30 border-emerald-100' : 'bg-rose-50/30 border-rose-100'}`}>
                         <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Eksisting Pulang</p>
                         <p className={`text-xs font-black ${originalData.out ? 'text-emerald-700' : 'text-rose-600'}`}>
                            {originalData.out ? new Date(originalData.out.timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) : 'Tidak Keluar'}
                         </p>
                      </div>
                   </div>

                   <div className="space-y-6">
                      <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 space-y-4">
                         <label className="flex items-center space-x-3 cursor-pointer group">
                            <input 
                              type="checkbox" 
                              id="repairIn"
                              checked={repairCheckIn} 
                              onChange={(e) => setRepairCheckIn(e.target.checked)}
                              className="w-5 h-5 rounded-lg border-slate-300 text-blue-600 focus:ring-blue-500 transition-all cursor-pointer"
                            />
                            <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest group-hover:text-blue-600">Perbaiki Jam Masuk</span>
                         </label>
                         <AnimatePresence>
                           {repairCheckIn && (
                              <motion.div 
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden"
                              >
                                 <input 
                                  type="time" 
                                  value={repairTimeIn} 
                                  onChange={(e) => setRepairTimeIn(e.target.value)}
                                  className="w-full px-6 py-4 bg-white border border-slate-200 rounded-2xl text-xs font-black outline-none focus:ring-4 focus:ring-blue-100" 
                                 />
                              </motion.div>
                           )}
                         </AnimatePresence>
                      </div>

                      <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 space-y-4">
                         <label className="flex items-center space-x-3 cursor-pointer group">
                            <input 
                              type="checkbox" 
                              id="repairOut"
                              checked={repairCheckOut} 
                              onChange={(e) => setRepairCheckOut(e.target.checked)}
                              className="w-5 h-5 rounded-lg border-slate-300 text-blue-600 focus:ring-blue-500 transition-all cursor-pointer"
                            />
                            <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest group-hover:text-blue-600">Perbaiki Jam Pulang</span>
                         </label>
                         <AnimatePresence>
                           {repairCheckOut && (
                              <motion.div 
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden"
                              >
                                 <input 
                                  type="time" 
                                  value={repairTimeOut} 
                                  onChange={(e) => setRepairTimeOut(e.target.value)}
                                  className="w-full px-6 py-4 bg-white border border-slate-200 rounded-2xl text-xs font-black outline-none focus:ring-4 focus:ring-blue-100" 
                                 />
                              </motion.div>
                           )}
                         </AnimatePresence>
                      </div>
                   </div>

                   <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Deskripsi Permohonan</label>
                      <textarea 
                        value={repairReason}
                        onChange={(e) => setRepairReason(e.target.value)}
                        rows={3} 
                        className="w-full px-6 py-5 bg-slate-50 border border-slate-100 rounded-3xl text-sm font-medium focus:ring-4 focus:ring-blue-100 outline-none" 
                        placeholder="Contoh: Terkendala sinyal saat submit di lokasi..."
                      />
                   </div>

                   <button type="submit" className="w-full py-6 bg-slate-900 text-white rounded-3xl font-black uppercase tracking-widest text-xs hover:bg-blue-600 transition-all shadow-xl shadow-slate-900/10 active:scale-95">
                      Ajukan Perbaikan
                   </button>
                </form>
              </div>
           </div>
        </div>
      )}

      {activeView === 'HOLIDAY' && user.role === 'KEPALA_SEKOLAH' && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }} 
          animate={{ opacity: 1, y: 0 }}
          className="w-full"
        >
          <KSSchoolHolidays schoolId={user.schoolId || ''} />
        </motion.div>
      )}
    </div>
  );
}

