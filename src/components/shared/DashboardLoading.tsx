import React from 'react';
import { StatsSkeleton, TableSkeleton } from '../ui/Skeleton';

export function DashboardLoading() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header Skeleton */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm">
        <div className="flex items-center space-x-6">
          <div className="w-20 h-20 bg-slate-100 rounded-3xl animate-pulse" />
          <div className="space-y-3">
            <div className="w-64 h-8 bg-slate-100 rounded-lg animate-pulse" />
            <div className="w-40 h-4 bg-slate-100 rounded-lg animate-pulse" />
          </div>
        </div>
        <div className="w-32 h-12 bg-slate-100 rounded-2xl animate-pulse" />
      </div>

      {/* Stats Skeleton */}
      <StatsSkeleton />

      {/* Table Section Skeleton */}
      <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm space-y-8">
        <div className="flex space-x-4">
          <div className="w-32 h-10 bg-slate-100 rounded-xl animate-pulse" />
          <div className="w-32 h-10 bg-slate-100 rounded-xl animate-pulse" />
          <div className="w-32 h-10 bg-slate-100 rounded-xl animate-pulse" />
        </div>
        <TableSkeleton rows={6} cols={5} />
      </div>
    </div>
  );
}
