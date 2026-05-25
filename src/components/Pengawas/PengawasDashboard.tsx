/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, 
  CheckCircle, 
  XCircle,
  BarChart3,
  Fingerprint,
  FileClock,
  Building2,
  Clock,
  FileWarning,
  Medal,
  Download
} from 'lucide-react';

// Modular Components
import { PengawasHeader } from './modules/PengawasHeader';
import { PengawasStatsSummary } from './modules/PengawasStatsSummary';
import { PengawasMonitoringSection } from './modules/PengawasMonitoringSection';
import { PengawasRankingSection } from './modules/PengawasRankingSection';
import { PengawasKSCtrlSection } from './modules/PengawasKSCtrlSection';
import { PengawasSchoolDetailDrawer } from './modules/PengawasSchoolDetailDrawer';
import { KSTeacherDetailDrawer } from '../KepalaSekolah/modules/KSTeacherDetailDrawer';

import * as XLSX from 'xlsx';
import { 
  UserProfile, 
  DocumentInfo, 
  Attendance, 
  SchoolInfo,
  Permission
} from '../../types';
import { DocumentValidationModal } from '../shared/DocumentValidationModal';
import { useNotifications } from '../../context/NotificationContext';

interface PengawasDashboardProps {
  user: UserProfile;
  allDocuments: DocumentInfo[];
  allAttendance: Attendance[];
  setDocuments: (docs: DocumentInfo[] | ((prev: DocumentInfo[]) => DocumentInfo[])) => void;
  users: UserProfile[];
  schools: SchoolInfo[];
  permissions: Permission[];
  setPermissions: (permissions: Permission[] | ((prev: Permission[]) => Permission[])) => void;
  setAttendance: (att: Attendance[] | ((prev: Attendance[]) => Attendance[])) => void;
}

