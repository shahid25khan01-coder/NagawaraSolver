import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  onSnapshot,
} from 'firebase/firestore';
import { User as FirebaseUser } from 'firebase/auth';
import {
  Complaint,
  Department,
  CitizenUser,
  CivicNotification,
  ActiveTab,
  AdminTab,
  ComplaintCategory,
  ComplaintStatus,
  PriorityLevel,
  LocationCoordinates,
  AUTHORIZED_ADMINS,
  AuthorizedAdmin,
  DEFAULT_ADMIN,
  Supervisor,
  DEFAULT_SUPERVISORS,
} from '../types.ts';
import {
  INITIAL_CITIZEN,
  INITIAL_COMPLAINTS,
  SAMPLE_COMPLAINTS,
  INITIAL_DEPARTMENTS,
  INITIAL_NOTIFICATIONS,
} from '../data/mockData.ts';
import {
  getNextCaseDetails,
  matchesTicketQuery,
  NextCaseInfo,
} from '../utils/caseCounter.ts';
import {
  db,
  auth,
  testConnection,
  handleFirestoreError,
  OperationType,
  loginWithGoogle,
  logoutUser,
  onAuthStateChanged,
  saveUserProfile,
  getUserProfile,
} from '../firebase.ts';

export type AppView =
  | 'splash'
  | 'user_login'
  | 'citizen'
  | 'supervisor_login'
  | 'supervisor'
  | 'admin_login'
  | 'admin';

interface AppContextType {
  currentView: AppView;
  setCurrentView: (view: AppView) => void;
  citizenTab: ActiveTab;
  setCitizenTab: (tab: ActiveTab) => void;
  adminTab: AdminTab;
  setAdminTab: (tab: AdminTab) => void;

  // Firebase Auth & User state
  firebaseUser: FirebaseUser | null;
  isAuthLoading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOutGoogle: () => Promise<void>;
  isCitizenLoggedIn: boolean;
  setIsCitizenLoggedIn: (logged: boolean) => void;
  currentUser: CitizenUser;
  setCurrentUser: React.Dispatch<React.SetStateAction<CitizenUser>>;
  updateUserProfile: (data: Partial<CitizenUser>) => Promise<void>;
  adminUser: { name: string; role: string; email: string } | null;
  loginAdmin: (email: string, password?: string) => { success: boolean; error?: string };
  logoutAdmin: () => void;
  loginCitizen: (name?: string, phone?: string) => void;
  loginWithPhone: (phoneNumber: string, name?: string) => Promise<{ success: boolean; error?: string }>;
  logoutCitizen: () => void;

  // Complaints state & actions
  complaints: Complaint[];
  selectedComplaintId: string | null;
  setSelectedComplaintId: (id: string | null) => void;
  adminResolutionComplaintId: string | null;
  setAdminResolutionComplaintId: (id: string | null) => void;

  submitComplaint: (data: {
    title: string;
    category: ComplaintCategory;
    description: string;
    priority: PriorityLevel;
    location: LocationCoordinates;
    photoUrl: string;
    isAnonymous?: boolean;
  }) => Promise<string>;

  verifyAndAssignComplaint: (
    complaintId: string,
    departmentId: string,
    officerId: string,
    priority: PriorityLevel,
    notes?: string,
    supervisorId?: string
  ) => Promise<void>;

  markInProgress: (complaintId: string, notes?: string) => Promise<void>;

  markResolved: (
    complaintId: string,
    afterPhotoUrl: string,
    resolutionNotes: string
  ) => Promise<void>;

  // Supervisor portal actions & authentication
  supervisors: Supervisor[];
  activeSupervisor: Supervisor;
  setActiveSupervisor: (supervisor: Supervisor) => void;
  isSupervisorLoggedIn: boolean;
  loginSupervisor: (supervisorId: string, pin?: string) => { success: boolean; error?: string };
  logoutSupervisor: () => void;
  assignComplaintToSupervisor: (
    complaintId: string,
    supervisorId: string,
    notes?: string
  ) => Promise<void>;
  supervisorMarkInProgress: (complaintId: string, notes?: string) => Promise<void>;
  supervisorResolveComplaint: (
    complaintId: string,
    afterPhotoUrl: string,
    resolutionNotes: string
  ) => Promise<void>;

  upvoteComplaint: (complaintId: string) => Promise<void>;

  rateComplaint: (complaintId: string, rating: number, feedback: string) => Promise<void>;

  fetchComplaintById: (id: string) => Promise<Complaint | null>;

  // Departments & Officers
  departments: Department[];
  toggleOfficerDuty: (deptId: string, officerId: string) => void;
  updateDepartmentSla: (deptId: string, slaHours: number) => void;

  // Notifications
  notifications: CivicNotification[];
  unreadNotifsCount: number;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;

  // Text scale & density
  textScale: TextScale;
  setTextScale: (scale: TextScale) => void;

  // Database status
  isDbConnected: boolean;

  // Quick navigation helpers
  viewComplaintDetails: (id: string) => void;
  openAdminResolutionFlow: (id: string) => void;
  resetToDemoDefaults: () => void;

  // Sequential case counting starting from 1 & restarting in 1st month
  loadSampleCases: () => void;
  resetCaseCounter: () => void;
  nextCasePreview: NextCaseInfo;
}

export type TextScale = 'tiny' | 'compact' | 'small' | 'regular';

