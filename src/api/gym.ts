import client from './client';
import type {
  AnalyticsResponse,
  ApiResponse,
  CollectionStats,
  GymProfile,
  MemberStats,
  Package,
  PackageCreateRequest,
  PackageEditRequest,
} from './types';

export const getGymDetailAPI = () =>
  client.get<unknown, GymProfile>('/subscriber');

export const getAllPackagesAPI = () =>
  client.get<unknown, ApiResponse<Package[]>>('/subscriber/packages');

export const getAllServicesAPI = () =>
  client.get<unknown, ApiResponse<Package[]>>('/subscriber/service');

export const getMemberStatsAPI = () =>
  client.get<unknown, MemberStats>('/member/dashboard/member-report', {
    params: { apiVersion: 1 },
  });

export const getMemberAnalyticsAPI = () =>
  client.get<unknown, AnalyticsResponse>('/member/dashboard/members-analytics', {
    params: { reportVersion: 2 },
  });

export const getMemberCollectionAPI = (startDate: string, endDate: string) =>
  client.get<unknown, CollectionStats>('/member/dashboard/collection', {
    params: { startDate, endDate, apiVersion: 1 },
  });

export const editGymDetailAPI = (memberId: string, gymDetail: Partial<GymProfile>) =>
  client.put(`/subscriber/${memberId}`, gymDetail);

export const addPackageAPI = (body: PackageCreateRequest) =>
  client.post('/subscriber/package', body);

export const editPackageAPI = (packageId: string, body: PackageEditRequest) =>
  client.put(`/subscriber/package/${packageId}`, body);

export const deletePackageAPI = (packageId: string) =>
  client.delete(`/subscriber/package/${packageId}`);
