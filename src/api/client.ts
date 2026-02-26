import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL;
const FALLBACK_URL = import.meta.env.VITE_API_FALLBACK_URL;

const client = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache',
    source: import.meta.env.VITE_APP_SOURCE,
    appVersion: import.meta.env.VITE_APP_VERSION,
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
