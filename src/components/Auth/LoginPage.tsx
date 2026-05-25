/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, User, Lock, Eye, EyeOff } from 'lucide-react';
import { UserProfile } from '../../types';
import { useNotifications } from '../../context/NotificationContext';

interface LoginPageProps {
  users: UserProfile[];
  onLogin: (user: UserProfile) => void;
}

export function LoginPage({ users, onLogin }: LoginPageProps) {
  const { showToast } = useNotifications();
  const [nip, setNip] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [savedNips, setSavedNips] = useState<string[]>(() => {
    const saved = localStorage.getItem('sigap_saved_nips');
    return saved ? JSON.parse(saved) : [];
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedNip = nip.trim();
    const user = users.find(u => u.nip.trim() === trimmedNip);
    const validPassword = user?.password;
    
    if (user && validPassword && password.trim() === validPassword) {
      if (user.status === 'PENDING_APPROVAL') {
        showToast('Akun Anda masih dalam status PENGAJUAN dan belum disetujui (dilegitimasi) oleh Pengawas Wilayah.', 'error');
        return;
      }
      // Save NIP to recommendations if not exists
      if (!savedNips.includes(trimmedNip)) {
        const newSaved = [trimmedNip, ...savedNips].slice(0, 5);
        setSavedNips(newSaved);
        localStorage.setItem('sigap_saved_nips', JSON.stringify(newSaved));
      }
      onLogin(user);
    } else {
      showToast('NIP atau Kata Sandi salah. Silakan periksa kembali atau hubungi pengawas.', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-6 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] overflow-y-auto">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }} 
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-white rounded-[2.5rem] sm:rounded-[3rem] shadow-2xl p-8 sm:p-12 relative overflow-hidden border border-slate-100 my-4"
      >
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-50 rounded-full opacity-50"></div>
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-emerald-50 rounded-full opacity-50"></div>
        
        <div className="relative z-10 text-center">
          <div className="w-20 h-20 bg-slate-900 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 shadow-xl rotate-3">
             <ShieldCheck size={42} className="text-white" />
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter mb-2">SIGAP CIKAMPEK</h1>
          <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.3em] mb-12">Sistem Integrasi Gugus, Administrasi, dan Presensi</p>
          
          <form onSubmit={handleSubmit} className="space-y-6 text-left">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">NIP/NUPTK/NO HP</label>
              <div className="relative group">
                <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors">
                   <User size={20} />
                </div>
                <input 
                  type="text" 
                  value={nip}
                  onChange={(e) => setNip(e.target.value)}
                  placeholder="Masukkan NIP/NUPTK/NO HP..."
                  className="w-full pl-16 pr-8 py-5 bg-slate-50 border border-slate-100 rounded-[1.8rem] outline-none focus:border-blue-500 transition-all text-sm font-bold shadow-inner"
                  required
                  autoComplete="username"
                  list="nip-recommendations"
                />
                <datalist id="nip-recommendations">
                  {savedNips.map(n => (
                    <option key={n} value={n} />
                  ))}
                </datalist>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Katasandi</label>
              <div className="relative group">
                <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors">
                   <Lock size={20} />
                </div>
                <input 
                  type={showPassword ? "text" : "password"} 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan katasandi..."
                  className="w-full pl-16 pr-14 py-5 bg-slate-50 border border-slate-100 rounded-[1.8rem] outline-none focus:border-blue-500 transition-all text-sm font-bold shadow-inner"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none transition-colors"
                  aria-label={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <div className="flex justify-end pr-4">
                <button 
                  type="button"
                  onClick={() => showToast('Hubungi Pengawas atau Kepala Sekolah untuk mereset kata sandi Anda.', 'info')}
                  className="text-[9px] font-bold text-blue-500 hover:text-blue-600 uppercase tracking-wider"
                >
                  Lupa Katasandi?
                </button>
              </div>
            </div>
            <button 
              type="submit" 
              className="w-full py-6 bg-slate-900 text-white rounded-[1.8rem] font-black uppercase tracking-widest text-[11px] shadow-2xl hover:bg-blue-600 transition-all hover:-translate-y-1 active:translate-y-0 text-center"
            >
              Autentikasi Sekarang
            </button>
          </form>

          <div className="mt-10 pt-8 border-t border-slate-50">
             <div className="flex items-center justify-center space-x-2 text-slate-300">
                <div className="w-1.5 h-1.5 rounded-full bg-slate-200"></div>
                <p className="text-[9px] font-black uppercase tracking-[0.2em]">Gugus 1 Cikampek 2026</p>
             </div>
             <p className="text-[10px] text-slate-400 mt-6 font-medium">Kendala Akses? <span className="text-blue-500 font-bold cursor-pointer hover:underline">Hubungi Pengawas Gugus</span></p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
