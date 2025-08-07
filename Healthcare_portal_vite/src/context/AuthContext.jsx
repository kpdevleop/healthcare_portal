import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (token && storedUser) {
      try {
        // First, try to restore user from localStorage
        const userData = JSON.parse(storedUser);
        setUser(userData);
        
        // Then validate the token with the backend (but don't log out if it fails)
        try {
          const response = await authAPI.testToken();
          const freshUserData = response.data;
          // Update user data with fresh data from server
          setUser(freshUserData);
          localStorage.setItem('user', JSON.stringify(freshUserData));
        } catch (error) {
          console.warn('Token validation failed, but keeping user logged in:', error);
          // Don't log out the user if token validation fails
          // The user can still use the app, and the token will be validated on API calls
        }
      } catch (error) {
        console.error('Error restoring user session:', error);
        logout();
      }
    }
    setLoading(false);
  };

  const login = async (credentials) => {
    try {
      setError(null);
      const response = await authAPI.signIn(credentials);
      console.log('Login response:', response);
      console.log('Response data:', response.data);
      
      // Backend returns AuthResponseDTO directly, not wrapped in data
      const { token, userId, email, role, firstName, lastName } = response.data;
      
      if (!token) {
        throw new Error('No token received from server');
      }
      
      const userData = {
        id: userId,
        email,
        role,
        firstName,
        lastName,
      };
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Login failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const signup = async (userData) => {
    try {
      setError(null);
      const response = await authAPI.signUp(userData);
      console.log('Signup response:', response);
      console.log('Response data:', response.data);
      
      // Backend returns AuthResponseDTO directly, not wrapped in data
      const { token, userId, email, role, firstName, lastName } = response.data;
      
      if (!token) {
        throw new Error('No token received from server');
      }
      
      const user = {
        id: userId,
        email,
        role,
        firstName,
        lastName,
      };
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      setUser(user);
      return { success: true };
    } catch (error) {
      console.error('Signup error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Signup failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const logout = () => {
    setUser(null);
    setError(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const clearSession = () => {
    setUser(null);
    setError(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const clearError = () => {
    setError(null);
  };

  const refreshToken = async () => {
    try {
      const response = await authAPI.testToken();
      const freshUserData = response.data;
      setUser(freshUserData);
      localStorage.setItem('user', JSON.stringify(freshUserData));
      return true;
    } catch (error) {
      console.warn('Token refresh failed:', error);
      return false;
    }
  };

  const updateUser = (updatedUserData) => {
    setUser(updatedUserData);
    localStorage.setItem('user', JSON.stringify(updatedUserData));
  };

  const value = {
    user,
    loading,
    error,
    login,
    signup,
    logout,
    clearSession,
    refreshToken,
    clearError,
    updateUser,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'ROLE_ADMIN',
    isDoctor: user?.role === 'ROLE_DOCTOR',
    isPatient: user?.role === 'ROLE_PATIENT',
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};