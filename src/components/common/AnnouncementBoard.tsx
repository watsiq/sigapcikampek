import React, { useState } from 'react';
import { 
  Megaphone, 
  ImageIcon, 
  FileText, 
  MessageCircle, 
  Star, 
  FileDown, 
  ArrowRight,
  MoreHorizontal,
  Video,
  ExternalLink,
  Info,
  Award,
  BookOpen,
  Send,
  X,
  Sparkles,
  ShieldCheck,
  Check,
  Plus,
  Maximize2
} from 'lucide-react';
import { MaterialPost, Announcement, MaterialComment, UserProfile } from '../../types';
import { useNotifications } from '../../context/NotificationContext';

interface AnnouncementBoardProps {
  user: UserProfile;
  announcements: Announcement[];
  setAnnouncements?: (announcements: Announcement[]) => void;
  materialPosts: MaterialPost[];
  setMaterialPosts: (posts: MaterialPost[]) => void;
  users: UserProfile[];
  documents?: any[];
}

export function AnnouncementBoard({ 
  user, 
  announcements, 
  setAnnouncements, 
  materialPosts, 
  setMaterialPosts, 
  users 
}: AnnouncementBoardProps) {
  const { showToast, addNotification } = useNotifications();
  const [commentText, setCommentText] = useState<{ [postId: string]: string }>({});
  const [toggledComments, setToggledComments] = useState<{ [postId: string]: boolean }>({});

  const toggleComments = (postId: string) => {
    setToggledComments(prev => {
      const nextState = !prev[postId];
      if (nextState) {
        setTimeout(() => {
          const input = document.getElementById(`comment-input-${postId}`);
          if (input) {
            input.scrollIntoView({ behavior: 'smooth', block: 'center' });
            input.focus();
          }
        }, 100);
      }
      return { ...prev, [postId]: nextState };
    });
  };
  
  // Custom 3-Tab Model State: 'ANNOUNCEMENTS', 'SUPERVISOR_GUIDELINES', 'BEST_PRACTICES'
  const [activeTab, setActiveTab] = useState<'ANNOUNCEMENTS' | 'SUPERVISOR_GUIDELINES' | 'BEST_PRACTICES'>('ANNOUNCEMENTS');

  // State inside Component
  const [previewDoc, setPreviewDoc] = useState<{ name: string; url: string } | null>(null);

  // Tracked/seen post IDs to implement unread/unscrolled counts
  const [seenAnnouncementIds, setSeenAnnouncementIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(`seen_announcements_${user.id}`);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [seenSupervisorPostIds, setSeenSupervisorPostIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(`seen_supervisor_posts_${user.id}`);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

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

  const getDriveDownloadUrl = (url?: string) => {
    if (!url) return '';
    try {
      if (url.includes('drive.google.com/file/d/')) {
        const parts = url.split('/file/d/');
        if (parts.length > 1) {
          const id = parts[1].split('/')[0];
          return `https://drive.google.com/uc?export=download&id=${id}`;
        }
      }
      return url;
    } catch (e) {
      return url;
    }
  };

  const getYoutubeId = (url?: string) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[12] || match[2] : null;
  };

  // Modals visibility state
  const [showAnnounceModal, setShowAnnounceModal] = useState(false);
  const [showPostModal, setShowPostModal] = useState(false);
  const [currentTargetTab, setCurrentTargetTab] = useState<'SUPERVISOR' | 'PEER'>('PEER');

  // New Announcement Form State
  const [announceTitle, setAnnounceTitle] = useState('');
  const [announceContent, setAnnounceContent] = useState('');
  const [announceAttachName, setAnnounceAttachName] = useState('');
  const [announceAttachUrl, setAnnounceAttachUrl] = useState('');

  // New Post Form State
  const [postText, setPostText] = useState('');
  const [mediaType, setMediaType] = useState<'article' | 'image' | 'video'>('article');
  const [mediaUrl, setMediaUrl] = useState('');
  const [attachName, setAttachName] = useState('');
  const [attachUrl, setAttachUrl] = useState('');

  const userMap = React.useMemo(() => {
    const map: { [id: string]: UserProfile } = {};
    users.forEach(u => { map[u.id] = u; });
    return map;
  }, [users]);

  const sortedAnnouncements = React.useMemo(() => {
    return [...announcements].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [announcements]);

  // Separate posts based on role criteria and sort them by latest first
  const supervisorPosts = React.useMemo(() => {
    return [...materialPosts]
      .filter(post => {
        const author = userMap[post.authorId];
        return author?.role === 'PENGAWAS';
      })
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [materialPosts, userMap]);

  const peerInspirationPosts = React.useMemo(() => {
    return [...materialPosts]
      .filter(post => {
        const author = userMap[post.authorId];
        return author?.role === 'GURU' || author?.role === 'KEPALA_SEKOLAH';
      })
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [materialPosts, userMap]);

  const announceIdStr = announcements.map(a => a.id).join(',');
  const supervisorPostIdStr = supervisorPosts.map(p => p.id).join(',');

  React.useEffect(() => {
    if (activeTab === 'ANNOUNCEMENTS') {
      const allIds = announcements.map(a => a.id);
      if (allIds.length > 0) {
        setSeenAnnouncementIds(prev => {
          const hasUnseen = allIds.some(id => !prev.includes(id));
          if (hasUnseen) {
            const next = Array.from(new Set([...prev, ...allIds]));
            localStorage.setItem(`seen_announcements_${user.id}`, JSON.stringify(next));
            return next;
          }
          return prev;
        });
      }
    } else if (activeTab === 'SUPERVISOR_GUIDELINES') {
      const allIds = supervisorPosts.map(p => p.id);
      if (allIds.length > 0) {
        setSeenSupervisorPostIds(prev => {
          const hasUnseen = allIds.some(id => !prev.includes(id));
          if (hasUnseen) {
            const next = Array.from(new Set([...prev, ...allIds]));
            localStorage.setItem(`seen_supervisor_posts_${user.id}`, JSON.stringify(next));
            return next;
          }
          return prev;
        });
      }
    }
  }, [activeTab, announceIdStr, supervisorPostIdStr, user.id]);

  const unseenAnnouncementsCount = React.useMemo(() => {
    return announcements.filter(a => !seenAnnouncementIds.includes(a.id)).length;
  }, [announcements, seenAnnouncementIds]);

  const unseenSupervisorPostsCount = React.useMemo(() => {
    return supervisorPosts.filter(p => !seenSupervisorPostIds.includes(p.id)).length;
  }, [supervisorPosts, seenSupervisorPostIds]);

  const handleLike = (postId: string) => {
    setMaterialPosts(materialPosts.map((p: MaterialPost) => {
      if (p.id === postId) {
        const hasLiked = p.likes.includes(user.id);
        const newLikes = hasLiked 
          ? p.likes.filter(id => id !== user.id) 
          : [...p.likes, user.id];
        return { ...p, likes: newLikes };
      }
      return p;
    }));
    showToast('Apresiasi berhasil diperbarui', 'success');
  };

  const handleAddComment = (postId: string, e: React.FormEvent) => {
    e.preventDefault();
    const text = commentText[postId];
    if (!text?.trim()) return;

    const newComment: MaterialComment = {
      id: Date.now().toString(),
      userId: user.id,
      content: text,
      timestamp: new Date().toISOString()
    };

    setMaterialPosts(materialPosts.map((p: MaterialPost) => {
      if (p.id === postId) {
        return { ...p, comments: [...p.comments, newComment] };
      }
      return p;
    }));

    // Notify author
    const targetPost = materialPosts.find(p => p.id === postId);
    if (targetPost && targetPost.authorId !== user.id) {
      addNotification(
        targetPost.authorId, 
        'Tanggapan Diskusi Baru', 
        `${user.nama} memberikan komentar pada kiriman Anda.`, 
        'INFO'
      );
    }

    setCommentText({ ...commentText, [postId]: '' });
    showToast('Komentar berhasil dipublikasikan', 'success');
  };

  // Publisher functions
  const handleCreateAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!announceTitle.trim() || !announceContent.trim()) {
      showToast('Harap lengkapi isi Pengumuman Resmi!', 'error');
      return;
    }

    if (!setAnnouncements) {
      showToast('Akses penyimpanan bermasalah', 'error');
      return;
    }

    const newA: Announcement = {
      id: Date.now().toString(),
      title: announceTitle,
      content: announceContent,
      authorId: user.id,
      timestamp: new Date().toISOString(),
      attachmentUrl: announceAttachUrl.trim() || undefined,
      attachmentName: announceAttachName.trim() || undefined,
      attachmentType: announceAttachName.trim().toLowerCase().endsWith('.pdf') ? 'pdf' : (announceAttachName.trim() ? 'image' : undefined)
    };

    setAnnouncements([newA, ...announcements]);

    // Broadcast to teachers and principals only
    users.forEach(u => {
      if (u.id !== user.id && (u.role === 'GURU' || u.role === 'KEPALA_SEKOLAH')) {
        addNotification(u.id, 'Pengumuman Resmi Baru', `Pengawas menyiarkan pengumuman resmi: "${announceTitle}"`, 'WARNING');
      }
    });

    showToast('Pengumuman resmi berhasil disiarkan ke seluruh Gugus!', 'success');
    
    // Reset Form
    setAnnounceTitle('');
    setAnnounceContent('');
    setAnnounceAttachName('');
    setAnnounceAttachUrl('');
    setShowAnnounceModal(false);
  };

  const handleCreateMaterialPost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!postText.trim()) {
      showToast('Harap tuliskan penjelasan materi!', 'error');
      return;
    }

    const isSupervisor = user.role === 'PENGAWAS';

    const newPost: MaterialPost = {
      id: Date.now().toString(),
      content: postText,
      authorId: user.id,
      timestamp: new Date().toISOString(),
      mediaType: mediaType !== 'article' ? mediaType : undefined,
      mediaUrl: mediaType !== 'article' ? (mediaUrl.trim() || undefined) : undefined,
      attachmentName: mediaType === 'article' ? (attachName.trim() || undefined) : undefined,
      attachmentUrl: mediaType === 'article' ? (attachUrl.trim() || undefined) : undefined,
      likes: [],
      comments: []
    };

    setMaterialPosts([newPost, ...materialPosts]);

    // Send notifications to teachers and principals only, only if supervisor is posting
    if (isSupervisor) {
      users.forEach(u => {
        if (u.id !== user.id && (u.role === 'GURU' || u.role === 'KEPALA_SEKOLAH')) {
          addNotification(u.id, 'Materi Pembinaan Baru', `Pengawas: mempublikasikan materi rujukan pembelajaran.`, 'INFO');
        }
      });
    } else {
      // Broadcast notify all users in the forum of the new Inspirasi post
      users.forEach(u => {
        if (u.id !== user.id) {
          addNotification(
            u.id,
            'Inspirasi Pendidik Baru',
            `${user.nama} membagikan karya Inspirasi baru di Ruang Inspirasi Pendidik.`,
            'INFO'
          );
        }
      });
    }

    showToast(
      isSupervisor 
        ? 'Modul Pembinaan Utama berhasil dipublikasikan!' 
        : 'Inspirasi Anda berhasil dibagikan!', 
      'success'
    );

    // Reset Form
    setPostText('');
    setMediaUrl('');
    setAttachName('');
    setAttachUrl('');
    setMediaType('article');
    setShowPostModal(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10">
      
      {/* Universal Segmented Tab Navigation - Elegant and Fluid */}
      <div className="flex flex-col sm:flex-row bg-slate-100 p-2 rounded-[2rem] shadow-inner gap-1.5 border border-slate-200/50">
        <button 
          onClick={() => setActiveTab('ANNOUNCEMENTS')}
          className={`flex-1 flex items-center justify-center space-x-3 py-4 px-6 rounded-[1.5rem] font-black text-xs uppercase tracking-widest transition-all duration-300 ${activeTab === 'ANNOUNCEMENTS' ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/20' : 'text-slate-500 hover:bg-slate-200/65'}`}
        >
          <Info size={16} />
          <span>Ruang Informasi</span>
          {unseenAnnouncementsCount > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-rose-500 text-white animate-pulse">
              {unseenAnnouncementsCount}
            </span>
          )}
        </button>

        <button 
          onClick={() => setActiveTab('SUPERVISOR_GUIDELINES')}
          className={`flex-1 flex items-center justify-center space-x-3 py-4 px-6 rounded-[1.5rem] font-black text-xs uppercase tracking-widest transition-all duration-300 ${activeTab === 'SUPERVISOR_GUIDELINES' ? 'bg-amber-600 text-white shadow-xl shadow-amber-600/20' : 'text-slate-500 hover:bg-slate-200/65'}`}
        >
          <BookOpen size={16} />
          <span>Ruang Materi</span>
          {unseenSupervisorPostsCount > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-rose-500 text-white animate-pulse">
              {unseenSupervisorPostsCount}
            </span>
          )}
        </button>

        <button 
          onClick={() => setActiveTab('BEST_PRACTICES')}
          className={`flex-1 flex items-center justify-center space-x-3 py-4 px-6 rounded-[1.5rem] font-black text-xs uppercase tracking-widest transition-all duration-300 ${activeTab === 'BEST_PRACTICES' ? 'bg-teal-600 text-white shadow-xl shadow-teal-600/20' : 'text-slate-500 hover:bg-slate-200/65'}`}
        >
          <Sparkles size={16} />
          <span>Ruang Inspirasi Pendidik</span>
        </button>
      </div>

      {/* TAB CONTENTS */}
      <div className="space-y-8">
        
        {/* TAB 1: PENGUMUMAN RESMI (ONE-WAY OFFICIAL NOTICE) */}
        {activeTab === 'ANNOUNCEMENTS' && (
          <div className="space-y-6">
            
            {/* Action Header for Publisher (Only PENGAWAS) */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 bg-slate-50 border border-slate-200/60 rounded-[2.5rem] mb-2 shadow-sm">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
                  <ShieldCheck size={24} />
                </div>
                <div>
                  <h4 className="text-sm font-black text-slate-800 tracking-tight">Papan Pengumuman Resmi</h4>
                  <p className="text-xs text-slate-400 font-medium leading-relaxed">Informasi kedinasan, edaran wilayah, dan instruksi penting dari Pengawas Wilayah Gugus 1.</p>
                </div>
              </div>
              {user.role === 'PENGAWAS' && (
                <button 
                  onClick={() => setShowAnnounceModal(true)}
                  className="px-6 py-3.5 bg-gradient-to-r from-indigo-600 to-indigo-800 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-lg shadow-indigo-600/15 hover:scale-[1.02] active:scale-95 transition-all flex items-center space-x-2 shrink-0"
                >
                  <Plus size={14} />
                  <span>Buat Pengumuman</span>
                </button>
              )}
            </div>

            {/* Announcement Cards List */}
            {sortedAnnouncements.length === 0 ? (
              <div className="p-20 bg-white rounded-[3.5rem] border border-slate-100/80 text-center shadow-sm">
                <Megaphone className="mx-auto text-slate-300 mb-4 animate-bounce" size={48} />
                <p className="text-slate-400 italic text-sm font-semibold tracking-wide">Belum ada pengumuman kedinasan resmi dirilis oleh Pengawas.</p>
              </div>
            ) : (
              sortedAnnouncements.map((announce: Announcement) => {
                const author = userMap[announce.authorId];
                return (
                  <div 
                    key={announce.id} 
                    className="bg-white p-8 md:p-10 rounded-[3rem] border border-slate-200/70 shadow-sm relative overflow-hidden ring-1 ring-slate-100 hover:shadow-lg transition-all border-l-4 border-l-indigo-600"
                  >
                    
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-slate-50 pb-5">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black shadow-md shadow-indigo-600/20 text-sm">
                          {author?.nama?.charAt(0) || 'P'}
                        </div>
                        <div>
                          <div className="font-black text-slate-800 text-sm tracking-tight flex items-center space-x-2">
                            <span>{author?.nama || 'Pengawas Wilayah'}</span>
                            <span className="bg-indigo-100 border border-indigo-200 text-indigo-700 text-[8px] font-black uppercase px-2.5 py-0.5 rounded-full">
                              Informasi Pengawas
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1 block">Hanya untuk dibaca • Kedinasan</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1.5 text-[10px] text-slate-400 font-black uppercase tracking-wider bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-xl w-fit">
                        <Info size={12} className="text-indigo-500" />
                        <span>{new Date(announce.timestamp).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                      </div>
                    </div>

                    {/* Title & Content */}
                    <div className="space-y-4">
                      <h3 className="text-xl md:text-2xl font-black text-slate-800 leading-tight tracking-tight">{announce.title}</h3>
                      <p className="text-sm md:text-base text-slate-600 leading-relaxed font-normal whitespace-pre-wrap">{announce.content}</p>
                    </div>

                    {/* Attachment - Inline LinkedIn Style Viewer */}
                    {announce.attachmentUrl && (
                      <div className="mt-6 border border-slate-200 rounded-[2rem] overflow-hidden bg-slate-50 w-full shadow-lg shadow-slate-200/40">
                        {/* Tool Header */}
                        <div className="flex items-center justify-between px-5 py-3 bg-white border-b border-slate-100 font-sans">
                          <div className="flex items-center space-x-3 min-w-0">
                            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl shrink-0">
                              <FileText size={16} />
                            </div>
                            <div className="min-w-0">
                               <h5 className="font-extrabold text-slate-800 text-xs truncate max-w-[200px] sm:max-w-md">{announce.attachmentName || 'Lampiran Resmi'}</h5>
                               <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest leading-none mt-0.5">Peninjauan Berkas</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-1 shrink-0">
                            <button 
                              onClick={() => setPreviewDoc({ name: announce.attachmentName || 'Lampiran Resmi', url: announce.attachmentUrl })}
                              title="Buka Layar Penuh"
                              className="p-2.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
                            >
                              <Maximize2 size={16} />
                            </button>
                            
                            <a 
                              href={getDriveDownloadUrl(announce.attachmentUrl)}
                              target="_blank" 
                              rel="noreferrer" 
                              download
                              title="Unduh Berkas"
                              className="p-2.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-xl transition-all flex items-center justify-center"
                            >
                              <FileDown size={16} />
                            </a>
                          </div>
                        </div>

                        {/* Direct Inline Doc Iframe */}
                        <div className="relative bg-slate-100 aspect-[4/3] md:aspect-[16/10] w-full min-h-[350px] overflow-hidden">
                          <iframe
                            src={getDrivePreviewUrl(announce.attachmentUrl)}
                            className="absolute inset-0 w-full h-full border-b border-none"
                            title={announce.attachmentName || 'Pratinjau Berkas Dinas'}
                            allow="autoplay"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* TAB 2: MATERI PEMBINAAN (SUPERVISOR GUIDELINES WITH COMMENTS) */}
        {activeTab === 'SUPERVISOR_GUIDELINES' && (
          <div className="space-y-6">
            
            {/* Info Banner for Guru / KS or CTA for Supervisor */}
            <div className="p-6 bg-slate-50 border border-slate-200/60 rounded-[2.5rem] shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 mb-2">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
                  <BookOpen size={24} />
                </div>
                <div>
                  <h4 className="text-sm font-black text-slate-800 tracking-tight">Kanal Modul & Pembinaan Utama</h4>
                  <p className="text-xs text-slate-400 font-medium leading-relaxed">Kolom referensi ajar, video instruksi, dan standar kurikulum yang dirilis oleh Pengawas.</p>
                </div>
              </div>
              {user.role === 'PENGAWAS' && (
                <button 
                  onClick={() => { setCurrentTargetTab('SUPERVISOR'); setShowPostModal(true); }}
                  className="px-6 py-3.5 bg-gradient-to-r from-amber-500 to-amber-700 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-lg shadow-amber-500/15 hover:scale-[1.02] active:scale-95 transition-all flex items-center space-x-2 shrink-0"
                >
                  <Plus size={14} />
                  <span>Rilis Materi</span>
                </button>
              )}
            </div>

            {/* supervisorPosts count and mapping */}
            {supervisorPosts.length === 0 ? (
              <div className="p-20 bg-white rounded-[3.5rem] border border-slate-100/80 text-center shadow-sm">
                <BookOpen className="mx-auto text-slate-300 mb-4" size={48} />
                <p className="text-slate-400 italic text-sm font-semibold tracking-wide">Belum ada materi pembinaan rujukan yang dipublikasikan oleh Pengawas.</p>
              </div>
            ) : (
              supervisorPosts.map((post: MaterialPost) => {
                const author = userMap[post.authorId];
                return (
                  <div key={post.id} className="bg-white rounded-[2.5rem] border border-slate-150 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow relative border-l-4 border-l-amber-500">
                    {/* Header */}
                    <div className="p-6 flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center font-black shadow-lg shadow-slate-900/10 overflow-hidden">
                          {author?.avatar ? (
                            <img src={author.avatar} alt={author.nama} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                          ) : (
                            author?.nama.charAt(0) || '?'
                          )}
                        </div>
                        <div>
                          <div className="font-black text-slate-800 tracking-tight flex flex-wrap items-center gap-2">
                            <span>{author?.nama || 'Unknown'}</span>
                            <span className="px-2.5 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider flex items-center space-x-1 bg-amber-500 text-white border border-amber-600/20 shadow-sm">
                              <Star size={10} fill="currentColor" className="text-white" />
                              <span>Materi Pembinaan Utama</span>
                            </span>
                          </div>
                          <div className="flex flex-col">
                             <span className="text-[9px] text-slate-400 font-black uppercase tracking-widest leading-none mt-1">
                               Pengawas Sekolah • Gugus Cikampek
                             </span>
                             <span className="text-[9px] text-slate-400 font-bold mt-1">{new Date(post.timestamp).toLocaleString('id-ID')}</span>
                          </div>
                        </div>
                      </div>
                      <button className="p-2 text-slate-400 hover:bg-slate-50 rounded-full transition-colors">
                         <MoreHorizontal size={20} />
                      </button>
                    </div>

                    {/* Content */}
                    <div className="px-6 pb-4">
                      <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">{post.content}</p>
                    </div>

                    {/* Media Visuals */}
                    {(post.mediaUrl || post.attachmentUrl) && (
                      <div className="px-1 border-y border-slate-50 bg-slate-50/50">
                        {post.mediaType === 'image' && post.mediaUrl ? (
                          <div className="relative group overflow-hidden bg-slate-200 aspect-[16/9]">
                            <img src={post.mediaUrl} alt="Post media" referrerPolicy="no-referrer" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-103" />
                          </div>
                        ) : post.mediaType === 'video' && post.mediaUrl ? (
                          <div className="relative bg-slate-900 aspect-[16/9] w-full rounded-2xl overflow-hidden shadow-lg">
                            {getYoutubeId(post.mediaUrl) ? (
                              <iframe
                                src={`https://www.youtube.com/embed/${getYoutubeId(post.mediaUrl)}`}
                                title="YouTube Video Player"
                                className="w-full h-full border-none"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                allowFullScreen
                              />
                            ) : post.mediaUrl.includes('drive.google.com') ? (
                              <iframe
                                src={getDrivePreviewUrl(post.mediaUrl)}
                                title="Google Drive Video Player"
                                className="w-full h-full border-none"
                                allow="autoplay; encrypted-media"
                                allowFullScreen
                              />
                            ) : (
                              <video 
                                src={post.mediaUrl} 
                                controls 
                                className="w-full h-full object-contain"
                              />
                            )}
                          </div>
                        ) : post.attachmentUrl ? (
                          <div className="p-4 bg-slate-50">
                            <div className="border border-slate-200 rounded-[2rem] overflow-hidden bg-slate-100/50 w-full shadow-lg shadow-slate-200/30">
                              {/* Tool Header */}
                              <div className="flex items-center justify-between px-5 py-3 bg-white border-b border-slate-150 font-sans">
                                <div className="flex items-center space-x-3 min-w-0">
                                  <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl shrink-0">
                                    <FileText size={16} />
                                  </div>
                                  <div className="min-w-0">
                                     <h5 className="font-extrabold text-slate-800 text-xs truncate max-w-[200px] sm:max-w-md">{post.attachmentName || 'Dokumen Kurikulum'}</h5>
                                     <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest leading-none mt-0.5">Peninjauan Berkas</p>
                                  </div>
                                </div>
                                
                                <div className="flex items-center space-x-1 shrink-0">
                                  <button 
                                    onClick={() => setPreviewDoc({ name: post.attachmentName || 'Dokumen Kurikulum', url: post.attachmentUrl })}
                                    title="Buka Layar Penuh"
                                    className="p-2.5 text-slate-500 hover:text-emerald-600 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
                                  >
                                    <Maximize2 size={16} />
                                  </button>
                                  
                                  <a 
                                    href={getDriveDownloadUrl(post.attachmentUrl)}
                                    target="_blank" 
                                    rel="noreferrer" 
                                    download
                                    title="Unduh Berkas"
                                    className="p-2.5 text-slate-500 hover:text-emerald-600 hover:bg-slate-100 rounded-xl transition-all flex items-center justify-center"
                                  >
                                    <FileDown size={16} />
                                  </a>
                                </div>
                              </div>

                              {/* Direct Inline Doc Iframe */}
                              <div className="relative bg-slate-100 aspect-[4/3] md:aspect-[16/10] w-full min-h-[350px] overflow-hidden">
                                <iframe
                                  src={getDrivePreviewUrl(post.attachmentUrl)}
                                  className="absolute inset-0 w-full h-full border-b border-none"
                                  title={post.attachmentName || 'Pratinjau Berkas Dinas'}
                                  allow="autoplay"
                                />
                              </div>
                            </div>
                          </div>
                        ) : null}
                      </div>
                    )}

                    {/* Stats */}
                    <div className="px-6 py-4 flex items-center justify-between border-b border-slate-50">
                      <div className="flex items-center -space-x-1">
                         <div className="w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center border-2 border-white text-[8px] text-white"><Star size={8} fill="currentColor" /></div>
                         <span className="ml-2 text-[10px] text-slate-400 font-bold">{post.likes.length} Mengapresiasi</span>
                      </div>
                      <div className="text-[10px] text-slate-400 font-bold bg-slate-100 px-3 py-1 rounded-full">
                         {post.comments.length} Komentar
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="px-4 py-1 flex items-center justify-between gap-2 border-t border-slate-50">
                      <button 
                        onClick={() => handleLike(post.id)}
                        className={`flex-1 flex items-center justify-center space-x-2 py-3 rounded-xl transition-all font-black text-[10px] uppercase tracking-widest ${post.likes.includes(user.id) ? 'text-amber-600 bg-amber-50/50' : 'text-slate-500 hover:bg-slate-50'}`}
                        id={`like-btn-supervisor-${post.id}`}
                      >
                        <Star size={18} fill={post.likes.includes(user.id) ? "currentColor" : "none"} />
                        <span>Apresiasi</span>
                      </button>
                      <button 
                        onClick={() => toggleComments(post.id)}
                        className={`flex-1 flex items-center justify-center space-x-2 py-3 rounded-xl transition-all font-black text-[10px] uppercase tracking-widest ${toggledComments[post.id] ? 'bg-amber-50 text-amber-700' : 'text-slate-500 hover:bg-slate-50'}`}
                        id={`comment-btn-supervisor-${post.id}`}
                      >
                        <MessageCircle size={18} />
                        <span>Komentar</span>
                      </button>
                    </div>

                    {/* Comments Section */}
                    {toggledComments[post.id] && (
                      <div className="bg-slate-50/30 p-6 space-y-4 border-t border-slate-50 animate-fade-in animate-duration-200">
                        {post.comments.length > 0 && (
                          <div className="space-y-4 mb-4 max-h-60 overflow-y-auto pr-1">
                            {post.comments.map((comment: MaterialComment) => (
                              <div key={comment.id} className="flex space-x-3">
                                <div className="w-10 h-10 bg-white border border-slate-200 rounded-2xl flex items-center justify-center font-black text-xs text-slate-400 shrink-0 shadow-sm overflow-hidden">
                                  {userMap[comment.userId]?.avatar ? (
                                    <img src={userMap[comment.userId].avatar} alt={userMap[comment.userId].nama} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                                  ) : (
                                    userMap[comment.userId]?.nama.charAt(0) || '?'
                                  )}
                                </div>
                                <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex-1">
                                  <div className="flex justify-between items-center mb-1">
                                    <div className="flex items-center space-x-2">
                                      <span className="text-[11px] font-black text-slate-800 uppercase tracking-tight">{userMap[comment.userId]?.nama || 'Unknown'}</span>
                                      {userMap[comment.userId]?.role === 'PENGAWAS' && (
                                        <span className="text-[7px] font-black bg-amber-500 text-white px-2 py-0.5 rounded-full uppercase">PENGAWAS</span>
                                      )}
                                    </div>
                                    <span className="text-[9px] text-slate-400 font-bold">{new Date(comment.timestamp).toLocaleDateString('id-ID')}</span>
                                  </div>
                                  <p className="text-xs text-slate-500 leading-relaxed font-medium">{comment.content}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        <form onSubmit={(e) => handleAddComment(post.id, e)} className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-slate-900 text-white rounded-2xl flex items-center justify-center font-black text-xs shrink-0 overflow-hidden">
                             {user.avatar ? (
                               <img src={user.avatar} alt={user.nama} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                             ) : (
                               user.nama.charAt(0)
                             )}
                          </div>
                          <div className="flex-1 relative">
                            <input 
                              id={`comment-input-${post.id}`}
                              value={commentText[post.id] || ''}
                              onChange={(e) => setCommentText({ ...commentText, [post.id]: e.target.value })}
                              placeholder="Tulis tanggapan atau bukti tindak lanjut Anda..." 
                              className="w-full pl-6 pr-14 py-3.5 bg-white border border-slate-200 rounded-full text-xs focus:ring-2 focus:ring-amber-500 transition-all font-medium shadow-inner"
                            />
                            <button type="submit" className="absolute right-2 top-2 p-2 bg-amber-600 text-white rounded-full hover:bg-amber-700 transition-all active:scale-95">
                              <ArrowRight size={14} />
                            </button>
                          </div>
                        </form>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* TAB 3: RUANG INSPIRASI PENDIDIK */}
        {activeTab === 'BEST_PRACTICES' && (
          <div className="space-y-6">
            
            {/* Special Button Block specifically highlighting peer inspiration as requested */}
            {user.role !== 'PENGAWAS' && (
              <div className="bg-gradient-to-r from-teal-500 to-emerald-600 p-8 rounded-[2.5rem] text-white shadow-lg relative overflow-hidden mb-2">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                  <div>
                    <div className="flex items-center space-x-2.5 mb-2">
                      <Sparkles className="text-amber-300" size={20} fill="currentColor" />
                      <h3 className="font-black text-lg tracking-tight uppercase">Ruang Inspirasi Pendidik</h3>
                    </div>
                    <p className="text-xs text-teal-50 font-medium leading-relaxed max-w-xl">
                      Bagikan tulisan inovatif, dokumentasi kegiatan belajar-mengajar Anda di kelas, atau video interaktif YouTube. Mari saling menginspirasi dan membangun gugus pendidikan yang berkompeten secara sehat!
                    </p>
                  </div>
                  
                  {/* Everyone can post in Best Practice tab */}
                  <button 
                    onClick={() => { setCurrentTargetTab('PEER'); setMediaType('article'); setShowPostModal(true); }}
                    className="px-6 py-4 bg-white text-slate-900 font-extrabold text-xs uppercase tracking-widest rounded-2xl shadow-xl hover:scale-103 active:scale-95 transition-all flex items-center space-x-2.5"
                  >
                    <Plus size={14} className="text-teal-600" />
                    <span>Bagikan Inspirasi</span>
                  </button>
                </div>
              </div>
            )}

            {/* peerInspirationPosts list */}
            {peerInspirationPosts.length === 0 ? (
              <div className="p-20 bg-white rounded-[3.5rem] border border-slate-100/80 text-center shadow-sm">
                <Sparkles className="mx-auto text-slate-300 mb-4" size={48} />
                <p className="text-slate-400 italic text-sm font-semibold tracking-wide">Belum ada Inspirasi yang dibagikan oleh Rekan Sejawat.</p>
              </div>
            ) : (
              peerInspirationPosts.map((post: MaterialPost) => {
                const author = userMap[post.authorId];
                const authorRole = author?.role || 'GURU';

                let cardStyle = "bg-white rounded-[2.5rem] border border-slate-200/60 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-all relative border-l-4 border-l-teal-500";
                let badgeStyle = "bg-teal-50 text-teal-600 border border-teal-100";
                let badgeLabel = "Inspirasi Guru";
                let badgeIcon = <BookOpen size={10} className="text-teal-500" />;

                if (authorRole === 'KEPALA_SEKOLAH') {
                  cardStyle = "bg-white rounded-[2.5rem] border border-slate-200/60 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-all relative border-l-4 border-l-indigo-500";
                  badgeStyle = "bg-indigo-50 text-indigo-600 border border-indigo-100";
                  badgeLabel = "Inspirasi Kepala sekolah";
                  badgeIcon = <Award size={10} className="text-indigo-500" />;
                }

                return (
                  <div key={post.id} className={cardStyle}>
                    {/* Header */}
                    <div className="p-6 flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center font-black shadow-lg shadow-slate-900/10 overflow-hidden">
                          {author?.avatar ? (
                            <img src={author.avatar} alt={author.nama} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                          ) : (
                            author?.nama.charAt(0) || '?'
                          )}
                        </div>
                        <div>
                          <div className="font-black text-slate-800 tracking-tight flex flex-wrap items-center gap-2">
                            <span>{author?.nama || 'Unknown'}</span>
                            <span className={`px-2.5 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider flex items-center space-x-1 ${badgeStyle}`}>
                              {badgeIcon}
                              <span>{badgeLabel}</span>
                            </span>
                          </div>
                          <div className="flex flex-col">
                             <span className="text-[9px] text-slate-400 font-black uppercase tracking-widest leading-none mt-1">
                               {author?.sekolah || 'Pendidik Gugus Cikampek'}
                             </span>
                             <span className="text-[9px] text-slate-400 font-bold mt-1">{new Date(post.timestamp).toLocaleString('id-ID')}</span>
                          </div>
                        </div>
                      </div>
                      <button className="p-2 text-slate-400 hover:bg-slate-50 rounded-full transition-colors">
                         <MoreHorizontal size={20} />
                      </button>
                    </div>

                    {/* Content */}
                    <div className="px-6 pb-4">
                      <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">{post.content}</p>
                    </div>

                    {/* Media content */}
                    {(post.mediaUrl || post.attachmentUrl) && (
                      <div className="px-1 border-y border-slate-50 bg-slate-50/55">
                        {post.mediaType === 'image' && post.mediaUrl ? (
                          <div className="relative group overflow-hidden bg-slate-200 aspect-[16/9]">
                            <img src={post.mediaUrl} alt="Post media" referrerPolicy="no-referrer" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-103" />
                          </div>
                        ) : post.mediaType === 'video' && post.mediaUrl ? (
                          <div className="relative bg-slate-900 aspect-[16/9] w-full rounded-2xl overflow-hidden shadow-lg">
                            {getYoutubeId(post.mediaUrl) ? (
                              <iframe
                                src={`https://www.youtube.com/embed/${getYoutubeId(post.mediaUrl)}`}
                                title="YouTube Video Player"
                                className="w-full h-full border-none"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                allowFullScreen
                              />
                            ) : post.mediaUrl.includes('drive.google.com') ? (
                              <iframe
                                src={getDrivePreviewUrl(post.mediaUrl)}
                                title="Google Drive Video Player"
                                className="w-full h-full border-none"
                                allow="autoplay; encrypted-media"
                                allowFullScreen
                              />
                            ) : (
                              <video 
                                src={post.mediaUrl} 
                                controls 
                                className="w-full h-full object-contain"
                              />
                            )}
                          </div>
                        ) : post.attachmentUrl ? (
                          <div className="p-4 bg-slate-50/55">
                            <div className="border border-slate-200 rounded-[2rem] overflow-hidden bg-slate-100/50 w-full shadow-lg shadow-slate-200/30">
                              {/* Tool Header */}
                              <div className="flex items-center justify-between px-5 py-3 bg-white border-b border-slate-150 font-sans">
                                <div className="flex items-center space-x-3 min-w-0">
                                  <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl shrink-0">
                                    <FileText size={16} />
                                  </div>
                                  <div className="min-w-0">
                                     <h5 className="font-extrabold text-slate-800 text-xs truncate max-w-[200px] sm:max-w-md">{post.attachmentName || 'Karya Inspirasi'}</h5>
                                     <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest leading-none mt-0.5">Peninjau Inspirasi</p>
                                  </div>
                                </div>
                                
                                <div className="flex items-center space-x-1 shrink-0">
                                  <button 
                                    onClick={() => setPreviewDoc({ name: post.attachmentName || 'Karya Inspirasi', url: post.attachmentUrl })}
                                    title="Buka Layar Penuh"
                                    className="p-2.5 text-slate-500 hover:text-emerald-600 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
                                  >
                                    <Maximize2 size={16} />
                                  </button>
                                  
                                  <a 
                                    href={getDriveDownloadUrl(post.attachmentUrl)}
                                    target="_blank" 
                                    rel="noreferrer" 
                                    download
                                    title="Unduh Berkas"
                                    className="p-2.5 text-slate-500 hover:text-emerald-600 hover:bg-slate-100 rounded-xl transition-all flex items-center justify-center"
                                  >
                                    <FileDown size={16} />
                                  </a>
                                </div>
                              </div>

                              {/* Direct Inline Doc Iframe */}
                              <div className="relative bg-slate-100 aspect-[4/3] md:aspect-[16/10] w-full min-h-[350px] overflow-hidden">
                                <iframe
                                  src={getDrivePreviewUrl(post.attachmentUrl)}
                                  className="absolute inset-0 w-full h-full border-b border-none"
                                  title={post.attachmentName || 'Pratinjau Inspirasi'}
                                  allow="autoplay"
                                />
                              </div>
                            </div>
                          </div>
                        ) : null}
                      </div>
                    )}

                    {/* Stats with Psychological feedback loop (Bintang / Comment count) */}
                    <div className="px-6 py-3 flex items-center justify-between border-b border-slate-50">
                      <div className="flex items-center -space-x-1">
                         <div className="w-5 h-5 rounded-full bg-teal-500 flex items-center justify-center border-2 border-white text-[8px] text-white"><Star size={8} fill="currentColor" /></div>
                         <span className="ml-2 text-[10px] text-slate-400 font-black">{post.likes.length} Mengapresiasi</span>
                      </div>
                      <div className="text-[10px] text-slate-400 font-bold bg-slate-100 px-3 py-1 rounded-full">
                         {post.comments.length} Komentar
                      </div>
                    </div>

                    {/* Actions feedback buttons */}
                    <div className="px-4 py-1 flex items-center justify-between gap-2 border-t border-slate-50">
                      <button 
                        onClick={() => handleLike(post.id)}
                        className={`flex-1 flex items-center justify-center space-x-2 py-3 rounded-xl transition-all font-black text-[10px] uppercase tracking-widest ${post.likes.includes(user.id) ? 'text-teal-600 bg-teal-55/40' : 'text-slate-500 hover:bg-slate-50'}`}
                        id={`like-btn-peer-${post.id}`}
                      >
                        <Star size={18} fill={post.likes.includes(user.id) ? "currentColor" : "none"} />
                        <span>Apresiasi</span>
                      </button>
                      <button 
                        onClick={() => toggleComments(post.id)}
                        className={`flex-1 flex items-center justify-center space-x-2 py-3 rounded-xl transition-all font-black text-[10px] uppercase tracking-widest ${toggledComments[post.id] ? 'bg-teal-50 text-teal-700' : 'text-slate-500 hover:bg-slate-50'}`}
                        id={`comment-btn-peer-${post.id}`}
                      >
                        <MessageCircle size={18} />
                        <span>Komentar</span>
                      </button>
                    </div>

                    {/* Comments Section */}
                    {toggledComments[post.id] && (
                      <div className="bg-slate-50/20 p-6 space-y-4 border-t border-slate-50 animate-fade-in animate-duration-200">
                        {post.comments.length > 0 && (
                          <div className="space-y-4 mb-4 max-h-60 overflow-y-auto pr-1">
                            {post.comments.map((comment: MaterialComment) => (
                              <div key={comment.id} className="flex space-x-3">
                                <div className="w-10 h-10 bg-white border border-slate-200 rounded-2xl flex items-center justify-center font-black text-xs text-slate-400 shrink-0 shadow-sm overflow-hidden">
                                  {userMap[comment.userId]?.avatar ? (
                                    <img src={userMap[comment.userId].avatar} alt={userMap[comment.userId].nama} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                                  ) : (
                                    userMap[comment.userId]?.nama.charAt(0) || '?'
                                  )}
                                </div>
                                <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex-1">
                                  <div className="flex justify-between items-center mb-1">
                                    <span className="text-[11px] font-black text-slate-800 uppercase tracking-tight">{userMap[comment.userId]?.nama || 'Unknown'}</span>
                                    <span className="text-[9px] text-slate-400 font-bold">{new Date(comment.timestamp).toLocaleDateString()}</span>
                                  </div>
                                  <p className="text-xs text-slate-500 leading-relaxed font-medium">{comment.content}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        <form onSubmit={(e) => handleAddComment(post.id, e)} className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-slate-900 text-white rounded-2xl flex items-center justify-center font-black text-xs shrink-0 overflow-hidden">
                             {user.avatar ? (
                               <img src={user.avatar} alt={user.nama} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                             ) : (
                               user.nama.charAt(0)
                             )}
                          </div>
                          <div className="flex-1 relative">
                            <input 
                              id={`comment-input-${post.id}`}
                              value={commentText[post.id] || ''}
                              onChange={(e) => setCommentText({ ...commentText, [post.id]: e.target.value })}
                              placeholder="Tuliskan apresiasi konstruktif atau pertanyaan pembelajaran..." 
                              className="w-full pl-6 pr-14 py-3.5 bg-white border border-slate-200 rounded-full text-xs focus:ring-2 focus:ring-teal-500 transition-all font-medium shadow-inner"
                            />
                            <button type="submit" className="absolute right-2 top-2 p-2 bg-teal-600 text-white rounded-full hover:bg-teal-700 transition-all active:scale-95 animate-pulse">
                              <ArrowRight size={14} />
                            </button>
                          </div>
                        </form>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* MODAL 1: BUAT PENGUMUMAN RESMI (ONLY PENGAWAS) */}
      {showAnnounceModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowAnnounceModal(false)}></div>
          <div className="relative bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[90vh]">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div className="flex items-center space-x-3">
                <Megaphone className="text-indigo-600" size={24} />
                <h3 className="text-xl font-black text-slate-800 tracking-tight">Broadcast Pengumuman Resmi</h3>
              </div>
              <button onClick={() => setShowAnnounceModal(false)} className="p-2 text-slate-400 hover:text-rose-500 transition-colors">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleCreateAnnouncement} className="flex-1 overflow-y-auto p-10 space-y-6">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">
                  Subjek Pengumuman
                </label>
                <input 
                  type="text" 
                  required
                  value={announceTitle}
                  onChange={(e) => setAnnounceTitle(e.target.value)}
                  placeholder="Subjek krusial (E.g. Jadwal Rapat Koordinasi Dinas)" 
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-4 focus:ring-indigo-500/10 transition-all font-semibold"
                />
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">
                  Detail & Instruksi Penting
                </label>
                <textarea 
                  required
                  rows={5}
                  value={announceContent}
                  onChange={(e) => setAnnounceContent(e.target.value)}
                  placeholder="Deskripsikan pengumuman secara formal..."
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-3xl text-sm focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium resize-none"
                ></textarea>
              </div>

              <div className="bg-indigo-50/50 p-6 rounded-3xl border border-indigo-100/50 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">
                    Nama File Lampiran (Opsional)
                  </label>
                  <input 
                    type="text" 
                    value={announceAttachName}
                    onChange={(e) => setAnnounceAttachName(e.target.value)}
                    placeholder="E.g. Surat_Edaran_No_04.pdf" 
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:ring-4 focus:ring-indigo-500/10 transition-all"
                  />
                </div>
                <div>
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">
                    Link Google Drive Lampiran (Opsional)
                  </label>
                  <input 
                    type="url" 
                    value={announceAttachUrl}
                    onChange={(e) => setAnnounceAttachUrl(e.target.value)}
                    placeholder="https://drive.google.com/..." 
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:ring-4 focus:ring-indigo-500/10 transition-all"
                  />
                </div>
              </div>

              <button 
                type="submit" 
                className="w-full py-5 bg-gradient-to-r from-indigo-600 to-indigo-800 text-white rounded-3xl font-black uppercase tracking-widest text-xs hover:from-indigo-700 hover:to-indigo-900 transition-all shadow-xl shadow-indigo-600/20 flex items-center justify-center space-x-2"
              >
                <span>Siarkan Pengumuman Dinas</span>
                <Send size={14} />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: BAGIKAN MATERI PEMBINAAN ATAU PRAKTIK BAIK */}
      {showPostModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowPostModal(false)}></div>
          <div className="relative bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[90vh]">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div className="flex items-center space-x-3">
                <Sparkles className="text-teal-500 animate-pulse" size={24} />
                <h3 className="text-xl font-black text-slate-800 tracking-tight">
                  {currentTargetTab === 'SUPERVISOR' ? 'Rilis Materi Pembinaan Utama' : 'Bagikan Inspirasi'}
                </h3>
              </div>
              <button onClick={() => setShowPostModal(false)} className="p-2 text-slate-400 hover:text-rose-500 transition-colors">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleCreateMaterialPost} className="flex-1 overflow-y-auto p-10 space-y-6">
              
              <div className="flex items-center space-x-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 mb-2">
                <div className="w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center font-black">
                  {user.nama?.charAt(0) || '?'}
                </div>
                <div>
                  <h5 className="font-black text-slate-800 text-sm">{user.nama}</h5>
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">
                    Kiriman kategori: {currentTargetTab === 'SUPERVISOR' ? 'Supervisor Guidelines' : 'Ruang Inspirasi Pendidik'}
                  </p>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest db-2 block mb-2">
                  Detail Ringkas & Tulisan
                </label>
                <textarea 
                  required
                  value={postText}
                  onChange={(e) => setPostText(e.target.value)}
                  rows={5}
                  placeholder={currentTargetTab === 'SUPERVISOR' ? "Tuliskan panduan rujukan pembelajaran, metodologi akreditasi, atau materi kepengawasan..." : "Metode mengajar seru di kelas? Tuliskan penjelasan ringkas kegiatan Anda agar rekan guru lainnya bisa menirunya!"}
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-3xl text-sm focus:ring-4 focus:ring-teal-500/10 transition-all font-medium resize-none"
                ></textarea>
              </div>

              {/* Sematkan Visual Attachment Options */}
              <div className="bg-slate-50 border border-slate-150 p-6 rounded-3xl space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200/50 pb-3 mb-2">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Sematkan Visual / Berkas Pendukung</span>
                  
                  <div className="flex gap-1.5">
                    <button 
                      type="button" 
                      onClick={() => setMediaType('article')}
                      className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${mediaType === 'article' ? 'bg-slate-800 text-white' : 'bg-white text-slate-500 border border-slate-100'}`}
                    >
                      Teks
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setMediaType('image')}
                      className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${mediaType === 'image' ? 'bg-indigo-600 text-white' : 'bg-white text-slate-500 border border-slate-100'}`}
                    >
                      Foto
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setMediaType('video')}
                      className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${mediaType === 'video' ? 'bg-teal-600 text-white' : 'bg-white text-slate-500 border border-slate-100'}`}
                    >
                      Video Link
                    </button>
                  </div>
                </div>

                {(mediaType === 'image' || mediaType === 'video') && (
                  <div>
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">
                      URL {mediaType === 'image' ? 'Foto (Direct URL)' : 'Video (YouTube/Lainnya)'}
                    </label>
                    <input 
                      type="url" 
                      value={mediaUrl}
                      onChange={(e) => setMediaUrl(e.target.value)}
                      required
                      placeholder="https://..." 
                      className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:ring-4 focus:ring-teal-500/10 transition-all"
                    />
                  </div>
                )}

                {mediaType === 'article' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">
                        Nama Berkas Rujukan (Opsional)
                      </label>
                      <input 
                        type="text" 
                        value={attachName}
                        onChange={(e) => setAttachName(e.target.value)}
                        placeholder="E.g. Modul_Ajar_Belajar_Mandiri.pdf" 
                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:ring-4 focus:ring-teal-500/10 transition-all"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">
                        Link Google Drive Berkas (Opsional)
                      </label>
                      <input 
                        type="url" 
                        value={attachUrl}
                        onChange={(e) => setAttachUrl(e.target.value)}
                        placeholder="https://drive.google.com/..." 
                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:ring-4 focus:ring-teal-500/10 transition-all"
                      />
                    </div>
                  </div>
                )}
              </div>

              <button 
                type="submit" 
                className="w-full py-5 bg-gradient-to-r from-teal-600 to-teal-800 text-white rounded-3xl font-black uppercase tracking-widest text-xs hover:from-teal-700 hover:to-teal-900 transition-all shadow-xl shadow-teal-500/20 flex items-center justify-center space-x-2"
              >
                <span>Bagikan ke Forum Gugus</span>
                <Send size={14} />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: PRATINJAU DOKUMEN (INLINE PREVIEW) */}
      {previewDoc && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-md" onClick={() => setPreviewDoc(null)}></div>
          <div className="relative bg-white w-full max-w-5xl h-[85vh] rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100 flex flex-col">
            {/* Header */}
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/80 sticky top-0 z-10 font-sans">
              <div className="flex items-center space-x-3 min-w-0 pr-4">
                <div className="p-2.5 bg-teal-50 text-teal-600 rounded-xl shrink-0">
                  <FileText size={20} />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-black text-slate-800 tracking-tight truncate">{previewDoc.name}</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5 font-sans">Penampil Dokumen Berbagi</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 shrink-0">
                <a 
                  href={getDriveDownloadUrl(previewDoc.url)}
                  download
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all shadow-md flex items-center space-x-1.5"
                >
                  <FileDown size={14} />
                  <span>Unduh</span>
                </a>
                <button onClick={() => setPreviewDoc(null)} className="p-2.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all">
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Iframe content */}
            <div className="flex-1 w-full bg-slate-900 relative">
              <iframe
                src={getDrivePreviewUrl(previewDoc.url)}
                className="w-full h-full border-none"
                title="Pratinjau Dokumen Berbagi"
                allow="autoplay"
              />
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
