import React, { useState } from 'react';
import { 
  UserPlus, 
  Users, 
  ShieldAlert, 
  CheckCircle2,
  Lock 
} from 'lucide-react';
import { UserProfile, SchoolInfo, DocumentInfo } from '../../types';
import { useNotifications } from '../../context/NotificationContext';
import { DocumentValidationModal } from '../shared/DocumentValidationModal';
import { motion, AnimatePresence } from 'motion/react';

interface KSTeacherManagementProps {
  user: any;
  allAttendance: any[];
  users: UserProfile[];
  setUsers: (users: UserProfile[]) => void;
  schools: SchoolInfo[];
  allDocuments: DocumentInfo[];
}

export function KSTeacherManagement({ user, allAttendance, users, setUsers, schools, allDocuments }: KSTeacherManagementProps) {
  const { showToast, addNotification } = useNotifications();
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedTeacherId, setSelectedTeacherId] = useState<string | null>(null);
  const [selectedDoc, setSelectedDoc] = useState<DocumentInfo | null>(null);
  const [editJabatan, setEditJabatan] = useState('');
  const [editKelas, setEditKelas] = useState('');

  React.useEffect(() => {
    if (selectedTeacherId) {
      const activeTeacher = users.find(u => u.id === selectedTeacherId);
      if (activeTeacher) {
        setEditJabatan(activeTeacher.jabatan || 'Guru Kelas');
        setEditKelas(activeTeacher.kelas || 'Semua Kelas');
      }
    }
  }, [selectedTeacherId]);

  const schoolTeachers = React.useMemo(() => users.filter((u: any) => u.schoolId === user.schoolId && u.role === 'GURU'), [users, user.schoolId]);
  
  const docsByTeacher = React.useMemo(() => {
    const map = new Map<string, DocumentInfo[]>();
    allDocuments.forEach(doc => {
      if (doc.status === 'APPROVED') {
        const teacherDocs = map.get(doc.userId) || [];
        teacherDocs.push(doc);
        map.set(doc.userId, teacherDocs);
      }
    });
    // Sort each teacher's docs by date
    map.forEach((docs) => {
      docs.sort((a, b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime());
    });
    return map;
  }, [allDocuments]);

  const handleAddTeacher = (e: React.FormEvent) => {
    e.preventDefault();
    const target = e.target as any;
    const newTeacher: UserProfile = {
      id: Date.now().toString(),
      nama: target.nama.value,
      nip: target.nip.value,
      sekolah: user.sekolah,
      schoolId: user.schoolId,
      district: user.district,
      role: 'GURU',
      status: 'PENDING_APPROVAL',
      password: 'SIGAP123'
    };
    setUsers([...users, newTeacher]);
    setShowAddModal(false);
    showToast('Guru baru berhasil didaftarkan dengan kata sandi default SIGAP123. Menunggu verifikasi Pengawas.', 'success');

    // Notify Supervisor
    const pengawas = users.find((u: UserProfile) => u.role === 'PENGAWAS');
    if (pengawas) {
      addNotification(
        pengawas.id,
        'Verifikasi Guru Baru',
        `Kepala Sekolah ${user.sekolah} mendaftarkan guru baru: ${target.nama.value}. Silakan verifikasi di Mutasi & Rotasi.`,
        'APPROVAL'
      );
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-4">
        <div className="min-w-0">
          <h3 className="text-2xl font-black text-slate-800 tracking-tight truncate">Manajemen SDM Satuan</h3>
          <p className="text-sm text-slate-500 font-medium font-mono uppercase tracking-tight mt-1 truncate">Daftar Pendidik di {user.sekolah}</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="bg-slate-900 text-white px-8 py-4 rounded-[1.5rem] font-black text-xs uppercase tracking-widest shadow-2xl shadow-slate-900/20 hover:bg-blue-600 transition-all flex items-center space-x-3 active:scale-95"
        >
          <UserPlus size={18} />
          <span>Daftarkan Guru</span>
        </button>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden p-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {schoolTeachers.length === 0 ? (
            <div className="col-span-2 py-24 text-center rounded-[2rem] border-2 border-dashed border-slate-100 bg-slate-50/30">
               <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mx-auto mb-6 text-slate-200 shadow-sm">
                 <Users size={40} />
               </div>
               <p className="text-slate-400 font-black text-sm uppercase tracking-widest">Belum ada profil guru terekam</p>
            </div>
          ) : (
              schoolTeachers.map(teacher => {
                const todayStr = new Date().toISOString().split('T')[0];
                const teacherAttendanceToday = allAttendance.filter((a: any) => a.userId === teacher.id && a.type === 'IN' && a.timestamp.startsWith(todayStr));
                const isPending = teacher.status === 'PENDING_APPROVAL';
                const isSelected = selectedTeacherId === teacher.id;
                
                // Get approved documents for this teacher from optimized map
                const approvedDocs = docsByTeacher.get(teacher.id) || [];

                return (
                  <div key={teacher.id} className="space-y-4">
                    <div 
                      onClick={() => !isPending && setSelectedTeacherId(isSelected ? null : teacher.id)}
                      className={`p-8 rounded-[2.2rem] border transition-all flex items-center space-x-6 relative group cursor-pointer ${isSelected ? 'bg-white border-blue-500 shadow-2xl scale-[1.02] z-10' : isPending ? 'bg-amber-50/30 border-amber-100' : 'bg-slate-50/50 border-slate-100 hover:border-blue-300 hover:bg-white hover:shadow-xl'}`}
                    >
                      {isPending && (
                        <div className="absolute top-6 right-6 flex items-center space-x-1.5 bg-amber-500 text-white px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest shadow-lg shadow-amber-500/20 animate-pulse">
                           <ShieldAlert size={10} />
                           <span>Menunggu Verifikasi Pengawas</span>
                        </div>
                      )}
                      
                      <div className={`w-20 h-20 rounded-[1.5rem] flex items-center justify-center text-3xl font-black shadow-sm relative ${isSelected ? 'bg-blue-600 text-white' : isPending ? 'bg-amber-100 text-amber-600' : 'bg-white text-blue-600 border border-slate-100'}`}>
                        {teacher.nama.charAt(0)}
                        {!isPending && (
                           <div className={`absolute -right-1 -bottom-1 w-6 h-6 rounded-full border-4 border-slate-50 flex items-center justify-center ${teacherAttendanceToday.length > 0 ? 'bg-emerald-500' : 'bg-slate-300'}`}>
                              <CheckCircle2 size={12} className="text-white" />
                           </div>
                        )}
                      </div>

                      <div className="flex-1 overflow-hidden">
                        <h4 className="font-black text-slate-800 text-lg tracking-tight truncate">{teacher.nama}</h4>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.1em] mt-0.5">NIP/NUPTK/NO HP: {teacher.nip}</p>
                        {teacher.role === 'GURU' && (
                          <p className="text-[10px] text-blue-600 font-extrabold uppercase tracking-widest mt-1">
                            {teacher.jabatan || 'Guru Kelas'} {teacher.kelas ? `(${teacher.kelas})` : ''}
                          </p>
                        )}
                        
                        <div className="mt-5 flex items-center gap-3">
                          <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest shadow-sm ${
                            isPending ? 'bg-amber-100 text-amber-600' :
                            (teacherAttendanceToday.length > 0 ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-500')
                          }`}>
                            {isPending ? 'NON-AKTIF' : (teacherAttendanceToday.length > 0 ? 'HADIR' : 'ABSEN')}
                          </span>
                          <span className="px-3 py-1 bg-white border border-slate-200 text-blue-600 text-[9px] font-black rounded-lg uppercase tracking-widest shadow-sm">Pendidik Tetap</span>
                          {approvedDocs.length > 0 && !isPending && (
                            <span className="px-3 py-1 bg-amber-100 text-amber-700 text-[9px] font-black rounded-lg uppercase tracking-widest shadow-sm">
                              {approvedDocs.length} Berkas Tervalidasi
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <AnimatePresence>
                      {isSelected && (
                        <motion.div 
                          initial={{ opacity: 0, height: 0, marginTop: 0 }}
                          animate={{ opacity: 1, height: 'auto', marginTop: 16 }}
                          exit={{ opacity: 0, height: 0, marginTop: 0 }}
                          className="overflow-hidden space-y-4"
                        >
                           <div className="bg-slate-100/50 rounded-[2rem] p-6 border border-slate-100 space-y-6">
                             <div className="bg-white rounded-2xl p-6 border border-slate-200/50 shadow-sm space-y-4" onClick={(e) => e.stopPropagation()}>
                               <div className="text-[10px] font-black text-slate-800 uppercase tracking-widest flex items-center space-x-2">
                                 <span className="w-1.5 h-3 bg-blue-600 rounded-full" />
                                 <span>Konfigurasi Tugas & Kelas</span>
                               </div>
                               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                 <div>
                                   <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Jabatan / Peran</label>
                                   <input 
                                     id={`edit-jabatan-${teacher.id}`}
                                     type="text"
                                     value={editJabatan}
                                     onChange={(e) => setEditJabatan(e.target.value)}
                                     placeholder="Contoh: Guru Kelas III, Guru IPA"
                                     className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-black outline-none focus:ring-4 focus:ring-blue-100 placeholder:text-slate-300 text-slate-750"
                                   />
                                 </div>
                                 <div>
                                   <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Kelas Binaan</label>
                                   <input 
                                     id={`edit-kelas-${teacher.id}`}
                                     type="text"
                                     value={editKelas}
                                     onChange={(e) => setEditKelas(e.target.value)}
                                     placeholder="Contoh: Kelas 3-A, Kelas 5"
                                     className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-black outline-none focus:ring-4 focus:ring-blue-100 placeholder:text-slate-300 text-slate-750"
                                   />
                                 </div>
                               </div>
                               <div className="flex justify-end pt-2">
                                 <button
                                   type="button"
                                   onClick={(e) => {
                                     e.stopPropagation();
                                     setUsers(users.map(u => u.id === teacher.id ? { ...u, jabatan: editJabatan, kelas: editKelas } : u));
                                     showToast(`Berhasil menyimpan tugas untuk ${teacher.nama}`, 'success');
                                   }}
                                   className="px-6 py-3 bg-slate-900 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all shadow-md hover:shadow-lg active:scale-95"
                                 >
                                   Simpan Perubahan
                                 </button>
                               </div>
                             </div>

                             <div>
                               <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center justify-between">
                                 <div className="flex items-center space-x-2">
                                    <CheckCircle2 size={14} className="text-blue-500" />
                                    <span>Berkas Terakhir Tervalidasi</span>
                                 </div>
                                 <button 
                                   onClick={(e) => {
                                     e.stopPropagation();
                                     const newPassword = 'SIGAP' + Math.floor(1000 + Math.random() * 9000);
                                     setUsers(users.map(u => u.id === teacher.id ? { ...u, password: newPassword } : u));
                                     showToast(`Katasandi ${teacher.nama} telah direset menjadi: ${newPassword}`, 'success');
                                   }}
                                   className="text-amber-500 hover:text-amber-600 font-black uppercase tracking-widest flex items-center space-x-1 hover:bg-amber-50 px-2 py-1 rounded"
                                 >
                                   <Lock size={12} />
                                   <span>Reset Katasandi</span>
                                 </button>
                               </div>
                             
                             <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {approvedDocs.length === 0 ? (
                                  <div className="col-span-full py-6 text-center text-slate-400 font-medium italic text-[10px] uppercase tracking-widest">
                                    Belum ada berkas tervalidasi
                                  </div>
                                ) : (
                                  approvedDocs.map(doc => (
                                    <button 
                                      key={doc.id}
                                      onClick={() => setSelectedDoc(doc)}
                                      className="flex items-center space-x-4 p-4 bg-white border border-slate-200 rounded-2xl hover:border-blue-500 hover:shadow-lg hover:shadow-blue-500/10 transition-all text-left group"
                                    >
                                       <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                          <CheckCircle2 size={18} />
                                       </div>
                                       <div className="min-w-0 flex-1">
                                          <div className="text-[10px] font-black text-slate-800 uppercase tracking-tight truncate leading-tight">{doc.fileName}</div>
                                          <div className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{doc.type} • {new Date(doc.uploadDate).toLocaleDateString()}</div>
                                       </div>
                                    </button>
                                  ))
                                )}
                             </div>
                           </div>
                         </div>
                       </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })
          )}
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-[3rem] max-w-md w-full max-h-[90vh] shadow-2xl relative overflow-hidden flex flex-col">
            <div className="p-10 border-b border-slate-50 shrink-0">
               <h3 className="text-2xl font-black text-slate-800 mb-2 tracking-tight transition-all">Registrasi Guru Baru</h3>
               <p className="text-xs text-slate-400 font-medium">Input data dasar guru untuk diajukan ke Pengawas Wilayah.</p>
            </div>
            
            <div className="flex-1 overflow-y-auto p-10">
               <form id="add-teacher-form" onSubmit={handleAddTeacher} className="space-y-6">
                 <div>
                   <label htmlFor="teacher-nama" className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Nama Lengkap & Gelar</label>
                   <input 
                     id="teacher-nama"
                     name="nama" 
                     required 
                     placeholder="Misal: Budi Santoso, S.Pd"
                     className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-black outline-none focus:ring-4 focus:ring-blue-100 placeholder:text-slate-300" 
                   />
                 </div>
                 <div>
                   <label htmlFor="teacher-nip" className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">NIP/NUPTK/NO HP</label>
                   <input 
                     id="teacher-nip"
                     name="nip" 
                     required 
                     placeholder="Masukkan NIP atau No HP Aktif"
                     className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-black outline-none focus:ring-4 focus:ring-blue-100 placeholder:text-slate-300" 
                   />
                 </div>
               </form>
            </div>

            <div className="p-10 bg-slate-50/50 border-t border-slate-50 shrink-0 flex gap-4">
              <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 py-5 bg-white border border-slate-100 text-slate-500 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-50 hover:text-rose-600 hover:border-rose-100 transition-all">Batal</button>
              <button form="add-teacher-form" type="submit" className="flex-1 py-5 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all shadow-xl active:scale-95">Daftarkan</button>
            </div>
          </div>
        </div>
      )}

      {selectedDoc && (
        <DocumentValidationModal 
          document={selectedDoc}
          author={users.find(u => u.id === selectedDoc.userId)}
          onClose={() => setSelectedDoc(null)}
          readOnly={true}
          userRoleLabel="GURU"
        />
      )}
    </div>
  );
}
