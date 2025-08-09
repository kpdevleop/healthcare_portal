import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ArrowLeft, Shield } from 'lucide-react';
import toast from 'react-hot-toast';
import { authAPI } from '../services/api';

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: email, 2: otp, 3: new password
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    email: '',
    otp: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [errors, setErrors] = useState({});

  const validateEmail = (email) => {
    return /\S+@\S+\.\S+/.test(email);
  };

  const validatePassword = (password) => {
    return password.length >= 8 && 
           /[A-Z]/.test(password) && 
           /[a-z]/.test(password) && 
           /[0-9]/.test(password) && 
           /[^A-Za-z0-9]/.test(password);
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.email.trim()) {
      setErrors({ email: 'Email is required' });
      return;
    }
    
    if (!validateEmail(formData.email)) {
      setErrors({ email: 'Please enter a valid email address' });
      return;
    }
    
    setLoading(true);
    try {
      const response = await authAPI.forgotPassword(formData.email);
      if (response.success) {
        toast.success('Password reset OTP sent to your email');
        setStep(2);
        setErrors({});
      } else {
        toast.error(response.message || 'Failed to send OTP');
      }
    } catch (error) {
      toast.error(error.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.otp.trim()) {
      setErrors({ otp: 'OTP is required' });
      return;
    }
    
    if (formData.otp.length !== 6) {
      setErrors({ otp: 'OTP must be 6 digits' });
      return;
    }
    
    setStep(3);
    setErrors({});
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    // Validate password
    if (!formData.newPassword) {
      setErrors({ newPassword: 'Password is required' });
      return;
    }
    
    if (!validatePassword(formData.newPassword)) {
      setErrors({ 
        newPassword: 'Password must be at least 8 characters with uppercase, lowercase, number, and special character' 
      });
      return;
    }
    
    if (formData.newPassword !== formData.confirmPassword) {
      setErrors({ confirmPassword: 'Passwords do not match' });
      return;
    }
    
    setLoading(true);
    try {
      const response = await authAPI.resetPassword(formData.email, formData.otp, formData.newPassword);
      if (response.success) {
        toast.success('Password reset successfully!');
        navigate('/signin');
      } else {
        toast.error(response.message || 'Failed to reset password');
      }
    } catch (error) {
      toast.error(error.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
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
  };

  const getPasswordStrength = () => {
    if (!formData.newPassword) return { strength: 0, color: 'bg-gray-200', text: '' };
    
    let strength = 0;
    if (formData.newPassword.length >= 8) strength++;
    if (/[A-Z]/.test(formData.newPassword)) strength++;
    if (/[a-z]/.test(formData.newPassword)) strength++;
    if (/[0-9]/.test(formData.newPassword)) strength++;
    if (/[^A-Za-z0-9]/.test(formData.newPassword)) strength++;
    
    const colors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-blue-500', 'bg-green-500'];
    const texts = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
    
    return {
      strength: Math.min(strength, 5),
      color: colors[strength - 1] || 'bg-gray-200',
      text: texts[strength - 1] || ''
    };
  };

  const passwordStrength = getPasswordStrength();

  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <Link to="/signin" className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Sign In
          </Link>
          <div className="flex justify-center">
            <Shield className="h-12 w-12 text-primary-600" />
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            {step === 1 && 'Forgot Password'}
            {step === 2 && 'Enter OTP'}
            {step === 3 && 'Reset Password'}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {step === 1 && 'Enter your email to receive a password reset code'}
            {step === 2 && 'Enter the 6-digit code sent to your email'}
            {step === 3 && 'Create a new password for your account'}
          </p>
        </div>

        {/* Form */}
        <div className="card">
          {step === 1 && (
            <form onSubmit={handleEmailSubmit} className="space-y-6">
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

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Sending OTP...
                  </div>
                ) : (
                  'Send Reset Code'
                )}
              </button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleOtpSubmit} className="space-y-6">
              <div>
                <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-2">
                  Verification Code
                </label>
                <input
                  id="otp"
                  name="otp"
                  type="text"
                  maxLength="6"
                  className={`input-field text-center text-2xl tracking-widest ${errors.otp ? 'border-red-500 focus:ring-red-500' : ''}`}
                  placeholder="000000"
                  value={formData.otp}
                  onChange={handleChange}
                  required
                />
                {errors.otp && (
                  <p className="text-red-600 text-sm mt-1">{errors.otp}</p>
                )}
                <p className="text-sm text-gray-500 mt-2">
                  Enter the 6-digit code sent to {formData.email}
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
                  disabled={loading}
                  className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Verifying...' : 'Verify Code'}
                </button>
              </div>
            </form>
          )}

          {step === 3 && (
            <form onSubmit={handlePasswordSubmit} className="space-y-6">
              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  New Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="newPassword"
                    name="newPassword"
                    type={showPassword ? 'text' : 'password'}
                    className={`input-field pl-10 pr-10 ${errors.newPassword ? 'border-red-500 focus:ring-red-500' : ''}`}
                    placeholder="Enter new password"
                    value={formData.newPassword}
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
                {formData.newPassword && (
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
                {errors.newPassword && (
                  <p className="text-red-600 text-sm mt-1">{errors.newPassword}</p>
                )}
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm New Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    className={`input-field pl-10 pr-10 ${errors.confirmPassword ? 'border-red-500 focus:ring-red-500' : ''}`}
                    placeholder="Confirm new password"
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
                {formData.confirmPassword && formData.newPassword === formData.confirmPassword && (
                  <p className="text-green-600 text-sm mt-1">Passwords match</p>
                )}
                {errors.confirmPassword && (
                  <p className="text-red-600 text-sm mt-1">{errors.confirmPassword}</p>
                )}
              </div>

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="flex-1 btn-secondary"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Resetting...
                    </div>
                  ) : (
                    'Reset Password'
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
