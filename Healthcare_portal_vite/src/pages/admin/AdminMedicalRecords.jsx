import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { medicalRecordAPI, userAPI } from '../../services/api';
import { FileText, User, Search, Plus, Edit, Trash2, Eye, Calendar, Upload, X } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminMedicalRecords = () => {
  const [medicalRecords, setMedicalRecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [formData, setFormData] = useState({
    patientId: '',
    doctorId: '',
    recordDate: '',
    diagnosis: '',
    prescription: '',
    notes: '',
    attachments: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [recordsData, doctorsData, patientsData] = await Promise.all([
        medicalRecordAPI.getAll().catch(err => {
          console.error('Error fetching medical records:', err);
          return [];
        }),
        userAPI.getDoctors().catch(err => {
          console.error('Error fetching doctors:', err);
          return [];
        }),
        userAPI.getPatients().catch(err => {
          console.error('Error fetching patients:', err);
          return [];
        })
      ]);
      
      setMedicalRecords(recordsData || []);
      setFilteredRecords(recordsData || []);
      setDoctors(doctorsData || []);
      setPatients(patientsData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      // Don't show toast here as handleApiError will handle it
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    filterRecords();
  }, [searchTerm, medicalRecords]);

  const filterRecords = () => {
    let filtered = medicalRecords;

    if (searchTerm) {
      filtered = filtered.filter(record =>
        record.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.doctorName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.diagnosis?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.prescription?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredRecords(filtered);
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    
    // Check file size limit (5MB per file)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    const validFiles = files.filter(file => {
      if (file.size > maxSize) {
        toast.error(`File "${file.name}" is too large. Maximum size is 5MB.`);
        return false;
      }
      return true;
    });
    
    if (validFiles.length > 0) {
      setSelectedFiles(prev => [...prev, ...validFiles]);
    }
  };

  const removeFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Check total file size limit (20MB total)
      const totalSize = selectedFiles.reduce((total, file) => total + file.size, 0);
      const maxTotalSize = 20 * 1024 * 1024; // 20MB in bytes
      
      if (totalSize > maxTotalSize) {
        toast.error('Total file size exceeds 20MB limit. Please reduce file sizes or remove some files.');
        return;
      }
      
      // Convert files to base64 strings for storage
      const filePromises = selectedFiles.map(file => {
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = () => {
            resolve({
              name: file.name,
              type: file.type,
              size: file.size,
              data: reader.result
            });
          };
          reader.readAsDataURL(file);
        });
      });

      const fileData = await Promise.all(filePromises);
      const attachmentsJson = JSON.stringify(fileData);

      const submitData = {
        ...formData,
        patientId: parseInt(formData.patientId),
        doctorId: parseInt(formData.doctorId),
        attachments: attachmentsJson
      };

      if (editingRecord) {
        await medicalRecordAPI.update(editingRecord.id, submitData);
        toast.success('Medical record updated successfully!');
      } else {
        await medicalRecordAPI.create(submitData);
        toast.success('Medical record created successfully!');
      }
      
      setShowForm(false);
      setEditingRecord(null);
      resetForm();
      fetchData();
    } catch (error) {
      console.error('Error saving medical record:', error);
      toast.error(editingRecord ? 'Failed to update medical record' : 'Failed to create medical record');
    }
  };

  const handleEdit = (record) => {
    setEditingRecord(record);
    setFormData({
      patientId: record.patientId?.toString() || '',
      doctorId: record.doctorId?.toString() || '',
      recordDate: record.recordDate || '',
      diagnosis: record.diagnosis || '',
      prescription: record.prescription || '',
      notes: record.notes || '',
      attachments: record.attachments || ''
    });
    
    // Parse existing attachments if any
    if (record.attachments) {
      try {
        const parsedAttachments = JSON.parse(record.attachments);
        setSelectedFiles(parsedAttachments.map(att => ({
          name: att.name,
          type: att.type,
          size: att.size
        })));
      } catch (error) {
        console.error('Error parsing attachments:', error);
        setSelectedFiles([]);
      }
    } else {
      setSelectedFiles([]);
    }
    
    setShowForm(true);
  };

  const handleDelete = async (recordId) => {
    if (window.confirm('Are you sure you want to delete this medical record?')) {
      try {
        await medicalRecordAPI.delete(recordId);
        toast.success('Medical record deleted successfully');
        fetchData();
      } catch (error) {
        console.error('Error deleting medical record:', error);
        toast.error('Failed to delete medical record');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      patientId: '',
      doctorId: '',
      recordDate: '',
      diagnosis: '',
      prescription: '',
      notes: '',
      attachments: ''
    });
    setEditingRecord(null);
    setShowForm(false);
    setSelectedFiles([]);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Medical Records</h1>
            <p className="text-gray-600">Manage patient medical records and history</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
          >
            <Plus className="h-5 w-5" />
            <span>Add Record</span>
          </button>
              </div>

        {/* Create/Edit Form */}
        {showForm && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {editingRecord ? 'Edit Medical Record' : 'Create New Medical Record'}
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
                    Record Date *
                  </label>
                  <input
                    type="date"
                    value={formData.recordDate}
                    onChange={(e) => setFormData({ ...formData, recordDate: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    max={new Date().toISOString().split('T')[0]}
                  />
        </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                    Attachments (Optional)
              </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                  <div className="text-center">
                    <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-600 mb-2">
                      Click to upload files or drag and drop
                    </p>
                    <p className="text-xs text-gray-500 mb-3">
                      Max 5MB per file, 20MB total • Supported: PDF, DOC, DOCX, JPG, PNG, TXT
                    </p>
                    <input
                      type="file"
                      multiple
                      onChange={handleFileChange}
                      className="hidden"
                      id="file-upload"
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt"
                    />
                    <label
                      htmlFor="file-upload"
                      className="cursor-pointer bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm"
                    >
                      Choose Files
                    </label>
                  </div>
                </div>
                
                {/* Display selected files */}
                {selectedFiles.length > 0 && (
                  <div className="mt-3 space-y-2">
                    <p className="text-sm font-medium text-gray-700">Selected Files:</p>
                    {selectedFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                        <div className="flex items-center space-x-2">
                          <FileText className="h-4 w-4 text-gray-500" />
                          <span className="text-sm text-gray-700">{file.name}</span>
                          <span className="text-xs text-gray-500">({formatFileSize(file.size)})</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFile(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                  Diagnosis
              </label>
                <textarea
                  value={formData.diagnosis}
                  onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter diagnosis"
                  rows={3}
                  maxLength={2000}
                />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prescription
              </label>
                <textarea
                  value={formData.prescription}
                  onChange={(e) => setFormData({ ...formData, prescription: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter prescription"
                  rows={3}
                  maxLength={2000}
                />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes
              </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter additional notes"
                  rows={3}
                  maxLength={2000}
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
                  {editingRecord ? 'Update Record' : 'Create Record'}
              </button>
            </div>
            </form>
          </div>
        )}

        {/* Search */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Search Records</h3>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search by patient, doctor, diagnosis, or prescription..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Medical Records List */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              All Medical Records ({filteredRecords.length})
            </h3>
            
            {loading ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : filteredRecords.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No medical records found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {searchTerm ? 'Try adjusting your search terms.' : 'Get started by creating a new medical record.'}
                </p>
          </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredRecords.map((record) => (
                  <div key={record.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center space-x-2">
                        <FileText className="h-5 w-5 text-blue-600" />
                        <h4 className="font-semibold text-gray-900">
                          Record #{record.id}
                        </h4>
                      </div>
                      <div className="flex space-x-1">
                        <button
                          onClick={() => handleEdit(record)}
                          className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                          title="Edit record"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(record.id)}
                          className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                          title="Delete record"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center text-sm text-gray-600">
                        <User className="h-4 w-4 mr-2" />
                        <span>
                          <strong>Patient:</strong> {record.patientName || `Patient ${record.patientId}`}
                        </span>
                      </div>
                      
                      <div className="flex items-center text-sm text-gray-600">
                        <User className="h-4 w-4 mr-2" />
                        <span>
                          <strong>Doctor:</strong> {record.doctorName || `Doctor ${record.doctorId}`}
                        </span>
                      </div>
                      
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="h-4 w-4 mr-2" />
                        <span>
                          <strong>Date:</strong> {new Date(record.recordDate).toLocaleDateString()}
                        </span>
                      </div>
                      
                      {record.diagnosis && (
                        <div className="text-sm text-gray-600">
                          <strong>Diagnosis:</strong> {record.diagnosis.length > 100 
                            ? `${record.diagnosis.substring(0, 100)}...` 
                            : record.diagnosis}
                      </div>
                      )}

                      {record.prescription && (
                        <div className="text-sm text-gray-600">
                          <strong>Prescription:</strong> {record.prescription.length > 100 
                            ? `${record.prescription.substring(0, 100)}...` 
                            : record.prescription}
                        </div>
                      )}

                      {record.notes && (
                        <div className="text-sm text-gray-600">
                          <strong>Notes:</strong> {record.notes.length > 100 
                            ? `${record.notes.substring(0, 100)}...` 
                            : record.notes}
                        </div>
                      )}

                      {record.attachments && (
                        <div className="text-sm text-gray-600">
                          <strong>Attachments:</strong> 
                          <div className="mt-1">
                            {(() => {
                              try {
                                const attachments = JSON.parse(record.attachments);
                                return attachments.map((file, index) => (
                                  <div key={index} className="flex items-center space-x-2 text-xs">
                                    <FileText className="h-3 w-3" />
                                    <span>{file.name}</span>
                                  </div>
                                ));
                              } catch (error) {
                                return <span className="text-gray-500">Files attached</span>;
                              }
                            })()}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-xs text-gray-500 mt-3">
                      <span>ID: {record.id}</span>
                      <span>Created: {new Date(record.createdAt).toLocaleDateString()}</span>
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

export default AdminMedicalRecords;