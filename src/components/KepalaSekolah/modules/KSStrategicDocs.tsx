import React from 'react';
import { ShieldCheck, History, Building2 } from 'lucide-react';
import { DocumentInfo } from '../../../types';

interface KSStrategicDocsProps {
  strategicDocTypes: { type: string; label: string; icon: React.ReactNode }[];
  allDocuments: DocumentInfo[];
  schoolId: string;
}

export function KSStrategicDocs({ strategicDocTypes, allDocuments, schoolId }: KSStrategicDocsProps) {
  const strategicDocPaths = strategicDocTypes.map(dt => dt.type);

  const schoolAnnualDocs = allDocuments.filter((d: any) => 
    d.schoolId === schoolId && 
    strategicDocPaths.includes(d.type)
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-1 px-2">
        <span className="text-[9px] font-black text-blue-600 uppercase tracking-widest">Verifikasi & Evaluasi</span>
        <h3 className="text-2xl font-black text-slate-800 tracking-tight">Info Strategis Satuan</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {strategicDocTypes.map(docType => {
          const doc = schoolAnnualDocs.find((d: any) => d.type === docType.type);
          const isUploaded = !!doc;
          return (
            <div key={docType.type} className="bg-white p-7 rounded-[2rem] border border-slate-100 flex flex-col items-center text-center shadow-sm group">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-all ${isUploaded ? 'bg-emerald-50 text-emerald-600 shadow-inner' : 'bg-slate-50 text-slate-300'}`}>
                {isUploaded ? <ShieldCheck size={28} /> : docType.icon}
              </div>
              <h4 className="text-sm font-black text-slate-800 tracking-tight">{docType.label}</h4>
              <p className={`text-[9px] font-black uppercase mt-3 px-4 py-1.5 rounded-full shadow-sm tracking-widest ${isUploaded ? (doc?.status === 'APPROVED' ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white') : 'bg-slate-100 text-slate-400 border border-slate-200'}`}>
                {isUploaded ? (doc?.status === 'APPROVED' ? 'TERVERIFIKASI' : 'PENDING') : 'BELUM UPLOAD'}
              </p>
            </div>
          );
        })}
      </div>
      <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden">
         <div className="absolute top-0 right-0 p-12 opacity-[0.02]"><Building2 size={160} /></div>
         <h4 className="text-lg font-black text-slate-800 mb-8 flex items-center space-x-3 tracking-tight relative z-10"><History size={22} className="text-blue-600" /><span>Log Dokumen Tahunan Sekolah</span></h4>
         <div className="space-y-4 relative z-10">
           {schoolAnnualDocs.length === 0 ? (
              <div className="py-20 text-center text-slate-300 font-medium italic bg-slate-50/50 rounded-3xl border-2 border-dashed border-slate-100">Belum ada aktivitas dokumen strategis terekam.</div>
           ) : (
              schoolAnnualDocs.sort((a, b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime()).map((d: any) => (
              <div key={d.id} className="flex justify-between items-center p-6 bg-slate-50 rounded-3xl border border-slate-100 hover:border-blue-300 hover:bg-white transition-all shadow-sm group">
                <div className="flex items-center space-x-5">
                  <div className="p-4 bg-white rounded-2xl border border-slate-200 text-blue-600 group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 transition-all shadow-sm"><Building2 size={20} /></div>
                  <div>
                    <div className="text-sm font-black text-slate-800 tracking-tight">{d.type} - {d.fileName}</div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Diajukan Ke Pengawas • {new Date(d.uploadDate).toLocaleDateString('id-ID')}</div>
                  </div>
                </div>
                <span className={`px-4 py-1.5 rounded-full text-[9px] font-black tracking-widest uppercase shadow-sm ${d.status === 'APPROVED' ? 'bg-emerald-500 text-white shadow-emerald-500/20' : d.status === 'REVISION' ? 'bg-rose-500 text-white shadow-rose-500/20' : 'bg-amber-500 text-white shadow-amber-500/20'}`}>{d.status}</span>
              </div>
              ))
           )}
         </div>
      </div>
    </div>
  );
}
