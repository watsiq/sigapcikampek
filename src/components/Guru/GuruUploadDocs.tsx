import React, { useState } from 'react';
import { 
  FileUp, 
  History, 
  Star,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  X,
  AlertCircle,
  AlertTriangle,
  Download,
  Search,
  Pencil,
  Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { DocumentInfo, UserProfile } from '../../types';
import { useNotifications } from '../../context/NotificationContext';
import { DocumentValidationModal } from '../shared/DocumentValidationModal';

interface GuruUploadDocsProps {
  user: any;
  documents: DocumentInfo[];
  setDocuments: (docs: DocumentInfo[]) => void;
  users: UserProfile[];
}

export function GuruUploadDocs({ user, documents, setDocuments, users }: GuruUploadDocsProps) {
  const { showToast, addNotification } = useNotifications();
  const [showDriveModal, setShowDriveModal] = useState(false);
  const [selectedType, setSelectedType] = useState<'RPP_LENGKAP' | 'PRAKTIK_BAIK' | null>(null);
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
    const isSpam = documents.some(d => 
      d.userId === user.id && 
      d.type === (selectedType || documents.find(doc => doc.id === editingId)?.type) && 
      new Date(d.uploadDate).toLocaleDateString() === today &&
      d.id !== editingId
    );

    if (isSpam && !editingId) {
      setShowDriveModal(false);
      showToast('Anda sudah mengupload dokumen tipe ini hari ini. Harap tunggu esok hari atau edit dokumen yang ada.', 'error');
      setDriveLink('');
      setLinkTitle('');
      setSelectedType(null);
      return;
    }

    if (editingId) {
      const updatedDocs = documents.map(d => 
        d.id === editingId 
          ? { ...d, fileName: linkTitle || d.fileName, link: driveLink, uploadDate: new Date().toISOString(), status: 'PENDING' as const, score: 0, feedback: '' }
          : d
      );
      setDocuments(updatedDocs);
      showToast('Berhasil memperbarui dokumen!', 'success');
      setEditingId(null);
    } else {
      const displayTypeName = selectedType === 'RPP_LENGKAP' ? 'RPP Lengkap' : 'Praktik Baik Guru';
      const newDoc: DocumentInfo = {
        id: Date.now().toString(),
        userId: user.id,
        schoolId: user.schoolId,
        fileName: linkTitle || `${displayTypeName} - ${new Date().toLocaleDateString()}`,
        type: selectedType!,
        uploadDate: new Date().toISOString(),
        status: 'PENDING',
        category: 'ANNUAL',
        link: driveLink
      };

      setDocuments([...documents, newDoc]);
      showToast(`Berhasil submisi link Drive untuk ${displayTypeName}!`, 'success');

      // Notify Principal
      const principal = users.find((u: UserProfile) => u.schoolId === user.schoolId && u.role === 'KEPALA_SEKOLAH');
      if (principal) {
        addNotification(
          principal.id,
          'Dokumen Guru Masuk',
          `${user.nama} telah mensubmit link Drive ${displayTypeName}`,
          'UPLOAD'
        );
      }
    }

    setShowDriveModal(false);
    setDriveLink('');
    setLinkTitle('');
    setSelectedType(null);
  };

  const openModal = (type: 'RPP_LENGKAP' | 'PRAKTIK_BAIK') => {
    setSelectedType(type);
    setShowDriveModal(true);
  };

  const handleDelete = (docId: string) => {
    setDocuments(documents.filter(d => d.id !== docId));
    showToast('Dokumen berhasil dihapus', 'info');
  };

  const handleEdit = (doc: DocumentInfo) => {
    setEditingId(doc.id);
    setSelectedType(doc.type as any);
    setDriveLink(doc.link || '');
    setLinkTitle(doc.fileName);
    setShowDriveModal(true);
  };

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-blue-700 to-indigo-900 p-10 rounded-[3rem] text-white shadow-2xl relative overflow-hidden">
         <div className="absolute top-0 right-0 p-12 opacity-10 rotate-12 scale-150">
            <ExternalLink size={140} />
         </div>
         <div className="relative z-10 max-w-2xl">
            <h2 className="text-3xl font-black mb-4 tracking-tighter">Pusat Dokumentasi Digital</h2>
            <p className="text-blue-100 text-sm leading-relaxed font-medium">
               Integrasi Google Drive untuk efisiensi penyimpanan dan aksesibilitas Pengawas Wilayah. 
               Pastikan setiap dokumen tersimpan rapi dan dapat diakses untuk proses validasi.
            </p>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto w-full">
         {[
           { id: 'RPP_LENGKAP', label: 'RPP Lengkap', sub: 'Diunggah satu tahun dua kali', icon: <FileUp size={160} />, color: 'text-blue-600', btn: 'bg-slate-900' },
           { id: 'PRAKTIK_BAIK', label: 'Praktik Baik Guru', sub: 'Inovasi pembelajaran', icon: <Star size={160} />, color: 'text-amber-600', btn: 'bg-amber-600' }
         ].map((card) => (
           <div key={card.id} className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm flex flex-col items-start relative overflow-hidden group">
              <div className={`absolute -right-6 -bottom-8 opacity-[0.05] group-hover:opacity-10 group-hover:rotate-12 group-hover:scale-110 transition-all duration-700 pointer-events-none ${card.color}`}>
                 {card.icon}
              </div>
              <h4 className="text-xl font-black text-slate-800 mb-2 tracking-tight">{card.label}</h4>
              <p className="text-[10px] uppercase font-black tracking-widest text-slate-400 mb-10 max-w-xs">{card.sub}</p>
              <button 
                onClick={() => openModal(card.id as any)}
                className={`w-full py-4 ${card.btn} text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:opacity-90 transition-all shadow-xl active:scale-95 text-center relative z-10`}
              >
                 Input Link Drive
              </button>
           </div>
         ))}
      </div>

      {/* History Section */}
      <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm">
        <h3 className="text-xl font-black text-slate-800 mb-8 flex items-center space-x-3 uppercase tracking-tight">
          <History size={24} className="text-blue-600" />
          <span>Riwayat Unggah Dokumen</span>
        </h3>
        <div className="space-y-4">
          {documents.filter(d => d.userId === user.id).sort((a, b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime()).map(doc => (
            <div key={doc.id} className="p-6 bg-slate-50 hover:bg-slate-100/50 border border-slate-100 rounded-[2rem] flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-all group">
              <div 
                className="flex items-center space-x-4 cursor-pointer flex-1" 
                onClick={() => setPreviewDoc(doc)}
                title="Klik untuk melihat pratinjau dokumen"
              >
                <div className={`p-3 rounded-xl bg-white border border-slate-100 shadow-sm transition-colors duration-300 ${doc.status === 'APPROVED' ? 'text-emerald-500 group-hover:bg-emerald-50' : 'text-blue-500 group-hover:bg-blue-50'}`}>
                  {doc.type === 'PRAKTIK_BAIK' ? <Star size={20} /> : <FileUp size={20} />}
                </div>
                <div>
                  <h5 className="text-sm font-black text-slate-800 tracking-tight hover:text-indigo-600 transition-colors flex items-center gap-2">
                    {doc.fileName}
                    <span className="text-[10px] font-bold text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                      (Lihat Detail)
                    </span>
                  </h5>
                  <div className="flex items-center space-x-3 mt-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      {new Date(doc.uploadDate).toLocaleDateString()}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest ${
                      doc.status === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-600' : 
                      doc.status === 'REVISION' ? 'bg-rose-500/10 text-rose-600' : 
                      'bg-amber-500/10 text-amber-600'
                    }`}>
                      {doc.status}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2 w-full md:w-auto">
                <button 
                  onClick={() => setPreviewDoc(doc)}
                  className="p-3 bg-white border border-slate-150 rounded-xl text-indigo-600 hover:bg-indigo-50 transition-all shadow-sm active:scale-90"
                  title="Pratinjau Dokumen"
                >
                  <Search size={16} />
                </button>
                {doc.link && (
                  <button 
                    onClick={() => window.open(doc.link, '_blank')}
                    className="p-3 bg-white border border-slate-100 rounded-xl text-emerald-600 hover:bg-emerald-50 transition-all shadow-sm active:scale-90"
                    title="Unduh"
                  >
                    <Download size={16} />
                  </button>
                )}
                {(doc.status === 'PENDING' || doc.status === 'REVISION') && (
                  <>
                    <button 
                      onClick={() => handleEdit(doc)}
                      className="p-3 bg-white border border-slate-100 rounded-xl text-amber-500 hover:bg-amber-50 transition-all shadow-sm active:scale-90"
                      title="Edit"
                    >
                      <Pencil size={16} />
                    </button>
                    <button 
                      onClick={() => setDeleteConfirmDocId(doc.id)}
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
          {documents.filter(d => d.userId === user.id).length === 0 && (
            <div className="py-20 text-center text-slate-300 italic font-medium uppercase tracking-[0.2em] text-[10px]">
              Belum ada riwayat unggahan
            </div>
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
                Konfirmasi Hapus Dokumen
              </h3>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Apakah Anda yakin ingin menghapus dokumen <strong className="text-slate-800 font-bold">"{documents.find(d => d.id === deleteConfirmDocId)?.fileName || 'Dokumen'}"</strong>? Tindakan ini bersifat permanen dan akan menghapusnya secara real-time untuk semua pengguna.
              </p>
              
              <div className="flex items-center gap-3 w-full mt-8">
                <button
                  type="button"
                  onClick={() => setDeleteConfirmDocId(null)}
                  className="flex-1 py-3 bg-slate-100 hover:bg-slate-250 text-slate-700 rounded-xl text-xs font-black uppercase tracking-wider transition-all active:scale-95"
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
            userRoleLabel="GURU"
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
                      {editingId ? 'Edit Tautan Drive' : 'Integrasi Google Drive'}
                    </h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Tipe: {selectedType === 'RPP_LENGKAP' ? 'RPP Lengkap' : 'Praktik Baik Guru'}</p>
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
                       <span className="text-sm font-black text-indigo-900">Protokol Validasi Otomatis</span>
                    </div>
                    <div className="space-y-3">
                       {[
                         "Pastikan file sudah diset 'Anyone with link can view'",
                         "Gunakan link 'Copy Link' dari menu bagikan Google Drive",
                         "Format file disarankan PDF atau Link Folder",
                         "Jangan hapus file dari Drive hingga proses validasi selesai"
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
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Judul Dokumen (Optional)</label>
                       <input 
                         type="text"
                         value={linkTitle}
                         onChange={(e) => setLinkTitle(e.target.value)}
                         placeholder="Contoh: RPP Matematika Kelas 5 - Mei"
                         className="w-full px-6 py-5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-black outline-none focus:ring-4 focus:ring-blue-100 transition-all"
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tautan Tuju (Drive Link)</label>
                       <div className="relative">
                          <ExternalLink className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                          <input 
                            required
                            type="url"
                            value={driveLink}
                            onChange={(e) => setDriveLink(e.target.value)}
                            placeholder="https://drive.google.com/... atau https://docs.google.com/..."
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
                       {editingId ? 'Simpan Perubahan' : 'Kirim Untuk Validasi'}
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
