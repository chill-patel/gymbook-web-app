import axios from 'axios';
import Cookies from 'js-cookie';

const BASE_URL = import.meta.env.VITE_API_BASE_URL;
const FALLBACK_URL = import.meta.env.VITE_API_FALLBACK_URL;
const COOKIE_DOMAIN = import.meta.env.VITE_COOKIE_DOMAIN;
const AUTH_COOKIE = 'authToken';

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
  const token = Cookies.get(AUTH_COOKIE);
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

// Token helpers — stored as a cookie on the root domain so all
// *.gymbook.in subdomains share the same auth session.
export const saveToken = (token: string) => {
  Cookies.set(AUTH_COOKIE, token, {
    domain: COOKIE_DOMAIN,
    path: '/',
    expires: 365,
    secure: true,
    sameSite: 'Lax',
  });
};

export const getToken = () => Cookies.get(AUTH_COOKIE);

export const removeToken = () => {
  Cookies.remove(AUTH_COOKIE, {
    domain: COOKIE_DOMAIN,
    path: '/',
  });
};
