/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';

// --- External Resources ---
import { 
  DEFAULT_SCHOOLS, 
  INITIAL_USERS, 
  LOCAL_STORAGE_KEYS, 
  TOAST_DURATION 
} from './constants';
import { calculateLeaderboardData } from './utils/leaderboard';

// --- Logic & State ---
import { useAppState } from './hooks/useAppState';
import { useNotifications } from './context/NotificationContext';

// --- Shared Components ---
import { StatsCard } from './components/ui/StatsCard';
import { Toast } from './components/ui/Toast';
import { LoginPage } from './components/Auth/LoginPage';
import { PageLoader } from './components/ui/PageLoader';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { ErrorBoundary } from './components/shared/ErrorBoundary';
import { DashboardLoading } from './components/shared/DashboardLoading';

// --- Lazy-Loaded Modules for Code Splitting ---
const GuruDashboard = React.lazy(() => import('./components/Guru/GuruDashboard').then(m => ({ default: m.GuruDashboard })));
const KepalaSekolahDashboard = React.lazy(() => import('./components/KepalaSekolah/KepalaSekolahDashboard').then(m => ({ default: m.KepalaSekolahDashboard })));
const PengawasDashboard = React.lazy(() => import('./components/Pengawas/PengawasDashboard').then(m => ({ default: m.PengawasDashboard })));
const AnnouncementBoard = React.lazy(() => import('./components/common/AnnouncementBoard').then(m => ({ default: m.AnnouncementBoard })));
const GuruAttendance = React.lazy(() => import('./components/Guru/GuruAttendance').then(m => ({ default: m.GuruAttendance })));
const GuruPermissions = React.lazy(() => import('./components/Guru/GuruPermissions').then(m => ({ default: m.GuruPermissions })));
const GuruUploadDocs = React.lazy(() => import('./components/Guru/GuruUploadDocs').then(m => ({ default: m.GuruUploadDocs })));
const PengawasApresiasiSystem = React.lazy(() => import('./components/Pengawas/PengawasApresiasiSystem').then(m => ({ default: m.PengawasApresiasiSystem })));
const SettingsView = React.lazy(() => import('./components/common/SettingsView').then(m => ({ default: m.SettingsView })));
const KSTeacherManagement = React.lazy(() => import('./components/KepalaSekolah/KSTeacherManagement').then(m => ({ default: m.KSTeacherManagement })));
const KSSchoolDocs = React.lazy(() => import('./components/KepalaSekolah/KSSchoolDocs').then(m => ({ default: m.KSSchoolDocs })));
const KSSupervision = React.lazy(() => import('./components/KepalaSekolah/KSSupervision').then(m => ({ default: m.KSSupervision })));
const KSRecap = React.lazy(() => import('./components/KepalaSekolah/KSRecap').then(m => ({ default: m.KSRecap })));
const PengawasBinWil = React.lazy(() => import('./components/Pengawas/PengawasBinWil').then(m => ({ default: m.PengawasBinWil })));
const PengawasUserManagement = React.lazy(() => import('./components/Pengawas/PengawasUserManagement').then(m => ({ default: m.PengawasUserManagement })));
const PengawasValidation = React.lazy(() => import('./components/Pengawas/PengawasValidation').then(m => ({ default: m.PengawasValidation })));
const PengawasCommunications = React.lazy(() => import('./components/Pengawas/PengawasCommunications').then(m => ({ default: m.PengawasCommunications })));
const PengawasRecap = React.lazy(() => import('./components/Pengawas/PengawasRecap').then(m => ({ default: m.PengawasRecap })));

