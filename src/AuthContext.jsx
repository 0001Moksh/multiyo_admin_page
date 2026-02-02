import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminEmail, setAdminEmail] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if token exists on mount
    const token = localStorage.getItem('authToken');
    const email = localStorage.getItem('adminEmail');

    if (token) {
      // Verify token with backend
      verifyToken(token);
    } else {
      setLoading(false);
    }
  }, []);

  const verifyToken = async (token) => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/verify-token', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setIsAuthenticated(true);
        setAdminEmail(data.email);
      } else {
        // Token invalid, clear storage
        logout();
      }
    } catch (error) {
      console.error('Token verification error:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = (token, email) => {
    localStorage.setItem('authToken', token);
    localStorage.setItem('adminEmail', email);
    setIsAuthenticated(true);
    setAdminEmail(email);
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('adminEmail');
    setIsAuthenticated(false);
    setAdminEmail('');
  };

  const getToken = () => {
    return localStorage.getItem('authToken');
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        adminEmail,
        loading,
        login,
        logout,
        getToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
