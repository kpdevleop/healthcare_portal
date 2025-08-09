import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff, Heart, Lock, Mail, User, ArrowLeft, Shield, Stethoscope } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { departmentAPI, authAPI } from '../services/api';

const roleOptions = [
  {
    value: 'ROLE_PATIENT',
    label: 'Patient',
    description: 'Access your health records and book appointments',
    icon: <Heart className="h-6 w-6" />,
    color: 'text-primary-600',
    bgColor: 'bg-primary-50',
    borderColor: 'border-primary-200',
  },
  {
    value: 'ROLE_DOCTOR',
    label: 'Doctor',
    description: 'Manage patients and medical records',
    icon: <Stethoscope className="h-6 w-6" />,
    color: 'text-secondary-600',
    bgColor: 'bg-secondary-50',
    borderColor: 'border-secondary-200',
  },
];

const SignUpPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState('ROLE_PATIENT');
  const [departments, setDepartments] = useState([]);
  const [step, setStep] = useState(1); // 1: signup form, 2: OTP verification
  const [otp, setOtp] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'ROLE_PATIENT',
    // Patient-specific fields
    dateOfBirth: '',
    gender: '',
    address: '',
    // Doctor-specific fields
    specialization: '',
    licenseNumber: '',
    experienceYears: '',
    departmentId: ''
  });
  const [errors, setErrors] = useState({});
  
  const { signup, user, loading: authLoading, isAuthenticated, error, clearError } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const roleParam = searchParams.get('role');
    if (roleParam) {
      let role = 'ROLE_PATIENT';
      if (roleParam.toLowerCase() === 'doctor') role = 'ROLE_DOCTOR';
      setSelectedRole(role);
      setFormData(prev => ({ ...prev, role }));
    }
  }, [searchParams]);

  useEffect(() => {
    if (isAuthenticated && user) {
      let redirectPath = '/patient/dashboard'; // Default to patient dashboard
      if (user.role === 'ROLE_ADMIN') {
        redirectPath = '/admin/dashboard';
      } else if (user.role === 'ROLE_DOCTOR') {
        redirectPath = '/doctor/dashboard';
      } else if (user.role === 'ROLE_PATIENT') {
        redirectPath = '/patient/dashboard';
      }
      navigate(redirectPath, { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  // Fetch departments on component mount
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const data = await departmentAPI.getPublic();
        if (Array.isArray(data)) {
          setDepartments(data);
        } else {
          console.error('Departments data is not an array:', data);
          setDepartments([]);
        }
      } catch (error) {
        console.error('Error fetching departments:', error);
        setDepartments([]);
      }
    };

    fetchDepartments();
  }, []);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }
    
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // Role-specific validation
    if (formData.role === 'ROLE_PATIENT') {
      if (!formData.dateOfBirth) {
        newErrors.dateOfBirth = 'Date of birth is required';
      }
      if (!formData.gender) {
        newErrors.gender = 'Gender is required';
      }
      if (!formData.address.trim()) {
        newErrors.address = 'Address is required';
      }
    }

    if (formData.role === 'ROLE_DOCTOR') {
      if (!formData.specialization.trim()) {
        newErrors.specialization = 'Specialization is required';
      }
      if (!formData.licenseNumber.trim()) {
        newErrors.licenseNumber = 'License number is required';
      }
      if (!formData.experienceYears) {
        newErrors.experienceYears = 'Years of experience is required';
      }
      if (!formData.departmentId) {
        newErrors.departmentId = 'Department is required';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    
    // Clear specific field error when user starts typing
    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: '',
      });
    }
    
    if (error) clearError();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      // First, send OTP for email verification
      const response = await authAPI.sendSignupOtp(formData.email);
      if (response.success) {
        toast.success('Verification code sent to your email');
        setStep(2);
      } else {
        toast.error(response.message || 'Failed to send verification code');
      }
    } catch (error) {
      toast.error(error.message || 'Failed to send verification code');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    
    if (!otp.trim()) {
      toast.error('Please enter the verification code');
      return;
    }
    
    if (otp.length !== 6) {
      toast.error('Verification code must be 6 digits');
      return;
    }
    
    setOtpLoading(true);
    
    try {
      // Verify OTP
      const response = await authAPI.verifySignupOtp(formData.email, otp);
      
      if (response.success) {
        // If OTP is verified, proceed with signup
        const userData = {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phoneNumber: formData.phone,
          password: formData.password,
          role: formData.role,
          // Include role-specific fields
          ...(formData.role === 'ROLE_PATIENT' && {
            dateOfBirth: formData.dateOfBirth,
            gender: formData.gender,
            address: formData.address,
          }),
          ...(formData.role === 'ROLE_DOCTOR' && {
            specialization: formData.specialization,
            licenseNumber: formData.licenseNumber,
            experienceYears: parseInt(formData.experienceYears),
            departmentId: parseInt(formData.departmentId),
          }),
        };
        
        const result = await signup(userData);
        if (result.success) {
          toast.success('Account created successfully! Welcome aboard!');
        } else {
          toast.error(result.error || 'Failed to create account');
        }
      } else {
        toast.error(response.message || 'Invalid verification code');
      }
    } catch (error) {
      toast.error(error.message || 'Invalid verification code');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setOtpLoading(true);
    try {
      const response = await authAPI.sendSignupOtp(formData.email);
      if (response.success) {
        toast.success('Verification code resent to your email');
      } else {
        toast.error(response.message || 'Failed to resend verification code');
      }
    } catch (error) {
      toast.error(error.message || 'Failed to resend verification code');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    setFormData(prev => ({ ...prev, role }));
  };

  const getPasswordStrength = () => {
    if (!formData.password) return { strength: 0, color: 'bg-gray-200', text: '' };
    
    let strength = 0;
    if (formData.password.length >= 6) strength++;
    if (/[A-Z]/.test(formData.password)) strength++;
    if (/[a-z]/.test(formData.password)) strength++;
    if (/[0-9]/.test(formData.password)) strength++;
    if (/[^A-Za-z0-9]/.test(formData.password)) strength++;
    
    const colors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-blue-500', 'bg-green-500'];
    const texts = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
    
    return {
      strength: Math.min(strength, 5),
      color: colors[strength - 1] || 'bg-gray-200',
      text: texts[strength - 1] || ''
    };
  };

  const passwordStrength = getPasswordStrength();

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <Link to="/" className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
          <div className="flex justify-center">
            <Heart className="h-12 w-12 text-primary-600" />
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Create Account
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Join our healthcare portal community
          </p>
        </div>

        {/* Sign Up Form */}
        <div className="card">
          {step === 1 ? (
            <form className="space-y-6" onSubmit={handleSubmit}>
              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
                  <div className="text-sm text-red-700">
                    {error}
                  </div>
                </div>
              )}

              {/* Name Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                    First Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="firstName"
                      name="firstName"
                      type="text"
                      autoComplete="given-name"
                      className={`input-field pl-10 ${errors.firstName ? 'border-red-500 focus:ring-red-500' : ''}`}
                      placeholder="First name"
                      value={formData.firstName}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  {errors.firstName && (
                    <p className="text-red-600 text-sm mt-1">{errors.firstName}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="lastName"
                      name="lastName"
                      type="text"
                      autoComplete="family-name"
                      className={`input-field pl-10 ${errors.lastName ? 'border-red-500 focus:ring-red-500' : ''}`}
                      placeholder="Last name"
                      value={formData.lastName}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  {errors.lastName && (
                    <p className="text-red-600 text-sm mt-1">{errors.lastName}</p>
                  )}
                </div>
              </div>

              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    className={`input-field pl-10 ${errors.email ? 'border-red-500 focus:ring-red-500' : ''}`}
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
                {errors.email && (
                  <p className="text-red-600 text-sm mt-1">{errors.email}</p>
                )}
              </div>

              {/* Phone Field */}
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    autoComplete="tel"
                    className={`input-field pl-10 ${errors.phone ? 'border-red-500 focus:ring-red-500' : ''}`}
                    placeholder="Enter your phone number"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                  />
                </div>
                {errors.phone && (
                  <p className="text-red-600 text-sm mt-1">{errors.phone}</p>
                )}
              </div>

              {/* Role Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-4">
                  Select Your Role
                </label>
                <div className="grid grid-cols-1 gap-3">
                  {roleOptions.map((role) => (
                    <div
                      key={role.value}
                      onClick={() => handleRoleSelect(role.value)}
                      className={`relative cursor-pointer rounded-lg border-2 p-4 transition-all hover:shadow-md ${
                        selectedRole === role.value
                          ? `${role.borderColor} ${role.bgColor}`
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`${role.color}`}>{role.icon}</div>
                        <div className="flex-1">
                          <h3 className="text-sm font-medium text-gray-900">{role.label}</h3>
                          <p className="text-xs text-gray-500">{role.description}</p>
                        </div>
                        {selectedRole === role.value && (
                          <div className="absolute top-2 right-2">
                            <div className="w-4 h-4 bg-primary-600 rounded-full flex items-center justify-center">
                              <div className="w-2 h-2 bg-white rounded-full"></div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Role-specific fields */}
              {selectedRole === 'ROLE_PATIENT' && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700 mb-2">
                        Date of Birth
                      </label>
                      <input
                        id="dateOfBirth"
                        name="dateOfBirth"
                        type="date"
                        className={`input-field ${errors.dateOfBirth ? 'border-red-500 focus:ring-red-500' : ''}`}
                        value={formData.dateOfBirth}
                        onChange={handleChange}
                        required
                      />
                      {errors.dateOfBirth && (
                        <p className="text-red-600 text-sm mt-1">{errors.dateOfBirth}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-2">
                        Gender
                      </label>
                      <select
                        id="gender"
                        name="gender"
                        className={`input-field ${errors.gender ? 'border-red-500 focus:ring-red-500' : ''}`}
                        value={formData.gender}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Select gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                      {errors.gender && (
                        <p className="text-red-600 text-sm mt-1">{errors.gender}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                      Address
                    </label>
                    <textarea
                      id="address"
                      name="address"
                      rows="3"
                      className={`input-field ${errors.address ? 'border-red-500 focus:ring-red-500' : ''}`}
                      placeholder="Enter your address"
                      value={formData.address}
                      onChange={handleChange}
                      required
                    />
                    {errors.address && (
                      <p className="text-red-600 text-sm mt-1">{errors.address}</p>
                    )}
                  </div>
                </>
              )}

              {selectedRole === 'ROLE_DOCTOR' && (
                <>
                  <div>
                    <label htmlFor="specialization" className="block text-sm font-medium text-gray-700 mb-2">
                      Specialization
                    </label>
                    <input
                      id="specialization"
                      name="specialization"
                      type="text"
                      className={`input-field ${errors.specialization ? 'border-red-500 focus:ring-red-500' : ''}`}
                      placeholder="e.g., Cardiology, Neurology"
                      value={formData.specialization}
                      onChange={handleChange}
                      required
                    />
                    {errors.specialization && (
                      <p className="text-red-600 text-sm mt-1">{errors.specialization}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="licenseNumber" className="block text-sm font-medium text-gray-700 mb-2">
                      License Number
                    </label>
                    <input
                      id="licenseNumber"
                      name="licenseNumber"
                      type="text"
                      className={`input-field ${errors.licenseNumber ? 'border-red-500 focus:ring-red-500' : ''}`}
                      placeholder="Enter your medical license number"
                      value={formData.licenseNumber}
                      onChange={handleChange}
                      required
                    />
                    {errors.licenseNumber && (
                      <p className="text-red-600 text-sm mt-1">{errors.licenseNumber}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="experienceYears" className="block text-sm font-medium text-gray-700 mb-2">
                      Years of Experience
                    </label>
                    <input
                      id="experienceYears"
                      name="experienceYears"
                      type="number"
                      min="0"
                      max="50"
                      className={`input-field ${errors.experienceYears ? 'border-red-500 focus:ring-red-500' : ''}`}
                      placeholder="Number of years"
                      value={formData.experienceYears}
                      onChange={handleChange}
                      required
                    />
                    {errors.experienceYears && (
                      <p className="text-red-600 text-sm mt-1">{errors.experienceYears}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="departmentId" className="block text-sm font-medium text-gray-700 mb-2">
                      Department
                    </label>
                    <select
                      id="departmentId"
                      name="departmentId"
                      className={`input-field ${errors.departmentId ? 'border-red-500 focus:ring-red-500' : ''}`}
                      value={formData.departmentId}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select department</option>
                      {departments.map((dept) => (
                        <option key={dept.id} value={dept.id}>
                          {dept.name}
                        </option>
                      ))}
                    </select>
                    {errors.departmentId && (
                      <p className="text-red-600 text-sm mt-1">{errors.departmentId}</p>
                    )}
                  </div>
                </>
              )}

              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    className={`input-field pl-10 pr-10 ${errors.password ? 'border-red-500 focus:ring-red-500' : ''}`}
                    placeholder="Create a strong password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
                {formData.password && (
                  <div className="mt-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500">Password strength:</span>
                      <span className="font-medium text-gray-700">{passwordStrength.text}</span>
                    </div>
                    <div className="mt-1 flex space-x-1">
                      {[1, 2, 3, 4, 5].map((level) => (
                        <div
                          key={level}
                          className={`h-1 flex-1 rounded-full transition-colors ${
                            level <= passwordStrength.strength ? passwordStrength.color : 'bg-gray-200'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                )}
                {errors.password && (
                  <p className="text-red-600 text-sm mt-1">{errors.password}</p>
                )}
              </div>

              {/* Confirm Password Field */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    className={`input-field pl-10 pr-10 ${errors.confirmPassword ? 'border-red-500 focus:ring-red-500' : ''}`}
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
                {formData.confirmPassword && formData.password === formData.confirmPassword && (
                  <p className="text-green-600 text-sm mt-1">Passwords match</p>
                )}
                {errors.confirmPassword && (
                  <p className="text-red-600 text-sm mt-1">{errors.confirmPassword}</p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Sending verification code...
                  </div>
                ) : (
                  'Continue to Verification'
                )}
              </button>
            </form>
          ) : (
            /* OTP Verification Step */
            <form className="space-y-6" onSubmit={handleOtpSubmit}>
              <div className="text-center">
                <div className="flex justify-center mb-4">
                  <Shield className="h-12 w-12 text-primary-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Verify Your Email</h3>
                <p className="text-sm text-gray-600 mb-6">
                  We've sent a 6-digit verification code to <strong>{formData.email}</strong>
                </p>
              </div>

              <div>
                <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-2">
                  Verification Code
                </label>
                <input
                  id="otp"
                  name="otp"
                  type="text"
                  maxLength="6"
                  className="input-field text-center text-2xl tracking-widest"
                  placeholder="000000"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                />
                <p className="text-sm text-gray-500 mt-2">
                  Enter the 6-digit code sent to your email
                </p>
              </div>

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 btn-secondary"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={otpLoading}
                  className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {otpLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Verifying...
                    </div>
                  ) : (
                    'Verify & Create Account'
                  )}
                </button>
              </div>

              <div className="text-center">
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={otpLoading}
                  className="text-sm text-primary-600 hover:text-primary-700 disabled:opacity-50"
                >
                  Didn't receive the code? Resend
                </button>
              </div>
            </form>
          )}

          {/* Sign In Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link
                to="/signin"
                className="font-medium text-primary-600 hover:text-primary-700"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;