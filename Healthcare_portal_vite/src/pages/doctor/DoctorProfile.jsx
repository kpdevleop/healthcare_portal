import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../components/DashboardLayout';
import { userAPI, departmentAPI } from '../../services/api';
import { User, Mail, Phone, MapPin, Calendar, Stethoscope, Building, Save, Edit } from 'lucide-react';
import toast from 'react-hot-toast';

const DoctorProfile = () => {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const [userData, setUserData] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    specialization: '',
    experienceYears: '',
    departmentId: ''
  });

  useEffect(() => {
    fetchUserData();
    fetchDepartments();
  }, []);

  // Debug useEffect to log form data changes
  useEffect(() => {
    console.log('editFormData changed:', editFormData);
  }, [editFormData]);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const userDataResponse = await userAPI.getProfile();
      console.log('Profile API Response:', userDataResponse); // Debug log
      setUserData(userDataResponse);
      setEditFormData({
        firstName: userDataResponse.firstName || '',
        lastName: userDataResponse.lastName || '',
        email: userDataResponse.email || '',
        phoneNumber: userDataResponse.phoneNumber || userDataResponse.phone || '',
        specialization: userDataResponse.specialization || '',
        experienceYears: userDataResponse.experienceYears !== null && userDataResponse.experienceYears !== undefined ? userDataResponse.experienceYears.toString() : '',
        departmentId: userDataResponse.departmentId || userDataResponse.department?.id || ''
      });
      console.log('Set form data:', {
        firstName: userDataResponse.firstName || '',
        lastName: userDataResponse.lastName || '',
        email: userDataResponse.email || '',
        phoneNumber: userDataResponse.phoneNumber || userDataResponse.phone || '',
        specialization: userDataResponse.specialization || '',
        experienceYears: userDataResponse.experienceYears !== null && userDataResponse.experienceYears !== undefined ? userDataResponse.experienceYears.toString() : '',
        departmentId: userDataResponse.departmentId || userDataResponse.department?.id || ''
      }); // Debug log
    } catch (error) {
      console.error('Error fetching user data:', error);
      toast.error('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const departmentsData = await departmentAPI.getAll();
      setDepartments(departmentsData || []);
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const updateData = {
        ...editFormData,
        id: userData.id, // Use id from fetched profile
        role: userData.role,
        // Send both experienceYears and experience for compatibility
        experienceYears: editFormData.experienceYears ? parseInt(editFormData.experienceYears) : null,
        experience: editFormData.experienceYears
      };
      await userAPI.updateProfile(updateData);
      const updatedUserData = { ...userData, ...editFormData };
      setUserData(updatedUserData);
      updateUser(updatedUserData);
      setIsEditing(false);
      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not available';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return 'Invalid Date';
    }
  };

  if (loading && !userData) {
    return (
      <DashboardLayout title="My Profile">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="My Profile">
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Doctor Profile
              </h2>
              <p className="text-gray-600">
                Manage your personal and professional information
              </p>
            </div>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="flex items-center px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              {isEditing ? (
                <>
                  <Edit className="h-4 w-4 mr-2" />
                  Cancel Edit
                </>
              ) : (
                <>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Profile
                </>
              )}
            </button>
          </div>
        </div>

        {/* Profile Form */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Doctor Information</h3>
          </div>
          <div className="p-6">
            <form onSubmit={handleSave}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Personal Information */}
                <div className="space-y-4">
                  <h4 className="text-md font-medium text-gray-900 mb-4">Personal Details</h4>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      First Name *
                    </label>
                    <input
                      type="text"
                      value={editFormData.firstName}
                      onChange={(e) => setEditFormData({ ...editFormData, firstName: e.target.value })}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      value={editFormData.lastName}
                      onChange={(e) => setEditFormData({ ...editFormData, lastName: e.target.value })}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      value={editFormData.email}
                      onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={editFormData.phoneNumber}
                      onChange={(e) => setEditFormData({ ...editFormData, phoneNumber: e.target.value })}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                    />
                  </div>
                </div>

                {/* Professional Information */}
                <div className="space-y-4">
                  <h4 className="text-md font-medium text-gray-900 mb-4">Professional Details</h4>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Specialization *
                    </label>
                    <input
                      type="text"
                      value={editFormData.specialization}
                      onChange={(e) => setEditFormData({ ...editFormData, specialization: e.target.value })}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Years of Experience
                    </label>
                    <input
                      type="number"
                      value={editFormData.experienceYears}
                      onChange={(e) => setEditFormData({ ...editFormData, experienceYears: e.target.value })}
                      disabled={!isEditing}
                      placeholder="e.g., 10"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Department
                    </label>
                    <select
                      value={editFormData.departmentId}
                      onChange={(e) => setEditFormData({ ...editFormData, departmentId: e.target.value })}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                    >
                      <option value="">Select Department</option>
                      {departments.map((dept) => (
                        <option key={dept.id} value={dept.id}>
                          {dept.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  {/* Current Information Display */}
                  <div className="mt-8 p-4 bg-gray-50 rounded-lg">
                    <h5 className="text-sm font-medium text-gray-900 mb-3">Current Information</h5>
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center">
                        <User className="h-4 w-4 mr-2" />
                        <span>Role: Doctor</span>
                      </div>
                      <div className="flex items-center">
                        <Mail className="h-4 w-4 mr-2" />
                        <span>Email: {userData?.email}</span>
                      </div>
                      <div className="flex items-center">
                        <Stethoscope className="h-4 w-4 mr-2" />
                        <span>Specialization: {userData?.specialization || 'Not specified'}</span>
                      </div>
                      <div className="flex items-center">
                        <Building className="h-4 w-4 mr-2" />
                        <span>Department: {userData?.departmentName || userData?.department?.name || 'Not assigned'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {isEditing && (
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DoctorProfile; 