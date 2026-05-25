/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { UserProfile, SchoolInfo } from './types';

export const DEFAULT_SCHOOLS: SchoolInfo[] = [];

export const INITIAL_USERS: UserProfile[] = [
  { 
    id: '4', 
    nama: 'Wahyu Nur Hidayati, M.Pd.', 
    nip: '198101162009022005', 
    sekolah: 'Gugus 1 Cikampek', 
    schoolId: 'gugus-1',
    district: 'Cikampek',
    role: 'PENGAWAS', 
    status: 'ACTIVE',
    password: 'SIGAP123'
  },
];

export const MONTHS = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni", 
  "Juli", "Agustus", "September", "Oktober", "November", "Desember"
];

export const TOAST_DURATION = 3000;

export const LOCAL_STORAGE_KEYS = {
  ATTENDANCE: 'sim_attendance',
  DOCUMENTS: 'sim_documents',
  PERMISSIONS: 'sim_permissions',
  NOTIFICATIONS: 'sim_notifications',
  ANNOUNCEMENTS: 'sim_announcements',
  MATERIAL_POSTS: 'sim_material_posts',
  CURRENT_USER: 'sim_current_user',
  USERS: 'sim_users',
  SCHOOLS: 'sim_schools',
};
