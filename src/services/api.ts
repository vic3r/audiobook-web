import axios from 'axios';
import { Audiobook, LibraryItem, AuthResponse } from '../types';
import { useAuthStore } from '../store/authStore';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401/403 responses - automatically log out when token is expired/invalid
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      const url = error.config?.url || '';
      // If it's an authenticated endpoint (library or auth validation), token is expired/invalid
      // Public endpoints like /api/audiobooks/** should not trigger logout
      if (url.includes('/library') || url.includes('/auth/me') || url.includes('/auth/validate')) {
        // Clear token and logout using store
        const { logout } = useAuthStore.getState();
        logout();
        
        // Only redirect to login if not already there and not on a public page
        const currentPath = window.location.pathname;
        if (!currentPath.includes('/login') && !currentPath.includes('/register')) {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  register: async (email: string, password: string, firstName: string, lastName: string): Promise<AuthResponse> => {
    const { data } = await api.post('/auth/register', { email, password, firstName, lastName });
    return data;
  },
  login: async (email: string, password: string): Promise<AuthResponse> => {
    const { data } = await api.post('/auth/login', { email, password });
    return data;
  },
};

export const audiobookApi = {
  getAll: async (page = 0, size = 20) => {
    const { data } = await api.get(`/audiobooks?page=${page}&size=${size}`);
    return data;
  },
  getById: async (id: string): Promise<Audiobook> => {
    const { data } = await api.get(`/audiobooks/${id}`);
    return data;
  },
  search: async (query: string, page = 0, size = 20) => {
    const { data } = await api.get(`/audiobooks/search?query=${encodeURIComponent(query)}&page=${page}&size=${size}`);
    return data;
  },
  getByCategory: async (category: string, page = 0, size = 20) => {
    const { data } = await api.get(`/audiobooks/category/${encodeURIComponent(category)}?page=${page}&size=${size}`);
    return data;
  },
  getFeatured: async (page = 0, size = 10) => {
    const { data } = await api.get(`/audiobooks/featured?page=${page}&size=${size}`);
    return data;
  },
  getNewReleases: async (page = 0, size = 10) => {
    const { data } = await api.get(`/audiobooks/new-releases?page=${page}&size=${size}`);
    return data;
  },
  getCategories: async (): Promise<string[]> => {
    const { data } = await api.get('/audiobooks/categories');
    return data;
  },
};

export const libraryApi = {
  getLibrary: async (): Promise<LibraryItem[]> => {
    const { data } = await api.get('/library');
    return data;
  },
  getFavorites: async (): Promise<LibraryItem[]> => {
    const { data } = await api.get('/library/favorites');
    return data;
  },
  addToLibrary: async (audiobookId: string): Promise<LibraryItem> => {
    const { data } = await api.post(`/library/${audiobookId}`);
    return data;
  },
  updatePosition: async (libraryItemId: string, positionSeconds: number): Promise<LibraryItem> => {
    const { data } = await api.put(`/library/${libraryItemId}/position?positionSeconds=${positionSeconds}`);
    return data;
  },
  toggleFavorite: async (libraryItemId: string): Promise<LibraryItem> => {
    const { data } = await api.put(`/library/${libraryItemId}/favorite`);
    return data;
  },
};

export default api;
