// Auth
export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignUpRequest {
  subName: string;
  name: string;
  email: string;
  password: string;
  mobile: string;
  callingCode: string;
  countryCode: string;
  referBy?: string;
}

// SignUp returns { authToken } directly (no ApiResponse wrapper)
export interface SignUpResponse {
  authToken: string;
}

export interface EmailExistResponse {
  isUserExist: boolean;
}

export interface EmailExistRequest {
  email: string;
}

// Server wraps all responses in: { error: boolean, status: number, data: T }
export interface ApiResponse<T> {
  error: boolean;
  status: number;
  data: T;
}

export interface AuthData {
  authToken: string;
}

export type AuthResponse = ApiResponse<AuthData>;

// Gym Profile — matches GET /subscriber response.data
export interface GymAdmin {
  name: string;
  email: string;
  _id: string;
  createdAt?: string;
  languageCode?: string;
  emailVerified?: boolean;
}

export interface GymProfile {
  _id: string;
  subID?: string;
  subName: string;
  subLogo?: string;
  name: string;
  email: string;
  mobile?: string;
  callingCode?: string;
  countryCode?: string;
  emailVerified?: boolean;
  languageCode?: string;
  currencyCode?: string;
  referralCode?: number;
  smsCount?: number;
  totalPackage?: number;
  totalService?: number;
  totalPtPlan?: number;
  isAdmin?: boolean;
  isDeleted?: boolean;
  admin?: GymAdmin;
  adminUserID?: string;
  userID?: string;
  subscriptionExp?: string;
  isTrialSubscription?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// Packages
export interface Package {
  _id: string;
  planId?: string;
  name: string;
  price: number;
  month?: number | null;
  days?: number | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface PackageCreateRequest {
  name: string;
  price: number | string;
  month?: number | null;
  days?: number | null;
}

export interface PackageEditRequest extends PackageCreateRequest {
  packageID: string;
}

// Batches
export interface Batch {
  _id: string;
  name: string;
  batchLimit: number;
  startTime: string;
  endTime: string;
  currentMember: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface BatchRequest {
  name: string;
  batchLimit: number;
  startTime: string;
  endTime: string;
}

// Services
export interface Service {
  _id: string;
  name: string;
  price: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ServiceRequest {
  name: string;
  price: number | string;
}

// Members — matches GET /member/:id detail response
export interface Member {
  _id: string;
  name: string;
  email?: string;
  mobile?: string;
  callingCode?: string;
  countryCode?: string;
  gender?: string;
  dob?: string;
  address?: string;
  photo?: string;
  membershipStatus?: boolean;
  membershipId?: number;
  batchId?: string;
  joiningDate?: string;
  membershipExpiryDate?: string;
  membershipCreatedDate?: string;
  pendingAmount?: number;
  packages?: MemberPackage[];
  services?: MemberService[];
  ptPlans?: MemberPtPlan[];
  notes?: string;
  aadharNumber?: string;
  occupation?: string;
  biometricId?: string;
  isFingerprintRegistered?: boolean;
  measurement?: MemberMeasurement[];
  batch?: MemberBatch;
  totalPackage?: number;
  totalService?: number;
  totalPTPlans?: number;
  isDeleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface MemberPackage {
  _id: string;
  name: string;
  totalAmount: number;
  totalAfterDiscount?: number;
  paid: number;
  pendingAmount: number;
  purchaseDate: string;
  expiryDate: string;
  discount?: number;
  discountType?: string;
  admissionFees?: number;
  comments?: { text: string; _id?: string; createdAt?: string }[];
  invoices?: MemberInvoice[];
  createdAt?: string;
  updatedAt?: string;
}

export interface MemberInvoice {
  _id: string;
  invoiceNumber: string;
  paymentDate: string;
  planName: string;
  totalAmount: number;
  paidAmount: number;
  pendingAmount: number;
  memberName: string;
  planType?: string;
}

export interface MemberService {
  _id: string;
  name: string;
  price: number;
  totalAmount?: number;
  totalAfterDiscount?: number;
  paid?: number;
  pendingAmount?: number;
  purchaseDate?: string;
  expiryDate?: string;
  discount?: number;
  discountType?: string;
  comments?: { text: string; _id?: string; createdAt?: string }[];
}

export interface MemberPtPlan {
  _id: string;
  name: string;
  totalAmount: number;
  totalAfterDiscount?: number;
  paid?: number;
  pendingAmount?: number;
  purchaseDate?: string;
  expiryDate?: string;
  totalSessions?: number;
  completedSessions?: number;
  discount?: number;
  discountType?: string;
  admissionFees?: number;
  comments?: { text: string; _id?: string; createdAt?: string }[];
  invoices?: MemberInvoice[];
  freezeStartDate?: string;
  freezeEndDate?: string;
  freezeStatus?: string;
  freezeReason?: string;
}

export interface MeasurementItem {
  type: string;
  value: string;
}

export interface MemberMeasurement {
  _id: string;
  date: string;
  measurement: MeasurementItem[];
}

export interface MemberBatch {
  _id: string;
  name: string;
  batchLimit: number;
  startTime: string;
  endTime: string;
  currentMember: number;
}

export interface AttendanceRecord {
  date: string;
  punchInAt?: string;
  punchOutAt?: string;
}

// Member prerequisite — GET /member/prerequisite
export interface MemberPrerequisite {
  packages: Package[];
  batch: Batch[];
  membershipId: number;
}

// Add member request body
export interface AddMemberRequest {
  name: string;
  gender: string;
  email?: string;
  mobile?: string;
  countryCode?: string;
  callingCode?: string;
  address?: string;
  dob?: string | null;
  notes?: string;
  membershipId?: string;
  aadharNumber?: string;
  occupation?: string;
  dateOfJoing?: string | null;
  paid?: string;
  discount?: number | null;
  discountType?: string;
  comment?: string;
  paymentDate?: string | null;
  paymentMethod?: string;
  admissionFees?: string;
  packageID?: string;
  batchId?: string;
  packageDetail?: {
    totalAmount: number;
    paid: number;
    purchaseDate: string;
    expiryDate: string;
    isActive: boolean;
    name: string;
    comments?: { text: string }[];
    discount?: number | null;
    discountType?: string;
    pendingAmount: number;
    totalAfterDiscount: number;
    admissionFees?: string;
  };
}

export interface MemberStats {
  totalMembers: number;
  activeMembers: number;
  inactiveMembers: number;
  expiringMembers: number;
  expiredMembers: number;
  newJoinings?: number;
}

export interface CollectionStats {
  totalCollection: number;
  totalDue: number;
  todayCollection: number;
}

export interface MemberListParams {
  startIndex: number;
  query?: string;
  packageName?: string;
  memberContext?: string;
  gender?: string;
  batchId?: string;
  orderBy?: string;
  includeDeleted?: boolean;
}

// Payments
export interface Payment {
  _id: string;
  paidAmount: number;
  paymentDate: string;
  paymentMethod?: string;
}

// Visitors
export interface Visitor {
  _id: string;
  name: string;
  mobile?: string;
  email?: string;
  leadStatus?: string;
  createdAt?: string;
}

// Expenses
export interface Expense {
  _id: string;
  title: string;
  amount: number;
  category?: string;
  date: string;
  description?: string;
}

// Dashboard Analytics
export interface AnalyticsStat {
  name: string;
  count: number;
  type: string;
  icon: string;
  iconColor?: string;
  isCurrency: boolean;
}

export interface AnalyticsSection {
  header: string;
  child: AnalyticsStat[];
}

export type AnalyticsResponse = ApiResponse<AnalyticsSection[]>;

// Paginated response
export interface PaginatedResponse<T> {
  data: T[];
  totalCount: number;
}
