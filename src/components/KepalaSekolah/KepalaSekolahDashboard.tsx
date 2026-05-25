/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { 
  BarChart3, 
  FileText, 
  Briefcase, 
  Medal, 
} from 'lucide-react';
import { 
  UserProfile, 
  DocumentInfo, 
  Permission, 
  Attendance, 
  SchoolRanking, 
  PrincipalRanking,
  SchoolInfo
} from '../../types';
import { getHolidayName } from '../../utils/holidayHelper';

// Modular Components
import { KSHeader } from './modules/KSHeader';
import { KSStatsSummary } from './modules/KSStatsSummary';
import { KSTeacherMonitoring } from './modules/KSTeacherMonitoring';
import { KSTeacherDetailDrawer } from './modules/KSTeacherDetailDrawer';
import { KSTabNavigation } from './modules/KSTabNavigation';
import { KSVerificationTable } from './modules/KSVerificationTable';
import { KSPermissionTable } from './modules/KSPermissionTable';
import { KSManualAttendanceTable } from './modules/KSManualAttendanceTable';
import { KSStrategicDocs } from './modules/KSStrategicDocs';

import { DocumentValidationModal } from '../shared/DocumentValidationModal';
import { useNotifications } from '../../context/NotificationContext';

interface KepalaSekolahDashboardProps {
  user: UserProfile;
  allDocuments: DocumentInfo[];
  setDocuments: (docs: DocumentInfo[] | ((prev: DocumentInfo[]) => DocumentInfo[])) => void;
  allAttendance: Attendance[];
  setAttendance: (att: Attendance[] | ((prev: Attendance[]) => Attendance[])) => void;
  users: UserProfile[];
  permissions: Permission[];
  setPermissions: (perms: Permission[] | ((prev: Permission[]) => Permission[])) => void;
  schoolRankings: SchoolRanking[];
  principalRankings: PrincipalRanking[];
  schools: SchoolInfo[];
}

