package com.healthcare.service;

import java.time.LocalDate;
import java.util.List;

import com.healthcare.dto.AppointmentRequestDTO;
import com.healthcare.dto.AppointmentResponseDTO;

public interface AppointmentService {
    
    // Create new appointment
    AppointmentResponseDTO createAppointment(AppointmentRequestDTO dto);
    
    // Update appointment
    AppointmentResponseDTO updateAppointment(Long id, AppointmentRequestDTO dto);
    
    // Get appointment by ID
    AppointmentResponseDTO getAppointmentById(Long id);
    
    // Get all appointments (Admin only)
    List<AppointmentResponseDTO> getAllAppointments();
    
    // Get appointments by patient ID
    List<AppointmentResponseDTO> getAppointmentsByPatient(Long patientId);
    
    // Get appointments by doctor ID
    List<AppointmentResponseDTO> getAppointmentsByDoctor(Long doctorId);
    
    // Get appointments by status
    List<AppointmentResponseDTO> getAppointmentsByStatus(String status);
    
    // Get appointments by date
    List<AppointmentResponseDTO> getAppointmentsByDate(LocalDate date);
    
    // Get my appointments (for current user)
    List<AppointmentResponseDTO> getMyAppointments();
    
    // Get my patient appointments (for doctors)
    List<AppointmentResponseDTO> getMyPatientAppointments();
    
    // Update appointment status
    AppointmentResponseDTO updateAppointmentStatus(Long id, String status);
    
    // Cancel appointment
    AppointmentResponseDTO cancelAppointment(Long id);
    
    // Complete appointment
    AppointmentResponseDTO completeAppointment(Long id);
    
    // Delete appointment
    void deleteAppointment(Long id);
} 