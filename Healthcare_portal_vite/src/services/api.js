import axios from 'axios';
import toast from 'react-hot-toast';

// Base API URL - adjust this to match your Spring Boot server
const BASE_URL = 'http://localhost:8080/api';

// Create axios instance
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 second timeout for email operations
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    // Don't show error toasts for 401 errors on auth endpoints
    const currentPath = window.location.pathname;
    const isAuthEndpoint = currentPath.includes('/signin') || currentPath.includes('/signup');
    
    if (error.response?.status === 401) {
      // Only handle 401 errors for non-auth endpoints
      if (!isAuthEndpoint) {
        // Check if this is a token validation error vs other 401 errors
        const isTokenValidationError = error.config?.url?.includes('/auth/test-token');
        
        if (isTokenValidationError) {
          // Clear auth data but don't redirect immediately
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          
          // Show a toast notification instead of immediate redirect
          toast.error('Session expired. Please login again.');
          
          // Use a small delay before redirecting to allow the toast to show
          setTimeout(() => {
            window.location.href = '/signin';
          }, 2000);
        } else {
          // For other 401 errors, just show the error without logging out
          console.warn('401 error on non-token endpoint:', error.config?.url);
        }
      }
    } else if (error.response?.status === 403) {
      if (!isAuthEndpoint) {
        toast.error('Access denied. You do not have permission to perform this action.');
      }
    } else if (error.response?.status >= 500) {
      if (!isAuthEndpoint) {
        toast.error('Server error. Please try again later.');
      }
    } else if (error.code === 'ECONNABORTED') {
      if (!isAuthEndpoint) {
        toast.error('Request timeout. Please check your connection and try again.');
      }
    } else if (!error.response) {
      if (!isAuthEndpoint) {
        toast.error('Network error. Please check your connection and try again.');
      }
    }
    return Promise.reject(error);
  }
);

// User roles constants
export const USER_ROLES = {
  ADMIN: 'ROLE_ADMIN',
  DOCTOR: 'ROLE_DOCTOR',
  PATIENT: 'ROLE_PATIENT'
};

// Helper function to extract data from ApiResponse
const extractData = (response) => {
  // Check if response has the ApiResponse structure
  if (response.data && response.data.data !== undefined) {
    return response.data.data;
  }
  // If it's a direct response (like from some endpoints)
  return response.data;
};

// Helper function to handle API errors more gracefully
const handleApiError = (error, endpoint) => {
  console.error(`API Error for ${endpoint}:`, error);
  
  // Don't show toasts for auth-related errors on auth pages
  const currentPath = window.location.pathname;
  const isAuthPage = currentPath.includes('/signin') || currentPath.includes('/signup');
  
  if (isAuthPage) {
    return Promise.reject(error);
  }
  
  // For non-auth pages, show appropriate error messages
  if (error.response?.status === 401) {
    // Check if this is a token validation error
    const isTokenValidationError = error.config?.url?.includes('/auth/test-token');
    
    if (isTokenValidationError) {
      // Don't show toast for token validation errors, let the interceptor handle it
      return Promise.reject(error);
    } else {
      // For other 401 errors, show a more specific message
      toast.error('Authentication required. Please login again.');
      return Promise.reject(error);
    }
  } else if (error.response?.status === 403) {
    toast.error('Access denied. You do not have permission to perform this action.');
  } else if (error.response?.status >= 500) {
    toast.error('Server error. Please try again later.');
  } else if (error.code === 'ECONNABORTED') {
    toast.error('Request timeout. Please check your connection and try again.');
  } else if (!error.response) {
    toast.error('Network error. Please check your connection and try again.');
  } else {
    // Show the actual error message from the server if available
    const errorMessage = error.response?.data?.message || error.message || 'An error occurred';
    toast.error(errorMessage);
  }
  
  return Promise.reject(error);
};

