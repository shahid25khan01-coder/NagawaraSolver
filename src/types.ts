export type ComplaintCategory =
  | 'roads'
  | 'streetlights'
  | 'sanitation'
  | 'water'
  | 'parks'
  | 'traffic';

export type ComplaintStatus =
  | 'submitted'
  | 'verified'
  | 'in_progress'
  | 'resolved';

export type PriorityLevel = 'low' | 'medium' | 'high' | 'urgent';

export interface LocationCoordinates {
  lat: number;
  lng: number;
  address: string;
  landmark?: string;
  ward: string;
}

export interface StatusTimelineEvent {
  status: ComplaintStatus;
  timestamp: string;
  title: string;
  description: string;
  updatedBy: string;
  role?: string;
}

export interface Complaint {
  id: string; // e.g., 'CP-8492'
  title: string;
  category: ComplaintCategory;
  description: string;
  status: ComplaintStatus;
  priority: PriorityLevel;
  location: LocationCoordinates;
  photoUrl: string;
  afterPhotoUrl?: string;
  createdAt: string;
  updatedAt: string;
  citizenName: string;
  citizenPhone: string;
  citizenEmail: string;
  isAnonymous?: boolean;
  assignedDepartmentId?: string;
  assignedDepartmentName?: string;
  assignedOfficerId?: string;
  assignedOfficerName?: string;
  assignedSupervisorId?: string;
  assignedSupervisorName?: string;
  assignedSupervisorPhone?: string;
  supervisorNotes?: string;
  resolutionNotes?: string;
  resolvedAt?: string;
  upvotes: number;
  timeline: StatusTimelineEvent[];
  citizenRating?: number;
  citizenFeedback?: string;
  caseNumber?: number; // Sequential case counter starting from 1
  caseMonth?: number;  // 1-12
  caseYear?: number;   // e.g. 2026
  caseCycle?: string;  // e.g. '2026' or '2027-01'
}

export interface Department {
  id: string;
  name: string;
  code: string;
  category: ComplaintCategory;
  headName: string;
  activeStaffCount: number;
  slaHours: number;
  activeComplaintsCount: number;
  resolvedComplaintsCount: number;
  officers: Officer[];
}

export interface Officer {
  id: string;
  name: string;
  departmentId: string;
  role: string;
  phone: string;
  isOnDuty: boolean;
  activeTasks: number;
}

export interface CivicNotification {
  id: string;
  complaintId?: string;
  title: string;
  message: string;
  timestamp: string;
  type: 'status_change' | 'assignment' | 'resolved' | 'civic_alert';
  isRead: boolean;
}

export interface CitizenUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  ward: string;
  avatar?: string;
  points: number;
  complaintsCount: number;
  resolvedCount: number;
  role?: 'citizen' | 'admin';
  isGoogleUser?: boolean;
  firebaseUid?: string;
  authProvider?: 'phone' | 'google' | 'guest';
}

export type ActiveTab =
  | 'home'
  | 'report'
  | 'track'
  | 'profile';

export type AdminTab =
  | 'all_complaints'
  | 'live_map'
  | 'departments'
  | 'reports';

export interface AuthorizedAdmin {
  email: string;
  adminId: string;
  name: string;
  role: string;
  department: string;
  badgeId: string;
  avatarInitials: string;
  securityKey: string;
}

export const DEFAULT_ADMIN: AuthorizedAdmin = {
  email: '25shahid01khan@gmail.com',
  adminId: '25shahid01khan@gmail.com',
  name: 'Shahid Khan',
  role: 'Chief Administrator - Nagawara Ward-22',
  department: 'Ward-22 Nagawara Executive Command',
  badgeId: 'W22-CHIEF-01',
  avatarInitials: 'SK',
  securityKey: 'Nagawara@Admin2026',
};

// ONLY the single default administrator has access
export const AUTHORIZED_ADMINS: AuthorizedAdmin[] = [DEFAULT_ADMIN];

export interface Supervisor {
  id: string; // e.g. 'SUP-W22-01'
  name: string;
  role: string;
  department: string;
  phone: string;
  badgeId: string;
  avatarInitials: string;
  category: ComplaintCategory;
}

export const DEFAULT_SUPERVISORS: Supervisor[] = [
  {
    id: 'SUP-W22-01',
    name: 'Imran Khan',
    role: 'Ward-22 Senior Field Supervisor - Road & Infrastructure',
    department: 'BBMP Nagawara Sub-division',
    phone: '+91 98450 12341',
    badgeId: 'W22-SUP-01',
    avatarInitials: 'IK',
    category: 'roads',
  },
  {
    id: 'SUP-W22-02',
    name: 'Ramesh Babu',
    role: 'Ward-22 Field Supervisor - Electrical & Streetlights',
    department: 'BESCOM Nagawara Field Unit',
    phone: '+91 98450 23452',
    badgeId: 'W22-SUP-02',
    avatarInitials: 'RB',
    category: 'streetlights',
  },
  {
    id: 'SUP-W22-03',
    name: 'Mohammed Farooq',
    role: 'Ward-22 Field Supervisor - Sanitation & Solid Waste',
    department: 'BBMP Health & Solid Waste Management',
    phone: '+91 98450 34563',
    badgeId: 'W22-SUP-03',
    avatarInitials: 'MF',
    category: 'sanitation',
  },
  {
    id: 'SUP-W22-04',
    name: 'Anand Kumar',
    role: 'Ward-22 Field Supervisor - Water Supply & Drainage',
    department: 'BWSSB Nagawara Service Station',
    phone: '+91 98450 45674',
    badgeId: 'W22-SUP-04',
    avatarInitials: 'AK',
    category: 'water',
  },
];

