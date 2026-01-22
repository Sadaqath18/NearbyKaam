export enum UserRole {
  WORKER = "WORKER",
  EMPLOYER = "EMPLOYER",
  ADMIN = "ADMIN",
}

export enum JobCategory {
  HOTEL = "HOTEL",
  SHOP = "SHOP",
  GARAGE = "GARAGE",
  DELIVERY = "DELIVERY",
  CONSTRUCTION = "CONSTRUCTION",
  HOUSE_HELP = "HOUSE_HELP",
  SECURITY = "SECURITY",
  OTHER = "OTHER",
}

export interface Location {
  lat: number;
  lng: number;
  address?: string;
  state?: string;
  city?: string;
  pincode?: string;
  source?: "GPS" | "NETWORK" | "MANUAL";
}

export interface ContactInfo {
  callNumber: string;
  whatsappNumber: string;
}

export interface ShopPhoto {
  url: string;
  uploadedAt: string;
}

export type JobStatus =
  | "ACTIVE"
  | "EXPIRED"
  | "PENDING_APPROVAL"
  | "REJECTED"
  | "APPROVED"
  | "PAUSED";
export type SalaryType = "DAY" | "MONTH";

export interface Job {
  id: string;
  title: string;
  jobRole?: string;
  category: JobCategory;
  industry?: string;
  employerFirstName?: string;
  employerId: string;
  employerName: string;
  ownerName?: string;
  shopName?: string;
  description?: string;
  contact: ContactInfo;
  shopPhoto: ShopPhoto | null;
  location: Location;
  distance?: number;
  salaryAmount: string;
  salaryType: SalaryType;
  isVerified: boolean;
  isPromoted: boolean;
  isReported?: boolean;
  status: JobStatus;
  isLive: boolean;
  approvedAt?: string;
  approvedBy?: string;
  callCount: number;
  whatsappCount: number;
  createdAt: string;
  expiryDays: number;
  adminNote?: string;
  experienceLevel?: string;
  employmentType?: string;
  workMode?: string;
}

export interface Application {
  id: string;
  jobId: string;
  workerId: string;
  workerName: string;
  workerPhone: string;
  appliedAt: string;
  workerProfile: WorkerProfile;
}

export interface EmployerProfile {
  firstName: string;
  phone: string;
  shopName: string;
  industry: string;
  location?: Location | null;
  shopPhoto: ShopPhoto | null;
  createdAt: string;
  isVerified?: boolean;

  expectedWageType?: "DAILY" | "MONTHLY";
}

export interface User {
  phone: string;
  role: UserRole;
  name?: string;
  isAuthenticated: boolean;
  profileCompleted: boolean;
  isBlocked?: boolean;
  isShadowBanned?: boolean;
  stateAssignment?: string[];
  cityAssignment?: string[];
  permissions?: AdminPermission[];
  workerProfile?: WorkerProfile;
  employerProfile?: EmployerProfile;
}

export enum AdminPermission {
  FULL_ACCESS = "FULL_ACCESS",
  JOB_MODERATION = "JOB_MODERATION",
  EMPLOYER_VERIFICATION = "EMPLOYER_VERIFICATION",
  SAFETY_REPORTS = "SAFETY_REPORTS",
  USER_MANAGEMENT = "USER_MANAGEMENT",
}

export interface LogEntry {
  id: string;
  adminId: string;
  adminName: string;
  action: string;
  entityType: "JOB" | "EMPLOYER" | "WORKER" | "ADMIN" | "SYSTEM";
  entityId: string;
  timestamp: string;
  details: string;
}

export interface WorkerResume {
  audioUrl?: string | null;
  documentUrl?: string | null;
  documentName?: string | null;
  hasAudio: boolean;
  hasDocument: boolean;
}

export interface WorkerProfile {
  name: string;
  phone: string;
  email?: string;
  jobType: JobCategory;
  preferredJobTitle: string;
  expectedSalary?: number;
  expectedSalaryType?: "DAILY" | "MONTHLY";

  location: Location | null;
  resume: WorkerResume;
  createdAt: string;
}

export interface Language {
  code: string;
  name: string;
  nativeName: string;
}

export type AppLanguage = string;

export interface VoiceSearchFilters {
  category?: JobCategory;
  keyword?: string;
  intentSummary: string;
}
