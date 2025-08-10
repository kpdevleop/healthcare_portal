package com.healthcare.service;

import java.time.LocalDate;
import java.util.List;

import com.healthcare.dto.MedicalRecordRequestDTO;
import com.healthcare.dto.MedicalRecordResponseDTO;
import com.healthcare.dto.AppointmentResponseDTO;

public interface MedicalRecordService {
    
    // Create new medical record
    MedicalRecordResponseDTO createMedicalRecord(MedicalRecordRequestDTO dto);
    
    // Update medical record
    MedicalRecordResponseDTO updateMedicalRecord(Long id, MedicalRecordRequestDTO dto);
    
    // Get medical record by ID
    MedicalRecordResponseDTO getMedicalRecordById(Long id);
    
    // Get all medical records (Admin only)
    List<MedicalRecordResponseDTO> getAllMedicalRecords();
    
    // Get medical records by patient ID
    List<MedicalRecordResponseDTO> getMedicalRecordsByPatient(Long patientId);
    
    // Get medical records by doctor ID
    List<MedicalRecordResponseDTO> getMedicalRecordsByDoctor(Long doctorId);
    
    // Get medical records by date
    List<MedicalRecordResponseDTO> getMedicalRecordsByDate(LocalDate date);
    
    // Get medical records by patient and doctor
    List<MedicalRecordResponseDTO> getMedicalRecordsByPatientAndDoctor(Long patientId, Long doctorId);
    
    // Get my medical records (for current user)
    List<MedicalRecordResponseDTO> getMyMedicalRecords();
    
    // Get my patient medical records (for doctors)
    List<MedicalRecordResponseDTO> getMyPatientMedicalRecords();
    
    // Get available appointments for creating medical records
    List<AppointmentResponseDTO> getAvailableAppointmentsForMedicalRecord(Long patientId);
    
    // Delete medical record
    void deleteMedicalRecord(Long id);
    
    // Check if medical record belongs to current user (for security annotations)
    boolean isOwnMedicalRecord(Long medicalRecordId);
} 