// Auth API calls
export const authAPI = {
  signUp: async (userData) => {
    try {
      const response = await api.post('/auth/signup', userData);
      return response;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  signIn: async (credentials) => {
    try {
      const response = await api.post('/auth/signin', credentials);
      return response;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  testToken: async () => {
    try {
      const response = await api.post('/auth/test-token');
      return response;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  healthCheck: async () => {
    try {
      const response = await api.get('/health');
      return response;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // OTP and Password Reset Methods
  sendSignupOtp: async (email) => {
    try {
      const response = await api.post('/auth/send-signup-otp', { email });
      return response.data;
    } catch (error) {
      return handleApiError(error, 'auth/send-signup-otp');
    }
  },

  verifySignupOtp: async (email, otp) => {
    try {
      const response = await api.post('/auth/verify-signup-otp', { email, otp });
      return response.data;
    } catch (error) {
      return handleApiError(error, 'auth/verify-signup-otp');
    }
  },

  forgotPassword: async (email) => {
    try {
      const response = await api.post('/auth/forgot-password', { email });
      return response.data;
    } catch (error) {
      return handleApiError(error, 'auth/forgot-password');
    }
  },

  resetPassword: async (email, otp, newPassword) => {
    try {
      const response = await api.post('/auth/reset-password', { 
        email, 
        otp, 
        newPassword 
      });
      return response.data;
    } catch (error) {
      return handleApiError(error, 'auth/reset-password');
    }
  },
};

// Department API calls
export const departmentAPI = {
  getAll: async () => {
    try {
      const response = await api.get('/departments');
      return extractData(response);
    } catch (error) {
      return handleApiError(error, 'departments');
    }
  },

  getPublic: async () => {
    try {
      const response = await api.get('/departments/public');
      return extractData(response);
    } catch (error) {
      return handleApiError(error, 'departments/public');
    }
  },

  getById: async (id) => {
    try {
      const response = await api.get(`/departments/${id}`);
      return extractData(response);
    } catch (error) {
      return handleApiError(error, `departments/${id}`);
    }
  },

  create: async (departmentData) => {
    try {
      const response = await api.post('/departments', departmentData);
      return extractData(response);
    } catch (error) {
      return handleApiError(error, 'departments/create');
    }
  },

  update: async (id, departmentData) => {
    try {
      const response = await api.put(`/departments/${id}`, departmentData);
      return extractData(response);
    } catch (error) {
      return handleApiError(error, `departments/${id}/update`);
    }
  },

  delete: async (id) => {
    try {
      const response = await api.delete(`/departments/${id}`);
      return extractData(response);
    } catch (error) {
      return handleApiError(error, `departments/${id}/delete`);
    }
  },
};

// Doctor Schedule API calls
export const doctorScheduleAPI = {
  getAll: async () => {
    try {
      const response = await api.get('/doctor-schedules/all');
      return extractData(response);
    } catch (error) {
      return handleApiError(error, 'doctor-schedules/all');
    }
  },

  getById: async (id) => {
    try {
      const response = await api.get(`/doctor-schedules/${id}`);
      return extractData(response);
    } catch (error) {
      return handleApiError(error, `doctor-schedules/${id}`);
    }
  },

  getMySchedules: async () => {
    try {
      console.log('Calling getMySchedules API...');
      const token = localStorage.getItem('token');
      console.log('Token available:', !!token);
      const response = await api.get('/doctor-schedules/my-schedules');
      console.log('getMySchedules response:', response);
      return extractData(response);
    } catch (error) {
      console.error('getMySchedules error:', error);
      return handleApiError(error, 'doctor-schedules/my-schedules');
    }
  },

  getDoctorSchedules: async (doctorId) => {
    try {
      const response = await api.get(`/doctor-schedules/doctor/${doctorId}`);
      return extractData(response);
    } catch (error) {
      return handleApiError(error, `doctor-schedules/doctor/${doctorId}`);
    }
  },

  create: async (scheduleData) => {
    try {
      console.log('Creating schedule with data:', scheduleData);
      const response = await api.post('/doctor-schedules', scheduleData);
      console.log('Create schedule response:', response);
      return extractData(response);
    } catch (error) {
      console.error('Create schedule error:', error);
      return handleApiError(error, 'doctor-schedules/create');
    }
  },

  update: async (id, scheduleData) => {
    try {
      console.log('Updating schedule with data:', scheduleData);
      const response = await api.put(`/doctor-schedules/${id}`, scheduleData);
      console.log('Update schedule response:', response);
      return extractData(response);
    } catch (error) {
      console.error('Update schedule error:', error);
      return handleApiError(error, `doctor-schedules/${id}/update`);
    }
  },

  delete: async (id) => {
    try {
      const response = await api.delete(`/doctor-schedules/${id}`);
      return extractData(response);
    } catch (error) {
      return handleApiError(error, `doctor-schedules/${id}/delete`);
    }
  },

  deleteMySchedule: async (id) => {
    try {
      console.log('Deleting my schedule with ID:', id);
      const response = await api.delete(`/doctor-schedules/my-schedules/${id}`);
      console.log('Delete my schedule response:', response);
      return extractData(response);
    } catch (error) {
      console.error('Delete my schedule error:', error);
      return handleApiError(error, `doctor-schedules/my-schedules/${id}/delete`);
    }
  },

  getAvailableSchedules: async (date) => {
    try {
      const response = await api.get(`/doctor-schedules/available?date=${date}`);
      return extractData(response);
    } catch (error) {
      return handleApiError(error, `doctor-schedules/available`);
    }
  },

  bookSchedule: async (scheduleId) => {
    try {
      const response = await api.post(`/doctor-schedules/${scheduleId}/book`);
      return extractData(response);
    } catch (error) {
      return handleApiError(error, `doctor-schedules/${scheduleId}/book`);
    }
  },
};

// Appointment API calls
export const appointmentAPI = {
  getAll: async () => {
    try {
      const response = await api.get('/appointments/all');
      return extractData(response);
    } catch (error) {
      return handleApiError(error, 'appointments/all');
    }
  },

  getById: async (id) => {
    try {
      const response = await api.get(`/appointments/${id}`);
      return extractData(response);
    } catch (error) {
      return handleApiError(error, `appointments/${id}`);
    }
  },

  getMyAppointments: async () => {
    try {
      const response = await api.get('/appointments/my');
      return extractData(response);
    } catch (error) {
      return handleApiError(error, 'appointments/my');
    }
  },

  getMyPatientAppointments: async () => {
    try {
      const response = await api.get('/appointments/my-patients');
      return extractData(response);
    } catch (error) {
      return handleApiError(error, 'appointments/my-patients');
    }
  },

  create: async (appointmentData) => {
    try {
      const response = await api.post('/appointments', appointmentData);
      return extractData(response);
    } catch (error) {
      return handleApiError(error, 'appointments/create');
    }
  },

  update: async (id, appointmentData) => {
    try {
      const response = await api.put(`/appointments/${id}`, appointmentData);
      return extractData(response);
    } catch (error) {
      return handleApiError(error, `appointments/${id}/update`);
    }
  },

  updateStatus: async (id, status) => {
    try {
      const response = await api.put(`/appointments/${id}/status?status=${status}`);
      return extractData(response);
    } catch (error) {
      return handleApiError(error, `appointments/${id}/status`);
    }
  },

  delete: async (id) => {
    try {
      const response = await api.delete(`/appointments/${id}`);
      return extractData(response);
    } catch (error) {
      return handleApiError(error, `appointments/${id}/delete`);
    }
  },

  getAppointmentsByPatient: async (patientId) => {
    try {
      const response = await api.get(`/appointments/patient/${patientId}`);
      return extractData(response);
    } catch (error) {
      return handleApiError(error, `appointments/patient/${patientId}`);
    }
  },

  cancelAppointment: async (id) => {
    try {
      const response = await api.put(`/appointments/${id}/cancel`);
      return extractData(response);
    } catch (error) {
      return handleApiError(error, `appointments/${id}/cancel`);
    }
  },

  completeAppointment: async (id) => {
    try {
      const response = await api.put(`/appointments/${id}/complete`);
      return extractData(response);
    } catch (error) {
      return handleApiError(error, `appointments/${id}/complete`);
    }
  },
};

// Medical Record API calls
export const medicalRecordAPI = {
  getAll: async () => {
    try {
      const response = await api.get('/medical-records/all');
      return extractData(response);
    } catch (error) {
      return handleApiError(error, 'medical-records/all');
    }
  },

  getById: async (id) => {
    try {
      const response = await api.get(`/medical-records/${id}`);
      return extractData(response);
    } catch (error) {
      return handleApiError(error, `medical-records/${id}`);
    }
  },

  getMyMedicalRecords: async () => {
    try {
      const response = await api.get('/medical-records/my');
      return extractData(response);
    } catch (error) {
      return handleApiError(error, 'medical-records/my');
    }
  },

  getMyPatientMedicalRecords: async () => {
    try {
      const response = await api.get('/medical-records/my-patients');
      return extractData(response);
    } catch (error) {
      return handleApiError(error, 'medical-records/my-patients');
    }
  },

  create: async (medicalRecordData) => {
    try {
      const response = await api.post('/medical-records', medicalRecordData);
      return extractData(response);
    } catch (error) {
      return handleApiError(error, 'medical-records/create');
    }
  },

  update: async (id, medicalRecordData) => {
    try {
      const response = await api.put(`/medical-records/${id}`, medicalRecordData);
      return extractData(response);
    } catch (error) {
      return handleApiError(error, `medical-records/${id}/update`);
    }
  },

  delete: async (id) => {
    try {
      const response = await api.delete(`/medical-records/${id}`);
      return extractData(response);
    } catch (error) {
      return handleApiError(error, `medical-records/${id}/delete`);
    }
  },

  getMedicalRecordsByPatient: async (patientId) => {
    try {
      const response = await api.get(`/medical-records/patient/${patientId}`);
      return extractData(response);
    } catch (error) {
      return handleApiError(error, `medical-records/patient/${patientId}`);
    }
  },

  getMedicalRecordsByPatientAndDoctor: async (patientId, doctorId) => {
    try {
      const response = await api.get(`/medical-records/patient/${patientId}/doctor/${doctorId}`);
      return extractData(response);
    } catch (error) {
      return handleApiError(error, `medical-records/patient/${patientId}/doctor/${doctorId}`);
    }
  },
};

// Feedback API calls
export const feedbackAPI = {
  getAll: async () => {
    try {
      const response = await api.get('/feedback/all');
      return extractData(response);
    } catch (error) {
      return handleApiError(error, 'feedback/all');
    }
  },

  getPublicFeedback: async () => {
    try {
      const response = await api.get('/feedback/all/public');
      return extractData(response);
    } catch (error) {
      return handleApiError(error, 'feedback/all/public');
    }
  },

  getById: async (id) => {
    try {
      const response = await api.get(`/feedback/${id}`);
      return extractData(response);
    } catch (error) {
      return handleApiError(error, `feedback/${id}`);
    }
  },

  getMyFeedback: async () => {
    try {
      const response = await api.get('/feedback/my');
      return extractData(response);
    } catch (error) {
      return handleApiError(error, 'feedback/my');
    }
  },

  getMyPatientFeedback: async () => {
    try {
      const response = await api.get('/feedback/my-patients');
      return extractData(response);
    } catch (error) {
      return handleApiError(error, 'feedback/my-patients');
    }
  },

  getGeneralFeedback: async () => {
    try {
      const response = await api.get('/feedback/general');
      return extractData(response);
    } catch (error) {
      return handleApiError(error, 'feedback/general');
    }
  },

  getDoctorSpecificFeedback: async () => {
    try {
      const response = await api.get('/feedback/doctor-specific');
      return extractData(response);
    } catch (error) {
      return handleApiError(error, 'feedback/doctor-specific');
    }
  },

  create: async (feedbackData) => {
    try {
      const response = await api.post('/feedback', feedbackData);
      return extractData(response);
    } catch (error) {
      return handleApiError(error, 'feedback/create');
    }
  },

  update: async (id, feedbackData) => {
    try {
      const response = await api.put(`/feedback/${id}`, feedbackData);
      return extractData(response);
    } catch (error) {
      return handleApiError(error, `feedback/${id}/update`);
    }
  },

  delete: async (id) => {
    try {
      const response = await api.delete(`/feedback/${id}`);
      return extractData(response);
    } catch (error) {
      return handleApiError(error, `feedback/${id}/delete`);
    }
  },

  getFeedbackByPatient: async (patientId) => {
    try {
      const response = await api.get(`/feedback/patient/${patientId}`);
      return extractData(response);
    } catch (error) {
      return handleApiError(error, `feedback/patient/${patientId}`);
    }
  },

  getFeedbackByPatientAndDoctor: async (patientId, doctorId) => {
    try {
      const response = await api.get(`/feedback/patient/${patientId}/doctor/${doctorId}`);
      return extractData(response);
    } catch (error) {
      return handleApiError(error, `feedback/patient/${patientId}/doctor/${doctorId}`);
    }
  },
};

// User API calls
export const userAPI = {
  getAll: async () => {
    try {
      const response = await api.get('/users/all');
      return extractData(response);
    } catch (error) {
      return handleApiError(error, 'users/all');
    }
  },

  getById: async (id) => {
    try {
      const response = await api.get(`/users/${id}`);
      return extractData(response);
    } catch (error) {
      return handleApiError(error, `users/${id}`);
    }
  },

  getProfile: async () => {
    try {
      const response = await api.get('/users/profile');
      return extractData(response);
    } catch (error) {
      return handleApiError(error, 'users/profile');
    }
  },

  getUsersByRole: async (role) => {
    try {
      const response = await api.get(`/users/role/${role}`);
      return extractData(response);
    } catch (error) {
      return handleApiError(error, `users/role/${role}`);
    }
  },

  getDoctors: async () => {
    try {
      const response = await api.get('/users/doctors');
      return extractData(response);
    } catch (error) {
      return handleApiError(error, 'users/doctors');
    }
  },

  getPublicDoctors: async () => {
    try {
      const response = await api.get('/users/doctors/public');
      return extractData(response);
    } catch (error) {
      return handleApiError(error, 'users/doctors/public');
    }
  },

  getPatients: async () => {
    try {
      const response = await api.get('/users/patients');
      return extractData(response);
    } catch (error) {
      return handleApiError(error, 'users/patients');
    }
  },

  create: async (userData) => {
    try {
      const response = await api.post('/auth/admin/create-user', userData);
      return extractData(response);
    } catch (error) {
      return handleApiError(error, 'auth/admin/create-user');
    }
  },

  update: async (id, userData) => {
    try {
      const response = await api.put(`/users/${id}`, userData);
      return extractData(response);
    } catch (error) {
      return handleApiError(error, `users/${id}/update`);
    }
  },

  updateProfile: async (userData) => {
    try {
      const response = await api.put('/users/profile', userData);
      return extractData(response);
    } catch (error) {
      return handleApiError(error, 'users/profile/update');
    }
  },

  delete: async (id) => {
    try {
      const response = await api.delete(`/users/${id}`);
      return extractData(response);
    } catch (error) {
      return handleApiError(error, `users/${id}/delete`);
    }
  },

  updateStatus: async (id, status) => {
    try {
      const response = await api.put(`/users/${id}/status?status=${status}`);
      return extractData(response);
    } catch (error) {
      return handleApiError(error, `users/${id}/status`);
    }
  },
};