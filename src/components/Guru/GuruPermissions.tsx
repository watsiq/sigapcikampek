import React, { useState } from 'react';
import { 
  FileClock, 
  History, 
  Calendar, 
  Repeat 
} from 'lucide-react';
import { Permission, UserProfile } from '../../types';
import { useNotifications } from '../../context/NotificationContext';

interface GuruPermissionsProps {
  user: any;
  permissions: Permission[];
  setPermissions: (permissions: Permission[] | ((prev: Permission[]) => Permission[])) => void;
  users: UserProfile[];
}

export function GuruPermissions({ user, permissions, setPermissions, users }: GuruPermissionsProps) {
  const { showToast, addNotification } = useNotifications();
  const [pType, setPType] = useState<Permission['type']>('IZIN');
  const [leaveType, setLeaveType] = useState<string>('Cuti Tahunan');
  
  const leaveTypes = ['Cuti Tahunan', 'Cuti Sakit', 'Cuti Bersama'];
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Permission Form */}
      <div className="lg:col-span-5 bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm">
        <h3 className="text-xl font-black text-slate-800 mb-8 flex items-center space-x-3 tracking-tight">
          <FileClock size={24} className="text-indigo-600" />
          <span>Pengajuan Izin & Cuti</span>
        </h3>
        <form className="space-y-6" onSubmit={(e) => {
          e.preventDefault();
          const target = e.target as any;
          const newPerm: Permission = {
            id: Date.now().toString(),
            userId: user.id,
            schoolId: user.schoolId,
            type: pType,
            leaveType: pType === 'CUTI' ? leaveType : undefined,
            startDate: target.startDate.value,
            endDate: target.endDate.value,
            reason: target.reason.value,
            status: 'PENDING',
            uploadDate: new Date().toISOString()
          };
          setPermissions(prev => [...prev, newPerm]);
          showToast(`Permohonan ${pType === 'CUTI' ? leaveType : pType} berhasil diajukan!`, 'success');
          
          const isKS = user.role === 'KEPALA_SEKOLAH';
          const notificationTitle = pType === 'CUTI' ? `Pengajuan ${leaveType}` : `Pengajuan ${pType}`;
          const notificationMessage = `${user.nama} mengajukan ${pType === 'CUTI' ? leaveType : pType}`;

          if (isKS) {
            const pengawas = users.find((u: UserProfile) => u.role === 'PENGAWAS');
            if (pengawas) {
              addNotification(pengawas.id, notificationTitle + ' (KS)', notificationMessage, 'PERMISSION');
            }
          } else {
            const principal = users.find((u: UserProfile) => u.schoolId === user.schoolId && u.role === 'KEPALA_SEKOLAH');
            if (principal) {
              addNotification(principal.id, notificationTitle, notificationMessage, 'PERMISSION');
            }
          }
          target.reset();
        }}>
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">Kategori Izin</label>
            <div className="grid grid-cols-3 gap-3">
              {(['CUTI', 'IZIN', 'DINAS_LUAR'] as const).map(t => (
                <button 
                  key={t}
                  type="button"
                  onClick={() => setPType(t)}
                  className={`py-3 rounded-xl text-[9px] font-black transition-all border ${pType === t ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg' : 'bg-slate-50 border-slate-100 text-slate-400 hover:bg-white hover:border-indigo-100'}`}
                >
                  {t.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          {pType === 'CUTI' && (
            <div className="animate-in fade-in slide-in-from-top-2 duration-300">
              <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">Jenis Cuti</label>
              <div className="grid grid-cols-2 gap-3">
                {leaveTypes.map(t => (
                  <button 
                    key={t}
                    type="button"
                    onClick={() => setLeaveType(t)}
                    className={`py-3 rounded-xl text-[9px] font-black transition-all border ${leaveType === t ? 'bg-indigo-100 border-indigo-200 text-indigo-700 shadow-sm' : 'bg-slate-50 border-slate-100 text-slate-400 hover:bg-white hover:border-indigo-100'}`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">Tanggal Mulai</label>
              <input name="startDate" type="date" required className="w-full p-4 bg-slate-100 border-none rounded-2xl text-[11px] font-black outline-none focus:ring-4 focus:ring-indigo-100 transition-all" />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">Tanggal Akhir</label>
              <input name="endDate" type="date" required className="w-full p-4 bg-slate-100 border-none rounded-2xl text-[11px] font-black outline-none focus:ring-4 focus:ring-indigo-100 transition-all" />
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">Uraian Alasan</label>
            <textarea name="reason" required placeholder="Jelaskan dasar permohonan ketidakhadiran Anda..." className="w-full p-5 bg-slate-100 border-none rounded-[2rem] text-sm outline-none focus:ring-4 focus:ring-indigo-100 transition-all h-32 font-medium" />
          </div>
          <button type="submit" className="w-full py-6 bg-indigo-600 text-white rounded-[2rem] font-black uppercase tracking-widest text-[11px] hover:bg-slate-900 transition-all shadow-xl active:scale-95">
            Kirim Permohonan
          </button>
        </form>
      </div>

      <div className="lg:col-span-7 bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm">
        <h3 className="text-xl font-black text-slate-800 mb-8 flex items-center space-x-3 tracking-tight">
          <History size={24} className="text-slate-400" />
          <span>Riwayat Pengajuan</span>
        </h3>
        <div className="space-y-4">
          {permissions.filter((p: any) => p.userId === user.id).length === 0 ? (
            <div className="p-20 text-center text-slate-300 font-bold uppercase tracking-widest text-[10px]">Belum ada riwayat pengajuan</div>
          ) : (
            permissions.filter((p: any) => p.userId === user.id).reverse().map((p: any) => (
              <div key={p.id} className="p-6 bg-slate-50 rounded-[2rem] border border-slate-200/50 flex items-center justify-between group hover:bg-white hover:shadow-xl transition-all">
                <div className="flex items-center space-x-5">
                   <div className={`p-4 rounded-2xl shadow-sm ${p.status === 'APPROVED' ? 'bg-emerald-500 text-white' : p.status === 'REJECTED' ? 'bg-rose-500 text-white' : 'bg-amber-100 text-amber-600'}`}>
                      {p.type === 'CUTI' ? <Calendar /> : p.type === 'DINAS_LUAR' ? <Repeat /> : <FileClock />}
                   </div>
                   <div>
                      <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">
                        {p.leaveType || p.type.replace('_', ' ')}
                      </div>
                      <div className="text-sm font-black text-slate-800 tracking-tight">{new Date(p.startDate).toLocaleDateString('id-ID')} - {new Date(p.endDate).toLocaleDateString('id-ID')}</div>
                      <p className="text-[10px] text-slate-500 mt-1 line-clamp-1 italic font-medium">"{p.reason}"</p>
                   </div>
                </div>
                <div className="text-right">
                   <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest shadow-sm ${p.status === 'APPROVED' ? 'bg-emerald-500 text-white' : p.status === 'REJECTED' ? 'bg-rose-500 text-white' : 'bg-amber-500 text-white'}`}>
                      {p.status}
                   </span>
                   <div className="text-[8px] text-slate-300 font-bold mt-2 uppercase tracking-tighter">Diajukan: {new Date(p.uploadDate).toLocaleDateString()}</div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
