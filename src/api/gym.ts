import client from './client';
import type {
  AnalyticsResponse,
  ApiResponse,
  Batch,
  BatchRequest,
  CollectionStats,
  GymProfile,
  MemberStats,
  Package,
  PackageCreateRequest,
  Service,
  ServiceRequest,
} from './types';

export const getGymDetailAPI = () =>
  client.get<unknown, ApiResponse<GymProfile>>('/subscriber');

export const getAllPackagesAPI = () =>
  client.get<unknown, ApiResponse<Package[]>>('/subscriber/packages');

export const getAllServicesAPI = () =>
  client.get<unknown, ApiResponse<Service[]>>('/subscriber/service');

export const addServiceAPI = (body: ServiceRequest) =>
  client.post('/subscriber/service', body);

export const editServiceAPI = (serviceId: string, body: ServiceRequest) =>
  client.put(`/subscriber/service/${serviceId}`, { ...body, serviceID: serviceId });

export const deleteServiceAPI = (serviceId: string) =>
  client.delete(`/subscriber/service/${serviceId}`);

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

export const generatePaymentAuthTokenAPI = () =>
  client.post('/subscriber/generate-temporary-payment-auth-token');

export const editGymDetailAPI = (memberId: string, gymDetail: Partial<GymProfile>) =>
  client.put(`/subscriber/${memberId}`, gymDetail);

export const addPackageAPI = (body: PackageCreateRequest) =>
  client.post('/subscriber/package', body);

export const editPackageAPI = (packageId: string, body: PackageCreateRequest) =>
  client.put(`/subscriber/package/${packageId}`, { ...body, packageID: packageId });

export const deletePackageAPI = (packageId: string) =>
  client.delete(`/subscriber/package/${packageId}`);

// PT Plans
export const getAllPtPlansAPI = () =>
  client.get<unknown, ApiResponse<Package[]>>('/subscriber/pt-plans');

export const addPtPlanAPI = (body: PackageCreateRequest) =>
  client.post('/subscriber/pt-plan', body);

export const editPtPlanAPI = (planId: string, body: PackageCreateRequest) =>
  client.put(`/subscriber/pt-plan/${planId}`, body);

export const deletePtPlanAPI = (planId: string) =>
  client.delete(`/subscriber/pt-plan/${planId}`);

// Batches
export const getAllBatchesAPI = () =>
  client.get<unknown, ApiResponse<Batch[]>>('/batch');

export const addBatchAPI = (body: BatchRequest) =>
  client.post<unknown, ApiResponse<Batch>>('/batch', body);

export const editBatchAPI = (batchId: string, body: Batch) =>
  client.put<unknown, ApiResponse<Batch>>(`/batch/${batchId}`, body);

export const deleteBatchAPI = (batchId: string) =>
  client.delete(`/batch/${batchId}`);
