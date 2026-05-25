import React from 'react';
import { MapPin } from 'lucide-react';
import { Skeleton } from '../../ui/Skeleton';

interface KSManualAttendanceTableProps {
  groupedAttendance: any[];
  onReview: (group: any, status: 'APPROVED' | 'REJECTED') => void;
  isLoading?: boolean;
}

export function KSManualAttendanceTable({ groupedAttendance, onReview, isLoading }: KSManualAttendanceTableProps) {
  return (
    <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden">
       <div className="p-8 border-b border-slate-100 bg-slate-50/10">
          <div className="flex flex-col gap-1">
            <span className="text-[9px] font-black text-rose-600 uppercase tracking-widest">Perlu Persetujuan</span>
            <h3 className="text-lg font-black text-slate-800 tracking-tight">Approval Perbaikan Presensi Kehadiran</h3>
          </div>
       </div>
       <div className="overflow-x-auto">
          <table className="w-full text-left">
             <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                <tr>
                   <th className="px-8 py-6">Guru</th>
                   <th className="px-8 py-6">Detail Waktu & Alasan</th>
                   <th className="px-8 py-6 text-center">Tindakan</th>
                    <th className="px-8 py-6">Lokasi</th>
                </tr>
             </thead>
             <tbody className="divide-y divide-slate-50">
                {isLoading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <tr key={i}>
                      <td className="px-8 py-6">
                        <div className="space-y-2">
                          <Skeleton className="w-32 h-4" />
                          <Skeleton className="w-24 h-3" />
                        </div>
                      </td>
                      <td className="px-8 py-6">
                         <div className="flex gap-2 mb-3">
                           <Skeleton className="w-20 h-6 rounded-lg" />
                           <Skeleton className="w-20 h-6 rounded-lg" />
                         </div>
                         <Skeleton className="w-full h-4" />
                      </td>
                      <td className="px-8 py-6">
                         <div className="flex justify-center space-x-3">
                            <Skeleton className="w-16 h-10 rounded-xl" />
                            <Skeleton className="w-16 h-10 rounded-xl" />
                         </div>
                      </td>
                      <td className="px-8 py-6">
                         <Skeleton className="w-24 h-4" />
                      </td>
                    </tr>
                  ))
                ) : groupedAttendance.length === 0 ? (
                  <tr><td colSpan={4} className="px-8 py-20 text-center text-slate-300 font-black uppercase tracking-widest text-sm italic">Antrean perbaikan presensi nihil</td></tr>
                ) : (
                  groupedAttendance.map((group: any) => (
                    <tr key={`${group.userId}-${group.date}`} className="hover:bg-slate-50 transition-colors">
                       <td className="px-8 py-6">
                          <div className="font-black text-slate-800">{group.userName}</div>
                          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">{new Date(group.date).toLocaleDateString('id-ID', { dateStyle: 'long' })}</div>
                       </td>
                       <td className="px-8 py-6">
                          <div className="flex flex-wrap gap-2 mb-2">
                             {group.entries.map((ent: any) => (
                                <span key={ent.id} className="inline-flex items-center px-2.5 py-1 bg-blue-50 text-blue-600 rounded-lg text-[9px] font-black uppercase tracking-widest border border-blue-100">
                                   {ent.type === 'IN' ? 'MASUK' : 'PULANG'}: {new Date(ent.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                             ))}
                          </div>
                          <p className="text-[11px] text-slate-500 font-medium">Alasan: <span className="italic">"{group.reason}"</span></p>
                       </td>
                       <td className="px-8 py-6">
                          <div className="flex justify-center space-x-3">
                             <button onClick={() => onReview(group, 'REJECTED')} className="px-5 py-2.5 bg-rose-50 text-rose-500 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all">Tolak</button>
                             <button onClick={() => onReview(group, 'APPROVED')} className="px-5 py-2.5 bg-emerald-50 text-emerald-500 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-500 hover:text-white transition-all">Sahkan</button>
                          </div>
                       </td>
                       <td className="px-8 py-6">
                          <div className="flex flex-col">
                             <div className="flex items-center space-x-2">
                                <MapPin size={12} className="text-slate-400" />
                                <span className="text-[10px] font-bold text-slate-600 truncate max-w-[150px]">
                                   {group.entries[0]?.location || 'Tidak Terdeteksi'}
                                </span>
                             </div>
                             {group.entries.some((e: any) => e.isAtSchool) && (
                                <span className="text-[8px] font-black text-blue-500 uppercase tracking-widest mt-1 ml-5">Sesuai Unit Kerja</span>
                             )}
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
