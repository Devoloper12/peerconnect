import React, { createContext, useState, useEffect, useContext } from 'react';
import { getProfileApi } from '../api/client';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('peerconnect_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => {
    return localStorage.getItem('peerconnect_token') || null;
  });
  const [loading, setLoading] = useState(false);

  const saveAuth = (userData, userToken) => {
    setUser(userData);
    setToken(userToken);
    localStorage.setItem('peerconnect_user', JSON.stringify(userData));
    localStorage.setItem('peerconnect_token', userToken);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('peerconnect_user');
    localStorage.removeItem('peerconnect_token');
  };

  const refreshProfile = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const res = await getProfileApi();
      if (res.data && res.data.user) {
        setUser(res.data.user);
        localStorage.setItem('peerconnect_user', JSON.stringify(res.data.user));
      }
    } catch (err) {
      console.error('Failed to refresh profile:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, saveAuth, logout, refreshProfile, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
