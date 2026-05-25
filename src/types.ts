/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type Role = 'GURU' | 'KEPALA_SEKOLAH' | 'PENGAWAS';

export interface UserProfile {
  id: string;
  nama: string;
  nip: string;
  sekolah: string;
  schoolId?: string;
  district?: string;
  role: Role;
  score?: number;
  status?: 'ACTIVE' | 'INACTIVE' | 'PENDING_APPROVAL';
  password?: string;
  avatar?: string;
  jabatan?: string;
  kelas?: string;
}

export interface SchoolInfo {
  id: string;
  name: string;
  alamat?: string;
  npsn?: string;
  district?: string;
  status?: string;
  akreditasi?: string;
  koordinat?: { lat: number; lng: number };
  lat?: number;
  lng?: number;
  radius?: number; // meters
}

export interface Attendance {
  id: string;
  userId: string;
  schoolId?: string;
  timestamp: string;
  type: 'IN' | 'OUT';
  location: string;
  isManual?: boolean;
  status?: 'PENDING' | 'APPROVED' | 'REJECTED';
  reason?: string;
  isAtSchool?: boolean;
}

export interface DocumentInfo {
  id: string;
  userId: string;
  schoolId?: string;
  fileName: string;
  type: 'RPP_LENGKAP' | 'RAPOR' | 'RKT' | 'KSP' | 'PRAKTIK_BAIK' | 'PRAKTIK_BAIK_KS' | 'SUPERVISI' | 'MATERI';
  uploadDate: string;
  status: 'PENDING' | 'APPROVED' | 'REVISION';
  feedback?: string;
  category: 'MONTHLY' | 'ANNUAL' | 'SYSTEM';
  score?: number;
  link?: string;
  teacherId?: string;
  sekolah?: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  authorId: string;
  timestamp: string;
  attachmentUrl?: string;
  attachmentName?: string;
  attachmentType?: 'image' | 'pdf' | 'doc';
}

export interface MaterialComment {
  id: string;
  userId: string;
  content: string;
  timestamp: string;
}

export interface MaterialPost {
  id: string;
  title?: string;
  content: string;
  authorId: string;
  timestamp: string;
  attachmentUrl?: string;
  attachmentName?: string;
  mediaType?: 'image' | 'video' | 'article';
  mediaUrl?: string;
  likes: string[];
  comments: MaterialComment[];
}

export interface Permission {
  id: string;
  userId: string;
  schoolId?: string;
  type: 'CUTI' | 'IZIN' | 'DINAS_LUAR';
  leaveType?: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  uploadDate: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  type: 'UPLOAD' | 'APPROVAL' | 'REVISION' | 'PERMISSION';
}

export interface Message {
  text: string;
  type: 'success' | 'error' | 'info';
}

export interface TeacherRanking extends UserProfile {
  totalScore: number;
  attendanceScore: number;
  completenessScore: number;
  qualityScore: number;
  pbCount?: number;
  approvedPbCount?: number;
  attendanceCount?: number;
  documentCount?: number;
}

export interface PrincipalRanking extends UserProfile {
  totalScore: number;
  institutionalScore: number;
  qualityScore: number;
  pbCount?: number;
  approvedPbCount?: number;
  attendanceCount?: number;
  documentCount?: number;
}

export interface SchoolRanking {
  schoolId: string;
  schoolName: string;
  totalScore: number;
  avgTeacherScore: number;
  principalScore: number;
}

export interface LeaderboardData {
  teacherRankings: TeacherRanking[];
  principalRankings: PrincipalRanking[];
  schoolRankings: SchoolRanking[];
}
