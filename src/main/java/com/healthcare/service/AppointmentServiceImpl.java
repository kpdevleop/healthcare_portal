package com.healthcare.service;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.healthcare.custom_exceptions.ResourceNotFoundException;
import com.healthcare.custom_exceptions.ScheduleAlreadyBookedException;
import com.healthcare.dto.AppointmentRequestDTO;
import com.healthcare.dto.AppointmentResponseDTO;
import com.healthcare.entity.Appointment;
import com.healthcare.entity.DoctorSchedule;
import com.healthcare.entity.User;
import com.healthcare.repository.AppointmentRepository;
import com.healthcare.repository.DoctorScheduleRepository;
import com.healthcare.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AppointmentServiceImpl implements AppointmentService {
    
    private final AppointmentRepository appointmentRepository;
    private final UserRepository userRepository;
    private final DoctorScheduleRepository doctorScheduleRepository;
    
    // Convert entity to DTO
    private AppointmentResponseDTO toDTO(Appointment appointment) {
        return AppointmentResponseDTO.builder()
                .id(appointment.getId())
                .patientId(appointment.getPatient().getId())
                .patientName(appointment.getPatient().getFirstName() + " " + appointment.getPatient().getLastName())
                .patientEmail(appointment.getPatient().getEmail())
                .doctorId(appointment.getDoctor().getId())
                .doctorName(appointment.getDoctor().getFirstName() + " " + appointment.getDoctor().getLastName())
                .doctorEmail(appointment.getDoctor().getEmail())
                .scheduleId(appointment.getSchedule().getId())
                .appointmentDate(appointment.getAppointmentDate())
                .appointmentTime(appointment.getAppointmentTime())
                .reason(appointment.getReason())
                .status(appointment.getStatus())
                .departmentName(appointment.getDoctor().getDepartment() != null ? appointment.getDoctor().getDepartment().getName() : null)
                .doctorSpecialization(appointment.getDoctor().getSpecialization())
                .build();
    }
    
    @Override
    @Transactional
    public AppointmentResponseDTO createAppointment(AppointmentRequestDTO dto) {
        // Validate patient exists
        User patient = userRepository.findById(dto.getPatientId())
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found with ID: " + dto.getPatientId()));
        
        // Validate doctor exists
        User doctor = userRepository.findById(dto.getDoctorId())
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found with ID: " + dto.getDoctorId()));
        
        // Validate schedule exists and is available
        DoctorSchedule schedule = doctorScheduleRepository.findById(dto.getScheduleId())
                .orElseThrow(() -> new ResourceNotFoundException("Schedule not found with ID: " + dto.getScheduleId()));
        
        if (!schedule.getIsAvailable()) {
            throw new ScheduleAlreadyBookedException("This schedule is already booked");
        }
        
        // Check if schedule is already booked by another appointment
        if (appointmentRepository.existsByScheduleId(dto.getScheduleId())) {
            throw new ScheduleAlreadyBookedException("This schedule is already booked by another appointment");
        }
        
        // Create appointment
        Appointment appointment = Appointment.builder()
                .patient(patient)
                .doctor(doctor)
                .schedule(schedule)
                .appointmentDate(dto.getAppointmentDate())
                .appointmentTime(dto.getAppointmentTime())
                .reason(dto.getReason())
                .status(dto.getStatus())
                .build();
        
        // Mark schedule as unavailable
        schedule.setIsAvailable(false);
        doctorScheduleRepository.save(schedule);
        
        Appointment savedAppointment = appointmentRepository.save(appointment);
        return toDTO(savedAppointment);
    }
    
    @Override
    @Transactional
    public AppointmentResponseDTO updateAppointment(Long id, AppointmentRequestDTO dto) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found with ID: " + id));
        
        // Validate patient exists
        User patient = userRepository.findById(dto.getPatientId())
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found with ID: " + dto.getPatientId()));
        
        // Validate doctor exists
        User doctor = userRepository.findById(dto.getDoctorId())
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found with ID: " + dto.getDoctorId()));
        
        // Validate schedule exists
        DoctorSchedule schedule = doctorScheduleRepository.findById(dto.getScheduleId())
                .orElseThrow(() -> new ResourceNotFoundException("Schedule not found with ID: " + dto.getScheduleId()));
        
        // Update appointment
        appointment.setPatient(patient);
        appointment.setDoctor(doctor);
        appointment.setSchedule(schedule);
        appointment.setAppointmentDate(dto.getAppointmentDate());
        appointment.setAppointmentTime(dto.getAppointmentTime());
        appointment.setReason(dto.getReason());
        appointment.setStatus(dto.getStatus());
        
        Appointment updatedAppointment = appointmentRepository.save(appointment);
        return toDTO(updatedAppointment);
    }
    
    @Override
    @Transactional
    public AppointmentResponseDTO getAppointmentById(Long id) {
        return appointmentRepository.findByIdWithDetails(id)
                .map(this::toDTO)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found with ID: " + id));
    }
    
    @Override
    @Transactional
    public List<AppointmentResponseDTO> getAllAppointments() {
        return appointmentRepository.findAllWithDetails().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    @Transactional
    public List<AppointmentResponseDTO> getAppointmentsByPatient(Long patientId) {
        userRepository.findById(patientId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found with ID: " + patientId));
        
        return appointmentRepository.findByPatientIdWithDetails(patientId).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    @Transactional
    public List<AppointmentResponseDTO> getAppointmentsByDoctor(Long doctorId) {
        userRepository.findById(doctorId)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found with ID: " + doctorId));
        
        return appointmentRepository.findByDoctorIdWithDetails(doctorId).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    @Transactional
    public List<AppointmentResponseDTO> getAppointmentsByStatus(String status) {
        return appointmentRepository.findByStatusWithDetails(status).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    @Transactional
    public List<AppointmentResponseDTO> getAppointmentsByDate(LocalDate date) {
        return appointmentRepository.findByAppointmentDateWithDetails(date).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    @Transactional
    public List<AppointmentResponseDTO> getMyAppointments() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        if (currentUser.getRole().name().equals("ROLE_PATIENT")) {
            return appointmentRepository.findByPatientIdWithDetails(currentUser.getId()).stream()
                    .map(this::toDTO)
                    .collect(Collectors.toList());
        } else if (currentUser.getRole().name().equals("ROLE_DOCTOR")) {
            return appointmentRepository.findByDoctorIdWithDetails(currentUser.getId()).stream()
                    .map(this::toDTO)
                    .collect(Collectors.toList());
        } else {
            // Admin can see all appointments
            return getAllAppointments();
        }
    }
    
    @Override
    @Transactional
    public List<AppointmentResponseDTO> getMyPatientAppointments() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        if (currentUser.getRole().name().equals("ROLE_DOCTOR")) {
            return appointmentRepository.findByDoctorIdWithDetails(currentUser.getId()).stream()
                    .map(this::toDTO)
                    .collect(Collectors.toList());
        } else {
            throw new RuntimeException("Only doctors can access patient appointments");
        }
    }
    
    @Override
    @Transactional
    public AppointmentResponseDTO updateAppointmentStatus(Long id, String status) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found with ID: " + id));
        
        appointment.setStatus(status);
        Appointment updatedAppointment = appointmentRepository.save(appointment);
        return toDTO(updatedAppointment);
    }
    
    @Override
    @Transactional
    public AppointmentResponseDTO cancelAppointment(Long id) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found with ID: " + id));
        
        appointment.setStatus("CANCELLED");
        
        // Mark schedule as available again
        DoctorSchedule schedule = appointment.getSchedule();
        schedule.setIsAvailable(true);
        doctorScheduleRepository.save(schedule);
        
        Appointment updatedAppointment = appointmentRepository.save(appointment);
        return toDTO(updatedAppointment);
    }
    
    @Override
    @Transactional
    public AppointmentResponseDTO completeAppointment(Long id) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found with ID: " + id));
        
        appointment.setStatus("COMPLETED");
        Appointment updatedAppointment = appointmentRepository.save(appointment);
        return toDTO(updatedAppointment);
    }
    
    @Override
    @Transactional
    public void deleteAppointment(Long id) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found with ID: " + id));
        
        // Mark schedule as available again
        DoctorSchedule schedule = appointment.getSchedule();
        schedule.setIsAvailable(true);
        doctorScheduleRepository.save(schedule);
        
        appointmentRepository.delete(appointment);
    }
    
    // Method to check if appointment belongs to current user (for security annotations)
    public boolean isOwnAppointment(Long appointmentId) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            User currentUser = userRepository.findByEmail(authentication.getName())
                    .orElseThrow(() -> new ResourceNotFoundException("User not found"));
            
            Appointment appointment = appointmentRepository.findById(appointmentId)
                    .orElseThrow(() -> new ResourceNotFoundException("Appointment not found with ID: " + appointmentId));
            
            if (currentUser.getRole().name().equals("ROLE_PATIENT")) {
                return appointment.getPatient().getId().equals(currentUser.getId());
            } else if (currentUser.getRole().name().equals("ROLE_DOCTOR")) {
                return appointment.getDoctor().getId().equals(currentUser.getId());
            } else if (currentUser.getRole().name().equals("ROLE_ADMIN")) {
                return true; // Admin can access all appointments
            }
            
            return false;
        } catch (Exception e) {
            return false;
        }
    }
} 