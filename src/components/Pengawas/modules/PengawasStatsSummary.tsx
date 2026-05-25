import React from 'react';
import { Clock, FileWarning, ShieldCheck, Trophy } from 'lucide-react';
import { StatsCard } from '../../ui/StatsCard';

interface PengawasStatsSummaryProps {
  totalMissingAttendance: number;
  totalNoDocs: number;
  currentMonth: string;
  pendingKsDocsCount: number;
  topSchool: { schoolName: string; totalScore: number } | undefined;
  onFilterClick: (type: 'ALERT' | 'WARNING' | 'ALL') => void;
}

export function PengawasStatsSummary({ 
  totalMissingAttendance, 
  totalNoDocs, 
  currentMonth, 
  pendingKsDocsCount, 
  topSchool,
  onFilterClick
}: PengawasStatsSummaryProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
      <div onClick={() => onFilterClick('ALERT')} className="cursor-pointer active:scale-95 transition-transform">
        <StatsCard 
          label="Absensi Nihil" 
          value={totalMissingAttendance} 
          icon={<Clock />} 
          color={totalMissingAttendance > 20 ? "bg-rose-50" : "bg-white"} 
          textColor={totalMissingAttendance > 20 ? "text-rose-600" : "text-slate-900"} 
          detail={`${totalMissingAttendance} Personel Belum Masuk Hari Ini`} 
        />
      </div>
      <div onClick={() => onFilterClick('WARNING')} className="cursor-pointer active:scale-95 transition-transform">
        <StatsCard 
          label="Tunggakan Berkas" 
          value={totalNoDocs} 
          icon={<FileWarning />} 
          color={totalNoDocs > 30 ? "bg-amber-50" : "bg-white"} 
          textColor={totalNoDocs > 30 ? "text-amber-600" : "text-slate-900"} 
          detail={`Bulan ${currentMonth}`} 
        />
      </div>
      <StatsCard 
        label="Saran Validasi" 
        value={pendingKsDocsCount} 
        icon={<ShieldCheck />} 
        color="bg-blue-50" 
        textColor="text-blue-600" 
        detail="Dokumen Kepala Sekolah" 
      />
      <StatsCard 
        label="Performa Sekolah Terbaik" 
        value={topSchool ? topSchool.schoolName : '-'} 
        icon={<Trophy />} 
        color="bg-white" 
        textColor="text-slate-900" 
        detail={`${topSchool?.totalScore || 0} Poin Performa`} 
      />
    </div>
  );
}
