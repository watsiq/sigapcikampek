/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Upload } from 'lucide-react';
import { DocumentInfo, UserProfile } from '../../types';
import { useNotifications } from '../../context/NotificationContext';

interface UploadBoxProps {
  title: string;
  subtitle: string;
  type: DocumentInfo['type'];
  setDocuments: React.Dispatch<React.SetStateAction<DocumentInfo[]>>;
  allDocuments: DocumentInfo[];
  user: UserProfile;
  icon?: React.ReactNode;
}

export function UploadBox({ title, subtitle, type, setDocuments, allDocuments, user, icon }: UploadBoxProps) {
  const { showToast } = useNotifications();
  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const newDoc: DocumentInfo = {
        id: Date.now().toString(),
        userId: user.id,
        fileName: file.name,
        type: type,
        uploadDate: new Date().toISOString(),
        status: 'PENDING',
        category: 'ANNUAL'
      };
      setDocuments([...allDocuments, newDoc]);
      showToast(`Berhasil upload ${type}`, 'success');
    }
  };

  return (
    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 flex flex-col relative overflow-hidden group hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-500 h-full cursor-default">
      {/* Decorative background icon */}
      <div className="absolute -right-6 -bottom-8 opacity-[0.05] group-hover:opacity-10 group-hover:rotate-12 group-hover:scale-110 transition-all duration-700 pointer-events-none text-blue-600">
        {React.cloneElement((icon || <Upload />) as React.ReactElement, { size: 120, strokeWidth: 1.5 })}
      </div>
      
      {/* Subtle glow */}
      <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col h-full">
        <h4 className="font-black text-slate-800 tracking-tight text-lg leading-tight mb-1">{title}</h4>
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-10">{subtitle}</p>
        
        <div className="mt-auto">
          <input type="file" id={`upload-${type}`} className="hidden" onChange={handleUpload} />
          <label htmlFor={`upload-${type}`} className="w-full py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-blue-600 cursor-pointer shadow-xl shadow-slate-900/10 active:scale-95 transition-all text-center block">
            Pilih Berkas
          </label>
        </div>
      </div>
    </div>
  );
}
