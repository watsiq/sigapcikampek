/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useMemo, useRef } from 'react';
import { 
  UserProfile, 
  Attendance, 
  DocumentInfo, 
  Permission, 
  Notification, 
  Announcement, 
  MaterialPost,
  SchoolInfo,
  LeaderboardData
} from '../types';
import { 
  INITIAL_USERS, 
  DEFAULT_SCHOOLS, 
  LOCAL_STORAGE_KEYS 
} from '../constants';
import { 
  DEMO_USERS, 
  DEMO_SCHOOLS, 
  DEMO_ATTENDANCE, 
  DEMO_DOCUMENTS 
} from '../data/demoData';
import { calculateLeaderboardData } from '../utils/leaderboard';
import { storage } from '../lib/storage';

// --- Firebase Imports ---
import { 
  collection, 
  onSnapshot, 
  doc, 
  setDoc, 
  deleteDoc 
} from 'firebase/firestore';
import { signInAnonymously, signOut, onAuthStateChanged } from 'firebase/auth';
import { db, auth, handleFirestoreError, OperationType } from '../lib/firebase';

const APP_VERSION = '3.1'; // Incremented to force clear demo data

/**
 * Custom hook to manage the global application state and persistent Firebase integration.
 */
export function useAppState() {
  const isBootstrapping = useRef<Record<string, boolean>>({});
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [firebaseUserId, setFirebaseUserId] = useState<string | null>(null);

  // Initialization logic to handle persistence and versioning - RUN IMMEDIATELY
  const savedVersion = localStorage.getItem('sim_app_version');
  if (savedVersion !== APP_VERSION) {
    localStorage.clear();
    localStorage.setItem('sim_app_version', APP_VERSION);
  }

  // Handle automatic Firebase session state alignment on mount
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setFirebaseUserId(firebaseUser.uid);
        setIsAuthReady(true);
      } else {
        setFirebaseUserId(null);
        try {
          await signInAnonymously(auth);
        } catch (err) {
          console.warn("Firebase Auth anonymous session skipped or unavailable:", err);
          setIsAuthReady(true);
        }
      }
    });
    return unsubscribe;
  }, []);

  // --- React State Definitions (With elegant local Fallbacks) ---
  const [users, setRawUsers] = useState<UserProfile[]>(() => {
    const defaultUsers = [...INITIAL_USERS];
    DEMO_USERS.forEach(du => {
      if (!defaultUsers.some(u => u.id === du.id)) defaultUsers.push(du);
    });
    const savedUsers = storage.get<UserProfile[]>(LOCAL_STORAGE_KEYS.USERS, defaultUsers);
    return savedUsers.map(u => ({ ...u, password: u.password || 'SIGAP123' }));
  });
  
  const [schools, setRawSchools] = useState<SchoolInfo[]>(() => {
    const defaultSchools = [...DEFAULT_SCHOOLS];
    DEMO_SCHOOLS.forEach(ds => {
      if (!defaultSchools.some(s => s.id === ds.id)) defaultSchools.push(ds);
    });
    return storage.get(LOCAL_STORAGE_KEYS.SCHOOLS, defaultSchools);
  });

  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    return storage.get(LOCAL_STORAGE_KEYS.CURRENT_USER, null);
  });
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('Dashboard');
  
  const [attendance, setRawAttendance] = useState<Attendance[]>(() => {
    return storage.get(LOCAL_STORAGE_KEYS.ATTENDANCE, [...DEMO_ATTENDANCE]);
  });
  
  const [documents, setRawDocuments] = useState<DocumentInfo[]>(() => {
    return storage.get(LOCAL_STORAGE_KEYS.DOCUMENTS, [...DEMO_DOCUMENTS]);
  });

  const [permissions, setRawPermissions] = useState<Permission[]>(() => {
    return storage.get(LOCAL_STORAGE_KEYS.PERMISSIONS, []);
  });

  const [announcements, setRawAnnouncements] = useState<Announcement[]>(() => {
    const list = storage.get(LOCAL_STORAGE_KEYS.ANNOUNCEMENTS, []);
    return [...list].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  });

  const [materialPosts, setRawMaterialPosts] = useState<MaterialPost[]>(() => {
    const list = storage.get(LOCAL_STORAGE_KEYS.MATERIAL_POSTS, []);
    return [...list].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  });

  // --- Real-time Realignment (Firestore onSnapshot Listeners) ---
  useEffect(() => {
    if (!isAuthReady) return;

    const unsubscribers = [
      onSnapshot(collection(db, 'users'), (snapshot) => {
        const list: UserProfile[] = [];
        snapshot.forEach(doc => {
          list.push(doc.data() as UserProfile);
        });

        if (list.length === 0 && !isBootstrapping.current['users']) {
          isBootstrapping.current['users'] = true;
          const defaultUsers = [...INITIAL_USERS];
          // Bootstrap default admin/pengawas account to Firestore on empty database
          Promise.all(defaultUsers.map(u => setDoc(doc(db, 'users', u.id), u)))
            .catch(err => console.error('Error bootstrapping users:', err))
            .finally(() => { isBootstrapping.current['users'] = false; });
        } else if (list.length > 0) {
          setRawUsers(list);
        }
      }, (error) => {
        handleFirestoreError(error, OperationType.LIST, 'users');
      }),

      onSnapshot(collection(db, 'schools'), (snapshot) => {
        const list: SchoolInfo[] = [];
        snapshot.forEach(doc => {
          list.push(doc.data() as SchoolInfo);
        });
        setRawSchools(list);
      }, (error) => {
        handleFirestoreError(error, OperationType.LIST, 'schools');
      }),

      onSnapshot(collection(db, 'attendance'), (snapshot) => {
        const list: Attendance[] = [];
        snapshot.forEach(doc => {
          list.push(doc.data() as Attendance);
        });
        setRawAttendance(list);
      }, (error) => {
        handleFirestoreError(error, OperationType.LIST, 'attendance');
      }),

      onSnapshot(collection(db, 'documents'), (snapshot) => {
        const list: DocumentInfo[] = [];
        snapshot.forEach(doc => {
          list.push(doc.data() as DocumentInfo);
        });
        setRawDocuments(list);
      }, (error) => {
        handleFirestoreError(error, OperationType.LIST, 'documents');
      }),

      onSnapshot(collection(db, 'permissions'), (snapshot) => {
        const list: Permission[] = [];
        snapshot.forEach(doc => {
          list.push(doc.data() as Permission);
        });
        setRawPermissions(list);
      }, (error) => {
        handleFirestoreError(error, OperationType.LIST, 'permissions');
      }),

      onSnapshot(collection(db, 'announcements'), (snapshot) => {
        const list: Announcement[] = [];
        snapshot.forEach(doc => {
          list.push(doc.data() as Announcement);
        });
        list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        setRawAnnouncements(list);
      }, (error) => {
        handleFirestoreError(error, OperationType.LIST, 'announcements');
      }),

      onSnapshot(collection(db, 'materialPosts'), (snapshot) => {
        const list: MaterialPost[] = [];
        snapshot.forEach(doc => {
          list.push(doc.data() as MaterialPost);
        });
        list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        setRawMaterialPosts(list);
      }, (error) => {
        handleFirestoreError(error, OperationType.LIST, 'materialPosts');
      })
    ];

    return () => {
      unsubscribers.forEach(unsub => unsub());
    };
  }, [isAuthReady]);

  // --- Sync State back into LocalStorage Cache ---
  useEffect(() => {
    storage.set(LOCAL_STORAGE_KEYS.ATTENDANCE, attendance);
    storage.set(LOCAL_STORAGE_KEYS.DOCUMENTS, documents);
    storage.set(LOCAL_STORAGE_KEYS.PERMISSIONS, permissions);
    storage.set(LOCAL_STORAGE_KEYS.ANNOUNCEMENTS, announcements);
    storage.set(LOCAL_STORAGE_KEYS.MATERIAL_POSTS, materialPosts);
    storage.set(LOCAL_STORAGE_KEYS.USERS, users);
    storage.set(LOCAL_STORAGE_KEYS.SCHOOLS, schools);
    storage.set(LOCAL_STORAGE_KEYS.CURRENT_USER, currentUser);
  }, [attendance, documents, permissions, announcements, materialPosts, users, schools, currentUser]);

  // --- Helper to clean payload of undefined properties ---
  const cleanPayload = (obj: any): any => {
    if (obj === null || typeof obj !== 'object') {
      return obj;
    }
    if (Array.isArray(obj)) {
      return obj.map(cleanPayload);
    }
    const clean: any = {};
    for (const key of Object.keys(obj)) {
      if (obj[key] !== undefined) {
        clean[key] = cleanPayload(obj[key]);
      }
    }
    return clean;
  };

  // --- Sync Collection State Differential Write Engine ---
  async function syncCollectionState<T extends { id: string }>(
    collectionName: string,
    newItems: T[] | ((current: T[]) => T[]),
    currentItems: T[]
  ) {
    const resolved = typeof newItems === 'function' ? newItems(currentItems) : newItems;

    // Direct Firestore update/write of item changes
    for (const item of resolved) {
      const existingItem = currentItems.find(i => i.id === item.id);
      if (!existingItem || JSON.stringify(existingItem) !== JSON.stringify(item)) {
        try {
          const cleanedItem = cleanPayload(item);
          await setDoc(doc(db, collectionName, item.id), cleanedItem);
        } catch (err) {
          handleFirestoreError(err, OperationType.WRITE, `${collectionName}/${item.id}`);
        }
      }
    }

    // Direct Firestore deletion of item removals
    for (const item of currentItems) {
      if (!resolved.some(i => i.id === item.id)) {
        try {
          await deleteDoc(doc(db, collectionName, item.id));
        } catch (err) {
          handleFirestoreError(err, OperationType.DELETE, `${collectionName}/${item.id}`);
        }
      }
    }
  }

  // --- Integrated Core Wrapper API Setters ---
  const updateUsers = async (val: UserProfile[] | ((curr: UserProfile[]) => UserProfile[])) => {
    await syncCollectionState<UserProfile>('users', val, users);
  };

  const updateSchools = async (val: SchoolInfo[] | ((curr: SchoolInfo[]) => SchoolInfo[])) => {
    await syncCollectionState<SchoolInfo>('schools', val, schools);
  };

  const updateAttendance = async (val: Attendance[] | ((curr: Attendance[]) => Attendance[])) => {
    await syncCollectionState<Attendance>('attendance', val, attendance);
  };

  const updateDocuments = async (val: DocumentInfo[] | ((curr: DocumentInfo[]) => DocumentInfo[])) => {
    await syncCollectionState<DocumentInfo>('documents', val, documents);
  };

  const updatePermissions = async (val: Permission[] | ((curr: Permission[]) => Permission[])) => {
    await syncCollectionState<Permission>('permissions', val, permissions);
  };

  const updateAnnouncements = async (val: Announcement[] | ((curr: Announcement[]) => Announcement[])) => {
    await syncCollectionState<Announcement>('announcements', val, announcements);
  };

  const updateMaterialPosts = async (val: MaterialPost[] | ((curr: MaterialPost[]) => MaterialPost[])) => {
    await syncCollectionState<MaterialPost>('materialPosts', val, materialPosts);
  };

  const handleLogin = async (user: UserProfile) => {
    if (!auth.currentUser) {
      try {
        await signInAnonymously(auth);
      } catch (err) {
        console.warn('Firebase Auth anonymous login omitted or restricted:', err);
      }
    }
    setCurrentUser(user);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error('Firebase Auth signout failed:', err);
    }
    setCurrentUser(null);
  };

  const leaderboards: LeaderboardData = useMemo(() => 
    calculateLeaderboardData(users, documents, attendance, schools),
    [users, documents, attendance, schools]
  );

  return {
    users, setUsers: updateUsers,
    schools, setSchools: updateSchools,
    currentUser, setCurrentUser,
    isSidebarOpen, setIsSidebarOpen,
    isSidebarCollapsed, setIsSidebarCollapsed,
    activeTab, setActiveTab,
    attendance, setAttendance: updateAttendance,
    documents, setDocuments: updateDocuments,
    permissions, setPermissions: updatePermissions,
    announcements, setAnnouncements: updateAnnouncements,
    materialPosts, setMaterialPosts: updateMaterialPosts,
    handleLogin,
    handleLogout,
    userMap: useMemo(() => {
      const map: Record<string, UserProfile> = {};
      users.forEach(u => { map[u.id] = u; });
      return map;
    }, [users]),
    updateProfilePicture: async (userId: string, avatarUrl: string) => {
      const updated = users.map(u => u.id === userId ? { ...u, avatar: avatarUrl } : u);
      await updateUsers(updated);
      if (currentUser?.id === userId) {
        setCurrentUser(prev => prev ? { ...prev, avatar: avatarUrl } : null);
      }
    },
    updateUserProfile: async (userId: string, data: { nama: string, nip: string }) => {
      const updated = users.map(u => u.id === userId ? { ...u, ...data } : u);
      await updateUsers(updated);
      if (currentUser?.id === userId) {
        setCurrentUser(prev => prev ? { ...prev, ...data } : null);
      }
    },
    updateUserPassword: async (userId: string, newPassword: string) => {
      const updated = users.map(u => u.id === userId ? { ...u, password: newPassword } : u);
      await updateUsers(updated);
      if (currentUser?.id === userId) {
        setCurrentUser(prev => prev ? { ...prev, password: newPassword } : null);
      }
    },
    leaderboards
  };
}