export function PengawasDashboard({ 
  user, 
  allDocuments, 
  allAttendance, 
  setDocuments, 
  users, 
  schools,
  permissions,
  setPermissions,
  setAttendance,
}: PengawasDashboardProps) {
  const { showToast, addNotification } = useNotifications();
  const [activeSubTab, setActiveSubTab] = useState<'docs' | 'permissions' | 'attendance'>('docs');
  const [selectedKSDoc, setSelectedKSDoc] = useState<DocumentInfo | null>(null);
  const [selectedSchoolDetail, setSelectedSchoolDetail] = useState<any>(null);
  const [selectedPersonnelId, setSelectedPersonnelId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'ALL' | 'ALERT' | 'WARNING'>('ALL');

  const todayStr = new Date().toISOString().split('T')[0];
  const currentMonth = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });

  const usersMap = React.useMemo(() => {
    const map = new Map<string, UserProfile>();
    users.forEach(u => map.set(u.id, u));
    return map;
  }, [users]);

  const getSchoolPerformance = (school: SchoolInfo) => {
    const schoolTeachers = users.filter((u: any) => u.schoolId === school.id && u.role === 'GURU');
    const schoolKS = users.find((u: any) => u.schoolId === school.id && u.role === 'KEPALA_SEKOLAH');
    
    const ksPresent = schoolKS ? allAttendance.some((a: any) => a.userId === schoolKS.id && a.type === 'IN' && a.timestamp.includes(todayStr)) : false;
    const teachersPresent = allAttendance.filter((a: any) => {
       const userOfLog = usersMap.get(a.userId);
       return userOfLog?.schoolId === school.id && userOfLog?.role === 'GURU' && a.type === 'IN' && a.timestamp.includes(todayStr);
    }).length;

    const staffCount = schoolTeachers.length + (schoolKS ? 1 : 0);
    const staffPresent = teachersPresent + (ksPresent ? 1 : 0);
    const missingAttendanceCount = Math.max(0, staffCount - staffPresent);

    const pendingTeacherDocs = allDocuments.filter((d: any) => d.schoolId === school.id && d.status === 'PENDING' && usersMap.get(d.userId)?.role === 'GURU').length;
    const pendingKSDocs = allDocuments.filter((d: any) => d.schoolId === school.id && d.status === 'PENDING' && usersMap.get(d.userId)?.role === 'KEPALA_SEKOLAH').length;
    
    const teachersNoDoc = schoolTeachers.filter(t => !allDocuments.some(d => d.userId === t.id && d.uploadDate.includes(new Date().toISOString().slice(0, 7)))).length;
    const ksNoDoc = schoolKS && !allDocuments.some(d => d.userId === schoolKS.id && d.uploadDate.includes(new Date().toISOString().slice(0, 7)));

    const teacherPoints = allDocuments.filter((d: any) => d.schoolId === school.id && d.status === 'APPROVED' && usersMap.get(d.userId)?.role === 'GURU').reduce((sum: number, d: any) => sum + (d.score || 0), 0);
    const ksPoints = allDocuments.filter((d: any) => d.schoolId === school.id && d.status === 'APPROVED' && usersMap.get(d.userId)?.role === 'KEPALA_SEKOLAH').reduce((sum: number, d: any) => sum + (d.score || 0), 0);
    const attendanceCount = allAttendance.filter((a: any) => {
       const userOfLog = usersMap.get(a.userId);
       return userOfLog?.schoolId === school.id && a.type === 'IN';
    }).length;

    const totalScore = teacherPoints + ksPoints + (attendanceCount * 2);
    const docCompletion = staffCount > 0 ? (allDocuments.filter((d: any) => d.schoolId === school.id && d.status === 'APPROVED').length / (staffCount * 2)) * 100 : 0;

    const exceptionList = [...schoolTeachers, ...(schoolKS ? [schoolKS] : [])].map(staff => {
       const todayAttendance = allAttendance.filter(a => a.userId === staff.id && a.timestamp.includes(todayStr));
       const hasIn = todayAttendance.some(a => a.type === 'IN');
       const hasOut = todayAttendance.some(a => a.type === 'OUT');

       const docsThisMonth = allDocuments.filter(d => d.userId === staff.id && d.uploadDate.includes(new Date().toISOString().slice(0, 7)));
       const hasPendingDocs = docsThisMonth.some(d => d.status === 'PENDING');

       // Check Permissions for today
       const todayPermission = permissions.find(p => {
         const start = new Date(p.startDate);
         const end = new Date(p.endDate);
         const current = new Date();
         const now = new Date(current.getFullYear(), current.getMonth(), current.getDate());
         const pStart = new Date(start.getFullYear(), start.getMonth(), start.getDate());
         const pEnd = new Date(end.getFullYear(), end.getMonth(), end.getDate());
         return now >= pStart && now <= pEnd && p.status === 'APPROVED' && p.userId === staff.id;
       });

       let status = 'GREEN';
       let label = 'Hadir';

       if (todayPermission) {
          status = 'YELLOW';
          label = todayPermission.type === 'DINAS_LUAR' ? 'Dinas Luar' : 'Izin/Cuti';
       } else if (hasIn && hasOut) {
          status = 'GREEN';
          label = 'Sudah Pulang';
       } else if (hasIn) {
          status = 'GREEN';
          label = 'Di Sekolah';
       } else {
          const todayDay = new Date().getDay();
          if (todayDay === 0 || todayDay === 6) {
             status = 'GREEN';
             label = 'Libur Pekan';
          } else {
             status = 'RED';
             label = 'Tidak Hadir';
          }
       }

       // Secondary warning for docs
       if (status === 'GREEN' && (docsThisMonth.length === 0 || hasPendingDocs)) {
          status = 'YELLOW';
          if (docsThisMonth.length === 0) label = 'Berkas Nihil';
          else label = 'Validasi Berkas';
       }

       return { id: staff.id, name: staff.nama, nip: staff.nip, role: staff.role, status, label, hasAttended: hasIn, docCount: docsThisMonth.length };
    }).sort((a, b) => {
       const priority: any = { RED: 0, YELLOW: 1, GREEN: 2 };
       return priority[a.status] - priority[b.status];
    });

    return { schoolId: school.id, schoolName: school.name, totalScore, docCompletion: Math.min(100, Math.round(docCompletion)), teacherCount: schoolTeachers.length, teachersPresent, ksPresent, staffCount, staffPresent, missingAttendanceCount, teachersNoDoc, ksNoDoc, pendingDocs: pendingTeacherDocs + pendingKSDocs, pendingKSDocs, ksName: schoolKS?.nama || 'Belum Ada', exceptionList };
  };

  const schoolPerformances = React.useMemo(() => schools.map(s => getSchoolPerformance(s)), [schools, users, allDocuments, allAttendance, todayStr, permissions]);
  const totalMissingAttendance = React.useMemo(() => schoolPerformances.reduce((acc, s) => acc + s.missingAttendanceCount, 0), [schoolPerformances]);
  const totalNoDocs = React.useMemo(() => schoolPerformances.reduce((acc, s) => acc + s.teachersNoDoc + (s.ksNoDoc ? 1 : 0), 0), [schoolPerformances]);
  
  const ksDocs = React.useMemo(() => allDocuments.filter((d: any) => {
    const author = usersMap.get(d.userId);
    return author?.role === 'KEPALA_SEKOLAH';
  }), [allDocuments, usersMap]);

  const pendingKsDocs = React.useMemo(() => ksDocs.filter((d: any) => d.status === 'PENDING'), [ksDocs]);
  const pendingKsPerms = React.useMemo(() => permissions.filter((p: any) => p.status === 'PENDING' && usersMap.get(p.userId)?.role === 'KEPALA_SEKOLAH'), [permissions, usersMap]);
  const pendingKsManualAtt = React.useMemo(() => allAttendance.filter((a: any) => a.isManual && a.status === 'PENDING' && usersMap.get(a.userId)?.role === 'KEPALA_SEKOLAH'), [allAttendance, usersMap]);

  const schoolRankings = React.useMemo(() => [...schoolPerformances].sort((a: any, b: any) => b.totalScore - a.totalScore), [schoolPerformances]);
  const topSchool = schoolRankings[0];

  const filteredSchools = React.useMemo(() => schoolRankings.filter(s => {
    const matchesSearch = s.schoolName.toLowerCase().includes(searchQuery.toLowerCase()) || s.ksName.toLowerCase().includes(searchQuery.toLowerCase());
    if (filterType === 'ALERT') return matchesSearch && s.missingAttendanceCount > 0;
    if (filterType === 'WARNING') return matchesSearch && s.teachersNoDoc > 0;
    return matchesSearch;
  }), [schoolRankings, searchQuery, filterType]);

  const selectedPersonnelData = React.useMemo(() => {
    if (!selectedPersonnelId) return null;
    const u = usersMap.get(selectedPersonnelId);
    if (!u) return null;
    const hasAttended = allAttendance.some(a => a.userId === u.id && a.type === 'IN' && a.timestamp.includes(todayStr));
    const approvedDocs = allDocuments.filter(d => d.userId === u.id && d.status === 'APPROVED');
    const attCount = allAttendance.filter(a => a.userId === u.id && a.type === 'IN').length;
    const points = approvedDocs.reduce((sum, d) => sum + (d.score || 0), 0) + (attCount * 2);
    const pending = allDocuments.filter(d => d.userId === u.id && d.status === 'PENDING').length;
    
    return {
      ...u,
      isPresent: hasAttended,
      totalPoints: points,
      docCompletion: Math.min(100, Math.round((approvedDocs.length / 2) * 100)),
      pendingDocs: pending
    };
  }, [selectedPersonnelId, usersMap, allAttendance, allDocuments, todayStr]);

  const handleExportRekap = () => {
    try {
      const exportData = allAttendance.map(att => {
        const u = usersMap.get(att.userId);
        const sName = schools.find(s => s.id === (u?.schoolId || att.schoolId))?.name || u?.sekolah || '-';
        return {
          'Nama': u?.nama || 'Unknown',
          'NIP': u?.nip || '-',
          'Sekolah': sName,
          'Peran': u?.role || '-',
          'Tanggal': att.timestamp.split('T')[0],
          'Jam': new Date(att.timestamp).toLocaleTimeString(),
          'Tipe': att.type === 'IN' ? 'Masuk' : 'Pulang',
          'Status': att.status
        };
      });

      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Kehadiran Gugus');
      
      // Set column widths for better "neatness"
      const wscols = [
        {wch: 25}, // Nama
        {wch: 20}, // NIP
        {wch: 30}, // Sekolah
        {wch: 15}, // Peran
        {wch: 15}, // Tanggal
        {wch: 12}, // Jam
        {wch: 10}, // Tipe
        {wch: 12}, // Status
      ];
      worksheet['!cols'] = wscols;

      XLSX.writeFile(workbook, `Rekap_Kehadiran_Gugus_${new Date().toISOString().split('T')[0]}.xlsx`);
      showToast('Rekap kehadiran gugus berhasil diekspor ke Excel', 'success');
    } catch (error) { 
      showToast('Gagal mengekspor data ke Excel', 'error'); 
    }
  };

  const handleValidate = (id: string, status: 'APPROVED' | 'REVISION', score: number, feedback: string) => {
    setDocuments(prev => prev.map((d: any) => d.id === id ? { ...d, status, score: status === 'APPROVED' ? score : 0, feedback } : d));
    setSelectedKSDoc(null);
    showToast('Dokumen Kepala Sekolah telah divalidasi', 'success');
  };

  const handlePermissionReview = (permId: string, status: 'APPROVED' | 'REJECTED') => {
    setPermissions(prev => prev.map((p: any) => p.id === permId ? { ...p, status } : p));
    const perm = permissions.find((p: any) => p.id === permId);
    if (perm) addNotification(perm.userId, 'Status Perizinan', `Permohonan ${perm.type} Anda telah ${status} oleh Pengawas`, status === 'APPROVED' ? 'SUCCESS' : 'DANGER');
    showToast(`Permohonan ${status}`, 'success');
  };

  const handleManualAttReview = (attId: string, status: 'APPROVED' | 'REJECTED') => {
    setAttendance(prev => prev.map((a: any) => a.id === attId ? { ...a, status } : a));
    const att = allAttendance.find((a: any) => a.id === attId);
    if (att) addNotification(att.userId, 'Status Perbaikan Absensi', `Permohonan absen Anda telah ${status} oleh Pengawas`, status === 'APPROVED' ? 'SUCCESS' : 'DANGER');
    showToast(`Absen Manual ${status}`, 'success');
  };

  return (
    <div className="space-y-12">
      <PengawasHeader userName={user.nama} />

      <PengawasStatsSummary 
        totalMissingAttendance={totalMissingAttendance}
        totalNoDocs={totalNoDocs}
        currentMonth={currentMonth}
        pendingKsDocsCount={pendingKsDocs.length}
        topSchool={topSchool}
        onFilterClick={setFilterType}
      />

      <PengawasMonitoringSection 
        schoolsCount={schools.length}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        filterType={filterType}
        setFilterType={setFilterType}
        filteredSchools={filteredSchools}
        onSchoolClick={setSelectedSchoolDetail}
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
        <PengawasRankingSection schoolRankings={schoolRankings} />
        
        <PengawasKSCtrlSection 
          activeSubTab={activeSubTab}
          setActiveSubTab={setActiveSubTab}
          pendingKsDocsCount={pendingKsDocs.length}
          pendingKsPermsCount={pendingKsPerms.length}
          pendingKsManualAttCount={pendingKsManualAtt.length}
          ksDocs={ksDocs}
          users={users}
          onSelectDoc={setSelectedKSDoc}
          pendingKsPerms={pendingKsPerms}
          onPermissionReview={handlePermissionReview}
          pendingKsManualAtt={pendingKsManualAtt}
          onManualAttReview={handleManualAttReview}
        />
      </div>

      <AnimatePresence>
        {selectedSchoolDetail && (
          <PengawasSchoolDetailDrawer 
            schoolDetail={selectedSchoolDetail}
            onClose={() => setSelectedSchoolDetail(null)}
            onSelectPersonnel={setSelectedPersonnelId}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedPersonnelId && selectedPersonnelData && (
          <KSTeacherDetailDrawer 
            teacher={selectedPersonnelData}
            onClose={() => setSelectedPersonnelId(null)}
            allAttendance={allAttendance}
            allDocuments={allDocuments}
            allPermissions={permissions}
            onSelectDoc={(doc) => {
              setSelectedKSDoc(doc);
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedKSDoc && (
          <DocumentValidationModal 
            document={selectedKSDoc}
            author={usersMap.get(selectedKSDoc.userId)}
            onClose={() => setSelectedKSDoc(null)}
            onReview={handleValidate}
            readOnly={selectedKSDoc.status === 'APPROVED'}
            userRoleLabel={usersMap.get(selectedKSDoc.userId)?.role === 'KEPALA_SEKOLAH' ? 'KS' : 'GURU'}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
