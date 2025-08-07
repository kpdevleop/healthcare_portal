import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../components/DashboardLayout';
import { doctorScheduleAPI, departmentAPI, appointmentAPI, userAPI } from '../../services/api';
import { Calendar, Clock, User, MapPin, Search, Filter, Plus, X } from 'lucide-react';
import toast from 'react-hot-toast';

const PatientBookAppointment = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [userData, setUserData] = useState(null); // Store patient profile
  const [schedules, setSchedules] = useState([]);
  const [filteredSchedules, setFilteredSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [departments, setDepartments] = useState([]);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  // Booking form fields as per AppointmentRequestDTO
  const [bookingFormData, setBookingFormData] = useState({
    appointmentTime: '',
    reason: ''
  });

  useEffect(() => {
    // Fetch patient profile on mount
    const fetchProfile = async () => {
      try {
        const profile = await userAPI.getProfile();
        setUserData(profile);
      } catch (e) {
        toast.error('Failed to load patient profile. Please log in again.');
      }
    };
    fetchProfile();
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      console.log('Fetching schedules and departments...');
      
      const [schedulesData, departmentsData] = await Promise.all([
        doctorScheduleAPI.getAll().catch(err => {
          console.error('Error fetching schedules:', err);
          return [];
        }),
        departmentAPI.getAll().catch(err => {
          console.error('Error fetching departments:', err);
          return [];
        })
      ]);
      
      console.log('Raw schedules data:', schedulesData);
      console.log('Raw departments data:', departmentsData);
      
      // Check if schedulesData is an array
      if (!Array.isArray(schedulesData)) {
        console.error('Schedules data is not an array:', typeof schedulesData, schedulesData);
        setSchedules([]);
        setFilteredSchedules([]);
        setDepartments(departmentsData || []);
        return;
      }
      
      // Filter schedules to only show those with available slots
      const availableSchedules = schedulesData.filter(schedule => {
        // Check if the schedule has any available time slots
        const hasSlots = getTimeSlots(schedule.startTime, schedule.endTime, schedule.bookedTimes || []).length > 0;
        return hasSlots;
      });
      
      console.log('Available schedules after filtering:', availableSchedules);
      
      // Log booked times for debugging
      availableSchedules.forEach(schedule => {
        console.log(`Schedule ${schedule.id} (${schedule.doctorName}):`, {
          date: schedule.date,
          startTime: schedule.startTime,
          endTime: schedule.endTime,
          bookedTimes: schedule.bookedTimes || [],
          availableSlots: getTimeSlots(schedule.startTime, schedule.endTime, schedule.bookedTimes || [])
        });
      });
      
      setSchedules(availableSchedules);
      setFilteredSchedules(availableSchedules);
      setDepartments(departmentsData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
      setSchedules([]);
      setFilteredSchedules([]);
      setDepartments([]);
    } finally {
      setLoading(false);
    }
  };

  // Function to fetch available schedules for a specific date
  const fetchAvailableSchedulesForDate = async (date) => {
    try {
      console.log('Fetching available schedules for date:', date);
      const availableSchedules = await doctorScheduleAPI.getAvailableSchedules(date);
      console.log('Available schedules for date:', availableSchedules);
      
      // Check if availableSchedules is an array
      if (!Array.isArray(availableSchedules)) {
        console.error('Available schedules data is not an array:', typeof availableSchedules, availableSchedules);
        return [];
      }
      
      // Filter out schedules with no available slots
      const schedulesWithSlots = availableSchedules.filter(schedule => {
        const hasSlots = getTimeSlots(schedule.startTime, schedule.endTime, schedule.bookedTimes || []).length > 0;
        return hasSlots;
      });
      
      return schedulesWithSlots;
    } catch (error) {
      console.error('Error fetching available schedules for date:', error);
      return [];
    }
  };

  // Function to handle date selection
  const handleDateChange = async (date) => {
    setSelectedDate(date);
    
    if (date) {
      try {
        setLoading(true);
        const availableSchedules = await fetchAvailableSchedulesForDate(date);
        setSchedules(availableSchedules);
        setFilteredSchedules(availableSchedules);
      } catch (error) {
        console.error('Error fetching schedules for date:', error);
        toast.error('Failed to load schedules for selected date');
      } finally {
        setLoading(false);
      }
    } else {
      // If no date selected, fetch all schedules
      fetchData();
    }
  };

  useEffect(() => {
    filterSchedules();
  }, [searchTerm, selectedDate, selectedDepartment, schedules]);

  // Filter schedules to only present and future dates
  const filterSchedules = () => {
    let filtered = schedules;
    const today = new Date().toISOString().split('T')[0];
    filtered = filtered.filter(schedule => schedule.date >= today);

    if (searchTerm) {
      filtered = filtered.filter(schedule =>
        schedule.doctorFirstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        schedule.doctorLastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        schedule.doctorName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (selectedDate) {
      filtered = filtered.filter(schedule => schedule.date === selectedDate);
    }
    if (selectedDepartment) {
      filtered = filtered.filter(schedule => schedule.departmentName === selectedDepartment);
    }
    
    // Filter out schedules with no available slots
    filtered = filtered.filter(schedule => hasAvailableSlots(schedule));
    
    setFilteredSchedules(filtered);
  };

  // Generate half-hour slots between start and end time, excluding booked times
  const getTimeSlots = (start, end, bookedTimes = []) => {
    const slots = [];
    let [startHour, startMin] = start.split(':').map(Number);
    let [endHour, endMin] = end.split(':').map(Number);
    let startDate = new Date(2000, 0, 1, startHour, startMin);
    const endDate = new Date(2000, 0, 1, endHour, endMin);
    while (startDate < endDate) {
      const slot = startDate.toTimeString().slice(0, 5);
      // Only add slot if it's not in bookedTimes
      if (!bookedTimes.includes(slot)) {
        slots.push(slot);
      }
      startDate = new Date(startDate.getTime() + 30 * 60000);
    }
    return slots;
  };

  // Check if a schedule has any available slots
  const hasAvailableSlots = (schedule) => {
    const availableSlots = getTimeSlots(schedule.startTime, schedule.endTime, schedule.bookedTimes || []);
    return availableSlots.length > 0;
  };

  const handleBookAppointment = (schedule) => {
    setSelectedSchedule(schedule);
    setShowBookingForm(true);
    setBookingFormData({ appointmentTime: '', reason: '' });
  };

  const handleSubmitBooking = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      // Use user.id or userData.id for patientId
      const patientId = user?.id || userData?.id;
      console.log('user:', user);
      console.log('user.id:', user?.id);
      console.log('userData:', userData);
      console.log('userData.id:', userData?.id);
      console.log('Resolved patientId:', patientId);
      if (!patientId) {
        toast.error('Patient ID not found. Please log in again.');
        setLoading(false);
        return;
      }
      const appointmentData = {
        patientId: patientId,
        doctorId: selectedSchedule.doctorId,
        scheduleId: selectedSchedule.id,
        appointmentDate: selectedSchedule.date,
        appointmentTime: bookingFormData.appointmentTime,
        reason: bookingFormData.reason,
        status: 'PENDING'
      };
      console.log('Appointment payload:', appointmentData); // Debug log
      await appointmentAPI.create(appointmentData);
      toast.success('Appointment booked successfully!');
      setShowBookingForm(false);
      setSelectedSchedule(null);
      setBookingFormData({ appointmentTime: '', reason: '' });
      if (selectedDate) {
        handleDateChange(selectedDate);
      } else {
        fetchData();
      }
    } catch (error) {
      toast.error('Failed to book appointment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = () => {
    setShowBookingForm(false);
    setSelectedSchedule(null);
    setBookingFormData({ appointmentTime: '', reason: '' });
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not available';
    try {
      return new Date(dateString).toLocaleDateString('en-GB', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
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

  if (loading && schedules.length === 0) {
    return (
      <DashboardLayout title="Book Appointment">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Book Appointment">
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Book Appointment
              </h2>
              <p className="text-gray-600">
                Browse available doctor schedules and book your appointment
              </p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Doctor
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by doctor name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => handleDateChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
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
                  <option key={dept.id} value={dept.name}>
                    {dept.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedDate('');
                  setSelectedDepartment('');
                  fetchData();
                }}
                className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Schedules List */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Available Schedules ({filteredSchedules.length})
            </h3>
          </div>
          <div className="p-6">
            {filteredSchedules.length > 0 ? (
              <div className="space-y-4">
                {filteredSchedules.map((schedule) => (
                  <div key={schedule.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h4 className="text-lg font-semibold text-gray-900">
                          Dr. {schedule.doctorFirstName} {schedule.doctorLastName}
                        </h4>
                        <p className="text-sm text-gray-600">{schedule.doctorEmail}</p>
                        {schedule.departmentName && (
                          <p className="text-sm text-blue-600 font-medium">{schedule.departmentName}</p>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Available
                        </span>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="h-4 w-4 mr-2" />
                        {formatDate(schedule.date)}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Clock className="h-4 w-4 mr-2" />
                        {formatTime(schedule.startTime)} - {formatTime(schedule.endTime)}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <User className="h-4 w-4 mr-2" />
                        {schedule.departmentName || 'Department not assigned'}
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <button
                        onClick={() => handleBookAppointment(schedule)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Book Appointment
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No schedules found</h3>
                <p className="text-gray-600 mb-4">
                  {schedules.length === 0 
                    ? 'No doctor schedules available at the moment.' 
                    : 'Try adjusting your search criteria.'}
                </p>
                {schedules.length === 0 && (
                  <div className="space-y-2">
                    <p className="text-sm text-gray-500">
                      Check back later for available appointment slots.
                    </p>
                    <button
                      onClick={fetchData}
                      className="text-sm text-blue-600 hover:text-blue-800 underline"
                    >
                      Refresh schedules
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Booking Form Modal */}
        {showBookingForm && selectedSchedule && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Book Appointment
                </h3>
                <button
                  onClick={handleCancelBooking}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <form onSubmit={handleSubmitBooking}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Appointment Time *
                  </label>
                  <select
                    value={bookingFormData.appointmentTime}
                    onChange={(e) => setBookingFormData({ ...bookingFormData, appointmentTime: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select a time slot</option>
                    {getTimeSlots(selectedSchedule.startTime, selectedSchedule.endTime, selectedSchedule.bookedTimes || []).map((slot) => (
                      <option key={slot} value={slot}>{slot}</option>
                    ))}
                  </select>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reason for Visit *
                  </label>
                  <textarea
                    value={bookingFormData.reason}
                    onChange={(e) => setBookingFormData({ ...bookingFormData, reason: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Please describe your symptoms or reason for the appointment..."
                    rows="3"
                    required
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={handleCancelBooking}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    {loading ? 'Booking...' : 'Confirm Booking'}
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

export default PatientBookAppointment;