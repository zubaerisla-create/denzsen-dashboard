// utils/tokenUtils.ts

export const setTokens = (accessToken: string, refreshToken: string) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('access_token', accessToken);
    localStorage.setItem('refresh_token', refreshToken);
  }
};

export const getAccessToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('access_token');
  }
  return null;
};

export const getRefreshToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('refresh_token');
  }
  return null;
};

export const clearTokens = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('admin_user');
  }
};

export const getAdminUser = () => {
  if (typeof window !== 'undefined') {
    const user = localStorage.getItem('admin_user');
    try {
      return user ? JSON.parse(user) : null;
    } catch {
      return null;
    }
  }
  return null;
};

export const isAuthenticated = (): boolean => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('access_token');
    const user = localStorage.getItem('admin_user');
    
    if (!token || !user) return false;
    
    try {
      const userData = JSON.parse(user);
      return userData.role === 'admin' || userData.role === 'analyst';
    } catch {
      return false;
    }
  }
  return false;
};