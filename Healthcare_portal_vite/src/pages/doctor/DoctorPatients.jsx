import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../components/DashboardLayout';
import { appointmentAPI, medicalRecordAPI } from '../../services/api';
import { User, Search, Filter, Calendar, Phone, Mail, Eye, MessageSquare, Stethoscope, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

const DoctorPatients = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [patients, setPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState('');

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      
      // Get appointments to extract patient information
      const appointmentsData = await appointmentAPI.getMyPatientAppointments();
      
      if (!Array.isArray(appointmentsData)) {
        console.error('Appointments data is not an array:', appointmentsData);
        setPatients([]);
        setFilteredPatients([]);
        return;
      }
      
      // Group appointments by patient to get all appointments for each patient
      const patientAppointmentsMap = new Map();
      
      appointmentsData.forEach(appointment => {
        const patientId = appointment.patientId || appointment.patient?.id;
        
        if (patientId) {
          if (!patientAppointmentsMap.has(patientId)) {
            patientAppointmentsMap.set(patientId, {
              patientInfo: {
                id: patientId,
                name: appointment.patientName || 
                  `${appointment.patient?.firstName || ''} ${appointment.patient?.lastName || ''}`.trim() || 'Unknown Patient',
                email: appointment.patientEmail || appointment.patient?.email || 'No email',
                phone: appointment.patientPhone || appointment.patient?.phoneNumber || 'No phone',
                dateOfBirth: appointment.patientDateOfBirth || appointment.patient?.dateOfBirth || null,
                gender: appointment.patientGender || appointment.patient?.gender || 'Not specified'
              },
              appointments: []
            });
          }
          
          // Add this appointment to the patient's appointment list
          patientAppointmentsMap.get(patientId).appointments.push(appointment);
        }
      });
      
      // Convert to array and sort appointments by date
      const patientsList = Array.from(patientAppointmentsMap.values()).map(patientData => {
        // Sort appointments by date (newest first)
        const sortedAppointments = patientData.appointments.sort((a, b) => 
          new Date(b.appointmentDate) - new Date(a.appointmentDate)
        );
        
        return {
          ...patientData.patientInfo,
          appointments: sortedAppointments,
          totalAppointments: sortedAppointments.length,
          lastVisit: sortedAppointments[0]?.appointmentDate || null
        };
      });
      
      console.log('Processed patients with appointments:', patientsList);
      
      setPatients(patientsList);
      setFilteredPatients(patientsList);
    } catch (error) {
      console.error('Error fetching patients:', error);
      toast.error('Failed to load patients');
      setPatients([]);
      setFilteredPatients([]);
    } finally {
      setLoading(false);
    }
  };

  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return 'Unknown';
    try {
      const birthDate = new Date(dateOfBirth);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      
      return age;
    } catch (error) {
      return 'Unknown';
    }
  };

  useEffect(() => {
    filterPatients();
  }, [searchTerm, selectedDate, patients]);

  const filterPatients = () => {
    let filtered = patients;

    // Filter by name search
    if (searchTerm) {
      filtered = filtered.filter(patient =>
        patient.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by date (appointment date)
    if (selectedDate) {
      filtered = filtered.filter(patient => {
        // Check if any appointment matches the selected date
        return patient.appointments.some(appointment => {
          const appointmentDate = new Date(appointment.appointmentDate);
          const filterDate = new Date(selectedDate);
          return appointmentDate.toDateString() === filterDate.toDateString();
        });
      });
    }

    setFilteredPatients(filtered);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800';
      case 'INACTIVE':
        return 'bg-red-100 text-red-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
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

  const handleViewPatientDetails = (patientId) => {
    // Navigate to patient details or medical records
    navigate(`/doctor/medical-records?patientId=${patientId}`);
  };

  const handleViewAppointments = (patientId) => {
    // Navigate to appointments filtered by patient
    navigate(`/doctor/appointments?patientId=${patientId}`);
  };

  const handleCreateMedicalRecord = (patientId) => {
    // Navigate to medical records page with patient ID to create a new record
    navigate(`/doctor/medical-records?patientId=${patientId}&create=true`);
  };

  if (loading && patients.length === 0) {
    return (
      <DashboardLayout title="My Patients">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="My Patients">
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                My Patients
              </h2>
              <p className="text-gray-600">
                View and manage your patient information
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-600">{patients.length}</div>
              <div className="text-sm text-gray-500">Total Patients</div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search by Name
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search by patient name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

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
                onClick={() => {
                  setSearchTerm('');
                  setSelectedDate('');
                }}
                className="w-full px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => navigate('/doctor/medical-records')}
              className="flex items-center justify-center p-4 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <Stethoscope className="h-6 w-6 text-blue-600 mr-3" />
              <div className="text-left">
                <div className="font-medium text-blue-900">Medical Records</div>
                <div className="text-sm text-blue-600">Manage patient records</div>
              </div>
            </button>
            
            <button
              onClick={() => navigate('/doctor/schedules')}
              className="flex items-center justify-center p-4 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors"
            >
              <Calendar className="h-6 w-6 text-green-600 mr-3" />
              <div className="text-left">
                <div className="font-medium text-green-900">My Schedule</div>
                <div className="text-sm text-green-600">View and manage availability</div>
              </div>
            </button>
            
            <button
              onClick={() => navigate('/doctor/appointments')}
              className="flex items-center justify-center p-4 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition-colors"
            >
              <Clock className="h-6 w-6 text-purple-600 mr-3" />
              <div className="text-left">
                <div className="font-medium text-purple-900">Appointments</div>
                <div className="text-sm text-purple-600">View all appointments</div>
              </div>
            </button>
          </div>
        </div>

        {/* Patients Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Patient List ({filteredPatients.length})
            </h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Patient Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact Info
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mobile Number
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date of Birth
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Gender
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date of Appointment
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPatients.length > 0 ? (
                  filteredPatients.flatMap((patient) => 
                    patient.appointments.map((appointment, index) => (
                      <tr key={`${patient.id}-${appointment.id}-${index}`} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {patient.name}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {patient.email}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {patient.phone}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {patient.dateOfBirth ? formatDate(patient.dateOfBirth) : 'Not available'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {patient.gender}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDate(appointment.appointmentDate)}
                          <div className="text-xs text-gray-500">
                            {appointment.status}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleViewPatientDetails(patient.id)}
                              className="text-blue-600 hover:text-blue-900"
                              title="View Medical Records"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleCreateMedicalRecord(patient.id)}
                              className="text-green-600 hover:text-green-900"
                              title="Create Medical Record"
                            >
                              <Stethoscope className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )
                ) : (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center">
                      <div className="text-center">
                        <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No patients found</h3>
                        <p className="text-gray-600 mb-4">
                          {patients.length === 0 
                            ? 'You don\'t have any patients yet. Patients will appear here after they book appointments with you.' 
                            : 'Try adjusting your search criteria.'}
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Patient Statistics */}
        {patients.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Patient Statistics</h3>
              <button
                onClick={() => navigate('/doctor/medical-records')}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                <Stethoscope className="h-4 w-4 mr-2" />
                View Medical Records
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {patients.length}
                </div>
                <div className="text-sm text-gray-600">Total Patients</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {patients.reduce((sum, p) => sum + p.totalAppointments, 0)}
                </div>
                <div className="text-sm text-gray-600">Total Appointments</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {patients.reduce((sum, p) => 
                    sum + p.appointments.filter(a => a.status === 'CONFIRMED' && new Date(a.appointmentDate) > new Date()).length, 0
                  )}
                </div>
                <div className="text-sm text-gray-600">Upcoming Appointments</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default DoctorPatients;