import axios from 'axios';

const BASE_URL = 'https://dev-0.gymbook.in';
const FALLBACK_URL = 'https://api-prod-1.gymbook.in';

const client = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache',
    source: 'web',
    appVersion: '1.0.0',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  },
});

// Request interceptor — attach auth token
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.authToken = token;
  }
  return config;
});

// Response interceptor — unwrap data, handle errors
client.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    // Fallback on hostname resolution failure
    if (error.code === 'ENOTFOUND' || error.code === 'ERR_NETWORK') {
      const config = error.config;
      if (config && !config._retried) {
        config._retried = true;
        config.baseURL = FALLBACK_URL;
        return client.request(config);
      }
    }

    const message =
      error.response?.data?.message || error.message || 'Something went wrong';
    return Promise.reject({ status: error.response?.status, message });
  },
);

export default client;

// Token helpers
export const saveToken = (token: string) => {
  localStorage.setItem('authToken', token);
};

export const getToken = () => localStorage.getItem('authToken');

export const removeToken = () => {
  localStorage.removeItem('authToken');
};