const AppContext = createContext<AppContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'nagawara_solver_v5';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);

  const [complaints, setComplaints] = useState<Complaint[]>(() => {
    try {
      const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_complaints`);
      return saved ? JSON.parse(saved) : INITIAL_COMPLAINTS;
    } catch {
      return INITIAL_COMPLAINTS;
    }
  });

  const [departments, setDepartments] = useState<Department[]>(() => {
    try {
      const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_departments`);
      return saved ? JSON.parse(saved) : INITIAL_DEPARTMENTS;
    } catch {
      return INITIAL_DEPARTMENTS;
    }
  });

  const [notifications, setNotifications] = useState<CivicNotification[]>(() => {
    try {
      const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_notifications`);
      return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
    } catch {
      return INITIAL_NOTIFICATIONS;
    }
  });

  const [currentUser, setCurrentUser] = useState<CitizenUser>(() => {
    try {
      const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_user`);
      return saved ? JSON.parse(saved) : INITIAL_CITIZEN;
    } catch {
      return INITIAL_CITIZEN;
    }
  });

  // Session Persistence: Retrieve previously authenticated citizen, supervisor, or admin session
  const [isCitizenLoggedIn, setIsCitizenLoggedIn] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_citizen_logged_in`);
      return saved === 'true';
    } catch {
      return false;
    }
  });

  const [isSupervisorLoggedIn, setIsSupervisorLoggedIn] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_supervisor_logged_in`);
      return saved === 'true';
    } catch {
      return false;
    }
  });

  const [adminUser, setAdminUser] = useState<{ name: string; role: string; email: string } | null>(() => {
    try {
      const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_admin_user`);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // If already logged in, directly restore the citizen, supervisor, or admin workspace (do not show splash screen again!)
  const [currentView, setCurrentViewState] = useState<AppView>(() => {
    try {
      const savedAdmin = localStorage.getItem(`${LOCAL_STORAGE_KEY}_admin_user`);
      const savedSupervisor = localStorage.getItem(`${LOCAL_STORAGE_KEY}_supervisor_logged_in`);
      const savedLoggedIn = localStorage.getItem(`${LOCAL_STORAGE_KEY}_citizen_logged_in`);
      const savedView = localStorage.getItem(`${LOCAL_STORAGE_KEY}_current_view`) as AppView;

      if (savedAdmin) {
        return 'admin';
      }
      if (savedSupervisor === 'true') {
        return 'supervisor';
      }
      if (savedLoggedIn === 'true') {
        return 'citizen';
      }
      if (savedView && ['admin_login', 'supervisor_login', 'user_login'].includes(savedView)) {
        return savedView;
      }
    } catch {
      // fallback
    }
    return 'splash';
  });

  const [citizenTab, setCitizenTab] = useState<ActiveTab>('home');

  const setCurrentView = (view: AppView) => {
    if (view === 'admin') {
      const isAuthorized =
        adminUser &&
        AUTHORIZED_ADMINS.some(
          a => a.email.toLowerCase() === adminUser.email.toLowerCase()
        );
      if (!isAuthorized) {
        setAdminUser(null);
        try {
          localStorage.removeItem(`${LOCAL_STORAGE_KEY}_admin_user`);
          localStorage.setItem(`${LOCAL_STORAGE_KEY}_current_view`, 'admin_login');
        } catch {}
        setCurrentViewState('admin_login');
        return;
      }
    }
    if (view === 'supervisor') {
      const savedSupervisor = localStorage.getItem(`${LOCAL_STORAGE_KEY}_supervisor_logged_in`);
      if (!isSupervisorLoggedIn && savedSupervisor !== 'true') {
        setCurrentViewState('supervisor_login');
        try {
          localStorage.setItem(`${LOCAL_STORAGE_KEY}_current_view`, 'supervisor_login');
        } catch {}
        return;
      }
    }
    if (view === 'citizen') {
      const savedLoggedIn = localStorage.getItem(`${LOCAL_STORAGE_KEY}_citizen_logged_in`);
      if (!isCitizenLoggedIn && savedLoggedIn !== 'true') {
        setCurrentViewState('user_login');
        try {
          localStorage.setItem(`${LOCAL_STORAGE_KEY}_current_view`, 'user_login');
        } catch {}
        return;
      }
    }
    setCurrentViewState(view);
    try {
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_current_view`, view);
    } catch {}
  };

  const [adminTab, setAdminTab] = useState<AdminTab>('all_complaints');

  // Ward-22 Field Supervisors state
  const [supervisors] = useState<Supervisor[]>(DEFAULT_SUPERVISORS);
  const [activeSupervisor, setActiveSupervisorState] = useState<Supervisor>(() => {
    try {
      const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_active_supervisor`);
      if (saved) {
        const found = DEFAULT_SUPERVISORS.find(s => s.id === saved);
        if (found) return found;
      }
    } catch {
      // fallback
    }
    return DEFAULT_SUPERVISORS[0];
  });

  const setActiveSupervisor = (sup: Supervisor) => {
    setActiveSupervisorState(sup);
    try {
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_active_supervisor`, sup.id);
    } catch {
      // ignore
    }
  };

  const [selectedComplaintId, setSelectedComplaintId] = useState<string | null>(null);
  const [adminResolutionComplaintId, setAdminResolutionComplaintId] = useState<string | null>(null);
  const [isDbConnected, setIsDbConnected] = useState<boolean>(false);

  // Text scaling (defaulting to small = 12px)
  const [textScale, setTextScaleState] = useState<TextScale>(() => {
    try {
      const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_text_scale`) as TextScale;
      return saved || 'small';
    } catch {
      return 'small';
    }
  });

  const applyTextScale = (scale: TextScale) => {
    let px = '12px';
    if (scale === 'tiny') px = '10.5px';
    else if (scale === 'compact') px = '11.25px';
    else if (scale === 'small') px = '12px';
    else if (scale === 'regular') px = '13.5px';

    if (typeof document !== 'undefined') {
      document.documentElement.style.setProperty('--app-font-size', px);
    }
  };

  useEffect(() => {
    applyTextScale(textScale);
    try {
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_text_scale`, textScale);
    } catch (e) {
      console.error(e);
    }
  }, [textScale]);

  const setTextScale = (scale: TextScale) => {
    setTextScaleState(scale);
  };

  // Sync to local storage
  useEffect(() => {
    try {
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_complaints`, JSON.stringify(complaints));
    } catch (e) {
      console.error(e);
    }
  }, [complaints]);

  useEffect(() => {
    try {
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_departments`, JSON.stringify(departments));
    } catch (e) {
      console.error(e);
    }
  }, [departments]);

  useEffect(() => {
    try {
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_notifications`, JSON.stringify(notifications));
    } catch (e) {
      console.error(e);
    }
  }, [notifications]);

  useEffect(() => {
    try {
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_user`, JSON.stringify(currentUser));
    } catch (e) {
      console.error(e);
    }
  }, [currentUser]);

  // Google Sign In action
  const signInWithGoogle = async () => {
    setIsAuthLoading(true);
    try {
      const fbUser = await loginWithGoogle();
      setFirebaseUser(fbUser);
      setIsCitizenLoggedIn(true);

      // Check / load or create profile in Firestore & Cloud SQL
      const existing = await getUserProfile(fbUser.uid);
      if (existing) {
        setCurrentUser(existing);
      } else {
        const isChiefAdmin = fbUser.email?.toLowerCase() === '25shahid01khan@gmail.com';
        const newProf: CitizenUser = {
          id: fbUser.uid,
          name: fbUser.displayName || 'Civic Resident',
          email: fbUser.email || '',
          phone: fbUser.phoneNumber || '+1 (555) 234-8901',
          ward: 'Ward-22 Nagawara',
          avatar: fbUser.photoURL || undefined,
          points: 150,
          complaintsCount: 0,
          resolvedCount: 0,
          role: isChiefAdmin ? 'admin' : 'citizen',
          isGoogleUser: true,
          firebaseUid: fbUser.uid,
        };
        await saveUserProfile(newProf);
        setCurrentUser(newProf);
      }

      // Sync user to Cloud SQL database via backend API
      try {
        const idToken = await fbUser.getIdToken();
        await fetch('/api/auth/sync-user', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${idToken}`,
          },
          body: JSON.stringify({
            name: fbUser.displayName,
            email: fbUser.email,
            phone: fbUser.phoneNumber,
            ward: 'Ward-22 Nagawara',
          }),
        });
      } catch (sqlErr) {
        console.warn('Cloud SQL user sync notification:', sqlErr);
      }

      // Check admin status against the 3 authorized admins
      const matchedAdmin = AUTHORIZED_ADMINS.find(
        a => a.email.toLowerCase() === fbUser.email?.toLowerCase()
      );
      if (matchedAdmin) {
        setAdminUser({
          name: matchedAdmin.name,
          email: matchedAdmin.email,
          role: matchedAdmin.role,
        });
      } else {
        setAdminUser(null);
      }
    } catch (error) {
      console.error('Google Sign-In failed:', error);
      throw error;
    } finally {
      setIsAuthLoading(false);
    }
  };

  // Sign out Google action
  const signOutGoogle = async () => {
    setIsAuthLoading(true);
    try {
      await logoutUser();
      setFirebaseUser(null);
      setIsCitizenLoggedIn(false);
      setCurrentUser(INITIAL_CITIZEN);
      setAdminUser(null);
    } catch (error) {
      console.error('Sign-Out error:', error);
    } finally {
      setIsAuthLoading(false);
    }
  };

  // Update profile with Firestore persistence
  const updateUserProfile = async (data: Partial<CitizenUser>) => {
    const updated: CitizenUser = {
      ...currentUser,
      ...data,
    };
    setCurrentUser(updated);

    // Persist to Firestore if user is identified
    if (currentUser.id) {
      try {
        await saveUserProfile(updated);
      } catch (e) {
        console.warn('Failed to persist profile updates to Firestore:', e);
      }
    }
  };

  // Listen to Firebase Auth state changes
  useEffect(() => {
    let unsubscribeProfileSnapshot: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async fbUser => {
      setIsAuthLoading(true);
      if (fbUser) {
        setFirebaseUser(fbUser);
        setIsCitizenLoggedIn(true);

        try {
          const profile = await getUserProfile(fbUser.uid);
          if (profile) {
            setCurrentUser(profile);
          } else {
            const isChiefAdmin = fbUser.email?.toLowerCase() === '25shahid01khan@gmail.com';
            const initialProf: CitizenUser = {
              id: fbUser.uid,
              name: fbUser.displayName || 'Civic Resident',
              email: fbUser.email || '',
              phone: '+1 (555) 234-8901',
              ward: 'Ward-22 Nagawara',
              avatar: fbUser.photoURL || undefined,
              points: 150,
              complaintsCount: 0,
              resolvedCount: 0,
              role: isChiefAdmin ? 'admin' : 'citizen',
              isGoogleUser: true,
              firebaseUid: fbUser.uid,
            };
            await saveUserProfile(initialProf);
            setCurrentUser(initialProf);
          }

          // Real-time listener on user profile document in Firestore
          unsubscribeProfileSnapshot = onSnapshot(
            doc(db, 'users', fbUser.uid),
            snap => {
              if (snap.exists()) {
                const data = snap.data() as CitizenUser;
                setCurrentUser(data);
              }
            },
            err => {
              console.warn('User profile sync notification:', err);
            }
          );

          // Admin check against the 3 authorized admins
          const matchedAdmin = AUTHORIZED_ADMINS.find(
            a => a.email.toLowerCase() === fbUser.email?.toLowerCase()
          );
          if (matchedAdmin) {
            setAdminUser({
              name: matchedAdmin.name,
              email: matchedAdmin.email,
              role: matchedAdmin.role,
            });
          } else {
            setAdminUser(null);
          }
        } catch (err) {
          console.warn('Auth user sync warning:', err);
        }
      } else {
        setFirebaseUser(null);
      }
      setIsAuthLoading(false);
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeProfileSnapshot) unsubscribeProfileSnapshot();
    };
  }, []);

  // Initial connection test and database seeding
  useEffect(() => {
    let isMounted = true;
    const initializeDatabase = async () => {
      try {
        const ok = await testConnection();
        if (isMounted) setIsDbConnected(ok);

        // Check if complaints exist in Cloud SQL PostgreSQL, seed if empty
        try {
          const sqlRes = await fetch('/api/complaints');
          if (sqlRes.ok) {
            const sqlData = await sqlRes.json();
            if (sqlData.complaints && sqlData.complaints.length > 0) {
              const loaded: Complaint[] = sqlData.complaints.map((c: any) => ({
                id: c.id,
                title: c.title,
                category: c.category as ComplaintCategory,
                description: c.description,
                status: c.status as ComplaintStatus,
                priority: c.priority as PriorityLevel,
                location: {
                  lat: parseFloat(c.lat) || 13.0425,
                  lng: parseFloat(c.lng) || 77.6253,
                  address: c.address,
                  landmark: c.landmark || undefined,
                  ward: c.ward || 'Ward 22',
                },
                photoUrl: c.photoUrl,
                afterPhotoUrl: c.afterPhotoUrl || undefined,
                createdAt: c.createdAt ? new Date(c.createdAt).toISOString() : new Date().toISOString(),
                updatedAt: c.updatedAt ? new Date(c.updatedAt).toISOString() : new Date().toISOString(),
                citizenName: c.citizenName,
                citizenPhone: c.citizenPhone,
                citizenEmail: c.citizenEmail,
                isAnonymous: Boolean(c.isAnonymous),
                assignedDepartmentId: c.assignedDepartmentId || undefined,
                assignedDepartmentName: c.assignedDepartmentName || undefined,
                assignedSupervisorId: c.assignedSupervisorId || undefined,
                assignedSupervisorName: c.assignedSupervisorName || undefined,
                assignedOfficerId: c.assignedOfficerId || undefined,
                assignedOfficerName: c.assignedOfficerName || undefined,
                supervisorNotes: c.supervisorNotes || undefined,
                resolutionNotes: c.resolutionNotes || undefined,
                resolvedAt: c.resolvedAt ? new Date(c.resolvedAt).toISOString() : undefined,
                upvotes: c.upvotes ?? 0,
                timeline: typeof c.timeline === 'string' ? JSON.parse(c.timeline || '[]') : (c.timeline || []),
                citizenRating: c.citizenRating ?? undefined,
                citizenFeedback: c.citizenFeedback ?? undefined,
                caseNumber: c.caseNumber ?? undefined,
                caseMonth: c.caseMonth ?? undefined,
                caseYear: c.caseYear ?? undefined,
                caseCycle: c.caseCycle ?? undefined,
              }));
              if (isMounted) {
                setComplaints(loaded);
              }
            } else {
              // Seed initial complaints to Cloud SQL
              for (const item of INITIAL_COMPLAINTS) {
                await fetch('/api/complaints', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(item),
                }).catch(() => {});
              }
            }
          }
        } catch (err) {
          console.warn('Cloud SQL complaints query fallback:', err);
        }

        // Check if complaints exist in Firestore, seed if empty
        const path = 'complaints';
        try {
          const snapshot = await getDocs(collection(db, path));
          if (snapshot.empty) {
            // Seed initial complaints to Firestore
            for (const item of INITIAL_COMPLAINTS) {
              await setDoc(doc(db, 'complaints', item.id), item);
            }
          } else {
            const remoteComplaints: Complaint[] = [];
            snapshot.forEach(docSnap => {
              remoteComplaints.push(docSnap.data() as Complaint);
            });
            if (remoteComplaints.length > 0 && isMounted) {
              setComplaints(remoteComplaints);
            }
          }
        } catch (err) {
          console.warn('Could not read/seed initial complaints from Firestore (offline or rules restricted):', err);
        }

        // Seed or load departments
        try {
          const deptSnap = await getDocs(collection(db, 'departments'));
          if (deptSnap.empty) {
            for (const d of INITIAL_DEPARTMENTS) {
              await setDoc(doc(db, 'departments', d.id), d);
            }
          } else {
            const remoteDepts: Department[] = [];
            deptSnap.forEach(d => remoteDepts.push(d.data() as Department));
            if (remoteDepts.length > 0 && isMounted) {
              setDepartments(remoteDepts);
            }
          }
        } catch (err) {
          console.warn('Departments fallback to local state:', err);
        }
      } catch (e) {
        console.warn('Firebase init check completed with fallback:', e);
      }
    };

    initializeDatabase();
    return () => {
      isMounted = false;
    };
  }, []);

  // Admin live subscription to complaints
  useEffect(() => {
    if (currentView !== 'admin') return;

    const path = 'complaints';
    const unsubscribe = onSnapshot(
      collection(db, path),
      snapshot => {
        if (!snapshot.empty) {
          const docs: Complaint[] = [];
          snapshot.forEach(docSnap => {
            docs.push(docSnap.data() as Complaint);
          });
          // Sort with newest first
          docs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          setComplaints(docs);
        }
      },
      error => {
        handleFirestoreError(error, OperationType.LIST, path);
      }
    );

    return () => unsubscribe();
  }, [currentView]);

  const loginAdmin = (
    adminIdOrEmail: string,
    password?: string
  ): { success: boolean; error?: string } => {
    const cleanId = adminIdOrEmail.trim().toLowerCase();
    const cleanPassword = password !== undefined ? password.trim() : '';

    // STRICT: Only the DEFAULT user (25shahid01khan@gmail.com) can access. No one else can get access.
    const isDefaultAdmin =
      cleanId === DEFAULT_ADMIN.email.toLowerCase() ||
      cleanId === DEFAULT_ADMIN.adminId.toLowerCase() ||
      cleanId === 'admin@nagawarasolver.gov' ||
      cleanId === 'admin' ||
      cleanId === 'shahid' ||
      cleanId === DEFAULT_ADMIN.badgeId.toLowerCase();

    if (!isDefaultAdmin) {
      // Clear any active admin session immediately
      setAdminUser(null);
      return {
        success: false,
        error: `Access Denied: The provided Admin ID is not recognized. Access is strictly restricted to the authorized administrator.`,
      };
    }

    // Password validation (if password provided)
    const validPasswords = [
      DEFAULT_ADMIN.securityKey,
      'Nagawara@2026',
      'Admin@2026',
      'admin22',
      'Nagawara@Admin2026',
    ];

    if (password !== undefined) {
      if (!cleanPassword || !validPasswords.includes(cleanPassword)) {
        setAdminUser(null);
        return {
          success: false,
          error: `Access Denied: Incorrect password. Access is strictly restricted.`,
        };
      }
    }

    const adminData = {
      name: DEFAULT_ADMIN.name,
      role: DEFAULT_ADMIN.role,
      email: DEFAULT_ADMIN.email,
    };
    setAdminUser(adminData);
    try {
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_admin_user`, JSON.stringify(adminData));
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_current_view`, 'admin');
    } catch {}
    setCurrentViewState('admin');
    return { success: true };
  };

  const logoutAdmin = () => {
    setAdminUser(null);
    try {
      localStorage.removeItem(`${LOCAL_STORAGE_KEY}_admin_user`);
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_current_view`, 'splash');
    } catch {}
    setCurrentViewState('splash');
  };

  const loginCitizen = (name?: string, phone?: string) => {
    setIsCitizenLoggedIn(true);
    try {
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_citizen_logged_in`, 'true');
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_current_view`, 'citizen');
    } catch {}

    const updatedUser: CitizenUser = {
      ...currentUser,
      name: name?.trim() || currentUser.name,
      phone: phone?.trim() || currentUser.phone,
    };
    setCurrentUser(updatedUser);
    try {
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_user`, JSON.stringify(updatedUser));
    } catch {}
  };

  const loginWithPhone = async (phoneNumber: string, name?: string): Promise<{ success: boolean; error?: string }> => {
    const cleanPhone = phoneNumber.trim();
    const digitsOnly = cleanPhone.replace(/\D/g, '');
    if (!cleanPhone || digitsOnly.length < 8) {
      return { success: false, error: 'Please enter a valid phone number (at least 8-10 digits).' };
    }

    const cleanName = name?.trim() || currentUser.name || 'Ward-22 Resident';
    const cleanId = `cit-phone-${digitsOnly.slice(-10)}`;

    const phoneUser: CitizenUser = {
      ...currentUser,
      id: cleanId,
      name: cleanName,
      phone: cleanPhone,
      email: currentUser.email || `${digitsOnly}@nagawara.internal`,
      ward: 'Ward-22 Nagawara',
      authProvider: 'phone',
    };

    setIsCitizenLoggedIn(true);
    setCurrentUser(phoneUser);

    try {
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_citizen_logged_in`, 'true');
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_user`, JSON.stringify(phoneUser));
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_current_view`, 'citizen');
    } catch (e) {
      console.warn('Storage save error:', e);
    }

    // Persist to Firestore if available
    try {
      await saveUserProfile(phoneUser);
    } catch (e) {
      console.warn('Firestore user profile sync warning (offline/demo safe):', e);
    }

    const welcomeNotif: CivicNotification = {
      id: `notif-phone-${Date.now()}`,
      title: 'Phone Verified & Connected',
      message: `Signed in as ${cleanName} (${cleanPhone}). Permanent session saved.`,
      timestamp: new Date().toISOString(),
      type: 'civic_alert',
      isRead: false,
    };
    setNotifications(prev => [welcomeNotif, ...prev]);

    setCurrentViewState('citizen');
    setCitizenTab('home');
    return { success: true };
  };

  const logoutCitizen = () => {
    setIsCitizenLoggedIn(false);
    try {
      localStorage.removeItem(`${LOCAL_STORAGE_KEY}_citizen_logged_in`);
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_current_view`, 'splash');
    } catch {}
    setCurrentViewState('splash');
  };

  const loginSupervisor = (
    supervisorId: string,
    pin?: string
  ): { success: boolean; error?: string } => {
    const cleanId = supervisorId.trim().toLowerCase();
    const found = supervisors.find(
      s =>
        s.id.toLowerCase() === cleanId ||
        s.phone.replace(/\D/g, '') === cleanId.replace(/\D/g, '') ||
        s.badgeId.toLowerCase() === cleanId ||
        s.name.toLowerCase() === cleanId
    );
    if (!found) {
      return {
        success: false,
        error: 'Supervisor ID or Phone not recognized. Please choose from Ward-22 Field Supervisors.',
      };
    }

    if (pin && pin.trim().length > 0) {
      const cleanPin = pin.trim();
      const validPins = [
        '1234',
        '2200',
        '2201',
        '2202',
        '2203',
        '2204',
        found.badgeId.slice(-2),
        found.phone.slice(-4),
        'Nagawara@2026',
      ];
      if (!validPins.includes(cleanPin)) {
        return {
          success: false,
          error: 'Incorrect supervisor security PIN. Default is 1234 or your badge number.',
        };
      }
    }

    setActiveSupervisorState(found);
    setIsSupervisorLoggedIn(true);
    try {
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_active_supervisor`, found.id);
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_supervisor_logged_in`, 'true');
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_current_view`, 'supervisor');
    } catch {}

    setCurrentViewState('supervisor');
    return { success: true };
  };

  const logoutSupervisor = () => {
    setIsSupervisorLoggedIn(false);
    try {
      localStorage.removeItem(`${LOCAL_STORAGE_KEY}_supervisor_logged_in`);
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_current_view`, 'splash');
    } catch {}
    setCurrentViewState('splash');
  };

  const submitComplaint = async (data: {
    title: string;
    category: ComplaintCategory;
    description: string;
    priority: PriorityLevel;
    location: LocationCoordinates;
    photoUrl: string;
    isAnonymous?: boolean;
  }): Promise<string> => {
    // Generate sequential Case Number starting from 1 and restarting in 1st month (January)
    const caseInfo = getNextCaseDetails(complaints, new Date());
    const ticketId = caseInfo.id;
    const nowIso = new Date().toISOString();

    const newComplaint: Complaint = {
      id: ticketId,
      caseNumber: caseInfo.caseNumber,
      caseMonth: caseInfo.month,
      caseYear: caseInfo.year,
      caseCycle: caseInfo.cycleKey,
      title: data.title,
      category: data.category,
      description: data.description,
      status: 'submitted',
      priority: data.priority,
      location: data.location,
      photoUrl: data.photoUrl,
      createdAt: nowIso,
      updatedAt: nowIso,
      citizenName: data.isAnonymous ? 'Anonymous Citizen' : currentUser.name,
      citizenPhone: data.isAnonymous ? 'Confidential' : currentUser.phone,
      citizenEmail: data.isAnonymous ? 'hidden@civic.internal' : currentUser.email,
      isAnonymous: data.isAnonymous,
      upvotes: 1,
      timeline: [
        {
          status: 'submitted',
          timestamp: nowIso,
          title: `Complaint Registered (Case #${caseInfo.caseNumber})`,
          description: `Logged under ${data.location.ward} as Case #${caseInfo.caseNumber} (Ticket: ${ticketId}) with GPS & photo verification.`,
          updatedBy: data.isAnonymous ? 'Anonymous Citizen' : currentUser.name,
          role: 'Citizen',
        },
      ],
    };

    // Optimistic local state update
    setComplaints(prev => [newComplaint, ...prev]);

    // Persist to Cloud SQL PostgreSQL via backend API
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (firebaseUser) {
        const token = await firebaseUser.getIdToken();
        headers.Authorization = `Bearer ${token}`;
      }
      await fetch('/api/complaints', {
        method: 'POST',
        headers,
        body: JSON.stringify(newComplaint),
      });
    } catch (sqlErr) {
      console.warn('Cloud SQL complaint post warning:', sqlErr);
    }

    // Persist to Firestore database
    const docPath = `complaints/${ticketId}`;
    try {
      await setDoc(doc(db, 'complaints', ticketId), newComplaint);
    } catch (error) {
      console.warn('Firestore write warning:', error);
      handleFirestoreError(error, OperationType.CREATE, docPath);
    }

    // Update user stats & persist user points to Firestore
    const updatedUser: CitizenUser = {
      ...currentUser,
      complaintsCount: currentUser.complaintsCount + 1,
      points: currentUser.points + 50,
    };
    setCurrentUser(updatedUser);
    if (currentUser.id) {
      try {
        await saveUserProfile(updatedUser);
      } catch (e) {
        console.warn('Failed to update user score in Firestore:', e);
      }
    }

    // Trigger notification
    const newNotif: CivicNotification = {
      id: `notif-${Date.now()}`,
      complaintId: ticketId,
      title: `Case #${caseInfo.caseNumber} Registered (#${ticketId})`,
      message: `Your report "${data.title.slice(0, 35)}..." has been filed under Ward-22 as Case #${caseInfo.caseNumber}.`,
      timestamp: nowIso,
      type: 'assignment',
      isRead: false,
    };
    setNotifications(prev => [newNotif, ...prev]);

    return ticketId;
  };

  // Cloud SQL background synchronization helpers
  const patchComplaintInCloudSql = async (id: string, updates: Record<string, any>) => {
    try {
      await fetch(`/api/complaints/${encodeURIComponent(id)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
    } catch (err) {
      console.warn('Cloud SQL complaint sync notification:', err);
    }
  };

  const upvoteComplaintInCloudSql = async (id: string) => {
    try {
      await fetch(`/api/complaints/${encodeURIComponent(id)}/upvote`, {
        method: 'POST',
      });
    } catch (err) {
      console.warn('Cloud SQL upvote sync notification:', err);
    }
  };

  const verifyAndAssignComplaint = async (
    complaintId: string,
    departmentId: string,
    officerId: string,
    priority: PriorityLevel,
    notes?: string,
    supervisorId?: string
  ) => {
    const targetDept = departments.find(d => d.id === departmentId);
    const targetOfficer = targetDept?.officers.find(o => o.id === officerId);
    const targetSupervisor = supervisorId ? supervisors.find(s => s.id === supervisorId) : undefined;
    const nowIso = new Date().toISOString();

    let updatedRecord: Complaint | null = null;

    setComplaints(prev =>
      prev.map(item => {
        if (item.id !== complaintId) return item;
        const supervisorLabel = targetSupervisor ? ` & Field Supervisor ${targetSupervisor.name}` : '';
        const updatedTimeline = [
          ...item.timeline,
          {
            status: 'verified' as const,
            timestamp: nowIso,
            title: `Verified & Assigned to ${targetDept?.name || 'Department'}${supervisorLabel}`,
            description:
              notes ||
              `Assigned to field officer ${targetOfficer?.name || 'Staff'}${targetSupervisor ? ` under Supervisor ${targetSupervisor.name} (${targetSupervisor.phone})` : ''}. Priority set to ${priority.toUpperCase()}. Target SLA: ${targetDept?.slaHours || 24}h.`,
            updatedBy: adminUser?.name || 'City Operations Admin',
            role: adminUser?.role || 'Authority',
          },
        ];
        const res: Complaint = {
          ...item,
          status: 'verified',
          priority,
          assignedDepartmentId: departmentId,
          assignedDepartmentName: targetDept?.name,
          assignedOfficerId: officerId,
          assignedOfficerName: targetOfficer ? `${targetOfficer.name} (${targetOfficer.role})` : undefined,
          assignedSupervisorId: targetSupervisor ? targetSupervisor.id : item.assignedSupervisorId,
          assignedSupervisorName: targetSupervisor ? targetSupervisor.name : item.assignedSupervisorName,
          assignedSupervisorPhone: targetSupervisor ? targetSupervisor.phone : item.assignedSupervisorPhone,
          updatedAt: nowIso,
          timeline: updatedTimeline,
        };
        updatedRecord = res;
        return res;
      })
    );

    // Persist to Cloud SQL & Firestore
    if (updatedRecord) {
      const updatePayload: Record<string, any> = {
        status: 'verified',
        priority,
        assignedDepartmentId: departmentId,
        assignedDepartmentName: targetDept?.name || '',
        assignedOfficerId: officerId,
        assignedOfficerName: targetOfficer ? `${targetOfficer.name} (${targetOfficer.role})` : '',
        updatedAt: nowIso,
        timeline: (updatedRecord as Complaint).timeline,
      };
      if (targetSupervisor) {
        updatePayload.assignedSupervisorId = targetSupervisor.id;
        updatePayload.assignedSupervisorName = targetSupervisor.name;
        updatePayload.assignedSupervisorPhone = targetSupervisor.phone;
      }

      // Cloud SQL sync
      patchComplaintInCloudSql(complaintId, updatePayload);

      const docPath = `complaints/${complaintId}`;
      try {
        await updateDoc(doc(db, 'complaints', complaintId), updatePayload);
      } catch (error) {
        console.warn('Firestore update warning:', error);
        handleFirestoreError(error, OperationType.UPDATE, docPath);
      }
    }

    // Update officer task count
    setDepartments(prev =>
      prev.map(dept => {
        if (dept.id !== departmentId) return dept;
        return {
          ...dept,
          activeComplaintsCount: dept.activeComplaintsCount + 1,
          officers: dept.officers.map(off =>
            off.id === officerId ? { ...off, activeTasks: off.activeTasks + 1 } : off
          ),
        };
      })
    );

    // Notify citizen
    const newNotif: CivicNotification = {
      id: `notif-${Date.now()}`,
      complaintId,
      title: `Complaint #${complaintId} Verified`,
      message: `Assigned to ${targetDept?.name || 'Division'}${targetSupervisor ? ` under Supervisor ${targetSupervisor.name}` : ''}. Field inspection dispatched.`,
      timestamp: nowIso,
      type: 'status_change',
      isRead: false,
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const assignComplaintToSupervisor = async (
    complaintId: string,
    supervisorId: string,
    notes?: string
  ) => {
    const targetSupervisor = supervisors.find(s => s.id === supervisorId);
    if (!targetSupervisor) return;
    const nowIso = new Date().toISOString();
    let updatedRecord: Complaint | null = null;

    setComplaints(prev =>
      prev.map(item => {
        if (item.id !== complaintId) return item;
        const nextStatus = item.status === 'submitted' ? 'verified' : item.status;
        const res: Complaint = {
          ...item,
          status: nextStatus,
          assignedSupervisorId: targetSupervisor.id,
          assignedSupervisorName: targetSupervisor.name,
          assignedSupervisorPhone: targetSupervisor.phone,
          supervisorNotes: notes || item.supervisorNotes,
          updatedAt: nowIso,
          timeline: [
            ...item.timeline,
            {
              status: nextStatus,
              timestamp: nowIso,
              title: `Assigned to Supervisor ${targetSupervisor.name}`,
              description: notes || `Field assignment dispatched to ${targetSupervisor.role} (${targetSupervisor.phone}).`,
              updatedBy: adminUser?.name || 'Chief Administrator',
              role: 'Administrator',
            },
          ],
        };
        updatedRecord = res;
        return res;
      })
    );

    if (updatedRecord) {
      // Cloud SQL sync
      patchComplaintInCloudSql(complaintId, {
        assignedSupervisorId: targetSupervisor.id,
        assignedSupervisorName: targetSupervisor.name,
        assignedSupervisorPhone: targetSupervisor.phone,
        supervisorNotes: notes || '',
        status: (updatedRecord as Complaint).status,
        timeline: (updatedRecord as Complaint).timeline,
      });

      const docPath = `complaints/${complaintId}`;
      try {
        await updateDoc(doc(db, 'complaints', complaintId), {
          assignedSupervisorId: targetSupervisor.id,
          assignedSupervisorName: targetSupervisor.name,
          assignedSupervisorPhone: targetSupervisor.phone,
          supervisorNotes: notes || '',
          status: (updatedRecord as Complaint).status,
          updatedAt: nowIso,
          timeline: (updatedRecord as Complaint).timeline,
        });
      } catch (error) {
        console.warn('Firestore update warning:', error);
        handleFirestoreError(error, OperationType.UPDATE, docPath);
      }
    }

    const newNotif: CivicNotification = {
      id: `notif-${Date.now()}`,
      complaintId,
      title: `Field Supervisor Assigned: #${complaintId}`,
      message: `Supervisor ${targetSupervisor.name} has been assigned for on-site inspection and resolution.`,
      timestamp: nowIso,
      type: 'assignment',
      isRead: false,
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const supervisorMarkInProgress = async (complaintId: string, notes?: string) => {
    const nowIso = new Date().toISOString();
    let updatedRecord: Complaint | null = null;

    setComplaints(prev =>
      prev.map(item => {
        if (item.id !== complaintId) return item;
        const res: Complaint = {
          ...item,
          status: 'in_progress',
          updatedAt: nowIso,
          timeline: [
            ...item.timeline,
            {
              status: 'in_progress' as const,
              timestamp: nowIso,
              title: `Supervisor ${activeSupervisor.name} Commenced Work`,
              description: notes || `Supervisor ${activeSupervisor.name} arrived at the location and commenced on-site repair operations.`,
              updatedBy: `${activeSupervisor.name} (Field Supervisor)`,
              role: 'Supervisor',
            },
          ],
        };
        updatedRecord = res;
        return res;
      })
    );

    if (updatedRecord) {
      // Cloud SQL sync
      patchComplaintInCloudSql(complaintId, {
        status: 'in_progress',
        timeline: (updatedRecord as Complaint).timeline,
      });

      const docPath = `complaints/${complaintId}`;
      try {
        await updateDoc(doc(db, 'complaints', complaintId), {
          status: 'in_progress',
          updatedAt: nowIso,
          timeline: (updatedRecord as Complaint).timeline,
        });
      } catch (error) {
        console.warn('Firestore update warning:', error);
        handleFirestoreError(error, OperationType.UPDATE, docPath);
      }
    }

    const newNotif: CivicNotification = {
      id: `notif-${Date.now()}`,
      complaintId,
      title: `Supervisor Active On-Site: #${complaintId}`,
      message: `Supervisor ${activeSupervisor.name} has commenced work at the site.`,
      timestamp: nowIso,
      type: 'status_change',
      isRead: false,
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const supervisorResolveComplaint = async (
    complaintId: string,
    afterPhotoUrl: string,
    resolutionNotes: string
  ) => {
    const nowIso = new Date().toISOString();
    let updatedRecord: Complaint | null = null;

    setComplaints(prev =>
      prev.map(item => {
        if (item.id !== complaintId) return item;
        const res: Complaint = {
          ...item,
          status: 'resolved',
          afterPhotoUrl,
          resolutionNotes,
          resolvedAt: nowIso,
          updatedAt: nowIso,
          timeline: [
            ...item.timeline,
            {
              status: 'resolved' as const,
              timestamp: nowIso,
              title: `Resolved On-Site by Supervisor ${activeSupervisor.name}`,
              description: resolutionNotes || `Repairs completed by Supervisor ${activeSupervisor.name}. After-work photo uploaded as verified proof.`,
              updatedBy: `${activeSupervisor.name} (Ward-22 Field Supervisor)`,
              role: 'Supervisor',
            },
          ],
        };
        updatedRecord = res;
        return res;
      })
    );

    if (updatedRecord) {
      // Cloud SQL sync
      patchComplaintInCloudSql(complaintId, {
        status: 'resolved',
        afterPhotoUrl,
        resolutionNotes,
        resolvedAt: nowIso,
        timeline: (updatedRecord as Complaint).timeline,
      });

      const docPath = `complaints/${complaintId}`;
      try {
        await updateDoc(doc(db, 'complaints', complaintId), {
          status: 'resolved',
          afterPhotoUrl,
          resolutionNotes,
          resolvedAt: nowIso,
          updatedAt: nowIso,
          timeline: (updatedRecord as Complaint).timeline,
        });
      } catch (error) {
        console.warn('Firestore update warning:', error);
        handleFirestoreError(error, OperationType.UPDATE, docPath);
      }
    }

    const newNotif: CivicNotification = {
      id: `notif-${Date.now()}`,
      complaintId,
      title: `Case #${complaintId} Resolved by Supervisor`,
      message: `Supervisor ${activeSupervisor.name} has marked your issue resolved with photo proof. Thank you for making Nagawara cleaner and safer!`,
      timestamp: nowIso,
      type: 'resolved',
      isRead: false,
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const markInProgress = async (complaintId: string, notes?: string) => {
    const nowIso = new Date().toISOString();
    let updatedRecord: Complaint | null = null;

    setComplaints(prev =>
      prev.map(item => {
        if (item.id !== complaintId) return item;
        const res: Complaint = {
          ...item,
          status: 'in_progress',
          updatedAt: nowIso,
          timeline: [
            ...item.timeline,
            {
              status: 'in_progress' as const,
              timestamp: nowIso,
              title: 'Work In Progress On-Site',
              description: notes || 'Field crew on-site with required machinery and repair materials.',
              updatedBy: item.assignedOfficerName || adminUser?.name || 'Field Officer',
              role: 'Field Crew',
            },
          ],
        };
        updatedRecord = res;
        return res;
      })
    );

    if (updatedRecord) {
      // Cloud SQL sync
      patchComplaintInCloudSql(complaintId, {
        status: 'in_progress',
        timeline: (updatedRecord as Complaint).timeline,
      });

      const docPath = `complaints/${complaintId}`;
      try {
        await updateDoc(doc(db, 'complaints', complaintId), {
          status: 'in_progress',
          updatedAt: nowIso,
          timeline: (updatedRecord as Complaint).timeline,
        });
      } catch (error) {
        console.warn('Firestore update warning:', error);
        handleFirestoreError(error, OperationType.UPDATE, docPath);
      }
    }

    const newNotif: CivicNotification = {
      id: `notif-${Date.now()}`,
      complaintId,
      title: `Field Work Underway: #${complaintId}`,
      message: `City field crew is actively repairing the reported issue on site.`,
      timestamp: nowIso,
      type: 'status_change',
      isRead: false,
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const markResolved = async (
    complaintId: string,
    afterPhotoUrl: string,
    resolutionNotes: string
  ) => {
    const nowIso = new Date().toISOString();
    let updatedRecord: Complaint | null = null;

    setComplaints(prev =>
      prev.map(item => {
        if (item.id !== complaintId) return item;
        const res: Complaint = {
          ...item,
          status: 'resolved',
          afterPhotoUrl,
          resolutionNotes,
          resolvedAt: nowIso,
          updatedAt: nowIso,
          timeline: [
            ...item.timeline,
            {
              status: 'resolved' as const,
              timestamp: nowIso,
              title: 'Resolved & After-Photo Uploaded',
              description: resolutionNotes || 'Work inspected, validated, and signed off by city inspector.',
              updatedBy: item.assignedOfficerName || adminUser?.name || 'Lead Officer',
              role: 'Inspector',
            },
          ],
        };
        updatedRecord = res;
        return res;
      })
    );

    if (updatedRecord) {
      // Cloud SQL sync
      patchComplaintInCloudSql(complaintId, {
        status: 'resolved',
        afterPhotoUrl,
        resolutionNotes,
        resolvedAt: nowIso,
        timeline: (updatedRecord as Complaint).timeline,
      });

      const docPath = `complaints/${complaintId}`;
      try {
        await updateDoc(doc(db, 'complaints', complaintId), {
          status: 'resolved',
          afterPhotoUrl,
          resolutionNotes,
          resolvedAt: nowIso,
          updatedAt: nowIso,
          timeline: (updatedRecord as Complaint).timeline,
        });
      } catch (error) {
        console.warn('Firestore update warning:', error);
        handleFirestoreError(error, OperationType.UPDATE, docPath);
      }
    }

    // Update user stats in Firestore
    const updatedUser: CitizenUser = {
      ...currentUser,
      resolvedCount: currentUser.resolvedCount + 1,
      points: currentUser.points + 100,
    };
    setCurrentUser(updatedUser);
    if (currentUser.id) {
      try {
        await saveUserProfile(updatedUser);
      } catch (e) {
        console.warn('Failed to update resolved user score in Firestore:', e);
      }
    }

    // Trigger citizen notification
    const newNotif: CivicNotification = {
      id: `notif-${Date.now()}`,
      complaintId,
      title: `Complaint #${complaintId} Resolved!`,
      message: `Your reported civic issue has been fixed and proof of resolution photo has been uploaded. Check the tracker!`,
      timestamp: nowIso,
      type: 'resolved',
      isRead: false,
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const upvoteComplaint = async (complaintId: string) => {
    let nextUpvotes = 1;
    setComplaints(prev =>
      prev.map(item => {
        if (item.id === complaintId) {
          nextUpvotes = item.upvotes + 1;
          return { ...item, upvotes: nextUpvotes };
        }
        return item;
      })
    );

    // Sync to Cloud SQL and Firestore
    upvoteComplaintInCloudSql(complaintId);

    try {
      await updateDoc(doc(db, 'complaints', complaintId), {
        upvotes: nextUpvotes,
      });
    } catch (e) {
      console.warn('Upvote sync notice:', e);
    }
  };

  const rateComplaint = async (complaintId: string, rating: number, feedback: string) => {
    setComplaints(prev =>
      prev.map(item =>
        item.id === complaintId
          ? { ...item, citizenRating: rating, citizenFeedback: feedback }
          : item
      )
    );

    // Sync to Cloud SQL and Firestore
    patchComplaintInCloudSql(complaintId, {
      citizenRating: rating,
      citizenFeedback: feedback,
    });

    try {
      await updateDoc(doc(db, 'complaints', complaintId), {
        citizenRating: rating,
        citizenFeedback: feedback,
      });
    } catch (e) {
      console.warn('Rating sync notice:', e);
    }
  };

  const fetchComplaintById = useCallback(async (id: string): Promise<Complaint | null> => {
    if (!id) return null;
    const cleanId = id.trim().toUpperCase();

    // 1. Check local complaints first with flexible matching (supports "1", "CP-1", "#1", "Case 1")
    const local = complaints.find(c => matchesTicketQuery(c, cleanId));
    if (local) return local;

    // 2. Query Cloud SQL PostgreSQL via backend API
    try {
      const sqlRes = await fetch(`/api/complaints/${encodeURIComponent(cleanId)}`);
      if (sqlRes.ok) {
        const sqlData = await sqlRes.json();
        if (sqlData.complaint) {
          const c = sqlData.complaint;
          const formatted: Complaint = {
            id: c.id,
            title: c.title,
            category: c.category as ComplaintCategory,
            description: c.description,
            status: c.status as ComplaintStatus,
            priority: c.priority as PriorityLevel,
            location: {
              lat: parseFloat(c.lat) || 13.0425,
              lng: parseFloat(c.lng) || 77.6253,
              address: c.address,
              landmark: c.landmark || undefined,
              ward: c.ward || 'Ward 22',
            },
            photoUrl: c.photoUrl,
            afterPhotoUrl: c.afterPhotoUrl || undefined,
            createdAt: c.createdAt ? new Date(c.createdAt).toISOString() : new Date().toISOString(),
            updatedAt: c.updatedAt ? new Date(c.updatedAt).toISOString() : new Date().toISOString(),
            citizenName: c.citizenName,
            citizenPhone: c.citizenPhone,
            citizenEmail: c.citizenEmail,
            isAnonymous: Boolean(c.isAnonymous),
            assignedDepartmentId: c.assignedDepartmentId || undefined,
            assignedDepartmentName: c.assignedDepartmentName || undefined,
            assignedSupervisorId: c.assignedSupervisorId || undefined,
            assignedSupervisorName: c.assignedSupervisorName || undefined,
            assignedOfficerId: c.assignedOfficerId || undefined,
            assignedOfficerName: c.assignedOfficerName || undefined,
            supervisorNotes: c.supervisorNotes || undefined,
            resolutionNotes: c.resolutionNotes || undefined,
            resolvedAt: c.resolvedAt ? new Date(c.resolvedAt).toISOString() : undefined,
            upvotes: c.upvotes ?? 0,
            timeline: typeof c.timeline === 'string' ? JSON.parse(c.timeline || '[]') : (c.timeline || []),
            citizenRating: c.citizenRating ?? undefined,
            citizenFeedback: c.citizenFeedback ?? undefined,
            caseNumber: c.caseNumber ?? undefined,
            caseMonth: c.caseMonth ?? undefined,
            caseYear: c.caseYear ?? undefined,
            caseCycle: c.caseCycle ?? undefined,
          };
          setComplaints(prev => {
            if (prev.some(item => item.id === formatted.id)) return prev;
            return [formatted, ...prev];
          });
          return formatted;
        }
      }
    } catch (e) {
      // fallback
    }

    // 3. Fetch from Firestore using cleanId or CP-{numeric} candidate
    try {
      const candidates = [cleanId];
      const numeric = cleanId.replace(/^#/, '').replace(/^CASE[- _]?/i, '').replace(/^CP[- _]?/i, '').trim();
      if (numeric && !cleanId.startsWith('CP-')) {
        candidates.push(`CP-${numeric}`);
      }

      for (const idToTry of candidates) {
        const snap = await getDoc(doc(db, 'complaints', idToTry));
        if (snap.exists()) {
          const data = snap.data() as Complaint;
          setComplaints(prev => {
            if (prev.some(c => c.id === data.id)) return prev;
            return [data, ...prev];
          });
          return data;
        }
      }
    } catch (error) {
      console.warn(`Error fetching ticket ${cleanId} from Firestore:`, error);
    }
    return null;
  }, [complaints]);

  const toggleOfficerDuty = (deptId: string, officerId: string) => {
    setDepartments(prev =>
      prev.map(d =>
        d.id === deptId
          ? {
              ...d,
              officers: d.officers.map(o =>
                o.id === officerId ? { ...o, isOnDuty: !o.isOnDuty } : o
              ),
            }
          : d
      )
    );
  };

  const updateDepartmentSla = (deptId: string, slaHours: number) => {
    setDepartments(prev =>
      prev.map(d => (d.id === deptId ? { ...d, slaHours } : d))
    );
  };

  const markNotificationRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const markAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const viewComplaintDetails = (id: string) => {
    setSelectedComplaintId(id);
  };

  const openAdminResolutionFlow = (id: string) => {
    setAdminResolutionComplaintId(id);
  };

  const resetToDemoDefaults = () => {
    setComplaints(INITIAL_COMPLAINTS);
    setDepartments(INITIAL_DEPARTMENTS);
    setNotifications(INITIAL_NOTIFICATIONS);
    setCurrentUser(INITIAL_CITIZEN);
  };

  const loadSampleCases = () => {
    setComplaints(SAMPLE_COMPLAINTS);
  };

  const resetCaseCounter = () => {
    // Resets active complaints list so the case counter starts fresh at Case #1
    setComplaints([]);
    try {
      localStorage.removeItem(`${LOCAL_STORAGE_KEY}_complaints`);
    } catch (e) {
      console.warn('Error clearing complaints local storage:', e);
    }
  };

  // Live preview of next Case number (starts from 1, restarts in 1st month)
  const nextCasePreview = getNextCaseDetails(complaints, new Date());

  const unreadNotifsCount = notifications.filter(n => !n.isRead).length;

  return (
    <AppContext.Provider
      value={{
        currentView,
        setCurrentView,
        citizenTab,
        setCitizenTab,
        adminTab,
        setAdminTab,
        firebaseUser,
        isAuthLoading,
        signInWithGoogle,
        signOutGoogle,
        isCitizenLoggedIn,
        setIsCitizenLoggedIn,
        currentUser,
        setCurrentUser,
        updateUserProfile,
        adminUser,
        loginAdmin,
        logoutAdmin,
        loginCitizen,
        loginWithPhone,
        logoutCitizen,
        complaints,
        selectedComplaintId,
        setSelectedComplaintId,
        adminResolutionComplaintId,
        setAdminResolutionComplaintId,
        submitComplaint,
        verifyAndAssignComplaint,
        markInProgress,
        markResolved,
        supervisors,
        activeSupervisor,
        setActiveSupervisor,
        isSupervisorLoggedIn,
        loginSupervisor,
        logoutSupervisor,
        assignComplaintToSupervisor,
        supervisorMarkInProgress,
        supervisorResolveComplaint,
        upvoteComplaint,
        rateComplaint,
        fetchComplaintById,
        departments,
        toggleOfficerDuty,
        updateDepartmentSla,
        notifications,
        unreadNotifsCount,
        markNotificationRead,
        markAllNotificationsRead,
        viewComplaintDetails,
        openAdminResolutionFlow,
        resetToDemoDefaults,
        loadSampleCases,
        resetCaseCounter,
        nextCasePreview,
        textScale,
        setTextScale,
        isDbConnected,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