export default function App() {
  const {
    users, setUsers,
    schools, setSchools,
    currentUser,
    isSidebarOpen, setIsSidebarOpen,
    isSidebarCollapsed, setIsSidebarCollapsed,
    activeTab, setActiveTab,
    attendance, setAttendance,
    documents, setDocuments,
    permissions, setPermissions,
    announcements, setAnnouncements,
    materialPosts, setMaterialPosts,
    handleLogin,
    handleLogout: baseLogout,
    updateProfilePicture,
    updateUserProfile,
    updateUserPassword,
    leaderboards
  } = useAppState();

  const { toast, showToast } = useNotifications();

  // --- Auto Logout Logic (30 minutes inactivity) ---
  React.useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const resetTimer = () => {
      if (timeoutId) clearTimeout(timeoutId);
      if (currentUser) {
        timeoutId = setTimeout(() => {
          handleLogout();
          showToast('Sesi Anda telah berakhir karena tidak ada aktivitas selama 30 menit.', 'info');
        }, 30 * 60 * 1000); // 30 minutes
      }
    };

    if (currentUser) {
      const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
      events.forEach(event => window.addEventListener(event, resetTimer));
      resetTimer();

      return () => {
        events.forEach(event => window.removeEventListener(event, resetTimer));
        if (timeoutId) clearTimeout(timeoutId);
      };
    }
  }, [currentUser]);

  const handleLogout = () => {
    baseLogout();
    showToast('Berhasil logout', 'info');
  };

  const onLogin = (user: any) => {
    handleLogin(user);
    showToast(`Selamat datang, ${user.nama}!`, 'success');
  };

  // --- UI Components ---
  return (
    <>
      <Toast message={toast} />
      {!currentUser ? (
        <LoginPage users={users} onLogin={onLogin} />
      ) : (
        <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row relative overflow-hidden">
          {/* Sidebar Mobile Overlay */}
          <AnimatePresence>
            {isSidebarOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsSidebarOpen(false)}
                className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 md:hidden"
              />
            )}
          </AnimatePresence>

          <Sidebar 
            currentUser={currentUser}
            isSidebarOpen={isSidebarOpen}
            setIsSidebarOpen={setIsSidebarOpen}
            isSidebarCollapsed={isSidebarCollapsed}
            setIsSidebarCollapsed={setIsSidebarCollapsed}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            handleLogout={handleLogout}
          />

          {/* Main Content */}
          <main className="flex-1 overflow-y-auto w-full h-screen bg-slate-50/50">
            <Header 
              currentUser={currentUser}
              activeTab={activeTab}
              setIsSidebarOpen={setIsSidebarOpen}
            />

            <div className="p-4 sm:p-6 md:p-8 lg:p-12 max-w-7xl mx-auto w-full">
              <ErrorBoundary>
                <React.Suspense fallback={activeTab === 'Dashboard' ? <DashboardLoading /> : <PageLoader />}>
                  <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  {currentUser.role === 'GURU' && (
                    <>
                      {activeTab === 'Dashboard' && <GuruDashboard user={currentUser} allAttendance={attendance} allDocuments={documents} setAttendance={setAttendance} setDocuments={setDocuments} permissions={permissions} setPermissions={setPermissions} teacherRankings={leaderboards.teacherRankings} />}
                      {activeTab === 'Beranda Berbagi' && <AnnouncementBoard user={currentUser} announcements={announcements} setAnnouncements={setAnnouncements} materialPosts={materialPosts} setMaterialPosts={setMaterialPosts} users={users} documents={documents} />}
                      {activeTab === 'Presensi Kehadiran' && <GuruAttendance user={currentUser} attendance={attendance} setAttendance={setAttendance} permissions={permissions} schools={schools} />}
                      {activeTab === 'Perizinan' && <GuruPermissions user={currentUser} permissions={permissions} setPermissions={setPermissions} users={users} />}
                      {activeTab === 'Unggah Dokumen' && <GuruUploadDocs user={currentUser} documents={documents} setDocuments={setDocuments} users={users} />}
                      {activeTab === 'Peringkat Apresiasi' && <PengawasApresiasiSystem users={users} allDocuments={documents} teacherRankings={leaderboards.teacherRankings} principalRankings={leaderboards.principalRankings} isTeacherView={true} />}
                      {activeTab === 'Pengaturan' && <SettingsView user={currentUser} updateProfilePicture={updateProfilePicture} updateUserProfile={updateUserProfile} updateUserPassword={updateUserPassword} />}
                    </>
                  )}
                  {currentUser.role === 'KEPALA_SEKOLAH' && (
                    <>
                      {activeTab === 'Dashboard' && <KepalaSekolahDashboard user={currentUser} allDocuments={documents} setDocuments={setDocuments} allAttendance={attendance} setAttendance={setAttendance} users={users} permissions={permissions} setPermissions={setPermissions} schoolRankings={leaderboards.schoolRankings} principalRankings={leaderboards.principalRankings} schools={schools} />}
                      {activeTab === 'Beranda Berbagi' && <AnnouncementBoard user={currentUser} announcements={announcements} setAnnouncements={setAnnouncements} materialPosts={materialPosts} setMaterialPosts={setMaterialPosts} users={users} documents={documents} />}
                      {activeTab === 'Presensi Kehadiran' && <GuruAttendance user={currentUser} attendance={attendance} setAttendance={setAttendance} permissions={permissions} schools={schools} />}
                      {activeTab === 'Perizinan' && <GuruPermissions user={currentUser} permissions={permissions} setPermissions={setPermissions} users={users} />}
                      {activeTab === 'Kelola Guru' && <KSTeacherManagement user={currentUser} allAttendance={attendance} users={users} setUsers={setUsers} schools={schools} allDocuments={documents} />}
                      {activeTab === 'Dokumen Sekolah' && <KSSchoolDocs user={currentUser} allDocuments={documents} setDocuments={setDocuments} />}
                      {activeTab === 'Supervisi Guru' && <KSSupervision user={currentUser} users={users} documents={documents} setDocuments={setDocuments} />}
                      {activeTab === 'Peringkat Apresiasi' && <PengawasApresiasiSystem users={users} allDocuments={documents} teacherRankings={leaderboards.teacherRankings} principalRankings={leaderboards.principalRankings} isKSView={true} />}
                      {activeTab === 'Rekapitulasi' && <KSRecap user={currentUser} allAttendance={attendance} users={users} schools={schools} allDocuments={documents} allPermissions={permissions} />}
                      {activeTab === 'Pengaturan' && <SettingsView user={currentUser} updateProfilePicture={updateProfilePicture} updateUserProfile={updateUserProfile} updateUserPassword={updateUserPassword} />}
                    </>
                  )}
                  {currentUser.role === 'PENGAWAS' && (
                    <>
                      {activeTab === 'Dashboard' && <PengawasDashboard user={currentUser} allDocuments={documents} allAttendance={attendance} setDocuments={setDocuments} users={users} schools={schools} permissions={permissions} setPermissions={setPermissions} setAttendance={setAttendance} />}
                      {activeTab === 'Wilayah Binaan' && <PengawasBinWil user={currentUser} schools={schools} setSchools={setSchools} users={users} setActiveTab={setActiveTab} />}
                      {activeTab === 'Mutasi & Rotasi' && <PengawasUserManagement users={users} setUsers={setUsers} schools={schools} />}
                      {activeTab === 'Validasi Dokumen' && <PengawasValidation user={currentUser} allDocuments={documents} setDocuments={setDocuments} users={users} />}
                      {activeTab === 'Beranda Berbagi' && <PengawasCommunications user={currentUser} announcements={announcements} setAnnouncements={setAnnouncements} materialPosts={materialPosts} setMaterialPosts={setMaterialPosts} documents={documents} setDocuments={setDocuments} users={users} />}
                      {activeTab === 'Peringkat Apresiasi' && <PengawasApresiasiSystem users={users} allDocuments={documents} teacherRankings={leaderboards.teacherRankings} principalRankings={leaderboards.principalRankings} />}
                      {activeTab === 'Rekapitulasi Wilayah' && <PengawasRecap user={currentUser} schools={schools} users={users} allDocuments={documents} allAttendance={attendance} allPermissions={permissions} />}
                      {activeTab === 'Pengaturan' && <SettingsView user={currentUser} updateProfilePicture={updateProfilePicture} updateUserProfile={updateUserProfile} updateUserPassword={updateUserPassword} />}
                    </>
                  )}
                </motion.div>
              </AnimatePresence>
              </React.Suspense>
              </ErrorBoundary>
            </div>
          </main>
        </div>
      )}
    </>
  );
}
