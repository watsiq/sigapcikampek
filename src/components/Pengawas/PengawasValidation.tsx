import React, { useState } from 'react';
import { 
  FileSearch, 
  ShieldCheck, 
  XCircle, 
  Building2,
  FileText,
  Fingerprint,
  AlertCircle,
  Download
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { DocumentInfo, UserProfile } from '../../types';
import { DocumentValidationModal } from '../shared/DocumentValidationModal';
import { useNotifications } from '../../context/NotificationContext';

interface PengawasValidationProps {
  user: any;
  allDocuments: DocumentInfo[];
  setDocuments: (docs: DocumentInfo[]) => void;
  users: UserProfile[];
}

export function PengawasValidation({ user, allDocuments, setDocuments, users }: PengawasValidationProps) {
  const { showToast } = useNotifications();
  const [selectedDoc, setSelectedDoc] = useState<DocumentInfo | null>(null);

  const usersMap = React.useMemo(() => {
    const map = new Map<string, UserProfile>();
    users.forEach(u => map.set(u.id, u));
    return map;
  }, [users]);

  const pendingDocs = React.useMemo(() => allDocuments.filter((d: any) => {
    const author = usersMap.get(d.userId);
    return d.status === 'PENDING' && author?.role === 'KEPALA_SEKOLAH';
  }), [allDocuments, usersMap]);
  
  const handleReview = (id: string, status: 'APPROVED' | 'REVISION', finalScore: number, feedback: string) => {
    setDocuments(allDocuments.map((d: any) => d.id === id ? { ...d, status, score: finalScore, feedback } : d));
    setSelectedDoc(null);
    showToast(`Dokumen telah ${status === 'APPROVED' ? 'disetujui' : 'dikirim untuk revisi'} dengan nilai ${finalScore}`, 'success');
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/30">
         <div>
            <h3 className="text-xl font-black text-slate-800 tracking-tight">Validasi Berkas Strategis</h3>
            <p className="text-sm text-slate-500 mt-1 font-medium italic">Otoritas verifikasi akhir untuk dokumen tahunan & praktik baik.</p>
         </div>
         <div className="flex space-x-2">
            <span className="px-3 py-1 bg-blue-600 text-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-md shadow-blue-500/20">Akses Utama</span>
         </div>
      </div>
      <div className="overflow-x-auto">
         <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-[10px] text-slate-400 uppercase font-black tracking-widest border-b border-slate-100">
               <tr>
                  <th className="px-8 py-6">Entitas Pengirim</th>
                  <th className="px-8 py-6">Kategori</th>
                  <th className="px-8 py-6">Berkas</th>
                  <th className="px-8 py-6">Aksi Validasi</th>
               </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
               {pendingDocs.length === 0 ? (
                 <tr><td colSpan={4} className="px-8 py-20 text-center text-slate-400 font-medium italic">Semua dokumen telah tervalidasi. Siap cetak laporan.</td></tr>
               ) : (
                 pendingDocs.map(doc => {
                   const author = usersMap.get(doc.userId);
                   return (
                    <tr key={doc.id} className="hover:bg-slate-50/50 transition-colors group">
                       <td className="px-8 py-6">
                          <div className="font-bold text-slate-800">{author?.nama || 'Unknown'}</div>
                          <div className={`text-[10px] font-black uppercase tracking-tighter ${author?.role === 'KEPALA_SEKOLAH' ? 'text-blue-600' : 'text-slate-400'}`}>
                            {author?.role === 'KEPALA_SEKOLAH' ? 'Kepala Sekolah' : 'Guru'} • {author?.sekolah || 'Unknown'}
                          </div>
                       </td>
                       <td className="px-8 py-6">
                          <span className={`text-[10px] px-2 py-0.5 rounded-lg font-black uppercase tracking-widest ${
                            doc.type === 'SUPERVISI' ? 'bg-indigo-100 text-indigo-700' : 
                            doc.type.includes('PRAKTIK_BAIK') ? 'bg-amber-100 text-amber-700' : 
                            doc.category === 'ANNUAL' ? 'bg-blue-100 text-blue-700' : 
                            'bg-slate-100 text-slate-600'
                          }`}>
                             {doc.type}
                          </span>
                       </td>
                       <td className="px-8 py-6 font-medium text-slate-600">
                          <div className="flex items-center space-x-2">
                            <FileSearch size={16} className="text-blue-500" />
                            <span className="truncate max-w-[150px]">{doc.fileName}</span>
                          </div>
                       </td>
                       <td className="px-8 py-6">
                          <button 
                            onClick={() => setSelectedDoc(doc)}
                            className="px-4 py-2 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all flex items-center space-x-2 shadow-md shadow-blue-500/10"
                          >
                            <ShieldCheck size={14} />
                            <span>Evaluasi Berkas</span>
                          </button>
                       </td>
                    </tr>
                   );
                 })
               )}
            </tbody>
         </table>
      </div>      {selectedDoc && (
        <DocumentValidationModal 
          document={selectedDoc}
          author={usersMap.get(selectedDoc.userId)}
          onClose={() => setSelectedDoc(null)}
          onReview={handleReview}
          userRoleLabel={usersMap.get(selectedDoc.userId)?.role === 'KEPALA_SEKOLAH' ? 'KS' : 'GURU'}
        />
      )}
    </div>
  );
}
