import React, { useState } from 'react';
import { 
  ArrowLeftRight, 
  ShieldAlert, 
  ArrowRight, 
  XCircle, 
  School, 
  Trash2, 
  Search,
  Repeat,
  Lock 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { UserProfile, Role, SchoolInfo } from '../../types';
import { useNotifications } from '../../context/NotificationContext';

interface PengawasUserManagementProps {
  users: UserProfile[];
  setUsers: (users: UserProfile[]) => void;
  schools: SchoolInfo[];
}

export function PengawasUserManagement({ users, setUsers, schools }: PengawasUserManagementProps) {
  const { showToast, addNotification } = useNotifications();
  const [showAddModal, setShowAddModal] = useState(false);
  const [userToMutate, setUserToMutate] = useState<UserProfile | null>(null);
  const [userToDelete, setUserToDelete] = useState<UserProfile | null>(null);
  const [activeSubTab, setActiveSubTab] = useState<'GURU' | 'KEPALA_SEKOLAH'>('GURU');
  const [searchTerm, setSearchTerm] = useState('');
  
  const pendingUsers = users.filter((u: any) => u.status === 'PENDING_APPROVAL');
  
  // Exclude Pengawas from the list and filter by active subtab and search term
  const filteredUsers = users.filter((u: any) => 
    u.role !== 'PENGAWAS' && 
    u.role === activeSubTab && 
    (u.status === 'ACTIVE' || !u.status) &&
    (u.nama.toLowerCase().includes(searchTerm.toLowerCase()) || u.nip.includes(searchTerm))
  );
  
  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    const target = e.target as any;
    const selectedSchool = schools.find(s => s.id === target.sekolah.value);
    if (!selectedSchool) return;

    const newUser: UserProfile = {
      id: Date.now().toString(),
      nama: target.nama.value,
      nip: target.nip.value,
      sekolah: selectedSchool.name,
      schoolId: selectedSchool.id,
      district: selectedSchool.district || '',
      role: target.role.value as Role,
      status: 'ACTIVE',
      password: 'SIGAP123'
    };
    setUsers([...users, newUser]);
    setShowAddModal(false);
    showToast('Anggota berhasil ditambahkan ke sistem. Kata sandi default: SIGAP123', 'success');
  };

  const handleApprove = (id: string) => {
    const user = users.find((u: any) => u.id === id);
    setUsers(users.map((u: any) => u.id === id ? { ...u, status: 'ACTIVE', password: u.password || 'SIGAP123' } : u));
    showToast(`Akun ${user?.nama} telah diverifikasi dan aktif. Kata sandi default: SIGAP123`, 'success');

    if (user) {
      addNotification(
        user.id,
        'Akun Terverifikasi',
        'Akun Anda telah diverifikasi oleh Pengawas. Anda sekarang sudah bisa mengakses fitur penuh sistem.',
        'APPROVAL'
      );
    }
  };

  const confirmRemoveUser = () => {
    if (!userToDelete) return;
    setUsers(users.filter((u: any) => u.id !== userToDelete.id));
    showToast(`Pendidik ${userToDelete.nama} berhasil dikeluarkan dari sistem`, 'info');
    setUserToDelete(null);
  };

  const confirmMutation = (targetSchoolId: string) => {
    if (!userToMutate) return;
    
    const targetSchool = schools.find(s => s.id === targetSchoolId);
    if (!targetSchool) return;

    setUsers(users.map((u: any) => u.id === userToMutate.id ? { ...u, schoolId: targetSchoolId, sekolah: targetSchool.name } : u));
    showToast(`Mutasi berhasil: ${userToMutate.nama} diarahkan ke ${targetSchool.name}`, 'success');
    
    addNotification(
      userToMutate.id,
      'Mutasi Penempatan',
      `Pengawas telah melakukan mutasi penempatan Anda ke ${targetSchool.name}. Silakan menyesuaikan administrasi.`,
      'APPROVAL'
    );
    setUserToMutate(null);
  };

  return (
    <div className="space-y-8">
      {/* Custom Mutation Modal */}
      <AnimatePresence>
        {userToMutate && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 sm:p-10">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setUserToMutate(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 30 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 30 }}
              className="relative bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100 flex flex-col"
            >
               <div className="p-8 border-b border-slate-50 bg-slate-50/50 flex justify-between items-center">
                  <div>
                    <h3 className="text-xl font-black text-slate-800 tracking-tight">Opsi Penempatan Mutasi</h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-1">Target Personel: {userToMutate.nama}</p>
                  </div>
                  <button onClick={() => setUserToMutate(null)} className="p-2 text-slate-400 hover:text-rose-500 transition-colors">
                    <XCircle size={24} />
                  </button>
               </div>
                <div className="p-8 max-h-[50vh] overflow-y-auto sidebar-scroll space-y-3">
                  {schools.filter((s: SchoolInfo) => s.id !== userToMutate.schoolId).map((school: SchoolInfo) => (
                    <button
                      key={school.id || school.name}
                      onClick={() => confirmMutation(school.id || '')}
                      className="w-full flex items-center justify-between p-6 bg-slate-50/50 border border-slate-100 rounded-3xl hover:border-blue-500 hover:bg-white hover:shadow-xl hover:shadow-blue-500/5 transition-all text-left group"
                    >
                      <div className="flex items-center space-x-5">
                        <div className="p-4 bg-white rounded-2xl text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all border border-slate-100 shadow-sm">
                          <School size={20} />
                        </div>
                        <div>
                          <div className="font-black text-slate-800 tracking-tight group-hover:text-blue-600 transition-colors uppercase">{school.name}</div>
                          <div className="text-[9px] text-slate-400 font-black tracking-widest uppercase mt-1">Wilayah Binaan Gugus 1</div>
                        </div>
                      </div>
                      <ArrowRight size={18} className="text-slate-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                    </button>
                  ))}
               </div>
               <div className="p-6 bg-slate-50 border-t border-slate-100 text-center">
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-[0.2em]">Pilihlah salah satu instansi tujuan di atas untuk melaksanakan pemindahan tugas</p>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Custom Delete Modal */}
      <AnimatePresence>
        {userToDelete && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 sm:p-10">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setUserToDelete(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100 p-10 text-center"
            >
              <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-inner ring-4 ring-rose-50/50">
                <ShieldAlert size={40} />
              </div>
              <h3 className="text-2xl font-black text-slate-800 tracking-tight mb-3">Hentikan Akses Sistem?</h3>
              <p className="text-slate-500 font-medium leading-relaxed mb-8 text-sm">
                Anda akan menonaktifkan akun <span className="font-black text-slate-800 uppercase">{userToDelete.nama}</span>. Data profil dan riwayat akan dihapus permanen dari sistem.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <button onClick={() => setUserToDelete(null)} className="py-4 bg-slate-100 text-slate-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all border border-slate-200">Batal</button>
                <button onClick={confirmRemoveUser} className="py-4 bg-rose-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-rose-700 transition-all shadow-xl shadow-rose-600/20">Konfirmasi</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-4">
        <div className="min-w-0">
          <h3 className="text-2xl font-black text-slate-800 tracking-tight truncate">Pusat Mutasi & Rotasi</h3>
          <p className="text-sm text-slate-500 font-medium font-mono uppercase tracking-tight mt-1 truncate">Otoritas Validasi Lintas Satuan Pendidikan</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="bg-slate-900 text-white px-8 py-4 rounded-[1.5rem] font-black text-xs uppercase tracking-widest shadow-2xl shadow-slate-900/20 hover:bg-blue-600 transition-all flex items-center space-x-3 active:scale-95"
        >
          <ArrowLeftRight size={18} />
          <span>Kelola SDM</span>
        </button>
      </div>

      {/* Pending Verifications */}
      {pendingUsers.length > 0 && (
        <div className="bg-amber-50 rounded-[2.5rem] border border-amber-100 shadow-sm overflow-hidden">
          <div className="p-8 border-b border-amber-100 bg-amber-100/30 flex items-center justify-between">
            <div className="flex items-center space-x-4">
               <div className="p-3 bg-amber-500 text-white rounded-2xl shadow-lg shadow-amber-500/20 animate-pulse">
                  <ShieldAlert size={20} />
               </div>
               <div>
                  <h4 className="font-black text-slate-800 tracking-tight">Antrean Verifikasi Profil</h4>
                  <p className="text-[10px] text-amber-600 font-bold uppercase tracking-widest">Membutuhkan Tanda Tangan Digital Pengawas</p>
               </div>
            </div>
            <span className="bg-white px-4 py-1.5 rounded-full text-amber-600 text-[10px] font-black shadow-sm">{pendingUsers.length} Permintaan</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <tbody className="divide-y divide-amber-100/50">
                {pendingUsers.map((u: UserProfile) => (
                  <tr key={u.id} className="hover:bg-amber-100/10 transition-colors">
                    <td className="px-8 py-6">
                       <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-white rounded-xl border border-amber-200 flex items-center justify-center font-black text-amber-500 text-lg">{u.nama.charAt(0)}</div>
                          <div className="min-w-0">
                            <div className="font-black text-slate-800 tracking-tight truncate max-w-[150px]">{u.nama}</div>
                            <div className="text-[10px] text-slate-400 font-bold tracking-[0.1em] uppercase">NIP/NUPTK/NO HP: {u.nip}</div>
                          </div>
                       </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.15em] bg-white px-3 py-1.5 rounded-xl border border-slate-100 shadow-sm inline-block">
                        {schools.find(s => s.id === u.schoolId)?.name || u.sekolah}
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <button 
                        onClick={() => handleApprove(u.id)}
                        className="px-8 py-3 bg-emerald-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 shadow-xl shadow-emerald-500/20 transition-all active:scale-95"
                      >
                        Sah & Aktifkan
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Active Users */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-10 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
            <div>
               <h4 className="font-black text-slate-800 tracking-tight">Database Lintas Satuan Pendidikan</h4>
               <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-1 italic">Seluruh Pendidik dan Tenaga Kependidikan dalam wilayah binaan</p>
            </div>
            <div className="text-[10px] font-black text-blue-600 bg-blue-50 px-5 py-2.5 rounded-full border border-blue-100 uppercase tracking-widest shadow-inner">{filteredUsers.length} Personel</div>
        </div>

        {/* Tab & Filter Bar */}
        <div className="px-10 py-6 bg-slate-50/50 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
           <div className="flex space-x-10">
              <button 
                onClick={() => setActiveSubTab('GURU')}
                className={`pb-4 text-[10px] font-black uppercase tracking-[0.2em] transition-all relative ${activeSubTab === 'GURU' ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
              >
                  Data Pendidik (Guru)
                  {activeSubTab === 'GURU' && <motion.div layoutId="subtab" className="absolute bottom-0 left-0 right-0 h-1.5 bg-blue-600 rounded-full" />}
              </button>
              <button 
                onClick={() => setActiveSubTab('KEPALA_SEKOLAH')}
                className={`pb-4 text-[10px] font-black uppercase tracking-[0.2em] transition-all relative ${activeSubTab === 'KEPALA_SEKOLAH' ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
              >
                  Data Manajerial (KS)
                  {activeSubTab === 'KEPALA_SEKOLAH' && <motion.div layoutId="subtab" className="absolute bottom-0 left-0 right-0 h-1.5 bg-blue-600 rounded-full" />}
              </button>
           </div>
           
           <div className="relative group w-full md:w-72">
              <input 
                type="text" 
                placeholder="Cari Nama / NIP..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-2xl py-3 pl-12 pr-4 text-xs font-bold outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all placeholder:text-slate-300 shadow-sm"
              />
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors">
                <Search size={16} />
              </div>
           </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-[10px] text-slate-400 uppercase font-black tracking-widest border-b border-slate-100">
              <tr>
                <th className="px-10 py-8">Profil Pendidik</th>
                <th className="px-10 py-8">Penempatan Satuan</th>
                <th className="px-10 py-8 text-center">Opsi Strategis</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-10 py-20 text-center text-slate-300 font-medium italic bg-slate-50/20">
                    Tidak ada data {activeSubTab === 'GURU' ? 'Pendidik' : 'Kepala Sekolah'} terdaftar
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u: UserProfile) => (
                <tr key={u.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-10 py-8">
                    <div className="flex items-center space-x-5">
                       <div className="w-14 h-14 bg-white rounded-2xl border border-slate-200 flex items-center justify-center text-xl font-black text-blue-600 group-hover:scale-110 transition-transform shadow-sm">{u.nama.charAt(0)}</div>
                       <div className="min-w-0">
                          <div className="font-black text-slate-800 text-base tracking-tight truncate max-w-[200px]">{u.nama}</div>
                          <div className="flex items-center space-x-2 mt-1">
                             <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">NIP/NUPTK/NO HP: {u.nip}</span>
                             <span className="w-1 h-1 bg-slate-200 rounded-full shrink-0"></span>
                             <span className={`text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-widest shrink-0 ${
                                u.role === 'PENGAWAS' ? 'bg-indigo-100 text-indigo-700' :
                                u.role === 'KEPALA_SEKOLAH' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
                             }`}>{u.role.replace('_', ' ')}</span>
                          </div>
                       </div>
                    </div>
                  </td>
                  <td className="px-10 py-8">
                    <div className="flex items-center space-x-3 text-slate-600 font-black text-[11px] uppercase tracking-wider bg-slate-50 px-4 py-2.5 rounded-2xl border border-slate-100 shadow-inner group-hover:bg-white group-hover:border-blue-200 transition-all max-w-[250px]">
                       <School size={16} className="text-blue-500 shrink-0" />
                       <span className="truncate">{schools.find(s => s.id === u.schoolId)?.name || u.sekolah}</span>
                    </div>
                  </td>
                  <td className="px-10 py-8">
                    <div className="flex justify-center items-center gap-3">
                      {u.role !== 'PENGAWAS' && (
                        <>
                          <button 
                            onClick={() => {
                              const newPassword = 'SIGAP' + Math.floor(1000 + Math.random() * 9000);
                              setUsers(users.map(usr => usr.id === u.id ? { ...usr, password: newPassword } : usr));
                              showToast(`Katasandi ${u.nama} telah direset menjadi: ${newPassword}`, 'success');
                            }}
                            className="p-3 text-amber-500 hover:bg-amber-50 hover:text-amber-600 rounded-2xl border border-transparent hover:border-amber-100 transition-all active:scale-95"
                            title="Reset Katasandi"
                          >
                            <Lock size={18} />
                          </button>
                          <button 
                            onClick={() => setUserToMutate(u)}
                            className="flex items-center justify-center space-x-2 px-6 py-3 bg-white border border-slate-200 text-blue-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all shadow-sm active:scale-95"
                            title="Rotasi Sekolah"
                          >
                            <Repeat size={14} />
                            <span>Mutasi</span>
                          </button>
                          <button 
                            onClick={() => setUserToDelete(u)}
                            className="p-3 text-rose-400 hover:bg-rose-50 hover:text-rose-600 rounded-2xl border border-transparent hover:border-rose-100 transition-all active:scale-95"
                            title="Nonaktifkan"
                          >
                            <Trash2 size={20} />
                          </button>
                        </>
                      )}
                      {u.role === 'PENGAWAS' && <div className="text-[9px] font-black text-slate-300 uppercase tracking-widest italic">Immutable System</div>}
                    </div>
                  </td>
                </tr>
              )))}
            </tbody>
          </table>
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[70] flex items-center justify-center p-4">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-[3rem] p-10 max-w-md w-full shadow-2xl border border-slate-100 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-12 opacity-[0.03] rotate-12 scale-150 text-indigo-600">
               <ArrowLeftRight size={140} />
            </div>
            
            <h4 className="text-2xl font-black text-slate-800 mb-2 tracking-tight relative z-10">Entry Data Personel</h4>
            <p className="text-xs text-slate-400 font-medium mb-8 relative z-10">Pendaftaran langsung oleh otoritas pengawas akan mengaktifkan akun secara instan.</p>
            
            <form onSubmit={handleAddUser} className="space-y-5 relative z-10">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nama Lengkap</label>
                <input name="nama" type="text" required placeholder="E.g. Nama Beserta Gelar" className="w-full p-5 bg-slate-50 border border-slate-100 rounded-[1.2rem] text-sm font-medium outline-none focus:border-blue-500 transition-all shadow-inner" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">NIP/NUPTK/NO HP</label>
                <input name="nip" type="text" required placeholder="18 Digit" className="w-full p-5 bg-slate-50 border border-slate-100 rounded-[1.2rem] text-sm font-medium outline-none focus:border-blue-500 transition-all shadow-inner" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Jabatan</label>
                  <select name="role" required className="w-full p-5 bg-slate-50 border border-slate-100 rounded-[1.2rem] text-sm font-medium outline-none focus:border-blue-500 shadow-inner">
                    <option value="GURU">GURU</option>
                    <option value="KEPALA_SEKOLAH">KEPALA SEKOLAH</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Penempatan</label>
                  <select name="sekolah" required className="w-full p-5 bg-slate-50 border border-slate-100 rounded-[1.2rem] text-sm font-medium outline-none focus:border-blue-500 shadow-inner text-xs">
                    {schools.map((s: SchoolInfo) => <option key={s.id || s.name} value={s.id || s.name}>{s.name}</option>)}
                  </select>
                </div>
              </div>
              
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 py-5 bg-slate-100 text-slate-400 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95">Batal</button>
                <button type="submit" className="flex-[2] py-5 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-2xl shadow-slate-900/20 hover:bg-slate-800 transition-all active:scale-95">Daftarkan & Aktifkan</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
