import React from 'react';
import { Announcement, MaterialPost } from '../../types';
import { AnnouncementBoard } from '../common/AnnouncementBoard';

interface PengawasCommunicationsProps {
  user: any;
  announcements: Announcement[];
  setAnnouncements: (a: Announcement[]) => void;
  materialPosts: MaterialPost[];
  setMaterialPosts: (m: MaterialPost[]) => void;
  documents: any[];
  setDocuments: (d: any[]) => void;
  users: any[];
}

export function PengawasCommunications({ 
  user, 
  announcements, 
  setAnnouncements, 
  materialPosts, 
  setMaterialPosts, 
  documents,
  users,
}: PengawasCommunicationsProps) {

  return (
    <div className="space-y-6">
      
      {/* Premium Professional Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-8 md:p-10 rounded-[3rem] text-white shadow-xl relative overflow-hidden">
        
        <div className="relative z-10 max-w-2xl">
          <span className="text-[9px] font-black tracking-[0.25em] text-indigo-400 bg-indigo-500/10 px-3.5 py-1.5 rounded-full uppercase border border-indigo-500/20 mb-4 inline-block">
            Sistem Komunikasi & Pembinaan Terpadu
          </span>
          <p className="text-xs md:text-sm text-slate-300 leading-relaxed font-medium mt-3">
            Sebagai Pengawas Wilayah Cikampek, sebarkan pengumuman resmi, rilis modul panduan pembinaan, serta diskusikan inspirasi kepala sekolah dan guru.
          </p>
        </div>
      </div>

      {/* Unified Tabbed Feed Interface */}
      <AnnouncementBoard 
        user={user} 
        announcements={announcements} 
        setAnnouncements={setAnnouncements}
        materialPosts={materialPosts} 
        setMaterialPosts={setMaterialPosts} 
        users={users}
        documents={documents}
      />
    </div>
  );
}
