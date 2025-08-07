import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import { medicalRecordAPI } from '../../services/api';
import { FileText, User, Calendar, Search, Filter, Eye, Download, Plus } from 'lucide-react';
import toast from 'react-hot-toast';

const PatientMedicalRecords = () => {
  const navigate = useNavigate();
  const [medicalRecords, setMedicalRecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [doctors, setDoctors] = useState([]);

  useEffect(() => {
    fetchMedicalRecords();
  }, []);

  const fetchMedicalRecords = async () => {
    try {
      setLoading(true);
      const recordsData = await medicalRecordAPI.getMyMedicalRecords();
      setMedicalRecords(recordsData || []);
      setFilteredRecords(recordsData || []);
      
      // Extract unique doctors from records
      const uniqueDoctors = [...new Set(recordsData?.map(record => 
        record.doctorName || `${record.doctor?.firstName} ${record.doctor?.lastName}`
      ).filter(Boolean) || [])];
      setDoctors(uniqueDoctors);
    } catch (error) {
      console.error('Error fetching medical records:', error);
      toast.error('Failed to load medical records');
      setMedicalRecords([]);
      setFilteredRecords([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    filterRecords();
  }, [searchTerm, selectedDate, selectedDoctor, medicalRecords]);

  const filterRecords = () => {
    let filtered = medicalRecords;

    if (searchTerm) {
      filtered = filtered.filter(record =>
        record.diagnosis?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.prescription?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.notes?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.doctorName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (record.doctor?.firstName && record.doctor?.lastName && 
         `${record.doctor.firstName} ${record.doctor.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (selectedDate) {
      filtered = filtered.filter(record =>
        record.recordDate === selectedDate
      );
    }

    if (selectedDoctor) {
      filtered = filtered.filter(record => {
        const doctorName = record.doctorName || `${record.doctor?.firstName} ${record.doctor?.lastName}`;
        return doctorName === selectedDoctor;
      });
    }

    setFilteredRecords(filtered);
  };

  const handleDownloadRecord = (record) => {
    // This would typically generate a PDF or download the record
    toast.success('Download started for medical record');
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

  const getDoctorName = (record) => {
    return record.doctorName || 
           (record.doctor?.firstName && record.doctor?.lastName ? 
            `${record.doctor.firstName} ${record.doctor.lastName}` : 
            'Unknown Doctor');
  };

  const getDepartmentName = (record) => {
    return record.departmentName || record.doctor?.department?.name || 'Not specified';
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
                View your complete medical history and records
              </p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Records
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by diagnosis, prescription, or doctor..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Record Date
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Doctor
              </label>
              <select
                value={selectedDoctor}
                onChange={(e) => setSelectedDoctor(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Doctors</option>
                {doctors.map((doctor, index) => (
                  <option key={index} value={doctor}>
                    {doctor}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="mt-4 flex justify-end">
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedDate('');
                setSelectedDoctor('');
              }}
              className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Medical Records List */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Medical Records ({filteredRecords.length})
            </h3>
          </div>
          
          <div className="p-6">
            {filteredRecords.length > 0 ? (
              <div className="space-y-4">
                {filteredRecords.map((record) => (
                  <div key={record.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            Medical Record
                          </span>
                          <span className="text-sm text-gray-500">
                            ID: {record.id}
                          </span>
                        </div>
                        
                        <h4 className="text-lg font-semibold text-gray-900 mb-1">
                          Dr. {getDoctorName(record)}
                        </h4>
                        
                        <p className="text-sm text-blue-600 font-medium mb-2">
                          {getDepartmentName(record)}
                        </p>
                        
                        {record.doctorSpecialization && (
                          <p className="text-sm text-gray-600 mb-2">
                            Specialization: {record.doctorSpecialization}
                          </p>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleDownloadRecord(record)}
                          className="text-blue-600 hover:text-blue-800 transition-colors"
                          title="Download record"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="h-4 w-4 mr-2" />
                        Record Date: {formatDate(record.recordDate)}
                      </div>
                    </div>

                    {record.diagnosis && (
                      <div className="mb-4">
                        <h5 className="text-sm font-medium text-gray-700 mb-1">Diagnosis</h5>
                        <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-md">
                          {record.diagnosis}
                        </p>
                      </div>
                    )}

                    {record.prescription && (
                      <div className="mb-4">
                        <h5 className="text-sm font-medium text-gray-700 mb-1">Prescription</h5>
                        <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-md">
                          {record.prescription}
                        </p>
                      </div>
                    )}

                    {record.notes && (
                      <div className="mb-4">
                        <h5 className="text-sm font-medium text-gray-700 mb-1">Notes</h5>
                        <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-md">
                          {record.notes}
                        </p>
                      </div>
                    )}

                    {record.attachments && (
                      <div className="mb-4">
                        <h5 className="text-sm font-medium text-gray-700 mb-1">Attachments</h5>
                        <p className="text-sm text-gray-500">
                          {record.attachments ? 'Attachments available' : 'No attachments'}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No medical records found</h3>
                <p className="text-gray-600 mb-4">
                  {medicalRecords.length === 0 
                    ? 'You don\'t have any medical records yet.' 
                    : 'Try adjusting your search criteria.'}
                </p>
                {medicalRecords.length === 0 && (
                  <p className="text-sm text-gray-500">
                    Medical records will appear here after your appointments with doctors.
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

export default PatientMedicalRecords;