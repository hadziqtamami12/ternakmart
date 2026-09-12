// AuthContext.jsx - User Authentication & Session Management
import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../utils/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('ternakmart_token') || null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    const currentToken = localStorage.getItem('ternakmart_token');
    if (!currentToken) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const res = await api.get('/auth/me');
      if (res.success && res.data) {
        setUser(res.data);
      } else {
        logout();
      }
    } catch (err) {
      console.warn('Session expired or invalid token:', err.message);
      logout();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, [token]);

  const login = async (identifier, password) => {
    const res = await api.post('/auth/login', { identifier, password });
    if (res.success && res.data) {
      localStorage.setItem('ternakmart_token', res.data.token);
      setToken(res.data.token);
      setUser(res.data.user);
    }
    return res;
  };

  const register = async (userData) => {
    const res = await api.post('/auth/register', userData);
    if (res.success && res.data) {
      localStorage.setItem('ternakmart_token', res.data.token);
      setToken(res.data.token);
      setUser(res.data.user);
    }
    return res;
  };

  const logout = () => {
    localStorage.removeItem('ternakmart_token');
    setToken(null);
    setUser(null);
  };

  const updateProfile = async (data) => {
    const res = await api.put('/auth/profile', data);
    if (res.success && res.data) {
      setUser(prev => ({ ...prev, ...res.data }));
    }
    return res;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: Boolean(user),
        isAdmin: user?.role === 'ADMIN',
        isSeller: user?.role === 'SELLER',
        isCourier: user?.role === 'COURIER',
        isBuyer: user?.role === 'BUYER',
        login,
        register,
        logout,
        refreshUser: fetchUser,
        updateProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
