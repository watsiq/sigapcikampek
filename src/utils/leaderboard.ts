/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { 
  UserProfile, 
  DocumentInfo, 
  Attendance, 
  LeaderboardData, 
  TeacherRanking, 
  PrincipalRanking, 
  SchoolRanking,
  SchoolInfo
} from '../types';

/**
 * Calculates leaderboard data based on users, documents, and attendance.
 */
export const calculateLeaderboardData = (
  users: UserProfile[],
  documents: DocumentInfo[],
  attendance: Attendance[],
  schools: SchoolInfo[]
): LeaderboardData => {
  // Pre-calculate aggregate maps to avoid O(N²) nested searching
  const docsByUserId = new Map<string, DocumentInfo[]>();
  documents.forEach(d => {
    const list = docsByUserId.get(d.userId) || [];
    list.push(d);
    docsByUserId.set(d.userId, list);
  });

  const attendanceByUserId = new Map<string, Attendance[]>();
  attendance.forEach(a => {
    const list = attendanceByUserId.get(a.userId) || [];
    list.push(a);
    attendanceByUserId.set(a.userId, list);
  });

  const getAttendanceStats = (userAttendance: Attendance[]) => {
    const daysMap = new Map<string, { inLog?: Attendance; outLog?: Attendance }>();
    userAttendance.forEach(a => {
      try {
        const date = new Date(a.timestamp);
        if (isNaN(date.getTime())) return;
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const dateStr = `${year}-${month}-${day}`;
        
        const entry = daysMap.get(dateStr) || {};
        if (a.type === 'IN') {
          entry.inLog = a;
        } else if (a.type === 'OUT') {
          entry.outLog = a;
        }
        daysMap.set(dateStr, entry);
      } catch (e) {
        console.error(e);
      }
    });

    let count = 0;
    let score = 0;

    daysMap.forEach(entry => {
      const inLog = entry.inLog;
      const outLog = entry.outLog;
      if (inLog && outLog) {
        const effectiveIn = !inLog.isManual || inLog.status === 'APPROVED';
        const effectiveOut = !outLog.isManual || outLog.status === 'APPROVED';
        if (effectiveIn && effectiveOut) {
          count++;
          const bothNormal = !inLog.isManual && !outLog.isManual;
          if (bothNormal) {
            score += 10;
          } else {
            score += 5;
          }
        }
      }
    });

    return { count, score };
  };

  // 1. Calculate Teacher Scores
  const teacherRankings: TeacherRanking[] = users
    .filter((u) => u.role === 'GURU')
    .map((u) => {
      const userDocs = docsByUserId.get(u.id) || [];
      const approvedDocs = userDocs.filter((d) => d.status === 'APPROVED');
      const userAttendance = attendanceByUserId.get(u.id) || [];
      const attStats = getAttendanceStats(userAttendance);
      
      const pbDocs = userDocs.filter(d => d.type === 'PRAKTIK_BAIK');
      const approvedPbDocs = pbDocs.filter(d => d.status === 'APPROVED');

      const attendanceScore = attStats.score;
      const completenessScore = approvedDocs.reduce((acc, d) => {
        if (d.type === 'PRAKTIK_BAIK') return acc + 20;
        return acc + 5;
      }, 0);
      const qualityScore = approvedDocs.reduce((acc: number, d) => acc + (d.score || 0), 0);
      const totalScore = attendanceScore + qualityScore;

      return { 
        ...u, 
        totalScore, 
        attendanceScore, 
        completenessScore, 
        qualityScore,
        pbCount: pbDocs.length,
        approvedPbCount: approvedPbDocs.length,
        attendanceCount: attStats.count,
        documentCount: userDocs.length
      };
    })
    .sort((a, b) => b.totalScore - a.totalScore);

  // 2. Calculate Principal Scores
  const principalRankings: PrincipalRanking[] = users
    .filter((u) => u.role === 'KEPALA_SEKOLAH')
    .map((u) => {
      const userDocs = docsByUserId.get(u.id) || [];
      const approvedDocs = userDocs.filter((d) => d.status === 'APPROVED');
      const userAttendance = attendanceByUserId.get(u.id) || [];
      const attStats = getAttendanceStats(userAttendance);
      
      const pbDocs = userDocs.filter(d => d.type === 'PRAKTIK_BAIK_KS');
      const approvedPbDocs = pbDocs.filter(d => d.status === 'APPROVED');

      const attendanceScore = attStats.score;
      const institutionalScore = approvedDocs.reduce((acc, d) => {
        if (d.type === 'PRAKTIK_BAIK_KS') return acc + 25; // Higher score for PB KS
        return acc + 10;
      }, 0);
      const qualityScore = approvedDocs.reduce((acc: number, d) => acc + (d.score || 0), 0);
      const totalScore = attendanceScore + qualityScore;

      return { 
        ...u, 
        totalScore, 
        institutionalScore, 
        qualityScore,
        pbCount: pbDocs.length,
        approvedPbCount: approvedPbDocs.length,
        attendanceScore,
        attendanceCount: attStats.count,
        documentCount: userDocs.length
      };
    })
    .sort((a, b) => b.totalScore - a.totalScore);

  // 3. Calculate School Scores
  const teacherRankingsBySchool = new Map<string, TeacherRanking[]>();
  teacherRankings.forEach(tr => {
    const schoolId = tr.schoolId || 'unknown';
    const list = teacherRankingsBySchool.get(schoolId) || [];
    list.push(tr);
    teacherRankingsBySchool.set(schoolId, list);
  });

  const principalRankingsBySchool = new Map<string, PrincipalRanking>();
  principalRankings.forEach(pr => {
    const schoolId = pr.schoolId || 'unknown';
    principalRankingsBySchool.set(schoolId, pr);
  });

  const schoolRankings: SchoolRanking[] = schools
    .map((school) => {
      const schoolTeachers = teacherRankingsBySchool.get(school.id) || [];
      const avgTeacherScore = schoolTeachers.length > 0 
        ? schoolTeachers.reduce((acc, t) => acc + t.totalScore, 0) / schoolTeachers.length 
        : 0;
      
      const principal = principalRankingsBySchool.get(school.id);
      const principalScore = principal ? principal.totalScore : 0;
      
      const totalScore = Math.round(avgTeacherScore + principalScore);
      
      return { 
        schoolId: school.id,
        schoolName: school.name, 
        totalScore, 
        avgTeacherScore: Math.round(avgTeacherScore), 
        principalScore 
      };
    })
    .sort((a, b) => b.totalScore - a.totalScore);

  return { teacherRankings, principalRankings, schoolRankings };
};
