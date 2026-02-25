import client from './client';
import type { Member, MemberListParams, MemberPackage, PaginatedResponse } from './types';

const PAGE_SIZE = 40;

export const getAllMembersAPI = (params: MemberListParams) => {
  const { startIndex, query, packageName, memberContext, gender, batchId, orderBy, includeDeleted } = params;
  return client.get<unknown, PaginatedResponse<Member>>(`/member/${startIndex}/${PAGE_SIZE}`, {
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
  client.get<unknown, Member>(`/member/${memberId}`);

export const getPackagesByMemberAPI = (memberId: string) =>
  client.get<unknown, MemberPackage[]>(`/member/${memberId}/packages`);

export const addMemberAPI = (body: Partial<Member>) =>
  client.post<unknown, Member>('/member', body);

export const updateMemberAPI = (body: Partial<Member> & { _id: string }) =>
  client.put(`/member/${body._id}`, body);

export const deleteMemberAPI = (memberId: string, hardDelete?: boolean) =>
  client.delete(`/member/${memberId}`, { params: hardDelete ? { hardDelete } : undefined });

export const addPackageForMemberAPI = (memberId: string, packageDetail: Record<string, unknown>) =>
  client.post(`/member/${memberId}/package`, packageDetail);

export const memberStatsCountAPI = () =>
  client.get('/member/stats');

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
  startDate: string;
  endDate: string;
  paymentMethod?: string;
  planType?: string;
}) =>
  client.get('/member/today-report', { params });

export const planReportAPI = (params: {
  totalItemCount: number;
  startDate: string;
  endDate: string;
}) =>
  client.get('/member/plans', { params });

export const getMemberTrendsAPI = (year: string | number) =>
  client.get('/member/report/trends', { params: { timeperiod: year } });
