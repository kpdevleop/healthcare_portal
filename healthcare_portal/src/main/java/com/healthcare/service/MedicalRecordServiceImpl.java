package com.healthcare.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.healthcare.custom_exceptions.ResourceNotFoundException;
import com.healthcare.custom_exceptions.InvalidInputException;
import com.healthcare.dto.MedicalRecordRequestDTO;
import com.healthcare.dto.MedicalRecordResponseDTO;
import com.healthcare.entity.MedicalRecord;
import com.healthcare.entity.Appointment;
import com.healthcare.entity.User;
import com.healthcare.repository.MedicalRecordRepository;
import com.healthcare.repository.AppointmentRepository;
import com.healthcare.repository.UserRepository;
import com.healthcare.dto.AppointmentResponseDTO;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class MedicalRecordServiceImpl implements MedicalRecordService {
    
    private final MedicalRecordRepository medicalRecordRepository;
    private final UserRepository userRepository;
    private final AppointmentRepository appointmentRepository;
    
    // Convert entity to DTO
    private MedicalRecordResponseDTO toDTO(MedicalRecord medicalRecord) {
        return MedicalRecordResponseDTO.builder()
                .id(medicalRecord.getId())
                .patientId(medicalRecord.getPatient().getId())
                .patientName(medicalRecord.getPatient().getFirstName() + " " + medicalRecord.getPatient().getLastName())
                .patientEmail(medicalRecord.getPatient().getEmail())
                .doctorId(medicalRecord.getDoctor().getId())
                .doctorName(medicalRecord.getDoctor().getFirstName() + " " + medicalRecord.getDoctor().getLastName())
                .doctorEmail(medicalRecord.getDoctor().getEmail())
                .appointmentId(medicalRecord.getAppointment().getId())
                .appointmentDate(medicalRecord.getAppointment().getAppointmentDate())
                .appointmentTime(medicalRecord.getAppointment().getAppointmentTime())
                .appointmentStatus(medicalRecord.getAppointment().getStatus())
                .recordDate(medicalRecord.getRecordDate())
                .diagnosis(medicalRecord.getDiagnosis())
                .prescription(medicalRecord.getPrescription())
                .notes(medicalRecord.getNotes())
                .attachments(medicalRecord.getAttachments())
                .departmentName(medicalRecord.getDoctor().getDepartment() != null ? medicalRecord.getDoctor().getDepartment().getName() : null)
                .doctorSpecialization(medicalRecord.getDoctor().getSpecialization())
                .build();
    }
    
    @Override
    @Transactional
    public MedicalRecordResponseDTO createMedicalRecord(MedicalRecordRequestDTO dto) {
        // Validate patient exists
        User patient = userRepository.findById(dto.getPatientId())
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found with ID: " + dto.getPatientId()));
        
        // Validate doctor exists
        User doctor = userRepository.findById(dto.getDoctorId())
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found with ID: " + dto.getDoctorId()));
        
        // Validate appointment exists and belongs to the doctor and patient
        Appointment appointment = appointmentRepository.findById(dto.getAppointmentId())
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found with ID: " + dto.getAppointmentId()));
        
        // Check if appointment belongs to the specified doctor and patient
        if (!appointment.getDoctor().getId().equals(dto.getDoctorId()) || 
            !appointment.getPatient().getId().equals(dto.getPatientId())) {
            throw new InvalidInputException("Appointment does not match the specified doctor and patient");
        }
        
        // Check if appointment is in CONFIRMED status
        if (!"CONFIRMED".equals(appointment.getStatus())) {
            throw new InvalidInputException("Medical record can only be created for CONFIRMED appointments");
        }
        
        // Validate record date matches appointment date
        if (!dto.getRecordDate().equals(appointment.getAppointmentDate())) {
            throw new InvalidInputException("Record date must match the appointment date");
        }
        
        // Check if current time is after appointment time (for same day appointments)
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime appointmentDateTime = LocalDateTime.of(appointment.getAppointmentDate(), appointment.getAppointmentTime());
        
        if (dto.getRecordDate().equals(LocalDate.now()) && now.isBefore(appointmentDateTime)) {
            throw new InvalidInputException("Medical record cannot be created before the appointment time");
        }
        
        // Check if medical record already exists for this appointment
        if (medicalRecordRepository.existsByAppointmentId(dto.getAppointmentId())) {
            throw new InvalidInputException("Medical record already exists for this appointment");
        }
        
        // Create medical record
        MedicalRecord medicalRecord = MedicalRecord.builder()
                .patient(patient)
                .doctor(doctor)
                .appointment(appointment)
                .recordDate(dto.getRecordDate())
                .diagnosis(dto.getDiagnosis())
                .prescription(dto.getPrescription())
                .notes(dto.getNotes())
                .attachments(dto.getAttachments()) // Can be null
                .build();
        
        MedicalRecord savedMedicalRecord = medicalRecordRepository.save(medicalRecord);
        
        // Automatically complete the appointment
        appointment.setStatus("COMPLETED");
        appointmentRepository.save(appointment);
        
        return toDTO(savedMedicalRecord);
    }
    
    @Override
    @Transactional
    public MedicalRecordResponseDTO updateMedicalRecord(Long id, MedicalRecordRequestDTO dto) {
        MedicalRecord medicalRecord = medicalRecordRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Medical record not found with ID: " + id));
        
        // Check if current user has permission to update this record
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        // Only allow admin or the doctor who created the record to update it
        if (!currentUser.getRole().name().equals("ROLE_ADMIN") && 
            !medicalRecord.getDoctor().getId().equals(currentUser.getId())) {
            throw new RuntimeException("Access denied: You can only update your own medical records");
        }
        
        // Validate patient exists
        User patient = userRepository.findById(dto.getPatientId())
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found with ID: " + dto.getPatientId()));
        
        // Validate doctor exists
        User doctor = userRepository.findById(dto.getDoctorId())
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found with ID: " + dto.getDoctorId()));
        
        // Validate appointment exists and belongs to the doctor and patient
        Appointment appointment = appointmentRepository.findById(dto.getAppointmentId())
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found with ID: " + dto.getAppointmentId()));
        
        // Check if appointment belongs to the specified doctor and patient
        if (!appointment.getDoctor().getId().equals(dto.getDoctorId()) || 
            !appointment.getPatient().getId().equals(dto.getPatientId())) {
            throw new InvalidInputException("Appointment does not match the specified doctor and patient");
        }
        
        // Validate record date matches appointment date
        if (!dto.getRecordDate().equals(appointment.getAppointmentDate())) {
            throw new InvalidInputException("Record date must match the appointment date");
        }
        
        // Update medical record
        medicalRecord.setPatient(patient);
        medicalRecord.setDoctor(doctor);
        medicalRecord.setAppointment(appointment);
        medicalRecord.setRecordDate(dto.getRecordDate());
        medicalRecord.setDiagnosis(dto.getDiagnosis());
        medicalRecord.setPrescription(dto.getPrescription());
        medicalRecord.setNotes(dto.getNotes());
        medicalRecord.setAttachments(dto.getAttachments());
        
        MedicalRecord updatedMedicalRecord = medicalRecordRepository.save(medicalRecord);
        return toDTO(updatedMedicalRecord);
    }
    
    @Override
    @Transactional
    public MedicalRecordResponseDTO getMedicalRecordById(Long id) {
        MedicalRecord medicalRecord = medicalRecordRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Medical record not found with ID: " + id));
        
        // Check if current user has permission to view this record
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        // Only allow admin or the doctor who created the record to view it
        if (!currentUser.getRole().name().equals("ROLE_ADMIN") && 
            !medicalRecord.getDoctor().getId().equals(currentUser.getId())) {
            throw new RuntimeException("Access denied: You can only view your own medical records");
        }
        
        return toDTO(medicalRecord);
    }
    
    @Override
    @Transactional
    public List<MedicalRecordResponseDTO> getAllMedicalRecords() {
        return medicalRecordRepository.findAllWithDetails().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    @Transactional
    public List<MedicalRecordResponseDTO> getMedicalRecordsByPatient(Long patientId) {
        userRepository.findById(patientId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found with ID: " + patientId));
        
        return medicalRecordRepository.findByPatientIdWithDetails(patientId).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    @Transactional
    public List<MedicalRecordResponseDTO> getMedicalRecordsByDoctor(Long doctorId) {
        userRepository.findById(doctorId)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found with ID: " + doctorId));
        
        return medicalRecordRepository.findByDoctorIdWithDetails(doctorId).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    @Transactional
    public List<MedicalRecordResponseDTO> getMedicalRecordsByDate(LocalDate date) {
        return medicalRecordRepository.findByRecordDateWithDetails(date).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    @Transactional
    public List<MedicalRecordResponseDTO> getMedicalRecordsByPatientAndDoctor(Long patientId, Long doctorId) {
        userRepository.findById(patientId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found with ID: " + patientId));
        
        userRepository.findById(doctorId)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found with ID: " + doctorId));
        
        return medicalRecordRepository.findByPatientIdAndDoctorIdWithDetails(patientId, doctorId).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    @Transactional
    public List<MedicalRecordResponseDTO> getMyMedicalRecords() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        if (currentUser.getRole().name().equals("ROLE_PATIENT")) {
            return medicalRecordRepository.findByPatientIdWithDetails(currentUser.getId()).stream()
                    .map(this::toDTO)
                    .collect(Collectors.toList());
        } else if (currentUser.getRole().name().equals("ROLE_DOCTOR")) {
            return medicalRecordRepository.findByDoctorIdWithDetails(currentUser.getId()).stream()
                    .map(this::toDTO)
                    .collect(Collectors.toList());
        } else {
            // Admin can see all medical records
            return getAllMedicalRecords();
        }
    }
    
    @Override
    @Transactional
    public List<MedicalRecordResponseDTO> getMyPatientMedicalRecords() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        if (currentUser.getRole().name().equals("ROLE_DOCTOR")) {
            return medicalRecordRepository.findByDoctorIdWithDetails(currentUser.getId()).stream()
                    .map(this::toDTO)
                    .collect(Collectors.toList());
        } else {
            throw new RuntimeException("Only doctors can access patient medical records");
        }
    }
    
    @Override
    @Transactional
    public void deleteMedicalRecord(Long id) {
        MedicalRecord medicalRecord = medicalRecordRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Medical record not found with ID: " + id));
        
        // Check if current user has permission to delete this record
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        // Only allow admin or the doctor who created the record to delete it
        if (!currentUser.getRole().name().equals("ROLE_ADMIN") && 
            !medicalRecord.getDoctor().getId().equals(currentUser.getId())) {
            throw new RuntimeException("Access denied: You can only delete your own medical records");
        }
        
        medicalRecordRepository.delete(medicalRecord);
    }
    
    @Override
    @Transactional
    public List<AppointmentResponseDTO> getAvailableAppointmentsForMedicalRecord(Long patientId) {
        // Get current doctor from security context
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User currentDoctor = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        if (!currentDoctor.getRole().name().equals("ROLE_DOCTOR")) {
            throw new RuntimeException("Only doctors can access appointment information for medical records");
        }
        
        System.out.println("DEBUG: Looking for appointments for patientId=" + patientId + ", doctorId=" + currentDoctor.getId());
        
        // Get available appointments (PENDING or CONFIRMED) for the patient with this doctor that don't have medical records yet
        List<Appointment> availableAppointments = appointmentRepository.findByPatientIdAndDoctorIdAndNoMedicalRecord(
                patientId, currentDoctor.getId());
        
        System.out.println("DEBUG: Found " + availableAppointments.size() + " available appointments");
        availableAppointments.forEach(apt -> {
            System.out.println("DEBUG: Appointment ID=" + apt.getId() + ", Status=" + apt.getStatus() + ", Date=" + apt.getAppointmentDate());
        });
        
        return availableAppointments.stream()
                .map(appointment -> AppointmentResponseDTO.builder()
                        .id(appointment.getId())
                        .patientId(appointment.getPatient().getId())
                        .patientName(appointment.getPatient().getFirstName() + " " + appointment.getPatient().getLastName())
                        .patientEmail(appointment.getPatient().getEmail())
                        .patientPhone(appointment.getPatient().getPhoneNumber())
                        .patientDateOfBirth(appointment.getPatient().getDateOfBirth() != null ? appointment.getPatient().getDateOfBirth().toString() : null)
                        .patientGender(appointment.getPatient().getGender())
                        .doctorId(appointment.getDoctor().getId())
                        .doctorName(appointment.getDoctor().getFirstName() + " " + appointment.getDoctor().getLastName())
                        .doctorEmail(appointment.getDoctor().getEmail())
                        .scheduleId(appointment.getSchedule().getId())
                        .appointmentDate(appointment.getAppointmentDate())
                        .appointmentTime(appointment.getSchedule().getStartTime())
                        .reason(appointment.getReason())
                        .status(appointment.getStatus())
                        .departmentName(appointment.getDoctor().getDepartment() != null ? appointment.getDoctor().getDepartment().getName() : null)
                        .doctorSpecialization(appointment.getDoctor().getSpecialization())
                        .build())
                .collect(Collectors.toList());
    }
    
    // Method to check if medical record belongs to current user (for security annotations)
    public boolean isOwnMedicalRecord(Long medicalRecordId) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            User currentUser = userRepository.findByEmail(authentication.getName())
                    .orElseThrow(() -> new ResourceNotFoundException("User not found"));
            
            MedicalRecord medicalRecord = medicalRecordRepository.findById(medicalRecordId)
                    .orElseThrow(() -> new ResourceNotFoundException("Medical record not found with ID: " + medicalRecordId));
            
            if (currentUser.getRole().name().equals("ROLE_PATIENT")) {
                return medicalRecord.getPatient().getId().equals(currentUser.getId());
            } else if (currentUser.getRole().name().equals("ROLE_DOCTOR")) {
                return medicalRecord.getDoctor().getId().equals(currentUser.getId());
            } else if (currentUser.getRole().name().equals("ROLE_ADMIN")) {
                return true; // Admin can access all medical records
            }
            
            return false;
        } catch (Exception e) {
            return false;
        }
    }
} 