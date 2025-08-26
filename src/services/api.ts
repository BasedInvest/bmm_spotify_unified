import axios, { AxiosError } from 'axios';
import { getAccessToken } from './spotify';

// Base URLs from env
const API_BASE = (import.meta.env.VITE_API_BASE_URL as string) ?? '/';
export const SPOTIFY_API_URI = 'https://api.spotify.com';
export const BMM_API_URL = (import.meta.env.VITE_BMM_BASE_URL as string) ?? '';

const api = axios.create({
  baseURL: API_BASE, // backend proxy endpoints are expected under /api
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

// Attach tokens: Spotify (from getAccessToken) and optional BMM token from localStorage
api.interceptors.request.use(async (cfg) => {
  try {
    const sp = await getAccessToken();
    if (sp) {
      if (!cfg.headers) cfg.headers = {} as any;
      (cfg.headers as any).Authorization = `Bearer ${sp}`;
    }
  } catch (e) {
    // ignore
  }

  const bmmToken = localStorage.getItem('bmm_token');
  if (bmmToken) {
    if (!cfg.headers) cfg.headers = {} as any;
    (cfg.headers as any)['X-BMM-Authorization'] = `Bearer ${bmmToken}`;
  }

  return cfg;
});

api.interceptors.response.use(
  (r) => r,
  (err: AxiosError) => {
    const data = err.response?.data ?? { message: err.message };
  const payload: any = data;
  const message = typeof data === 'string' ? data : (payload && (payload.message || JSON.stringify(payload)));
  const e = new Error(message as string);
    (e as any).status = err.response?.status;
    return Promise.reject(e);
  }
);

export function spotifyUrl(path: string) {
  return `${SPOTIFY_API_URI.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
}

export function bmmUrl(path: string) {
  if (!BMM_API_URL) return path;
  return `${BMM_API_URL.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
}

export default api;
