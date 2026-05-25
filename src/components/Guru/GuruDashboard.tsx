/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Fingerprint, 
  FileClock,
  CalendarCheck
} from 'lucide-react';
import { 
  UserProfile, 
  Attendance, 
  DocumentInfo, 
  Permission, 
  TeacherRanking 
} from '../../types';
import { getHolidayName } from '../../utils/holidayHelper';

// Modular Components
import { GuruAlerts } from './modules/GuruAlerts';
import { GuruStatsSummary } from './modules/GuruStatsSummary';
import { GuruPerformanceCard } from './modules/GuruPerformanceCard';
import { GuruDocumentLog } from './modules/GuruDocumentLog';
import { GuruAttendanceChart } from './modules/GuruAttendanceChart';
import { GuruPermissionList } from './modules/GuruPermissionList';

interface GuruDashboardProps {
  user: UserProfile;
  allAttendance: Attendance[];
  setAttendance: (att: Attendance[] | ((prev: Attendance[]) => Attendance[])) => void;
  allDocuments: DocumentInfo[];
  setDocuments: (docs: DocumentInfo[] | ((prev: DocumentInfo[]) => DocumentInfo[])) => void;
  teacherRankings: TeacherRanking[];
  permissions: Permission[];
  setPermissions: (perms: Permission[] | ((prev: Permission[]) => Permission[])) => void;
}

export function GuruDashboard({ 
  user, 
  allAttendance, 
  allDocuments, 
  teacherRankings, 
  permissions, 
}: GuruDashboardProps) {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  
  const myAttendance = allAttendance.filter((a: any) => a.userId === user.id);
  const myMonthlyDocs = allDocuments.filter((d: any) => d.userId === user.id && d.category === 'MONTHLY');
  const myPermissions = permissions.filter((p: any) => p.userId === user.id).sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
  
  const totalScore = myMonthlyDocs.reduce((sum: number, d: any) => sum + (d.score || 0), 0);
  const myRankIndex = teacherRankings.findIndex((t: any) => t.id === user.id) + 1;

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

      const holidayName = getHolidayName(dDate, user.schoolId);
      if (isWeekend || holidayName) {
        stats.hariLibur++;
        continue;
      }

      stats.workDays++;

      const dayLogs = myAttendance.filter(a => {
        const logDate = new Date(a.timestamp);
        return logDate.getDate() === d && logDate.getMonth() === month && logDate.getFullYear() === year;
      });
      
      const inLog = dayLogs.find(l => l.type === 'IN');
      const outLog = dayLogs.find(l => l.type === 'OUT');
      
      const effectiveInLog = inLog && (!inLog.isManual || inLog.status === 'APPROVED') ? inLog : null;
      const effectiveOutLog = outLog && (!outLog.isManual || outLog.status === 'APPROVED') ? outLog : null;
      
      const dayPermission = myPermissions.find(p => {
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
  
  const todayStr = new Date().toISOString().split('T')[0];
  const hasAttendedToday = myAttendance.some(a => a.type === 'IN' && a.timestamp.includes(todayStr));
  const docsThisMonth = allDocuments.filter(d => d.userId === user.id && d.uploadDate.includes(new Date().toISOString().slice(0, 7)));
  
  const alerts: any[] = [];
  if (!hasAttendedToday) {
    alerts.push({
      type: 'RED',
      title: 'Presensi Datang Belum Terekam',
      message: 'Segera lakukan pindaian kehadiran hari ini untuk menghindari status alfa.',
      icon: <Fingerprint size={20} />
    });
  }
  if (docsThisMonth.length < 2) {
    alerts.push({
      type: 'YELLOW',
      title: 'Tunggakan Dokumen Bulanan',
      message: `Anda baru mengunggah ${docsThisMonth.length}/2 berkas wajib untuk bulan ini.`,
      icon: <FileClock size={20} />
    });
  }

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

  return (
    <div className="space-y-8">
      <GuruAlerts alerts={alerts} />

      {/* Holiday Information Indicator */}
      <div className="bg-blue-50/60 border border-blue-100 rounded-2xl p-4 flex items-center justify-between text-blue-800 text-xs sm:text-sm shadow-xs">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 text-white p-1.5 rounded-lg">
            <CalendarCheck size={18} />
          </div>
          <div>
            <p className="font-semibold text-blue-900">Kalender Hari Libur Nasional SKB 3 Menteri</p>
            <p className="text-blue-700/90 text-[11px] sm:text-xs">
              Hari libur nasional dihitung otomatis dari database statis lokal dan mengurangi jumlah hari kerja efektif guru.
            </p>
          </div>
        </div>
      </div>

      <GuruStatsSummary 
        selectedMonth={selectedMonth}
        monthlyStats={monthlyStats}
        myMonthlyDocsCount={myMonthlyDocs.length}
        totalScore={totalScore}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-8">
          <GuruPerformanceCard 
            myMonthlyDocsCount={myMonthlyDocs.length}
            myRankIndex={myRankIndex}
            totalRankings={teacherRankings.length}
          />

          <GuruDocumentLog documents={myMonthlyDocs} />
        </div>

        <div className="lg:col-span-4 space-y-8">
          <GuruAttendanceChart 
            selectedMonth={selectedMonth}
            setSelectedMonth={setSelectedMonth}
            chartData={chartData}
          />

          <GuruPermissionList permissions={myPermissions} />
        </div>
      </div>
    </div>
  );
}
