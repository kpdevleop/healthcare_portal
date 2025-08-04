package com.healthcare.service;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.healthcare.custom_exceptions.ResourceNotFoundException;
import com.healthcare.dto.MedicalRecordRequestDTO;
import com.healthcare.dto.MedicalRecordResponseDTO;
import com.healthcare.entity.MedicalRecord;
import com.healthcare.entity.User;
import com.healthcare.repository.MedicalRecordRepository;
import com.healthcare.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class MedicalRecordServiceImpl implements MedicalRecordService {
    
    private final MedicalRecordRepository medicalRecordRepository;
    private final UserRepository userRepository;
    
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
        
        // Create medical record
        MedicalRecord medicalRecord = MedicalRecord.builder()
                .patient(patient)
                .doctor(doctor)
                .recordDate(dto.getRecordDate())
                .diagnosis(dto.getDiagnosis())
                .prescription(dto.getPrescription())
                .notes(dto.getNotes())
                .attachments(dto.getAttachments()) // Can be null
                .build();
        
        MedicalRecord savedMedicalRecord = medicalRecordRepository.save(medicalRecord);
        return toDTO(savedMedicalRecord);
    }
    
    @Override
    @Transactional
    public MedicalRecordResponseDTO updateMedicalRecord(Long id, MedicalRecordRequestDTO dto) {
        MedicalRecord medicalRecord = medicalRecordRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Medical record not found with ID: " + id));
        
        // Validate patient exists
        User patient = userRepository.findById(dto.getPatientId())
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found with ID: " + dto.getPatientId()));
        
        // Validate doctor exists
        User doctor = userRepository.findById(dto.getDoctorId())
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found with ID: " + dto.getDoctorId()));
        
        // Update medical record
        medicalRecord.setPatient(patient);
        medicalRecord.setDoctor(doctor);
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
        return medicalRecordRepository.findByIdWithDetails(id)
                .map(this::toDTO)
                .orElseThrow(() -> new ResourceNotFoundException("Medical record not found with ID: " + id));
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
        
        medicalRecordRepository.delete(medicalRecord);
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