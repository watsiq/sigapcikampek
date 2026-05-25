import React from 'react';
import { History } from 'lucide-react';
import { DocumentInfo } from '../../../types';

interface GuruDocumentLogProps {
  documents: DocumentInfo[];
}

export function GuruDocumentLog({ documents }: GuruDocumentLogProps) {
  return (
    <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
      <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/30">
        <h3 className="text-lg font-black text-slate-800 flex items-center space-x-3 tracking-tight">
          <History size={22} className="text-blue-600" />
          <span>Log Berkas & Feedback</span>
        </h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] border-b border-slate-100">
            <tr>
              <th className="px-8 py-6">Metadata Berkas</th>
              <th className="px-8 py-6">Status Validasi</th>
              <th className="px-8 py-6">Apresiasi</th>
              <th className="px-8 py-6">Feedback / Komentar</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {documents.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-8 py-16 text-center text-slate-400 text-sm font-medium italic">Belum ada riwayat dokumen bulanan yang tercatat</td>
              </tr>
            ) : (
              documents.map((doc: any) => (
                <tr key={doc.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="font-black text-slate-800 text-sm tracking-tight">{doc.fileName}</div>
                    <div className="text-[10px] text-slate-400 font-bold mt-0.5">{new Date(doc.uploadDate).toLocaleDateString('id-ID')} • {doc.type}</div>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`${
                      doc.status === 'APPROVED' ? 'bg-emerald-500 text-white' : 
                      doc.status === 'REVISION' ? 'bg-rose-500 text-white' : 'bg-amber-500 text-white'
                    } px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.1em] shadow-sm`}>
                      {doc.status === 'APPROVED' ? 'Diterima' : doc.status === 'REVISION' ? 'Revisi' : 'Diproses'}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center space-x-1">
                      <span className="text-sm font-black text-blue-600">{doc.score || 0}</span>
                      <span className="text-[8px] font-black text-slate-300 uppercase">Pts</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    {doc.feedback ? (
                      <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl text-[11px] text-slate-600 font-medium italic leading-relaxed">
                        {doc.feedback}
                      </div>
                    ) : (
                      <span className="text-[10px] text-slate-300 italic">Belum ada komentar</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
