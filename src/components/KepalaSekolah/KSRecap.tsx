import React from 'react';
import { 
  FileSpreadsheet, 
  Download,
  FileText
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { 
  Document, 
  Packer, 
  Paragraph, 
  TextRun, 
  Table, 
  TableRow, 
  TableCell, 
  WidthType, 
  AlignmentType, 
  HeadingLevel,
  BorderStyle,
  VerticalAlign,
  ExternalHyperlink
} from 'docx';
import { saveAs } from 'file-saver';
import { useNotifications } from '../../context/NotificationContext';
import { getHolidayName } from '../../utils/holidayHelper';
import { Attendance, UserProfile, SchoolInfo, DocumentInfo, Permission } from '../../types';

const parseDateOnly = (dateStr: string): Date => {
  if (!dateStr) return new Date();
  if (dateStr.includes('T')) {
    const d = new Date(dateStr);
    d.setHours(0, 0, 0, 0);
    return d;
  }
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    return new Date(year, month, day, 0, 0, 0, 0);
  }
  const d = new Date(dateStr);
  d.setHours(0, 0, 0, 0);
  return d;
};

const toMidnight = (d: Date): Date => {
  const newDate = new Date(d);
  newDate.setHours(0, 0, 0, 0);
  return newDate;
};

interface KSRecapProps {
  user: UserProfile;
  allAttendance: Attendance[];
  users: UserProfile[];
  schools: SchoolInfo[];
  allDocuments: DocumentInfo[];
  allPermissions: Permission[];
}

