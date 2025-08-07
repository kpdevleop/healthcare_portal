import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../components/DashboardLayout';
import { 
  appointmentAPI, 
  medicalRecordAPI, 
  feedbackAPI, 
  doctorScheduleAPI 
} from '../../services/api';
import { 
  Calendar, 
  FileText, 
  MessageSquare, 
  Users, 
  Clock,
  CheckCircle,
  Star,
  Plus,
  Heart,
  TrendingUp,
  Bell,
  Activity
} from 'lucide-react';
import toast from 'react-hot-toast';

const PatientDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    appointments: 0,
    medicalRecords: 0,
    feedback: 0,
    pendingAppointments: 0,
    completedAppointments: 0,
    averageRating: 0
  });
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [recentMedicalRecords, setRecentMedicalRecords] = useState([]);
  const [availableDoctors, setAvailableDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      console.log('Fetching patient dashboard data...');
      
      // Fetch patient-specific data
      const [
        appointments,
        medicalRecords,
        feedback,
        schedules
      ] = await Promise.all([
        appointmentAPI.getMyAppointments().catch(err => {
          console.error('Error fetching appointments:', err);
          return [];
        }),
        medicalRecordAPI.getMyMedicalRecords().catch(err => {
          console.error('Error fetching medical records:', err);
          return [];
        }),
        feedbackAPI.getMyFeedback().catch(err => {
          console.error('Error fetching feedback:', err);
          return [];
        }),
        doctorScheduleAPI.getAll().catch(err => {
          console.error('Error fetching schedules:', err);
          return [];
        })
      ]);

      console.log('Fetched patient data:', {
        appointments: appointments?.length || 0,
        medicalRecords: medicalRecords?.length || 0,
        feedback: feedback?.length || 0,
        schedules: schedules?.length || 0
      });

      // Calculate stats
      const pendingAppointments = appointments?.filter(apt => apt.status === 'PENDING')?.length || 0;
      const completedAppointments = appointments?.filter(apt => apt.status === 'COMPLETED')?.length || 0;
      const averageRating = feedback?.length > 0 
        ? (feedback.reduce((sum, fb) => sum + fb.rating, 0) / feedback.length).toFixed(1)
        : 0;

      setStats({
        appointments: appointments?.length || 0,
        medicalRecords: medicalRecords?.length || 0,
        feedback: feedback?.length || 0,
        pendingAppointments,
        completedAppointments,
        averageRating
      });

      // Get upcoming appointments (next 7 days)
      const today = new Date();
      const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
      const upcoming = appointments
        ?.filter(apt => {
          const aptDate = new Date(apt.appointmentDate);
          return aptDate >= today && aptDate <= nextWeek && apt.status !== 'CANCELLED';
        })
        ?.sort((a, b) => new Date(a.appointmentDate) - new Date(b.appointmentDate))
        ?.slice(0, 5) || [];
      setUpcomingAppointments(upcoming);

      // Get recent medical records
      const recentRecords = medicalRecords
        ?.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        ?.slice(0, 3) || [];
      setRecentMedicalRecords(recentRecords);

      // Get available doctors (from schedules)
      const uniqueDoctors = [...new Map(schedules?.map(schedule => 
        [schedule.doctorId, schedule]
      ) || []).values()];
      setAvailableDoctors(uniqueDoctors.slice(0, 5));

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
      <DashboardLayout title="Patient Dashboard">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Patient Dashboard">
      <div className="space-y-6">
        {/* Welcome Section with Patient Theme */}
        <div className="bg-gradient-to-r from-green-600 to-green-800 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold mb-2">
                Welcome back, {user?.firstName}!
              </h2>
              <p className="text-green-100 text-lg">
                Your health journey is our priority.
              </p>
              <div className="flex items-center mt-3">
                <Heart className="h-5 w-5 mr-2" />
                <span className="text-green-100">
                  Stay healthy and take care!
                </span>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="text-right">
                <div className="text-2xl font-bold">{stats.appointments}</div>
                <div className="text-green-100">Total Appointments</div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid with Patient Theme */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500 hover:shadow-lg transition-shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Calendar className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Appointments</p>
                <p className="text-2xl font-bold text-gray-900">{stats.appointments}</p>
                <p className="text-xs text-green-600">Scheduled visits</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500 hover:shadow-lg transition-shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FileText className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Medical Records</p>
                <p className="text-2xl font-bold text-gray-900">{stats.medicalRecords}</p>
                <p className="text-xs text-blue-600">Health history</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500 hover:shadow-lg transition-shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <MessageSquare className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">My Reviews</p>
                <p className="text-2xl font-bold text-gray-900">{stats.feedback}</p>
                <p className="text-xs text-purple-600">Given feedback</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-yellow-500 hover:shadow-lg transition-shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Star className="h-8 w-8 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Avg Rating</p>
                <p className={`text-2xl font-bold ${getRatingColor(stats.averageRating)}`}>
                  {stats.averageRating}
                </p>
                <p className="text-xs text-yellow-600">Your ratings</p>
              </div>
            </div>
          </div>
        </div>

        {/* Appointment Status and Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Activity className="h-5 w-5 mr-2 text-green-600" />
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
                onClick={() => navigate('/patient/book-appointment')}
                className="w-full flex items-center justify-center px-4 py-3 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 transition-colors"
              >
                <Calendar className="h-4 w-4 mr-2" />
                Book New Appointment
              </button>
              <button
                onClick={() => navigate('/patient/appointments')}
                className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                <Calendar className="h-4 w-4 mr-2" />
                View All Appointments
              </button>
              <button
                onClick={() => navigate('/patient/medical-records')}
                className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                <FileText className="h-4 w-4 mr-2" />
                View Medical Records
              </button>
            </div>
          </div>
        </div>

        {/* Upcoming Appointments */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-green-600" />
              Upcoming Appointments
            </h3>
          </div>
          <div className="p-6">
            {upcomingAppointments.length > 0 ? (
              <div className="space-y-4">
                {upcomingAppointments.map((appointment) => (
                  <div key={appointment.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        Dr. {appointment.doctorName}
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(appointment.appointmentDate).toLocaleDateString()} at {appointment.appointmentTime}
                      </p>
                      {appointment.departmentName && (
                        <p className="text-xs text-blue-600">{appointment.departmentName}</p>
                      )}
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                      {appointment.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No upcoming appointments</p>
                <button
                  onClick={() => navigate('/patient/book-appointment')}
                  className="mt-2 text-green-600 hover:text-green-800 text-sm font-medium"
                >
                  Book an Appointment
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Recent Medical Records */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <FileText className="h-5 w-5 mr-2 text-blue-600" />
              Recent Medical Records
            </h3>
          </div>
          <div className="p-6">
            {recentMedicalRecords.length > 0 ? (
              <div className="space-y-4">
                {recentMedicalRecords.map((record) => (
                  <div key={record.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {record.diagnosis || 'Medical Record'}
                      </p>
                      <p className="text-sm text-gray-500">
                        Dr. {record.doctorName} • {new Date(record.createdAt).toLocaleDateString()}
                      </p>
                      {record.departmentName && (
                        <p className="text-xs text-blue-600">{record.departmentName}</p>
                      )}
                    </div>
                    <button
                      onClick={() => navigate('/patient/medical-records')}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      View Details
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No recent medical records</p>
                <p className="text-sm text-gray-400 mt-1">
                  Medical records will appear here after your appointments
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Health Insights */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <TrendingUp className="h-5 w-5 mr-2 text-purple-600" />
            Health Insights
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{stats.completedAppointments}</div>
              <div className="text-sm text-gray-600">Completed Visits</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{stats.medicalRecords}</div>
              <div className="text-sm text-gray-600">Health Records</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{stats.feedback}</div>
              <div className="text-sm text-gray-600">Reviews Given</div>
            </div>
          </div>
        </div>

        {/* Health Tips */}
        <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Heart className="h-5 w-5 mr-2 text-red-600" />
            Health Tips
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <h4 className="font-medium text-gray-900 mb-2">Stay Hydrated</h4>
              <p className="text-sm text-gray-600">Drink at least 8 glasses of water daily for optimal health.</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <h4 className="font-medium text-gray-900 mb-2">Regular Exercise</h4>
              <p className="text-sm text-gray-600">Aim for 30 minutes of moderate exercise most days of the week.</p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default PatientDashboard;