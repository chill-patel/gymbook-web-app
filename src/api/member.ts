import client from './client';
import type {
  ApiResponse,
  AttendanceRecord,
  Member,
  MemberListParams,
  MemberPackage,
  MemberPtPlan,
  MemberService,
  MemberPrerequisite,
  AddMemberRequest,
} from './types';

const PAGE_SIZE = 40;

export const getAllMembersAPI = (params: MemberListParams) => {
  const { startIndex, query, packageName, memberContext, gender, batchId, orderBy, includeDeleted } = params;
  return client.get<unknown, ApiResponse<Member[]>>(`/member/${startIndex}/${PAGE_SIZE}`, {
    params: {
      ...(query && { q: query }),
      ...(packageName && { packageName }),
      ...(memberContext && { memberContext }),
      ...(gender && { gender }),
      ...(batchId && { batchId }),
      ...(orderBy && { orderBy }),
      ...(includeDeleted && { includeDeleted }),
    },
  });
};

export const getMemberDetailAPI = (memberId: string) =>
  client.get<unknown, ApiResponse<Member>>(`/member/${memberId}`);

export const getMemberPrerequisiteAPI = () =>
  client.get<unknown, ApiResponse<MemberPrerequisite>>('/member/prerequisite');

export const addMemberAPI = (body: AddMemberRequest) =>
  client.post<unknown, ApiResponse<Member>>('/member', body);

export const updateMemberAPI = (memberId: string, body: Partial<AddMemberRequest>) =>
  client.put(`/member/${memberId}`, body);

export const deleteMemberAPI = (memberId: string, hardDelete?: boolean) =>
  client.delete(`/member/${memberId}`, { params: hardDelete ? { hardDelete } : undefined });

export const getAttendanceReportAPI = (memberId: string, startDate: number, endDate: number) =>
  client.get<unknown, ApiResponse<AttendanceRecord[]>>('/member/punch-report', {
    params: { memberId, startDate, endDate },
  });

export const addPackageForMemberAPI = (memberId: string, packageDetail: Record<string, unknown>) =>
  client.post(`/member/${memberId}/package`, packageDetail);

export const punchInOutAPI = (memberId: string) =>
  client.put('/member/puchinout', { memberId });

export const getMembersByContextAPI = (
  startIndex: number,
  context: string,
  query?: string,
  packageName?: string,
  startDate?: string,
  endDate?: string,
) =>
  client.get(`/member/dashboard/member`, {
    params: {
      context,
      startIndex,
      endIndex: PAGE_SIZE,
      ...(query && { q: query }),
      ...(packageName && { packageName }),
      ...(startDate && { startDate }),
      ...(endDate && { endDate }),
    },
  });

// Reports
export const salesReportAPI = (params: {
  totalItemCount: number;
  startDate?: number;
  endDate?: number;
  paymentMethod?: string;
  planType?: string;
}) =>
  client.get('/member/today-report', {
    params: { ...params, apiVersion: 1 },
  });

export const planReportAPI = (params: {
  totalItemCount: number;
  startDate?: number;
  endDate?: number;
}) =>
  client.get('/member/plans', { params });

export const ptPlanReportAPI = (params: {
  totalItemCount: number;
  startDate?: number;
  endDate?: number;
}) =>
  client.get('/member/pt-plans-due', { params });

export const admissionReportAPI = (params: {
  totalItemCount: number;
  startDate?: number;
  endDate?: number;
}) =>
  client.get('/member/admission-report', { params });

export const downloadMemberExcelAPI = (fileContext: string, fileType: string) =>
  client.get('/member/download/excel', { params: { fileContext, fileType } });

export const downloadMemberBillsAPI = (params: {
  startDate: string;
  endDate: string;
  fileType: string;
}) =>
  client.get('/member/member-invoices/download', { params });

export const getAllUserAttendanceReportAPI = (params: {
  startDate: number;
  endDate: number;
}) =>
  client.get('/member/punch-reports', { params });

