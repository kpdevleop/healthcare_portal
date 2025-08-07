import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { doctorScheduleAPI, userAPI } from '../../services/api';
import { Calendar, Clock, User, Search, Plus, Edit, Trash2, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminSchedules = () => {
  const [schedules, setSchedules] = useState([]);
  const [filteredSchedules, setFilteredSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [formData, setFormData] = useState({
    doctorId: '',
    date: '',
    startTime: '',
    endTime: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [schedulesData, doctorsData] = await Promise.all([
        doctorScheduleAPI.getAll().catch(err => {
          console.error('Error fetching schedules:', err);
          return [];
        }),
        userAPI.getDoctors().catch(err => {
          console.error('Error fetching doctors:', err);
          return [];
        })
      ]);
      
      setSchedules(schedulesData || []);
      setFilteredSchedules(schedulesData || []);
      setDoctors(doctorsData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      // Don't show toast here as handleApiError will handle it
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    filterSchedules();
  }, [searchTerm, schedules]);

  const filterSchedules = () => {
    let filtered = schedules;

    if (searchTerm) {
      filtered = filtered.filter(schedule => {
        const doctorName = schedule.doctorName || '';
        const doctorFirstName = schedule.doctorFirstName || '';
        const doctorLastName = schedule.doctorLastName || '';
        const doctorEmail = schedule.doctorEmail || '';
        const searchLower = searchTerm.toLowerCase();
        
        return doctorName.toLowerCase().includes(searchLower) ||
               doctorFirstName.toLowerCase().includes(searchLower) ||
               doctorLastName.toLowerCase().includes(searchLower) ||
               doctorEmail.toLowerCase().includes(searchLower);
      });
    }

    setFilteredSchedules(filtered);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const submitData = {
        ...formData,
        doctorId: parseInt(formData.doctorId)
      };

      if (editingSchedule) {
        await doctorScheduleAPI.update(editingSchedule.id, submitData);
        toast.success('Schedule updated successfully!');
      } else {
        await doctorScheduleAPI.create(submitData);
        toast.success('Schedule created successfully!');
      }
      
      setShowForm(false);
      setEditingSchedule(null);
      resetForm();
      fetchData();
    } catch (error) {
      console.error('Error saving schedule:', error);
      toast.error(editingSchedule ? 'Failed to update schedule' : 'Failed to create schedule');
    }
  };

  const handleEdit = (schedule) => {
    setEditingSchedule(schedule);
    setFormData({
      doctorId: schedule.doctorId?.toString() || '',
      date: schedule.date || '',
      startTime: schedule.startTime || '',
      endTime: schedule.endTime || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (scheduleId) => {
    if (window.confirm('Are you sure you want to delete this schedule?')) {
      try {
        await doctorScheduleAPI.delete(scheduleId);
        toast.success('Schedule deleted successfully');
        fetchData();
      } catch (error) {
        console.error('Error deleting schedule:', error);
        toast.error('Failed to delete schedule');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      doctorId: '',
      date: '',
      startTime: '',
      endTime: ''
    });
    setEditingSchedule(null);
    setShowForm(false);
  };

  const validateTimeRange = () => {
    if (formData.startTime && formData.endTime) {
      return formData.startTime < formData.endTime;
    }
    return true;
  };

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Doctor Schedules</h1>
            <p className="text-gray-600">Manage doctor availability and schedules</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
          >
            <Plus className="h-5 w-5" />
            <span>Add Schedule</span>
          </button>
        </div>

        {/* Create/Edit Form */}
        {showForm && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {editingSchedule ? 'Edit Schedule' : 'Create New Schedule'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Doctor *
                  </label>
                  <select
                    value={formData.doctorId}
                    onChange={(e) => setFormData({ ...formData, doctorId: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select Doctor</option>
                    {doctors.map((doctor) => (
                      <option key={doctor.id} value={doctor.id}>
                        Dr. {doctor.firstName} {doctor.lastName} ({doctor.email})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date *
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              {!validateTimeRange() && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
                  <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-red-700">
                    End time must be after start time.
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!validateTimeRange()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {editingSchedule ? 'Update Schedule' : 'Create Schedule'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Search */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Search Schedules</h3>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search by doctor name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Schedules List */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              All Schedules ({filteredSchedules.length})
            </h3>
            
            {loading ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : filteredSchedules.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No schedules found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {searchTerm ? 'Try adjusting your search terms.' : 'Get started by creating a new schedule.'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredSchedules.map((schedule) => (
                  <div key={schedule.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center space-x-2">
                        <User className="h-5 w-5 text-blue-600" />
                        <h4 className="font-semibold text-gray-900">
                          {schedule.doctorFirstName && schedule.doctorLastName 
                            ? `Dr. ${schedule.doctorFirstName} ${schedule.doctorLastName}`
                            : schedule.doctorName || `Doctor ${schedule.doctorId}`
                          }
                        </h4>
                      </div>
                      <div className="flex space-x-1">
                        <button
                          onClick={() => handleEdit(schedule)}
                          className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                          title="Edit schedule"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(schedule.id)}
                          className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                          title="Delete schedule"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="h-4 w-4 mr-2" />
                        <span>{new Date(schedule.date).toLocaleDateString('en-GB')}</span>
                      </div>
                      
                      <div className="flex items-center text-sm text-gray-600">
                        <Clock className="h-4 w-4 mr-2" />
                        <span>{schedule.startTime} - {schedule.endTime}</span>
                      </div>
                    </div>
                    
                                         <div className="flex items-center justify-between text-xs text-gray-500 mt-3">
                       <span>ID: {schedule.id}</span>
                       <span>Created: {new Date(schedule.createdAt).toLocaleDateString('en-GB')}</span>
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

export default AdminSchedules;