export function KSRecap({ user, allAttendance, users, schools, allDocuments, allPermissions }: KSRecapProps) {
  const { showToast } = useNotifications();
  const [selectedMonth, setSelectedMonth] = React.useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = React.useState(new Date().getFullYear());

  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  const now = new Date();
  const years = Array.from({ length: 5 }, (_, i) => now.getFullYear() - i);

  const mySchoolInfo = schools.find(s => s.id === user.schoolId);
  const mySchoolTeachers = users.filter(u => u.schoolId === user.schoolId && u.role === 'GURU');

  const maskUrl = (url: string): string => {
    if (!url) return '';
    try {
      const parsed = new URL(url);
      const domain = parsed.hostname.replace('www.', '');
      if (domain.includes('drive.google.com') || domain.includes('docs.google.com')) {
        const pathParts = parsed.pathname.split('/');
        const dIndex = pathParts.indexOf('d');
        if (dIndex !== -1 && pathParts[dIndex + 1]) {
          const id = pathParts[dIndex + 1];
          const shortenedId = id.length > 8 ? `${id.substring(0, 4)}...${id.substring(id.length - 4)}` : id;
          return `${domain}/d/${shortenedId}`;
        }
      }
      const displayPath = parsed.pathname.length > 15 
        ? `${parsed.pathname.substring(0, 8)}...${parsed.pathname.substring(parsed.pathname.length - 6)}` 
        : parsed.pathname;
      return `${domain}${displayPath}`;
    } catch (e) {
      return url.length > 30 ? `${url.substring(0, 15)}...${url.substring(url.length - 10)}` : url;
    }
  };

  const getDocStatusLabel = (doc?: DocumentInfo) => {
    if (!doc) return 'Belum Ada';
    const statusText = doc.status === 'APPROVED' ? 'Selesai' : doc.status === 'REVISION' ? 'Revisi' : 'Progress';
    if (doc.link) {
      return `${statusText} (${maskUrl(doc.link)})`;
    }
    return statusText;
  };

  const getWorkingDays = (month: number, year: number) => {
    const days: Date[] = [];
    const date = new Date(year, month, 1);
    while (date.getMonth() === month) {
      const day = date.getDay();
      const isWeekend = day === 0 || day === 6;
      const isHoliday = getHolidayName(date, user.schoolId) !== null;
      if (!isWeekend && !isHoliday) { // Skip Sat/Sun & holidays
        days.push(new Date(date));
      }
      date.setDate(date.getDate() + 1);
    }
    return days;
  };

  const handleExportWord = async () => {
    try {
      showToast('Sedang menyiapkan dokumen Word...', 'info');

      const workingDays = getWorkingDays(selectedMonth, selectedYear);
      
      // Filter permissions and attendance for the selected month/year
      const filteredAttendance = allAttendance.filter(a => {
        const d = new Date(a.timestamp);
        return d.getMonth() === selectedMonth && d.getFullYear() === selectedYear;
      });

      // Filter permissions overlapping with selected month/year
      const firstDayOfMonth = new Date(selectedYear, selectedMonth, 1);
      const lastDayOfMonth = new Date(selectedYear, selectedMonth + 1, 0, 23, 59, 59, 999);
      const filteredPermissions = allPermissions.filter(p => {
        const start = parseDateOnly(p.startDate);
        const end = parseDateOnly(p.endDate);
        return start <= lastDayOfMonth && end >= firstDayOfMonth;
      });

      // 1. Prepare Data for Attendance Table
      const attendanceData = mySchoolTeachers.map(teacher => {
        const teacherAttendance = filteredAttendance.filter(a => a.userId === teacher.id);
        const teacherPermissions = filteredPermissions.filter(p => p.userId === teacher.id && p.status === 'APPROVED');
        
        let sickCount = 0;
        let permissionCount = 0;
        let cutiCount = 0;
        let dinasCount = 0;
        let alpaCount = 0;
        let presentCount = 0;

        workingDays.forEach(day => {
          const dayStr = day.toLocaleDateString('en-CA'); // YYYY-MM-DD
          
          const hasAtt = teacherAttendance.some(a => {
            // ONLY normal attendance, or approved manual repair attendance
            if (a.isManual && a.status !== 'APPROVED') return false;
            const attDate = new Date(a.timestamp).toLocaleDateString('en-CA');
            return attDate === dayStr;
          });

          if (hasAtt) {
            presentCount++;
          } else {
            // Try to find matching approved permission
            const matchingPerm = teacherPermissions.find(p => {
              const s = parseDateOnly(p.startDate);
              const e = parseDateOnly(p.endDate);
              const d = toMidnight(day);
              return d >= s && d <= e;
            });

            if (matchingPerm) {
              if (matchingPerm.type === 'CUTI' && matchingPerm.leaveType === 'Cuti Sakit') {
                sickCount++;
              } else if (matchingPerm.type === 'CUTI') {
                cutiCount++;
              } else if (matchingPerm.type === 'IZIN') {
                permissionCount++;
              } else if (matchingPerm.type === 'DINAS_LUAR') {
                dinasCount++;
              }
            } else {
              alpaCount++;
            }
          }
        });

        const attendanceRate = workingDays.length > 0 ? Math.round((presentCount / workingDays.length) * 100) : 100;
        
        return {
          nama: teacher.nama,
          nip: teacher.nip || '-',
          jabatan: `${teacher.jabatan || 'Guru Kelas'} (${teacher.kelas || 'Semua Kelas'})`,
          kehadiran: `${attendanceRate}%`,
          siacd: `${sickCount}/${permissionCount}/${alpaCount}/${cutiCount}/${dinasCount}`,
          catatan: attendanceRate >= 95 ? 'Tepat waktu, kinerja sangat baik.' : 'Perlu pendampingan terkait kedisiplinan.'
        };
      });

      // 2. Prepare Data for Documents Table
      const documentsData = mySchoolTeachers.map(teacher => {
        const teacherDocs = allDocuments.filter(d => 
          (d.userId === teacher.id || d.teacherId === teacher.id) &&
          new Date(d.uploadDate).getMonth() === selectedMonth &&
          new Date(d.uploadDate).getFullYear() === selectedYear
        );
        
        const rppLengkap = teacherDocs.find(d => d.type === 'RPP_LENGKAP');
        const praktisBaik = teacherDocs.find(d => d.type === 'PRAKTIK_BAIK');

        return {
          nama: teacher.nama,
          rppDoc: rppLengkap,
          pmmDoc: praktisBaik
        };
      });

      const createWordTableCell = (displayTextOrDoc: string | DocumentInfo | undefined, isHeader = false) => {
        if (isHeader) {
          return new TableCell({
            shading: { fill: "f2f2f2" },
            children: [
              new Paragraph({
                children: [
                  new TextRun({ text: displayTextOrDoc as string, bold: true })
                ]
              })
            ]
          });
        }

        if (typeof displayTextOrDoc === 'string') {
          return new TableCell({
            children: [
              new Paragraph({
                children: [
                  new TextRun({ text: displayTextOrDoc })
                ]
              })
            ]
          });
        }

        const doc = displayTextOrDoc;
        if (!doc) {
          return new TableCell({
            children: [
              new Paragraph({
                children: [
                  new TextRun({ text: "Belum Ada", color: "94a3b8" })
                ]
              })
            ]
          });
        }

        const statusText = doc.status === 'APPROVED' ? 'Selesai' : doc.status === 'REVISION' ? 'Revisi' : 'Progress';
        const colorHex = doc.status === 'APPROVED' ? '16a34a' : doc.status === 'REVISION' ? 'dc2626' : 'ca8a04';

        if (doc.link) {
          const maskedLabel = maskUrl(doc.link);
          return new TableCell({
            children: [
              new Paragraph({
                children: [
                  new TextRun({ text: `${statusText} `, color: colorHex, bold: true }),
                  new TextRun({ text: '(' }),
                  new ExternalHyperlink({
                    children: [
                      new TextRun({
                        text: maskedLabel,
                        color: '2563eb',
                        underline: {},
                      }),
                    ],
                    link: doc.link,
                  }),
                  new TextRun({ text: ')' }),
                ]
              })
            ]
          });
        }

        return new TableCell({
          children: [
            new Paragraph({
              children: [
                new TextRun({ text: statusText, color: colorHex, bold: true })
              ]
            })
          ]
        });
      };

      // 3. Create Document
      const doc = new Document({
        sections: [{
          properties: {},
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({
                  text: "LAPORAN REKAPITULASI KINERJA SATUAN PENDIDIKAN",
                  bold: true,
                  size: 28,
                }),
              ],
            }),
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({
                  text: `Periode Pelaporan: ${months[selectedMonth]} ${selectedYear}`,
                  size: 20,
                }),
              ],
            }),
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({
                  text: `Nama Satuan Pendidikan: ${mySchoolInfo?.name || user.sekolah} | NPSN: ${mySchoolInfo?.npsn || '-'}`,
                  size: 20,
                }),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: "_________________________________________________________________________________",
                  bold: true,
                }),
              ],
            }),
            new Paragraph({ spacing: { before: 200 } }),
            
            // I. IDENTITAS
            new Paragraph({
              children: [
                new TextRun({ text: "I. IDENTITAS SATUAN PENDIDIKAN", bold: true, size: 24 }),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun({ text: `\t•  Nama Kepala Sekolah\t\t: ${user.nama}`, size: 22 }),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun({ text: `\t•  NIP\t\t\t\t\t: ${user.nip || '-'}`, size: 22 }),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun({ text: `\t•  Jumlah Guru\t\t\t: ${mySchoolTeachers.length} Orang`, size: 22 }),
              ],
            }),
            
            // II. KEDISPLINAN
            new Paragraph({ spacing: { before: 400 }, children: [new TextRun({ text: "II. LAPORAN KEDISPLINAN GURU & TENDIK", bold: true, size: 24 })] }),
            new Table({
              width: { size: 100, type: WidthType.PERCENTAGE },
              rows: [
                new TableRow({
                  children: [
                    "No", "Nama Guru / NIP", "Jabatan / Kelas", "Persentase Kehadiran", "Jml Keterangan (S/I/A/C/D)", "Catatan / Kendala"
                  ].map(h => new TableCell({
                    shading: { fill: "f2f2f2" },
                    children: [new Paragraph({ children: [new TextRun({ text: h, bold: true })] })]
                  }))
                }),
                ...attendanceData.map((row, i) => new TableRow({
                  children: [
                    (i + 1).toString(), `${row.nama}\nNIP. ${row.nip}`, row.jabatan, row.kehadiran, row.siacd, row.catatan
                  ].map(v => new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: v })] })]
                  }))
                }))
              ]
            }),
            new Paragraph({ 
              spacing: { before: 200 },
              children: [
                new TextRun({ 
                  text: "S: Sakit, I: Izin, A: Alpa, C: Cuti, D: Dinas Luar",
                  italics: true,
                  size: 16
                })
              ]
            }),

            // III. PROGRES DOKUMEN
            new Paragraph({ spacing: { before: 400 }, children: [new TextRun({ text: "III. PROGRES DOKUMEN ADMINISTRASI", bold: true, size: 24 })] }),
            new Table({
              width: { size: 100, type: WidthType.PERCENTAGE },
              rows: [
                new TableRow({
                  children: [
                    createWordTableCell("No", true),
                    createWordTableCell("Nama Guru", true),
                    createWordTableCell("RPP Lengkap", true),
                    createWordTableCell("Praktik Baik", true)
                  ]
                }),
                ...documentsData.map((row, i) => new TableRow({
                  children: [
                    createWordTableCell((i + 1).toString()),
                    createWordTableCell(row.nama),
                    createWordTableCell(row.rppDoc),
                    createWordTableCell(row.pmmDoc)
                  ]
                }))
              ]
            }),
            new Paragraph({ spacing: { before: 400 }, children: [new TextRun({ text: "IV. CATATAN & REKOMENDASI KEPALA SEKOLAH", bold: true, size: 24 })] }),
            new Paragraph({
              children: [
                new TextRun({ text: "Berdasarkan hasil rekapitulasi di atas, secara umum kinerja satuan pendidikan berjalan dengan Baik. Fokus utama untuk periode berikutnya adalah peningkatkan pemanfaatan platform edukasi digital secara mandiri.", size: 22 })
              ]
            }),

            // Tanda Tangan
            new Paragraph({ spacing: { before: 800 }, alignment: AlignmentType.RIGHT, children: [new TextRun({ text: "Mengetahui,", size: 22 })] }),
            new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: "Kepala Satuan Pendidikan", size: 22 })] }),
            new Paragraph({ spacing: { before: 800 }, children: [] }),
            new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: `( ${user.nama} )`, underline: {}, bold: true, size: 22 })] }),
            new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: `NIP. ${user.nip || '.........................................'}`, size: 22 })] }),
          ],
        }],
      });

      const buffer = await Packer.toBlob(doc);
      saveAs(buffer, `Laporan_Rekapitulasi_${mySchoolInfo?.name || 'Sekolah'}_${months[selectedMonth]}_${selectedYear}.docx`);
      showToast('Laporan Word berhasil diunduh.', 'success');
    } catch (error) {
      console.error(error);
      showToast('Gagal membuat dokumen Word.', 'error');
    }
  };

  const handleExportExcel = () => {
    try {
      const workingDays = getWorkingDays(selectedMonth, selectedYear);
      const teacherIds = mySchoolTeachers.map(t => t.id);
      const filteredAttendance = allAttendance.filter(att => {
        if (!teacherIds.includes(att.userId) && att.userId !== user.id) return false;
        const d = new Date(att.timestamp);
        return d.getMonth() === selectedMonth && d.getFullYear() === selectedYear;
      });

      // Users to process: teachers and current user (KS)
      const exportUsers = [...mySchoolTeachers];
      if (user.role === 'KEPALA_SEKOLAH') {
        const alreadyInList = exportUsers.some(u => u.id === user.id);
        if (!alreadyInList) exportUsers.push(user);
      }

      // Collect all target dates (all working days + any day with attendance)
      const allTargetDates = new Set<string>();
      workingDays.forEach(day => {
        allTargetDates.add(day.toLocaleDateString('en-CA'));
      });
      filteredAttendance.forEach(a => {
        allTargetDates.add(new Date(a.timestamp).toLocaleDateString('en-CA'));
      });

      const sortedDateStrings = Array.from(allTargetDates).sort((a, b) => b.localeCompare(a));

      const exportData: any[] = [];

      exportUsers.forEach(usr => {
        const userAttendance = filteredAttendance.filter(a => a.userId === usr.id);
        // Load all approved permissions for this teacher
        const firstDayOfMonth = new Date(selectedYear, selectedMonth, 1);
        const lastDayOfMonth = new Date(selectedYear, selectedMonth + 1, 0, 23, 59, 59, 999);
        const userPermissions = allPermissions.filter(p => {
          if (p.userId !== usr.id || p.status !== 'APPROVED') return false;
          const start = parseDateOnly(p.startDate);
          const end = parseDateOnly(p.endDate);
          return start <= lastDayOfMonth && end >= firstDayOfMonth;
        });

        sortedDateStrings.forEach(dateStr => {
          const sName = schools.find(s => s.id === (usr.schoolId || user.schoolId))?.name || user.sekolah || '-';
          
          let jamMasuk = '-';
          let jamKeluar = '-';
          let lokasiMasuk = '-';
          let lokasiKeluar = '-';
          let status = 'Normal';

          // Approved manual repair or standard attendance logs
          const approvedInLog = userAttendance.find(a => a.type === 'IN' && (!a.isManual || a.status === 'APPROVED') && new Date(a.timestamp).toLocaleDateString('en-CA') === dateStr);
          const approvedOutLog = userAttendance.find(a => a.type === 'OUT' && (!a.isManual || a.status === 'APPROVED') && new Date(a.timestamp).toLocaleDateString('en-CA') === dateStr);

          if (approvedInLog || approvedOutLog) {
            jamMasuk = approvedInLog ? new Date(approvedInLog.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '-';
            jamKeluar = approvedOutLog ? new Date(approvedOutLog.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '-';
            lokasiMasuk = approvedInLog?.location || '-';
            lokasiKeluar = approvedOutLog?.location || '-';
            
            const isPerbaikan = approvedInLog?.isManual || approvedOutLog?.isManual;
            status = isPerbaikan ? 'Perbaikan (APPROVED)' : 'Normal';
          } else {
            // Check approved permission for this date
            const matchingPerm = userPermissions.find(p => {
              const s = parseDateOnly(p.startDate);
              const e = parseDateOnly(p.endDate);
              const d = parseDateOnly(dateStr);
              return d >= s && d <= e;
            });

            if (matchingPerm) {
              // Empty tables as requested
              jamMasuk = '';
              jamKeluar = '';
              lokasiMasuk = '';
              lokasiKeluar = '';
              if (matchingPerm.type === 'CUTI') {
                status = matchingPerm.leaveType || 'Cuti';
              } else if (matchingPerm.type === 'IZIN') {
                status = 'Izin';
              } else if (matchingPerm.type === 'DINAS_LUAR') {
                status = 'Dinas Luar';
              }
            } else {
              // Check if it's a working day
              const isWorkDay = workingDays.some(wd => wd.toLocaleDateString('en-CA') === dateStr);
              if (isWorkDay) {
                jamMasuk = '';
                jamKeluar = '';
                lokasiMasuk = '';
                lokasiKeluar = '';
                status = 'Alpa';
              } else {
                // Return '-' or skip, but let's label holiday/weekend
                const holidayDate = parseDateOnly(dateStr);
                const holidayName = getHolidayName(holidayDate, user.schoolId);
                // For holidays / weekends without attendance, we can skip or show as Holiday. Let's show as holiday but skip in general listing unless there was attendance.
                return; 
              }
            }
          }

          exportData.push({
            'NIP': usr.nip || '-',
            'Nama': usr.nama,
            'Sekolah': sName,
            'Peran': usr.role === 'GURU' ? `${usr.role} - ${usr.jabatan || 'Guru Kelas'} (${usr.kelas || 'Semua Kelas'})` : (usr.role || '-'),
            'Tanggal': dateStr,
            'Jam Masuk': jamMasuk,
            'Jam Keluar': jamKeluar,
            'Status': status,
            'Lokasi Masuk': lokasiMasuk,
            'Lokasi Keluar': lokasiKeluar
          });
        });
      });

      // Sort chronological latest first
      exportData.sort((a, b) => b.Tanggal.localeCompare(a.Tanggal));

      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Kehadiran');
      
      const wscols = [
        {wch: 20}, {wch: 25}, {wch: 30}, {wch: 15}, {wch: 15}, {wch: 12}, {wch: 12}, {wch: 25}, {wch: 40}, {wch: 40}
      ];
      worksheet['!cols'] = wscols;

      const schoolName = schools.find(s => s.id === user.schoolId)?.name || user.sekolah || 'Sekolah';
      XLSX.writeFile(workbook, `Rekap_Kehadiran_${schoolName}_${months[selectedMonth]}_${selectedYear}.xlsx`);

      showToast('Rekapitulasi berhasil diekspor ke Excel', 'success');
    } catch (error) {
      console.error(error);
      showToast('Gagal mengekspor data ke Excel', 'error');
    }
  };

  return (
    <div className="bg-white p-12 rounded-[3rem] border border-slate-100 shadow-sm text-center flex flex-col items-center max-w-2xl mx-auto">
       <div className="w-24 h-24 bg-blue-50 text-blue-600 rounded-[2rem] flex items-center justify-center mb-8 shadow-inner">
          <FileSpreadsheet size={48} />
       </div>
       <h3 className="text-2xl font-black text-slate-800 mb-3 tracking-tight">Rekapitulasi Kinerja Satuan</h3>
       <p className="text-slate-500 max-w-md mb-8 leading-relaxed font-medium">Pilih periode pelaporan dan unduh data untuk kebutuhan pelaporan Dinas.</p>
       
       <div className="grid grid-cols-2 gap-4 w-full mb-8">
         <div className="text-left">
           <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest ml-2">Bulan</label>
           <select 
             value={selectedMonth}
             onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
             className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-black text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/20 transition-all appearance-none cursor-pointer"
           >
             {months.map((m, i) => (
               <option key={m} value={i}>{m}</option>
             ))}
           </select>
         </div>
         <div className="text-left">
           <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest ml-2">Tahun</label>
           <select 
             value={selectedYear}
             onChange={(e) => setSelectedYear(parseInt(e.target.value))}
             className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-black text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/20 transition-all appearance-none cursor-pointer"
           >
             {years.map(y => (
               <option key={y} value={y}>{y}</option>
             ))}
           </select>
         </div>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
          <button 
            onClick={handleExportExcel}
            className="py-4 bg-slate-900 text-white rounded-2xl font-black text-xs hover:bg-slate-800 transition-all uppercase tracking-widest shadow-xl shadow-slate-900/10 flex items-center justify-center space-x-2"
          >
             <FileSpreadsheet size={18} />
             <span>Unduh Rekap Kehadiran</span>
          </button>
          <button 
            onClick={handleExportWord}
            className="py-4 bg-blue-600 text-white rounded-2xl font-black text-xs hover:bg-blue-700 transition-all uppercase tracking-widest shadow-xl shadow-blue-600/10 flex items-center justify-center space-x-2"
          >
             <FileText size={18} />
             <span>Unduh Laporan</span>
          </button>
       </div>
    </div>
  );
}
