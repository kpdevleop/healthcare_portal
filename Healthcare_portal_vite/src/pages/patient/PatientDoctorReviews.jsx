import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import { feedbackAPI, userAPI, departmentAPI } from '../../services/api';
import { Star, Search, Filter, User, MessageSquare, Calendar, Award } from 'lucide-react';
import toast from 'react-hot-toast';

const PatientDoctorReviews = () => {
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedRating, setSelectedRating] = useState('');
  const [departments, setDepartments] = useState([]);

  useEffect(() => {
    fetchDoctorsWithReviews();
  }, []);

  const fetchDoctorsWithReviews = async () => {
    try {
      setLoading(true);
      
      // Fetch doctors and departments
      const [doctorsData, departmentsData] = await Promise.all([
        userAPI.getPublicDoctors().catch(err => {
          console.error('Error fetching doctors:', err);
          return [];
        }),
        departmentAPI.getAll().catch(err => {
          console.error('Error fetching departments:', err);
          return [];
        })
      ]);

      // Fetch feedback for all doctors
      const allFeedback = await feedbackAPI.getPublicFeedback().catch(err => {
        console.error('Error fetching feedback:', err);
        return [];
      });

      // Process doctors with their feedback
      const doctorsWithReviews = doctorsData.map(doctor => {
        const doctorFeedback = allFeedback.filter(fb => fb.doctorId === doctor.id);
        
        const averageRating = doctorFeedback.length > 0 
          ? doctorFeedback.reduce((sum, fb) => sum + fb.rating, 0) / doctorFeedback.length 
          : 0;
        
        return {
          id: doctor.id,
          name: `Dr. ${doctor.firstName} ${doctor.lastName}`,
          department: doctor.department?.name || doctor.departmentName || 'Not assigned',
          specialization: doctor.specialization || 'General',
          experience: doctor.experience || 'Not specified',
          averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
          totalReviews: doctorFeedback.length,
          reviews: doctorFeedback.slice(0, 5), // Show only first 5 reviews
          email: doctor.email
        };
      });

      // Sort by average rating (highest first)
      doctorsWithReviews.sort((a, b) => b.averageRating - a.averageRating);
      
      setDoctors(doctorsWithReviews);
      setFilteredDoctors(doctorsWithReviews);
      
      // Extract unique departments
      const uniqueDepartments = [...new Set(doctorsWithReviews.map(doc => doc.department))];
      setDepartments(uniqueDepartments);
    } catch (error) {
      console.error('Error fetching doctors:', error);
      toast.error('Failed to load doctor reviews');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    filterDoctors();
  }, [searchTerm, selectedDepartment, selectedRating, doctors]);

  const filterDoctors = () => {
    let filtered = doctors;

    if (searchTerm) {
      filtered = filtered.filter(doctor =>
        doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doctor.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doctor.specialization.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedDepartment) {
      filtered = filtered.filter(doctor =>
        doctor.department === selectedDepartment
      );
    }

    if (selectedRating) {
      const minRating = parseFloat(selectedRating);
      filtered = filtered.filter(doctor =>
        doctor.averageRating >= minRating
      );
    }

    setFilteredDoctors(filtered);
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`h-4 w-4 ${
          index < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not available';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return 'Invalid Date';
    }
  };

  const getRatingColor = (rating) => {
    if (rating >= 4.5) return 'text-green-600';
    if (rating >= 4.0) return 'text-blue-600';
    if (rating >= 3.5) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <DashboardLayout title="Doctor Reviews">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Doctor Reviews">
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Doctor Reviews
              </h2>
              <p className="text-gray-600">
                Browse and read reviews from other patients
              </p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Doctors
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by doctor name, department, or specialization..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Department
              </label>
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Departments</option>
                {departments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Minimum Rating
              </label>
              <select
                value={selectedRating}
                onChange={(e) => setSelectedRating(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Any Rating</option>
                <option value="4.5">4.5+ Stars</option>
                <option value="4.0">4.0+ Stars</option>
                <option value="3.5">3.5+ Stars</option>
                <option value="3.0">3.0+ Stars</option>
              </select>
            </div>
          </div>
          
          <div className="mt-4 flex justify-end">
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedDepartment('');
                setSelectedRating('');
              }}
              className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Doctors List */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Doctors ({filteredDoctors.length})
            </h3>
          </div>
          
          <div className="p-6">
            {filteredDoctors.length > 0 ? (
              <div className="space-y-6">
                {filteredDoctors.map((doctor) => (
                  <div key={doctor.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h4 className="text-xl font-semibold text-gray-900">
                            {doctor.name}
                          </h4>
                          {doctor.averageRating > 0 && (
                            <div className="flex items-center space-x-1">
                              {renderStars(Math.round(doctor.averageRating))}
                              <span className={`text-sm font-medium ${getRatingColor(doctor.averageRating)}`}>
                                {doctor.averageRating}
                              </span>
                            </div>
                          )}
                        </div>
                        
                        <p className="text-sm text-blue-600 font-medium mb-1">
                          {doctor.department}
                        </p>
                        
                        <p className="text-sm text-gray-600 mb-2">
                          Specialization: {doctor.specialization}
                        </p>
                        
                        <p className="text-sm text-gray-600 mb-2">
                          Experience: {doctor.experience}
                        </p>
                        
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <div className="flex items-center">
                            <MessageSquare className="h-4 w-4 mr-1" />
                            {doctor.totalReviews} review{doctor.totalReviews !== 1 ? 's' : ''}
                          </div>
                          {doctor.averageRating > 0 && (
                            <div className="flex items-center">
                              <Award className="h-4 w-4 mr-1" />
                              {doctor.averageRating} average rating
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Recent Reviews */}
                    {doctor.reviews.length > 0 && (
                      <div className="mt-4">
                        <h5 className="text-sm font-medium text-gray-700 mb-3">Recent Reviews</h5>
                        <div className="space-y-3">
                          {doctor.reviews.map((review) => (
                            <div key={review.id} className="bg-gray-50 rounded-lg p-4">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center space-x-2">
                                  {renderStars(review.rating)}
                                  <span className="text-sm font-medium text-gray-900">
                                    {review.rating}/5
                                  </span>
                                </div>
                                <span className="text-xs text-gray-500">
                                  {formatDate(review.submittedAt || review.createdAt)}
                                </span>
                              </div>
                              
                              {review.comments && (
                                <p className="text-sm text-gray-700 mb-2">
                                  "{review.comments}"
                                </p>
                              )}
                              
                              <p className="text-xs text-gray-500">
                                - {review.patientName || 'Anonymous'}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {doctor.totalReviews === 0 && (
                      <div className="mt-4 text-center py-4">
                        <MessageSquare className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-500">No reviews yet</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No doctors found</h3>
                <p className="text-gray-600 mb-4">
                  {doctors.length === 0 
                    ? 'No doctors available at the moment.' 
                    : 'Try adjusting your search criteria.'}
                </p>
                {doctors.length === 0 && (
                  <p className="text-sm text-gray-500">
                    Check back later for available doctors.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default PatientDoctorReviews;