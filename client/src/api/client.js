import axios from 'axios';

const api = axios.create({ baseURL: '/api' });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Resolve image paths returned by the API ("uploads/...") or legacy static assets.
export function imageUrl(p) {
  if (!p) return '/pictures/account.png';
  if (p.startsWith('http') || p.startsWith('/')) return p;
  if (p.startsWith('pictures/')) return `/${p}`;
  return `/${p}`; // uploads/... proxied to the API server
}

export function errMsg(err, fallback = 'Something went wrong.') {
  return err?.response?.data?.message || fallback;
}

export default api;
