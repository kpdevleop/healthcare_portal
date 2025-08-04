package com.healthcare.service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.healthcare.custom_exceptions.ResourceNotFoundException;
import com.healthcare.dto.FeedbackRequestDTO;
import com.healthcare.dto.FeedbackResponseDTO;
import com.healthcare.entity.Feedback;
import com.healthcare.entity.User;
import com.healthcare.repository.FeedbackRepository;
import com.healthcare.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class FeedbackServiceImpl implements FeedbackService {
    
    private final FeedbackRepository feedbackRepository;
    private final UserRepository userRepository;
    
    // Convert entity to DTO
    private FeedbackResponseDTO toDTO(Feedback feedback) {
        return FeedbackResponseDTO.builder()
                .id(feedback.getId())
                .patientId(feedback.getPatient().getId())
                .patientName(feedback.getPatient().getFirstName() + " " + feedback.getPatient().getLastName())
                .patientEmail(feedback.getPatient().getEmail())
                .doctorId(feedback.getDoctor() != null ? feedback.getDoctor().getId() : null)
                .doctorName(feedback.getDoctor() != null ? 
                    feedback.getDoctor().getFirstName() + " " + feedback.getDoctor().getLastName() : null)
                .doctorEmail(feedback.getDoctor() != null ? feedback.getDoctor().getEmail() : null)
                .rating(feedback.getRating())
                .comments(feedback.getComments())
                .submittedAt(feedback.getSubmittedAt())
                .departmentName(feedback.getDoctor() != null && feedback.getDoctor().getDepartment() != null ? 
                    feedback.getDoctor().getDepartment().getName() : null)
                .doctorSpecialization(feedback.getDoctor() != null ? feedback.getDoctor().getSpecialization() : null)
                .build();
    }
    
    @Override
    @Transactional
    public FeedbackResponseDTO createFeedback(FeedbackRequestDTO dto) {
        // Validate patient exists
        User patient = userRepository.findById(dto.getPatientId())
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found with ID: " + dto.getPatientId()));
        
        // Validate doctor exists if provided
        User doctor = null;
        if (dto.getDoctorId() != null) {
            doctor = userRepository.findById(dto.getDoctorId())
                    .orElseThrow(() -> new ResourceNotFoundException("Doctor not found with ID: " + dto.getDoctorId()));
        }
        
        // Create feedback
        Feedback feedback = Feedback.builder()
                .patient(patient)
                .doctor(doctor)
                .rating(dto.getRating())
                .comments(dto.getComments())
                .build();
        
        Feedback savedFeedback = feedbackRepository.save(feedback);
        return toDTO(savedFeedback);
    }
    
    @Override
    @Transactional
    public FeedbackResponseDTO updateFeedback(Long id, FeedbackRequestDTO dto) {
        Feedback feedback = feedbackRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Feedback not found with ID: " + id));
        
        // Validate patient exists
        User patient = userRepository.findById(dto.getPatientId())
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found with ID: " + dto.getPatientId()));
        
        // Validate doctor exists if provided
        User doctor = null;
        if (dto.getDoctorId() != null) {
            doctor = userRepository.findById(dto.getDoctorId())
                    .orElseThrow(() -> new ResourceNotFoundException("Doctor not found with ID: " + dto.getDoctorId()));
        }
        
        // Update feedback
        feedback.setPatient(patient);
        feedback.setDoctor(doctor);
        feedback.setRating(dto.getRating());
        feedback.setComments(dto.getComments());
        
        Feedback updatedFeedback = feedbackRepository.save(feedback);
        return toDTO(updatedFeedback);
    }
    
    @Override
    @Transactional
    public FeedbackResponseDTO getFeedbackById(Long id) {
        return feedbackRepository.findByIdWithDetails(id)
                .map(this::toDTO)
                .orElseThrow(() -> new ResourceNotFoundException("Feedback not found with ID: " + id));
    }
    
    @Override
    @Transactional
    public List<FeedbackResponseDTO> getAllFeedback() {
        return feedbackRepository.findAllWithDetails().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    @Transactional
    public List<FeedbackResponseDTO> getFeedbackByPatient(Long patientId) {
        userRepository.findById(patientId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found with ID: " + patientId));
        
        return feedbackRepository.findByPatientIdWithDetails(patientId).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    @Transactional
    public List<FeedbackResponseDTO> getFeedbackByDoctor(Long doctorId) {
        userRepository.findById(doctorId)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found with ID: " + doctorId));
        
        return feedbackRepository.findByDoctorIdWithDetails(doctorId).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    @Transactional
    public List<FeedbackResponseDTO> getFeedbackByRating(Integer rating) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        if (currentUser.getRole().name().equals("ROLE_ADMIN")) {
            // Admin can see all feedback by rating
            return feedbackRepository.findByRatingWithDetails(rating).stream()
                    .map(this::toDTO)
                    .collect(Collectors.toList());
        } else if (currentUser.getRole().name().equals("ROLE_DOCTOR")) {
            // Doctor can see feedback by rating from their treated patients
            return feedbackRepository.findByRatingWithDetails(rating).stream()
                    .filter(feedback -> feedback.getDoctor() != null && feedback.getDoctor().getId().equals(currentUser.getId()))
                    .map(this::toDTO)
                    .collect(Collectors.toList());
        } else {
            throw new RuntimeException("Only admins and doctors can access feedback by rating");
        }
    }
    
    @Override
    @Transactional
    public List<FeedbackResponseDTO> getFeedbackByPatientAndDoctor(Long patientId, Long doctorId) {
        userRepository.findById(patientId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found with ID: " + patientId));
        
        userRepository.findById(doctorId)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found with ID: " + doctorId));
        
        return feedbackRepository.findByPatientIdAndDoctorIdWithDetails(patientId, doctorId).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    @Transactional
    public List<FeedbackResponseDTO> getMyFeedback() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        if (currentUser.getRole().name().equals("ROLE_PATIENT")) {
            return feedbackRepository.findByPatientIdWithDetails(currentUser.getId()).stream()
                    .map(this::toDTO)
                    .collect(Collectors.toList());
        } else if (currentUser.getRole().name().equals("ROLE_DOCTOR")) {
            // Doctors can see feedback from their treated patients
            return feedbackRepository.findByDoctorIdWithDetails(currentUser.getId()).stream()
                    .map(this::toDTO)
                    .collect(Collectors.toList());
        } else {
            // Admin can see all feedback
            return getAllFeedback();
        }
    }
    
    @Override
    @Transactional
    public List<FeedbackResponseDTO> getMyPatientFeedback() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        if (currentUser.getRole().name().equals("ROLE_DOCTOR")) {
            // Doctors can see feedback from their treated patients
            return feedbackRepository.findByDoctorIdWithDetails(currentUser.getId()).stream()
                    .map(this::toDTO)
                    .collect(Collectors.toList());
        } else {
            throw new RuntimeException("Only doctors can access patient feedback");
        }
    }
    
    @Override
    @Transactional
    public List<FeedbackResponseDTO> getGeneralFeedback() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        if (currentUser.getRole().name().equals("ROLE_ADMIN")) {
            // Admin can see all general feedback
            return feedbackRepository.findGeneralFeedbackWithDetails().stream()
                    .map(this::toDTO)
                    .collect(Collectors.toList());
        } else if (currentUser.getRole().name().equals("ROLE_DOCTOR")) {
            // Doctor can see general feedback from their treated patients
            return feedbackRepository.findGeneralFeedbackWithDetails().stream()
                    .filter(feedback -> {
                        // For general feedback, we need to check if the patient has been treated by this doctor
                        // This is a simplified check - in a real system, you'd check appointment history
                        return true; // Allow doctors to see general feedback for now
                    })
                    .map(this::toDTO)
                    .collect(Collectors.toList());
        } else if (currentUser.getRole().name().equals("ROLE_PATIENT")) {
            // Patient can see their own general feedback
            return feedbackRepository.findGeneralFeedbackWithDetails().stream()
                    .filter(feedback -> feedback.getPatient().getId().equals(currentUser.getId()))
                    .map(this::toDTO)
                    .collect(Collectors.toList());
        } else {
            return new ArrayList<>();
        }
    }
    
    @Override
    @Transactional
    public List<FeedbackResponseDTO> getDoctorSpecificFeedback() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        if (currentUser.getRole().name().equals("ROLE_ADMIN")) {
            // Admin can see all doctor-specific feedback
            return feedbackRepository.findDoctorFeedbackWithDetails().stream()
                    .map(this::toDTO)
                    .collect(Collectors.toList());
        } else if (currentUser.getRole().name().equals("ROLE_DOCTOR")) {
            // Doctor can see feedback about themselves from their treated patients
            return feedbackRepository.findDoctorFeedbackWithDetails().stream()
                    .filter(feedback -> feedback.getDoctor() != null && feedback.getDoctor().getId().equals(currentUser.getId()))
                    .map(this::toDTO)
                    .collect(Collectors.toList());
        } else if (currentUser.getRole().name().equals("ROLE_PATIENT")) {
            // Patient can see all doctor-specific feedback
            return feedbackRepository.findDoctorFeedbackWithDetails().stream()
                    .map(this::toDTO)
                    .collect(Collectors.toList());
        } else {
            return new ArrayList<>();
        }
    }
    
    @Override
    @Transactional
    public void deleteFeedback(Long id) {
        Feedback feedback = feedbackRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Feedback not found with ID: " + id));
        
        feedbackRepository.delete(feedback);
    }
    
    // Method to check if feedback belongs to current user (for security annotations)
    public boolean isOwnFeedback(Long feedbackId) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            User currentUser = userRepository.findByEmail(authentication.getName())
                    .orElseThrow(() -> new ResourceNotFoundException("User not found"));
            
            Feedback feedback = feedbackRepository.findById(feedbackId)
                    .orElseThrow(() -> new ResourceNotFoundException("Feedback not found with ID: " + feedbackId));
            
            if (currentUser.getRole().name().equals("ROLE_PATIENT")) {
                return feedback.getPatient().getId().equals(currentUser.getId());
            } else if (currentUser.getRole().name().equals("ROLE_ADMIN")) {
                return true; // Admin can access all feedback
            }
            
            return false;
        } catch (Exception e) {
            return false;
        }
    }
    
    // Method to check if feedback is from doctor's treated patient
    public boolean isOwnPatientFeedback(Long feedbackId) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            User currentUser = userRepository.findByEmail(authentication.getName())
                    .orElseThrow(() -> new ResourceNotFoundException("User not found"));
            
            if (!currentUser.getRole().name().equals("ROLE_DOCTOR")) {
                return false;
            }
            
            Feedback feedback = feedbackRepository.findById(feedbackId)
                    .orElseThrow(() -> new ResourceNotFoundException("Feedback not found with ID: " + feedbackId));
            
            // Check if the feedback is from a patient treated by this doctor
            return feedback.getPatient().getId().equals(currentUser.getId()) || 
                   (feedback.getDoctor() != null && feedback.getDoctor().getId().equals(currentUser.getId()));
        } catch (Exception e) {
            return false;
        }
    }
    
    // Method to check if feedback by patient ID is from doctor's treated patient
    public boolean isOwnPatientFeedbackByPatientId(Long patientId) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            User currentUser = userRepository.findByEmail(authentication.getName())
                    .orElseThrow(() -> new ResourceNotFoundException("User not found"));
            
            if (!currentUser.getRole().name().equals("ROLE_DOCTOR")) {
                return false;
            }
            
            // For now, we'll allow doctors to see feedback from any patient
            // In a real system, you might want to check if the doctor has treated this patient
            return true;
        } catch (Exception e) {
            return false;
        }
    }
    
    // Method to check if feedback by patient and doctor is from doctor's treated patient
    public boolean isOwnPatientFeedbackByPatientAndDoctor(Long patientId, Long doctorId) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            User currentUser = userRepository.findByEmail(authentication.getName())
                    .orElseThrow(() -> new ResourceNotFoundException("User not found"));
            
            if (!currentUser.getRole().name().equals("ROLE_DOCTOR")) {
                return false;
            }
            
            // Check if the doctor ID matches the current doctor
            return doctorId.equals(currentUser.getId());
        } catch (Exception e) {
            return false;
        }
    }
} 