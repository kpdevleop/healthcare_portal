import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../components/DashboardLayout';
import { appointmentAPI, medicalRecordAPI, feedbackAPI } from '../../services/api';
import { Bell, Calendar, FileText, MessageSquare, Clock, CheckCircle, AlertCircle, Info } from 'lucide-react';
import toast from 'react-hot-toast';

const PatientNotifications = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, appointments, records, feedback

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      
      // Fetch all patient data to create notifications
      const [appointments, medicalRecords, feedback] = await Promise.all([
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
        })
      ]);

      // Create notifications from different data sources
      const allNotifications = [];

      // Appointment notifications
      appointments?.forEach(appointment => {
        allNotifications.push({
          id: `appointment-${appointment.id}`,
          type: 'appointment',
          title: `Appointment ${appointment.status.toLowerCase()}`,
          message: `Your appointment with Dr. ${appointment.doctorName} on ${formatDate(appointment.appointmentDate)} has been ${appointment.status.toLowerCase()}.`,
          date: appointment.appointmentDate,
          status: appointment.status,
          priority: getPriority(appointment.status),
          data: appointment
        });
      });

      // Medical record notifications
      medicalRecords?.forEach(record => {
        const doctorName = record.doctorName || `${record.doctor?.firstName} ${record.doctor?.lastName}`;
        allNotifications.push({
          id: `record-${record.id}`,
          type: 'medical_record',
          title: 'New Medical Record',
          message: `Dr. ${doctorName} has added a new medical record for your visit on ${formatDate(record.recordDate)}.`,
          date: record.recordDate,
          status: 'new',
          priority: 'medium',
          data: record
        });
      });

      // Feedback notifications
      feedback?.forEach(fb => {
        const doctorName = fb.doctorName || `${fb.doctor?.firstName} ${fb.doctor?.lastName}`;
        allNotifications.push({
          id: `feedback-${fb.id}`,
          type: 'feedback',
          title: 'Feedback Submitted',
          message: `Your feedback for Dr. ${doctorName} has been submitted successfully.`,
          date: fb.submittedAt || fb.createdAt || fb.creationDate,
          status: 'submitted',
          priority: 'low',
          data: fb
        });
      });

      // Sort by date (newest first)
      allNotifications.sort((a, b) => new Date(b.date) - new Date(a.date));
      
      setNotifications(allNotifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const getPriority = (status) => {
    switch (status) {
      case 'CANCELLED':
        return 'high';
      case 'CONFIRMED':
        return 'medium';
      case 'COMPLETED':
        return 'low';
      case 'PENDING':
        return 'medium';
      default:
        return 'low';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
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
      case 'new':
        return 'bg-blue-100 text-blue-800';
      case 'submitted':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'appointment':
        return <Calendar className="h-5 w-5" />;
      case 'medical_record':
        return <FileText className="h-5 w-5" />;
      case 'feedback':
        return <MessageSquare className="h-5 w-5" />;
      default:
        return <Bell className="h-5 w-5" />;
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

  const formatTime = (dateString) => {
    if (!dateString) return 'Not available';
    try {
      return new Date(dateString).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch (error) {
      return 'Invalid Time';
    }
  };

  const handleNotificationClick = (notification) => {
    switch (notification.type) {
      case 'appointment':
        navigate('/patient/appointments');
        break;
      case 'medical_record':
        navigate('/patient/medical-records');
        break;
      case 'feedback':
        navigate('/patient/feedback');
        break;
      default:
        break;
    }
  };

  const filteredNotifications = filter === 'all' 
    ? notifications 
    : notifications.filter(notification => notification.type === filter);

  if (loading) {
    return (
      <DashboardLayout title="Notifications">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Notifications">
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Notifications
              </h2>
              <p className="text-gray-600">
                Stay updated with your healthcare activities
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Bell className="h-5 w-5 text-gray-400" />
              <span className="text-sm text-gray-500">
                {notifications.length} notification{notifications.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white rounded-lg shadow">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setFilter('all')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  filter === 'all'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                All ({notifications.length})
              </button>
              <button
                onClick={() => setFilter('appointment')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  filter === 'appointment'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Appointments ({notifications.filter(n => n.type === 'appointment').length})
              </button>
              <button
                onClick={() => setFilter('medical_record')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  filter === 'medical_record'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Medical Records ({notifications.filter(n => n.type === 'medical_record').length})
              </button>
              <button
                onClick={() => setFilter('feedback')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  filter === 'feedback'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Feedback ({notifications.filter(n => n.type === 'feedback').length})
              </button>
            </nav>
          </div>
        </div>

        {/* Notifications List */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              {filter === 'all' ? 'All Notifications' : 
               filter === 'appointment' ? 'Appointment Notifications' :
               filter === 'medical_record' ? 'Medical Record Notifications' :
               'Feedback Notifications'} ({filteredNotifications.length})
            </h3>
          </div>
          
          <div className="p-6">
            {filteredNotifications.length > 0 ? (
              <div className="space-y-4">
                {filteredNotifications.map((notification) => (
                  <div 
                    key={notification.id} 
                    className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                          {getIcon(notification.type)}
                        </div>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-2">
                          <h4 className="text-lg font-semibold text-gray-900">
                            {notification.title}
                          </h4>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(notification.priority)}`}>
                            {notification.priority}
                          </span>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(notification.status)}`}>
                            {notification.status}
                          </span>
                        </div>
                        
                        <p className="text-gray-700 mb-3">
                          {notification.message}
                        </p>
                        
                        <div className="flex items-center text-sm text-gray-500">
                          <Clock className="h-4 w-4 mr-1" />
                          {formatDate(notification.date)} at {formatTime(notification.date)}
                        </div>
                      </div>
                      
                      <div className="flex-shrink-0">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleNotificationClick(notification);
                          }}
                          className="text-blue-600 hover:text-blue-800 transition-colors"
                        >
                          <Info className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications found</h3>
                <p className="text-gray-600 mb-4">
                  {notifications.length === 0 
                    ? 'You don\'t have any notifications yet.' 
                    : `No ${filter} notifications found.`}
                </p>
                {notifications.length === 0 && (
                  <p className="text-sm text-gray-500">
                    Notifications will appear here as you interact with the healthcare system.
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

export default PatientNotifications; 