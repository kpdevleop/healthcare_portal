import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../components/DashboardLayout';
import { medicalRecordAPI, appointmentAPI } from '../../services/api';
import { FileText, Search, Filter, Plus, Edit, Eye, User, Calendar, Stethoscope, X } from 'lucide-react';
import toast from 'react-hot-toast';

const DoctorMedicalRecords = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [medicalRecords, setMedicalRecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatient, setSelectedPatient] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [patients, setPatients] = useState([]);
  const [formData, setFormData] = useState({
    patientId: '',
    recordDate: '',
    diagnosis: '',
    prescription: '',
    notes: ''
  });

  useEffect(() => {
    fetchMedicalRecords();
    fetchPatients();
  }, []);

  const fetchMedicalRecords = async () => {
    try {
      setLoading(true);
      const recordsData = await medicalRecordAPI.getMyPatientMedicalRecords();
      
      if (!Array.isArray(recordsData)) {
        console.error('Medical records data is not an array:', recordsData);
        setMedicalRecords([]);
        setFilteredRecords([]);
        return;
      }
      
      setMedicalRecords(recordsData);
      setFilteredRecords(recordsData);
    } catch (error) {
      console.error('Error fetching medical records:', error);
      toast.error('Failed to load medical records');
      setMedicalRecords([]);
      setFilteredRecords([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchPatients = async () => {
    try {
      // Get patients from appointments to show only patients who have appointments with this doctor
      const appointmentsData = await appointmentAPI.getMyPatientAppointments();
      
      if (!Array.isArray(appointmentsData)) {
        console.error('Appointments data is not an array:', appointmentsData);
        setPatients([]);
        return;
      }
      
      // Extract unique patients from appointments
      const uniquePatients = appointmentsData.reduce((acc, appointment) => {
        const patientId = appointment.patientId || appointment.patient?.id;
        const patientName = appointment.patientName || 
          `${appointment.patient?.firstName || ''} ${appointment.patient?.lastName || ''}`.trim();
        
        if (patientId && !acc.find(p => p.id === patientId)) {
          acc.push({
            id: patientId,
            name: patientName || 'Unknown Patient'
          });
        }
        return acc;
      }, []);
      
      setPatients(uniquePatients);
    } catch (error) {
      console.error('Error fetching patients:', error);
      toast.error('Failed to load patients');
      setPatients([]);
    }
  };

  useEffect(() => {
    filterRecords();
  }, [searchTerm, selectedPatient, selectedDate, medicalRecords]);

  const filterRecords = () => {
    let filtered = medicalRecords;

    if (searchTerm) {
      filtered = filtered.filter(record =>
        record.diagnosis?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.patient?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.patient?.lastName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedPatient) {
      filtered = filtered.filter(record =>
        record.patientId === parseInt(selectedPatient) || 
        record.patient?.id === parseInt(selectedPatient)
      );
    }

    if (selectedDate) {
      filtered = filtered.filter(record =>
        record.recordDate === selectedDate || record.createdAt?.split('T')[0] === selectedDate
      );
    }

    setFilteredRecords(filtered);
  };

  const validateForm = () => {
    if (!formData.patientId) {
      toast.error('Please select a patient');
      return false;
    }
    
    if (!formData.recordDate) {
      toast.error('Please select a record date');
      return false;
    }

    // Check if record date is in the past or present
    const selectedDate = new Date(formData.recordDate);
    const today = new Date();
    today.setHours(23, 59, 59, 999); // End of today
    
    if (selectedDate > today) {
      toast.error('Record date must be in the past or present');
      return false;
    }

    if (!formData.diagnosis && !formData.prescription && !formData.notes) {
      toast.error('Please provide at least diagnosis, prescription, or notes');
      return false;
    }

    return true;
  };

  const resetForm = () => {
    setFormData({
      patientId: '',
      recordDate: '',
      diagnosis: '',
      prescription: '',
      notes: ''
    });
    setEditingRecord(null);
  };

  const handleCreateRecord = async (e) => {
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
      
      // Prepare data according to MedicalRecordRequestDTO
      const recordData = {
        patientId: parseInt(formData.patientId),
        doctorId: parseInt(user.id),
        recordDate: formData.recordDate,
        diagnosis: formData.diagnosis || '',
        prescription: formData.prescription || '',
        notes: formData.notes || ''
      };

      console.log('Creating medical record with data:', recordData);
      await medicalRecordAPI.create(recordData);
      
      toast.success('Medical record created successfully!');
      setShowForm(false);
      resetForm();
      fetchMedicalRecords();
    } catch (error) {
      console.error('Error creating medical record:', error);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Failed to create medical record');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRecord = async (e) => {
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
      
      const recordData = {
        patientId: parseInt(formData.patientId),
        doctorId: parseInt(user.id),
        recordDate: formData.recordDate,
        diagnosis: formData.diagnosis || '',
        prescription: formData.prescription || '',
        notes: formData.notes || ''
      };

      console.log('Updating medical record with data:', recordData);
      await medicalRecordAPI.update(editingRecord.id, recordData);
      
      toast.success('Medical record updated successfully!');
      setShowForm(false);
      resetForm();
      fetchMedicalRecords();
    } catch (error) {
      console.error('Error updating medical record:', error);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else if (error.response?.data?.error) {
        toast.error(error.response.data.error);
      } else if (error.message) {
        toast.error(error.message);
      } else {
        toast.error('Failed to update medical record');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRecord = async (recordId) => {
    if (window.confirm('Are you sure you want to delete this medical record?')) {
      try {
        setLoading(true);
        await medicalRecordAPI.delete(recordId);
        toast.success('Medical record deleted successfully!');
        fetchMedicalRecords();
      } catch (error) {
        console.error('Error deleting medical record:', error);
        if (error.response?.data?.message) {
          toast.error(error.response.data.message);
        } else if (error.response?.data?.error) {
          toast.error(error.response.data.error);
        } else if (error.message) {
          toast.error(error.message);
        } else {
          toast.error('Failed to delete medical record');
        }
      } finally {
        setLoading(false);
      }
    }
  };

  const openEditForm = (record) => {
    setEditingRecord(record);
    setFormData({
      patientId: record.patientId.toString(),
      recordDate: record.recordDate || record.createdAt?.split('T')[0] || '',
      diagnosis: record.diagnosis || '',
      prescription: record.prescription || '',
      notes: record.notes || ''
    });
    setShowForm(true);
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

  if (loading && medicalRecords.length === 0) {
    return (
      <DashboardLayout title="Medical Records">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Medical Records">
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Medical Records
              </h2>
              <p className="text-gray-600">
                Manage medical records for your patients
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
              Add Medical Record
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search
              </label>
              <input
                type="text"
                placeholder="Search by diagnosis or patient..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Patient
              </label>
              <select
                value={selectedPatient}
                onChange={(e) => setSelectedPatient(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Patients</option>
                {patients.map((patient) => (
                  <option key={patient.id} value={patient.id}>
                    {patient.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date
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
                  setSelectedPatient('');
                  setSelectedDate('');
                }}
                className="w-full px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Medical Records List */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Medical Records ({filteredRecords.length})
            </h3>
          </div>
          
          <div className="overflow-x-auto">
            {filteredRecords.length > 0 ? (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Patient
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Record Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Diagnosis
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Prescription
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
                  {filteredRecords.map((record) => (
                    <tr key={record.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {record.patientName || `${record.patient?.firstName || ''} ${record.patient?.lastName || ''}`}
                        </div>
                        <div className="text-sm text-gray-500">
                          {record.patientEmail || record.patient?.email || 'No email'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(record.recordDate || record.createdAt)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-xs truncate">
                          {record.diagnosis || 'No diagnosis recorded'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-xs truncate">
                          {record.prescription || 'No prescription recorded'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {record.departmentName || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => openEditForm(record)}
                            className="text-blue-600 hover:text-blue-900"
                            title="Edit Record"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteRecord(record.id)}
                            className="text-red-600 hover:text-red-900"
                            title="Delete Record"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No medical records found</h3>
                <p className="text-gray-600 mb-4">
                  {medicalRecords.length === 0 
                    ? 'No medical records have been created yet.' 
                    : 'Try adjusting your search criteria.'}
                </p>
                {medicalRecords.length === 0 && (
                  <button
                    onClick={() => {
                      resetForm();
                      setShowForm(true);
                    }}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    Create your first medical record
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Add/Edit Medical Record Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {editingRecord ? 'Edit Medical Record' : 'Add Medical Record'}
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

              <form onSubmit={editingRecord ? handleUpdateRecord : handleCreateRecord}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Patient *
                    </label>
                    <select
                      value={formData.patientId}
                      onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                      disabled={editingRecord} // Disable patient selection when editing
                    >
                      <option value="">Select Patient</option>
                      {patients.map((patient) => (
                        <option key={patient.id} value={patient.id}>
                          {patient.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Record Date *
                    </label>
                    <input
                      type="date"
                      value={formData.recordDate}
                      onChange={(e) => setFormData({ ...formData, recordDate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                      max={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Diagnosis
                  </label>
                  <textarea
                    value={formData.diagnosis}
                    onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="3"
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
                    rows="3"
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
                    rows="3"
                    placeholder="Enter additional notes..."
                    maxLength={2000}
                  />
                </div>

                <div className="flex justify-end space-x-3">
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
                    {editingRecord ? (
                      <>
                        <Edit className="h-4 w-4 mr-2" />
                        {loading ? 'Updating...' : 'Update Record'}
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4 mr-2" />
                        {loading ? 'Creating...' : 'Create Record'}
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

export default DoctorMedicalRecords;