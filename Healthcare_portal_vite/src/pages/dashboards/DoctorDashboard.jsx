import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../components/DashboardLayout';
import { 
  doctorScheduleAPI, 
  appointmentAPI, 
  medicalRecordAPI, 
  feedbackAPI 
} from '../../services/api';
import { 
  Calendar, 
  Users, 
  FileText, 
  MessageSquare, 
  Clock,
  CheckCircle,
  Star,
  Plus,
  Stethoscope,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

const DoctorDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    schedules: 0,
    appointments: 0,
    medicalRecords: 0,
    feedback: 0,
    pendingAppointments: 0,
    completedAppointments: 0,
    averageRating: 0
  });
  const [todaySchedule, setTodaySchedule] = useState([]);
  const [recentPatients, setRecentPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      console.log('Fetching doctor dashboard data...');
      
      // Fetch doctor-specific data
      const [
        schedules,
        appointments,
        medicalRecords,
        feedback
      ] = await Promise.all([
        doctorScheduleAPI.getMySchedules().catch(err => {
          console.error('Error fetching schedules:', err);
          return [];
        }),
        appointmentAPI.getMyPatientAppointments().catch(err => {
          console.error('Error fetching appointments:', err);
          return [];
        }),
        medicalRecordAPI.getMyPatientMedicalRecords().catch(err => {
          console.error('Error fetching medical records:', err);
          return [];
        }),
        feedbackAPI.getMyPatientFeedback().catch(err => {
          console.error('Error fetching feedback:', err);
          return [];
        })
      ]);

      console.log('Fetched doctor data:', {
        schedules: schedules?.length || 0,
        appointments: appointments?.length || 0,
        medicalRecords: medicalRecords?.length || 0,
        feedback: feedback?.length || 0
      });

      // Calculate stats
      const pendingAppointments = appointments?.filter(apt => apt.status === 'PENDING')?.length || 0;
      const completedAppointments = appointments?.filter(apt => apt.status === 'COMPLETED')?.length || 0;
      const averageRating = feedback?.length > 0 
        ? (feedback.reduce((sum, fb) => sum + fb.rating, 0) / feedback.length).toFixed(1)
        : 0;

      setStats({
        schedules: schedules?.length || 0,
        appointments: appointments?.length || 0,
        medicalRecords: medicalRecords?.length || 0,
        feedback: feedback?.length || 0,
        pendingAppointments,
        completedAppointments,
        averageRating
      });

      // Get today's schedule
      const today = new Date().toISOString().split('T')[0];
      const todaySchedules = schedules?.filter(schedule => 
        schedule.date === today
      ) || [];
      setTodaySchedule(todaySchedules);

      // Get recent patients (from appointments)
      const recentPatientsData = appointments
        ?.slice(0, 5)
        ?.map(apt => ({
          id: apt.patientId,
          name: apt.patientName,
          lastVisit: apt.appointmentDate,
          status: apt.status
        })) || [];
      setRecentPatients(recentPatientsData);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
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

  const getRatingColor = (rating) => {
    if (rating >= 4.5) return 'text-green-600';
    if (rating >= 4.0) return 'text-blue-600';
    if (rating >= 3.0) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <DashboardLayout title="Doctor Dashboard">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Doctor Dashboard">
      <div className="space-y-6">
        {/* Welcome Section with Doctor Theme */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold mb-2">
                Welcome back, Dr. {user?.lastName}!
              </h2>
              <p className="text-blue-100 text-lg">
                Ready to provide excellent patient care today.
              </p>
              <div className="flex items-center mt-3">
                <Stethoscope className="h-5 w-5 mr-2" />
                <span className="text-blue-100">
                  {user?.specialization || 'General Medicine'}
                </span>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="text-right">
                <div className="text-2xl font-bold">{stats.appointments}</div>
                <div className="text-blue-100">Total Patients</div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid with Medical Theme */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500 hover:shadow-lg transition-shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Calendar className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">My Schedules</p>
                <p className="text-2xl font-bold text-gray-900">{stats.schedules}</p>
                <p className="text-xs text-green-600">Available slots</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500 hover:shadow-lg transition-shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Users className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Patient Appointments</p>
                <p className="text-2xl font-bold text-gray-900">{stats.appointments}</p>
                <p className="text-xs text-green-600">Total bookings</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500 hover:shadow-lg transition-shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FileText className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Medical Records</p>
                <p className="text-2xl font-bold text-gray-900">{stats.medicalRecords}</p>
                <p className="text-xs text-purple-600">Created records</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-yellow-500 hover:shadow-lg transition-shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Star className="h-8 w-8 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Average Rating</p>
                <p className={`text-2xl font-bold ${getRatingColor(stats.averageRating)}`}>
                  {stats.averageRating}
                </p>
                <p className="text-xs text-yellow-600">Patient satisfaction</p>
              </div>
            </div>
          </div>
        </div>

        {/* Appointment Status and Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <TrendingUp className="h-5 w-5 mr-2 text-blue-600" />
              Appointment Status
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                <div className="flex items-center">
                  <Clock className="h-5 w-5 text-yellow-500 mr-2" />
                  <span className="text-sm text-gray-600">Pending</span>
                </div>
                <span className="text-lg font-semibold text-gray-900">{stats.pendingAppointments}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  <span className="text-sm text-gray-600">Completed</span>
                </div>
                <span className="text-lg font-semibold text-gray-900">{stats.completedAppointments}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Plus className="h-5 w-5 mr-2 text-green-600" />
              Quick Actions
            </h3>
            <div className="space-y-3">
              <button
                onClick={() => navigate('/doctor/schedules')}
                className="w-full flex items-center justify-center px-4 py-3 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors"
              >
                <Calendar className="h-4 w-4 mr-2" />
                Manage Schedules
              </button>
              <button
                onClick={() => navigate('/doctor/patients')}
                className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                <Users className="h-4 w-4 mr-2" />
                View Patients
              </button>
              <button
                onClick={() => navigate('/doctor/medical-records')}
                className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                <FileText className="h-4 w-4 mr-2" />
                Add Medical Records
              </button>
            </div>
          </div>
        </div>

        {/* Today's Schedule */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-blue-600" />
              Today's Schedule
            </h3>
          </div>
          <div className="p-6">
            {todaySchedule.length > 0 ? (
              <div className="space-y-4">
                {todaySchedule.map((schedule) => (
                  <div key={schedule.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {schedule.startTime} - {schedule.endTime}
                      </p>
                      <p className="text-sm text-gray-500">
                        {schedule.departmentName} • {schedule.maxPatients || 'Unlimited'} patients max
                      </p>
                    </div>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Available
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No schedules for today</p>
                <button
                  onClick={() => navigate('/doctor/schedules')}
                  className="mt-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  Create Schedule
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Recent Patients */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Users className="h-5 w-5 mr-2 text-green-600" />
              Recent Patients
            </h3>
          </div>
          <div className="p-6">
            {recentPatients.length > 0 ? (
              <div className="space-y-4">
                {recentPatients.map((patient) => (
                  <div key={patient.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {patient.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        Last visit: {new Date(patient.lastVisit).toLocaleDateString()}
                      </p>
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(patient.status)}`}>
                      {patient.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No recent patients</p>
                <button
                  onClick={() => navigate('/doctor/patients')}
                  className="mt-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  View All Patients
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Performance Insights */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <TrendingUp className="h-5 w-5 mr-2 text-purple-600" />
            Performance Insights
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{stats.averageRating}</div>
              <div className="text-sm text-gray-600">Average Rating</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{stats.completedAppointments}</div>
              <div className="text-sm text-gray-600">Completed Appointments</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{stats.medicalRecords}</div>
              <div className="text-sm text-gray-600">Medical Records Created</div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DoctorDashboard;