export const getMemberTrendsAPI = (year: string | number) =>
  client.get('/member/report/trends', { params: { timeperiod: year } });

// ─── Member Sub-section Listing ─────────────────────────
export const getMemberPackagesAPI = (memberId: string) =>
  client.get<unknown, ApiResponse<{ packages: MemberPackage[] }>>(`/member/${memberId}/packages`);

export const getMemberPtPlansAPI = (memberId: string) =>
  client.get<unknown, ApiResponse<{ ptPlans?: MemberPtPlan[]; trainerPlans?: MemberPtPlan[] }>>(`/member/${memberId}/pt-plans`);

export const getMemberServicesAPI = (memberId: string) =>
  client.get<unknown, ApiResponse<{ services: MemberService[] }>>(`/member/${memberId}/services`);

// ─── Member Plan (Package) CRUD ─────────────────────────
export const updateMemberPlanAPI = (packageId: string, body: Record<string, unknown>) =>
  client.put(`/member/plan/${packageId}`, body);

export const deleteMemberPackageAPI = (memberId: string, packageId: string) =>
  client.delete(`/member/${memberId}/package/${packageId}`);

export const addPlanPaymentAPI = (memberId: string, planId: string, body: Record<string, unknown>) =>
  client.post(`/member/${memberId}/package/${planId}/payment`, body);

export const deletePlanPaymentAPI = (memberId: string, planId: string, paymentId: string) =>
  client.delete(`/member/${memberId}/package/${planId}/${paymentId}`);

export const freezeMembershipAPI = (body: Record<string, unknown>) =>
  client.post('/member/membership/freeze', body);

export const unfreezeMembershipAPI = (body: Record<string, unknown>) =>
  client.post('/member/membership/unfreeze', body);

// ─── Member PT Plan CRUD ────────────────────────────────
export const addPtPlanForMemberAPI = (memberId: string, body: Record<string, unknown>) =>
  client.post(`/member/${memberId}/pt-plan`, body);

export const updateMemberPtPlanAPI = (ptPlanId: string, body: Record<string, unknown>) =>
  client.put(`/member/pt-plan/${ptPlanId}`, body);

export const deleteMemberPtPlanAPI = (memberId: string, ptPlanId: string) =>
  client.delete(`/member/${memberId}/pt-plan/${ptPlanId}`);

export const addPtPlanPaymentAPI = (memberId: string, ptPlanId: string, body: Record<string, unknown>) =>
  client.post(`/member/${memberId}/pt-plan/${ptPlanId}/payment`, body);

export const deletePtPlanPaymentAPI = (memberId: string, ptPlanId: string, paymentId: string) =>
  client.delete(`/member/${memberId}/pt-plan/${ptPlanId}/${paymentId}`);

// ─── Member Service CRUD ────────────────────────────────
export const addServiceForMemberAPI = (memberId: string, body: Record<string, unknown>) =>
  client.post(`/member/${memberId}/service`, body);

export const updateMemberServiceAPI = (serviceId: string, body: Record<string, unknown>) =>
  client.put(`/member/service/${serviceId}`, body);

export const deleteMemberServiceAPI = (memberId: string, serviceId: string) =>
  client.delete(`/member/${memberId}/service/${serviceId}`);

// ─── Measurements CRUD ──────────────────────────────────
export const addMeasurementAPI = (body: Record<string, unknown>) =>
  client.post('/member/measurement', body);

export const updateMeasurementAPI = (body: Record<string, unknown>) =>
  client.put('/member/measurement', body);

export const deleteMeasurementAPI = (memberId: string, measurementId: string) =>
  client.delete(`/member/${memberId}/measurement/${measurementId}`);

// ─── Biometric ──────────────────────────────────────────
export const registerFingerprintAPI = (memberId: string) =>
  client.post(`/member/${memberId}/biometric`);

export const deleteFingerprintAPI = (memberId: string) =>
  client.delete(`/member/${memberId}/biometric`);
