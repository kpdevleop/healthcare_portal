package com.healthcare.contoller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.healthcare.dto.FeedbackRequestDTO;
import com.healthcare.dto.FeedbackResponseDTO;
import com.healthcare.service.FeedbackService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import io.swagger.v3.oas.annotations.security.SecurityRequirement;

@RestController
@RequestMapping("/api/feedback")
@RequiredArgsConstructor
public class FeedbackController {
    
    private final FeedbackService feedbackService;
    
    // Create feedback (Patients can create their own feedback)
    @PostMapping
    @PreAuthorize("hasRole('PATIENT')")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<FeedbackResponseDTO> createFeedback(@Valid @RequestBody FeedbackRequestDTO dto) {
        FeedbackResponseDTO createdFeedback = feedbackService.createFeedback(dto);
        return new ResponseEntity<>(createdFeedback, HttpStatus.CREATED);
    }
    
    // Update feedback (Patients can update their own feedback)
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('PATIENT') and @feedbackService.isOwnFeedback(#id)")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<FeedbackResponseDTO> updateFeedback(@PathVariable Long id, @Valid @RequestBody FeedbackRequestDTO dto) {
        FeedbackResponseDTO updatedFeedback = feedbackService.updateFeedback(id, dto);
        return ResponseEntity.ok(updatedFeedback);
    }
    
    // Get feedback by ID (Admin can view all, Doctor can view their patient feedback, Patient can view their own)
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or (hasRole('DOCTOR') and @feedbackService.isOwnPatientFeedback(#id)) or (hasRole('PATIENT') and @feedbackService.isOwnFeedback(#id))")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<FeedbackResponseDTO> getFeedbackById(@PathVariable Long id) {
        FeedbackResponseDTO feedback = feedbackService.getFeedbackById(id);
        return ResponseEntity.ok(feedback);
    }
    
    // Get all feedback (Admin only)
    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN')")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<List<FeedbackResponseDTO>> getAllFeedback() {
        List<FeedbackResponseDTO> feedback = feedbackService.getAllFeedback();
        return ResponseEntity.ok(feedback);
    }
    
    // Get feedback by patient ID (Admin can view all, Doctor can view their patient feedback, Patient can view their own)
    @GetMapping("/patient/{patientId}")
    @PreAuthorize("hasRole('ADMIN') or (hasRole('DOCTOR') and @feedbackService.isOwnPatientFeedbackByPatientId(#patientId)) or (hasRole('PATIENT') and #patientId == authentication.principal.id)")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<List<FeedbackResponseDTO>> getFeedbackByPatient(@PathVariable Long patientId) {
        List<FeedbackResponseDTO> feedback = feedbackService.getFeedbackByPatient(patientId);
        return ResponseEntity.ok(feedback);
    }
    
    // Get feedback by doctor ID (Admin can view all, Doctor can view their own patient feedback)
    @GetMapping("/doctor/{doctorId}")
    @PreAuthorize("hasRole('ADMIN') or (hasRole('DOCTOR') and #doctorId == authentication.principal.id)")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<List<FeedbackResponseDTO>> getFeedbackByDoctor(@PathVariable Long doctorId) {
        List<FeedbackResponseDTO> feedback = feedbackService.getFeedbackByDoctor(doctorId);
        return ResponseEntity.ok(feedback);
    }
    
    // Get feedback by rating (Admin can view all, Doctor can view their patient feedback)
    @GetMapping("/rating")
    @PreAuthorize("hasRole('ADMIN') or hasRole('DOCTOR')")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<List<FeedbackResponseDTO>> getFeedbackByRating(@RequestParam Integer rating) {
        List<FeedbackResponseDTO> feedback = feedbackService.getFeedbackByRating(rating);
        return ResponseEntity.ok(feedback);
    }
    
    // Get feedback by patient and doctor (Admin can view all, Doctor can view their patient feedback, Patient can view their own)
    @GetMapping("/patient/{patientId}/doctor/{doctorId}")
    @PreAuthorize("hasRole('ADMIN') or (hasRole('DOCTOR') and @feedbackService.isOwnPatientFeedbackByPatientAndDoctor(#patientId, #doctorId)) or (hasRole('PATIENT') and #patientId == authentication.principal.id)")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<List<FeedbackResponseDTO>> getFeedbackByPatientAndDoctor(
            @PathVariable Long patientId, @PathVariable Long doctorId) {
        List<FeedbackResponseDTO> feedback = feedbackService.getFeedbackByPatientAndDoctor(patientId, doctorId);
        return ResponseEntity.ok(feedback);
    }
    
    // Get my feedback (for current user)
    @GetMapping("/my")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR', 'PATIENT')")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<List<FeedbackResponseDTO>> getMyFeedback() {
        List<FeedbackResponseDTO> feedback = feedbackService.getMyFeedback();
        return ResponseEntity.ok(feedback);
    }
    
    // Get my patient feedback (for doctors)
    @GetMapping("/my-patients")
    @PreAuthorize("hasRole('DOCTOR')")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<List<FeedbackResponseDTO>> getMyPatientFeedback() {
        List<FeedbackResponseDTO> feedback = feedbackService.getMyPatientFeedback();
        return ResponseEntity.ok(feedback);
    }
    
    // Get general feedback (Admin can view all, Doctor can view their patient feedback, Patient can view their own)
    @GetMapping("/general")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR', 'PATIENT')")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<List<FeedbackResponseDTO>> getGeneralFeedback() {
        List<FeedbackResponseDTO> feedback = feedbackService.getGeneralFeedback();
        return ResponseEntity.ok(feedback);
    }
    
    // Get doctor-specific feedback (Admin can view all, Doctor can view their patient feedback, Patient can view all)
    @GetMapping("/doctor-specific")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR', 'PATIENT')")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<List<FeedbackResponseDTO>> getDoctorSpecificFeedback() {
        List<FeedbackResponseDTO> feedback = feedbackService.getDoctorSpecificFeedback();
        return ResponseEntity.ok(feedback);
    }
    
    // Delete feedback (Admin only)
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<Void> deleteFeedback(@PathVariable Long id) {
        feedbackService.deleteFeedback(id);
        return ResponseEntity.noContent().build();
    }
} 