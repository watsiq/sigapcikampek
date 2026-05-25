
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Building2, 
  Search, 
  LayoutGrid, 
  XCircle, 
  AlertCircle,
  Download 
} from 'lucide-react';
import { DocumentInfo, UserProfile } from '../../types';
import { Skeleton } from '../ui/Skeleton';

interface DocumentValidationModalProps {
  document: DocumentInfo;
  author?: UserProfile;
  onClose: () => void;
  onReview?: (id: string, status: 'APPROVED' | 'REVISION', score: number, feedback: string) => void;
  userRoleLabel: string; // e.g., "GURU" or "KS"
  readOnly?: boolean;
}

export function DocumentValidationModal({ 
  document: selectedDoc, 
  author,
  onClose, 
  onReview,
  userRoleLabel,
  readOnly = false
}: DocumentValidationModalProps) {
  const [score, setScore] = useState(selectedDoc.score || 0);
  const [feedback, setFeedback] = useState(selectedDoc.feedback || '');
  const [isPreviewMaximized, setIsPreviewMaximized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const getDrivePreviewUrl = (url?: string) => {
    if (!url) return '';
    try {
      if (url.includes('drive.google.com/file/d/')) {
        return url.replace(/\/view.*$/, '/preview').replace(/\/edit.*$/, '/preview');
      }
      if (url.includes('docs.google.com/spreadsheets/d/') || url.includes('docs.google.com/document/d/')) {
        return url.replace(/\/edit.*$/, '/preview');
      }
      return url;
    } catch (e) {
      return url;
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xl z-[120] flex items-center justify-center p-0 sm:p-4 lg:p-8">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }} 
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className={`bg-white shadow-2xl overflow-hidden flex flex-row transition-all duration-500 ease-in-out ${
          isPreviewMaximized ? 'w-full h-full rounded-none sm:rounded-2xl' : 'w-full max-w-7xl h-full sm:h-[90vh] rounded-none sm:rounded-[2.5rem]'
        }`}
      >
        {/* Left Section: Document Preview */}
        <div className={`relative flex flex-col bg-slate-800 transition-all duration-500 ${
          isPreviewMaximized ? 'w-full' : 'flex-1 lg:flex-[2]'
        }`}>
           {/* Preview Toolbar */}
           <div className="absolute top-3 left-3 right-3 z-10 flex items-center justify-between pointer-events-none">
              <div className="flex items-center space-x-2 bg-slate-900/60 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 pointer-events-auto">
                 <div className="p-1 bg-indigo-500 text-white rounded-lg shadow-lg">
                    <Building2 size={12} />
                 </div>
                 <div className="flex flex-col min-w-0">
                    <span className="text-[8px] sm:text-[10px] font-black text-white uppercase tracking-widest truncate max-w-[80px] xs:max-w-[120px] sm:max-w-[250px]">{selectedDoc.fileName}</span>
                    <span className="text-[6px] sm:text-[7px] font-bold text-slate-400 uppercase tracking-[0.2em] truncate max-w-[80px] sm:max-w-none">{author?.sekolah || 'Unknown'}</span>
                 </div>
              </div>

              <div className="flex items-center space-x-1.5 pointer-events-auto">
                 {selectedDoc.link && (
                   <button 
                     onClick={() => window.open(selectedDoc.link, '_blank')}
                     className="p-2 bg-slate-900/60 hover:bg-emerald-600 text-white backdrop-blur-md rounded-xl border border-white/10 transition-all active:scale-90"
                     title="Unduh Berkas"
                   >
                      <Download size={16} />
                   </button>
                 )}
                 <button 
                   onClick={() => setIsPreviewMaximized(!isPreviewMaximized)}
                   className="p-2 bg-slate-900/60 hover:bg-emerald-600 text-white backdrop-blur-md rounded-xl border border-white/10 transition-all active:scale-90"
                   title={isPreviewMaximized ? "Perkecil Tampilan" : "Perbesar Tampilan"}
                 >
                    {isPreviewMaximized ? <LayoutGrid size={16} /> : <Search size={16} />}
                 </button>
                 {isPreviewMaximized && (
                    <button 
                      onClick={onClose}
                      className="p-2 bg-rose-500/20 hover:bg-rose-500 text-white backdrop-blur-md rounded-xl border border-rose-500/30 transition-all active:scale-90"
                    >
                       <XCircle size={16} />
                    </button>
                 )}
              </div>
           </div>
           
           <div 
             className="flex-1 w-full h-full relative bg-slate-900 cursor-pointer"
             onDoubleClick={() => setIsPreviewMaximized(!isPreviewMaximized)}
           >
              {isLoading && selectedDoc.link && (
                <div className="absolute inset-0 z-20 bg-slate-900 p-8 flex flex-col space-y-6">
                  <div className="flex items-center space-x-4">
                    <Skeleton className="w-12 h-12 bg-slate-800 rounded-xl" />
                    <div className="space-y-2">
                      <Skeleton className="w-48 h-4 bg-slate-800" />
                      <Skeleton className="w-32 h-3 bg-slate-800" />
                    </div>
                  </div>
                  <Skeleton className="flex-1 w-full bg-slate-800 rounded-2xl" />
                </div>
              )}
              {selectedDoc.link ? (
                <iframe 
                  src={getDrivePreviewUrl(selectedDoc.link)}
                  className={`w-full h-full border-none transition-opacity duration-700 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
                  title="Pratinjau Dokumen"
                  onLoad={() => setIsLoading(false)}
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-center p-8 text-slate-500">
                   <AlertCircle size={32} className="mb-3 opacity-20" />
                   <h5 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Pratinjau Tidak Tersedia</h5>
                </div>
              )}
           </div>
        </div>

        {/* Right Section: Validation & Info */}
        <div className={`bg-white flex flex-col h-full border-l border-slate-100 transition-all duration-500 ${
          isPreviewMaximized ? 'w-0 opacity-0 overflow-hidden shrink-0' : 'w-[150px] xs:w-[180px] sm:w-[320px] md:w-[350px] lg:w-[380px] opacity-100'
        }`}>
           {/* Header */}
           <div className="px-3 sm:px-6 py-4 sm:py-5 border-b border-slate-50 flex justify-between items-center bg-white sticky top-0 z-10">
              <div className="flex flex-col min-w-0">
                 <h4 className="text-[7px] sm:text-[9px] font-black text-slate-400 tracking-[0.2em] uppercase leading-none mb-1">Panel</h4>
                 <h2 className="text-[10px] sm:text-base font-black text-slate-900 tracking-tighter uppercase leading-none truncate">{readOnly ? 'Arsip Dokumen' : 'Validasi'}</h2>
              </div>
              <button 
                onClick={onClose}
                className="p-1 sm:p-1.5 text-slate-300 hover:text-rose-500 transition-all rounded-lg hover:bg-rose-50"
              >
                 <XCircle size={18} />
              </button>
           </div>

           <div className="flex-1 overflow-y-auto px-3 sm:px-6 py-3 sm:py-5 space-y-4 sm:space-y-6 scrollbar-hide">
              {/* Compact Info Section */}
              <div className="flex items-center space-x-2 sm:space-x-3 p-2 sm:p-4 bg-slate-50/50 rounded-xl sm:rounded-2xl border border-slate-100">
                 <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black text-[10px] sm:text-base shadow-lg shadow-indigo-100 shrink-0">
                    {author?.nama?.charAt(0) || '?'}
                 </div>
                 <div className="min-w-0 flex-1">
                    <div className="font-black text-slate-800 text-[10px] sm:text-xs truncate leading-tight uppercase tracking-tight">{author?.nama || 'Anonymous'}</div>
                    <div className="flex items-center space-x-1 sm:space-x-2 mt-0.5 sm:mt-1">
                       <span className="text-[6px] sm:text-[7px] font-black text-indigo-500 uppercase tracking-widest bg-indigo-50 px-1 py-0.5 rounded">{userRoleLabel}</span>
                       <span className="text-[7px] sm:text-[8px] text-slate-400 font-bold uppercase tracking-widest truncate">{selectedDoc.type}</span>
                    </div>
                 </div>
              </div>

              {/* Scoring */}
              <div className="p-3 sm:p-5 bg-white border border-slate-100 rounded-2xl sm:rounded-3xl space-y-3 sm:space-y-4 shadow-sm">
                 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <h5 className="text-[8px] sm:text-[9px] font-black text-slate-900 uppercase tracking-widest">Skor</h5>
                    <div className="flex items-center space-x-1 bg-slate-50 p-1 rounded-lg border border-slate-200/50 w-full sm:w-auto">
                       <input 
                          type="number"
                          min="0"
                          max="100"
                          value={score}
                          readOnly={readOnly}
                          onChange={(e) => {
                             if (readOnly) return;
                             const val = parseInt(e.target.value);
                             if (!isNaN(val) && val >= 0 && val <= 100) setScore(val);
                             else if (e.target.value === '') setScore(0);
                          }}
                          className="w-full sm:w-10 bg-transparent text-right font-mono font-black text-indigo-600 outline-none text-xs sm:text-lg p-0"
                       />
                       <span className="text-[8px] sm:text-[10px] font-black text-slate-300 pr-0.5">/100</span>
                    </div>
                 </div>

                 <div className="px-1 py-2 sm:py-4 flex items-center space-x-2 sm:space-x-3">
                    <span className="text-[7px] sm:text-[8px] font-black text-slate-300 uppercase">0</span>
                    <div className="flex-1">
                       <input 
                          type="range" min="0" max="100" step="1"
                          value={score}
                          disabled={readOnly}
                          onChange={(e) => !readOnly && setScore(parseInt(e.target.value))}
                          className={`w-full h-1 sm:h-1.5 bg-slate-100 rounded-full appearance-none cursor-pointer accent-indigo-600 transition-all ${readOnly ? 'opacity-50 cursor-default' : ''}`}
                       />
                    </div>
                    <span className="text-[7px] sm:text-[8px] font-black text-slate-300 uppercase">100</span>
                 </div>
                 
                 <div className="flex justify-between px-1">
                    <div className="text-[7px] sm:text-[8px] font-black text-slate-400 flex items-center space-x-1">
                       <div className={`w-1 h-1 rounded-full ${score < 70 ? 'bg-rose-500' : score < 85 ? 'bg-amber-500' : 'bg-emerald-500'}`}></div>
                       <span className={score < 70 ? 'text-rose-500' : score < 85 ? 'text-amber-600' : 'text-emerald-600'}>
                          {score < 70 ? 'Kurang' : score < 85 ? 'Cukup' : 'Baik'}
                       </span>
                    </div>
                 </div>
              </div>

              {/* Feedback */}
              <div className="space-y-1.5 sm:space-y-2">
                 <h5 className="text-[8px] sm:text-[9px] font-black text-slate-900 uppercase tracking-widest px-1">Catatan</h5>
                 <textarea 
                    placeholder={readOnly ? 'Tidak ada catatan.' : 'Arahan...'}
                    value={feedback}
                    readOnly={readOnly}
                    onChange={(e) => !readOnly && setFeedback(e.target.value)}
                    className={`w-full h-20 sm:h-32 p-3 sm:p-5 bg-slate-50/50 border border-slate-100 rounded-xl sm:rounded-[2rem] text-[9px] sm:text-[11px] font-medium outline-none focus:ring-2 sm:focus:ring-4 focus:ring-indigo-100/30 focus:bg-white transition-all resize-none leading-relaxed placeholder:text-slate-300 shadow-inner ${readOnly ? 'cursor-default' : ''}`}
                 />
              </div>
           </div>

           {/* Actions */}
            {!readOnly && (
               <div className="p-4 sm:p-8 border-t border-slate-50 bg-white flex flex-col sm:grid sm:grid-cols-2 gap-3 sm:gap-4 sticky bottom-0">
                  <button 
                    onClick={() => onReview?.(selectedDoc.id, 'REVISION', 0, feedback)}
                    className="py-4 sm:py-5 bg-white border border-slate-200 text-rose-500 rounded-2xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest hover:bg-rose-50 hover:border-rose-200 transition-all active:scale-95 shadow-sm"
                  >
                     Ajukan Revisi
                  </button>
                  <button 
                    onClick={() => onReview?.(selectedDoc.id, 'APPROVED', score, feedback)}
                    className="py-4 sm:py-5 bg-slate-900 text-white rounded-2xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all active:scale-95 shadow-xl shadow-slate-900/10"
                  >
                     Sahkan Dokumen
                  </button>
               </div>
            )}
        </div>
      </motion.div>
    </div>
  );
}
