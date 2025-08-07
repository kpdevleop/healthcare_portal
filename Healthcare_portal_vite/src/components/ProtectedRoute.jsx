import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, requiredRole = null }) => {
  const { isAuthenticated, isAdmin, isDoctor, isPatient, loading, user } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Check if user is authenticated
  if (!isAuthenticated) {
    console.log('User not authenticated, redirecting to signin');
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }

  // Check if user has required role
  if (requiredRole) {
    let hasRequiredRole = false;
    
    switch (requiredRole) {
      case 'ROLE_ADMIN':
        hasRequiredRole = isAdmin;
        break;
      case 'ROLE_DOCTOR':
        hasRequiredRole = isDoctor;
        break;
      case 'ROLE_PATIENT':
        hasRequiredRole = isPatient;
        break;
      default:
        hasRequiredRole = false;
    }
    
    if (!hasRequiredRole) {
      console.log(`User role ${user?.role} does not have required role ${requiredRole}`);
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;