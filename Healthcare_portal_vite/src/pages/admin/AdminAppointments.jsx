import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { appointmentAPI, userAPI, doctorScheduleAPI } from '../../services/api';
import { Calendar, Clock, User, Search, Filter, Plus, Edit, Trash2, Eye, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctorSchedules, setDoctorSchedules] = useState([]);
  const [availableTimeSlots, setAvailableTimeSlots] = useState([]);
  const [formData, setFormData] = useState({
    patientId: '',
    doctorId: '',
    scheduleId: '',
    appointmentDate: '',
    appointmentTime: '',
    reason: '',
    status: 'PENDING'
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Add debug logging
      console.log('Fetching admin appointments data...');
      
      const [appointmentsData, doctorsData, patientsData] = await Promise.all([
        appointmentAPI.getAll().catch(err => {
          console.error('Error fetching appointments:', err);
          console.error('Appointments error details:', {
            status: err.response?.status,
            data: err.response?.data,
            url: err.config?.url
          });
          return [];
        }),
        userAPI.getDoctors().catch(err => {
          console.error('Error fetching doctors:', err);
          console.error('Doctors error details:', {
            status: err.response?.status,
            data: err.response?.data,
            url: err.config?.url
          });
          return [];
        }),
        userAPI.getPatients().catch(err => {
          console.error('Error fetching patients:', err);
          console.error('Patients error details:', {
            status: err.response?.status,
            data: err.response?.data,
            url: err.config?.url
          });
          return [];
        })
      ]);
      
      console.log('Fetched data:', {
        appointments: appointmentsData?.length || 0,
        doctors: doctorsData?.length || 0,
        patients: patientsData?.length || 0
      });
      
      setAppointments(appointmentsData || []);
      setFilteredAppointments(appointmentsData || []);
      setDoctors(doctorsData || []);
      setPatients(patientsData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      // Don't show toast here as handleApiError will handle it
    } finally {
      setLoading(false);
    }
  };

  // Function to generate time slots from start time to end time in 30-minute intervals
  const generateTimeSlots = (startTime, endTime) => {
    const slots = [];
    const start = new Date(`2000-01-01T${startTime}`);
    const end = new Date(`2000-01-01T${endTime}`);
    
    let current = new Date(start);
    while (current < end) {
      const slotStart = current.toTimeString().slice(0, 5);
      slots.push(slotStart);
      current.setMinutes(current.getMinutes() + 30);
    }
    
    return slots;
  };

  // Function to fetch doctor schedules when doctor is selected
  const handleDoctorChange = async (doctorId) => {
    if (!doctorId) {
      setDoctorSchedules([]);
      setAvailableTimeSlots([]);
      setFormData(prev => ({ ...prev, scheduleId: '', appointmentDate: '', appointmentTime: '' }));
      return;
    }

    try {
      const schedules = await doctorScheduleAPI.getDoctorSchedules(doctorId);
      
      // Filter only future dates
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const futureSchedules = schedules.filter(schedule => {
        const scheduleDate = new Date(schedule.date);
        return scheduleDate >= today && schedule.isAvailable;
      });
      
      setDoctorSchedules(futureSchedules);
      setFormData(prev => ({ ...prev, scheduleId: '', appointmentDate: '', appointmentTime: '' }));
      setAvailableTimeSlots([]);
    } catch (error) {
      console.error('Error fetching doctor schedules:', error);
      toast.error('Failed to fetch doctor schedules');
    }
  };

  // Function to handle schedule selection
  const handleScheduleChange = (scheduleId) => {
    if (!scheduleId) {
      setAvailableTimeSlots([]);
      setFormData(prev => ({ ...prev, appointmentDate: '', appointmentTime: '' }));
      return;
    }

    const selectedSchedule = doctorSchedules.find(schedule => schedule.id.toString() === scheduleId);
    if (selectedSchedule) {
      // Generate time slots
      const slots = generateTimeSlots(selectedSchedule.startTime, selectedSchedule.endTime);
      setAvailableTimeSlots(slots);
      
      // Set the appointment date from the schedule
      setFormData(prev => ({
        ...prev,
        appointmentDate: selectedSchedule.date,
        appointmentTime: ''
      }));
    }
  };

  useEffect(() => {
    filterAppointments();
  }, [searchTerm, statusFilter, appointments]);

  const filterAppointments = () => {
    let filtered = appointments;

    if (searchTerm) {
      filtered = filtered.filter(apt =>
        apt.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        apt.doctorName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        apt.reason?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter) {
      filtered = filtered.filter(apt => apt.status === statusFilter);
    }

    setFilteredAppointments(filtered);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const submitData = {
        ...formData,
        patientId: parseInt(formData.patientId),
        doctorId: parseInt(formData.doctorId),
        scheduleId: parseInt(formData.scheduleId)
      };

      if (editingAppointment) {
        await appointmentAPI.update(editingAppointment.id, submitData);
        toast.success('Appointment updated successfully!');
      } else {
        await appointmentAPI.create(submitData);
        toast.success('Appointment created successfully!');
      }
      
      setShowForm(false);
      setEditingAppointment(null);
      resetForm();
      fetchData();
    } catch (error) {
      console.error('Error saving appointment:', error);
      toast.error(editingAppointment ? 'Failed to update appointment' : 'Failed to create appointment');
    }
  };

  const handleEdit = (appointment) => {
    setEditingAppointment(appointment);
    setFormData({
      patientId: appointment.patientId?.toString() || '',
      doctorId: appointment.doctorId?.toString() || '',
      scheduleId: appointment.scheduleId?.toString() || '',
      appointmentDate: appointment.appointmentDate || '',
      appointmentTime: appointment.appointmentTime || '',
      reason: appointment.reason || '',
      status: appointment.status || 'PENDING'
    });
    
    // If editing, fetch schedules for the doctor
    if (appointment.doctorId) {
      handleDoctorChange(appointment.doctorId);
    }
    
    setShowForm(true);
  };

  const handleStatusUpdate = async (appointmentId, newStatus) => {
    try {
      await appointmentAPI.updateStatus(appointmentId, newStatus);
      toast.success(`Appointment status updated to ${newStatus}`);
      fetchData();
    } catch (error) {
      console.error('Error updating appointment status:', error);
      toast.error('Failed to update appointment status');
    }
  };

  const handleDelete = async (appointmentId) => {
    if (window.confirm('Are you sure you want to delete this appointment?')) {
      try {
        await appointmentAPI.delete(appointmentId);
        toast.success('Appointment deleted successfully');
        fetchData();
      } catch (error) {
        console.error('Error deleting appointment:', error);
        toast.error('Failed to delete appointment');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      patientId: '',
      doctorId: '',
      scheduleId: '',
      appointmentDate: '',
      appointmentTime: '',
      reason: '',
      status: 'PENDING'
    });
    setEditingAppointment(null);
    setShowForm(false);
    setDoctorSchedules([]);
    setAvailableTimeSlots([]);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'CONFIRMED':
        return 'bg-blue-100 text-blue-800';
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'PENDING':
        return <AlertCircle className="h-4 w-4" />;
      case 'CONFIRMED':
        return <CheckCircle className="h-4 w-4" />;
      case 'COMPLETED':
        return <CheckCircle className="h-4 w-4" />;
      case 'CANCELLED':
        return <XCircle className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Appointments</h1>
            <p className="text-gray-600">Manage all healthcare appointments</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
          >
            <Plus className="h-5 w-5" />
            <span>Add Appointment</span>
          </button>
        </div>

        {/* Create/Edit Form */}
        {showForm && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {editingAppointment ? 'Edit Appointment' : 'Create New Appointment'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Patient *
                  </label>
                  <select
                    value={formData.patientId}
                    onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select Patient</option>
                    {patients.map((patient) => (
                      <option key={patient.id} value={patient.id}>
                        {patient.firstName} {patient.lastName} ({patient.email})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Doctor *
                  </label>
                  <select
                    value={formData.doctorId}
                    onChange={(e) => {
                      setFormData({ ...formData, doctorId: e.target.value });
                      handleDoctorChange(e.target.value);
                    }}
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
                    Doctor Schedule *
                  </label>
                  <select
                    value={formData.scheduleId}
                    onChange={(e) => {
                      setFormData({ ...formData, scheduleId: e.target.value });
                      handleScheduleChange(e.target.value);
                    }}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    disabled={!formData.doctorId}
                  >
                    <option value="">Select Schedule</option>
                    {doctorSchedules.map((schedule) => (
                      <option key={schedule.id} value={schedule.id}>
                        {new Date(schedule.date).toLocaleDateString()} - {schedule.startTime} to {schedule.endTime}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="PENDING">Pending</option>
                    <option value="CONFIRMED">Confirmed</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Appointment Date *
                  </label>
                  <input
                    type="date"
                    value={formData.appointmentDate}
                    onChange={(e) => setFormData({ ...formData, appointmentDate: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    min={new Date().toISOString().split('T')[0]}
                    readOnly
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Appointment Time *
                  </label>
                  <select
                    value={formData.appointmentTime}
                    onChange={(e) => setFormData({ ...formData, appointmentTime: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    disabled={!formData.scheduleId}
                  >
                    <option value="">Select Time Slot</option>
                    {availableTimeSlots.map((slot, index) => (
                      <option key={index} value={slot}>
                        {slot}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason
                </label>
                <textarea
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter appointment reason"
                  rows={3}
                  maxLength={1000}
                />
              </div>

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
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  {editingAppointment ? 'Update Appointment' : 'Create Appointment'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Search & Filter</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Appointments
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search by patient, doctor, or reason..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status Filter
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Status</option>
                <option value="PENDING">Pending</option>
                <option value="CONFIRMED">Confirmed</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
          </div>
        </div>

        {/* Appointments List */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              All Appointments ({filteredAppointments.length})
            </h3>
            
            {loading ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : filteredAppointments.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No appointments found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {searchTerm || statusFilter ? 'Try adjusting your search terms.' : 'Get started by creating a new appointment.'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Patient
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Doctor
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date & Time
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Reason
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredAppointments.map((appointment) => (
                      <tr key={appointment.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <User className="h-5 w-5 text-gray-400 mr-2" />
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {appointment.patientName || `Patient ${appointment.patientId}`}
                              </div>
                              <div className="text-sm text-gray-500">
                                ID: {appointment.patientId}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {appointment.doctorName || `Doctor ${appointment.doctorId}`}
                          </div>
                          <div className="text-sm text-gray-500">
                            ID: {appointment.doctorId}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 text-gray-400 mr-1" />
                            <div>
                              <div className="text-sm text-gray-900">
                                {new Date(appointment.appointmentDate).toLocaleDateString('en-GB')}
                              </div>
                              <div className="text-sm text-gray-500">
                                {appointment.appointmentTime}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                            {getStatusIcon(appointment.status)}
                            <span className="ml-1">{appointment.status}</span>
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900 max-w-xs truncate">
                            {appointment.reason || 'No reason provided'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleEdit(appointment)}
                              className="text-blue-600 hover:text-blue-900"
                              title="Edit appointment"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(appointment.id)}
                              className="text-red-600 hover:text-red-900"
                              title="Delete appointment"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminAppointments;