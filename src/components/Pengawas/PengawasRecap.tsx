import React from 'react';
import { 
  FileSpreadsheet, 
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

interface PengawasRecapProps {
  user: UserProfile;
  schools: SchoolInfo[];
  users: UserProfile[];
  allDocuments: DocumentInfo[];
  allAttendance: Attendance[];
  allPermissions: Permission[];
}

export function PengawasRecap({ user, schools, users, allDocuments, allAttendance, allPermissions }: PengawasRecapProps) {
  const { showToast } = useNotifications();
  const [selectedSchoolId, setSelectedSchoolId] = React.useState<string>(schools[0]?.id || '');
  const [selectedMonth, setSelectedMonth] = React.useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = React.useState(new Date().getFullYear());

  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  const now = new Date();
  const years = Array.from({ length: 5 }, (_, i) => now.getFullYear() - i);

  // Filter school based on selection
  const targetSchool = schools.find(s => s.id === selectedSchoolId);
  const targetSchoolTeachers = users.filter(u => u.schoolId === selectedSchoolId && u.role === 'GURU');
  const targetSchoolKS = users.find(u => u.schoolId === selectedSchoolId && u.role === 'KEPALA_SEKOLAH');

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
      return parsed.hostname;
    } catch (e) {
      return url.length > 25 ? `${url.substring(0, 15)}...` : url;
    }
  };

  const getWorkingDays = (month: number, year: number) => {
    const days: Date[] = [];
    const date = new Date(year, month, 1);
    while (date.getMonth() === month) {
      const day = date.getDay();
      const isWeekend = day === 0 || day === 6;
      const isHoliday = getHolidayName(date, selectedSchoolId) !== null;
      if (!isWeekend && !isHoliday) { // Skip weekends & holidays
        days.push(new Date(date));
      }
      date.setDate(date.getDate() + 1);
    }
    return days;
  };

  // Calculate Presence Rates for report text block
  const workingDays = getWorkingDays(selectedMonth, selectedYear);
  const filteredAttendance = allAttendance.filter(a => {
    const d = new Date(a.timestamp);
    return d.getMonth() === selectedMonth && d.getFullYear() === selectedYear;
  });

  // Filter permissions overlapping with selected month/year
  const firstDayOfMonthOver = new Date(selectedYear, selectedMonth, 1);
  const lastDayOfMonthOver = new Date(selectedYear, selectedMonth + 1, 0, 23, 59, 59, 999);
  const filteredPermissions = allPermissions.filter(p => {
    const start = parseDateOnly(p.startDate);
    const end = parseDateOnly(p.endDate);
    return start <= lastDayOfMonthOver && end >= firstDayOfMonthOver;
  });

  const attendanceSummary = targetSchoolTeachers.map(teacher => {
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
      jabatan: teacher.jabatan || 'Guru Kelas',
      kelas: teacher.kelas || '-',
      rate: attendanceRate,
      siacd: `${sickCount}/${permissionCount}/${alpaCount}/${cutiCount}/${dinasCount}`
    };
  });

  const averageAttendance = attendanceSummary.length > 0 
    ? Math.round(attendanceSummary.reduce((sum, current) => sum + current.rate, 0) / attendanceSummary.length) 
    : 100;

  // Fetch School Quality Documents for report
  const schoolDocs = allDocuments.filter(d => d.schoolId === selectedSchoolId);
  const raporDoc = schoolDocs.find(d => d.type === 'RAPOR');
  const rktDoc = schoolDocs.find(d => d.type === 'RKT');
  const kspDoc = schoolDocs.find(d => d.type === 'KSP');

  const createTableCell = (text: string, bold = false, shading = "") => {
    return new TableCell({
      shading: shading ? { fill: shading } : undefined,
      children: [
        new Paragraph({
          children: [
            new TextRun({ text, bold })
          ]
        })
      ]
    });
  };

  const createHyperlinkCell = (statusText: string, linkUrl?: string, colorHex = "000000") => {
    if (!linkUrl) {
      return new TableCell({
        children: [
          new Paragraph({
            children: [
              new TextRun({ text: statusText, color: colorHex, bold: true })
            ]
          })
        ]
      });
    }

    const maskedLabel = maskUrl(linkUrl);
    return new TableCell({
      children: [
        new Paragraph({
          children: [
            new TextRun({ text: `${statusText} (`, color: colorHex, bold: true }),
            new ExternalHyperlink({
              children: [
                new TextRun({
                  text: maskedLabel,
                  color: '0284c7',
                  underline: {},
                }),
              ],
              link: linkUrl,
            }),
            new TextRun({ text: ')' }),
          ]
        })
      ]
    });
  };

  const createOnlyLinkCell = (linkUrl?: string) => {
    if (!linkUrl) {
      return new TableCell({
        children: [
          new Paragraph({
            children: [
              new TextRun({ text: "-", color: "94a3b8" })
            ]
          })
        ]
      });
    }

    const maskedLabel = maskUrl(linkUrl);
    return new TableCell({
      children: [
        new Paragraph({
          children: [
            new ExternalHyperlink({
              children: [
                new TextRun({
                  text: maskedLabel,
                  color: '0284c7',
                  underline: {},
                }),
              ],
              link: linkUrl,
            }),
          ]
        })
      ]
    });
  };

  const handleExportWord = async () => {
    if (!targetSchool) {
      showToast('Sekolah target belum dipilih.', 'error');
      return;
    }

    try {
      showToast('Menyiapkan dokumen Word rekapitulasi...', 'info');

      // Create Document
      const doc = new Document({
        sections: [{
          properties: {},
          children: [
            // Header LAPORAN
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({
                  text: "LAPORAN EVALUASI & PENGAWASAN WILAYAH BINAAN",
                  bold: true,
                  size: 26,
                }),
              ],
            }),
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({
                  text: `Periode Rekap: ${months[selectedMonth]} ${selectedYear}`,
                  size: 20,
                }),
              ],
            }),
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({
                  text: `Target Sekolah: ${targetSchool.name} | NPSN: ${targetSchool.npsn || '-'}`,
                  size: 20,
                  bold: true,
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

            // I. IDENTITAS PENGAWAS
            new Paragraph({
              children: [
                new TextRun({ text: "I. IDENTITAS PENGAWAS PEMBINA", bold: true, size: 22 }),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun({ text: `\t•  Nama Pengawas\t\t\t: ${user.nama}`, size: 20 }),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun({ text: `\t•  NIP\t\t\t\t\t\t: ${user.nip || '-'}`, size: 20 }),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun({ text: `\t•  Wilayah / Kecamatan\t: ${user.district || targetSchool.district || '-'}`, size: 20 }),
              ],
            }),
            new Paragraph({ spacing: { before: 200 } }),

            // II. ANALISIS DOKUMEN MUTU SEKOLAH
            new Paragraph({
              children: [
                new TextRun({ text: "II. ANALISIS DOKUMEN STRATEGIS & MUTU SEKOLAH", bold: true, size: 22 }),
              ],
            }),
            new Paragraph({ spacing: { before: 100 } }),
            new Table({
              width: { size: 100, type: WidthType.PERCENTAGE },
              rows: [
                new TableRow({
                  children: [
                    createTableCell("Jenis Dokumen", true, "f1f5f9"),
                    createTableCell("Status", true, "f1f5f9"),
                    createTableCell("Link", true, "f1f5f9"),
                    createTableCell("Catatan Analisis Pengawas", true, "f1f5f9"),
                  ]
                }),
                new TableRow({
                  children: [
                    createTableCell("1. Rapor Pendidikan Sekolah"),
                    createTableCell(raporDoc ? (raporDoc.status === 'APPROVED' ? 'Diterima' : 'Revisi') : 'Belum Diunggah'),
                    createOnlyLinkCell(raporDoc?.link),
                    createTableCell(raporDoc?.feedback || 'Tidak ada catatan khusus.')
                  ]
                }),
                new TableRow({
                  children: [
                    createTableCell("2. Rencana Kerja Tahunan (RKT)"),
                    createTableCell(rktDoc ? (rktDoc.status === 'APPROVED' ? 'Diterima' : 'Revisi') : 'Belum Diunggah'),
                    createOnlyLinkCell(rktDoc?.link),
                    createTableCell(rktDoc?.feedback || 'Tidak ada catatan khusus.')
                  ]
                }),
                new TableRow({
                  children: [
                    createTableCell("3. KSP / Kurikulum Operasional"),
                    createTableCell(kspDoc ? (kspDoc.status === 'APPROVED' ? 'Diterima' : 'Revisi') : 'Belum Diunggah'),
                    createOnlyLinkCell(kspDoc?.link),
                    createTableCell(kspDoc?.feedback || 'Tidak ada catatan khusus.')
                  ]
                }),
              ]
            }),
            new Paragraph({ spacing: { before: 300 } }),

            // III. HASIL PENDAMPINGAN & SUPERVISI GURU
            new Paragraph({
              children: [
                new TextRun({ text: "III. REKAPITULASI DISPLIN & SUPERVISI GURU INDIVIDU", bold: true, size: 22 }),
              ],
            }),
            new Paragraph({ spacing: { before: 100 } }),
            new Table({
              width: { size: 100, type: WidthType.PERCENTAGE },
              rows: [
                new TableRow({
                  children: [
                    createTableCell("No", true, "f1f5f9"),
                    createTableCell("Nama Pendidik", true, "f1f5f9"),
                    createTableCell("Kehadiran (%)", true, "f1f5f9"),
                    createTableCell("Izin S/I/A/C/D", true, "f1f5f9"),
                    createTableCell("RPP Lengkap", true, "f1f5f9"),
                    createTableCell("Praktik Baik", true, "f1f5f9"),
                    createTableCell("Hasil Supervisi & Komentar KS", true, "f1f5f9"),
                  ]
                }),
                ...targetSchoolTeachers.map((t, idx) => {
                  const summary = attendanceSummary.find(item => item.nama === t.nama);
                  const teacherDocs = schoolDocs.filter(d => d.userId === t.id || d.teacherId === t.id);
                  const rpp = teacherDocs.find(d => d.type === 'RPP_LENGKAP');
                  const pb = teacherDocs.find(d => d.type === 'PRAKTIK_BAIK');
                  const sv = teacherDocs.find(d => d.type === 'SUPERVISI');

                  return new TableRow({
                    children: [
                      createTableCell((idx + 1).toString()),
                      createTableCell(t.nama),
                      createTableCell(summary ? `${summary.rate}%` : '100%'),
                      createTableCell(summary ? summary.siacd : '0/0/0/0/0'),
                      createHyperlinkCell(rpp ? (rpp.status === 'APPROVED' ? 'Selesai' : rpp.status === 'REVISION' ? 'Revisi' : 'Menunggu') : 'Belum Ada', rpp?.link, rpp?.status === 'APPROVED' ? '16a34a' : '94a3b8'),
                      createHyperlinkCell(pb ? (pb.status === 'APPROVED' ? 'Selesai' : pb.status === 'REVISION' ? 'Revisi' : 'Menunggu') : 'Belum Ada', pb?.link, pb?.status === 'APPROVED' ? '16a34a' : '94a3b8'),
                      createTableCell(sv ? (sv.feedback || 'Disetujui / Selesai') : 'Belum Disupervisi')
                    ]
                  });
                })
              ]
            }),
            new Paragraph({ spacing: { before: 300 } }),

            // IV. REKOMENDASI PENGEMBANGAN PENGAWAS
            new Paragraph({
              children: [
                new TextRun({ text: "IV. ANALISIS & REKOMENDASI PENGAWAS", bold: true, size: 22 }),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun({ text: `Berdasarkan rekapitulasi data pendampingan bulan ${months[selectedMonth]} ${selectedYear}, satuan pendidikan ${targetSchool.name} memiliki tingkat disiplin pendidik dengan rata-rata ${averageAttendance}%. Dokumen penjaminan mutu sekolah dinilai sangat kooperatif namun disarankan melakukan penajaman analisis Rencana Kegiatan Tahunan secara berkelanjutan.`, size: 20 })
              ]
            }),
            new Paragraph({ spacing: { before: 700 } }),

            // Tanda tangan
            new Paragraph({
              alignment: AlignmentType.RIGHT,
              children: [
                new TextRun({ text: `${targetSchool.district || 'Gugus 1'}, ${new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}`, size: 20 })
              ]
            }),
            new Paragraph({
              alignment: AlignmentType.RIGHT,
              children: [
                new TextRun({ text: "Pengawas Pembina Wilayah", size: 20 })
              ]
            }),
            new Paragraph({ spacing: { before: 800 } }),
            new Paragraph({
              alignment: AlignmentType.RIGHT,
              children: [
                new TextRun({ text: `( ${user.nama} )`, bold: true, underline: {}, size: 20 })
              ]
            }),
            new Paragraph({
              alignment: AlignmentType.RIGHT,
              children: [
                new TextRun({ text: `NIP. ${user.nip || '...........................................'}`, size: 20 })
              ]
            }),
          ]
        }]
      });

      const buffer = await Packer.toBlob(doc);
      saveAs(buffer, `Laporan_Wilayah_${targetSchool.name.replace(/\s+/g, '_')}_${months[selectedMonth]}_${selectedYear}.doc`);
      showToast('Berhasil mengunduh Laporan Rekap Wilayah (.doc).', 'success');
    } catch (error) {
      console.error(error);
      showToast('Gagal memproses dokumen Word.', 'error');
    }
  };

  const handleExportExcel = () => {
    try {
      showToast('Menyiapkan rekap absensi Wilayah Excel...', 'info');
      
      const teacherIds = targetSchoolTeachers.map(t => t.id);
      
      // Users to process: teachers and targetschoolKS
      const exportUsers = [...targetSchoolTeachers];
      if (targetSchoolKS) {
        const alreadyInList = exportUsers.some(u => u.id === targetSchoolKS.id);
        if (!alreadyInList) exportUsers.push(targetSchoolKS);
      }

      const filteredAtt = filteredAttendance.filter(att => 
        teacherIds.includes(att.userId) || (targetSchoolKS && att.userId === targetSchoolKS.id)
      );

      // Collect all target dates (all working days + any day with attendance)
      const allTargetDates = new Set<string>();
      workingDays.forEach(day => {
        allTargetDates.add(day.toLocaleDateString('en-CA'));
      });
      filteredAtt.forEach(a => {
        allTargetDates.add(new Date(a.timestamp).toLocaleDateString('en-CA'));
      });

      const sortedDateStrings = Array.from(allTargetDates).sort((a, b) => b.localeCompare(a));

      const exportData: any[] = [];

      exportUsers.forEach(usr => {
        const userAttendance = filteredAtt.filter(a => a.userId === usr.id);
        
        // Load all approved permissions for this user
        const firstDayOfMonth = new Date(selectedYear, selectedMonth, 1);
        const lastDayOfMonth = new Date(selectedYear, selectedMonth + 1, 0, 23, 59, 59, 999);
        const userPermissions = allPermissions.filter(p => {
          if (p.userId !== usr.id || p.status !== 'APPROVED') return false;
          const start = parseDateOnly(p.startDate);
          const end = parseDateOnly(p.endDate);
          return start <= lastDayOfMonth && end >= firstDayOfMonth;
        });

        sortedDateStrings.forEach(dateStr => {
          let jamMasuk = '-';
          let jamKeluar = '-';
          let lokasi = '-';
          let status = 'Normal';

          // Approved manual repair or standard attendance logs
          const approvedInLog = userAttendance.find(a => a.type === 'IN' && (!a.isManual || a.status === 'APPROVED') && new Date(a.timestamp).toLocaleDateString('en-CA') === dateStr);
          const approvedOutLog = userAttendance.find(a => a.type === 'OUT' && (!a.isManual || a.status === 'APPROVED') && new Date(a.timestamp).toLocaleDateString('en-CA') === dateStr);

          if (approvedInLog || approvedOutLog) {
            jamMasuk = approvedInLog ? new Date(approvedInLog.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '-';
            jamKeluar = approvedOutLog ? new Date(approvedOutLog.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '-';
            lokasi = (approvedInLog || approvedOutLog)?.location || '-';
            
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
              lokasi = '';
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
                lokasi = '';
                status = 'Alpa';
              } else {
                // Return '-' or skip, but let's label holiday/weekend
                return;
              }
            }
          }

          exportData.push({
            'NIP': usr.nip || '-',
            'Nama': usr.nama,
            'Lembaga': usr.sekolah || '-',
            'Peran': usr.role === 'GURU' ? `Pendidik / Jabatan: ${usr.jabatan || 'Guru Kelas'}` : 'Kepala Sekolah',
            'Tanggal': dateStr,
            'Jam Masuk': jamMasuk,
            'Jam Keluar': jamKeluar,
            'Status Presensi': status,
            'Lokasi': lokasi
          });
        });
      });

      // Sort chronological latest first
      exportData.sort((a, b) => b.Tanggal.localeCompare(a.Tanggal));

      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Kehadiran');
      
      const wscols = [
        {wch: 20}, {wch: 25}, {wch: 30}, {wch: 25}, {wch: 15}, {wch: 12}, {wch: 12}, {wch: 20}, {wch: 30}
      ];
      worksheet['!cols'] = wscols;

      XLSX.writeFile(workbook, `Rekap_Presensi_Wilayah_${targetSchool?.name.replace(/\s+/g, '_') || 'Sekolah'}_${months[selectedMonth]}_${selectedYear}.xlsx`);
      showToast('Rekap absensi berhasil diunduh.', 'success');
    } catch (e) {
      console.error(e);
      showToast('Gagal merakit berkas Excel.', 'error');
    }
  };

  return (
    <div className="bg-white p-12 rounded-[3rem] border border-slate-100 shadow-sm text-center flex flex-col items-center max-w-2xl mx-auto my-6">
       <div className="w-24 h-24 bg-blue-50 text-blue-600 rounded-[2rem] flex items-center justify-center mb-8 shadow-inner">
          <FileSpreadsheet size={48} />
       </div>
       <h3 className="text-2xl font-black text-slate-800 mb-3 tracking-tight">Rekapitulasi Kinerja Wilayah</h3>
       <p className="text-slate-500 max-w-md mb-8 leading-relaxed font-semibold">Pilih periode pelaporan, sekolah sasaran, kemudian unduh data untuk kebutuhan peninjauan wilayah Dinas.</p>
       
       <div className="w-full space-y-4 mb-8">
         {/* School Selector */}
         <div className="text-left">
           <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest ml-2">Pilih Satuan Pendidikan</label>
           <select 
             value={selectedSchoolId}
             onChange={(e) => setSelectedSchoolId(e.target.value)}
             className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-black text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/20 hover:border-slate-200 transition-all appearance-none cursor-pointer"
           >
             {schools.map(school => (
               <option key={school.id} value={school.id}>{school.name}</option>
             ))}
           </select>
         </div>

         {/* Month & Year inside same row */}
         <div className="grid grid-cols-2 gap-4 w-full">
           <div className="text-left">
             <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest ml-2">Bulan</label>
             <select 
               value={selectedMonth}
               onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
               className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-black text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/20 hover:border-slate-200 transition-all appearance-none cursor-pointer"
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
               className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-black text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/20 hover:border-slate-200 transition-all appearance-none cursor-pointer"
             >
               {years.map(y => (
                 <option key={y} value={y}>{y}</option>
               ))}
             </select>
           </div>
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
