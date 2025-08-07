import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../components/DashboardLayout';
import { doctorScheduleAPI } from '../../services/api';
import { Calendar, Clock, Plus, Edit, Trash2, X } from 'lucide-react';
import toast from 'react-hot-toast';

const DoctorSchedules = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [schedules, setSchedules] = useState([]);
  const [filteredSchedules, setFilteredSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [formData, setFormData] = useState({
    date: '',
    startTime: '',
    endTime: ''
  });

  useEffect(() => {
    if (user) {
      fetchSchedules();
    }
  }, [user]);

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      const schedulesData = await doctorScheduleAPI.getMySchedules();
      
      if (!Array.isArray(schedulesData)) {
        console.error('Schedules data is not an array:', schedulesData);
        setSchedules([]);
        setFilteredSchedules([]);
        return;
      }
      
      setSchedules(schedulesData);
      setFilteredSchedules(schedulesData);
    } catch (error) {
      console.error('Error fetching schedules:', error);
      toast.error('Failed to load schedules');
      setSchedules([]);
      setFilteredSchedules([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    filterSchedules();
  }, [selectedDate, schedules]);

  const filterSchedules = () => {
    let filtered = schedules;

    if (selectedDate) {
      filtered = filtered.filter(schedule =>
        schedule.date === selectedDate
      );
    }

    setFilteredSchedules(filtered);
  };

  const resetForm = () => {
    setFormData({
      date: '',
      startTime: '',
      endTime: ''
    });
    setEditingSchedule(null);
  };

  const validateForm = () => {
    if (!formData.date) {
      toast.error('Please select a date');
      return false;
    }
    
    if (!formData.startTime) {
      toast.error('Please select start time');
      return false;
    }
    
    if (!formData.endTime) {
      toast.error('Please select end time');
      return false;
    }

    // Check if date is in the future or present
    const selectedDate = new Date(formData.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedDate < today) {
      toast.error('Schedule date must be in the present or future');
      return false;
    }

    // Check if end time is after start time
    if (formData.startTime >= formData.endTime) {
      toast.error('End time must be after start time');
      return false;
    }

    return true;
  };

  const handleCreateSchedule = async (e) => {
    e.preventDefault();
    
    if (!user || !user.id) {
      toast.error('User information not available. Please login again.');
      return;
    }

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      
      const scheduleData = {
        doctorId: parseInt(user.id),
        date: formData.date,
        startTime: formData.startTime,
        endTime: formData.endTime
      };

      await doctorScheduleAPI.create(scheduleData);
      
      toast.success('Schedule created successfully!');
      setShowForm(false);
      resetForm();
      fetchSchedules();
    } catch (error) {
      console.error('Error creating schedule:', error);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Failed to create schedule');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEditSchedule = async (e) => {
    e.preventDefault();
    
    if (!user || !user.id) {
      toast.error('User information not available. Please login again.');
      return;
    }

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      
      const scheduleData = {
        doctorId: parseInt(user.id),
        date: formData.date,
        startTime: formData.startTime,
        endTime: formData.endTime
      };

      await doctorScheduleAPI.update(editingSchedule.id, scheduleData);
      
      toast.success('Schedule updated successfully!');
      setShowForm(false);
      resetForm();
      fetchSchedules();
    } catch (error) {
      console.error('Error updating schedule:', error);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Failed to update schedule');
      }
    } finally {
      setLoading(false);
    }
  };

  const openEditForm = (schedule) => {
    setEditingSchedule(schedule);
    setFormData({
      date: schedule.date,
      startTime: schedule.startTime,
      endTime: schedule.endTime
    });
    setShowForm(true);
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

  const formatTime = (timeString) => {
    if (!timeString) return 'Not available';
    try {
      return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch (error) {
      return timeString;
    }
  };

  const getStatusBadge = (isAvailable) => {
    return isAvailable ? (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
        Available
      </span>
    ) : (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
        Booked
      </span>
    );
  };

  if (!user) {
    return (
      <DashboardLayout title="My Schedules">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading user information...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (loading && schedules.length === 0) {
    return (
      <DashboardLayout title="My Schedules">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="My Schedules">
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                My Schedules
              </h2>
              <p className="text-gray-600">
                Manage your availability and appointment slots
              </p>
            </div>
            <button
              onClick={() => {
                resetForm();
                setShowForm(true);
              }}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Schedule
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Date
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={() => setSelectedDate('')}
                className="w-full px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
              >
                Clear Filter
              </button>
            </div>
          </div>
        </div>

        {/* Schedules Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Schedules ({filteredSchedules.length})
            </h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Department
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredSchedules.length > 0 ? (
                  filteredSchedules.map((schedule) => (
                    <tr key={schedule.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {formatDate(schedule.date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatTime(schedule.startTime)} - {formatTime(schedule.endTime)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {schedule.departmentName || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => openEditForm(schedule)}
                            className="text-blue-600 hover:text-blue-900"
                            title="Edit Schedule"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="px-6 py-12 text-center">
                      <div className="text-center">
                        <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No schedules found</h3>
                        <p className="text-gray-600 mb-4">
                          {schedules.length === 0 
                            ? 'You haven\'t created any schedules yet.' 
                            : 'Try adjusting your date filter.'}
                        </p>
                        {schedules.length === 0 && (
                          <button
                            onClick={() => {
                              resetForm();
                              setShowForm(true);
                            }}
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                          >
                            Create your first schedule
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add/Edit Schedule Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {editingSchedule ? 'Edit Schedule' : 'Add Schedule'}
                </h3>
                <button
                  onClick={() => {
                    setShowForm(false);
                    resetForm();
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={editingSchedule ? handleEditSchedule : handleCreateSchedule}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date *
                    </label>
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Start Time *
                    </label>
                    <input
                      type="time"
                      value={formData.startTime}
                      onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      End Time *
                    </label>
                    <input
                      type="time"
                      value={formData.endTime}
                      onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      resetForm();
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    {editingSchedule ? (
                      <>
                        <Edit className="h-4 w-4 mr-2" />
                        {loading ? 'Updating...' : 'Update Schedule'}
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4 mr-2" />
                        {loading ? 'Creating...' : 'Create Schedule'}
                      </>
                    )}
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

export default DoctorSchedules;