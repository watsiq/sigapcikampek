import React from 'react';
import { ShieldCheck, FileText, Trophy } from 'lucide-react';
import { StatsCard } from '../../ui/StatsCard';
import { MONTHS } from '../../../constants';

interface GuruStatsSummaryProps {
  selectedMonth: number;
  monthlyStats: {
    hadirNormal: number;
    hadirPerbaikan: number;
    workDays: number;
  };
  myMonthlyDocsCount: number;
  totalScore: number;
}

export function GuruStatsSummary({ 
  selectedMonth, 
  monthlyStats, 
  myMonthlyDocsCount, 
  totalScore 
}: GuruStatsSummaryProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <StatsCard 
        label={`Kehadiran ${MONTHS[selectedMonth]}`} 
        value={`${monthlyStats.hadirNormal + monthlyStats.hadirPerbaikan} / ${monthlyStats.workDays} Hari`} 
        detail={`Normal: ${monthlyStats.hadirNormal}, Perbaikan: ${monthlyStats.hadirPerbaikan}`}
        icon={<ShieldCheck />} 
        color="bg-emerald-50 text-emerald-600" 
      />
      <StatsCard 
        label="Kelengkapan Berkas" 
        value={`${myMonthlyDocsCount} / 2`} 
        icon={<FileText />} 
        color="bg-blue-50 text-blue-600" 
      />
      <StatsCard 
        label="Poin Apresiasi" 
        value={`${totalScore} Pts`} 
        icon={<Trophy />} 
        color="bg-amber-50 text-amber-600" 
      />
    </div>
  );
}
