import client from './client';

export interface GymBranch {
  _id: string;
  subName: string;
  subLogo?: string;
  referralCode?: number;
  isAdmin?: boolean;
  subscriptionExpiryDate?: string;
}

export const getAllBranchesAPI = () =>
  client.get('/subscriber/all');

export const exchangeTokenAPI = (subID: string) =>
  client.post(`/subscriber/exchange-token?subID=${subID}`);

export const addBranchAPI = (subName: string) =>
  client.post('/subscriber/add-gym', { subName });
