// Indonesian National Holidays 2025 - 2026 based on SKB 3 Menteri
export interface Holiday {
  date: string; // YYYY-MM-DD
  name: string;
}

export interface SchoolHoliday {
  id: string;
  schoolId: string;
  date: string; // YYYY-MM-DD
  name: string;
  type: 'LIBUR_SEMESTER' | 'CLASS_MEETING' | 'LIBUR_MENDESAK' | 'LAINNYA';
}

export const INDONESIAN_HOLIDAYS: Holiday[] = [
  // --- Year 2025 ---
  { date: '2025-01-01', name: 'Tahun Baru 2025 Masehi' },
  { date: '2025-01-27', name: 'Isra Mikraj Nabi Muhammad SAW' },
  { date: '2025-01-29', name: 'Tahun Baru Imlek 2576 Kongzili' },
  { date: '2025-03-29', name: 'Hari Suci Nyepi (Tahun Baru Saka 1947)' },
  { date: '2025-03-31', name: 'Hari Raya Idul Fitri 1446 Hijriah (Hari Ke-1)' },
  { date: '2025-04-01', name: 'Hari Raya Idul Fitri 1446 Hijriah (Hari Ke-2)' },
  { date: '2025-04-18', name: 'Wafat Yesus Kristus (Jumat Agung)' },
  { date: '2025-04-20', name: 'Hari Paskah (Kebangkitan Yesus Kristus)' },
  { date: '2025-05-01', name: 'Hari Buruh Internasional' },
  { date: '2025-05-12', name: 'Hari Raya Waisak 2569 BE' },
  { date: '2025-05-29', name: 'Kenaikan Yesus Kristus' },
  { date: '2025-06-01', name: 'Hari Lahir Pancasila' },
  { date: '2025-06-06', name: 'Hari Raya Idul Adha 1446 Hijriah' },
  { date: '2025-06-27', name: 'Tahun Baru Islam 1447 Hijriah' },
  { date: '2025-08-17', name: 'Hari Kemerdekaan Republik Indonesia' },
  { date: '2025-09-05', name: 'Maulid Nabi Muhammad SAW' },
  { date: '2025-12-25', name: 'Hari Raya Natal' },

  // --- Year 2026 ---
  { date: '2026-01-01', name: 'Tahun Baru 2026 Masehi' },
  { date: '2026-01-15', name: 'Isra Mikraj Nabi Muhammad SAW' },
  { date: '2026-02-17', name: 'Tahun Baru Imlek 2577 Kongzili' },
  { date: '2026-03-19', name: 'Hari Suci Nyepi (Tahun Baru Saka 1948)' },
  { date: '2026-03-20', name: 'Hari Raya Idul Fitri 1447 Hijriah (Hari Ke-1)' },
  { date: '2026-03-21', name: 'Hari Raya Idul Fitri 1447 Hijriah (Hari Ke-2)' },
  { date: '2026-04-03', name: 'Wafat Yesus Kristus (Jumat Agung)' },
  { date: '2026-04-05', name: 'Hari Paskah (Kebangkitan Yesus Kristus)' },
  { date: '2026-05-01', name: 'Hari Buruh Internasional' },
  { date: '2026-05-14', name: 'Kenaikan Yesus Kristus' },
  { date: '2026-05-22', name: 'Hari Raya Waisak 2570 BE' },
  { date: '2026-05-27', name: 'Hari Raya Idul Adha 1447 Hijriah' },
  { date: '2026-06-01', name: 'Hari Lahir Pancasila' },
  { date: '2026-06-16', name: 'Tahun Baru Islam 1448 Hijriah' },
  { date: '2026-08-17', name: 'Hari Kemerdekaan Republik Indonesia' },
  { date: '2026-08-25', name: 'Maulid Nabi Muhammad SAW' },
  { date: '2026-12-25', name: 'Hari Raya Natal' }
];

/**
 * Normalizes a Date to ID format 'YYYY-MM-DD' dynamically respecting timezone (Asia/Jakarta) or generic local.
 */
export function formatDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function getCustomHolidays(schoolId?: string): SchoolHoliday[] {
  try {
    const data = localStorage.getItem('sim_custom_holidays');
    if (!data) return [];
    
    const holidays: SchoolHoliday[] = JSON.parse(data);
    let targetSchoolId = schoolId;
    
    if (!targetSchoolId) {
      const curUserStr = localStorage.getItem('sim_current_user');
      if (curUserStr) {
        const curUser = JSON.parse(curUserStr);
        targetSchoolId = curUser?.schoolId;
      }
    }
    
    if (targetSchoolId) {
      return holidays.filter(h => h.schoolId === targetSchoolId);
    }
    return holidays;
  } catch (e) {
    return [];
  }
}

export function saveCustomHolidays(holidays: SchoolHoliday[]) {
  try {
    localStorage.setItem('sim_custom_holidays', JSON.stringify(holidays));
    window.dispatchEvent(new Event('custom-holidays-changed'));
  } catch (e) {
    console.error('Error saving custom holidays:', e);
  }
}

export function getHolidayName(date: Date | string, schoolId?: string): string | null {
  const dDate = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(dDate.getTime())) return null;
  const key = formatDateKey(dDate);
  
  const nationalHoliday = INDONESIAN_HOLIDAYS.find(h => h.date === key);
  if (nationalHoliday) return nationalHoliday.name;

  const customHolidays = getCustomHolidays(schoolId);
  const schoolHoliday = customHolidays.find(h => h.date === key);
  return schoolHoliday ? schoolHoliday.name : null;
}

export function isHolidayOrWeekend(date: Date, schoolId?: string): boolean {
  const day = date.getDay();
  const isWeekend = day === 0 || day === 6;
  if (isWeekend) return true;
  return getHolidayName(date, schoolId) !== null;
}
