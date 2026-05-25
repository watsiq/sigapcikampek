/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Menu } from 'lucide-react';
import { UserProfile } from '../../types';
import { NotificationBell } from './NotificationBell';
import { useNotifications } from '../../context/NotificationContext';

interface HeaderProps {
  currentUser: UserProfile;
  activeTab: string;
  setIsSidebarOpen: (open: boolean) => void;
}

export function Header({ 
  currentUser, 
  activeTab, 
  setIsSidebarOpen 
}: HeaderProps) {
  
  const getHeaderTitle = () => {
    if (activeTab !== 'Dashboard') return activeTab;
    
    switch(currentUser.role) {
      case 'GURU': return 'Portal Pendidik';
      case 'KEPALA_SEKOLAH': return 'Dashboard Manajerial';
      case 'PENGAWAS': return 'Pusat Komando Wilayah';
      default: return 'Dashboard';
    }
  };

  return (
    <header className="bg-white border-b border-slate-200 p-6 md:p-8 sticky top-0 z-30 shadow-sm">
      <div className="flex justify-between items-center max-w-7xl mx-auto w-full">
        <div className="flex items-center space-x-6 overflow-hidden">
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="md:hidden p-3 rounded-[1.2rem] bg-white text-slate-600 hover:bg-slate-50 border border-slate-200 shadow-sm"
          >
            <Menu size={24} />
          </button>
          <div className="flex flex-col min-w-0">
            <h2 className="text-xl md:text-3xl font-black text-slate-900 tracking-tighter truncate leading-tight">
              {getHeaderTitle()}
            </h2>
            <div className="flex items-center space-x-2 mt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <p className="text-[9px] md:text-[11px] text-slate-400 font-black uppercase tracking-[0.2em] truncate">{currentUser.sekolah}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-4 shrink-0">
          <div className="hidden xl:block text-right pr-4 border-r border-slate-100">
            <p className="text-[9px] text-slate-300 font-black uppercase tracking-[0.2em] leading-none mb-1">Status Sistem</p>
            <p className="text-xs font-black text-slate-900 uppercase tracking-tighter">Terhubung • Gugus 1</p>
          </div>
          <NotificationBell 
            currentUser={currentUser} 
          />
          <div className="w-10 h-10 md:w-14 md:h-14 rounded-[1.2rem] bg-slate-900 flex items-center justify-center text-white text-xl md:text-2xl font-black shadow-xl shadow-slate-900/10 border-4 border-white ring-1 ring-slate-100 hover:rotate-6 transition-transform cursor-pointer overflow-hidden">
            {currentUser.avatar ? (
              <img src={currentUser.avatar} alt={currentUser.nama} className="w-full h-full object-cover" />
            ) : (
              currentUser.nama.charAt(0)
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
