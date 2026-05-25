import React from 'react';
import { DocumentInfo, UserProfile } from '../../../types';
import { Skeleton } from '../../ui/Skeleton';

interface KSVerificationTableProps {
  pendingDocs: DocumentInfo[];
  users: UserProfile[];
  onSelectDoc: (doc: DocumentInfo) => void;
  isLoading?: boolean;
}

export function KSVerificationTable({ pendingDocs, users, onSelectDoc, isLoading }: KSVerificationTableProps) {
  return (
    <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
      <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/30">
        <div className="flex flex-col gap-1">
          <span className="text-[9px] font-black text-blue-600 uppercase tracking-widest">Verifikasi & Evaluasi</span>
          <h3 className="text-lg font-black text-slate-800 tracking-tight">Verifikasi Log Kinerja Guru</h3>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
            <tr>
              <th className="px-8 py-6">Profil Pengirim</th>
              <th className="px-8 py-6">Kategori Berkas</th>
              <th className="px-8 py-6">Tindakan</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <tr key={i}>
                  <td className="px-8 py-6">
                    <div className="flex items-center space-x-3">
                      <Skeleton className="w-10 h-10 rounded-full" />
                      <div className="space-y-2">
                        <Skeleton className="w-32 h-4" />
                        <Skeleton className="w-20 h-3" />
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="space-y-2">
                      <Skeleton className="w-40 h-4" />
                      <Skeleton className="w-16 h-4" />
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <Skeleton className="w-24 h-10 rounded-xl" />
                  </td>
                </tr>
              ))
            ) : pendingDocs.length === 0 ? (
              <tr><td colSpan={3} className="px-8 py-20 text-center text-slate-300 font-black uppercase tracking-widest italic text-sm">Antrean Berkas Kosong</td></tr>
            ) : (
              pendingDocs.map((doc: any) => (
                <tr key={doc.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-8 py-6">
                     <div className="font-black text-slate-800 text-sm">{users.find(u => u.id === doc.userId)?.nama || 'Guru'}</div>
                     <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">NIP: {users.find((u: any) => u.id === doc.userId)?.nip}</div>
                  </td>
                  <td className="px-8 py-6">
                     <div className="font-bold text-slate-600 mb-1">{doc.fileName}</div>
                     <span className="text-[9px] font-black text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg uppercase tracking-widest">{doc.type === 'RPP_LENGKAP' ? 'RPP LENGKAP' : doc.type.replace('_', ' ')}</span>
                  </td>
                  <td className="px-8 py-6">
                     <button onClick={() => onSelectDoc(doc)} className="px-6 py-2.5 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all shadow-xl">Evaluasi</button>
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
