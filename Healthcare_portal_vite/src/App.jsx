import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import { USER_ROLES } from './services/api';

// Pages
import LandingPage from './pages/LandingPage';
import SignInPage from './pages/SignInPage';
import SignUpPage from './pages/SignUpPage';
import UnauthorizedPage from './pages/UnauthorizedPage';

// Dashboards
import PatientDashboard from './pages/dashboards/PatientDashboard';
import DoctorDashboard from './pages/dashboards/DoctorDashboard';
import AdminDashboard from './pages/dashboards/AdminDashboard';

// Admin Pages
import AdminDepartments from './pages/admin/AdminDepartments';
import AdminSchedules from './pages/admin/AdminSchedules';
import AdminAppointments from './pages/admin/AdminAppointments';
import AdminMedicalRecords from './pages/admin/AdminMedicalRecords';
import AdminFeedback from './pages/admin/AdminFeedback';
import AdminUsers from './pages/admin/AdminUsers';

// Doctor Pages
import DoctorSchedules from './pages/doctor/DoctorSchedules';
import DoctorPatients from './pages/doctor/DoctorPatients';
import DoctorMedicalRecords from './pages/doctor/DoctorMedicalRecords';
import DoctorFeedback from './pages/doctor/DoctorFeedback';
import DoctorProfile from './pages/doctor/DoctorProfile';

// Patient Pages
import PatientBookAppointment from './pages/patient/PatientBookAppointment';
import PatientAppointments from './pages/patient/PatientAppointments';
import PatientMedicalRecords from './pages/patient/PatientMedicalRecords';
import PatientDoctorReviews from './pages/patient/PatientDoctorReviews';
import PatientFeedback from './pages/patient/PatientFeedback';
import PatientProfile from './pages/patient/PatientProfile';
import PatientNotifications from './pages/patient/PatientNotifications';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/signin" element={<SignInPage />} />
            <Route path="/signup" element={<SignUpPage />} />
            <Route path="/unauthorized" element={<UnauthorizedPage />} />

            {/* Protected Routes - Patient */}
            <Route
              path="/patient/dashboard"
              element={
                <ProtectedRoute requiredRole={USER_ROLES.PATIENT}>
                  <PatientDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/patient/book-appointment"
              element={
                <ProtectedRoute requiredRole={USER_ROLES.PATIENT}>
                  <PatientBookAppointment />
                </ProtectedRoute>
              }
            />
            <Route
              path="/patient/appointments"
              element={
                <ProtectedRoute requiredRole={USER_ROLES.PATIENT}>
                  <PatientAppointments />
                </ProtectedRoute>
              }
            />
            <Route
              path="/patient/medical-records"
              element={
                <ProtectedRoute requiredRole={USER_ROLES.PATIENT}>
                  <PatientMedicalRecords />
                </ProtectedRoute>
              }
            />
            <Route
              path="/patient/doctor-reviews"
              element={
                <ProtectedRoute requiredRole={USER_ROLES.PATIENT}>
                  <PatientDoctorReviews />
                </ProtectedRoute>
              }
            />
            <Route
              path="/patient/feedback"
              element={
                <ProtectedRoute requiredRole={USER_ROLES.PATIENT}>
                  <PatientFeedback />
                </ProtectedRoute>
              }
            />
            <Route
              path="/patient/profile"
              element={
                <ProtectedRoute requiredRole={USER_ROLES.PATIENT}>
                  <PatientProfile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/patient/notifications"
              element={
                <ProtectedRoute requiredRole={USER_ROLES.PATIENT}>
                  <PatientNotifications />
                </ProtectedRoute>
              }
            />

            {/* Protected Routes - Doctor */}
            <Route
              path="/doctor/dashboard"
              element={
                <ProtectedRoute requiredRole={USER_ROLES.DOCTOR}>
                  <DoctorDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/doctor/schedules"
              element={
                <ProtectedRoute requiredRole={USER_ROLES.DOCTOR}>
                  <DoctorSchedules />
                </ProtectedRoute>
              }
            />
            <Route
              path="/doctor/patients"
              element={
                <ProtectedRoute requiredRole={USER_ROLES.DOCTOR}>
                  <DoctorPatients />
                </ProtectedRoute>
              }
            />
            <Route
              path="/doctor/medical-records"
              element={
                <ProtectedRoute requiredRole={USER_ROLES.DOCTOR}>
                  <DoctorMedicalRecords />
                </ProtectedRoute>
              }
            />
            <Route
              path="/doctor/feedback"
              element={
                <ProtectedRoute requiredRole={USER_ROLES.DOCTOR}>
                  <DoctorFeedback />
                </ProtectedRoute>
              }
            />
            <Route
              path="/doctor/profile"
              element={
                <ProtectedRoute requiredRole={USER_ROLES.DOCTOR}>
                  <DoctorProfile />
                </ProtectedRoute>
              }
            />

            {/* Protected Routes - Admin */}
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute requiredRole={USER_ROLES.ADMIN}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/departments"
              element={
                <ProtectedRoute requiredRole={USER_ROLES.ADMIN}>
                  <AdminDepartments />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/schedules"
              element={
                <ProtectedRoute requiredRole={USER_ROLES.ADMIN}>
                  <AdminSchedules />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/appointments"
              element={
                <ProtectedRoute requiredRole={USER_ROLES.ADMIN}>
                  <AdminAppointments />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/medical-records"
              element={
                <ProtectedRoute requiredRole={USER_ROLES.ADMIN}>
                  <AdminMedicalRecords />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/feedback"
              element={
                <ProtectedRoute requiredRole={USER_ROLES.ADMIN}>
                  <AdminFeedback />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <ProtectedRoute requiredRole={USER_ROLES.ADMIN}>
                  <AdminUsers />
                </ProtectedRoute>
              }
            />

            {/* Dashboard Redirect */}
            <Route path="/dashboard" element={<DashboardRedirect />} />

            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <Toaster position="top-right" />
        </div>
      </Router>
    </AuthProvider>
  );
}

const DashboardRedirect = () => {
  const { user } = useAuth();
  
  if (!user) {
    return <Navigate to="/signin" replace />;
  }

  switch (user.role) {
    case USER_ROLES.ADMIN:
      return <Navigate to="/admin/dashboard" replace />;
    case USER_ROLES.DOCTOR:
      return <Navigate to="/doctor/dashboard" replace />;
    case USER_ROLES.PATIENT:
      return <Navigate to="/patient/dashboard" replace />;
    default:
      return <Navigate to="/signin" replace />;
  }
};

export default App;