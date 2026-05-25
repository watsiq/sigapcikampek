import React from 'react';
import { CheckCircle, XCircle } from 'lucide-react';
import { Permission, UserProfile } from '../../../types';
import { Skeleton } from '../../ui/Skeleton';

interface KSPermissionTableProps {
  pendingPerms: Permission[];
  users: UserProfile[];
  onReview: (permId: string, status: 'APPROVED' | 'REJECTED') => void;
  isLoading?: boolean;
}

export function KSPermissionTable({ pendingPerms, users, onReview, isLoading }: KSPermissionTableProps) {
  return (
    <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden">
       <div className="p-8 border-b border-slate-100 bg-slate-50/10">
          <div className="flex flex-col gap-1">
            <span className="text-[9px] font-black text-rose-600 uppercase tracking-widest">Perlu Persetujuan</span>
            <h3 className="text-lg font-black text-slate-800 tracking-tight">Persetujuan Dinas, Izin & Cuti</h3>
          </div>
       </div>
       <div className="overflow-x-auto">
          <table className="w-full text-left">
             <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                <tr>
                   <th className="px-8 py-6">Guru</th>
                   <th className="px-8 py-6">Alasan & Durasi</th>
                   <th className="px-8 py-6 text-center">Keputusan</th>
                </tr>
             </thead>
             <tbody className="divide-y divide-slate-50">
                {isLoading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <tr key={i}>
                      <td className="px-8 py-6"><Skeleton className="w-32 h-4" /></td>
                      <td className="px-8 py-6">
                        <div className="space-y-3">
                          <Skeleton className="w-16 h-4" />
                          <Skeleton className="w-full h-8 rounded-lg" />
                          <Skeleton className="w-24 h-3" />
                        </div>
                      </td>
                      <td className="px-8 py-6 flex justify-center space-x-3">
                         <Skeleton className="w-10 h-10 rounded-xl" />
                         <Skeleton className="w-10 h-10 rounded-xl" />
                      </td>
                    </tr>
                  ))
                ) : pendingPerms.length === 0 ? (
                  <tr><td colSpan={3} className="px-8 py-20 text-center text-slate-300 font-black uppercase tracking-widest text-sm italic">Belum ada pengajuan izin masuk</td></tr>
                ) : (
                  pendingPerms.map((p: any) => (
                    <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                       <td className="px-8 py-6 font-black text-slate-800">{users.find((u: any) => u.id === p.userId)?.nama}</td>
                       <td className="px-8 py-6">
                          <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md uppercase tracking-widest">{p.leaveType || p.type.replace('_', ' ')}</span>
                          <p className="text-sm font-medium text-slate-600 mt-2 mb-1">"{p.reason}"</p>
                          <p className="text-[10px] text-slate-400 font-bold">{new Date(p.startDate).toLocaleDateString()} - {new Date(p.endDate).toLocaleDateString()}</p>
                       </td>
                       <td className="px-8 py-6">
                          <div className="flex justify-center space-x-3">
                             <button onClick={() => onReview(p.id, 'REJECTED')} className="p-3 bg-rose-50 text-rose-500 rounded-xl hover:bg-rose-500 hover:text-white transition-all shadow-sm"><XCircle size={18} /></button>
                             <button onClick={() => onReview(p.id, 'APPROVED')} className="p-3 bg-emerald-50 text-emerald-500 rounded-xl hover:bg-emerald-500 hover:text-white transition-all shadow-sm"><CheckCircle size={18} /></button>
                          </div>
                       </td>
                    </tr>
                  ))
                )}
             </tbody>
          </table>
       </div>
    </div>
  );
}