export function KepalaSekolahDashboard({ 
  user, 
  allDocuments, 
  setDocuments, 
  allAttendance, 
  setAttendance, 
  users, 
  permissions, 
  setPermissions, 
  schoolRankings, 
  principalRankings,
  schools
}: KepalaSekolahDashboardProps) {
  const { showToast, addNotification } = useNotifications();
  const [activeTab, setActiveTab] = useState<'verification' | 'school-docs' | 'permissions' | 'manual-attendance'>('verification');
  const [selectedDoc, setSelectedDoc] = useState<DocumentInfo | null>(null);
  const [selectedTeacher, setSelectedTeacher] = useState<any | null>(null);
  const [isTabLoading, setIsTabLoading] = useState(false);
  const [monitoringQuery, setMonitoringQuery] = useState('');
  const [monitoringFilter, setMonitoringFilter] = useState<'ALL' | 'ALERT'>('ALL');

  React.useEffect(() => {
    setIsTabLoading(true);
    const timer = setTimeout(() => setIsTabLoading(false), 500);
    return () => clearTimeout(timer);
  }, [activeTab]);
  
  const mySchoolRank = schoolRankings.findIndex((s: any) => s.schoolId === user.schoolId) + 1;

  const schoolTeachers = users.filter((u: any) => u.schoolId === user.schoolId && u.role === 'GURU');
  const mySchoolTeacherIds = schoolTeachers.map((t: any) => t.id);

  const pendingDocs = allDocuments.filter((d: any) => {
    const author = users.find(u => u.id === d.userId);
    return d.status === 'PENDING' && d.schoolId === user.schoolId && author?.role === 'GURU';
  });
  const pendingPerms = permissions.filter((p: any) => p.status === 'PENDING' && mySchoolTeacherIds.includes(p.userId));
  const pendingManualAtt = allAttendance.filter((a: any) => a.isManual && a.status === 'PENDING' && mySchoolTeacherIds.includes(a.userId));
  
  const groupedManualAtt = pendingManualAtt.reduce((acc: any, curr: any) => {
    const dateStr = curr.timestamp.split('T')[0];
    const key = `${curr.userId}-${dateStr}`;
    if (!acc[key]) {
      acc[key] = {
        userId: curr.userId,
        date: dateStr,
        entries: [],
        userName: users.find((u: any) => u.id === curr.userId)?.nama || 'Guru',
        reason: curr.reason
      };
    }
    acc[key].entries.push(curr);
    return acc;
  }, {});

  const groupedAttList = Object.values(groupedManualAtt);
  
  const todayStr = new Date().toISOString().split('T')[0];
  
  const teacherMonitoringData = schoolTeachers.map(teacher => {
     const todayAttendance = allAttendance.filter(a => a.userId === teacher.id && a.timestamp.includes(todayStr));
     const hasIn = todayAttendance.some(a => a.type === 'IN');
     const hasOut = todayAttendance.some(a => a.type === 'OUT');
     const lastAtt = todayAttendance.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];
     
     const teacherDocs = allDocuments.filter(d => d.userId === teacher.id);
     const pendingTeacherDocs = teacherDocs.filter(d => d.status === 'PENDING').length;
     const approvedDocs = teacherDocs.filter(d => d.status === 'APPROVED');
     
     const totalPoints = approvedDocs.reduce((acc, curr) => acc + (curr.score || 0), 0);
     const docCompletion = teacherDocs.length > 0 ? Math.round((approvedDocs.length / teacherDocs.length) * 100) : 0;

     // Check Permissions for today
     const todayPermission = permissions.find(p => {
       const start = new Date(p.startDate);
       const end = new Date(p.endDate);
       const current = new Date();
       const now = new Date(current.getFullYear(), current.getMonth(), current.getDate());
       const pStart = new Date(start.getFullYear(), start.getMonth(), start.getDate());
       const pEnd = new Date(end.getFullYear(), end.getMonth(), end.getDate());
       return now >= pStart && now <= pEnd && p.status === 'APPROVED' && p.userId === teacher.id;
     });

     let statusLabel = 'Tidak Hadir';
     let statusColor = 'text-rose-500';
     
     if (todayPermission) {
        statusLabel = todayPermission.type === 'DINAS_LUAR' ? 'Dinas Luar' : 'Izin/Cuti';
        statusColor = 'text-indigo-500';
     } else if (hasIn && hasOut) {
        statusLabel = 'Sudah Pulang';
        statusColor = 'text-blue-500';
     } else if (hasIn) {
        statusLabel = 'Di Sekolah';
        statusColor = 'text-emerald-500';
     } else {
        const todayDay = new Date().getDay();
        if (todayDay === 0 || todayDay === 6) {
           statusLabel = 'Libur Pekan';
           statusColor = 'text-slate-400';
        }
     }

     const isWarning = !hasIn && !todayPermission && new Date().getDay() !== 0 && new Date().getDay() !== 6 && !getHolidayName(new Date(), teacher.schoolId);

     return {
        id: teacher.id,
        nama: teacher.nama,
        avatar: teacher.avatar,
        isPresent: hasIn,
        statusLabel,
        statusColor,
        isWarning,
        totalPoints,
        docCompletion,
        pendingDocs: pendingTeacherDocs,
        lastAttendanceTime: lastAtt ? new Date(lastAtt.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : null
     };
  });

  const filteredTeachers = teacherMonitoringData.filter(t => {
    const matchesSearch = t.nama.toLowerCase().includes(monitoringQuery.toLowerCase());
    const matchesFilter = monitoringFilter === 'ALL' || (monitoringFilter === 'ALERT' && t.isWarning);
    return matchesSearch && matchesFilter;
  });

  const handleReview = (id: string, status: 'APPROVED' | 'REVISION', finalScore: number, finalFeedback: string) => {
    setDocuments(prev => prev.map((d: any) => d.id === id ? { ...d, status, feedback: finalFeedback, score: status === 'APPROVED' ? finalScore : 0 } : d));
    const doc = allDocuments.find((d: any) => d.id === id);
    if (doc) {
       addNotification(doc.userId, 'Status Berkas Diperbarui', `Berkas ${doc.fileName} telah ${status === 'APPROVED' ? 'Diterima' : 'Diminta Revisi'} oleh KS`, status === 'APPROVED' ? 'SUCCESS' : 'REVISION');
    }
    setSelectedDoc(null);
    showToast(status === 'APPROVED' ? 'Berkas Berhasil Verifikasi' : 'Revisi Berhasil Dikirim', status === 'APPROVED' ? 'success' : 'info');
  };

  const handlePermissionApproval = (permId: string, status: 'APPROVED' | 'REJECTED') => {
    setPermissions(prev => prev.map((p: any) => p.id === permId ? { ...p, status } : p));
    const perm = permissions.find((p: any) => p.id === permId);
    if (perm) {
      addNotification(perm.userId, 'Status Perizinan', `Permohonan ${perm.type} Anda telah ${status}`, status === 'APPROVED' ? 'SUCCESS' : 'DANGER');
    }
    showToast(`Permohonan ${status}`, 'success');
  };

  const handleGroupedManualAttApproval = (group: any, status: 'APPROVED' | 'REJECTED') => {
    const ids = group.entries.map((e: any) => e.id);
    setAttendance(prev => prev.map((a: any) => ids.includes(a.id) ? { ...a, status } : a));
    addNotification(group.userId, 'Status Perbaikan Presensi', `Permohonan perbaikan presensi tanggal ${group.date} telah ${status}`, status === 'APPROVED' ? 'SUCCESS' : 'DANGER');
    showToast(`Perbaikan Presensi ${status}`, 'success');
  };

  const strategicDocTypes = [
    { type: 'RAPOR', label: 'Rapor Pendidikan', icon: <BarChart3 /> },
    { type: 'RKT', label: 'RKT Satuan', icon: <FileText /> },
    { type: 'KSP', label: 'Kurikulum KSP', icon: <Briefcase /> },
    { type: 'PRAKTIK_BAIK_KS', label: 'Inovasi KS', icon: <Medal /> }
  ];

  const mySchool = schools?.find(s => s.id === user.schoolId);

  return (
    <div className="space-y-8">
      <KSHeader 
        sekolah={mySchool?.name || user.sekolah || ''} 
        npsn={mySchool?.npsn}
      />

      <KSStatsSummary 
        pendingDocsCount={pendingDocs.length}
        pendingPermsCount={pendingPerms.length}
        pendingManualAttCount={pendingManualAtt.length}
        mySchoolRank={mySchoolRank}
      />

      <KSTeacherMonitoring 
        teachersCount={schoolTeachers.length}
        searchQuery={monitoringQuery}
        setSearchQuery={setMonitoringQuery}
        filterType={monitoringFilter}
        setFilterType={setMonitoringFilter}
        filteredTeachers={filteredTeachers}
        onTeacherClick={setSelectedTeacher}
      />

      <KSTabNavigation 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        counts={{
          pendingDocs: pendingDocs.length,
          pendingPerms: pendingPerms.length,
          pendingManualAtt: pendingManualAtt.length
        }}
      />

      <AnimatePresence mode="wait">
        {activeTab === 'verification' && (
          <motion.div key="verification" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <KSVerificationTable 
              pendingDocs={pendingDocs}
              users={users}
              onSelectDoc={setSelectedDoc}
              isLoading={isTabLoading}
            />
          </motion.div>
        )}

        {activeTab === 'permissions' && (
          <motion.div key="permissions" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <KSPermissionTable 
              pendingPerms={pendingPerms}
              users={users}
              onReview={handlePermissionApproval}
              isLoading={isTabLoading}
            />
          </motion.div>
        )}

        {activeTab === 'manual-attendance' && (
          <motion.div key="manual-attendance" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <KSManualAttendanceTable 
              groupedAttendance={groupedAttList}
              onReview={handleGroupedManualAttApproval}
              isLoading={isTabLoading}
            />
          </motion.div>
        )}

        {activeTab === 'school-docs' && (
          <motion.div key="school-docs" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <KSStrategicDocs 
              strategicDocTypes={strategicDocTypes}
              allDocuments={allDocuments}
              schoolId={user.schoolId || ''}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {selectedDoc && (
        <DocumentValidationModal 
          document={selectedDoc}
          author={users.find(u => u.id === selectedDoc.userId)}
          onClose={() => setSelectedDoc(null)}
          onReview={handleReview}
          readOnly={selectedDoc.status === 'APPROVED'}
          userRoleLabel={users.find(u => u.id === selectedDoc.userId)?.role === 'KEPALA_SEKOLAH' ? 'KS' : 'GURU'}
        />
      )}

      {selectedTeacher && (
        <KSTeacherDetailDrawer 
          teacher={selectedTeacher}
          onClose={() => setSelectedTeacher(null)}
          allAttendance={allAttendance}
          allDocuments={allDocuments}
          allPermissions={permissions}
          onSelectDoc={setSelectedDoc}
        />
      )}
    </div>
  );
}
