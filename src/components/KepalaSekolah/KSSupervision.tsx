import React, { useState } from 'react';
import { 
  Upload, 
  Search, 
  CheckCircle2, 
  ExternalLink, 
  AlertCircle,
  AlertTriangle,
  FileSearch,
  Plus,
  Trash2,
  X,
  ShieldCheck,
  Download,
  Pencil,
  ChevronRight,
  FileText,
  Layers,
  GraduationCap
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { DocumentInfo, UserProfile } from '../../types';
import { useNotifications } from '../../context/NotificationContext';
import { DocumentValidationModal } from '../shared/DocumentValidationModal';

interface KSSupervisionProps {
  user: any;
  users: UserProfile[];
  documents: DocumentInfo[];
  setDocuments: (docs: DocumentInfo[]) => void;
}

export function KSSupervision({ user, users, documents, setDocuments }: KSSupervisionProps) {
  const { showToast } = useNotifications();
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<UserProfile | null>(null);
  const [activeLinks, setActiveLinks] = useState<{ label: string, url: string }[]>([]);
  const [editingDocId, setEditingDocId] = useState<string | null>(null);
  const [previewDoc, setPreviewDoc] = useState<DocumentInfo | null>(null);
  const [deleteConfirmDocId, setDeleteConfirmDocId] = useState<string | null>(null);
  
  // Track selected teacher for the Master-Detail layout
  const [activeTeacherId, setActiveTeacherId] = useState<string | null>(null);

  const defaultDocNames = [
    'Jadwal',
    'RPP',
    'Pra supervisi',
    'Penilaian pelaksanaan',
    'Pasca supervisi',
    'Dokumentasi'
  ];

  const openUploadModal = (teacher: UserProfile) => {
    setEditingDocId(null);
    setSelectedTeacher(teacher);
    setActiveLinks(defaultDocNames.map(name => ({ label: name, url: '' })));
    setShowModal(true);
  };

  const handleEditDoc = (doc: DocumentInfo, teacher: UserProfile) => {
    setEditingDocId(doc.id);
    setSelectedTeacher(teacher);
    const parts = doc.fileName.split(' - ');
    const docLabel = parts.length > 1 ? parts.slice(1).join(' - ') : doc.fileName;
    setActiveLinks([{ label: docLabel, url: doc.link || '' }]);
    setShowModal(true);
  };

  const addLinkField = () => {
    setActiveLinks([...activeLinks, { label: '', url: '' }]);
  };

  const removeLinkField = (index: number) => {
    setActiveLinks(activeLinks.filter((_, i) => i !== index));
  };

  const updateLink = (index: number, field: 'label' | 'url', value: string) => {
    const updated = [...activeLinks];
    updated[index][field] = value;
    setActiveLinks(updated);
  };
  
  const schoolTeachers = users.filter((u: UserProfile) => u.schoolId === user.schoolId && u.role === 'GURU');
  const filteredTeachers = schoolTeachers.filter(t => t.nama.toLowerCase().includes(searchTerm.toLowerCase()));
  const supervisiDocs = documents.filter((d: DocumentInfo) => d.type === 'SUPERVISI' && d.schoolId === user.schoolId);

  // Auto-select first filtered teacher if none is active or if current active is filtered out
  const currentActiveTeacher = filteredTeachers.find(t => t.id === activeTeacherId) || filteredTeachers[0] || null;

  const handleDeleteDoc = (docId: string) => {
    setDocuments(documents.filter(d => d.id !== docId));
    showToast('Dokumen supervisi berhasil dihapus', 'info');
  };

  const handleBatchUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTeacher) return;

    const validLinks = activeLinks.filter(l => l.url.trim() !== '');
    
    if (validLinks.length === 0) {
      showToast('Minimal satu link harus diisi', 'error');
      return;
    }

    const invalidLinks = validLinks.filter(l => !(l.url.includes('drive.google.com') || l.url.includes('docs.google.com')));
    if (invalidLinks.length > 0) {
      showToast('Beberapa link tidak valid (Harus Google Drive/Docs)', 'error');
      return;
    }

    if (editingDocId) {
      const editedLink = validLinks[0];
      const updatedDocs = documents.map(d => 
        d.id === editingDocId
          ? { ...d, fileName: `${selectedTeacher.nama} - ${editedLink.label || 'Dokumen'}`, link: editedLink.url, uploadDate: new Date().toISOString(), status: 'PENDING' as const, score: 0, feedback: '' }
          : d
      );
      setDocuments(updatedDocs);
      showToast('Dokumen supervisi berhasil diperbarui!', 'success');
      setEditingDocId(null);
    } else {
      const newDocs: DocumentInfo[] = validLinks.map(link => ({
        id: `${Date.now()}-${Math.random()}`,
        userId: user.id,
        schoolId: user.schoolId,
        fileName: `${selectedTeacher.nama} - ${link.label || 'Dokumen'}`,
        type: 'SUPERVISI',
        teacherId: selectedTeacher.id,
        uploadDate: new Date().toISOString(),
        status: 'PENDING',
        category: 'SYSTEM',
        link: link.url,
        sekolah: user.sekolah
      }));

      setDocuments([...documents, ...newDocs]);
      showToast(`Dokumentasi supervisi untuk ${selectedTeacher.nama} berhasil diunggah (${newDocs.length} dokumen).`, 'success');
    }

    setShowModal(false);
    setSelectedTeacher(null);
    setActiveLinks([]);
  };

  // Helper to count completed documents for a teacher
  const getTeacherDocsCount = (teacherId: string) => {
    return supervisiDocs.filter((d: DocumentInfo) => d.teacherId === teacherId).length;
  };

  // Helper to check if category is uploaded, returning status to color-code
  const getCategoryStatusObject = (teacherId: string, category: string) => {
    const doc = supervisiDocs.find(d => 
      d.teacherId === teacherId && 
      (d.fileName.toLowerCase().includes(category.toLowerCase()) || d.fileName.toLowerCase().includes(category.replace(' ', '').toLowerCase()))
    );

    if (!doc) return { status: 'MISSING', label: 'Belum Diunggah', doc: null };
    return { status: doc.status, label: doc.status === 'APPROVED' ? 'Telah Disetujui' : doc.status === 'REVISION' ? 'Butuh Revisi' : 'Menunggu Validasi', doc };
  };

  // Format date correctly in human readable mode
  const formatDateString = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    } catch (e) {
      return dateStr;
    }
  };

  // Total completed supervison checks
  const totalCompletedSupervision = schoolTeachers.filter(t => getTeacherDocsCount(t.id) === 6).length;

  return (
    <div id="ks-supervision-page" className="space-y-8 max-w-7xl mx-auto">
      {/* HEADER BANNER */}
      <div className="bg-gradient-to-br from-indigo-600 via-blue-700 to-indigo-950 p-10 md:p-12 rounded-[3rem] text-white shadow-xl relative overflow-hidden">
         <div className="absolute top-0 right-0 p-12 opacity-10 rotate-12 scale-150 pointer-events-none">
            <FileSearch size={140} />
         </div>
         <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center space-x-2 bg-white/10 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest mb-4 backdrop-blur-md">
               <Layers size={14} className="text-amber-300" />
               <span>Supervisi Akademik Guru</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-black mb-4 tracking-tighter leading-tight">Instrumen Penilaian & Pemantauan Guru</h2>
            <p className="text-blue-100 text-sm md:text-base leading-relaxed font-semibold opacity-90">
               Kelola portofolio supervisi ajar, dokumen pelaksanaan, jadwal, dan pendampingan pasca-supervisi untuk para tenaga pendidik di lingkungan instansi Anda secara real-time.
            </p>
         </div>
      </div>

      {/* QUICK ANALYTICS HEADER */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center space-x-4">
          <div className="p-4 bg-indigo-50 text-indigo-600 rounded-2xl">
            <GraduationCap size={24} />
          </div>
          <div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Total Guru Terdaftar</span>
            <span className="text-2xl font-black text-slate-800">{schoolTeachers.length} Orang</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center space-x-4">
          <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Selesai 100% Supervisi</span>
            <span className="text-2xl font-black text-slate-800">{totalCompletedSupervision} / {schoolTeachers.length} Guru</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center space-x-4">
          <div className="p-4 bg-amber-50 text-amber-600 rounded-2xl">
            <Upload size={24} />
          </div>
          <div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Total Dokumen Terunggah</span>
            <span className="text-2xl font-black text-slate-800">{supervisiDocs.length} Berkas</span>
          </div>
        </div>
      </div>

      {/* SEARCH AND INTERACTIVE SPLIT PANEL */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* MASTER: TEACHERS LIST (LEFT 4-COLUMNS) */}
        <div className="lg:col-span-5 xl:col-span-4 bg-white rounded-[2.5rem] border border-slate-100 p-6 shadow-sm space-y-6">
          <div className="space-y-3">
             <h3 className="font-black text-lg text-slate-800 tracking-tight">Direktori Tenaga Pendidik</h3>
             <p className="text-xs text-slate-400 leading-relaxed font-semibold">Cari dan pilih guru untuk membuka lembar instrumen supervisi detail.</p>
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              id="teacher-search-input"
              type="text"
              placeholder="Cari nama guru..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 hover:border-slate-200 focus:border-indigo-500 rounded-2xl text-xs font-bold outline-none focus:ring-4 focus:ring-indigo-100/50 transition-all shadow-inner"
            />
          </div>

          {/* Teachers List Area */}
          <div className="space-y-2.5 max-h-[600px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-200">
            {filteredTeachers.map((t: UserProfile) => {
              const count = getTeacherDocsCount(t.id);
              const isActive = currentActiveTeacher && currentActiveTeacher.id === t.id;
              const isCompleted = count === 6;

              return (
                <button
                  id={`btn-teacher-tab-${t.id}`}
                  key={t.id}
                  onClick={() => setActiveTeacherId(t.id)}
                  className={`w-full p-4 rounded-2xl text-left border transition-all duration-300 flex items-center justify-between group ${
                    isActive 
                      ? 'bg-indigo-650 text-white border-indigo-600 shadow-lg shadow-indigo-600/10' 
                      : 'bg-white hover:bg-slate-50 border-slate-100 hover:border-slate-200'
                  }`}
                >
                  <div className="flex items-center space-x-4 min-w-0">
                    <div className={`w-11 h-11 rounded-xl font-bold flex items-center justify-center shrink-0 ${
                      isActive 
                        ? 'bg-white/20 text-white' 
                        : 'bg-slate-50 text-slate-650 group-hover:bg-indigo-50 group-hover:text-indigo-600'
                    }`}>
                      {t.nama.charAt(0)}
                    </div>
                    <div className="min-w-0">
                       <span className={`block font-black text-xs truncate ${isActive ? 'text-white' : 'text-slate-800'}`}>
                         {t.nama}
                       </span>
                       <span className={`block text-[9px] font-bold mt-0.5 tracking-wider ${isActive ? 'text-indigo-200' : 'text-slate-400'}`}>
                         NIP. {t.nip || '-'}
                       </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0">
                    {/* Completion Tracker Badge */}
                    <span className={`text-[9px] px-2.5 py-1 rounded-full font-black ${
                      isCompleted 
                        ? (isActive ? 'bg-emerald-600 text-white' : 'bg-emerald-50 text-emerald-600') 
                        : (count > 0 
                            ? (isActive ? 'bg-amber-500 text-white' : 'bg-amber-50 text-amber-600')
                            : (isActive ? 'bg-white/10 text-white' : 'bg-slate-100 text-slate-450')
                          )
                    }`}>
                      {count}/6
                    </span>
                    <ChevronRight size={14} className={`transition-transform duration-300 ${
                      isActive ? 'text-white translate-x-0.5' : 'text-slate-300 group-hover:text-slate-400'
                    }`} />
                  </div>
                </button>
              );
            })}

            {filteredTeachers.length === 0 && (
              <div className="py-12 text-center bg-slate-50 border border-dashed border-slate-200 rounded-3xl p-6">
                <AlertCircle className="text-slate-300 mx-auto mb-3" size={32} />
                <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest leading-normal">Guru Tidak Ditemukan</p>
                <p className="text-[10px] text-slate-450 mt-1">Coba gunakan kata kunci pencarian yang lain.</p>
              </div>
            )}
          </div>
        </div>

        {/* DETAIL: SECTORS STATUS AND SUBMITTED FILES (RIGHT 8-COLUMNS) */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-6">
          {currentActiveTeacher ? (
            <div id={`teacher-detail-panel-${currentActiveTeacher.id}`} className="space-y-6">
              
              {/* Active Teacher Banner Card */}
              <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
                <div className="flex items-center space-x-6">
                  <div className="w-16 h-16 bg-gradient-to-tr from-indigo-500 to-indigo-700 text-white font-black text-xl rounded-2xl flex items-center justify-center shadow-md">
                    {currentActiveTeacher.nama.charAt(0)}
                  </div>
                  <div>
                    <span className="text-[9px] font-black bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full uppercase tracking-wider">Lembar Supervisi Guru</span>
                    <h4 className="font-black text-xl text-slate-800 tracking-tight mt-1">{currentActiveTeacher.nama}</h4>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">NIP: {currentActiveTeacher.nip}</p>
                  </div>
                </div>

                <div className="shrink-0">
                  <button 
                    id="btn-upload-supervision-drive"
                    onClick={() => openUploadModal(currentActiveTeacher)}
                    className="w-full sm:w-auto px-6 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-indigo-600/10 active:scale-95 flex items-center justify-center space-x-2"
                  >
                     <Upload size={14} />
                     <span>Unggah / Perbarui Berkas</span>
                  </button>
                </div>
              </div>

              {/* SECTION: 6 DEFAULT INSTRUMENT MILESTONES (THE CHECKLIST GRID) */}
              <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-5">
                <div>
                   <h4 className="font-black text-sm text-slate-800 uppercase tracking-wider">Instrumen Supervisi 6 Dokumen Utama</h4>
                   <p className="text-[11px] text-slate-400 font-semibold mt-1">Status dan pemetaan dokumen instrumen supervisi sekolah untuk penilaian guru.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {defaultDocNames.map((cat, idx) => {
                    const info = getCategoryStatusObject(currentActiveTeacher.id, cat);
                    return (
                      <div 
                        key={idx} 
                        className={`p-4 rounded-2xl border flex flex-col justify-between h-32 transition-all duration-300 ${
                          info.status === 'APPROVED' 
                            ? 'bg-emerald-50/15 border-emerald-100 hover:bg-emerald-50/20' 
                            : info.status === 'REVISION' 
                            ? 'bg-rose-50/15 border-rose-100 hover:bg-rose-50/20' 
                            : info.status === 'PENDING'
                            ? 'bg-amber-50/15 border-amber-100 hover:bg-amber-50/20'
                            : 'bg-slate-50/40 border-slate-100 border-dashed hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                           <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Dokumen {idx + 1}</span>
                           <span className={`w-2.5 h-2.5 rounded-full ${
                             info.status === 'APPROVED' ? 'bg-emerald-500 animate-ping shadow-lg' :
                             info.status === 'REVISION' ? 'bg-rose-500' :
                             info.status === 'PENDING' ? 'bg-amber-500 animate-pulse' :
                             'bg-slate-200'
                           }`} />
                        </div>

                        <div>
                           <h5 className="font-black text-xs text-slate-700 tracking-tight mb-2 truncate" title={cat}>
                             {cat}
                           </h5>
                           <div className="flex items-center justify-between">
                             <span className={`text-[9px] font-black uppercase tracking-wider ${
                               info.status === 'APPROVED' ? 'text-emerald-600' :
                               info.status === 'REVISION' ? 'text-rose-600' :
                               info.status === 'PENDING' ? 'text-amber-600' :
                               'text-slate-400 font-semibold'
                             }`}>
                               {info.label}
                             </span>

                             {info.doc && (
                               <button 
                                 type="button"
                                 onClick={() => setPreviewDoc(info.doc)}
                                 className="text-[9px] font-semibold text-indigo-650 hover:underline flex items-center space-x-1"
                               >
                                 <span>Lihat</span>
                                 <ChevronRight size={10} />
                               </button>
                             )}
                           </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* DOCUMENTATION LOG LIST */}
              <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-5">
                <div>
                  <h4 className="font-black text-sm text-slate-800 uppercase tracking-wider">File Dokumen yang Diajukan (Real-Time)</h4>
                  <p className="text-[11px] text-slate-400 font-semibold mt-1">Daftar semua tautan pembuktian kerja yang relevan pada sistem cloud instansi Anda.</p>
                </div>

                {supervisiDocs.filter(d => d.teacherId === currentActiveTeacher.id).length > 0 ? (
                  <div className="space-y-3.5">
                    {supervisiDocs.filter(d => d.teacherId === currentActiveTeacher.id).map(doc => {
                      const teacherUser = users.find(u => u.id === doc.teacherId || u.id === doc.userId) || currentActiveTeacher;
                      const isPending = doc.status === 'PENDING';
                      const isRevision = doc.status === 'REVISION';
                      const isApproved = doc.status === 'APPROVED';

                      return (
                        <div 
                          key={doc.id} 
                          id={`supervisi-doc-${doc.id}`}
                          className={`p-5 rounded-3xl border flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all duration-300 hover:shadow-md ${
                            isApproved ? 'bg-emerald-50/10 border-emerald-100/50 hover:bg-emerald-50/20' : 
                            isRevision ? 'bg-rose-50/10 border-rose-100/50 hover:bg-rose-50/20' : 
                            'bg-amber-50/10 border-amber-100/50 hover:bg-amber-50/20'
                          }`}
                        >
                          {/* Left text section */}
                          <div className="flex items-center space-x-4 min-w-0">
                            <div className={`p-3 rounded-2xl shrink-0 ${
                              isApproved ? 'bg-emerald-50 text-emerald-600' :
                              isRevision ? 'bg-rose-50 text-rose-600' :
                              'bg-amber-50 text-amber-600'
                            }`}>
                              <FileText size={20} />
                            </div>
                            <div className="min-w-0">
                               <h5 className="font-black text-xs text-slate-800 truncate leading-snug hover:text-indigo-650 cursor-pointer" onClick={() => setPreviewDoc(doc)}>
                                 {doc.fileName.split(' - ')[1] || doc.fileName}
                               </h5>
                               <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-1 text-[9px] font-semibold text-slate-400">
                                 <span>Unggah: {formatDateString(doc.uploadDate)}</span>
                                 <span>•</span>
                                 <span className={`font-black uppercase tracking-wider ${
                                   isApproved ? 'text-emerald-650' : 
                                   isRevision ? 'text-rose-650' : 
                                   'text-amber-655'
                                 }`}>{doc.status === 'PENDING' ? 'Menunggu Validasi' : doc.status}</span>
                               </div>
                            </div>
                          </div>

                          {/* Action Toolbar on the right - generously spaced and padded */}
                          <div className="flex items-center space-x-2 shrink-0 md:self-center ml-14 md:ml-0">
                            <button 
                               id={`btn-preview-doc-${doc.id}`}
                               type="button"
                               onClick={() => setPreviewDoc(doc)}
                               className="p-2.5 bg-white rounded-xl border border-slate-100 text-indigo-650 shadow-sm hover:bg-indigo-50 hover:border-indigo-150 transition-all active:scale-[0.92] flex items-center justify-center"
                               title="Pratinjau / Validasi Dokumen"
                            >
                               <Search size={14} />
                            </button>
                            <button 
                               id={`btn-open-doc-link-${doc.id}`}
                               type="button"
                               onClick={() => window.open(doc.link, '_blank')}
                               className="p-2.5 bg-white rounded-xl border border-slate-100 text-emerald-650 shadow-sm hover:bg-emerald-50 hover:border-emerald-150 transition-all active:scale-[0.92] flex items-center justify-center"
                               title="Buka Link Google Drive"
                            >
                               <ExternalLink size={14} />
                            </button>

                            {(doc.status === 'PENDING' || doc.status === 'REVISION') && (
                               <>
                                  <button 
                                     id={`btn-edit-doc-${doc.id}`}
                                     type="button"
                                     onClick={() => handleEditDoc(doc, teacherUser)}
                                     className="p-2.5 bg-white rounded-xl border border-slate-100 text-amber-500 shadow-sm hover:bg-amber-50 hover:border-amber-150 transition-all active:scale-[0.92] flex items-center justify-center"
                                     title="Ubah Link Dokumen"
                                  >
                                     <Pencil size={14} />
                                  </button>
                                  <button 
                                     id={`btn-delete-doc-${doc.id}`}
                                     type="button"
                                     onClick={() => setDeleteConfirmDocId(doc.id)} 
                                     className="p-2.5 bg-white rounded-xl border border-slate-100 text-rose-500 shadow-sm hover:bg-rose-50 hover:border-rose-150 transition-all active:scale-[0.92] flex items-center justify-center"
                                     title="Hapus Dokumen"
                                  >
                                     <Trash2 size={14} />
                                  </button>
                               </>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="py-12 text-center bg-slate-50 rounded-3xl border border-slate-100 p-6">
                    <FileSearch className="text-slate-300 mx-auto mb-3" size={32} />
                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest leading-normal">Belum Ada Dokumen Supervisi</p>
                    <p className="text-[10px] text-slate-450 mt-1">Silakan klik tombol 'Unggah / Perbarui Berkas' di atas untuk mengunggah tautan Drive.</p>
                  </div>
                )}
              </div>

            </div>
          ) : (
            <div className="bg-white rounded-[3rem] border border-slate-100 p-12 text-center shadow-sm h-full flex flex-col items-center justify-center min-h-[400px]">
              <div className="p-5 bg-indigo-55/10 text-indigo-600 rounded-full mb-4">
                 <FileSearch size={40} />
              </div>
              <h4 className="font-extrabold text-slate-800 text-base">Silakan Pilih Tenaga Pendidik</h4>
              <p className="text-xs text-slate-400 mt-2 max-w-sm leading-relaxed">
                Pilih atau cari salah satu guru di sebelah kiri untuk melihat, mengedit, dan melacak lembar dokumen supervisi detail ajar yang bersangkutan.
              </p>
            </div>
          )}
        </div>

      </div>

      {/* CONFIRM DELETE DIALOG */}
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
                Konfirmasi Hapus Supervisi
              </h3>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Apakah Anda yakin ingin menghapus dokumen supervisi <strong className="text-slate-800 font-bold">"{documents.find(d => d.id === deleteConfirmDocId)?.fileName.split(' - ')[1] || 'Dokumen'}"</strong>? Tindakan ini bersifat permanen.
              </p>
              
              <div className="flex items-center gap-3 w-full mt-8">
                <button
                  type="button"
                  onClick={() => setDeleteConfirmDocId(null)}
                  className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-black uppercase tracking-wider transition-all active:scale-95 text-[10px]"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleDeleteDoc(deleteConfirmDocId);
                    setDeleteConfirmDocId(null);
                  }}
                  className="flex-1 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-lg shadow-rose-200/50 transition-all active:scale-95 text-[10px]"
                >
                  Ya, Hapus
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* PREVIEW DOCUMENT DETAILS MODAL */}
        {previewDoc && (
          <DocumentValidationModal
            document={previewDoc}
            author={users.find(u => u.id === previewDoc.teacherId || u.id === previewDoc.userId) || user}
            onClose={() => setPreviewDoc(null)}
            userRoleLabel="KEPALA SEKOLAH"
            readOnly={true}
          />
        )}

        {/* INPUT MODAL WITH MULTI-LINK BATCH UPLOAD */}
        {showModal && selectedTeacher && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" 
              onClick={() => setShowModal(false)} 
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white rounded-[3rem] w-full max-w-2xl shadow-2xl relative overflow-hidden border border-slate-100 flex flex-col h-[85vh]"
            >
              <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                 <div>
                    <h3 className="text-xl font-black text-slate-800 tracking-tight">
                      Input Supervisi: {selectedTeacher.nama}
                    </h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Multi-Link Submission</p>
                 </div>
                 <button onClick={() => setShowModal(false)} className="p-2 text-slate-300 hover:text-rose-500 transition-colors">
                    <X size={24} />
                 </button>
              </div>

              <form onSubmit={handleBatchUpload} className="flex-1 overflow-y-auto p-8 space-y-6">
                 <div className="bg-indigo-50 border border-indigo-100 rounded-[2rem] p-6 space-y-4">
                    <div className="flex items-center space-x-3">
                       <ShieldCheck className="text-blue-600" size={20} />
                       <span className="text-xs font-black text-blue-900 uppercase tracking-tight">Instruksi Supervisi</span>
                    </div>
                    <div className="space-y-3">
                       {[
                         "Masukkan tautan Google Drive untuk setiap kategori dokumen di bawah ini.",
                         "Anda dapat menambah atau menghapus kategori sesuai kebutuhan.",
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

                 <div className="space-y-4">
                    {activeLinks.map((link, index) => (
                      <div key={index} className="p-6 bg-slate-50/50 rounded-[2rem] border border-slate-100 space-y-4 relative group">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <div className="space-y-1">
                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Nama Dokumen</label>
                                <input 
                                  id={`input-link-label-${index}`}
                                  type="text"
                                  value={link.label}
                                  onChange={(e) => updateLink(index, 'label', e.target.value)}
                                  placeholder="Contoh: RPP"
                                  className="w-full px-5 py-4 bg-white border border-slate-100 rounded-xl text-xs font-bold outline-none focus:ring-4 focus:ring-blue-100 transition-all font-sans"
                                  required
                                />
                             </div>
                             <div className="space-y-1">
                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Link Google Drive</label>
                                <div className="relative">
                                   <ExternalLink className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={14} />
                                   <input 
                                     id={`input-link-url-${index}`}
                                     type="url"
                                     value={link.url}
                                     onChange={(e) => updateLink(index, 'url', e.target.value)}
                                     placeholder="https://drive.google.com/..."
                                     className="w-full pl-10 pr-4 py-4 bg-white border border-slate-100 rounded-xl text-xs font-bold outline-none focus:ring-4 focus:ring-blue-100 transition-all font-sans"
                                   />
                                </div>
                             </div>
                          </div>
                          {activeLinks.length > 1 && (
                             <button 
                               type="button"
                               onClick={() => removeLinkField(index)}
                               className="absolute -right-2 -top-2 p-2 bg-white text-rose-500 rounded-full border border-rose-100 shadow-sm opacity-0 group-hover:opacity-100 transition-all"
                             >
                                <Trash2 size={12} />
                             </button>
                          )}
                      </div>
                    ))}

                    <button 
                      id="btn-add-more-supervision-document"
                      type="button"
                      onClick={addLinkField}
                      className="w-full py-4 border-2 border-dashed border-slate-200 rounded-[2rem] text-slate-400 hover:border-blue-400 hover:text-blue-500 transition-all flex items-center justify-center space-x-2 group"
                    >
                       <Plus size={20} className="group-hover:scale-125 transition-transform" />
                       <span className="text-[10px] font-black uppercase tracking-widest">Tambah Dokumen Lainnya</span>
                    </button>
                 </div>

                 <div className="pt-4">
                    <button 
                      id="btn-save-batch-supervision-links"
                      type="submit"
                      className="w-full py-6 bg-slate-900 text-white rounded-3xl font-black uppercase tracking-widest text-xs hover:bg-blue-600 transition-all shadow-2xl shadow-slate-900/10 active:scale-[0.98]"
                    >
                       Simpan Semua Dokumen Supervisi
                    </button>
                 </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
