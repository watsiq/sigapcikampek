/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  School, XCircle, ChevronLeft, LogOut, 
  LayoutDashboard, Megaphone, Fingerprint, FileClock, 
  FileUp, Trophy, Users, Building2, FileSearch, 
  FileSpreadsheet, Map, ArrowLeftRight, ShieldCheck, 
  Upload, Settings 
} from 'lucide-react';
import { motion } from 'motion/react';
import { UserProfile } from '../../types';

interface SidebarProps {
  currentUser: UserProfile;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
  isSidebarCollapsed: boolean;
  setIsSidebarCollapsed: (collapsed: boolean) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  handleLogout: () => void;
}

export function Sidebar({ 
  currentUser, 
  isSidebarOpen, 
  setIsSidebarOpen, 
  isSidebarCollapsed, 
  setIsSidebarCollapsed, 
  activeTab, 
  setActiveTab, 
  handleLogout 
}: SidebarProps) {
  
  const navItems = [
    { label: 'Dashboard', icon: <LayoutDashboard size={18} />, roles: ['GURU', 'KEPALA_SEKOLAH', 'PENGAWAS'] },
    { label: 'Beranda Berbagi', icon: <Megaphone size={18} />, roles: ['GURU', 'KEPALA_SEKOLAH', 'PENGAWAS'] },
    { label: 'Presensi Kehadiran', icon: <Fingerprint size={18} />, roles: ['GURU', 'KEPALA_SEKOLAH'] },
    { label: 'Perizinan', icon: <FileClock size={18} />, roles: ['GURU', 'KEPALA_SEKOLAH'] },
    { label: 'Unggah Dokumen', icon: <FileUp size={18} />, roles: ['GURU'] },
    { label: 'Peringkat Apresiasi', icon: <Trophy size={18} className="text-amber-500" />, roles: ['GURU'] },
    { label: 'Kelola Guru', icon: <Users size={18} />, roles: ['KEPALA_SEKOLAH'] },
    { label: 'Dokumen Sekolah', icon: <Building2 size={18} />, roles: ['KEPALA_SEKOLAH'] },
    { label: 'Supervisi Guru', icon: <FileSearch size={18} />, roles: ['KEPALA_SEKOLAH'] },
    { label: 'Peringkat Apresiasi', icon: <Trophy size={18} className="text-amber-500" />, roles: ['KEPALA_SEKOLAH'] },
    { label: 'Rekapitulasi', icon: <FileSpreadsheet size={18} />, roles: ['KEPALA_SEKOLAH'] },
    { label: 'Wilayah Binaan', icon: <Map size={18} />, roles: ['PENGAWAS'] },
    { label: 'Mutasi & Rotasi', icon: <ArrowLeftRight size={18} />, roles: ['PENGAWAS'] },
    { label: 'Validasi Dokumen', icon: <ShieldCheck size={18} />, roles: ['PENGAWAS'] },
    { label: 'Peringkat Apresiasi', icon: <Trophy size={18} className="text-amber-500" />, roles: ['PENGAWAS'] },
    { label: 'Rekapitulasi Wilayah', icon: <FileSpreadsheet size={18} />, roles: ['PENGAWAS'] },
    { label: 'Pengaturan', icon: <Settings size={18} />, roles: ['GURU', 'KEPALA_SEKOLAH', 'PENGAWAS'] },
  ].filter(item => item.roles.includes(currentUser.role));

  return (
    <aside className={`
      fixed inset-y-0 left-0 z-50 bg-slate-900 text-slate-300 transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] flex flex-col
      md:relative md:translate-x-0 md:h-screen md:sticky md:top-0 border-r border-slate-800 overflow-x-hidden
      ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      ${isSidebarCollapsed ? 'md:w-24' : 'md:w-72'}
    `}>
      <div className={`flex items-center justify-between p-7 shrink-0 ${isSidebarCollapsed ? 'md:px-0 md:justify-center' : ''}`}>
        <div className="flex items-center space-x-3 overflow-hidden">
          <div className="bg-blue-600 p-2.5 rounded-[1rem] text-white shrink-0 shadow-lg shadow-blue-600/20">
            <School size={22} />
          </div>
          {!isSidebarCollapsed && (
            <motion.span 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-2xl font-black text-white tracking-tighter"
            >
              SIGAP
            </motion.span>
          )}
        </div>
        <button 
          onClick={() => setIsSidebarOpen(false)}
          className="md:hidden p-2 rounded-xl hover:bg-slate-800 text-slate-400"
        >
            <XCircle size={24} />
        </button>
      </div>
      
      <nav className="flex-1 px-4 py-2 space-y-1.5 overflow-y-auto overflow-x-hidden sidebar-scroll">
        {navItems.map((item) => (
          <button
            key={item.label}
            onClick={() => {
              setActiveTab(item.label);
              setIsSidebarOpen(false);
            }}
            className={`
              w-full flex items-center rounded-2xl transition-all duration-300 group p-4 relative overflow-hidden
              ${isSidebarCollapsed ? 'md:justify-center' : 'space-x-4'}
              ${activeTab === item.label 
                ? 'bg-blue-600 text-white shadow-[0_10px_25px_-5px_rgba(37,99,235,0.4)] translate-x-1' 
                : 'hover:bg-slate-800 hover:text-white'}
            `}
          >
            {activeTab === item.label && (
              <motion.div 
                layoutId="sidebar-active-glow" 
                className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-transparent"
              />
            )}
            <span className={`shrink-0 transition-transform duration-300 group-hover:scale-110 relative z-10 ${activeTab === item.label ? 'text-white' : 'text-slate-500 group-hover:text-blue-400'}`}>{item.icon}</span>
            {!isSidebarCollapsed && (
              <motion.span 
                initial={{ opacity: 0, x: -5 }}
                animate={{ opacity: 1, x: 0 }}
                className="font-bold text-sm tracking-tight whitespace-nowrap overflow-hidden text-ellipsis"
              >
                {item.label}
              </motion.span>
            )}
            {activeTab === item.label && isSidebarCollapsed && (
              <div className="absolute left-full ml-4 px-3 py-2 bg-slate-800 text-white text-[10px] font-black uppercase tracking-widest rounded-xl opacity-0 group-hover:opacity-100 transition-all transform translate-x-[-10px] group-hover:translate-x-0 shadow-2xl z-50 pointer-events-none border border-slate-700">
                {item.label}
              </div>
            )}
          </button>
        ))}
      </nav>

      {/* Collapse Button (Desktop Only) */}
      <button 
        onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        className="hidden md:flex items-center justify-between p-5 px-8 text-slate-600 hover:text-white transition-all border-t border-slate-800/50 group"
        title={isSidebarCollapsed ? "Perlebar Sidebar" : "Sembunyikan Sidebar"}
      >
        <div className="flex items-center space-x-4 overflow-hidden w-full">
          <div className={`p-2 rounded-lg bg-slate-800/30 group-hover:bg-blue-600 group-hover:text-white transition-all ${isSidebarCollapsed ? 'mx-auto' : ''}`}>
            <ChevronLeft size={16} className={`transition-transform duration-500 ease-out ${isSidebarCollapsed ? 'rotate-180' : ''}`} />
          </div>
          {!isSidebarCollapsed && <span className="text-[10px] uppercase font-black tracking-[0.2em] whitespace-nowrap opacity-60 group-hover:opacity-100 transition-opacity">Sistem Navigasi</span>}
        </div>
      </button>

      <div className={`p-6 border-t border-slate-800/50 ${isSidebarCollapsed ? 'md:px-4' : ''}`}>
        {!isSidebarCollapsed && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-6 p-4 bg-slate-800/30 rounded-[1.5rem] border border-slate-800/50"
          >
            <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3">Pengguna Aktif</p>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600/20 flex items-center justify-center text-blue-400 font-black border border-blue-600/30 overflow-hidden">
                {currentUser.avatar ? (
                  <img src={currentUser.avatar} alt={currentUser.nama} className="w-full h-full object-cover" />
                ) : (
                  currentUser.nama.charAt(0)
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-black text-white truncate tracking-tight">{currentUser.nama}</div>
                <div className="text-[9px] text-slate-500 truncate font-medium uppercase">{currentUser.nip}</div>
                {currentUser.role === 'GURU' && (
                  <div className="text-[8px] text-blue-400 truncate font-bold uppercase tracking-tight mt-0.5">
                    {currentUser.jabatan || 'Guru Kelas'} {currentUser.kelas ? `(${currentUser.kelas})` : ''}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
        <button 
          onClick={handleLogout}
          className={`w-full flex items-center rounded-2xl text-rose-400 hover:bg-rose-500/10 transition-all font-black uppercase tracking-widest text-[10px] border border-transparent hover:border-rose-500/20 p-4 ${isSidebarCollapsed ? 'md:justify-center' : 'space-x-3'}`}
        >
          <LogOut size={20} />
          {!isSidebarCollapsed && <span>Keluar Sistem</span>}
        </button>
      </div>
    </aside>
  );
}
