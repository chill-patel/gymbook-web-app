import client from './client';

export const getActiveSubscriptionAPI = () =>
  client.get('/payment/active-subscription', { params: { apiVersion: 1 } });

export const checkTrialPeriodAPI = () =>
  client.get('/payment/trial-check');
