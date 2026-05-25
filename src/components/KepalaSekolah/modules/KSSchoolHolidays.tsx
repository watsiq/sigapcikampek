import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Plus, 
  Trash2, 
  Info, 
  CalendarCheck, 
  Sparkles,
  AlertCircle,
  HelpCircle,
  Clock,
  ArrowRight
} from 'lucide-react';
import { 
  SchoolHoliday, 
  getCustomHolidays, 
  saveCustomHolidays, 
  INDONESIAN_HOLIDAYS 
} from '../../../utils/holidayHelper';
import { useNotifications } from '../../../context/NotificationContext';

interface KSSchoolHolidaysProps {
  schoolId: string;
}

export function KSSchoolHolidays({ schoolId }: KSSchoolHolidaysProps) {
  const { showToast } = useNotifications();
  const [customHolidays, setCustomHolidays] = useState<SchoolHoliday[]>([]);
  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const [type, setType] = useState<'LIBUR_SEMESTER' | 'CLASS_MEETING' | 'LIBUR_MENDESAK' | 'LAINNYA'>('LIBUR_SEMESTER');
  const [showNational, setShowNational] = useState(false);

  // Load custom holidays on mount or when schoolId changes
  useEffect(() => {
    setCustomHolidays(getCustomHolidays(schoolId));
  }, [schoolId]);

  const handleAddHoliday = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('Nama hari libur harus diisi', 'error');
      return;
    }
    if (!date) {
      showToast('Tanggal harus ditentukan', 'error');
      return;
    }

    // Check if duplicate date
    const allHolidays = getCustomHolidays();
    const isDuplicateDate = allHolidays.some(h => h.date === date && h.schoolId === schoolId);
    
    // Check if duplicate in national holidays
    const isNationalHoliday = INDONESIAN_HOLIDAYS.some(h => h.date === date);

    if (isDuplicateDate) {
      showToast('Tanggal tersebut sudah ditandai sebagai hari libur sekolah', 'error');
      return;
    }

    if (isNationalHoliday) {
      showToast('Tanggal tersebut sudah merupakan hari libur nasional (SKB 3 Menteri)', 'info');
    }

    const newHoliday: SchoolHoliday = {
      id: `sh-${Date.now()}`,
      schoolId,
      date,
      name,
      type
    };

    const updated = [...allHolidays, newHoliday];
    saveCustomHolidays(updated);
    setCustomHolidays(updated.filter(h => h.schoolId === schoolId));
    
    // Reset form
    setName('');
    setDate('');
    setType('LIBUR_SEMESTER');
    
    showToast(`Berhasil menambahkan hari libur "${name}"`, 'success');
  };

  const handleDeleteHoliday = (id: string, hlName: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus hari libur khusus: "${hlName}"?`)) {
      const allHolidays = getCustomHolidays();
      const updated = allHolidays.filter(h => h.id !== id);
      saveCustomHolidays(updated);
      setCustomHolidays(updated.filter(h => h.schoolId === schoolId));
      showToast(`Berhasil menghapus hari libur "${hlName}"`, 'success');
    }
  };

  // Helper translations and colors
  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'LIBUR_SEMESTER':
        return { label: 'Libur Semester', bg: 'bg-indigo-50/70 border-indigo-100/60 text-indigo-700' };
      case 'CLASS_MEETING':
        return { label: 'Class Meeting', bg: 'bg-emerald-50/70 border-emerald-100/60 text-emerald-700' };
      case 'LIBUR_MENDESAK':
        return { label: 'Sifat Mendesak', bg: 'bg-rose-50/70 border-rose-100/60 text-rose-700' };
      default:
        return { label: 'Lainnya', bg: 'bg-slate-50/70 border-slate-100/60 text-slate-700' };
    }
  };

  // Format date readable
  const formatReadableDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  };

  // Sort custom holidays by date
  const sortedHolidays = [...customHolidays].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Filter national holidays for current/next year
  const currentYear = new Date().getFullYear();
  const sortedNational = INDONESIAN_HOLIDAYS.filter(h => {
    const y = new Date(h.date).getFullYear();
    return y === currentYear || y === currentYear + 1;
  }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <div className="space-y-6">
      {/* Top micro summary alert - clean and slim */}
      <div className="bg-linear-to-r from-indigo-50/60 via-blue-50/40 to-slate-50/10 border border-indigo-100/50 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600 text-white p-2 rounded-xl">
            <Sparkles size={16} />
          </div>
          <div>
            <h4 className="font-bold text-slate-800 text-xs sm:text-sm">Sinkronisasi Pendidikan Otomatis</h4>
            <p className="text-slate-500 text-[11px] leading-snug">
              Kalender hari libur khusus ini langsung mengurangi batas hari efektif kerja guru untuk rekap presensi.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-indigo-700 bg-indigo-50 border border-indigo-100/80 px-3 py-1 rounded-full text-[10px] font-semibold w-fit self-start sm:self-center">
          <Clock size={12} />
          <span>Bebas Absensi (IN/OUT)</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Kolom Kiri (col-span-4): Form Tambah Hari Libur */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-xs">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-50 mb-4">
              <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
                <Calendar size={16} />
              </div>
              <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider">Tambah Libur Sekolah</h3>
            </div>

            <form onSubmit={handleAddHoliday} className="space-y-3.5">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Keterangan / Nama Hari Libur</label>
                <input 
                  type="text"
                  placeholder="Contoh: Libur Semester Ganjil"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="px-3.5 py-2 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 focus:outline-hidden text-xs bg-slate-50/30 transition-all font-medium text-slate-700 placeholder-slate-400"
                  required
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tanggal Libur</label>
                <input 
                  type="date"
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  className="px-3.5 py-2 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 focus:outline-hidden text-xs bg-slate-50/30 transition-all font-medium text-slate-700"
                  required
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Kategori Libur</label>
                <select
                  value={type}
                  onChange={e => setType(e.target.value as any)}
                  className="px-3.5 py-2 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 focus:outline-hidden text-xs bg-slate-50/30 transition-all font-medium text-slate-700 cursor-pointer"
                >
                  <option value="LIBUR_SEMESTER">Libur Semester</option>
                  <option value="CLASS_MEETING">Class Meeting</option>
                  <option value="LIBUR_MENDESAK">Libur Mendesak</option>
                  <option value="LAINNYA">Lainnya / Kegiatan Khusus</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-1.5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs uppercase tracking-widest transition-all shadow-xs cursor-pointer"
              >
                <Plus size={14} />
                <span>Simpan Hari Libur</span>
              </button>
            </form>

            {/* Micro alert for clean context inside the form card instead of a massive second standalone block */}
            <div className="mt-5 pt-4 border-t border-slate-100/80 flex gap-2.5 items-start text-[10.5px] text-slate-500 leading-relaxed">
              <Info size={14} className="text-slate-400 shrink-0 mt-0.5" />
              <span>Sistem otomatis menyusun rekap bulanan guru dengan mendeposisi jadwal aktif berlandaskan kalender di samping.</span>
            </div>
          </div>
        </div>

        {/* Kolom Kanan (col-span-8): Kalender Hari Libur */}
        <div className="lg:col-span-8">
          <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3.5 border-b border-slate-100 mb-4 gap-3">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-slate-800 text-sm">Kalender Hari Libur</h3>
                  <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full text-[10px] font-bold">
                    {sortedHolidays.length} Khusus
                  </span>
                </div>
                <p className="text-slate-400 text-[11px]">Daftar akumulasi hari libur non-kehadiran di lingkungan sekolah.</p>
              </div>
              
              {/* Tab Selector - Smaller, lighter, extremely crisp */}
              <div className="flex bg-slate-50 p-1 border border-slate-200/60 rounded-xl w-fit">
                <button 
                  onClick={() => setShowNational(false)}
                  className={`px-3 py-1 rounded-lg font-bold text-[10px] uppercase tracking-wider transition-all ${!showNational ? 'bg-white text-indigo-700 shadow-xs border border-slate-100' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  Libur Khusus Sekolah
                </button>
                <button 
                  onClick={() => setShowNational(true)}
                  className={`px-3 py-1 rounded-lg font-bold text-[10px] uppercase tracking-wider transition-all ${showNational ? 'bg-white text-indigo-700 shadow-xs border border-slate-100' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  SKB 3 Menteri (Nasasional)
                </button>
              </div>
            </div>

            {!showNational ? (
              /* LIST HARI LIBUR KHUSUS SEKOLAH */
              <div className="space-y-2">
                {sortedHolidays.length === 0 ? (
                  <div className="border border-dashed border-slate-200/80 rounded-xl p-8 flex flex-col items-center justify-center text-center space-y-2.5">
                    <div className="bg-slate-50 p-3 rounded-full text-slate-400 border border-slate-100">
                      <CalendarCheck size={20} />
                    </div>
                    <div className="space-y-0.5">
                      <p className="font-bold text-slate-700 text-xs">Belum Ada Libur Khusus Terdaftar</p>
                      <p className="text-slate-400 text-[10.5px] max-w-xs mx-auto">
                        Kalender khusus masih memakai libur nasional standar. Tambahkan libur mandiri sekolah dengan form di samping.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100 border border-slate-100/80 rounded-xl overflow-hidden bg-slate-50/10">
                    {sortedHolidays.map((holiday) => {
                      const badge = getTypeBadge(holiday.type);
                      return (
                        <div key={holiday.id} className="p-3.5 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                          <div className="space-y-1 pr-4">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-bold text-slate-700 text-xs">{holiday.name}</span>
                              <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold border ${badge.bg}`}>
                                {badge.label}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5 text-slate-400 text-[10px]">
                              <span>{formatReadableDate(holiday.date)}</span>
                            </div>
                          </div>

                          <button 
                            onClick={() => handleDeleteHoliday(holiday.id, holiday.name)}
                            className="p-1.5 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all cursor-pointer"
                            title="Hapus"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : (
              /* LIST HARI LIBUR NASIONAL */
              <div className="space-y-3">
                <div className="p-3 bg-amber-50/50 border border-amber-100/65 rounded-xl flex gap-2.5 text-amber-800 text-[10.5px] leading-relaxed">
                  <AlertCircle size={14} className="text-amber-600 shrink-0 mt-0.5" />
                  <p>
                    Hari libur nasional bersifat <strong>read-only</strong> terintegrasi otomatis dari ketetapan resmi SKB 3 Menteri tahun ini.
                  </p>
                </div>

                <div className="overflow-hidden border border-slate-100 rounded-xl divide-y divide-slate-100 max-h-[320px] overflow-y-auto bg-slate-50/10 scrollbar-thin">
                  {sortedNational.map((holiday, idx) => (
                    <div key={idx} className="p-3 flex items-center justify-between hover:bg-slate-50/50">
                      <span className="font-bold text-slate-700 text-[11px]">{holiday.name}</span>
                      <span className="text-[10px] text-slate-400 font-medium shrink-0 ml-4 font-mono">
                        {new Date(holiday.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
