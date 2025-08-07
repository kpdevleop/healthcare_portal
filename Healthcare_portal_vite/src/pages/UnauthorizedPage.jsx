import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, ArrowLeft, Home } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const UnauthorizedPage = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center">
        {/* Icon */}
        <div className="flex justify-center">
          <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center">
            <Shield className="h-12 w-12 text-red-600" />
          </div>
        </div>

        {/* Content */}
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Access Denied
          </h1>
          <p className="text-lg text-gray-600 mb-2">
            You don't have permission to access this page.
          </p>
          {user && (
            <p className="text-sm text-gray-500">
              Current role: <span className="font-medium">{user.role?.replace('ROLE_', '')}</span>
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/"
              className="btn-primary flex items-center justify-center"
            >
              <Home className="h-4 w-4 mr-2" />
              Go to Home
            </Link>
            <button
              onClick={() => window.history.back()}
              className="btn-outline flex items-center justify-center"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </button>
          </div>
          
          {user && (
            <button
              onClick={logout}
              className="text-sm text-gray-500 hover:text-gray-700 underline"
            >
              Sign out and try with different account
            </button>
          )}
        </div>

        {/* Help Text */}
        <div className="card bg-blue-50 border-blue-200 text-left">
          <h3 className="text-sm font-medium text-blue-900 mb-2">
            Need access to this page?
          </h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Contact your system administrator</li>
            <li>• Verify you're signed in with the correct account</li>
            <li>• Check if your role has the required permissions</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default UnauthorizedPage;