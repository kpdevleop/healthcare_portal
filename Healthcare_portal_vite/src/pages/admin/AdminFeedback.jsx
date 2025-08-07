import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { feedbackAPI, userAPI } from '../../services/api';
import { MessageSquare, User, Search, Trash2, Star, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminFeedback = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [filteredFeedbacks, setFilteredFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [ratingFilter, setRatingFilter] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [feedbacksData] = await Promise.all([
        feedbackAPI.getAll().catch(err => {
          console.error('Error fetching feedback:', err);
          return [];
        })
      ]);
      setFeedbacks(feedbacksData || []);
      setFilteredFeedbacks(feedbacksData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    filterFeedbacks();
  }, [searchTerm, ratingFilter, feedbacks]);

  const filterFeedbacks = () => {
    let filtered = feedbacks;
    if (searchTerm) {
      filtered = filtered.filter(feedback =>
        feedback.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        feedback.doctorName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        feedback.comments?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (ratingFilter) {
      filtered = filtered.filter(feedback => feedback.rating === parseInt(ratingFilter));
    }
    setFilteredFeedbacks(filtered);
  };

  const handleDelete = async (feedbackId) => {
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

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`h-4 w-4 ${index < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Feedback</h1>
            <p className="text-gray-600">Manage patient feedback and reviews</p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Search & Filter</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Feedback
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search by patient, doctor, or comments..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rating Filter
              </label>
              <select
                value={ratingFilter}
                onChange={(e) => setRatingFilter(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
        </div>

        {/* Feedback List */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              All Feedback ({filteredFeedbacks.length})
            </h3>
            
            {loading ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : filteredFeedbacks.length === 0 ? (
              <div className="text-center py-8">
                <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No feedback found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {searchTerm || ratingFilter ? 'Try adjusting your search terms.' : 'Get started by creating new feedback.'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredFeedbacks.map((feedback) => (
                  <div key={feedback.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center space-x-2">
                        <MessageSquare className="h-5 w-5 text-blue-600" />
                        <h4 className="font-semibold text-gray-900">
                          Feedback #{feedback.id}
                        </h4>
                      </div>
                      <div className="flex space-x-1">
                        <button
                          onClick={() => handleDelete(feedback.id)}
                          className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                          title="Delete feedback"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center text-sm text-gray-600">
                        <User className="h-4 w-4 mr-2" />
                        <span>
                          <strong>Patient:</strong> {feedback.patientName || `Patient ${feedback.patientId}`}
                        </span>
                      </div>
                      
                      {feedback.doctorName && (
                        <div className="flex items-center text-sm text-gray-600">
                          <User className="h-4 w-4 mr-2" />
                          <span>
                            <strong>Doctor:</strong> {feedback.doctorName}
                          </span>
                        </div>
                      )}
                      
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="h-4 w-4 mr-2" />
                        <span>
                          <strong>Date:</strong> {new Date(feedback.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-700">Rating:</span>
                        <div className="flex">
                          {renderStars(feedback.rating)}
                        </div>
                        <span className="text-sm text-gray-600">({feedback.rating}/5)</span>
                      </div>
                      
                      {feedback.comments && (
                        <div className="text-sm text-gray-600 mt-2">
                          <strong>Comments:</strong>
                          <p className="mt-1">
                            {feedback.comments.length > 150 
                              ? `${feedback.comments.substring(0, 150)}...` 
                              : feedback.comments}
                          </p>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between text-xs text-gray-500 mt-3">
                      <span>ID: {feedback.id}</span>
                      <span>Created: {new Date(feedback.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminFeedback;