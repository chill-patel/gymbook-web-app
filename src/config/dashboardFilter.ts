export const dashboardFilter = {
  todayCollection: 'today_collection',
  totalCollection: 'total_collection',
  dueAmount: 'due_amount',
  memberWhoseMembershipExpire: 'memberWhoseMembershipExpire',
  memberWhoseMembershipIsActive: 'memberWhoseMembershipIsActive',
  todayAttendance: 'today_attendance',
  memberTodayBirthday: 'memberTodayBirthday',
  membershipExpireToday: 'membershipExpireToday',
  membershipExpireInOneToThreeDays: 'membershipExpireInOneToThreeDays',
  membershipExpireInFourtoSevenDays: 'membershipExpireInFourtoSevenDays',
  membershipExpireInSevenToFifteenDays: 'membershipExpireInSevenToFifteenDays',
  currentMonthPTPlanDueAmount: 'currentMonthPTPlanDueAmount',
  totalPTPlanDueAmount: 'totalPTPlanDueAmount',
  totalRegUser: 'totalRegUser',
  getBlockUser: 'getBlockUser',
  collectionCurrentMonth: 'collectionCurrentMonth',
  collectionLastMonth: 'collectionLastMonth',
  currentMonthDueAmount: 'currentMonthDueAmount',
  currentMonthAdmissionFees: 'currentMonthAdmissionFees',
  totalAdmissionFees: 'totalAdmissionFees',
  biometricRegisterMember: 'biometric_register_member',
} as const;

// Dashboard type → web route path
export const reportMapping: Record<string, string> = {
  [dashboardFilter.todayCollection]: '/reports/sales',
  [dashboardFilter.totalCollection]: '/reports/sales',
  [dashboardFilter.collectionCurrentMonth]: '/reports/sales',
  [dashboardFilter.collectionLastMonth]: '/reports/sales',

  [dashboardFilter.dueAmount]: '/reports/plan-due',
  [dashboardFilter.currentMonthDueAmount]: '/reports/plan-due',

  [dashboardFilter.currentMonthPTPlanDueAmount]: '/reports/pt-plan-due',
  [dashboardFilter.totalPTPlanDueAmount]: '/reports/pt-plan-due',

  [dashboardFilter.currentMonthAdmissionFees]: '/reports/admission',
  [dashboardFilter.totalAdmissionFees]: '/reports/admission',

  [dashboardFilter.todayAttendance]: '/reports/attendance',

  // Member stats → member list with context filter
  [dashboardFilter.memberTodayBirthday]: '/members',
  [dashboardFilter.membershipExpireToday]: '/members',
  [dashboardFilter.membershipExpireInOneToThreeDays]: '/members',
  [dashboardFilter.membershipExpireInFourtoSevenDays]: '/members',
  [dashboardFilter.membershipExpireInSevenToFifteenDays]: '/members',
  [dashboardFilter.memberWhoseMembershipIsActive]: '/members',
  [dashboardFilter.memberWhoseMembershipExpire]: '/members',
  [dashboardFilter.totalRegUser]: '/members',
  [dashboardFilter.getBlockUser]: '/members',
  [dashboardFilter.biometricRegisterMember]: '/members',
};

function startOfDay(d: Date): number {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0).getTime();
}

function endOfDay(d: Date): number {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999).getTime();
}

function startOfMonth(d: Date): number {
  return new Date(d.getFullYear(), d.getMonth(), 1, 0, 0, 0, 0).getTime();
}

function endOfMonth(d: Date): number {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999).getTime();
}

/** Returns millis timestamps for the date range matching a dashboard context.
 *  undefined means "all time" (no date filter). */
export function getInitialDateRange(context?: string): {
  startDate: number | undefined;
  endDate: number | undefined;
} {
  const now = new Date();

  // "All time" contexts — no date filter
  const allTimeContexts = new Set<string>([
    dashboardFilter.totalCollection,
    dashboardFilter.dueAmount,
    dashboardFilter.totalPTPlanDueAmount,
    dashboardFilter.totalAdmissionFees,
  ]);

  if (!context || allTimeContexts.has(context)) {
    return { startDate: undefined, endDate: undefined };
  }

  // Today
  if (
    context === dashboardFilter.todayCollection ||
    context === dashboardFilter.todayAttendance
  ) {
    return { startDate: startOfDay(now), endDate: endOfDay(now) };
  }

  // Last month
  if (context === dashboardFilter.collectionLastMonth) {
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    return { startDate: startOfMonth(lastMonth), endDate: endOfMonth(lastMonth) };
  }

  // Current month (default for remaining month-based contexts)
  return { startDate: startOfMonth(now), endDate: endOfMonth(now) };
}

/** Convert millis timestamp to YYYY-MM-DD for <input type="date"> */
export function toInputDate(ms: number | undefined): string {
  if (ms == null) return '';
  const d = new Date(ms);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** Convert YYYY-MM-DD input value back to millis timestamp */
export function fromInputDate(val: string, isEnd: boolean): number | undefined {
  if (!val) return undefined;
  const [y, m, d] = val.split('-').map(Number);
  if (y == null || m == null || d == null) return undefined;
  if (isEnd) return new Date(y, m - 1, d, 23, 59, 59, 999).getTime();
  return new Date(y, m - 1, d, 0, 0, 0, 0).getTime();
}

// Map context → memberContext filter id used by MemberListPage
export const memberContextMap: Record<string, string> = {
  [dashboardFilter.memberWhoseMembershipIsActive]: 'active',
  [dashboardFilter.memberWhoseMembershipExpire]: 'inactive',
  [dashboardFilter.memberTodayBirthday]: 'memberTodayBirthday',
  [dashboardFilter.membershipExpireToday]: 'membershipExpireToday',
  [dashboardFilter.membershipExpireInOneToThreeDays]: 'membershipExpireInOneToThreeDays',
  [dashboardFilter.membershipExpireInFourtoSevenDays]: 'membershipExpireInFourtoSevenDays',
  [dashboardFilter.membershipExpireInSevenToFifteenDays]: 'membershipExpireInSevenToFifteenDays',
  [dashboardFilter.totalRegUser]: '',
  [dashboardFilter.getBlockUser]: 'getBlockUser',
  [dashboardFilter.biometricRegisterMember]: '',
};

export const SUPPORTED_PAYMENT_METHODS = [
  { value: '', label: 'All Methods' },
  { value: 'Cash', label: 'Cash' },
  { value: 'Card', label: 'Card' },
  { value: 'UPI', label: 'UPI' },
  { value: 'Online', label: 'Online' },
  { value: 'Bank Transfer', label: 'Bank Transfer' },
  { value: 'Cheque', label: 'Cheque' },
];

export const PLAN_TYPE_FILTERS = [
  { value: '', label: 'All Plan Types' },
  { value: 'membership_plan', label: 'Membership Plans' },
  { value: 'personal_trainer_plan', label: 'PT Plans' },
];
