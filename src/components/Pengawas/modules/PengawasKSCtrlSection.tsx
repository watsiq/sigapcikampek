import React from 'react';
import { ShieldCheck, Building2, FileClock, Fingerprint, School, CheckCircle, Medal, Download } from 'lucide-react';
import { UserProfile, DocumentInfo, Permission, Attendance } from '../../../types';

interface PengawasKSCtrlSectionProps {
  activeSubTab: 'docs' | 'permissions' | 'attendance';
  setActiveSubTab: (tab: 'docs' | 'permissions' | 'attendance') => void;
  pendingKsDocsCount: number;
  pendingKsPermsCount: number;
  pendingKsManualAttCount: number;
  ksDocs: DocumentInfo[];
  users: UserProfile[];
  onSelectDoc: (doc: DocumentInfo) => void;
  pendingKsPerms: Permission[];
  onPermissionReview: (id: string, status: 'APPROVED' | 'REJECTED') => void;
  pendingKsManualAtt: Attendance[];
  onManualAttReview: (id: string, status: 'APPROVED' | 'REJECTED') => void;
}

export function PengawasKSCtrlSection({
  activeSubTab,
  setActiveSubTab,
  pendingKsDocsCount,
  pendingKsPermsCount,
  pendingKsManualAttCount,
  ksDocs,
  users,
  onSelectDoc,
  pendingKsPerms,
  onPermissionReview,
  pendingKsManualAtt,
  onManualAttReview
}: PengawasKSCtrlSectionProps) {
  return (
    <div className="lg:col-span-3 bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden h-fit relative">
      <div className="p-8 border-b border-slate-100 bg-slate-50/30 backdrop-blur-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <h3 className="text-lg font-black text-slate-800 tracking-tight flex items-center space-x-3">
            <div className="p-2.5 bg-blue-600/10 text-blue-600 rounded-xl">
              <ShieldCheck size={20} />
            </div>
            <span>Pusat Kendali Mutu Kepala Sekolah</span>
          </h3>
          <div className="flex flex-wrap p-1 bg-white border border-slate-200 rounded-2xl shadow-sm">
            {[
              { id: 'docs', label: 'Dokumen', icon: <Building2 size={14} />, count: pendingKsDocsCount },
              { id: 'permissions', label: 'Izin/Cuti', icon: <FileClock size={14} />, count: pendingKsPermsCount },
              { id: 'attendance', label: 'Presensi', icon: <Fingerprint size={14} />, count: pendingKsManualAttCount }
            ].map(t => (
              <button
                key={t.id}
                onClick={() => setActiveSubTab(t.id as any)}
                className={`flex items-center space-x-2 px-6 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${activeSubTab === t.id ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/30' : 'text-slate-400 hover:bg-slate-50'}`}
              >
                {t.icon}
                <span className="hidden sm:inline">{t.label}</span>
                {t.count > 0 && <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[7px] ${activeSubTab === t.id ? 'bg-white text-slate-900' : 'bg-rose-500 text-white shadow-sm'}`}>{t.count}</span>}
              </button>
            ))}
          </div>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        {activeSubTab === 'docs' && (
         <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-[10px] text-slate-400 uppercase font-black tracking-widest border-b border-slate-100">
              <tr>
                <th className="px-8 py-6">Entitas Sekolah</th>
                <th className="px-8 py-6">Kategori Berkas</th>
                <th className="px-8 py-6">Status Valid</th>
                <th className="px-8 py-6">Tindakan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {ksDocs.length === 0 ? (
                <tr><td colSpan={4} className="px-8 py-20 text-center text-slate-300 font-medium italic bg-slate-50/30">Belum ada dokumen strategis masuk dari Kepala Sekolah</td></tr>
              ) : (
                ksDocs.map((doc: any) => (
                  <tr key={doc.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-8 py-6 min-w-0">
                       <div className="flex items-center space-x-4 min-w-0">
                          <div className="p-3 bg-white rounded-xl border border-slate-200 text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 group-hover:border-indigo-100 transition-all shadow-sm shrink-0">
                             <School size={18} />
                          </div>
                          <div className="min-w-0 flex-1">
                             <div className="font-black text-slate-800 tracking-tight truncate max-w-[180px]">{doc.sekolah}</div>
                             <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none mt-1 truncate">KS: {users.find((u: any) => u.id === doc.userId)?.nama || 'Unknown'}</div>
                          </div>
                       </div>
                    </td>
                    <td className="px-8 py-6">
                       <span className="px-4 py-1.5 bg-white border border-slate-200 text-blue-600 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-sm">{doc.type}</span>
                    </td>
                    <td className="px-8 py-6">
                       <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${
                         doc.status === 'PENDING' ? 'bg-amber-500/10 text-amber-600' : 
                         doc.status === 'REVISION' ? 'bg-rose-500/10 text-rose-600' : 'bg-emerald-500/10 text-emerald-600'
                       }`}>
                         {doc.status === 'PENDING' ? 'Menunggu' : doc.status === 'REVISION' ? 'Revisi' : 'Selesai'}
                       </span>
                    </td>
                    <td className="px-8 py-6">
                      {doc.status === 'PENDING' ? (
                         <button 
                           onClick={() => onSelectDoc(doc)} 
                           className="text-[10px] font-black text-white bg-slate-900 px-6 py-3 rounded-xl hover:bg-blue-600 transition-all flex items-center space-x-2 shadow-xl shadow-slate-900/20 active:scale-95"
                         >
                            <CheckCircle size={14} /> <span>Validasi</span>
                         </button>
                      ) : (
                         <div className="flex items-center text-emerald-600 text-sm font-black space-x-4">
                           <div className="flex items-center space-x-2">
                             <Medal size={16} /> <span>{doc.score} Poin</span>
                           </div>
                           {doc.link && (
                             <button 
                               onClick={() => window.open(doc.link, '_blank')}
                               className="p-3 bg-white border border-slate-100 text-emerald-600 rounded-xl hover:bg-emerald-50 transition-all shadow-sm active:scale-90"
                               title="Unduh Berkas"
                             >
                               <Download size={16} />
                             </button>
                           )}
                         </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
         </table>
        )}

        {activeSubTab === 'permissions' && (
          <table className="w-full text-left">
            {/* Same structure as permissions table in KepalaSekolah but for KS */}
            {/* I will copy it from the original file content */}
             <thead className="bg-slate-50 text-[10px] text-slate-400 uppercase font-black tracking-widest border-b border-slate-100">
               <tr>
                 <th className="px-8 py-6">Kepala Sekolah</th>
                 <th className="px-8 py-6">Alasan & Durasi</th>
                 <th className="px-8 py-6 text-center">Tindakan</th>
               </tr>
             </thead>
             <tbody className="divide-y divide-slate-50">
               {pendingKsPermsCount === 0 ? (
                 <tr><td colSpan={3} className="px-8 py-20 text-center text-slate-300 font-black uppercase tracking-widest text-[10px] italic">Antrean izin nihil</td></tr>
               ) : (
                 pendingKsPerms.map((p: any) => (
                   <tr key={p.id}>
                     <td className="px-8 py-6">
                        <div className="font-black text-slate-800">{users.find((u: any) => u.id === p.userId)?.nama}</div>
                        <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{users.find((u: any) => u.id === p.userId)?.sekolah}</div>
                     </td>
                     <td className="px-8 py-6">
                        <span className="text-[9px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md uppercase tracking-widest">{p.leaveType || p.type.replace('_', ' ')}</span>
                        <p className="text-xs font-medium text-slate-600 mt-2 italic">"{p.reason}"</p>
                        <p className="text-[9px] text-slate-400 font-bold mt-1 uppercase">{new Date(p.startDate).toLocaleDateString()} - {new Date(p.endDate).toLocaleDateString()}</p>
                     </td>
                     <td className="px-8 py-6">
                        <div className="flex justify-center space-x-3">
                           {/* Simplified actions for subtab */}
                          <button onClick={() => onPermissionReview(p.id, 'REJECTED')} className="p-3 bg-rose-50 text-rose-500 rounded-xl font-black text-[9px] uppercase tracking-widest shadow-sm hover:bg-rose-500 hover:text-white transition-all active:scale-95 border border-rose-100">Tolak</button>
                          <button onClick={() => onPermissionReview(p.id, 'APPROVED')} className="p-3 bg-emerald-50 text-emerald-500 rounded-xl font-black text-[9px] uppercase tracking-widest shadow-sm hover:bg-emerald-500 hover:text-white transition-all active:scale-95 border border-emerald-100">Sahkan</button>
                        </div>
                     </td>
                   </tr>
                 ))
               )}
             </tbody>
          </table>
        )}

        {activeSubTab === 'attendance' && (
          <table className="w-full text-left">
             <thead className="bg-slate-50 text-[10px] text-slate-400 uppercase font-black tracking-widest border-b border-slate-100">
               <tr>
                 <th className="px-8 py-6">Kepala Sekolah</th>
                 <th className="px-8 py-6">Log Kehadiran</th>
                 <th className="px-8 py-6 text-center">Tindakan</th>
               </tr>
             </thead>
             <tbody className="divide-y divide-slate-50">
               {pendingKsManualAttCount === 0 ? (
                 <tr><td colSpan={3} className="px-8 py-20 text-center text-slate-300 font-black uppercase tracking-widest text-[10px] italic">Antrean perbaikan absen nihil</td></tr>
               ) : (
                 pendingKsManualAtt.map((a: any) => (
                   <tr key={a.id}>
                     <td className="px-8 py-6">
                        <div className="font-black text-slate-800">{users.find((u: any) => u.id === a.userId)?.nama}</div>
                        <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{new Date(a.timestamp).toLocaleDateString()}</div>
                     </td>
                     <td className="px-8 py-6">
                        <span className="text-[9px] font-black text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md uppercase tracking-widest">{a.type === 'IN' ? 'MASUK' : 'PULANG'} : {new Date(a.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        <p className="text-xs font-medium text-slate-600 mt-2 italic">Alasan: "{a.reason}"</p>
                     </td>
                     <td className="px-8 py-6">
                        <div className="flex justify-center space-x-3">
                            <button onClick={() => onManualAttReview(a.id, 'REJECTED')} className="p-3 bg-rose-50 text-rose-500 rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all shadow-sm active:scale-95 border border-rose-100">Tolak</button>
                            <button onClick={() => onManualAttReview(a.id, 'APPROVED')} className="p-3 bg-emerald-50 text-emerald-500 rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-emerald-500 hover:text-white transition-all shadow-sm active:scale-95 border border-emerald-100">Sahkan</button>
                        </div>
                     </td>
                   </tr>
                 ))
               )}
             </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
