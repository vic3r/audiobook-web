import { create } from 'zustand';

interface AuthState {
  token: string | null;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  } | null;
  isAuthenticated: boolean;
  setAuth: (token: string, user: { id: string; email: string; firstName: string; lastName: string }) => void;
  logout: () => void;
  validateToken: () => void;
}

// Helper function to decode JWT token
function decodeToken(token: string): { exp?: number } | null {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
}

// Helper function to check if token is expired
function isTokenExpired(token: string): boolean {
  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) {
    return true;
  }
  // exp is in seconds, Date.now() is in milliseconds
  // Add 1 minute buffer to account for clock skew
  return decoded.exp * 1000 < Date.now() - 60000;
}

// Initialize with token validation
const initToken = (): string | null => {
  const token = localStorage.getItem('token');
  if (token && isTokenExpired(token)) {
    localStorage.removeItem('token');
    return null;
  }
  return token;
};

export const useAuthStore = create<AuthState>((set) => ({
  token: initToken(),
  user: null,
  isAuthenticated: !!initToken(),
  setAuth: (token, user) => {
    localStorage.setItem('token', token);
    set({ token, user, isAuthenticated: true });
  },
  logout: () => {
    localStorage.removeItem('token');
    set({ token: null, user: null, isAuthenticated: false });
  },
  validateToken: () => {
    const token = localStorage.getItem('token');
    if (!token || isTokenExpired(token)) {
      localStorage.removeItem('token');
      set({ token: null, user: null, isAuthenticated: false });
    } else {
      set({ token, isAuthenticated: true });
    }
  },
}));
