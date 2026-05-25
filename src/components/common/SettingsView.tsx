import React, { useState } from 'react';
import { 
  Settings, 
  School, 
  ShieldCheck, 
  Map, 
  ChevronRight,
  X,
  Lock,
  Eye,
  EyeOff,
  Camera
} from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';
import { motion, AnimatePresence } from 'framer-motion';

interface SettingsViewProps {
  user: any;
  updateProfilePicture: (userId: string, avatarUrl: string) => void;
  updateUserProfile: (userId: string, data: { nama: string, nip: string }) => void;
  updateUserPassword: (userId: string, newPassword: string) => void;
}

export function SettingsView({ 
  user, 
  updateProfilePicture, 
  updateUserProfile, 
  updateUserPassword
}: SettingsViewProps) {
  const { showToast } = useNotifications();
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
  const [profileData, setProfileData] = useState({ nama: user.nama, nip: user.nip });
  const [showPass, setShowPass] = useState({ current: false, new: false, confirm: false });

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validasi kata sandi saat ini
    const currentValidPass = user.password;
    if (!currentValidPass || passwords.current !== currentValidPass) {
      showToast('Kata sandi saat ini tidak valid', 'error');
      return;
    }

    if (passwords.new !== passwords.confirm) {
      showToast('Konfirmasi kata sandi tidak cocok', 'error');
      return;
    }
    if (passwords.new.length < 6) {
      showToast('Kata sandi minimal 6 karakter', 'error');
      return;
    }
    
    updateUserPassword(user.id, passwords.new);
    showToast('Kata sandi berhasil diperbarui secara permanen', 'success');
    setShowPasswordModal(false);
    setPasswords({ current: '', new: '', confirm: '' });
  };

  const handleProfileUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileData.nama.trim() || !profileData.nip.trim()) {
      showToast('Nama dan NIP tidak boleh kosong', 'error');
      return;
    }
    updateUserProfile(user.id, profileData);
    showToast('Identitas berhasil diperbarui', 'success');
    setShowProfileModal(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        showToast('Ukuran gambar maksimal 2MB', 'error');
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        updateProfilePicture(user.id, base64String);
        showToast('Foto profil berhasil diperbarui', 'success');
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden relative">
        <div className="absolute top-0 right-0 p-8 opacity-5">
           <Settings size={120} />
        </div>
        <h3 className="text-xl font-black text-slate-800 mb-8 pb-4 border-b border-slate-100 tracking-tight">Akun & Profil</h3>
        <div className="space-y-6">
          <div className="flex flex-col items-center space-y-6">
            <div className="relative group">
              <div className="w-32 h-32 rounded-[2.5rem] bg-slate-900 overflow-hidden shadow-2xl shadow-slate-200 transition-transform group-hover:scale-[1.02] border-4 border-white relative">
                 {user.avatar ? (
                   <img src={user.avatar} alt={user.nama} className="w-full h-full object-cover" />
                 ) : (
                   <div className="w-full h-full bg-gradient-to-br from-slate-800 to-slate-950 flex items-center justify-center text-white text-5xl font-black">
                     {user.nama.charAt(0)}
                   </div>
                 )}
                 <label className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                    <Camera className="text-white" size={32} />
                    <input 
                      type="file" 
                      className="hidden" 
                      accept="image/*"
                      onChange={handleFileChange}
                    />
                 </label>
              </div>
              <div className="absolute -bottom-2 -right-2 bg-slate-900 p-2.5 rounded-2xl shadow-xl border-4 border-white text-white">
                <Camera size={16} />
              </div>
            </div>
            
            <div className="w-full space-y-6 pt-6">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
                  <button 
                    onClick={() => setShowProfileModal(true)}
                    className="absolute -top-3 right-0 p-2 bg-blue-600 text-white rounded-xl shadow-lg hover:bg-blue-700 transition-all z-10"
                    title="Ubah Identitas"
                  >
                    <Settings size={14} />
                  </button>
                  <div className="space-y-2 p-6 bg-slate-50/50 rounded-3xl border border-slate-100 shadow-sm relative group">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Identitas Lengkap</label>
                    <div className="text-sm font-black text-slate-800 tracking-tight">{user.nama}</div>
                  </div>
                  <div className="space-y-2 p-6 bg-slate-50/50 rounded-3xl border border-slate-100 shadow-sm relative group">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">NIP/NUPTK/NO HP</label>
                    <div className="text-sm font-black text-slate-700 tracking-tight">{user.nip}</div>
                  </div>
                  {user.role === 'GURU' && (
                    <>
                      <div className="space-y-2 p-6 bg-slate-50/50 rounded-3xl border border-slate-100 shadow-sm relative group">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Jabatan Utama</label>
                        <div className="text-sm font-black text-slate-800 tracking-tight">{user.jabatan || 'Guru Kelas'}</div>
                      </div>
                      <div className="space-y-2 p-6 bg-slate-50/50 rounded-3xl border border-slate-100 shadow-sm relative group">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Kelas Pendampingan</label>
                        <div className="text-sm font-black text-slate-800 tracking-tight">{user.kelas || 'Semua Kelas'}</div>
                      </div>
                    </>
                  )}
               </div>
               <div className="p-6 bg-blue-50/30 border border-blue-100 rounded-3xl flex items-center justify-between group hover:bg-blue-50 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-white rounded-xl shadow-sm border border-blue-100 text-blue-600 group-hover:scale-110 transition-transform">
                      <School size={20} />
                    </div>
                    <div>
                      <label className="text-[9px] font-black text-blue-400 uppercase tracking-widest block">Satuan Pendidikan</label>
                      <div className="text-sm font-black text-blue-700 uppercase tracking-tighter">{user.sekolah}</div>
                    </div>
                  </div>
                  <span className="text-[8px] font-black bg-blue-100 text-blue-600 px-3 py-1 rounded-full uppercase tracking-tighter shadow-sm">Verified Unit</span>
               </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden">
         <h3 className="text-xl font-black text-slate-800 mb-8 pb-4 border-b border-slate-100 tracking-tight">Kredensial & Keamanan</h3>
         <div className="space-y-4">
            <button 
              onClick={() => setShowPasswordModal(true)}
              className="w-full flex items-center justify-between p-5 bg-slate-50 rounded-2xl border border-slate-100 group hover:border-blue-400 hover:bg-white transition-all shadow-sm"
            >
               <div className="flex items-center space-x-4 text-left">
                  <div className="p-3 bg-white rounded-xl border border-slate-200 text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
                    <ShieldCheck size={20} />
                  </div>
                  <div>
                    <span className="text-sm font-black text-slate-700 block tracking-tight">Ubah Kata Sandi Publik</span>
                    <span className="text-[10px] text-slate-400 font-medium italic">Klik untuk aktivasi fitur keamanan ini</span>
                  </div>
               </div>
               <ChevronRight size={20} className="text-slate-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
            </button>
         </div>
      </div>

      <div className="p-6 text-center text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">
         Versi Aplikasi 2.4.0 • SIGAP Gugus 1 Cikampek
      </div>

      {/* Change Password Modal */}
      <AnimatePresence>
        {showPasswordModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPasswordModal(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl p-8 overflow-hidden"
            >
               <div className="absolute top-0 right-0 p-4">
                 <button onClick={() => setShowPasswordModal(false)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                    <X size={20} className="text-slate-400" />
                 </button>
               </div>
               
               <div className="flex flex-col items-center mb-8">
                  <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-4">
                     <Lock size={32} />
                  </div>
                  <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Ubah Kata Sandi</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1 text-center">Demi Keamanan Akun Anda</p>
               </div>

               <form onSubmit={handlePasswordChange} className="space-y-4">
                  <div className="space-y-1.5">
                     <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Kata Sandi Saat Ini</label>
                     <div className="relative">
                        <input 
                          type={showPass.current ? "text" : "password"}
                          value={passwords.current}
                          onChange={(e) => setPasswords({...passwords, current: e.target.value})}
                          className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-black outline-none focus:border-blue-500 transition-all shadow-inner"
                          placeholder="••••••••"
                          required
                        />
                        <button 
                          type="button"
                          onClick={() => setShowPass({...showPass, current: !showPass.current})}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-900"
                        >
                          {showPass.current ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                     </div>
                  </div>

                  <div className="space-y-1.5">
                     <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Kata Sandi Baru</label>
                     <div className="relative">
                        <input 
                          type={showPass.new ? "text" : "password"}
                          value={passwords.new}
                          onChange={(e) => setPasswords({...passwords, new: e.target.value})}
                          className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-black outline-none focus:border-blue-500 transition-all shadow-inner"
                          placeholder="Minimal 6 karakter"
                          required
                        />
                        <button 
                          type="button"
                          onClick={() => setShowPass({...showPass, new: !showPass.new})}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-900"
                        >
                          {showPass.new ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                     </div>
                  </div>

                  <div className="space-y-1.5 pb-2">
                     <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Konfirmasi Kata Sandi Baru</label>
                     <div className="relative">
                        <input 
                          type={showPass.confirm ? "text" : "password"}
                          value={passwords.confirm}
                          onChange={(e) => setPasswords({...passwords, confirm: e.target.value})}
                          className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-black outline-none focus:border-blue-500 transition-all shadow-inner"
                          placeholder="Ulangi kata sandi baru"
                          required
                        />
                        <button 
                          type="button"
                          onClick={() => setShowPass({...showPass, confirm: !showPass.confirm})}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-900"
                        >
                          {showPass.confirm ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                     </div>
                  </div>

                  <button 
                    type="submit"
                    className="w-full py-5 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-slate-900/20 hover:bg-blue-600 transition-all active:scale-95"
                  >
                    Simpan Perubahan
                  </button>
               </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Profile Modal */}
      <AnimatePresence>
        {showProfileModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowProfileModal(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl p-8 overflow-hidden"
            >
               <div className="absolute top-0 right-0 p-4">
                 <button onClick={() => setShowProfileModal(false)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                    <X size={20} className="text-slate-400" />
                 </button>
               </div>
               
               <div className="flex flex-col items-center mb-8">
                  <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-4">
                     <Settings size={32} />
                  </div>
                  <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Perbarui Identitas</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1 text-center">Data Pribadi Pengguna</p>
               </div>

               <form onSubmit={handleProfileUpdate} className="space-y-4">
                  <div className="space-y-1.5">
                     <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Nama Lengkap & Gelar</label>
                     <input 
                       type="text"
                       value={profileData.nama}
                       onChange={(e) => setProfileData({...profileData, nama: e.target.value})}
                       className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-black outline-none focus:border-blue-500 transition-all shadow-inner"
                       placeholder="Contoh: H. Ahmad Sobari, M.Pd."
                       required
                     />
                  </div>

                  <div className="space-y-1.5 pb-2">
                     <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">NIP/NUPTK/NO HP</label>
                     <input 
                       type="text"
                       value={profileData.nip}
                       onChange={(e) => setProfileData({...profileData, nip: e.target.value})}
                       className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-black outline-none focus:border-blue-500 transition-all shadow-inner"
                       placeholder="Masukkan nomor identitas"
                       required
                     />
                  </div>

                  <button 
                    type="submit"
                    className="w-full py-5 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-slate-900/20 hover:bg-blue-600 transition-all active:scale-95"
                  >
                    Simpan Perubahan
                  </button>
               </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

