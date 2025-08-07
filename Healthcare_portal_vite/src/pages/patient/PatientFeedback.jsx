import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../components/DashboardLayout';
import { feedbackAPI, userAPI } from '../../services/api';
import { MessageSquare, Star, Search, Filter, Plus, Edit, Trash2, Calendar, X } from 'lucide-react';
import toast from 'react-hot-toast';

const PatientFeedback = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [feedback, setFeedback] = useState([]);
  const [filteredFeedback, setFilteredFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRating, setSelectedRating] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [doctors, setDoctors] = useState([]);
  const [formData, setFormData] = useState({
    patientId: '',
    doctorId: null,
    rating: 5,
    comments: ''
  });

  // Ensure patientId is always set from user context
  useEffect(() => {
    if (user?.id) {
      setFormData((prev) => ({ ...prev, patientId: user.id }));
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [feedbackData, doctorsData] = await Promise.all([
        feedbackAPI.getMyFeedback(),
        userAPI.getPublicDoctors()
      ]);
      
      setFeedback(feedbackData || []);
      setFilteredFeedback(feedbackData || []);
      setDoctors(doctorsData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
      setFeedback([]);
      setFilteredFeedback([]);
      setDoctors([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    filterFeedback();
  }, [searchTerm, selectedRating, feedback]);

  const filterFeedback = () => {
    let filtered = feedback;

    if (searchTerm) {
      filtered = filtered.filter(fb =>
        fb.comments?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        fb.doctorName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedRating) {
      filtered = filtered.filter(fb => fb.rating === parseInt(selectedRating));
    }

    setFilteredFeedback(filtered);
  };

  const handleSubmitFeedback = async (e) => {
    e.preventDefault();
    if (!user?.id) {
      toast.error('User not loaded. Please log in again.');
      return;
    }
    try {
      setLoading(true);
      const feedbackData = {
        patientId: user.id, // always use current user
        doctorId: formData.doctorId || null, // null for general feedback
        rating: formData.rating,
        comments: formData.comments
      };
      await feedbackAPI.create(feedbackData);
      toast.success('Feedback submitted successfully!');
      setShowForm(false);
      setFormData({
        patientId: user.id, // reset with current user
        doctorId: null,
        rating: 5,
        comments: ''
      });
      fetchData();
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast.error('Failed to submit feedback');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteFeedback = async (feedbackId) => {
    if (window.confirm('Are you sure you want to delete this feedback?')) {
      try {
        await feedbackAPI.delete(feedbackId);
        toast.success('Feedback deleted successfully');
        fetchData();
      } catch (error) {
        console.error('Error deleting feedback:', error);
        toast.error('Failed to delete feedback');
      }
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
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

  const getFeedbackType = (feedback) => {
    return feedback.doctorId ? 'Doctor-specific' : 'General';
  };

  if (loading && feedback.length === 0) {
    return (
      <DashboardLayout title="My Feedback">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="My Feedback">
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                My Feedback
              </h2>
              <p className="text-gray-600">
                View and manage your feedback submissions
              </p>
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              Submit Feedback
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Feedback
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by comments or doctor name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rating Filter
              </label>
              <select
                value={selectedRating}
                onChange={(e) => setSelectedRating(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Ratings</option>
                <option value="5">5 Stars</option>
                <option value="4">4 Stars</option>
                <option value="3">3 Stars</option>
                <option value="2">2 Stars</option>
                <option value="1">1 Star</option>
              </select>
            </div>
          </div>
          
          <div className="mt-4 flex justify-end">
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedRating('');
              }}
              className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Feedback List */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              My Feedback ({filteredFeedback.length})
            </h3>
          </div>
          
          <div className="p-6">
            {filteredFeedback.length > 0 ? (
              <div className="space-y-4">
                {filteredFeedback.map((fb) => (
                  <div key={fb.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {getFeedbackType(fb)}
                          </span>
                          <div className="flex items-center">
                            {renderStars(fb.rating)}
                          </div>
                        </div>
                        
                        {fb.doctorName && (
                          <h4 className="text-lg font-semibold text-gray-900 mb-1">
                            Dr. {fb.doctorName}
                          </h4>
                        )}
                        
                        {fb.comments && (
                          <p className="text-gray-700 mb-2">{fb.comments}</p>
                        )}
                        
                        <div className="flex items-center text-sm text-gray-500">
                          <Calendar className="h-4 w-4 mr-1" />
                          {formatDate(fb.submittedAt)}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleDeleteFeedback(fb.id)}
                          className="text-red-600 hover:text-red-800 transition-colors"
                          title="Delete feedback"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No feedback found</h3>
                <p className="text-gray-600 mb-4">
                  {feedback.length === 0 
                    ? 'You haven\'t submitted any feedback yet.' 
                    : 'Try adjusting your search criteria.'}
                </p>
                {feedback.length === 0 && (
                  <button
                    onClick={() => setShowForm(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Submit Your First Feedback
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Feedback Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Submit Feedback
                </h3>
                <button
                  onClick={() => {
                    setShowForm(false);
                    setFormData({
                      patientId: user?.id,
                      doctorId: null,
                      rating: 5,
                      comments: ''
                    });
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSubmitFeedback}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Feedback Type
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="feedbackType"
                        value="general"
                        checked={!formData.doctorId}
                        onChange={() => setFormData({ ...formData, doctorId: null })}
                        className="mr-2"
                      />
                      General Feedback
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="feedbackType"
                        value="doctor"
                        checked={!!formData.doctorId}
                        onChange={() => setFormData({ ...formData, doctorId: doctors[0]?.id || null })}
                        className="mr-2"
                      />
                      Doctor-specific Feedback
                    </label>
                  </div>
                </div>

                {formData.doctorId && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Doctor *
                    </label>
                    <select
                      value={formData.doctorId || ''}
                      onChange={(e) => setFormData({ ...formData, doctorId: e.target.value ? parseInt(e.target.value) : null })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required={!!formData.doctorId}
                    >
                      <option value="">Select a doctor</option>
                      {doctors.map((doctor) => (
                        <option key={doctor.id} value={doctor.id}>
                          Dr. {doctor.firstName} {doctor.lastName} - {doctor.specialization}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rating *
                  </label>
                  <div className="flex items-center space-x-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setFormData({ ...formData, rating: star })}
                        className="focus:outline-none"
                      >
                        <Star
                          className={`h-6 w-6 ${
                            star <= formData.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    {formData.rating} star{formData.rating !== 1 ? 's' : ''}
                  </p>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Comments
                  </label>
                  <textarea
                    value={formData.comments}
                    onChange={(e) => setFormData({ ...formData, comments: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Share your experience and suggestions..."
                    rows="4"
                    maxLength="2000"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    {formData.comments.length}/2000 characters
                  </p>
                </div>

                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setFormData({
                        patientId: user?.id,
                        doctorId: null,
                        rating: 5,
                        comments: ''
                      });
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    {loading ? 'Submitting...' : 'Submit Feedback'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default PatientFeedback;