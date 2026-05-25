import React, { useState } from 'react';
import { 
  History, 
  Building2, 
  BarChart3, 
  FileText, 
  Briefcase, 
  Medal,
  ExternalLink,
  X,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Download,
  Search,
  Pencil,
  Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNotifications } from '../../context/NotificationContext';
import { DocumentInfo } from '../../types';
import { DocumentValidationModal } from '../shared/DocumentValidationModal';

interface KSSchoolDocsProps {
  user: any;
  allDocuments: DocumentInfo[];
  setDocuments: (docs: DocumentInfo[]) => void;
}

export function KSSchoolDocs({ user, allDocuments, setDocuments }: KSSchoolDocsProps) {
  const { showToast } = useNotifications();
  const [showDriveModal, setShowDriveModal] = useState(false);
  const [selectedType, setSelectedType] = useState<DocumentInfo['type'] | null>(null);
  const [driveLink, setDriveLink] = useState('');
  const [linkTitle, setLinkTitle] = useState('');

  const [editingId, setEditingId] = useState<string | null>(null);
  const [previewDoc, setPreviewDoc] = useState<DocumentInfo | null>(null);
  const [deleteConfirmDocId, setDeleteConfirmDocId] = useState<string | null>(null);

  const handleDriveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const isGoogleLink = driveLink.includes('drive.google.com') || driveLink.includes('docs.google.com');
    if (!isGoogleLink) {
      setShowDriveModal(false);
      showToast('Harap masukkan link Google Drive atau Google Docs yang valid', 'error');
      setDriveLink('');
      setLinkTitle('');
      setSelectedType(null);
      return;
    }

    if (!selectedType && !editingId) {
      setShowDriveModal(false);
      return;
    }

    const today = new Date().toLocaleDateString();
    const isSpam = allDocuments.some(d => 
      d.schoolId === user.schoolId && 
      d.type === (selectedType || allDocuments.find(doc => doc.id === editingId)?.type) && 
      new Date(d.uploadDate).toLocaleDateString() === today &&
      d.id !== editingId
    );

    if (isSpam && !editingId) {
      setShowDriveModal(false);
      showToast('Sekolah sudah mengupload dokumen tipe ini hari ini. Harap tunggu esok hari atau edit dokumen yang ada.', 'error');
      setDriveLink('');
      setLinkTitle('');
      setSelectedType(null);
      return;
    }

    if (editingId) {
      const updatedDocs = allDocuments.map(d => 
        d.id === editingId 
          ? { ...d, fileName: linkTitle || d.fileName, link: driveLink, uploadDate: new Date().toISOString(), status: 'PENDING' as const, score: 0, feedback: '' }
          : d
      );
      setDocuments(updatedDocs);
      showToast('Berhasil memperbarui dokumen sekolah!', 'success');
      setEditingId(null);
    } else {
      const newDoc: DocumentInfo = {
        id: Date.now().toString(),
        userId: user.id,
        schoolId: user.schoolId,
        fileName: linkTitle || `${selectedType} - ${new Date().toLocaleDateString()}`,
        type: selectedType!,
        uploadDate: new Date().toISOString(),
        status: 'PENDING',
        category: 'ANNUAL',
        link: driveLink
      };

      setDocuments([...allDocuments, newDoc]);
      showToast(`Berhasil mensubmit link Drive untuk ${selectedType}!`, 'success');
    }

    setShowDriveModal(false);
    setDriveLink('');
    setLinkTitle('');
    setSelectedType(null);
  };

  const openModal = (type: DocumentInfo['type']) => {
    setSelectedType(type);
    setShowDriveModal(true);
  };

  const handleDelete = (docId: string) => {
    setDocuments(allDocuments.filter(d => d.id !== docId));
    showToast('Dokumen sekolah berhasil dihapus', 'info');
  };

  const handleEdit = (doc: DocumentInfo) => {
    setEditingId(doc.id);
    setSelectedType(doc.type);
    setDriveLink(doc.link || '');
    setLinkTitle(doc.fileName);
    setShowDriveModal(true);
  };

  const docTypes = [
    { type: 'RAPOR' as const, title: 'Rapor Pendidikan', subtitle: 'Mandatori 1x setahun', icon: <BarChart3 size={160} />, color: 'text-blue-600' },
    { type: 'RKT' as const, title: 'RKT Sekolah', subtitle: 'Rencana Kerja Tahunan', icon: <FileText size={160} />, color: 'text-indigo-600' },
    { type: 'KSP' as const, title: 'KSP / Kurikulum', subtitle: 'Kurikulum Satuan', icon: <Briefcase size={160} />, color: 'text-emerald-600' },
    { type: 'PRAKTIK_BAIK_KS' as const, title: 'Praktik Baik KS', subtitle: 'Inovasi KS (Opsional)', icon: <Medal size={160} />, color: 'text-amber-600' }
  ];

  const schoolAnnualDocs = allDocuments.filter((d: DocumentInfo) => 
    d.schoolId === user.schoolId && 
    docTypes.some(dt => dt.type === d.type)
  );

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {docTypes.map((dt) => (
          <div key={dt.type} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 flex flex-col relative overflow-hidden group hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-500 h-full cursor-default">
            <div className={`absolute -right-6 -bottom-8 opacity-[0.05] group-hover:opacity-10 group-hover:rotate-12 group-hover:scale-110 transition-all duration-700 pointer-events-none ${dt.color}`}>
              {dt.icon}
            </div>
            
            <div className="relative z-10 flex flex-col h-full">
              <h4 className="font-black text-slate-800 tracking-tight text-lg leading-tight mb-1">{dt.title}</h4>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-10">{dt.subtitle}</p>
              
              <div className="mt-auto">
                <button 
                  onClick={() => openModal(dt.type)}
                  className="w-full py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-blue-600 cursor-pointer shadow-xl shadow-slate-900/10 active:scale-95 transition-all text-center block"
                >
                  Input Link Drive
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
        <h4 className="text-lg font-black text-slate-800 mb-6 flex items-center space-x-3 uppercase tracking-tight">
           <History size={20} className="text-blue-500" />
           <span>Riwayat Dokumen Sekolah</span>
        </h4>
        <div className="space-y-4">
          {schoolAnnualDocs.sort((a, b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime()).map((d: DocumentInfo) => (
             <div key={d.id} className="flex flex-col md:flex-row justify-between items-start md:items-center p-6 bg-slate-50 hover:bg-slate-100/50 rounded-[2rem] border border-slate-100 hover:border-blue-200 transition-all gap-4 group">
                <div 
                  className="flex items-center space-x-4 cursor-pointer flex-1"
                  onClick={() => setPreviewDoc(d)}
                  title="Klik untuk melihat pratinjau dokumen"
                >
                   <div className="p-3 bg-white rounded-xl border border-slate-200 text-blue-500 shadow-sm transition-colors duration-300 group-hover:bg-blue-50">
                      <Building2 size={20} />
                   </div>
                   <div>
                      <div className="text-sm font-black text-slate-800 hover:text-indigo-600 transition-colors flex items-center gap-2">
                        {d.type} - {d.fileName}
                        <span className="text-[10px] font-bold text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                          (Lihat Detail)
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1 flex items-center space-x-3">
                        <span>Diupload {new Date(d.uploadDate).toLocaleDateString('id-ID')}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest ${
                          d.status === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-600' : 
                          d.status === 'REVISION' ? 'bg-rose-500/10 text-rose-600' : 
                          'bg-amber-500/10 text-amber-600'
                        }`}>
                          {d.status}
                        </span>
                      </div>
                   </div>
                </div>
                
                <div className="flex items-center space-x-2 w-full md:w-auto">
                   <button 
                     onClick={() => setPreviewDoc(d)}
                     className="p-3 bg-white border border-slate-150 rounded-xl text-indigo-600 hover:bg-indigo-50 transition-all shadow-sm active:scale-90"
                     title="Pratinjau Dokumen"
                   >
                     <Search size={16} />
                   </button>
                   {d.link && (
                     <button 
                       onClick={() => window.open(d.link, '_blank')}
                       className="p-3 bg-white border border-slate-100 rounded-xl text-emerald-600 hover:bg-emerald-50 transition-all shadow-sm active:scale-90"
                       title="Unduh"
                     >
                       <Download size={16} />
                     </button>
                   )}
                   {(d.status === 'PENDING' || d.status === 'REVISION') && (
                     <>
                        <button 
                          onClick={() => handleEdit(d)}
                          className="p-3 bg-white border border-slate-100 rounded-xl text-amber-500 hover:bg-amber-50 transition-all shadow-sm active:scale-90"
                          title="Edit"
                        >
                          <Pencil size={16} />
                        </button>
                        <button 
                          onClick={() => setDeleteConfirmDocId(d.id)}
                          className="p-3 bg-white border border-slate-100 rounded-xl text-rose-500 hover:bg-rose-50 transition-all shadow-sm active:scale-90"
                          title="Hapus"
                        >
                          <Trash2 size={16} />
                        </button>
                     </>
                   )}
                </div>
             </div>
          ))}
          {allDocuments.filter((d: DocumentInfo) => d.category === 'ANNUAL' && d.schoolId === user.schoolId).length === 0 && (
             <div className="py-20 text-center text-slate-400 font-bold uppercase tracking-widest text-xs italic">Belum ada dokumen yang diunggah</div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {deleteConfirmDocId && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" 
              onClick={() => setDeleteConfirmDocId(null)} 
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white rounded-[2.5rem] w-full max-w-md shadow-2xl relative overflow-hidden border border-slate-100 p-8 flex flex-col items-center text-center z-10"
            >
              <div className="p-4 bg-rose-50 text-rose-600 rounded-full mb-6 ring-8 ring-rose-500/5 animate-pulse">
                <AlertTriangle size={36} />
              </div>
              <h3 className="text-xl font-black text-slate-800 tracking-tight">
                Konfirmasi Hapus Dokumen Sekolah
              </h3>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Apakah Anda yakin ingin menghapus dokumen sekolah <strong className="text-slate-800 font-bold">"{allDocuments.find(d => d.id === deleteConfirmDocId)?.fileName || 'Dokumen'}"</strong>? Tindakan ini bersifat permanen dan akan menghapusnya secara real-time untuk seluruh ekosistem sekolah.
              </p>
              
              <div className="flex items-center gap-3 w-full mt-8">
                <button
                  type="button"
                  onClick={() => setDeleteConfirmDocId(null)}
                  className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-black uppercase tracking-wider transition-all active:scale-95"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleDelete(deleteConfirmDocId);
                    setDeleteConfirmDocId(null);
                  }}
                  className="flex-1 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-lg shadow-rose-200/50 transition-all active:scale-95"
                >
                  Ya, Hapus
                </button>
              </div>
            </motion.div>
          </div>
        )}
        {previewDoc && (
          <DocumentValidationModal
            document={previewDoc}
            author={user}
            onClose={() => setPreviewDoc(null)}
            userRoleLabel="KEPALA SEKOLAH"
            readOnly={true}
          />
        )}
        {showDriveModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" 
              onClick={() => {
                setShowDriveModal(false);
                setEditingId(null);
                setDriveLink('');
                setLinkTitle('');
              }} 
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white rounded-[3rem] w-full max-w-xl shadow-2xl relative overflow-hidden border border-slate-100 flex flex-col"
            >
              <div className="p-10 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                 <div>
                    <h3 className="text-2xl font-black text-slate-800 tracking-tight">
                      {editingId ? 'Edit Dokumen Sekolah' : 'Dokumen Sekolah (Drive)'}
                    </h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Tipe: {selectedType}</p>
                 </div>
                 <button onClick={() => {
                   setShowDriveModal(false);
                   setEditingId(null);
                   setDriveLink('');
                   setLinkTitle('');
                 }} className="p-2 text-slate-300 hover:text-rose-500 transition-colors">
                    <X size={32} />
                 </button>
              </div>

              <div className="flex-1 overflow-y-auto p-10 space-y-8">
                 <div className="bg-indigo-50 border border-indigo-100 rounded-[2rem] p-6 space-y-4">
                    <div className="flex items-center space-x-3">
                       <ShieldCheck className="text-indigo-600" size={24} />
                       <span className="text-sm font-black text-indigo-900">Instruksi Dokumen Sekolah</span>
                    </div>
                    <div className="space-y-3">
                       {[
                         "Pastikan file sudah diset 'Anyone with link can view'",
                         "Gunakan link 'Copy Link' dari menu bagikan Google Drive",
                         "Jangan hapus file dari Drive hingga periode audit selesai"
                       ].map((item, idx) => (
                         <div key={idx} className="flex items-start space-x-3">
                            <CheckCircle2 className="text-emerald-500 shrink-0 mt-0.5" size={14} />
                            <span className="text-[11px] font-medium text-indigo-700 leading-tight">{item}</span>
                         </div>
                       ))}
                    </div>
                 </div>

                 <form onSubmit={handleDriveSubmit} className="space-y-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nama Dokumen (Optional)</label>
                       <input 
                         type="text"
                         value={linkTitle}
                         onChange={(e) => setLinkTitle(e.target.value)}
                         placeholder="Contoh: Rapor Pendidikan 2024"
                         className="w-full px-6 py-5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-black outline-none focus:ring-4 focus:ring-blue-100 transition-all"
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tautan GDrive</label>
                       <div className="relative">
                          <ExternalLink className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                          <input 
                            required
                            type="url"
                            value={driveLink}
                            onChange={(e) => setDriveLink(e.target.value)}
                            placeholder="https://drive.google.com/..."
                            className="w-full pl-14 pr-6 py-5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-black outline-none focus:ring-4 focus:ring-indigo-100 transition-all placeholder:text-slate-300"
                          />
                       </div>
                       {!(driveLink.includes('drive.google.com') || driveLink.includes('docs.google.com')) && driveLink.length > 8 && (
                          <div className="flex items-center space-x-2 text-rose-500 font-bold text-[9px] uppercase tracking-widest mt-2 ml-1">
                             <AlertCircle size={12} />
                             <span>Format link tidak dikenali sebagai Google Drive/Docs Link</span>
                          </div>
                       )}
                    </div>

                    <button 
                      type="submit"
                      disabled={!(driveLink.includes('drive.google.com') || driveLink.includes('docs.google.com'))}
                      className="w-full py-6 bg-slate-900 text-white rounded-3xl font-black uppercase tracking-widest text-xs hover:bg-indigo-600 disabled:opacity-50 disabled:bg-slate-400 transition-all shadow-xl shadow-slate-900/10 active:scale-95 mt-4"
                    >
                       Simpan Tautan Sekolah
                    </button>
                 </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
