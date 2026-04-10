import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for persisted auth state
    const savedUser = localStorage.getItem('caregiver_user');
    const token = localStorage.getItem('caregiver_token');
    
    if (savedUser && token) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = (userData, token) => {
    setUser(userData);
    localStorage.setItem('caregiver_user', JSON.stringify(userData));
    localStorage.setItem('caregiver_token', token);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('caregiver_user');
    localStorage.removeItem('caregiver_token');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading: loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
