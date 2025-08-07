import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Menu, 
  X, 
  Home, 
  Users, 
  Calendar, 
  FileText, 
  MessageSquare, 
  Settings, 
  LogOut,
  User,
  Building,
  Shield,
  Stethoscope,
  Building2,
  Bell
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { USER_ROLES } from '../services/api';

const DashboardLayout = ({ children, title }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout, isAuthenticated } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/signin');
  };

  const getRoleIcon = () => {
    switch (user?.role) {
      case USER_ROLES.ADMIN:
        return <Shield className="w-5 h-5" />;
      case USER_ROLES.DOCTOR:
        return <Stethoscope className="w-5 h-5" />;
      case USER_ROLES.PATIENT:
        return <User className="w-5 h-5" />;
      default:
        return <User className="w-5 h-5" />;
    }
  };

  const getRoleName = () => {
    switch (user?.role) {
      case USER_ROLES.ADMIN:
        return 'Administrator';
      case USER_ROLES.DOCTOR:
        return 'Doctor';
      case USER_ROLES.PATIENT:
        return 'Patient';
      default:
        return 'User';
    }
  };

  const getNavigationItems = () => {
    const baseItems = [
      { name: 'Dashboard', href: '/dashboard', icon: Home },
    ];

    switch (user?.role) {
      case USER_ROLES.ADMIN:
        return [
          ...baseItems,
          { name: 'Departments', href: '/admin/departments', icon: Building2 },
          { name: 'Doctor Schedules', href: '/admin/schedules', icon: Calendar },
          { name: 'Appointments', href: '/admin/appointments', icon: Calendar },
          { name: 'Medical Records', href: '/admin/medical-records', icon: FileText },
          { name: 'Feedback', href: '/admin/feedback', icon: MessageSquare },
          { name: 'Users', href: '/admin/users', icon: Users },
        ];
      case USER_ROLES.DOCTOR:
        return [
          ...baseItems,
          { name: 'My Schedules', href: '/doctor/schedules', icon: Calendar },
          { name: 'My Patients', href: '/doctor/patients', icon: Users },
          { name: 'Medical Records', href: '/doctor/medical-records', icon: FileText },
          { name: 'Patient Feedback', href: '/doctor/feedback', icon: MessageSquare },
          { name: 'My Profile', href: '/doctor/profile', icon: User },
        ];
      case USER_ROLES.PATIENT:
        return [
          ...baseItems,
          { name: 'Book Appointment', href: '/patient/book-appointment', icon: Calendar },
          { name: 'My Appointments', href: '/patient/appointments', icon: Calendar },
          { name: 'My Medical Records', href: '/patient/medical-records', icon: FileText },
          { name: 'Doctor Reviews', href: '/patient/doctor-reviews', icon: MessageSquare },
          { name: 'My Feedback', href: '/patient/feedback', icon: MessageSquare },
          { name: 'My Profile', href: '/patient/profile', icon: User },
          { name: 'Notifications', href: '/patient/notifications', icon: Bell },
        ];
      default:
        return baseItems;
    }
  };

  const navigationItems = getNavigationItems();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 flex w-64 flex-col bg-white shadow-xl">
          <div className="flex h-16 items-center justify-between px-4">
            <h1 className="text-xl font-bold text-gray-900">Healthcare Portal</h1>
            <button
              onClick={() => setSidebarOpen(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          <nav className="flex-1 space-y-1 px-2 py-4">
            {navigationItems.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                    isActive
                      ? 'bg-blue-100 text-blue-900'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow bg-white shadow-xl">
          <div className="flex h-16 items-center px-4">
            <h1 className="text-xl font-bold text-gray-900">Healthcare Portal</h1>
          </div>
          <nav className="flex-1 space-y-1 px-2 py-4">
            {navigationItems.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                    isActive
                      ? 'bg-blue-100 text-blue-900'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
          <button
            type="button"
            className="-m-2.5 p-2.5 text-gray-700 lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>

          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            <div className="flex flex-1">
              <h1 className="text-lg font-semibold text-gray-900">{title || 'Dashboard'}</h1>
            </div>
            <div className="flex items-center gap-x-4 lg:gap-x-6">
              {/* User profile */}
              <div className="flex items-center gap-x-4">
                <div className="flex items-center gap-x-2">
                  {getRoleIcon()}
                  <div className="hidden sm:block">
                    <p className="text-sm font-medium text-gray-900">
                      {user?.firstName} {user?.lastName}
                    </p>
                    <p className="text-xs text-gray-500">{getRoleName()}</p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-x-2 rounded-md bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:block">Logout</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;