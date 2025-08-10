import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../components/DashboardLayout';
import { medicalRecordAPI } from '../../services/api';
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  User, 
  Calendar, 
  Clock, 
  Stethoscope, 
  FileText, 
  Pill, 
  MessageSquare,
  Printer,
  Download
} from 'lucide-react';
import toast from 'react-hot-toast';

const DoctorMedicalRecordDetails = () => {
  const { recordId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showEditForm, setShowEditForm] = useState(false);
  const [formData, setFormData] = useState({});
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (location.state?.record) {
      setRecord(location.state.record);
      setFormData({
        diagnosis: location.state.record.diagnosis || '',
        prescription: location.state.record.prescription || '',
        notes: location.state.record.notes || ''
      });
      setLoading(false);
    } else {
      fetchRecordDetails();
    }
  }, [recordId, location.state]);

  const fetchRecordDetails = async () => {
    try {
      setLoading(true);
      const recordData = await medicalRecordAPI.getById(recordId);
      setRecord(recordData);
      setFormData({
        diagnosis: recordData.diagnosis || '',
        prescription: recordData.prescription || '',
        notes: recordData.notes || ''
      });
    } catch (error) {
      console.error('Error fetching record details:', error);
      toast.error('Failed to load medical record details');
      navigate('/doctor/medical-records');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    
    if (!user || !user.id) {
      toast.error('User information not available. Please login again.');
      return;
    }

    try {
      setUpdating(true);
      
      const updateData = {
        patientId: record.patientId,
        doctorId: record.doctorId,
        appointmentId: record.appointmentId,
        recordDate: record.recordDate,
        diagnosis: formData.diagnosis,
        prescription: formData.prescription,
        notes: formData.notes
      };

      await medicalRecordAPI.update(recordId, updateData);
      
      toast.success('Medical record updated successfully!');
      setShowEditForm(false);
      fetchRecordDetails(); // Refresh the data
    } catch (error) {
      console.error('Error updating medical record:', error);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Failed to update medical record');
      }
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this medical record? This action cannot be undone.')) {
      try {
        setLoading(true);
        await medicalRecordAPI.delete(recordId);
        toast.success('Medical record deleted successfully!');
        navigate('/doctor/medical-records');
      } catch (error) {
        console.error('Error deleting medical record:', error);
        if (error.response?.data?.message) {
          toast.error(error.response.data.message);
        } else {
          toast.error('Failed to delete medical record');
        }
      } finally {
        setLoading(false);
      }
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not available';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return 'Invalid Date';
    }
  };

  const formatTime = (timeString) => {
    if (!timeString) return '';
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

  const handlePrint = () => {
    window.print();
  };

  const handleExport = () => {
    if (!record) return;
    
    const data = {
      patientName: record.patientName || `${record.patient?.firstName || ''} ${record.patient?.lastName || ''}`,
      patientEmail: record.patientEmail || record.patient?.email,
      recordDate: formatDate(record.recordDate),
      diagnosis: record.diagnosis,
      prescription: record.prescription,
      notes: record.notes,
      doctorName: record.doctorName || `${record.doctor?.firstName || ''} ${record.doctor?.lastName || ''}`,
      department: record.departmentName
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `medical-record-${record.id}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <DashboardLayout title="Medical Record Details">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!record) {
    return (
      <DashboardLayout title="Medical Record Details">
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Medical record not found</h3>
          <button
            onClick={() => navigate('/doctor/medical-records')}
            className="text-blue-600 hover:text-blue-800"
          >
            Back to Medical Records
          </button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Medical Record Details">
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-start">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/doctor/medical-records')}
                className="flex items-center text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Back to Medical Records
              </button>
              <div className="h-8 w-px bg-gray-300"></div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Medical Record Details</h1>
                <p className="text-gray-600">Record ID: {record.id}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={handlePrint}
                className="flex items-center px-3 py-2 text-gray-600 hover:text-gray-900 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                <Printer className="h-4 w-4 mr-2" />
                Print
              </button>
              <button
                onClick={handleExport}
                className="flex items-center px-3 py-2 text-gray-600 hover:text-gray-900 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </button>
              <button
                onClick={() => setShowEditForm(true)}
                className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </button>
              <button
                onClick={handleDelete}
                className="flex items-center px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </button>
            </div>
          </div>
        </div>

        {/* Record Information */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Patient Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center mb-4">
              <User className="h-5 w-5 text-blue-600 mr-2" />
              <h2 className="text-lg font-semibold text-gray-900">Patient Information</h2>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-500">Name</label>
                <p className="text-gray-900">
                  {record.patientName || `${record.patient?.firstName || ''} ${record.patient?.lastName || ''}`}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Email</label>
                <p className="text-gray-900">
                  {record.patientEmail || record.patient?.email || 'Not available'}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Patient ID</label>
                <p className="text-gray-900">{record.patientId}</p>
              </div>
            </div>
          </div>

          {/* Appointment Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center mb-4">
              <Calendar className="h-5 w-5 text-green-600 mr-2" />
              <h2 className="text-lg font-semibold text-gray-900">Appointment Information</h2>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-500">Date</label>
                <p className="text-gray-900">
                  {formatDate(record.appointmentDate)}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Time</label>
                <p className="text-gray-900">
                  {formatTime(record.appointmentTime)}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Appointment ID</label>
                <p className="text-gray-900">{record.appointmentId}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Medical Details */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center mb-4">
            <Stethoscope className="h-5 w-5 text-purple-600 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900">Medical Details</h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-medium text-gray-500 mb-2 block">Record Date</label>
              <p className="text-gray-900 mb-4">
                {formatDate(record.recordDate || record.createdAt)}
              </p>
              
              <label className="text-sm font-medium text-gray-500 mb-2 block">Diagnosis</label>
              <div className="bg-gray-50 p-4 rounded-md min-h-[100px]">
                {record.diagnosis ? (
                  <p className="text-gray-900 whitespace-pre-wrap">{record.diagnosis}</p>
                ) : (
                  <p className="text-gray-500 italic">No diagnosis recorded</p>
                )}
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-500 mb-2 block">Prescription</label>
              <div className="bg-gray-50 p-4 rounded-md min-h-[100px]">
                {record.prescription ? (
                  <p className="text-gray-900 whitespace-pre-wrap">{record.prescription}</p>
                ) : (
                  <p className="text-gray-500 italic">No prescription recorded</p>
                )}
              </div>
            </div>
          </div>
          
          <div className="mt-6">
            <label className="text-sm font-medium text-gray-500 mb-2 block">Additional Notes</label>
            <div className="bg-gray-50 p-4 rounded-md min-h-[100px]">
              {record.notes ? (
                <p className="text-gray-900 whitespace-pre-wrap">{record.notes}</p>
              ) : (
                <p className="text-gray-500 italic">No additional notes</p>
              )}
            </div>
          </div>
        </div>

        {/* Record Metadata */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center mb-4">
            <FileText className="h-5 w-5 text-gray-600 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900">Record Information</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Created</label>
              <p className="text-gray-900">{formatDate(record.createdAt)}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Last Updated</label>
              <p className="text-gray-900">{formatDate(record.updatedAt)}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Department</label>
              <p className="text-gray-900">{record.departmentName || 'N/A'}</p>
            </div>
          </div>
        </div>

        {/* Edit Form Modal */}
        {showEditForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Edit Medical Record</h3>
                <button
                  onClick={() => setShowEditForm(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleUpdate}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Diagnosis
                  </label>
                  <textarea
                    value={formData.diagnosis}
                    onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="4"
                    placeholder="Enter diagnosis..."
                    maxLength={2000}
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Prescription
                  </label>
                  <textarea
                    value={formData.prescription}
                    onChange={(e) => setFormData({ ...formData, prescription: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="4"
                    placeholder="Enter prescription..."
                    maxLength={2000}
                  />
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="4"
                    placeholder="Enter additional notes..."
                    maxLength={2000}
                  />
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowEditForm(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={updating}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    {updating ? 'Updating...' : 'Update Record'}
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

export default DoctorMedicalRecordDetails;
