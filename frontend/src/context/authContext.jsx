import React, { createContext, useContext, useState, useEffect } from 'react';
import { getMe } from '../services/authApi';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // On mount, check for saved token and validate it
  useEffect(() => {
    const savedToken = localStorage.getItem('medpal_token');
    if (savedToken) {
      getMe(savedToken)
        .then(data => {
          setUser(data.user);
          setToken(savedToken);
        })
        .catch(() => {
          // Token expired or invalid — clear it
          localStorage.removeItem('medpal_token');
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = (authData) => {
    // authData: { token, user }
    setUser(authData.user);
    setToken(authData.token);
    localStorage.setItem('medpal_token', authData.token);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('medpal_token');
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!user,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
